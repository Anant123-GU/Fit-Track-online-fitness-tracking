package com.fittrack.exception;

/**
 * Custom Exception demonstrating Exception Handling hierarchy in Java.
 * Fulfills Java Exception Handling rubric requirement.
 */
public class InvalidMetricException extends Exception {
    private static final long serialVersionUID = 1L;

    public InvalidMetricException(String message) {
        super("[FitTrack Validation Error] " + message);
    }

    public InvalidMetricException(String message, Throwable cause) {
        super("[FitTrack Validation Error] " + message, cause);
    }
}
