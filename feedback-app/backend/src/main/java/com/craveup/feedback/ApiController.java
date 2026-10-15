package com.craveup.feedback;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api")
public class ApiController {
    private final UserRepo users;
    private final FeedbackRepo fbs;
    private final BCryptPasswordEncoder enc = new BCryptPasswordEncoder();

    public ApiController(UserRepo users, FeedbackRepo fbs) { this.users = users; this.fbs = fbs; }

    record Reg(String username, String email, String password) {}
    record Log(String username, String password) {}

    private Map<String, Object> view(User u) {
        return Map.of("id", u.id, "username", u.username, "email", u.email, "role", u.role);
    }
    private ResponseStatusException err(HttpStatus s, String m) { return new ResponseStatusException(s, m); }
    private User auth(Long id) { return users.findById(id).orElseThrow(() -> err(HttpStatus.UNAUTHORIZED, "Please log in again")); }
    private void admin(Long id) { if (!"ADMIN".equals(auth(id).role)) throw err(HttpStatus.FORBIDDEN, "Admin access only"); }
    private String msg(Map<String, String> b) {
        String m = b.get("message");
        if (m == null || m.isBlank()) throw err(HttpStatus.BAD_REQUEST, "Feedback cannot be empty");
        return m.trim();
    }

    // ---------- Auth ----------
    @PostMapping("/auth/register")
    public Map<String, Object> register(@RequestBody Reg r) {
        if (r.username() == null || r.email() == null || r.password() == null || r.password().length() < 6)
            throw err(HttpStatus.BAD_REQUEST, "Fill all fields (password min 6 characters)");
        if (users.existsByUsername(r.username()) || users.existsByEmail(r.email()))
            throw err(HttpStatus.CONFLICT, "Username or email already registered");
        User u = new User();
        u.username = r.username(); u.email = r.email(); u.password = enc.encode(r.password());
        return view(users.save(u));
    }

    @PostMapping("/auth/login")
    public Map<String, Object> login(@RequestBody Log l) {
        User u = users.findByUsername(l.username()).orElseThrow(() -> err(HttpStatus.UNAUTHORIZED, "Wrong username or password"));
        if (!enc.matches(l.password(), u.password)) throw err(HttpStatus.UNAUTHORIZED, "Wrong username or password");
        return view(u);
    }

    // ---------- User feedback ----------
    @GetMapping("/feedback/me")
    public Feedback mine(@RequestHeader("X-User-Id") Long uid) {
        auth(uid);
        return fbs.findFirstByUserId(uid).orElse(null);
    }

    @PostMapping("/feedback/me")
    public Feedback add(@RequestHeader("X-User-Id") Long uid, @RequestBody Map<String, String> b) {
        auth(uid);
        if (fbs.findFirstByUserId(uid).isPresent()) throw err(HttpStatus.CONFLICT, "You already submitted feedback. Use Edit Feedback.");
        Feedback f = new Feedback();
        f.userId = uid; f.message = msg(b);
        return fbs.save(f);
    }

    @PutMapping("/feedback/me")
    public Feedback editMine(@RequestHeader("X-User-Id") Long uid, @RequestBody Map<String, String> b) {
        auth(uid);
        Feedback f = fbs.findFirstByUserId(uid).orElseThrow(() -> err(HttpStatus.NOT_FOUND, "No feedback to edit yet"));
        f.message = msg(b);
        return fbs.save(f);
    }

    // ---------- Admin CRUD ----------
    @GetMapping("/admin/feedback")
    public List<Feedback> all(@RequestHeader("X-User-Id") Long uid) { admin(uid); return fbs.findAll(); }

    @GetMapping("/admin/feedback/{id}")
    public Feedback one(@RequestHeader("X-User-Id") Long uid, @PathVariable Long id) {
        admin(uid);
        return fbs.findById(id).orElseThrow(() -> err(HttpStatus.NOT_FOUND, "Feedback not found"));
    }

    @PostMapping("/admin/feedback")
    public Feedback create(@RequestHeader("X-User-Id") Long uid, @RequestBody Map<String, String> b) {
        admin(uid);
        Feedback f = new Feedback();
        f.userId = uid; f.message = msg(b); f.createdAt = LocalDate.now();
        return fbs.save(f);
    }

    @PutMapping("/admin/feedback/{id}")
    public Feedback update(@RequestHeader("X-User-Id") Long uid, @PathVariable Long id, @RequestBody Map<String, String> b) {
        admin(uid);
        Feedback f = fbs.findById(id).orElseThrow(() -> err(HttpStatus.NOT_FOUND, "Feedback not found"));
        f.message = msg(b);
        return fbs.save(f);
    }

    @DeleteMapping("/admin/feedback/{id}")
    public void delete(@RequestHeader("X-User-Id") Long uid, @PathVariable Long id) {
        admin(uid);
        if (!fbs.existsById(id)) throw err(HttpStatus.NOT_FOUND, "Feedback not found");
        fbs.deleteById(id);
    }
}
