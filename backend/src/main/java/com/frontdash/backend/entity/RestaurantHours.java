package com.frontdash.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "restaurant_hours", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"restaurant_id", "weekday"})
})
public class RestaurantHours {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "hours_id")
    private Long hoursId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;
    
    @Column(nullable = false)
    private Integer weekday; // 0-6 (Sunday-Saturday)
    
    @Column(name = "opens_at")
    private java.sql.Time opensAt;
    
    @Column(name = "closes_at")
    private java.sql.Time closesAt;
    
    @Column(name = "is_closed")
    private Boolean isClosed = false;
    
    // Constructors
    public RestaurantHours() {}
    
    public RestaurantHours(Restaurant restaurant, Integer weekday) {
        this.restaurant = restaurant;
        this.weekday = weekday;
    }
    
    // Getters and Setters
    public Long getHoursId() { return hoursId; }
    public void setHoursId(Long hoursId) { this.hoursId = hoursId; }
    
    public Restaurant getRestaurant() { return restaurant; }
    public void setRestaurant(Restaurant restaurant) { this.restaurant = restaurant; }
    
    public Integer getWeekday() { return weekday; }
    public void setWeekday(Integer weekday) { this.weekday = weekday; }
    
    public java.sql.Time getOpensAt() { return opensAt; }
    public void setOpensAt(java.sql.Time opensAt) { this.opensAt = opensAt; }
    
    public java.sql.Time getClosesAt() { return closesAt; }
    public void setClosesAt(java.sql.Time closesAt) { this.closesAt = closesAt; }
    
    public Boolean getIsClosed() { return isClosed; }
    public void setIsClosed(Boolean isClosed) { this.isClosed = isClosed; }
}