package com.fittrack.threading;

import java.util.Random;

/**
 * Worker Thread simulating continuous cardiac telemetry monitor.
 * Demonstrates: Thread lifecycle, volatile flags for graceful stopping, and synchronization.
 */
public class HeartRateMonitorThread implements Runnable {
    private final TelemetryBuffer buffer;
    private final String athleteId;
    private volatile boolean isRunning;
    private final Random random;
    private int currentBpm;

    public HeartRateMonitorThread(TelemetryBuffer buffer, String athleteId) {
        this.buffer = buffer;
        this.athleteId = athleteId;
        this.isRunning = false;
        this.random = new Random();
        this.currentBpm = 128; // Zone 3 baseline
    }

    @Override
    public void run() {
        this.isRunning = true;
        System.out.println("[Thread " + Thread.currentThread().getName() + "] HeartRateMonitorThread started for " + athleteId);

        while (isRunning && !Thread.currentThread().isInterrupted()) {
            try {
                // Natural physiologic cardiac fluctuation (+/- 3 BPM)
                int delta = random.nextInt(7) - 3;
                currentBpm = Math.max(115, Math.min(145, currentBpm + delta));

                // Thread-safe production into synchronized buffer
                buffer.produceBpm(currentBpm);

                // Simulate 2.5 second telemetry transmission interval
                Thread.sleep(2500);
            } catch (InterruptedException e) {
                System.out.println("[Thread " + Thread.currentThread().getName() + "] Interrupted, shutting down safely.");
                Thread.currentThread().interrupt();
                break;
            }
        }
    }

    public void stopMonitoring() {
        this.isRunning = false;
    }

    public int getCurrentBpm() {
        return currentBpm;
    }
}
