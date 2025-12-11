package com.frontdash.backend.controller;

import com.frontdash.backend.entity.CreateStaffRequest;
import com.frontdash.backend.entity.InactivateRequest;
import com.frontdash.backend.service.StaffManagementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin
public class StaffController {
    private final StaffManagementService service;

    public StaffController(StaffManagementService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<?> createStaff(@RequestBody CreateStaffRequest req) {
        if (req.roleId == null) {
            req.roleId = 0; // default to staff role
        }
        return ResponseEntity.ok(
                service.createStaff(
                        req.userId,
                        req.roleId,
                        req.firstName,
                        req.lastName,
                        req.email,
                        req.phone,
                        req.username
                )
        );
    }

    @PostMapping("/inactivate")
    public ResponseEntity<?> inactivate(@RequestBody InactivateRequest req) {
        return ResponseEntity.ok(service.inactivateStaff(req.id));
    }
}
