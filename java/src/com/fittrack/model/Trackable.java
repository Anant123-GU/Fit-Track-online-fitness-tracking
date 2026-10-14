package com.fittrack.model;

/**
 * Interface defining contractual biometric tracking behavior.
 * Fulfills Java OOP Interface rubric requirement.
 */
public interface Trackable {
    String getId();
    String getName();
    double calculateCaloricBurnRate();
    boolean validateTelemetry(double metricValue) throws com.fittrack.exception.InvalidMetricException;
}
