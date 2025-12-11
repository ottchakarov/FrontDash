package com.frontdash.backend.service;

import com.frontdash.backend.entity.MenuItem;
import com.frontdash.backend.entity.Restaurant;
import com.frontdash.backend.repository.MenuItemRepository;
import com.frontdash.backend.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class MenuService {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    // Menu item CRUD operations
    public List<MenuItem> getMenuByRestaurant(String restaurantId) {
        return menuItemRepository.findByRestaurantId(restaurantId);
    }

    public List<MenuItem> getAvailableMenuByRestaurant(String restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
            .orElseThrow(() -> new RuntimeException("Restaurant not found with id: " + restaurantId));
        return menuItemRepository.findByRestaurantAndIsAvailableTrue(restaurant);
    }

    public Optional<MenuItem> getMenuItem(String menuItemId) {
        return menuItemRepository.findById(menuItemId);
    }

    public MenuItem createMenuItem(String restaurantId, MenuItem menuItem) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
            .orElseThrow(() -> new RuntimeException("Restaurant not found with id: " + restaurantId));
        
        menuItem.setRestaurant(restaurant);
        return menuItemRepository.save(menuItem);
    }

    public MenuItem updateMenuItem(String menuItemId, MenuItem menuItemDetails) {
        System.out.println("--- UPDATE REQUEST RECEIVED ---");
        System.out.println("Updating Item ID: " + menuItemId);
        System.out.println("New Name: " + menuItemDetails.getFoodName());
        System.out.println("New Price: " + menuItemDetails.getPrice());
        System.out.println("New Desc: " + menuItemDetails.getFoodDescription());

        return menuItemRepository.findById(menuItemId).map(menuItem -> {
            
            // 1. Force the Update (Remove the 'if null' checks for main fields to verify connection)
            // If these print "null" in your logs, we know the JSON mapping is broken.
            if (menuItemDetails.getFoodName() != null) {
                menuItem.setFoodName(menuItemDetails.getFoodName());
            } else {
                System.out.println("WARNING: FoodName was NULL. Mapping issue?");
            }

            if (menuItemDetails.getPrice() != null) {
                menuItem.setPrice(menuItemDetails.getPrice());
            }

            if (menuItemDetails.getFoodDescription() != null) {
                menuItem.setFoodDescription(menuItemDetails.getFoodDescription());
            }
            
            // Update other fields safely
            if (menuItemDetails.getCategory() != null) menuItem.setCategory(menuItemDetails.getCategory());
            if (menuItemDetails.getAllergens() != null) menuItem.setAllergens(menuItemDetails.getAllergens());
            if (menuItemDetails.getIsAvailable() != null) menuItem.setIsAvailable(menuItemDetails.getIsAvailable());
            if (menuItemDetails.getItemPictureRef() != null) menuItem.setItemPictureRef(menuItemDetails.getItemPictureRef());
            
            System.out.println("--- SAVING TO DB ---");
            return menuItemRepository.save(menuItem);
        }).orElseThrow(() -> new RuntimeException("Menu item not found with id: " + menuItemId));
    }

    public void deleteMenuItem(String menuItemId) {
        menuItemRepository.deleteById(menuItemId);
    }

    // Availability operations
    public Optional<MenuItem> toggleAvailability(String menuItemId) {
        return menuItemRepository.findById(menuItemId).map(menuItem -> {
            menuItem.setIsAvailable(!menuItem.getIsAvailable());
            return menuItemRepository.save(menuItem);
        });
    }

    public Optional<MenuItem> setAvailability(String menuItemId, boolean isAvailable) {
        return menuItemRepository.findById(menuItemId).map(menuItem -> {
            menuItem.setIsAvailable(isAvailable);
            return menuItemRepository.save(menuItem);
        });
    }

    // Category operations
    public List<MenuItem> getMenuByCategory(String restaurantId, String category) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
            .orElseThrow(() -> new RuntimeException("Restaurant not found with id: " + restaurantId));
        return menuItemRepository.findByRestaurantAndCategory(restaurant, category);
    }

    public List<String> getCategoriesByRestaurant(String restaurantId) {
        return menuItemRepository.findByRestaurantId(restaurantId).stream()
            .map(MenuItem::getCategory)
            .distinct()
            .toList();
    }

    // Search operations
    public List<MenuItem> searchMenuItems(String restaurantId, String searchTerm) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
            .orElseThrow(() -> new RuntimeException("Restaurant not found with id: " + restaurantId));
        return menuItemRepository.findByRestaurantAndFoodNameContainingIgnoreCase(restaurant, searchTerm);
    }

    // Image operations
    public Optional<MenuItem> updateMenuItemImage(String menuItemId, String imageRef) {
        return menuItemRepository.findById(menuItemId).map(menuItem -> {
            menuItem.setItemPictureRef(imageRef);
            return menuItemRepository.save(menuItem);
        });
    }

    public Optional<MenuItem> removeMenuItemImage(String menuItemId) {
        return menuItemRepository.findById(menuItemId).map(menuItem -> {
            menuItem.setItemPictureRef(null);
            return menuItemRepository.save(menuItem);
        });
    }
}