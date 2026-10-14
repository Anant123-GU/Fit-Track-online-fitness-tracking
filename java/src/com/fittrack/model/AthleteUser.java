package com.fittrack.model;

import com.fittrack.exception.InvalidMetricException;

/**
 * Concrete class extending User and implementing Trackable.
 * Demonstrates: Inheritance, Polymorphism (method overriding), and Interface implementation.
 */
public class AthleteUser extends User implements Trackable {
    private double bodyWeightKg;
    private double dailyCalorieGoal;
    private int dailyStepGoal;
    private int currentSteps;
    private double currentCaloriesBurned;

    public AthleteUser(String userId, String username, String email, double bodyWeightKg) {
        super(userId, username, email, "ATHLETE");
        this.bodyWeightKg = bodyWeightKg;
        this.dailyCalorieGoal = 800.0;
        this.dailyStepGoal = 10000;
        this.currentSteps = 0;
        this.currentCaloriesBurned = 0.0;
    }

    @Override
    public double calculateTargetCalories() {
        // Dynamic formula: Basal metabolic rate adjustment based on weight
        return Math.round(this.bodyWeightKg * 24.0 * 1.35 * 0.3); // Target active burn
    }

    @Override
    public String generateBiometricSummary() {
        return String.format("[Athlete Telemetry] %s: Steps=%d/%d, Cal=%.1f/%.1f",
                username, currentSteps, dailyStepGoal, currentCaloriesBurned, dailyCalorieGoal);
    }

    @Override
    public String getId() {
        return userId;
    }

    @Override
    public String getName() {
        return username;
    }

    @Override
    public double calculateCaloricBurnRate() {
        // Average burn rate per active minute
        return 7.5 * (bodyWeightKg / 70.0);
    }

    @Override
    public boolean validateTelemetry(double metricValue) throws InvalidMetricException {
        if (metricValue < 0 || metricValue > 30000) {
            throw new InvalidMetricException("Metric value out of physiological boundaries: " + metricValue);
        }
        return true;
    }

    // Getters and Setters
    public double getBodyWeightKg() { return bodyWeightKg; }
    public void setBodyWeightKg(double bodyWeightKg) { this.bodyWeightKg = bodyWeightKg; }
    public double getDailyCalorieGoal() { return dailyCalorieGoal; }
    public void setDailyCalorieGoal(double dailyCalorieGoal) { this.dailyCalorieGoal = dailyCalorieGoal; }
    public int getDailyStepGoal() { return dailyStepGoal; }
    public void setDailyStepGoal(int dailyStepGoal) { this.dailyStepGoal = dailyStepGoal; }
    public int getCurrentSteps() { return currentSteps; }
    public void addSteps(int steps) { this.currentSteps += steps; }
    public double getCurrentCaloriesBurned() { return currentCaloriesBurned; }
    public void addCalories(double cal) { this.currentCaloriesBurned += cal; }
}
