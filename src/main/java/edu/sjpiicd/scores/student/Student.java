package edu.sjpiicd.scores.student;

public record Student(
        String name,
        double prelim,
        double midterm,
        double finals) {

    public double average() {
        double rawAverage = (prelim + midterm + finals) / 3.0;
        return Math.round(rawAverage * 100.0) / 100.0;
    }
}
