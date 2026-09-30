package com.military.assetmanagement.controller;

import com.military.assetmanagement.entity.Base;
import com.military.assetmanagement.entity.User;
import com.military.assetmanagement.repository.BaseRepository;
import com.military.assetmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bases")
@CrossOrigin("*")
public class BaseController {
    @Autowired private BaseRepository baseRepository;
    @Autowired private UserRepository userRepository;

    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByUsername(auth.getName()).orElse(null);
        return user != null && user.getRole().contains("ADMIN");
    }

    @GetMapping
    public ResponseEntity<?> getAllBases() {
        return ResponseEntity.ok(baseRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createBase(@RequestBody Base base) {
        if (!isAdmin()) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(baseRepository.save(base));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBase(@PathVariable Long id, @RequestBody Base baseDetails) {
        if (!isAdmin()) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        Base base = baseRepository.findById(id).orElse(null);
        if (base == null) return ResponseEntity.notFound().build();
        
        base.setName(baseDetails.getName());
        base.setCode(baseDetails.getCode());
        base.setLocation(baseDetails.getLocation());
        base.setActive(baseDetails.getActive());
        return ResponseEntity.ok(baseRepository.save(base));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBase(@PathVariable Long id) {
        if (!isAdmin()) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            baseRepository.deleteById(id);
            return ResponseEntity.ok("Deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Cannot delete base, it is likely in use.");
        }
    }
}
