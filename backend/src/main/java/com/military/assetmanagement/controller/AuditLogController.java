package com.military.assetmanagement.controller;

import com.military.assetmanagement.repository.AuditLogRepository;
import com.military.assetmanagement.entity.User;
import com.military.assetmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audit-logs")
@CrossOrigin("*")
public class AuditLogController {
    @Autowired
    private AuditLogRepository auditLogRepository;
    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getAllLogs() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByUsername(auth.getName()).orElse(null);
        if (user == null || !user.getRole().contains("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only ADMIN can view audit logs");
        }
        return ResponseEntity.ok(auditLogRepository.findAll());
    }
}
