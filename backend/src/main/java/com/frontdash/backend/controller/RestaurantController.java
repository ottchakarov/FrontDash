package com.frontdash.backend.controller;

import com.frontdash.backend.entity.Restaurant;
import com.frontdash.backend.entity.RestaurantHours;
import com.frontdash.backend.service.RestaurantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/restaurants")
@CrossOrigin(origins = "http://localhost:5173")
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    // Get restaurant by ID (for account settings)
    @GetMapping("/{restaurantId}")
    public ResponseEntity<Restaurant> getRestaurant(@PathVariable String restaurantId) {
        Optional<Restaurant> restaurant = restaurantService.getRestaurantById(restaurantId);
        return restaurant.map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build());
    }

    // Update restaurant contact info (phone, email, contact person)
    @PutMapping("/{restaurantId}/contact-info")
    public ResponseEntity<Restaurant> updateContactInfo(
            @PathVariable String restaurantId,
            @RequestBody Map<String, String> contactInfo) {
        
        String phone = contactInfo.get("phone");
        String email = contactInfo.get("email");
        String contactPerson = contactInfo.get("contactPerson");
        
        Optional<Restaurant> updatedRestaurant = restaurantService.updateContactInfo(
            restaurantId, phone, email, contactPerson);
        
        return updatedRestaurant.map(ResponseEntity::ok)
                              .orElse(ResponseEntity.notFound().build());
    }

    // Update restaurant address
    @PutMapping("/{restaurantId}/address")
    public ResponseEntity<Restaurant> updateAddress(
            @PathVariable String restaurantId,
            @RequestBody Map<String, String> address) {
        
        Optional<Restaurant> updatedRestaurant = restaurantService.updateAddress(
            restaurantId,
            address.get("street"),
            address.get("city"),
            address.get("state"),
            address.get("zip")
        );
        
        return updatedRestaurant.map(ResponseEntity::ok)
                              .orElse(ResponseEntity.notFound().build());
    }

    // Get operating hours for a restaurant
    @GetMapping("/{restaurantId}/hours")
    public ResponseEntity<List<RestaurantHours>> getOperatingHours(@PathVariable String restaurantId) {
        List<RestaurantHours> hours = restaurantService.getOperatingHours(restaurantId);
        return ResponseEntity.ok(hours);
    }

    // Update operating hours (replace all hours)
    @PutMapping("/{restaurantId}/hours")
    public ResponseEntity<String> updateOperatingHours(
            @PathVariable String restaurantId,
            @RequestBody List<RestaurantHours> hoursList) {
        
        try {
            restaurantService.saveAllOperatingHours(restaurantId, hoursList);
            return ResponseEntity.ok("Operating hours updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating operating hours: " + e.getMessage());
        }
    }

    // Update profile picture
    @PutMapping("/{restaurantId}/profile-picture")
    public ResponseEntity<Restaurant> updateProfilePicture(
            @PathVariable String restaurantId,
            @RequestBody Map<String, String> request) {
        
        String pictureRef = request.get("pictureRef");
        Optional<Restaurant> updatedRestaurant = restaurantService.updateProfilePicture(restaurantId, pictureRef);
        
        return updatedRestaurant.map(ResponseEntity::ok)
                              .orElse(ResponseEntity.notFound().build());
    }

    // Remove profile picture
    @DeleteMapping("/{restaurantId}/profile-picture")
    public ResponseEntity<Restaurant> removeProfilePicture(@PathVariable String restaurantId) {
        Optional<Restaurant> updatedRestaurant = restaurantService.removeProfilePicture(restaurantId);
        return updatedRestaurant.map(ResponseEntity::ok)
                              .orElse(ResponseEntity.notFound().build());
    }

    // --- ADD THIS METHOD ---
    @GetMapping
    public ResponseEntity<Iterable<Restaurant>> getAllRestaurants() {
        // This requires a corresponding getAllRestaurants() method in your Service
        return ResponseEntity.ok(restaurantService.getAllRestaurants());
    }
    // Get restaurant settings (combined endpoint for frontend)
    @GetMapping("/{restaurantId}/settings")
    public ResponseEntity<Map<String, Object>> getRestaurantSettings(@PathVariable String restaurantId) {
        Optional<Restaurant> restaurant = restaurantService.getRestaurantWithOperatingHours(restaurantId);
        
        if (restaurant.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Restaurant rest = restaurant.get();
        Map<String, Object> settings = Map.of(
            "restaurant", rest,
            "operatingHours", rest.getOperatingHours()
        );

        return ResponseEntity.ok(settings);
    }
}