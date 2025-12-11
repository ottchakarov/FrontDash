package com.frontdash.backend.controller;

import com.frontdash.backend.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
@CrossOrigin(origins = "http://localhost:5173")
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    // Get restaurant statistics for the home/dashboard page
    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<Map<String, Object>> getRestaurantStatistics(@PathVariable String restaurantId) {
        try {
            Map<String, Object> stats = statisticsService.getRestaurantStatistics(restaurantId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}