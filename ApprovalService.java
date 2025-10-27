package com.frontdash.backend.service;

import com.frontdash.backend.repository.ApprovalRepository;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class ApprovalService {
    private final ApprovalRepository repo;

    public ApprovalService(ApprovalRepository repo) { this.repo = repo; }

    public Map<String,Object> request(String restaurantId) {
        return repo.requestRegistration(restaurantId);
    }

    public Map<String,Object> decide(String restaurantId, String status, String adminId) {
        return repo.decideRegistration(restaurantId, status, adminId);
    }
}
