package edu.sjpiicd.scores.student;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.stream.Stream;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class StudentScoreControllerTest {
    private static final String VALID_REQUEST = """
            {"name":"Ana Cruz","prelim":80,"midterm":90,"finals":95}
            """;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getsAnEmptyStudentList() throws Exception {
        mockMvc.perform(get("/api/students"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(content().json("[]", true));
    }

    @Test
    void getsStudentsInInsertionOrderWithExactRowProperties() throws Exception {
        addStudent(VALID_REQUEST).andExpect(status().isCreated());
        addStudent("""
                {"name":"Ben Lee","prelim":70,"midterm":80,"finals":90}
                """).andExpect(status().isCreated());

        mockMvc.perform(get("/api/students"))
                .andExpect(status().isOk())
                .andExpect(content().json("""
                        [
                          {"name":"Ana Cruz","prelim":80.0,"midterm":90.0,
                           "finals":95.0,"average":88.33},
                          {"name":"Ben Lee","prelim":70.0,"midterm":80.0,
                           "finals":90.0,"average":80.0}
                        ]
                        """, true));
    }

    @Test
    void getsAnEmptyReport() throws Exception {
        mockMvc.perform(get("/api/report"))
                .andExpect(status().isOk())
                .andExpect(content().json("""
                        {"students":[],"highest":null,"lowest":null}
                        """, true));
    }

    @Test
    void getsAPopulatedReportWithEveryTiedName() throws Exception {
        addStudent("""
                {"name":"Ana","prelim":80,"midterm":90,"finals":100}
                """).andExpect(status().isCreated());
        addStudent("""
                {"name":"Ben","prelim":70,"midterm":80,"finals":90}
                """).andExpect(status().isCreated());
        addStudent("""
                {"name":"Cara","prelim":100,"midterm":80,"finals":90}
                """).andExpect(status().isCreated());

        mockMvc.perform(get("/api/report"))
                .andExpect(status().isOk())
                .andExpect(content().json("""
                        {
                          "students":[
                            {"name":"Ana","prelim":80.0,"midterm":90.0,
                             "finals":100.0,"average":90.0},
                            {"name":"Ben","prelim":70.0,"midterm":80.0,
                             "finals":90.0,"average":80.0},
                            {"name":"Cara","prelim":100.0,"midterm":80.0,
                             "finals":90.0,"average":90.0}
                          ],
                          "highest":{"average":90.0,"names":["Ana","Cara"]},
                          "lowest":{"average":80.0,"names":["Ben"]}
                        }
                        """, true));
    }

    @Test
    void createsAStudentAndReturnsTheExactUpdatedReport() throws Exception {
        addStudent(VALID_REQUEST)
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(content().json("""
                        {
                          "students":[
                            {"name":"Ana Cruz","prelim":80.0,"midterm":90.0,
                             "finals":95.0,"average":88.33}
                          ],
                          "highest":{"average":88.33,"names":["Ana Cruz"]},
                          "lowest":{"average":88.33,"names":["Ana Cruz"]}
                        }
                        """, true));
    }

    @ParameterizedTest(name = "rejects invalid name: {0}")
    @MethodSource("invalidNames")
    void rejectsInvalidNamesWithoutAddingAStudent(
            String description, String requestBody, String expectedMessage) throws Exception {
        assertRejectedField(requestBody, "name", expectedMessage);
    }

    static Stream<Arguments> invalidNames() {
        return Stream.of(
                Arguments.of("blank", """
                        {"name":"   ","prelim":80,"midterm":90,"finals":100}
                        """, "Student name is required."),
                Arguments.of("too long", """
                        {"name":"%s","prelim":80,"midterm":90,"finals":100}
                        """.formatted("A".repeat(101)),
                        "Student name must not exceed 100 characters."),
                Arguments.of("missing", """
                        {"prelim":80,"midterm":90,"finals":100}
                        """, "Student name is required."));
    }

    @ParameterizedTest(name = "rejects missing {0}")
    @MethodSource("missingScores")
    void rejectsEachMissingScoreWithoutAddingAStudent(
            String field, String requestBody, String expectedMessage) throws Exception {
        assertRejectedField(requestBody, field, expectedMessage);
    }

    static Stream<Arguments> missingScores() {
        return Stream.of(
                Arguments.of("prelim", """
                        {"name":"Ana","midterm":90,"finals":100}
                        """, "Prelim is required."),
                Arguments.of("midterm", """
                        {"name":"Ana","prelim":80,"finals":100}
                        """, "Midterm is required."),
                Arguments.of("finals", """
                        {"name":"Ana","prelim":80,"midterm":90}
                        """, "Finals is required."));
    }

    @ParameterizedTest(name = "rejects out-of-range {0}: {1}")
    @MethodSource("outOfRangeScores")
    void rejectsEveryOutOfRangeScoreWithoutAddingAStudent(
            String field, double invalidValue, String requestBody, String expectedMessage)
            throws Exception {
        assertRejectedField(requestBody, field, expectedMessage);
    }

    static Stream<Arguments> outOfRangeScores() {
        return Stream.of(
                Arguments.of("prelim", -0.01, """
                        {"name":"Ana","prelim":-0.01,"midterm":90,"finals":80}
                        """, "Prelim must be from 0 to 100."),
                Arguments.of("prelim", 101, """
                        {"name":"Ana","prelim":101,"midterm":90,"finals":80}
                        """, "Prelim must be from 0 to 100."),
                Arguments.of("midterm", -0.01, """
                        {"name":"Ana","prelim":80,"midterm":-0.01,"finals":90}
                        """, "Midterm must be from 0 to 100."),
                Arguments.of("midterm", 101, """
                        {"name":"Ana","prelim":80,"midterm":101,"finals":90}
                        """, "Midterm must be from 0 to 100."),
                Arguments.of("finals", -0.01, """
                        {"name":"Ana","prelim":80,"midterm":90,"finals":-0.01}
                        """, "Finals must be from 0 to 100."),
                Arguments.of("finals", 101, """
                        {"name":"Ana","prelim":80,"midterm":90,"finals":101}
                        """, "Finals must be from 0 to 100."));
    }

    @ParameterizedTest(name = "rejects nonnumeric {0}")
    @MethodSource("nonnumericScores")
    void rejectsEachNonnumericScoreWithoutAddingAStudent(
            String field, String requestBody, String expectedMessage) throws Exception {
        assertRejectedField(requestBody, field, expectedMessage);
    }

    static Stream<Arguments> nonnumericScores() {
        return Stream.of(
                Arguments.of("prelim", """
                        {"name":"Ana","prelim":"abc","midterm":90,"finals":80}
                        """, "Prelim must be a number."),
                Arguments.of("midterm", """
                        {"name":"Ana","prelim":80,"midterm":"abc","finals":90}
                        """, "Midterm must be a number."),
                Arguments.of("finals", """
                        {"name":"Ana","prelim":80,"midterm":90,"finals":"abc"}
                        """, "Finals must be a number."));
    }

    @Test
    void returnsDeterministicValidationFieldOrder() throws Exception {
        addStudent("{}")
                .andExpect(status().isBadRequest())
                .andExpect(content().string("""
                        {"message":"Please correct the highlighted fields.","fieldErrors":{"finals":"Finals is required.","midterm":"Midterm is required.","name":"Student name is required.","prelim":"Prelim is required."}}"""));

        assertStudentListIsEmpty();
    }

    @Test
    void rejectsOtherMalformedJsonWithAGeneralErrorWithoutAddingAStudent() throws Exception {
        addStudent("""
                {"name":"Ana","prelim":80,
                """)
                .andExpect(status().isBadRequest())
                .andExpect(content().json("""
                        {
                          "message":"Request body must contain valid names, numbers, and JSON.",
                          "fieldErrors":{}
                        }
                        """, true));

        assertStudentListIsEmpty();
    }

    private ResultActions addStudent(String requestBody) throws Exception {
        return mockMvc.perform(post("/api/students")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody));
    }

    private void assertRejectedField(String requestBody, String field, String message)
            throws Exception {
        addStudent(requestBody)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("Please correct the highlighted fields."))
                .andExpect(jsonPath("$.fieldErrors.length()").value(1))
                .andExpect(jsonPath("$.fieldErrors." + field).value(message));

        assertStudentListIsEmpty();
    }

    private void assertStudentListIsEmpty() throws Exception {
        mockMvc.perform(get("/api/students"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]", true));
    }
}
