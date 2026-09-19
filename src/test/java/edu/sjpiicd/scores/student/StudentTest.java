package edu.sjpiicd.scores.student;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;

class StudentTest {
    @Test
    void calculatesAverageFromThreeTermScores() {
        Student student = new Student("Ana Cruz", 80, 90, 100);
        assertThat(student.average()).isEqualTo(90.0);
    }

    @Test
    void roundsRepeatingAverageToTwoDecimals() {
        Student student = new Student("Ben Lee", 80, 90, 95);
        assertThat(student.average()).isEqualTo(88.33);
    }
}
