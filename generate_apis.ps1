$baseDir = "d:/new project/military-asset-management/backend/src/main/java/com/military/assetmanagement"

$purchaseEntity = @"
package com.military.assetmanagement.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "purchases")
public class Purchase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "base_id", nullable = false)
    private Base base;

    @ManyToOne
    @JoinColumn(name = "equipment_type_id", nullable = false)
    private EquipmentType equipmentType;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "purchase_date", nullable = false)
    private LocalDate purchaseDate;

    private String supplier;

    @Column(name = "reference_number")
    private String referenceNumber;

    @Column(name = "unit_cost")
    private BigDecimal unitCost;

    @Column(name = "total_cost")
    private BigDecimal totalCost;

    private String remarks;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
"@
Set-Content -Path "$baseDir/entity/Purchase.java" -Value $purchaseEntity -Encoding UTF8

$purchaseRepo = @"
package com.military.assetmanagement.repository;

import com.military.assetmanagement.entity.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
    List<Purchase> findByBaseId(Long baseId);
}
"@
Set-Content -Path "$baseDir/repository/PurchaseRepository.java" -Value $purchaseRepo -Encoding UTF8

$dashboardController = @"
package com.military.assetmanagement.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @GetMapping("/summary")
    public ResponseEntity<?> getDashboardSummary(@RequestParam(required = false) Long baseId) {
        // Mock data to feed the React UI metrics
        Map<String, Object> stats = new HashMap<>();
        stats.put("openingBalance", 1200);
        stats.put("netMovement", 140);
        stats.put("closingBalance", 1340);
        stats.put("assigned", 350);
        stats.put("expended", 50);
        
        return ResponseEntity.ok(stats);
    }
}
"@
Set-Content -Path "$baseDir/controller/DashboardController.java" -Value $dashboardController -Encoding UTF8

$purchaseController = @"
package com.military.assetmanagement.controller;

import com.military.assetmanagement.entity.Purchase;
import com.military.assetmanagement.repository.PurchaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchases")
@CrossOrigin(origins = "*")
public class PurchaseController {

    @Autowired
    private PurchaseRepository purchaseRepository;

    @GetMapping
    public ResponseEntity<List<Purchase>> getAllPurchases() {
        return ResponseEntity.ok(purchaseRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createPurchase(@RequestBody Purchase purchase) {
        // Business logic to update asset balance and create audit log goes here
        Purchase saved = purchaseRepository.save(purchase);
        return ResponseEntity.ok(saved);
    }
}
"@
Set-Content -Path "$baseDir/controller/PurchaseController.java" -Value $purchaseController -Encoding UTF8

Write-Host "API Controllers generated."
