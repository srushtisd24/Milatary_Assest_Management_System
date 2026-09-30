package com.military.assetmanagement.controller;

import com.military.assetmanagement.entity.Transfer;
import com.military.assetmanagement.entity.Asset;
import com.military.assetmanagement.entity.User;
import com.military.assetmanagement.repository.TransferRepository;
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
@RequestMapping("/api/transfers")
@CrossOrigin("*")
public class TransferController {
    @Autowired private TransferRepository transferRepository;
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
    public ResponseEntity<?> getAllTransfers() {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if (user.getRole().contains("ADMIN")) {
            return ResponseEntity.ok(transferRepository.findAll());
        }
        return ResponseEntity.ok(transferRepository.findByFromBaseIdOrToBaseId(user.getBase().getId(), user.getBase().getId()));
    }

    @PostMapping
    public ResponseEntity<?> createTransfer(@RequestBody Transfer transfer) {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        
        Long sourceBaseId = transfer.getFromBase() != null ? transfer.getFromBase().getId() : null;
        if (sourceBaseId == null || !isAllowed(user, sourceBaseId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied to source base");
        }
        
        if (transfer.getFromBase().getId().equals(transfer.getToBase().getId())) {
            return ResponseEntity.badRequest().body("Source and destination base cannot be the same");
        }

        if (transfer.getFromBase() != null && transfer.getFromBase().getId() != null) {
            transfer.setFromBase(baseRepository.findById(transfer.getFromBase().getId()).orElse(null));
        }
        if (transfer.getToBase() != null && transfer.getToBase().getId() != null) {
            transfer.setToBase(baseRepository.findById(transfer.getToBase().getId()).orElse(null));
        }
        if (transfer.getEquipmentType() != null && transfer.getEquipmentType().getId() != null) {
            transfer.setEquipmentType(equipmentTypeRepository.findById(transfer.getEquipmentType().getId()).orElse(null));
        }

        if (transfer.getTransferDate() == null) {
            transfer.setTransferDate(LocalDate.now());
        }
        if (transfer.getStatus() == null) {
            transfer.setStatus("COMPLETED"); // Auto complete for now
        }
        transfer.setInitiatedBy(user);

        // Source Inventory logic
        Asset sourceAsset = assetRepository.findByBaseIdAndEquipmentTypeId(transfer.getFromBase().getId(), transfer.getEquipmentType().getId()).orElse(null);
        if (sourceAsset == null || sourceAsset.getQuantity() < transfer.getQuantity()) {
            return ResponseEntity.badRequest().body("Insufficient inventory at source base");
        }
        sourceAsset.setQuantity(sourceAsset.getQuantity() - transfer.getQuantity());
        assetRepository.save(sourceAsset);

        // Dest Inventory logic
        Asset destAsset = assetRepository.findByBaseIdAndEquipmentTypeId(transfer.getToBase().getId(), transfer.getEquipmentType().getId()).orElse(new Asset());
        if (destAsset.getId() == null) {
            destAsset.setBase(transfer.getToBase());
            destAsset.setEquipmentType(transfer.getEquipmentType());
            destAsset.setQuantity(transfer.getQuantity());
            destAsset.setStatus("AVAILABLE");
        } else {
            destAsset.setQuantity(destAsset.getQuantity() + transfer.getQuantity());
        }
        assetRepository.save(destAsset);

        Transfer saved = transferRepository.save(transfer);
        return ResponseEntity.ok(transferRepository.findById(saved.getId()).orElse(saved));
    }
}
