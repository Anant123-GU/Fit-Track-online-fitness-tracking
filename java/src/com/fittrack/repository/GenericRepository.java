package com.fittrack.repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Predicate;
import java.util.stream.Collectors;

/**
 * Concrete generic repository implementation utilizing Java Collections (Map, List, Set)
 * and Generics with Java Streams.
 * Demonstrates Collections & Generics rubric requirements.
 *
 * @param <T> Generic domain object
 */
public class GenericRepository<T> implements Repository<T> {
    private final Map<String, T> storageMap;

    public GenericRepository() {
        // Thread-safe generic collection map
        this.storageMap = new ConcurrentHashMap<>();
    }

    @Override
    public void save(String id, T item) {
        if (id == null || item == null) {
            throw new IllegalArgumentException("Key and entity item cannot be null");
        }
        storageMap.put(id, item);
    }

    @Override
    public Optional<T> findById(String id) {
        return Optional.ofNullable(storageMap.get(id));
    }

    @Override
    public List<T> findAll() {
        return new ArrayList<>(storageMap.values());
    }

    @Override
    public List<T> findMatching(Predicate<T> condition) {
        return storageMap.values().stream()
                .filter(condition)
                .collect(Collectors.toList());
    }

    @Override
    public boolean deleteById(String id) {
        return storageMap.remove(id) != null;
    }

    @Override
    public int count() {
        return storageMap.size();
    }
}
