package com.frontdash.backend.controller;

import com.frontdash.backend.entity.*;
import com.frontdash.backend.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin
public class OrderController {
    private final OrderService service;
    public OrderController(OrderService service) { this.service = service; }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateOrderRequest req) {
        var list = service.create(
                req.restaurantId, req.staffId, req.subtotal, req.tax, req.deliveryFee,
                req.street, req.city, req.state, req.zip
        );
        return ResponseEntity.ok(list);
    }

    @PostMapping("/assign-driver")
    public ResponseEntity<?> assign(@RequestBody AssignDriverRequest req) {
        return ResponseEntity.ok(service.assignDriver(req.orderId, req.driverId));
    }

    @PostMapping("/deliver")
    public ResponseEntity<?> deliver(@RequestBody DeliverRequest req) {
        LocalDateTime when = (req.deliveredAt == null || req.deliveredAt.isBlank())
                ? LocalDateTime.now()
                : LocalDateTime.parse(req.deliveredAt);
        return ResponseEntity.ok(service.deliver(req.orderId, when));
    }
}
