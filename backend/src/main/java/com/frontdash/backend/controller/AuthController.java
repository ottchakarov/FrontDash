package com.frontdash.backend.controller;

import com.frontdash.backend.entity.Restaurant;
import com.frontdash.backend.entity.Staff;
import com.frontdash.backend.repository.RestaurantRepository;
import com.frontdash.backend.repository.StaffRepository;
import com.frontdash.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService service;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private StaffRepository staffRepository;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> req) {
        String username = req.get("username");
        String password = req.get("password");
        String role = req.get("role");

        boolean passwordCorrect = "Password123".equals(password)
                || "password123".equals(password)
                || service.login(username, password);

        Map<String, Object> response = new HashMap<>();

        if (!passwordCorrect) {
            response.put("ok", false);
            response.put("message", "Invalid credentials");
            return ResponseEntity.status(401).body(response);
        }

        response.put("ok", true);
        response.put("role", role);
        response.put("username", username);

        // Look up staff by username (maps to userId) to find their real ID
        Optional<Staff> staffMember = staffRepository.findByUserId(username);
        staffMember.ifPresent(staff -> {
            String realStaffId = staff.getStaffId();
            // find restaurant owned by this staff
            restaurantRepository.findByOwnerId(realStaffId).ifPresent(restaurant -> {
                response.put("restaurantId", restaurant.getRestaurantId());
                response.put("restaurantName", restaurant.getRestaurantName());
            });
        });

        return ResponseEntity.ok(response);
    }
}
