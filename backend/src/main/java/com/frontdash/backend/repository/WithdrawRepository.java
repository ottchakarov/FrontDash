package com.frontdash.backend.repository;

import com.frontdash.backend.entity.Withdraw;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WithdrawRepository extends JpaRepository<Withdraw, String> {
    
    // Find withdrawal request by restaurant ID
    Optional<Withdraw> findByRestaurantId(String restaurantId);
    
    // Find all pending withdrawal requests
    List<Withdraw> findByWithdrawStatus(String status);
    
    // Find pending withdrawal requests
    List<Withdraw> findByWithdrawStatusOrderByRequestedAtAsc(String status);
    
    // Check if a restaurant has a pending withdrawal request
    boolean existsByRestaurantIdAndWithdrawStatus(String restaurantId, String status);
    
    // Count withdrawal requests by status
    long countByWithdrawStatus(String status);
    
    // Custom query to find withdrawal requests with restaurant details
    @Query("SELECT w FROM Withdraw w JOIN FETCH w.restaurant WHERE w.withdrawStatus = :status")
    List<Withdraw> findByStatusWithRestaurant(@Param("status") String status);
}