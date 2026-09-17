package edu.sjpiicd.scores.student;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class StudentScoreServiceTest {
    private StudentScoreService service;

    @BeforeEach
    void setUp() {
        service = new StudentScoreService();
    }

    @Test
    void returnsAnEmptyReportBeforeStudentsAreAdded() {
        ReportResponse report = service.getReport();

        assertThat(report.students()).isEmpty();
        assertThat(report.highest()).isNull();
        assertThat(report.lowest()).isNull();
    }

    @Test
    void reportsOneTrimmedStudentAsBothHighestAndLowest() {
        ReportResponse report = service.addStudent(
                new StudentRequest("  Ana Cruz  ", 80.0, 90.0, 95.0));

        assertThat(report.students()).containsExactly(
                new StudentResponse("Ana Cruz", 80.0, 90.0, 95.0, 88.33));
        assertThat(report.highest()).isEqualTo(
                new ScoreSummary(88.33, List.of("Ana Cruz")));
        assertThat(report.lowest()).isEqualTo(
                new ScoreSummary(88.33, List.of("Ana Cruz")));
    }

    @Test
    void preservesInsertionOrderAndReturnsLiteralRoundedAverages() {
        service.addStudent(new StudentRequest("First", 0.0, 0.0, 1.0));
        service.addStudent(new StudentRequest("Second", 100.0, 90.0, 80.0));

        assertThat(service.getStudents()).containsExactly(
                new StudentResponse("First", 0.0, 0.0, 1.0, 0.33),
                new StudentResponse("Second", 100.0, 90.0, 80.0, 90.0));
    }

    @Test
    void updatesHighestAndLowestWhenNewExtremesAreAdded() {
        ReportResponse initial = service.addStudent(
                new StudentRequest("Middle", 75.0, 75.0, 75.0));
        ReportResponse withHigh = service.addStudent(
                new StudentRequest("High", 99.0, 96.0, 93.0));
        ReportResponse withBoth = service.addStudent(
                new StudentRequest("Low", 30.0, 45.0, 60.0));

        assertThat(initial.highest()).isEqualTo(new ScoreSummary(75.0, List.of("Middle")));
        assertThat(initial.lowest()).isEqualTo(new ScoreSummary(75.0, List.of("Middle")));
        assertThat(withHigh.highest()).isEqualTo(new ScoreSummary(96.0, List.of("High")));
        assertThat(withHigh.lowest()).isEqualTo(new ScoreSummary(75.0, List.of("Middle")));
        assertThat(withBoth.highest()).isEqualTo(new ScoreSummary(96.0, List.of("High")));
        assertThat(withBoth.lowest()).isEqualTo(new ScoreSummary(45.0, List.of("Low")));
    }

    @Test
    void keepsDuplicateNamesAsSeparateRecordsAndTieEntries() {
        service.addStudent(new StudentRequest("Alex", 72.0, 81.0, 90.0));
        ReportResponse report = service.addStudent(
                new StudentRequest("Alex", 90.0, 72.0, 81.0));

        assertThat(report.students()).hasSize(2);
        assertThat(report.students()).extracting(StudentResponse::name)
                .containsExactly("Alex", "Alex");
        assertThat(report.highest()).isEqualTo(
                new ScoreSummary(81.0, List.of("Alex", "Alex")));
        assertThat(report.lowest()).isEqualTo(
                new ScoreSummary(81.0, List.of("Alex", "Alex")));
    }

    @Test
    void returnsAllTiedNamesInInsertionOrderForBothExtremes() {
        service.addStudent(new StudentRequest("Ana", 90.0, 90.0, 90.0));
        service.addStudent(new StudentRequest("Ben", 90.004, 90.004, 90.004));
        ReportResponse report = service.addStudent(
                new StudentRequest("Cara", 89.999, 89.999, 89.999));

        assertThat(report.highest()).isEqualTo(
                new ScoreSummary(90.0, List.of("Ana", "Ben", "Cara")));
        assertThat(report.lowest()).isEqualTo(
                new ScoreSummary(90.0, List.of("Ana", "Ben", "Cara")));
    }

    @Test
    void calculatesDistinctExtremesAndReturnsEveryTie() {
        service.addStudent(new StudentRequest("Ana", 80.0, 90.0, 100.0));
        service.addStudent(new StudentRequest("Ben", 70.0, 80.0, 90.0));
        ReportResponse report =
                service.addStudent(new StudentRequest("Cara", 100.0, 80.0, 90.0));

        assertThat(report.students()).extracting(StudentResponse::name)
                .containsExactly("Ana", "Ben", "Cara");
        assertThat(report.highest().average()).isEqualTo(90.0);
        assertThat(report.highest().names()).containsExactly("Ana", "Cara");
        assertThat(report.lowest().average()).isEqualTo(80.0);
        assertThat(report.lowest().names()).containsExactly("Ben");
    }

    @Test
    void returnsImmutableListSnapshots() {
        service.addStudent(new StudentRequest("Ana", 80.0, 90.0, 100.0));
        ReportResponse snapshot = service.getReport();

        assertThatThrownBy(() -> snapshot.students().add(
                new StudentResponse("Injected", 0.0, 0.0, 0.0, 0.0)))
                .isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> snapshot.highest().names().add("Injected"))
                .isInstanceOf(UnsupportedOperationException.class);

        service.addStudent(new StudentRequest("Ben", 70.0, 80.0, 90.0));
        assertThat(snapshot.students()).extracting(StudentResponse::name)
                .containsExactly("Ana");
        assertThat(snapshot.highest().names()).containsExactly("Ana");
    }
}
