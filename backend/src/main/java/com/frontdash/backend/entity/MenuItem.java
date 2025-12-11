package com.frontdash.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty; // <--- 1. NEW IMPORT
import java.math.BigDecimal;

@Entity
@Table(name = "menu_items")
public class MenuItem {
    @Id
    @Column(name = "menu_item_id")
    @JsonProperty("id") // <--- 2. RENAME "menuItemId" to "id"
    private String menuItemId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    @JsonIgnore 
    private Restaurant restaurant;
    
    private String category;
    
    @Column(name = "food_name", nullable = false)
    @JsonProperty("name") // <--- 3. RENAME "foodName" to "name"
    private String foodName;
    
    @Column(name = "food_description", columnDefinition = "TEXT")
    @JsonProperty("description") // <--- 4. RENAME "foodDescription" to "description"
    private String foodDescription;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price; // Price matches, no change needed
    
    @Column(name = "is_available")
    @JsonProperty("available") // <--- 5. RENAME "isAvailable" to "available"
    private Boolean isAvailable = true;
    
    @Column(name = "item_picture_ref")
    private String itemPictureRef;
    
    @Column(columnDefinition = "TEXT")
    private String allergens;
    
    // Constructors
    public MenuItem() {}
    
    public MenuItem(String menuItemId, Restaurant restaurant, String foodName, BigDecimal price) {
        this.menuItemId = menuItemId;
        this.restaurant = restaurant;
        this.foodName = foodName;
        this.price = price;
    }
    
    // Getters and Setters
    public String getMenuItemId() { return menuItemId; }
    public void setMenuItemId(String menuItemId) { this.menuItemId = menuItemId; }
    
    public Restaurant getRestaurant() { return restaurant; }
    public void setRestaurant(Restaurant restaurant) { this.restaurant = restaurant; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public String getFoodName() { return foodName; }
    public void setFoodName(String foodName) { this.foodName = foodName; }
    
    public String getFoodDescription() { return foodDescription; }
    public void setFoodDescription(String foodDescription) { this.foodDescription = foodDescription; }
    
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    
    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }
    
    public String getItemPictureRef() { return itemPictureRef; }
    public void setItemPictureRef(String itemPictureRef) { this.itemPictureRef = itemPictureRef; }
    
    public String getAllergens() { return allergens; }
    public void setAllergens(String allergens) { this.allergens = allergens; }
}