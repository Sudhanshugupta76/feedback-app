package com.craveup.feedback;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FeedbackRepo extends JpaRepository<Feedback, Long> {
    Optional<Feedback> findFirstByUserId(Long userId);
}
