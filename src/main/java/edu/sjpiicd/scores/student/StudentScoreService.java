package edu.sjpiicd.scores.student;

import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class StudentScoreService {
    private final List<Student> students = new ArrayList<>();

    public synchronized ReportResponse addStudent(StudentRequest request) {
        Student student = new Student(
                request.name().trim(),
                request.assessment1(),
                request.assessment2(),
                request.assessment3());
        students.add(student);
        return buildReport();
    }

    public synchronized List<StudentResponse> getStudents() {
        return buildReport().students();
    }

    public synchronized ReportResponse getReport() {
        return buildReport();
    }

    private ReportResponse buildReport() {
        if (students.isEmpty()) {
            return new ReportResponse(List.of(), null, null);
        }

        List<StudentResponse> rows = new ArrayList<>();
        for (Student student : students) {
            rows.add(StudentResponse.from(student));
        }

        double highestAverage = rows.get(0).average();
        double lowestAverage = rows.get(0).average();
        List<String> highestNames = new ArrayList<>();
        List<String> lowestNames = new ArrayList<>();

        for (StudentResponse row : rows) {
            int highComparison = Double.compare(row.average(), highestAverage);
            if (highComparison > 0) {
                highestAverage = row.average();
                highestNames.clear();
                highestNames.add(row.name());
            } else if (highComparison == 0) {
                highestNames.add(row.name());
            }

            int lowComparison = Double.compare(row.average(), lowestAverage);
            if (lowComparison < 0) {
                lowestAverage = row.average();
                lowestNames.clear();
                lowestNames.add(row.name());
            } else if (lowComparison == 0) {
                lowestNames.add(row.name());
            }
        }

        return new ReportResponse(
                List.copyOf(rows),
                new ScoreSummary(highestAverage, List.copyOf(highestNames)),
                new ScoreSummary(lowestAverage, List.copyOf(lowestNames)));
    }
}
