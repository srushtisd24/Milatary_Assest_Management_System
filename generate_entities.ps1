$baseDir = "d:/new project/military-asset-management/backend/src/main/java/com/military/assetmanagement"

$userEntity = @"
package com.military.assetmanagement.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "base_id")
    private Base base;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
"@
Set-Content -Path "$baseDir/entity/User.java" -Value $userEntity -Encoding UTF8

$baseEntity = @"
package com.military.assetmanagement.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "bases")
public class Base {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String location;

    @Column(unique = true, nullable = false)
    private String code;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
"@
Set-Content -Path "$baseDir/entity/Base.java" -Value $baseEntity -Encoding UTF8

$userRepository = @"
package com.military.assetmanagement.repository;

import com.military.assetmanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}
"@
Set-Content -Path "$baseDir/repository/UserRepository.java" -Value $userRepository -Encoding UTF8

$baseRepository = @"
package com.military.assetmanagement.repository;

import com.military.assetmanagement.entity.Base;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BaseRepository extends JpaRepository<Base, Long> {
}
"@
Set-Content -Path "$baseDir/repository/BaseRepository.java" -Value $baseRepository -Encoding UTF8

Write-Host "Entities and Repositories generated."
