package com.military.assetmanagement.controller;
import com.military.assetmanagement.entity.User;
import com.military.assetmanagement.repository.UserRepository;
import com.military.assetmanagement.repository.BaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    @Autowired private UserRepository userRepository;
    @Autowired private BaseRepository baseRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByUsername(auth.getName()).orElse(null);
        return user != null && user.getRole().contains("ADMIN");
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        if (!isAdmin()) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        if (!isAdmin()) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        if (user.getBase() != null && user.getBase().getId() != null) {
            user.setBase(baseRepository.findById(user.getBase().getId()).orElse(null));
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return ResponseEntity.ok(userRepository.save(user));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User details) {
        if (!isAdmin()) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        User existing = userRepository.findById(id).orElse(null);
        if (existing == null) return ResponseEntity.notFound().build();
        
        existing.setFullName(details.getFullName());
        existing.setEmail(details.getEmail());
        existing.setRole(details.getRole());
        existing.setActive(details.getActive());
        if (details.getBase() != null && details.getBase().getId() != null) {
            existing.setBase(baseRepository.findById(details.getBase().getId()).orElse(null));
        }
        if (details.getPassword() != null && !details.getPassword().isEmpty()) {
            existing.setPassword(passwordEncoder.encode(details.getPassword()));
        }
        return ResponseEntity.ok(userRepository.save(existing));
    }
}
