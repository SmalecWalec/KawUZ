package com.example.kawuz.controller;

import com.example.kawuz.entity.User;
import com.example.kawuz.repository.UserRepository;
import com.example.kawuz.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
// @CrossOrigin removed (handled in config)
public class AuthController {

    @Autowired private UserRepository userRepository;
    @Autowired private JwtUtil jwtUtil; // Inject the utility

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Login zajęty!"));
        }
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Rejestracja udana!"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        Optional<User> existingUser = userRepository.findByUsername(user.getUsername());

        // YOUR EXISTING LOGIC
        if (existingUser.isPresent() && existingUser.get().getPassword().equals(user.getPassword())) {
            User loggedInUser = existingUser.get();

            // 1. Generate Token
            String token = jwtUtil.generateToken(loggedInUser.getUsername());

            // 2. Create HttpOnly Cookie
            ResponseCookie cookie = ResponseCookie.from("auth_token", token)
                    .httpOnly(true)
                    .secure(false) // Set TRUE if using HTTPS
                    .path("/")
                    .maxAge(24 * 60 * 60)
                    .sameSite("Strict")
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString()) // Send Cookie
                    .body(Map.of(
                            "message", "Zalogowano!",
                            "username", loggedInUser.getUsername(),
                            "isAdmin", loggedInUser.isAdmin()
                    ));
        }
        return ResponseEntity.status(401).body(Map.of("message", "Błąd: Zły login lub hasło"));
    }

    // 3. LOGOUT ENDPOINT (Required to clear cookie)
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        ResponseCookie cookie = ResponseCookie.from("auth_token", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0) // Expires immediately
                .build();
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(Map.of("message", "Wylogowano"));
    }

    // 4. CHECK USER STATUS (For React Page Refresh)
    @GetMapping("/me")
    public ResponseEntity<?> me(@CookieValue(name = "auth_token", required = false) String token) {
        if (token != null && jwtUtil.validateToken(token)) {
            String username = jwtUtil.getUsernameFromToken(token);
            User user = userRepository.findByUsername(username).orElse(null);
            if (user != null) {
                return ResponseEntity.ok(Map.of(
                        "username", user.getUsername(),
                        "isAdmin", user.isAdmin()
                ));
            }
        }
        return ResponseEntity.status(401).build();
    }
}