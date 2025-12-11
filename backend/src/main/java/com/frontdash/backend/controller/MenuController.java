package com.frontdash.backend.controller;

import com.frontdash.backend.entity.MenuItem;
import com.frontdash.backend.service.MenuService;
import com.frontdash.backend.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin(origins = "http://localhost:5173")
public class MenuController {

    @Autowired
    private MenuService menuService;
    @Autowired
    private MenuItemRepository menuRepository;

    // Get all menu items for a restaurant
    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<MenuItem>> getMenuByRestaurant(@PathVariable String restaurantId) {
        List<MenuItem> menuItems = menuService.getMenuByRestaurant(restaurantId);
        return ResponseEntity.ok(menuItems);
    }

    // Get a specific menu item
    @GetMapping("/{menuItemId}")
    public ResponseEntity<MenuItem> getMenuItem(@PathVariable String menuItemId) {
        Optional<MenuItem> menuItem = menuService.getMenuItem(menuItemId);
        return menuItem.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }

    // Create a new menu item
    @PostMapping("/restaurant/{restaurantId}")
    public ResponseEntity<MenuItem> createMenuItem(
            @PathVariable String restaurantId,
            @RequestBody MenuItem menuItem) {
        
        try {
            MenuItem createdItem = menuService.createMenuItem(restaurantId, menuItem);
            return ResponseEntity.ok(createdItem);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Update a menu item
    @PutMapping("/{menuItemId}")
    public ResponseEntity<MenuItem> updateMenuItem(
            @PathVariable String menuItemId,
            @RequestBody MenuItem menuItemDetails) {
        
        try {
            MenuItem updatedItem = menuService.updateMenuItem(menuItemId, menuItemDetails);
            return ResponseEntity.ok(updatedItem);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete a menu item
    @DeleteMapping("/{menuItemId}")
    public ResponseEntity<String> deleteMenuItem(@PathVariable String menuItemId) {
        try {
            menuService.deleteMenuItem(menuItemId);
            return ResponseEntity.ok("Menu item deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting menu item: " + e.getMessage());
        }
    }

    // Toggle menu item availability
    @PatchMapping("/{menuItemId}/availability")
    public ResponseEntity<MenuItem> toggleAvailability(@PathVariable String menuItemId) {
        Optional<MenuItem> updatedItem = menuService.toggleAvailability(menuItemId);
        return updatedItem.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
    }

    // Set menu item availability
    @PutMapping("/{menuItemId}/availability")
    public ResponseEntity<MenuItem> setAvailability(
            @PathVariable String menuItemId,
            @RequestBody Map<String, Boolean> request) {
        
        Boolean isAvailable = request.get("available");
        Optional<MenuItem> updatedItem = menuService.setAvailability(menuItemId, isAvailable);
        
        return updatedItem.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
    }

    // Update menu item image
    @PutMapping("/{menuItemId}/image")
    public ResponseEntity<MenuItem> updateMenuItemImage(
            @PathVariable String menuItemId,
            @RequestBody Map<String, String> request) {
        
        String imageRef = request.get("imageRef");
        Optional<MenuItem> updatedItem = menuService.updateMenuItemImage(menuItemId, imageRef);
        
        return updatedItem.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
    }

    // Remove menu item image
    @DeleteMapping("/{menuItemId}/image")
    public ResponseEntity<MenuItem> removeMenuItemImage(@PathVariable String menuItemId) {
        Optional<MenuItem> updatedItem = menuService.removeMenuItemImage(menuItemId);
        return updatedItem.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
    }

    // Get menu categories for a restaurant
    @GetMapping("/restaurant/{restaurantId}/categories")
    public ResponseEntity<List<String>> getCategories(@PathVariable String restaurantId) {
        try {
            List<String> categories = menuService.getCategoriesByRestaurant(restaurantId);
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}