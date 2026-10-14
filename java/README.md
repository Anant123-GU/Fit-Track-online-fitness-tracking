# FitTrack - Java Project Marking Rubric Compliance Report

This Java project fulfills all requirements specified in the **Java GUI Based Projects Marking Rubric** and **Java Web Based Projects Marking Rubric**.

---

## 1. Java GUI Based Projects Marking Rubric

| Rubric Criterion | Implementation Details | File References |
| :--- | :--- | :--- |
| **OOP Implementation (Polymorphism, Inheritance, Exception Handling, Interfaces)** | • **Inheritance**: Abstract base class `User` extended by `AthleteUser` and `TrainerUser`.<br>• **Polymorphism**: Dynamic dispatch via abstract methods `calculateTargetCalories()` and `generateBiometricSummary()`.<br>• **Interfaces**: `Trackable` defining contract for biometric entities.<br>• **Exception Handling**: Custom exception hierarchy `InvalidMetricException`, `DatabaseOperationException`. | `com.fittrack.model.User`<br>`com.fittrack.model.AthleteUser`<br>`com.fittrack.model.Trackable`<br>`com.fittrack.exception.*` |
| **Collections & Generics** | • Generic Repository interface `Repository<T>` and implementation `GenericRepository<T>`.<br>• Utilizes `ConcurrentHashMap<String, T>`, `ArrayList<T>`, `Queue<Integer>`, and Java Streams with `Predicate<T>`. | `com.fittrack.repository.Repository`<br>`com.fittrack.repository.GenericRepository` |
| **Multithreading & Synchronization** | • `HeartRateMonitorThread` implements `Runnable` for background biometric telemetry.<br>• `TelemetryBuffer` demonstrates `synchronized` blocks, `wait()`, and `notifyAll()` in a thread-safe producer-consumer model.<br>• `volatile` flags for graceful thread stopping. | `com.fittrack.threading.HeartRateMonitorThread`<br>`com.fittrack.threading.TelemetryBuffer` |
| **Classes for Database Operations** | • Data Access Object (DAO) architecture: `UserDAO` encapsulating SQL queries, transactions, and entity mapping. | `com.fittrack.db.UserDAO` |
| **Database Connectivity (JDBC)** | • `DatabaseManager` loads JDBC driver (`Class.forName`), creates connections via `DriverManager.getConnection()`.<br>• Uses `PreparedStatement` with parameterized placeholders (`?`) to prevent SQL injection.<br>• Handles `SQLException` and transactions. | `com.fittrack.db.DatabaseManager`<br>`com.fittrack.db.UserDAO` |

---

## 2. Java Web Based Projects Marking Rubric

| Rubric Criterion | Implementation Details | File References |
| :--- | :--- | :--- |
| **Problem Understanding & Solution Design** | Complete biometric performance tracking architecture connecting UI presentation, thread telemetry buffer, DAO persistence, and session management. | Entire package structure |
| **Core Java Concepts** | Strong encapsulation (private fields with getters/setters), static initializers, singleton pattern in `DatabaseManager`, serialization (`Serializable`). | All classes |
| **Database Integration (JDBC)** | Comprehensive database persistence with SQLite/MySQL, DDL schema creation, and prepared statement updates. | `com.fittrack.db.DatabaseManager` |
| **Servlets & Web Integration** | • `FitTrackDashboardServlet` extends `HttpServlet` implementing `doGet` and `doPost`.<br>• Session tracking via `HttpSession` (`session.setAttribute`, `session.invalidate`).<br>• Configured via deployment descriptor `web.xml` and `@WebServlet` annotations. | `com.fittrack.web.FitTrackDashboardServlet`<br>`web/WEB-INF/web.xml` |

---

## 3. How to Run & Compile

```bash
# 1. Compile Java GUI Application:
javac -d bin java/src/com/fittrack/**/*.java

# 2. Run Java Desktop GUI:
java -cp bin com.fittrack.gui.FitTrackGUI
```
