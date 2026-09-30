package com.military.assetmanagement.controller;

import com.military.assetmanagement.entity.Expenditure;
import com.military.assetmanagement.entity.Asset;
import com.military.assetmanagement.entity.User;
import com.military.assetmanagement.repository.ExpenditureRepository;
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
@RequestMapping("/api/expenditures")
@CrossOrigin("*")
public class ExpenditureController {
    @Autowired private ExpenditureRepository expenditureRepository;
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
    public ResponseEntity<?> getAllExpenditures() {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if (user.getRole().contains("ADMIN")) {
            return ResponseEntity.ok(expenditureRepository.findAll());
        }
        return ResponseEntity.ok(expenditureRepository.findByBaseId(user.getBase().getId()));
    }

    @PostMapping
    public ResponseEntity<?> createExpenditure(@RequestBody Expenditure expenditure) {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        
        Long baseId = expenditure.getBase() != null ? expenditure.getBase().getId() : user.getBase().getId();
        if (!isAllowed(user, baseId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied to base");
        }

        if (expenditure.getBase() == null || expenditure.getBase().getId() == null) {
            expenditure.setBase(baseRepository.findById(baseId).orElse(null));
        }

        if (expenditure.getExpenditureDate() == null) {
            expenditure.setExpenditureDate(LocalDate.now());
        }
        expenditure.setRecordedBy(user);

        // Inventory logic
        Asset asset = assetRepository.findByBaseIdAndEquipmentTypeId(expenditure.getBase().getId(), expenditure.getEquipmentType().getId()).orElse(null);
        if (asset == null || asset.getQuantity() < expenditure.getQuantity()) {
            return ResponseEntity.badRequest().body("Insufficient inventory to expend");
        }
        asset.setQuantity(asset.getQuantity() - expenditure.getQuantity());
        assetRepository.save(asset);

        Expenditure saved = expenditureRepository.save(expenditure);
        return ResponseEntity.ok(expenditureRepository.findById(saved.getId()).orElse(saved));
    }
}
