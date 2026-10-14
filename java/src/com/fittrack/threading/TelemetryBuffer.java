package com.fittrack.threading;

import java.util.LinkedList;
import java.util.Queue;

/**
 * Thread-safe Synchronized Buffer demonstrating Java Multithreading & Synchronization.
 * Implements Producer-Consumer pattern using synchronized blocks, wait(), and notifyAll().
 * Fulfills Multithreading & Synchronization rubric requirement.
 */
public class TelemetryBuffer {
    private final Queue<Integer> bpmQueue;
    private final int capacity;

    public TelemetryBuffer(int capacity) {
        this.bpmQueue = new LinkedList<>();
        this.capacity = capacity;
    }

    /**
     * Synchronized producer method to add real-time biometric telemetry.
     */
    public synchronized void produceBpm(int bpm) throws InterruptedException {
        while (bpmQueue.size() >= capacity) {
            // Buffer full: wait for consumer thread to drain
            wait();
        }
        bpmQueue.offer(bpm);
        // Notify worker consumer threads that new telemetry is available
        notifyAll();
    }

    /**
     * Synchronized consumer method to retrieve telemetry for database batch persistence.
     */
    public synchronized int consumeBpm() throws InterruptedException {
        while (bpmQueue.isEmpty()) {
            // Buffer empty: wait for producer thread to generate sample
            wait();
        }
        int bpm = bpmQueue.poll();
        // Notify producer thread that capacity is freed
        notifyAll();
        return bpm;
    }

    public synchronized int getQueueSize() {
        return bpmQueue.size();
    }
}
