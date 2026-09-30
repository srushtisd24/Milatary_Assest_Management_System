package com.military.assetmanagement.config;

import com.military.assetmanagement.service.AuditService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuditInterceptor implements HandlerInterceptor {
    @Autowired
    private AuditService auditService;

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        String method = request.getMethod();
        if (method.equals("POST") || method.equals("PUT") || method.equals("DELETE")) {
            String path = request.getRequestURI();
            String status = response.getStatus() >= 200 && response.getStatus() < 300 ? "SUCCESS" : "FAILED";
            String action = method + " " + path;
            String entityType = path.split("/").length > 2 ? path.split("/")[2] : "UNKNOWN";
            auditService.log(action, entityType, null, "User performed " + action, method, path, status);
        }
    }
}
