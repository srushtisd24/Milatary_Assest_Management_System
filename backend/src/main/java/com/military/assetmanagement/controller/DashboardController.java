package com.military.assetmanagement.controller;

import com.military.assetmanagement.entity.*;
import com.military.assetmanagement.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired private PurchaseRepository purchaseRepository;
    @Autowired private TransferRepository transferRepository;
    @Autowired private ExpenditureRepository expenditureRepository;
    @Autowired private AssignmentRepository assignmentRepository;
    @Autowired private AssetRepository assetRepository;
    @Autowired private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByUsername(auth.getName()).orElse(null);
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getDashboardSummary(
            @RequestParam(required = false) Long baseId,
            @RequestParam(required = false) Long equipmentTypeId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        User user = getCurrentUser();
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Long targetBaseId = baseId;
        if (!user.getRole().contains("ADMIN")) {
            targetBaseId = user.getBase().getId();
        }

        LocalDate start = (startDate != null && !startDate.isEmpty()) ? LocalDate.parse(startDate) : null;
        LocalDate end = (endDate != null && !endDate.isEmpty()) ? LocalDate.parse(endDate) : null;

        List<Asset> assets = targetBaseId == null ? assetRepository.findAll() : assetRepository.findByBaseId(targetBaseId);
        if (equipmentTypeId != null) {
            assets = assets.stream().filter(a -> a.getEquipmentType().getId().equals(equipmentTypeId)).collect(Collectors.toList());
        }
        int closingBalance = assets.stream().mapToInt(Asset::getQuantity).sum();

        List<Purchase> purchases = targetBaseId == null ? purchaseRepository.findAll() : purchaseRepository.findByBaseId(targetBaseId);
        if (equipmentTypeId != null) purchases = purchases.stream().filter(p -> p.getEquipmentType().getId().equals(equipmentTypeId)).collect(Collectors.toList());
        if (start != null) purchases = purchases.stream().filter(p -> !p.getPurchaseDate().isBefore(start)).collect(Collectors.toList());
        if (end != null) purchases = purchases.stream().filter(p -> !p.getPurchaseDate().isAfter(end)).collect(Collectors.toList());
        int totalPurchases = purchases.stream().mapToInt(Purchase::getQuantity).sum();

        List<Transfer> transfers = transferRepository.findAll();
        if (equipmentTypeId != null) transfers = transfers.stream().filter(t -> t.getEquipmentType().getId().equals(equipmentTypeId)).collect(Collectors.toList());
        if (start != null) transfers = transfers.stream().filter(t -> !t.getTransferDate().isBefore(start)).collect(Collectors.toList());
        if (end != null) transfers = transfers.stream().filter(t -> !t.getTransferDate().isAfter(end)).collect(Collectors.toList());
        int transferIn = 0;
        int transferOut = 0;
        if (targetBaseId == null) {
            // Global view: internal transfers cancel out
        } else {
            Long finalTarget = targetBaseId;
            transferIn = transfers.stream().filter(t -> t.getToBase().getId().equals(finalTarget)).mapToInt(Transfer::getQuantity).sum();
            transferOut = transfers.stream().filter(t -> t.getFromBase().getId().equals(finalTarget)).mapToInt(Transfer::getQuantity).sum();
        }

        List<Expenditure> expenditures = targetBaseId == null ? expenditureRepository.findAll() : expenditureRepository.findByBaseId(targetBaseId);
        if (equipmentTypeId != null) expenditures = expenditures.stream().filter(e -> e.getEquipmentType().getId().equals(equipmentTypeId)).collect(Collectors.toList());
        if (start != null) expenditures = expenditures.stream().filter(e -> !e.getExpenditureDate().isBefore(start)).collect(Collectors.toList());
        if (end != null) expenditures = expenditures.stream().filter(e -> !e.getExpenditureDate().isAfter(end)).collect(Collectors.toList());
        int totalExpended = expenditures.stream().mapToInt(Expenditure::getQuantity).sum();

        List<Assignment> assignments = targetBaseId == null ? assignmentRepository.findAll() : assignmentRepository.findByBaseId(targetBaseId);
        if (equipmentTypeId != null) assignments = assignments.stream().filter(a -> a.getEquipmentType().getId().equals(equipmentTypeId)).collect(Collectors.toList());
        if (start != null) assignments = assignments.stream().filter(a -> !a.getAssignmentDate().isBefore(start)).collect(Collectors.toList());
        if (end != null) assignments = assignments.stream().filter(a -> a.getAssignmentDate() != null && !a.getAssignmentDate().isAfter(end)).collect(Collectors.toList());
        int totalAssigned = assignments.stream().filter(a -> "ACTIVE".equals(a.getStatus())).mapToInt(Assignment::getQuantity).sum();

        int netMovement = totalPurchases + transferIn - transferOut;
        int openingBalance = closingBalance - netMovement + totalExpended;

        Map<String, Object> stats = new HashMap<>();
        stats.put("openingBalance", openingBalance);
        stats.put("purchases", totalPurchases);
        stats.put("transferIn", transferIn);
        stats.put("transferOut", transferOut);
        stats.put("netMovement", netMovement);
        stats.put("closingBalance", closingBalance);
        stats.put("assigned", totalAssigned);
        stats.put("expended", totalExpended);
        
        return ResponseEntity.ok(stats);
    }
}
