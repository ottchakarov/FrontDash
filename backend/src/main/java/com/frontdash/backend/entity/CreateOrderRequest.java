package com.frontdash.backend.entity;

import java.util.List;

public class CreateOrderRequest {
    // These fields match the JSON sent from Checkout.jsx
    public String restaurantId;
    public String restaurantName;
    
    public ContactInfo contact;
    public AddressInfo delivery;
    public FinancialInfo financials;
    public List<ItemInfo> items; 

    // Inner classes to handle the nested JSON objects
    public static class ContactInfo {
        public String name;
        public String email;
        public String phone;
    }

    public static class AddressInfo {
        public String building;
        public String street;
        public String city;
        public String state;
    }

    public static class FinancialInfo {
        public Double subtotal;
        public Double tax;
        public Double fees; 
        public Double total;
    }

    public static class ItemInfo {
        public String id; // Menu Item ID
        public String name;
        public Integer quantity;
        public Double price;
    }
}