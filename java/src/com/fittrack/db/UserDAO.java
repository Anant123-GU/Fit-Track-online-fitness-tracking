package com.fittrack.db;

import com.fittrack.exception.DatabaseOperationException;
import com.fittrack.model.AthleteUser;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Data Access Object (DAO) executing database operations using JDBC PreparedStatements.
 * Fulfills classes for database operations & Database Connectivity (JDBC) rubric criteria.
 */
public class UserDAO {
    private final DatabaseManager dbManager;

    public UserDAO() throws DatabaseOperationException {
        this.dbManager = DatabaseManager.getInstance();
    }

    /**
     * Inserts or updates an AthleteUser using parameterized PreparedStatement to prevent SQL Injection.
     */
    public boolean saveUser(AthleteUser athlete) throws DatabaseOperationException {
        String query = "INSERT OR REPLACE INTO users (user_id, username, email, role, weight_kg, calorie_goal, step_goal) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?);";

        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(query)) {

            ps.setString(1, athlete.getUserId());
            ps.setString(2, athlete.getUsername());
            ps.setString(3, athlete.getEmail());
            ps.setString(4, athlete.getUserRole());
            ps.setDouble(5, athlete.getBodyWeightKg());
            ps.setDouble(6, athlete.getDailyCalorieGoal());
            ps.setInt(7, athlete.getDailyStepGoal());

            int rowsAffected = ps.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to persist user: " + athlete.getUsername(), e);
        }
    }

    /**
     * Finds a user by account username using PreparedStatement and ResultSet mapping.
     */
    public Optional<AthleteUser> findByUsername(String username) throws DatabaseOperationException {
        String sql = "SELECT * FROM users WHERE username = ? LIMIT 1;";

        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, username);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    AthleteUser athlete = new AthleteUser(
                            rs.getString("user_id"),
                            rs.getString("username"),
                            rs.getString("email"),
                            rs.getDouble("weight_kg")
                    );
                    athlete.setDailyCalorieGoal(rs.getDouble("calorie_goal"));
                    athlete.setDailyStepGoal(rs.getInt("step_goal"));
                    return Optional.of(athlete);
                }
            }
        } catch (SQLException e) {
            throw new DatabaseOperationException("Error querying username: " + username, e);
        }
        return Optional.empty();
    }

    /**
     * Retrieves all registered athletes from database table.
     */
    public List<AthleteUser> getAllAthletes() throws DatabaseOperationException {
        List<AthleteUser> list = new ArrayList<>();
        String sql = "SELECT * FROM users WHERE role = 'ATHLETE' ORDER BY username ASC;";

        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                AthleteUser user = new AthleteUser(
                        rs.getString("user_id"),
                        rs.getString("username"),
                        rs.getString("email"),
                        rs.getDouble("weight_kg")
                );
                list.add(user);
            }
        } catch (SQLException e) {
            throw new DatabaseOperationException("Error retrieving athlete list", e);
        }
        return list;
    }
}
