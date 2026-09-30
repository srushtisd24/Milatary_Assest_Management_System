package com.military.assetmanagement.controller;

import com.military.assetmanagement.entity.Purchase;
import com.military.assetmanagement.entity.Asset;
import com.military.assetmanagement.entity.User;
import com.military.assetmanagement.repository.PurchaseRepository;
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
import java.util.List;

@RestController
@RequestMapping("/api/purchases")
@CrossOrigin("*")
public class PurchaseController {
    @Autowired private PurchaseRepository purchaseRepository;
    @Autowired private AssetRepository assetRepository;
    @Autowired private BaseRepository baseRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private com.military.assetmanagement.repository.EquipmentTypeRepository equipmentTypeRepository;

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
    public ResponseEntity<?> getAllPurchases() {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if (user.getRole().contains("ADMIN")) {
            return ResponseEntity.ok(purchaseRepository.findAll());
        }
        return ResponseEntity.ok(purchaseRepository.findByBaseId(user.getBase().getId()));
    }

    @PostMapping
    public ResponseEntity<?> createPurchase(@RequestBody Purchase purchase) {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        
        Long targetBaseId = purchase.getBase() != null ? purchase.getBase().getId() : user.getBase().getId();
        if (!isAllowed(user, targetBaseId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied to base");
        }

        if (purchase.getBase() != null && purchase.getBase().getId() != null) {
            purchase.setBase(baseRepository.findById(purchase.getBase().getId()).orElse(null));
        } else {
            purchase.setBase(baseRepository.findById(targetBaseId).orElse(null));
        }

        if (purchase.getEquipmentType() != null && purchase.getEquipmentType().getId() != null) {
            purchase.setEquipmentType(equipmentTypeRepository.findById(purchase.getEquipmentType().getId()).orElse(null));
        }

        if (purchase.getPurchaseDate() == null) {
            purchase.setPurchaseDate(LocalDate.now());
        }

        if (purchase.getBase() != null && purchase.getEquipmentType() != null) {
            Asset asset = assetRepository.findByBaseIdAndEquipmentTypeId(purchase.getBase().getId(), purchase.getEquipmentType().getId()).orElse(new Asset());
            if (asset.getId() == null) {
                asset.setBase(purchase.getBase());
                asset.setEquipmentType(purchase.getEquipmentType());
                asset.setQuantity(purchase.getQuantity());
                asset.setStatus("AVAILABLE");
            } else {
                asset.setQuantity(asset.getQuantity() + purchase.getQuantity());
            }
            assetRepository.save(asset);
        }

        Purchase saved = purchaseRepository.save(purchase);
        return ResponseEntity.ok(purchaseRepository.findById(saved.getId()).orElse(saved));
    }
}
