package com.craveup.feedback;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Feedback {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
    public Long userId;
    @Column(length = 2000, nullable = false) public String message;
    public LocalDate createdAt = LocalDate.now();
}
