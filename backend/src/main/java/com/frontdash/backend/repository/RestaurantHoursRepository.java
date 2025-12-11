package com.frontdash.backend.repository;

import com.frontdash.backend.entity.Restaurant;
import com.frontdash.backend.entity.RestaurantHours;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantHoursRepository extends JpaRepository<RestaurantHours, Long> {
    
    // Find all operating hours for a restaurant
    List<RestaurantHours> findByRestaurant(Restaurant restaurant);
    
    // Find operating hours for a restaurant by weekday
    Optional<RestaurantHours> findByRestaurantAndWeekday(Restaurant restaurant, Integer weekday);
    
    // Find all operating hours for a restaurant by restaurant ID
    @Query("SELECT rh FROM RestaurantHours rh WHERE rh.restaurant.restaurantId = :restaurantId")
    List<RestaurantHours> findByRestaurantId(@Param("restaurantId") String restaurantId);
    
    // Delete all operating hours for a restaurant
    @Modifying
    @Query("DELETE FROM RestaurantHours rh WHERE rh.restaurant.restaurantId = :restaurantId")
    void deleteByRestaurantId(@Param("restaurantId") String restaurantId);
    
    // Check if operating hours exist for a restaurant and weekday
    boolean existsByRestaurantAndWeekday(Restaurant restaurant, Integer weekday);
}