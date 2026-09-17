package edu.sjpiicd.scores.error;

import com.fasterxml.jackson.databind.JsonMappingException.Reference;
import com.fasterxml.jackson.databind.exc.MismatchedInputException;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class RestExceptionHandler {
    private static final String VALIDATION_MESSAGE =
            "Please correct the highlighted fields.";
    private static final String MALFORMED_MESSAGE =
            "Request body must contain valid names, numbers, and JSON.";

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException exception) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors().stream()
                .sorted(Comparator.comparing(FieldError::getField))
                .forEach(error -> fieldErrors.putIfAbsent(
                        error.getField(), error.getDefaultMessage()));

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiError(VALIDATION_MESSAGE, fieldErrors));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleUnreadableMessage(
            HttpMessageNotReadableException exception) {
        MismatchedInputException mismatch = findMismatch(exception);
        if (mismatch != null && !mismatch.getPath().isEmpty()) {
            Reference lastPathElement = mismatch.getPath().get(mismatch.getPath().size() - 1);
            String field = lastPathElement.getFieldName();
            String message = numberMessage(field);
            if (message != null) {
                Map<String, String> fieldErrors = new LinkedHashMap<>();
                fieldErrors.put(field, message);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiError(VALIDATION_MESSAGE, fieldErrors));
            }
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiError(MALFORMED_MESSAGE, Map.of()));
    }

    private static MismatchedInputException findMismatch(Throwable throwable) {
        Throwable current = throwable;
        while (current != null) {
            if (current instanceof MismatchedInputException mismatch) {
                return mismatch;
            }
            current = current.getCause();
        }
        return null;
    }

    private static String numberMessage(String field) {
        return switch (field) {
            case "assessment1" -> "Assessment 1 must be a number.";
            case "assessment2" -> "Assessment 2 must be a number.";
            case "assessment3" -> "Assessment 3 must be a number.";
            default -> null;
        };
    }
}
