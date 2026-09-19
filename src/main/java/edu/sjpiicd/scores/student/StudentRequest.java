package edu.sjpiicd.scores.student;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record StudentRequest(
        @NotBlank(message = "Student name is required.")
        @Size(max = 100, message = "Student name must not exceed 100 characters.")
        String name,
        @NotNull(message = "Prelim is required.")
        @DecimalMin(value = "0.0", message = "Prelim must be from 0 to 100.")
        @DecimalMax(value = "100.0", message = "Prelim must be from 0 to 100.")
        Double prelim,
        @NotNull(message = "Midterm is required.")
        @DecimalMin(value = "0.0", message = "Midterm must be from 0 to 100.")
        @DecimalMax(value = "100.0", message = "Midterm must be from 0 to 100.")
        Double midterm,
        @NotNull(message = "Finals is required.")
        @DecimalMin(value = "0.0", message = "Finals must be from 0 to 100.")
        @DecimalMax(value = "100.0", message = "Finals must be from 0 to 100.")
        Double finals) {}
