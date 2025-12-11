package com.frontdash.backend.service;

import com.frontdash.backend.entity.*; // Imports CreateOrderRequest from entity package
import com.frontdash.backend.repository.DriverJpaRepository;
import com.frontdash.backend.repository.OrderRepository;
import com.frontdash.backend.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private DriverJpaRepository driverRepository;

    @Transactional
    public Order createOrder(CreateOrderRequest req) {
        Order order = new Order();
        
        // 1. Generate ID and Basic Info
        order.setOrderId("ord-" + UUID.randomUUID().toString().substring(0, 8));
        order.setOrderDate(LocalDateTime.now());
        order.setOrderStatus("PENDING");
        
        // 2. Map Contact & Financials
        if (req.contact != null) {
            order.setCustomerName(req.contact.name);
        }
        if (req.financials != null) {
            order.setTotalAmount(req.financials.total);
        }
        
        // 3. Map Address
        if (req.delivery != null) {
            String fullAddress = req.delivery.building + " " + req.delivery.street + ", " + req.delivery.city;
            order.setDeliveryAddress(fullAddress);
        }

        // 4. Link Restaurant
        Restaurant restaurant = restaurantRepository.findById(req.restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        order.setRestaurant(restaurant);

        // 5. Add Items (Crucial for Staff to see what to cook!)
        if (req.items != null) {
            for (CreateOrderRequest.ItemInfo itemInfo : req.items) {
                // Ensure OrderItem entity exists and has this constructor
                OrderItem item = new OrderItem(itemInfo.name, itemInfo.quantity, itemInfo.price);
                order.addItem(item);
            }
        }

        return orderRepository.save(order);
    }

    public List<Order> getPendingOrders() {
        return orderRepository.findByOrderStatus("PENDING");
    }

    public String buildOrderSummary(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("MM-dd-yyyy");
        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("h:mm a");

        StringBuilder sb = new StringBuilder();

        sb.append("Restaurant: ")
          .append(order.getRestaurant().getRestaurantName())
          .append("\n");

        sb.append("Order date: ")
          .append(order.getOrderDate().toLocalDate().format(dateFmt))
          .append("\n");

        sb.append("Time of order: ")
          .append(order.getOrderDate().toLocalTime().truncatedTo(ChronoUnit.MINUTES).format(timeFmt))
          .append("\n");

        sb.append("Estimated delivery time: ")
          .append(order.getOrderDate().plusMinutes(40)
                  .toLocalTime().truncatedTo(ChronoUnit.MINUTES)
                  .format(timeFmt))
          .append("\n\n");

        sb.append("Items:\n");
        for (OrderItem item : order.getItems()) {
            sb.append("- ")
              .append(item.getFoodName())
              .append(" x")
              .append(item.getQuantity())
              .append(" ($")
              .append(String.format("%.2f", item.getPrice()))
              .append(")\n");
        }

        sb.append("\nTotal: $")
          .append(String.format("%.2f", order.getTotalAmount()));

        return sb.toString();
    }

    @Transactional
    public Order assignDriver(String orderId, String driverId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        order.setDriver(driver);
        driver.setAssignedToOrder(Boolean.TRUE);
        order.setOrderStatus("ASSIGNED");
        return orderRepository.save(order);
    }

    @Transactional
    public Order markDelivered(DeliverRequest req) {
        Order order = orderRepository.findById(req.orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + req.orderId));

        order.setOrderStatus("DELIVERED");
        return orderRepository.save(order);
    }
}
