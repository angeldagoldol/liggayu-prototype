package edu.sjpiicd.scores.student;

public record StudentResponse(
        String name,
        double prelim,
        double midterm,
        double finals,
        double average) {

    static StudentResponse from(Student student) {
        return new StudentResponse(
                student.name(),
                student.prelim(),
                student.midterm(),
                student.finals(),
                student.average());
    }
}
