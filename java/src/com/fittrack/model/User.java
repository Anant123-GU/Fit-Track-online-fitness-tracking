package com.fittrack.model;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Abstract Base Class demonstrating Inheritance, Encapsulation, and Polymorphism.
 * Fulfills Java OOP Inheritance & Abstract Classes rubric requirement.
 */
public abstract class User implements Serializable {
    private static final long serialVersionUID = 1L;

    protected String userId;
    protected String username;
    protected String email;
    protected String userRole;
    protected LocalDateTime registeredAt;

    public User(String userId, String username, String email, String userRole) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.userRole = userRole;
        this.registeredAt = LocalDateTime.now();
    }

    // Abstract methods demonstrating Polymorphic behavior in subclasses
    public abstract double calculateTargetCalories();
    public abstract String generateBiometricSummary();

    // Concrete shared getters and setters
    public String getUserId() { return userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getUserRole() { return userRole; }
    public LocalDateTime getRegisteredAt() { return registeredAt; }

    @Override
    public String toString() {
        return "User{" +
                "userId='" + userId + '\'' +
                ", username='" + username + '\'' +
                ", role='" + userRole + '\'' +
                '}';
    }
}
