package com.frontdash.backend.repository;

import com.frontdash.backend.entity.MenuItem;
import com.frontdash.backend.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, String> {
    
    // Find all menu items for a restaurant
    List<MenuItem> findByRestaurant(Restaurant restaurant);
    
    // Find all menu items for a restaurant by restaurant ID
    @Query("SELECT mi FROM MenuItem mi WHERE mi.restaurant.restaurantId = :restaurantId")
    List<MenuItem> findByRestaurantId(@Param("restaurantId") String restaurantId);
    
    // Find available menu items for a restaurant
    List<MenuItem> findByRestaurantAndIsAvailableTrue(Restaurant restaurant);
    
    // Find menu items by category for a restaurant
    List<MenuItem> findByRestaurantAndCategory(Restaurant restaurant, String category);
    
    // Find menu items by name (partial match) for a restaurant
    List<MenuItem> findByRestaurantAndFoodNameContainingIgnoreCase(Restaurant restaurant, String foodName);
    
    // Find available menu items by category
    List<MenuItem> findByRestaurantAndCategoryAndIsAvailableTrue(Restaurant restaurant, String category);
    
    // Count menu items for a restaurant
    long countByRestaurant(Restaurant restaurant);
    
    // Delete all menu items for a restaurant
    @Modifying
    @Query("DELETE FROM MenuItem mi WHERE mi.restaurant.restaurantId = :restaurantId")
    void deleteByRestaurantId(@Param("restaurantId") String restaurantId);
    
    // Update availability status for a menu item
    @Modifying
    @Query("UPDATE MenuItem mi SET mi.isAvailable = :isAvailable WHERE mi.menuItemId = :menuItemId")
    void updateAvailability(@Param("menuItemId") String menuItemId, @Param("isAvailable") Boolean isAvailable);

    // Stored procedure to create a menu item via DB procedure
    @Transactional
    @Modifying
    @Procedure(procedureName = "sp_owner_create_menu_item")
    void createMenuItem(@Param("p_restaurant_id") String restaurantId,
                        @Param("p_category") String category,
                        @Param("p_name") String name,
                        @Param("p_description") String description,
                        @Param("p_price") Double price,
                        @Param("p_available") Boolean available);
}
