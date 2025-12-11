package com.frontdash.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore; // <--- 1. NEW IMPORT
import java.util.List;

@Entity
@Table(name = "restaurants")
public class Restaurant {
    @Id
    @Column(name = "restaurant_id")
    private String restaurantId;
    
    @Column(name = "owner_id")
    private String ownerId;
    
    @Column(name = "restaurant_name", nullable = false)
    private String restaurantName;
    
    @Column(name = "cuisine_type")
    private String cuisineType;
    
    @Column(nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String phone;
    
    @Column(name = "human_contact_name")
    private String humanContactName;
    
    private String street;
    private String city;
    private String state;
    private String zip;
    
    @Column(name = "force_closed")
    private Boolean forceClosed = false;
    
    @Column(name = "profile_picture_ref")
    private String profilePictureRef;
    
    // Relationships - STOP THE INFINITE LOOP HERE
    
    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore // <--- 2. ADD THIS
    private List<RestaurantHours> operatingHours;
    
    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore // <--- 3. ADD THIS
    private List<MenuItem> menuItems;
    
    @OneToOne(mappedBy = "restaurant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore // <--- 4. ADD THIS
    private Withdraw withdrawRequest;
    
    // Constructors
    public Restaurant() {}
    
    public Restaurant(String restaurantId, String restaurantName, String email, String phone) {
        this.restaurantId = restaurantId;
        this.restaurantName = restaurantName;
        this.email = email;
        this.phone = phone;
    }
    
    // Getters and Setters
    public String getRestaurantId() { return restaurantId; }
    public void setRestaurantId(String restaurantId) { this.restaurantId = restaurantId; }
    
    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }
    
    public String getRestaurantName() { return restaurantName; }
    public void setRestaurantName(String restaurantName) { this.restaurantName = restaurantName; }
    
    public String getCuisineType() { return cuisineType; }
    public void setCuisineType(String cuisineType) { this.cuisineType = cuisineType; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public String getHumanContactName() { return humanContactName; }
    public void setHumanContactName(String humanContactName) { this.humanContactName = humanContactName; }
    
    public String getStreet() { return street; }
    public void setStreet(String street) { this.street = street; }
    
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    
    public String getZip() { return zip; }
    public void setZip(String zip) { this.zip = zip; }
    
    public Boolean getForceClosed() { return forceClosed; }
    public void setForceClosed(Boolean forceClosed) { this.forceClosed = forceClosed; }
    
    public String getProfilePictureRef() { return profilePictureRef; }
    public void setProfilePictureRef(String profilePictureRef) { this.profilePictureRef = profilePictureRef; }
    
    public List<RestaurantHours> getOperatingHours() { return operatingHours; }
    public void setOperatingHours(List<RestaurantHours> operatingHours) { this.operatingHours = operatingHours; }
    
    public List<MenuItem> getMenuItems() { return menuItems; }
    public void setMenuItems(List<MenuItem> menuItems) { this.menuItems = menuItems; }
    
    public Withdraw getWithdrawRequest() { return withdrawRequest; }
    public void setWithdrawRequest(Withdraw withdrawRequest) { this.withdrawRequest = withdrawRequest; }
}