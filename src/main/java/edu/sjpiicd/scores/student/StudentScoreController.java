package edu.sjpiicd.scores.student;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class StudentScoreController {
    private final StudentScoreService service;

    public StudentScoreController(StudentScoreService service) {
        this.service = service;
    }

    @GetMapping("/students")
    public List<StudentResponse> getStudents() {
        return service.getStudents();
    }

    @GetMapping("/report")
    public ReportResponse getReport() {
        return service.getReport();
    }

    @PostMapping("/students")
    public ResponseEntity<ReportResponse> addStudent(
            @Valid @RequestBody StudentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.addStudent(request));
    }
}
