package com.military.assetmanagement.controller;

import com.military.assetmanagement.entity.Assignment;
import com.military.assetmanagement.entity.Asset;
import com.military.assetmanagement.entity.User;
import com.military.assetmanagement.repository.AssignmentRepository;
import com.military.assetmanagement.repository.AssetRepository;
import com.military.assetmanagement.repository.BaseRepository;
import com.military.assetmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/assignments")
@CrossOrigin("*")
public class AssignmentController {
    @Autowired private AssignmentRepository assignmentRepository;
    @Autowired private AssetRepository assetRepository;
    @Autowired private BaseRepository baseRepository;
    @Autowired private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByUsername(auth.getName()).orElse(null);
    }

    private boolean isAllowed(User user, Long baseId) {
        if (user.getRole().contains("ADMIN")) return true;
        if (user.getBase() != null && user.getBase().getId().equals(baseId)) return true;
        return false;
    }

    @GetMapping
    public ResponseEntity<?> getAllAssignments() {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if (user.getRole().contains("ADMIN")) {
            return ResponseEntity.ok(assignmentRepository.findAll());
        }
        return ResponseEntity.ok(assignmentRepository.findByBaseId(user.getBase().getId()));
    }

    @PostMapping
    public ResponseEntity<?> createAssignment(@RequestBody Assignment assignment) {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        
        Long baseId = assignment.getBase() != null ? assignment.getBase().getId() : user.getBase().getId();
        if (!isAllowed(user, baseId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied to base");
        }

        if (assignment.getBase() == null || assignment.getBase().getId() == null) {
            assignment.setBase(baseRepository.findById(baseId).orElse(null));
        }

        if (assignment.getAssignmentDate() == null) {
            assignment.setAssignmentDate(LocalDate.now());
        }
        assignment.setAssignedBy(user);
        assignment.setStatus("ACTIVE");

        // Inventory logic: Verify inventory exists. "Do not automatically subtract assignments from inventory unless the existing business requirements explicitly require this."
        Asset asset = assetRepository.findByBaseIdAndEquipmentTypeId(assignment.getBase().getId(), assignment.getEquipmentType().getId()).orElse(null);
        if (asset == null || asset.getQuantity() < assignment.getQuantity()) {
            return ResponseEntity.badRequest().body("Insufficient inventory to assign");
        }
        
        Assignment saved = assignmentRepository.save(assignment);
        return ResponseEntity.ok(assignmentRepository.findById(saved.getId()).orElse(saved));
    }
}
