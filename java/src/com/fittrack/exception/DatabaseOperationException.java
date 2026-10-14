package com.fittrack.exception;

/**
 * Custom Exception for JDBC and Database Persistence failures.
 */
public class DatabaseOperationException extends Exception {
    private static final long serialVersionUID = 1L;

    public DatabaseOperationException(String message) {
        super("[FitTrack JDBC Error] " + message);
    }

    public DatabaseOperationException(String message, Throwable cause) {
        super("[FitTrack JDBC Error] " + message, cause);
    }
}
