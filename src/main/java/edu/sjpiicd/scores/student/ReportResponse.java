package edu.sjpiicd.scores.student;

import java.util.List;

public record ReportResponse(
        List<StudentResponse> students,
        ScoreSummary highest,
        ScoreSummary lowest) {}
