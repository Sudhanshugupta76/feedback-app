package com.craveup.feedback;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {
    @GetMapping("/")
    public Map<String, String> home() {
        return Map.of(
                "message", "Feedback backend is running.",
                "frontend", "http://localhost:5173",
                "login", "POST /api/auth/login",
                "register", "POST /api/auth/register");
    }
}
