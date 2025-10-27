package com.frontdash.backend.entity;

public class CreateOrderRequest {
    public String restaurantId;
    public String staffId; // optional
    public double subtotal;
    public double tax;
    public double deliveryFee;
    public String street;
    public String city;
    public String state;
    public String zip;
}
