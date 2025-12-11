package com.frontdash.backend.service;

import com.frontdash.backend.repository.StaffManagementRepository;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
public class StaffManagementService {
    private final StaffManagementRepository repo;

    public StaffManagementService(StaffManagementRepository repo) {
        this.repo = repo;
    }

    public Map<String, Object> createStaff(String userId,
                                           int roleId,
                                           String firstName,
                                           String lastName,
                                           String email,
                                           String phone,
                                           String username) {
        String id = (userId == null || userId.isBlank()) ? UUID.randomUUID().toString() : userId;
        String uname = (username == null || username.isBlank())
                ? (email != null ? email.toLowerCase() : ("user_" + id))
                : username;
        return repo.createStaff(id, roleId, firstName, lastName, email, phone, uname);
    }

    public Map<String, Object> inactivateStaff(String userId) {
        return repo.inactivateStaff(userId);
    }
}
