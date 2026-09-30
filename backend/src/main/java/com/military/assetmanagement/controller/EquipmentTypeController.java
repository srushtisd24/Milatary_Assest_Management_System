package com.military.assetmanagement.controller;

import com.military.assetmanagement.entity.EquipmentType;
import com.military.assetmanagement.entity.User;
import com.military.assetmanagement.repository.EquipmentTypeRepository;
import com.military.assetmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/equipment-types")
@CrossOrigin("*")
public class EquipmentTypeController {
    @Autowired private EquipmentTypeRepository equipmentTypeRepository;
    @Autowired private UserRepository userRepository;

    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByUsername(auth.getName()).orElse(null);
        return user != null && user.getRole().contains("ADMIN");
    }

    @GetMapping
    public ResponseEntity<?> getAllEquipmentTypes() {
        return ResponseEntity.ok(equipmentTypeRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createEquipmentType(@RequestBody EquipmentType equipmentType) {
        if (!isAdmin()) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(equipmentTypeRepository.save(equipmentType));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEquipmentType(@PathVariable Long id, @RequestBody EquipmentType details) {
        if (!isAdmin()) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        EquipmentType eq = equipmentTypeRepository.findById(id).orElse(null);
        if (eq == null) return ResponseEntity.notFound().build();
        
        eq.setName(details.getName());
        eq.setCategory(details.getCategory());
        eq.setDescription(details.getDescription());
        eq.setActive(details.getActive());
        return ResponseEntity.ok(equipmentTypeRepository.save(eq));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEquipmentType(@PathVariable Long id) {
        if (!isAdmin()) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        try {
            equipmentTypeRepository.deleteById(id);
            return ResponseEntity.ok("Deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Cannot delete equipment type, it is likely in use.");
        }
    }
}
