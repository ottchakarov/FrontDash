package com.frontdash.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "drivers")
public class Driver {
    @Id
    @Column(name = "driver_id")
    private String driverId;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "assigned_to_order", columnDefinition = "TINYINT(1)")
    private Boolean assignedToOrder;

    @Column(name = "active", columnDefinition = "TINYINT(1)")
    private Boolean active;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Driver() {}

    public String getDriverId() { return driverId; }
    public void setDriverId(String driverId) { this.driverId = driverId; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public Boolean getAssignedToOrder() { return assignedToOrder; }
    public void setAssignedToOrder(Boolean assignedToOrder) { this.assignedToOrder = assignedToOrder; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
