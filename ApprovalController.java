package com.frontdash.backend.controller;

import com.frontdash.backend.entity.ApprovalDecisionRequest;
import com.frontdash.backend.entity.ApprovalRequest;
import com.frontdash.backend.service.ApprovalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/approval")
@CrossOrigin
public class ApprovalController {
    private final ApprovalService service;
    public ApprovalController(ApprovalService service) { this.service = service; }

    @PostMapping("/request")
    public ResponseEntity<?> request(@RequestBody ApprovalRequest req) {
        return ResponseEntity.ok(service.request(req.restaurantId));
    }

    @PostMapping("/decide")
    public ResponseEntity<?> decide(@RequestBody ApprovalDecisionRequest req) {
        return ResponseEntity.ok(service.decide(req.restaurantId, req.status, req.adminId));
    }
}
