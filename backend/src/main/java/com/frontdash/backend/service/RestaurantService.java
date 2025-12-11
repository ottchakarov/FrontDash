package com.frontdash.backend.service;

import com.frontdash.backend.entity.Restaurant;
import com.frontdash.backend.entity.RestaurantHours;
import com.frontdash.backend.repository.RestaurantRepository;
import com.frontdash.backend.repository.RestaurantHoursRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
@Transactional
public class RestaurantService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private RestaurantHoursRepository restaurantHoursRepository;

    // Restaurant CRUD operations
    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }

    public Optional<Restaurant> getRestaurantById(String restaurantId) {
        return restaurantRepository.findById(restaurantId);
    }

    public Optional<Restaurant> getRestaurantWithOperatingHours(String restaurantId) {
        return restaurantRepository.findByIdWithOperatingHours(restaurantId);
    }

    public Restaurant saveRestaurant(Restaurant restaurant) {
        return restaurantRepository.save(restaurant);
    }

    public void deleteRestaurant(String restaurantId) {
        restaurantRepository.deleteById(restaurantId);
    }

    // Restaurant contact info operations (for AccountSettings page)
    public Optional<Restaurant> updateContactInfo(String restaurantId, String phone, String email, String contactPerson) {
        return restaurantRepository.findById(restaurantId).map(restaurant -> {
            if (phone != null) restaurant.setPhone(phone);
            if (email != null) restaurant.setEmail(email);
            if (contactPerson != null) restaurant.setHumanContactName(contactPerson);
            return restaurantRepository.save(restaurant);
        });
    }

    public Optional<Restaurant> updateAddress(String restaurantId, String street, String city, String state, String zip) {
        return restaurantRepository.findById(restaurantId).map(restaurant -> {
            if (street != null) restaurant.setStreet(street);
            if (city != null) restaurant.setCity(city);
            if (state != null) restaurant.setState(state);
            if (zip != null) restaurant.setZip(zip);
            return restaurantRepository.save(restaurant);
        });
    }

    // Operating hours operations
    public List<RestaurantHours> getOperatingHours(String restaurantId) {
        return restaurantHoursRepository.findByRestaurantId(restaurantId);
    }

    public RestaurantHours saveOperatingHours(String restaurantId, RestaurantHours hours) {
        return restaurantRepository.findById(restaurantId).map(restaurant -> {
            hours.setRestaurant(restaurant);
            return restaurantHoursRepository.save(hours);
        }).orElseThrow(() -> new RuntimeException("Restaurant not found with id: " + restaurantId));
    }

    public void saveAllOperatingHours(String restaurantId, List<RestaurantHours> hoursList) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
            .orElseThrow(() -> new RuntimeException("Restaurant not found with id: " + restaurantId));
        
        // Get existing hours
        List<RestaurantHours> existingHours = restaurantHoursRepository.findByRestaurantId(restaurantId);
        Map<Integer, RestaurantHours> existingHoursByWeekday = existingHours.stream()
            .collect(Collectors.toMap(RestaurantHours::getWeekday, Function.identity()));
    
        for (RestaurantHours newHours : hoursList) {
            RestaurantHours existing = existingHoursByWeekday.get(newHours.getWeekday());
            if (existing != null) {
                // Update existing
                existing.setOpensAt(newHours.getOpensAt());
                existing.setClosesAt(newHours.getClosesAt());
                existing.setIsClosed(newHours.getIsClosed());
                restaurantHoursRepository.save(existing);
            } else {
                // Create new
                RestaurantHours hours = new RestaurantHours();
               hours.setRestaurant(restaurant);
               hours.setWeekday(newHours.getWeekday());
                hours.setOpensAt(newHours.getOpensAt());
                hours.setClosesAt(newHours.getClosesAt());
                hours.setIsClosed(newHours.getIsClosed());
                restaurantHoursRepository.save(hours);
            }
        }
    
        // Delete hours for weekdays that are no longer in the list
        Set<Integer> newWeekdays = hoursList.stream()
            .map(RestaurantHours::getWeekday)
            .collect(Collectors.toSet());
    
        for (RestaurantHours existing : existingHours) {
            if (!newWeekdays.contains(existing.getWeekday())) {
                restaurantHoursRepository.delete(existing);
            }
        }
    }

    public void deleteOperatingHours(Long hoursId) {
        restaurantHoursRepository.deleteById(hoursId);
    }

    // Profile picture operations
    public Optional<Restaurant> updateProfilePicture(String restaurantId, String pictureRef) {
        return restaurantRepository.findById(restaurantId).map(restaurant -> {
            restaurant.setProfilePictureRef(pictureRef);
            return restaurantRepository.save(restaurant);
        });
    }

    public Optional<Restaurant> removeProfilePicture(String restaurantId) {
        return restaurantRepository.findById(restaurantId).map(restaurant -> {
            restaurant.setProfilePictureRef(null);
            return restaurantRepository.save(restaurant);
        });
    }
}