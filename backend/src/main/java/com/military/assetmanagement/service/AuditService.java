package com.military.assetmanagement.service;

import com.military.assetmanagement.entity.AuditLog;
import com.military.assetmanagement.entity.User;
import com.military.assetmanagement.repository.AuditLogRepository;
import com.military.assetmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuditService {
    @Autowired
    private AuditLogRepository auditLogRepository;
    
    @Autowired
    private UserRepository userRepository;

    public void log(String action, String entityType, Long entityId, String description, String httpMethod, String endpoint, String status) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User user = null;
            if (auth != null && auth.getName() != null && !auth.getName().equals("anonymousUser")) {
                user = userRepository.findByUsername(auth.getName()).orElse(null);
            }

            AuditLog log = new AuditLog();
            log.setUser(user);
            log.setAction(action);
            log.setEntityType(entityType);
            log.setEntityId(entityId);
            log.setDescription(description);
            log.setHttpMethod(httpMethod);
            log.setApiEndpoint(endpoint);
            log.setStatus(status);
            // IP Address could be extracted from a RequestContextHolder, omitted for simplicity
            log.setIpAddress("127.0.0.1");

            auditLogRepository.save(log);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
