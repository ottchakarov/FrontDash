package com.frontdash.backend.controller;

import com.frontdash.backend.entity.CreateOrderRequest;
import com.frontdash.backend.entity.DeliverRequest;
import com.frontdash.backend.entity.Order;
import com.frontdash.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/orders", "/orders"})
@CrossOrigin(origins = "http://localhost:5173") // <--- Ensure this matches your frontend port
public class OrderController {

    @Autowired
    private OrderService service;

    // --- 1. CREATE ORDER (Used by Checkout Page) ---
    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateOrderRequest req) {
        try {
            // This calls the new method we just wrote in OrderService
            Order newOrder = service.createOrder(req);
            return ResponseEntity.ok(newOrder);
        } catch (Exception e) {
            e.printStackTrace(); // Logs error to backend terminal
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // --- 2. STAFF DASHBOARD HELPERS ---
    @GetMapping("/queue")
    public List<Order> getQueue() {
        return service.getPendingOrders();
    }

    @GetMapping("/{orderId}/summary")
    public ResponseEntity<String> getSummary(@PathVariable String orderId) {
        return ResponseEntity.ok(service.buildOrderSummary(orderId));
    }

    // --- 3. SIMPLE ASSIGN/DELIVER STUBS ---
    public static class AssignDriverRequest { public String orderId; public String driverId; }

    @PostMapping("/assign-driver")
    public ResponseEntity<?> assignDriver(@RequestBody AssignDriverRequest req) {
        try {
            Order updated = service.assignDriver(req.orderId, req.driverId);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/deliver")
    public ResponseEntity<Order> deliver(@RequestBody DeliverRequest req) {
        return ResponseEntity.ok(service.markDelivered(req));
    }

    public static class EtaRequest { public int minutes; }

    @PostMapping("/{orderId}/eta")
    public ResponseEntity<Void> setEta(@PathVariable String orderId, @RequestBody EtaRequest body) {
        // For demo: ignore or persist if you add a column
        return ResponseEntity.ok().build();
    }
}
