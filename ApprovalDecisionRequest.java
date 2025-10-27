package com.frontdash.backend.entity;

public class ApprovalDecisionRequest {
    public String restaurantId;
    public String status;   // "approved" or "rejected"
    public String adminId;  // staff id
    public String reason;   // used only when rejected (optional)
}
