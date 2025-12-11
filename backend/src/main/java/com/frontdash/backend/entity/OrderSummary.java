package com.frontdash.backend.entity;

import java.time.LocalDateTime;

public class OrderSummary {
    private String orderId;
    private String restaurantId;
    private String driverId;
    private String status;
    private double total;
    private LocalDateTime placedAt;
    private LocalDateTime deliveredAt;

    public OrderSummary() {}
    public OrderSummary(String orderId, String restaurantId, String driverId,
                        String status, double total, LocalDateTime placedAt, LocalDateTime deliveredAt) {
        this.orderId = orderId;
        this.restaurantId = restaurantId;
        this.driverId = driverId;
        this.status = status;
        this.total = total;
        this.placedAt = placedAt;
        this.deliveredAt = deliveredAt;
    }
    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
    public String getRestaurantId() { return restaurantId; }
    public void setRestaurantId(String restaurantId) { this.restaurantId = restaurantId; }
    public String getDriverId() { return driverId; }
    public void setDriverId(String driverId) { this.driverId = driverId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }
    public LocalDateTime getPlacedAt() { return placedAt; }
    public void setPlacedAt(LocalDateTime placedAt) { this.placedAt = placedAt; }
    public LocalDateTime getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(LocalDateTime deliveredAt) { this.deliveredAt = deliveredAt; }
}
