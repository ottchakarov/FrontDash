package com.frontdash.backend.repository;

import com.frontdash.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    // JpaRepository gives us .save(), .findById(), .findAll() automatically!
    
    // We can add a helper to find orders by restaurant (for the Staff Dashboard later)
    List<Order> findByRestaurantRestaurantId(String restaurantId);
    
    // We can add a helper to find pending orders
    List<Order> findByOrderStatus(String status);
}