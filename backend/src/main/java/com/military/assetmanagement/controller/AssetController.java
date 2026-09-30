package com.military.assetmanagement.controller;

import com.military.assetmanagement.entity.Asset;
import com.military.assetmanagement.entity.User;
import com.military.assetmanagement.repository.AssetRepository;
import com.military.assetmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin("*")
public class AssetController {
    @Autowired private AssetRepository assetRepository;
    @Autowired private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByUsername(auth.getName()).orElse(null);
    }

    @GetMapping
    public ResponseEntity<?> getAllInventory() {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if (user.getRole().contains("ADMIN")) {
            return ResponseEntity.ok(assetRepository.findAll());
        }
        return ResponseEntity.ok(assetRepository.findByBaseId(user.getBase().getId()));
    }
    
    @GetMapping("/base/{baseId}")
    public ResponseEntity<?> getInventoryByBase(@PathVariable Long baseId) {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if (!user.getRole().contains("ADMIN") && (user.getBase() == null || !user.getBase().getId().equals(baseId))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }
        return ResponseEntity.ok(assetRepository.findByBaseId(baseId));
    }
}
