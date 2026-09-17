package edu.sjpiicd.scores.student;

public record Student(
        String name,
        double assessment1,
        double assessment2,
        double assessment3) {

    public double average() {
        double rawAverage = (assessment1 + assessment2 + assessment3) / 3.0;
        return Math.round(rawAverage * 100.0) / 100.0;
    }
}
