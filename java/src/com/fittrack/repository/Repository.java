package com.fittrack.repository;

import java.util.List;
import java.util.Optional;
import java.util.function.Predicate;

/**
 * Generic Repository Interface demonstrating Java Generics & Collections.
 * Fulfills Collections & Generics rubric requirement.
 *
 * @param <T> Entity type managed by this repository
 */
public interface Repository<T> {
    void save(String id, T item);
    Optional<T> findById(String id);
    List<T> findAll();
    List<T> findMatching(Predicate<T> condition);
    boolean deleteById(String id);
    int count();
}
