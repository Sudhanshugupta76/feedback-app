package com.craveup.feedback;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class FeedbackApplication {
    public static void main(String[] args) { SpringApplication.run(FeedbackApplication.class, args); }

    @Bean WebMvcConfigurer cors() {
        return new WebMvcConfigurer() {
            public void addCorsMappings(CorsRegistry r) {
                r.addMapping("/api/**").allowedOrigins("http://localhost:5173").allowedMethods("*").allowedHeaders("*");
            }
        };
    }

    // Default admin: admin / admin123
    @Bean CommandLineRunner seed(UserRepo users) {
        return a -> {
            if (!users.existsByUsername("admin")) {
                User u = new User();
                u.username = "admin"; u.email = "admin@craveup.com";
                u.password = new BCryptPasswordEncoder().encode("admin123"); u.role = "ADMIN";
                users.save(u);
            }
        };
    }
}
