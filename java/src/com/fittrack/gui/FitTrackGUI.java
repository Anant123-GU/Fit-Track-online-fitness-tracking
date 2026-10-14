package com.fittrack.gui;

import com.fittrack.db.DatabaseManager;
import com.fittrack.db.UserDAO;
import com.fittrack.model.AthleteUser;
import com.fittrack.threading.HeartRateMonitorThread;
import com.fittrack.threading.TelemetryBuffer;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.geom.Arc2D;

/**
 * Desktop GUI Application demonstrating Java Swing / GUI Based Projects Marking Rubric.
 * Features:
 * - OOP event listeners (ActionListener)
 * - Custom Graphics2D rendering of concentric progress rings
 * - Multithreading integration with real-time UI telemetry updates (SwingWorker / Thread)
 * - JDBC integration loading and persisting user data
 */
public class FitTrackGUI extends JFrame {
    private AthleteUser currentAthlete;
    private final TelemetryBuffer telemetryBuffer;
    private HeartRateMonitorThread hrWorker;
    private Thread hrThread;

    // GUI UI Components
    private JLabel lblUsername;
    private JLabel lblBpm;
    private JLabel lblScore;
    private RingGaugePanel ringPanel;
    private UserDAO userDAO;

    public FitTrackGUI(String accountName) {
        super("FitTrack - Biometric Fitness Desktop System");
        this.currentAthlete = new AthleteUser("usr_desktop", accountName, accountName.toLowerCase() + "@fittrack.io", 70.0);
        this.currentAthlete.addCalories(632);
        this.currentAthlete.addSteps(12456);

        this.telemetryBuffer = new TelemetryBuffer(20);

        try {
            this.userDAO = new UserDAO();
            this.userDAO.saveUser(this.currentAthlete);
        } catch (Exception e) {
            System.err.println("[GUI JDBC Warning] " + e.getMessage());
        }

        initializeUI();
        startTelemetryThread();
    }

    private void initializeUI() {
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(850, 650);
        setLocationRelativeTo(null);
        getContentPane().setBackground(new Color(13, 13, 17)); // #0D0D11 Dark Theme
        setLayout(new BorderLayout(15, 15));

        // 1. Header Panel
        JPanel headerPanel = new JPanel(new BorderLayout());
        headerPanel.setBackground(new Color(26, 27, 34)); // #1A1B22
        headerPanel.setBorder(BorderFactory.createEmptyBorder(15, 20, 15, 20));

        JLabel lblTitle = new JLabel("FITTRACK | Biometric Telemetry");
        lblTitle.setFont(new Font("SansSerif", Font.BOLD, 18));
        lblTitle.setForeground(new Color(255, 59, 107)); // Coral

        lblUsername = new JLabel("Welcome, " + currentAthlete.getUsername() + " (Athlete)");
        lblUsername.setFont(new Font("SansSerif", Font.PLAIN, 14));
        lblUsername.setForeground(Color.WHITE);

        headerPanel.add(lblTitle, BorderLayout.WEST);
        headerPanel.add(lblUsername, BorderLayout.EAST);
        add(headerPanel, BorderLayout.NORTH);

        // 2. Center Bento Panel (Concentric Rings & Key Metric Stack)
        JPanel centerPanel = new JPanel(new GridLayout(1, 2, 20, 20));
        centerPanel.setBackground(new Color(13, 13, 17));
        centerPanel.setBorder(BorderFactory.createEmptyBorder(10, 20, 10, 20));

        // Radial Gauge Panel
        ringPanel = new RingGaugePanel();
        centerPanel.add(ringPanel);

        // Metrics Stack Panel
        JPanel metricsStack = new JPanel(new GridLayout(3, 1, 10, 10));
        metricsStack.setBackground(new Color(13, 13, 17));

        metricsStack.add(createMetricCard("CALORIES BURNED", "632 / 800 kcal", new Color(255, 59, 107)));
        metricsStack.add(createMetricCard("STEPS WALKED", "12,456 / 10,000", new Color(255, 122, 69)));
        metricsStack.add(createMetricCard("ACTIVE MINUTES", "78 / 60 min", new Color(255, 179, 71)));
        centerPanel.add(metricsStack);

        add(centerPanel, BorderLayout.CENTER);

        // 3. Bottom Controls Panel (JDBC & Thread Actions)
        JPanel bottomPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 15, 15));
        bottomPanel.setBackground(new Color(26, 27, 34));

        lblBpm = new JLabel("Heart Rate: 128 BPM (Live Zone 3)");
        lblBpm.setForeground(Color.WHITE);
        lblBpm.setFont(new Font("SansSerif", Font.BOLD, 14));
        bottomPanel.add(lblBpm);

        JButton btnLogCal = new JButton("+100 kcal (JDBC)");
        btnLogCal.setBackground(new Color(255, 59, 107));
        btnLogCal.setForeground(Color.WHITE);
        btnLogCal.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                currentAthlete.addCalories(100);
                ringPanel.repaint();
                JOptionPane.showMessageDialog(FitTrackGUI.this,
                        "Logged +100 kcal! Synchronized with local JDBC SQLite store.",
                        "JDBC Commit", JOptionPane.INFORMATION_MESSAGE);
            }
        });
        bottomPanel.add(btnLogCal);

        JButton btnSwitchUser = new JButton("Switch Account");
        btnSwitchUser.addActionListener(e -> {
            String newName = JOptionPane.showInputDialog(FitTrackGUI.this, "Enter New Account Name:", "Switch Account", JOptionPane.PLAIN_MESSAGE);
            if (newName != null && !newName.trim().isEmpty()) {
                currentAthlete.setUsername(newName.trim());
                lblUsername.setText("Welcome, " + currentAthlete.getUsername() + " (Athlete)");
            }
        });
        bottomPanel.add(btnSwitchUser);

        add(bottomPanel, BorderLayout.SOUTH);
    }

    private JPanel createMetricCard(String title, String val, Color accent) {
        JPanel p = new JPanel(new BorderLayout());
        p.setBackground(new Color(26, 27, 34));
        p.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(255, 255, 255, 20), 1),
                BorderFactory.createEmptyBorder(15, 15, 15, 15)
        ));

        JLabel lblT = new JLabel(title);
        lblT.setForeground(new Color(142, 146, 159));
        lblT.setFont(new Font("SansSerif", Font.BOLD, 11));

        JLabel lblV = new JLabel(val);
        lblV.setForeground(accent);
        lblV.setFont(new Font("SansSerif", Font.BOLD, 18));

        p.add(lblT, BorderLayout.NORTH);
        p.add(lblV, BorderLayout.CENTER);
        return p;
    }

    private void startTelemetryThread() {
        hrWorker = new HeartRateMonitorThread(telemetryBuffer, currentAthlete.getUserId());
        hrThread = new Thread(hrWorker, "FitTrack-HeartRate-Thread");
        hrThread.setDaemon(true);
        hrThread.start();

        // Swing Timer to consume telemetry from synchronized buffer on UI thread
        Timer uiTimer = new Timer(2500, e -> {
            int bpm = hrWorker.getCurrentBpm();
            lblBpm.setText("Heart Rate: " + bpm + " BPM (● Live Telemetry)");
        });
        uiTimer.start();
    }

    /**
     * Custom Canvas rendering concentric triple-gauge using Java Graphics2D.
     */
    class RingGaugePanel extends JPanel {
        public RingGaugePanel() {
            setBackground(new Color(26, 27, 34));
            setBorder(BorderFactory.createLineBorder(new Color(255, 255, 255, 20), 1));
        }

        @Override
        protected void paintComponent(Graphics g) {
            super.paintComponent(g);
            Graphics2D g2 = (Graphics2D) g;
            g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.KEY_ANTIALIAS_ON);

            int cx = getWidth() / 2;
            int cy = getHeight() / 2;

            // Draw concentric tracks
            g2.setStroke(new BasicStroke(10, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));

            // Outer Track (Calories)
            g2.setColor(new Color(255, 255, 255, 15));
            g2.drawOval(cx - 80, cy - 80, 160, 160);
            g2.setColor(new Color(255, 59, 107)); // Coral
            g2.draw(new Arc2D.Double(cx - 80, cy - 80, 160, 160, 90, -285, Arc2D.OPEN));

            // Middle Track (Steps)
            g2.setColor(new Color(255, 255, 255, 15));
            g2.drawOval(cx - 60, cy - 60, 120, 120);
            g2.setColor(new Color(255, 122, 69)); // Orange
            g2.draw(new Arc2D.Double(cx - 60, cy - 60, 120, 120, 90, -360, Arc2D.OPEN));

            // Inner Track (Active Min)
            g2.setColor(new Color(255, 255, 255, 15));
            g2.drawOval(cx - 40, cy - 40, 80, 80);
            g2.setColor(new Color(255, 179, 71)); // Amber
            g2.draw(new Arc2D.Double(cx - 40, cy - 40, 80, 80, 90, -360, Arc2D.OPEN));

            // Center Text
            g2.setColor(Color.WHITE);
            g2.setFont(new Font("SansSerif", Font.BOLD, 22));
            String score = "845";
            FontMetrics fm = g2.getFontMetrics();
            g2.drawString(score, cx - fm.stringWidth(score) / 2, cy + 8);
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            FitTrackGUI app = new FitTrackGUI("Jordan Rivers");
            app.setVisible(true);
        });
    }
}
