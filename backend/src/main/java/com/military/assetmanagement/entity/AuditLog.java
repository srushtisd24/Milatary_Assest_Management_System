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

    // Added as per requirements
    @Column(name = "http_method")
    private String httpMethod;

    @Column(name = "api_endpoint")
    private String apiEndpoint;

    @Column(name = "status")
    private String status;

    @Column(insertable = false, updatable = false)
    private LocalDateTime timestamp;
}
