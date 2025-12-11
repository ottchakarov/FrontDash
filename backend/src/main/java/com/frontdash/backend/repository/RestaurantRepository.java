package com.frontdash.backend.repository;

import com.frontdash.backend.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, String> {
    
    // Find restaurant by owner ID
    Optional<Restaurant> findByOwnerId(String ownerId);
    
    // Find restaurants by name (partial match)
    List<Restaurant> findByRestaurantNameContainingIgnoreCase(String name);
    
    // Find restaurants by cuisine type
    List<Restaurant> findByCuisineType(String cuisineType);
    
    // Find restaurants by city
    List<Restaurant> findByCity(String city);
    
    // Check if restaurant exists by email
    boolean existsByEmail(String email);
    
    // Custom query to find restaurant with operating hours
    @Query("SELECT r FROM Restaurant r LEFT JOIN FETCH r.operatingHours WHERE r.restaurantId = :restaurantId")
    Optional<Restaurant> findByIdWithOperatingHours(@Param("restaurantId") String restaurantId);
    
    // Custom query to find restaurant with menu items
    @Query("SELECT r FROM Restaurant r LEFT JOIN FETCH r.menuItems WHERE r.restaurantId = :restaurantId")
    Optional<Restaurant> findByIdWithMenuItems(@Param("restaurantId") String restaurantId);
}