$baseDir = "d:/new project/military-asset-management/backend/src/main/java/com/military/assetmanagement"

$jwtUtil = @"
package com.military.assetmanagement.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
    @Value("`${jwt.secret}")
    private String jwtSecret;

    @Value("`${jwt.expiration}")
    private int jwtExpirationMs;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateToken(String username, String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUsernameFromToken(String token) {
        return Jwts.parserBuilder().setSigningKey(getSigningKey()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            System.err.println("Invalid JWT signature/token: " + e.getMessage());
        }
        return false;
    }
}
"@
Set-Content -Path "$baseDir/security/JwtUtil.java" -Value $jwtUtil -Encoding UTF8

$authRequestDto = @"
package com.military.assetmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AuthRequest {
    @NotBlank
    private String username;

    @NotBlank
    private String password;
}
"@
Set-Content -Path "$baseDir/dto/AuthRequest.java" -Value $authRequestDto -Encoding UTF8

$authResponseDto = @"
package com.military.assetmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String username;
    private String role;
    private Long baseId;
}
"@
Set-Content -Path "$baseDir/dto/AuthResponse.java" -Value $authResponseDto -Encoding UTF8

$authController = @"
package com.military.assetmanagement.controller;

import com.military.assetmanagement.dto.AuthRequest;
import com.military.assetmanagement.dto.AuthResponse;
import com.military.assetmanagement.entity.User;
import com.military.assetmanagement.repository.UserRepository;
import com.military.assetmanagement.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody AuthRequest loginRequest) {
        Optional<User> userOpt = userRepository.findByUsername(loginRequest.getUsername());
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getActive() && passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                String jwt = jwtUtil.generateToken(user.getUsername(), user.getRole());
                return ResponseEntity.ok(new AuthResponse(jwt, user.getUsername(), user.getRole(), 
                    user.getBase() != null ? user.getBase().getId() : null));
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid login credentials.");
    }
}
"@
Set-Content -Path "$baseDir/controller/AuthController.java" -Value $authController -Encoding UTF8

Write-Host "Auth Logic generated."
