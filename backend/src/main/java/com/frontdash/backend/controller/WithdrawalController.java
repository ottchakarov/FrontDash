package com.frontdash.backend.controller;

import com.frontdash.backend.entity.Withdraw;
import com.frontdash.backend.service.WithdrawalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/withdrawals")
@CrossOrigin(origins = "http://localhost:5173")
public class WithdrawalController {

    @Autowired
    private WithdrawalService withdrawalService;

    // Get withdrawal status for a restaurant
    @GetMapping("/restaurant/{restaurantId}/status")
    public ResponseEntity<Map<String, String>> getWithdrawalStatus(@PathVariable String restaurantId) {
        String status = withdrawalService.getWithdrawalStatus(restaurantId);
        return ResponseEntity.ok(Map.of("status", status));
    }

    // Get withdrawal request details
    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<Withdraw> getWithdrawalRequest(@PathVariable String restaurantId) {
        Optional<Withdraw> withdrawRequest = withdrawalService.getWithdrawalRequest(restaurantId);
        return withdrawRequest.map(ResponseEntity::ok)
                            .orElse(ResponseEntity.notFound().build());
    }

    // Request withdrawal
    @PostMapping("/restaurant/{restaurantId}/request")
    public ResponseEntity<?> requestWithdrawal(
            @PathVariable String restaurantId,
            @RequestBody Map<String, String> request) {
        
        String description = request.get("description");
        
        try {
            Withdraw withdrawRequest = withdrawalService.requestWithdrawal(restaurantId, description);
            return ResponseEntity.ok(withdrawRequest);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Cancel withdrawal request
    @DeleteMapping("/restaurant/{restaurantId}/request")
    public ResponseEntity<?> cancelWithdrawalRequest(@PathVariable String restaurantId) {
        try {
            Optional<Withdraw> cancelledRequest = withdrawalService.cancelWithdrawalRequest(restaurantId);
            return cancelledRequest.map(ResponseEntity::ok)
                                 .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Check if restaurant has pending request
    @GetMapping("/restaurant/{restaurantId}/has-pending")
    public ResponseEntity<Map<String, Boolean>> hasPendingRequest(@PathVariable String restaurantId) {
        boolean hasPending = withdrawalService.hasPendingRequest(restaurantId);
        return ResponseEntity.ok(Map.of("hasPending", hasPending));
    }

    // Admin endpoints (for completeness, though you mentioned auth is handled separately)

    // Get all pending withdrawal requests
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingRequests() {
        try {
            return ResponseEntity.ok(withdrawalService.getWithdrawalRequestsByStatus("pending"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Approve withdrawal request
    @PutMapping("/{restaurantId}/approve")
    public ResponseEntity<?> approveWithdrawal(@PathVariable String restaurantId) {
        try {
            Optional<Withdraw> approvedRequest = withdrawalService.approveWithdrawal(restaurantId);
            return approvedRequest.map(ResponseEntity::ok)
                                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Deny withdrawal request
    @PutMapping("/{restaurantId}/deny")
    public ResponseEntity<?> denyWithdrawal(
            @PathVariable String restaurantId,
            @RequestBody Map<String, String> request) {
        
        String reason = request.get("reason");
        
        try {
            Optional<Withdraw> deniedRequest = withdrawalService.denyWithdrawal(restaurantId, reason);
            return deniedRequest.map(ResponseEntity::ok)
                              .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}