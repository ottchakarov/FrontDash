package com.frontdash.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class Staff {
    @Id
    @Column(name = "user_id")
    private String userId;
    
    @Column(name = "role_id", nullable = false)
    private Integer roleId;

    @Column(name = "first_name", nullable = false)
    private String firstName;
    
    @Column(name = "last_name", nullable = false)
    private String lastName;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    private String phone;

    @Column(name = "active")
    private Byte active = 1;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    // Constructors
    public Staff() {}
    
    public Staff(String userId, String firstName, String lastName, String email, Integer roleId) {
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.roleId = roleId;
    }
    
    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    // Backwards compatibility helpers
    @Transient
    public String getStaffId() { return userId; }
    @Transient
    public void setStaffId(String staffId) { this.userId = staffId; }
    
    public Integer getRoleId() { return roleId; }
    public void setRoleId(Integer roleId) { this.roleId = roleId; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Byte getActiveFlag() { return active; }
    public void setActiveFlag(Byte active) { this.active = active; }
    @Transient
    public boolean isActive() { return active != null && active != 0; }
    public void setActive(Boolean active) { this.active = (byte) (Boolean.TRUE.equals(active) ? 1 : 0); }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
