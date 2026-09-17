package edu.sjpiicd.scores.student;

public record StudentResponse(
        String name,
        double assessment1,
        double assessment2,
        double assessment3,
        double average) {

    static StudentResponse from(Student student) {
        return new StudentResponse(
                student.name(),
                student.assessment1(),
                student.assessment2(),
                student.assessment3(),
                student.average());
    }
}
