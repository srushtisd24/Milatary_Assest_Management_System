$baseDir = "d:/new project/military-asset-management/backend/src/main/java/com/military/assetmanagement"

$equipmentEntity = @"
package com.military.assetmanagement.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "equipment_types")
public class EquipmentType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category;

    private String description;

    @Column(nullable = false)
    private Boolean active = true;
}
"@
Set-Content -Path "$baseDir/entity/EquipmentType.java" -Value $equipmentEntity -Encoding UTF8

$assetEntity = @"
package com.military.assetmanagement.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "assets")
public class Asset {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "equipment_type_id", nullable = false)
    private EquipmentType equipmentType;

    @ManyToOne
    @JoinColumn(name = "base_id", nullable = false)
    private Base base;

    @Column(name = "serial_number")
    private String serialNumber;

    @Column(nullable = false)
    private Integer quantity = 1;

    private String status;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
"@
Set-Content -Path "$baseDir/entity/Asset.java" -Value $assetEntity -Encoding UTF8

$auditLogEntity = @"
package com.military.assetmanagement.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String action;

    @Column(name = "entity_type")
    private String entityType;

    @Column(name = "entity_id")
    private Long entityId;

    private String description;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(insertable = false, updatable = false)
    private LocalDateTime timestamp;
}
"@
Set-Content -Path "$baseDir/entity/AuditLog.java" -Value $auditLogEntity -Encoding UTF8

$transferEntity = @"
package com.military.assetmanagement.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "transfers")
public class Transfer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "from_base_id", nullable = false)
    private Base fromBase;

    @ManyToOne
    @JoinColumn(name = "to_base_id", nullable = false)
    private Base toBase;

    @ManyToOne
    @JoinColumn(name = "equipment_type_id", nullable = false)
    private EquipmentType equipmentType;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "transfer_date", nullable = false)
    private LocalDate transferDate;

    @Column(name = "reference_number")
    private String referenceNumber;

    @Column(nullable = false)
    private String status;

    private String remarks;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
"@
Set-Content -Path "$baseDir/entity/Transfer.java" -Value $transferEntity -Encoding UTF8

$transferRepo = @"
package com.military.assetmanagement.repository;

import com.military.assetmanagement.entity.Transfer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransferRepository extends JpaRepository<Transfer, Long> {
}
"@
Set-Content -Path "$baseDir/repository/TransferRepository.java" -Value $transferRepo -Encoding UTF8

$auditLogRepo = @"
package com.military.assetmanagement.repository;

import com.military.assetmanagement.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
}
"@
Set-Content -Path "$baseDir/repository/AuditLogRepository.java" -Value $auditLogRepo -Encoding UTF8

Write-Host "Additional Entities generated."
