package com.fittrack.model;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Workout entity representing scheduled physical training routines.
 */
public class Workout implements Serializable, Comparable<Workout> {
    private static final long serialVersionUID = 1L;

    private String workoutId;
    private String title;
    private String category;
    private int durationMinutes;
    private String intensity;
    private double estimatedCalories;
    private LocalDateTime scheduledTime;
    private boolean completed;

    public Workout(String workoutId, String title, String category, int durationMinutes, String intensity, double estimatedCalories) {
        this.workoutId = workoutId;
        this.title = title;
        this.category = category;
        this.durationMinutes = durationMinutes;
        this.intensity = intensity;
        this.estimatedCalories = estimatedCalories;
        this.scheduledTime = LocalDateTime.now();
        this.completed = false;
    }

    public String getWorkoutId() { return workoutId; }
    public String getTitle() { return title; }
    public String getCategory() { return category; }
    public int getDurationMinutes() { return durationMinutes; }
    public String getIntensity() { return intensity; }
    public double getEstimatedCalories() { return estimatedCalories; }
    public LocalDateTime getScheduledTime() { return scheduledTime; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    @Override
    public int compareTo(Workout o) {
        return this.scheduledTime.compareTo(o.scheduledTime);
    }
}
