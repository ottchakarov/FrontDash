package com.frontdash.backend.service;

import com.frontdash.backend.entity.Restaurant;
import com.frontdash.backend.repository.MenuItemRepository;
import com.frontdash.backend.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class StatisticsService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private WithdrawalService withdrawalService;

    public Map<String, Object> getRestaurantStatistics(String restaurantId) {
        Map<String, Object> stats = new HashMap<>();
        
        // Basic restaurant info
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
            .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        
        // Menu statistics
        long totalMenuItems = menuItemRepository.countByRestaurant(restaurant);
        long availableMenuItems = menuItemRepository.findByRestaurantAndIsAvailableTrue(restaurant).size();
        
        // Withdrawal status
        String withdrawalStatus = withdrawalService.getWithdrawalStatus(restaurantId);
        
        // Populate stats (you can add more real stats from your database)
        stats.put("restaurantName", restaurant.getRestaurantName());
        stats.put("totalMenuItems", totalMenuItems);
        stats.put("availableMenuItems", availableMenuItems);
        stats.put("withdrawalStatus", withdrawalStatus);
        stats.put("forceClosed", restaurant.getForceClosed());
        
        // Placeholder statistics (replace with real data from your stats tables)
        stats.put("totalOrders", 150);
        stats.put("revenue", 12500.00);
        stats.put("popularItem", "Margherita Pizza");
        stats.put("customerRating", 4.5);
        
        return stats;
    }
}