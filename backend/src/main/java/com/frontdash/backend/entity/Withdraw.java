package com.frontdash.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "withdraw")
public class Withdraw {
    @Id
    private String restaurantId;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id")
    @MapsId // This maps the restaurantId from the relationship
    private Restaurant restaurant;
    
    @Column(name = "withdraw_description", columnDefinition = "TEXT")
    private String withdrawDescription;
    
    @Column(name = "withdraw_status")
    private String withdrawStatus = "pending"; // pending, approved, denied
    
    @Column(name = "deny_reason", columnDefinition = "TEXT")
    private String denyReason;
    
    @Column(name = "requested_at")
    private LocalDateTime requestedAt = LocalDateTime.now();
    
    @Column(name = "decision_at")
    private LocalDateTime decisionAt;
    
    // Constructors
    public Withdraw() {}
    
    public Withdraw(Restaurant restaurant) {
        this.restaurant = restaurant;
        // Don't set restaurantId manually when using @MapsId
    }
    
    // Getters and Setters
    public String getRestaurantId() { return restaurantId; }
    public void setRestaurantId(String restaurantId) { this.restaurantId = restaurantId; }
    
    public Restaurant getRestaurant() { return restaurant; }
    public void setRestaurant(Restaurant restaurant) { 
        this.restaurant = restaurant;
        // With @MapsId, the restaurantId will be set automatically
    }
    
    public String getWithdrawDescription() { return withdrawDescription; }
    public void setWithdrawDescription(String withdrawDescription) { this.withdrawDescription = withdrawDescription; }
    
    public String getWithdrawStatus() { return withdrawStatus; }
    public void setWithdrawStatus(String withdrawStatus) { this.withdrawStatus = withdrawStatus; }
    
    public String getDenyReason() { return denyReason; }
    public void setDenyReason(String denyReason) { this.denyReason = denyReason; }
    
    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }
    
    public LocalDateTime getDecisionAt() { return decisionAt; }
    public void setDecisionAt(LocalDateTime decisionAt) { this.decisionAt = decisionAt; }
}