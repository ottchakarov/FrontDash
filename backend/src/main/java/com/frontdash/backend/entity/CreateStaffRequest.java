package com.frontdash.backend.entity;

public class CreateStaffRequest {
    public String userId;
    public String firstName;
    public String lastName;
    public String email;
    public String phone;
    public Integer roleId = 0; // default staff role
    public String username;
}
