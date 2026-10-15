package com.craveup.feedback;

import jakarta.persistence.*;

@Entity @Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
    @Column(unique = true, nullable = false) public String username;
    @Column(unique = true, nullable = false) public String email;
    @Column(nullable = false) public String password;
    public String role = "USER";
}
