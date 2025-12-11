package com.frontdash.backend.test;

import com.frontdash.backend.entity.*;
import com.frontdash.backend.repository.DriverJpaRepository;
import com.frontdash.backend.repository.MenuItemRepository;
import com.frontdash.backend.repository.RestaurantHoursRepository;
import com.frontdash.backend.repository.RestaurantRepository;
import com.frontdash.backend.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Component
public class InstructorTestDataLoader implements CommandLineRunner {

    @Autowired private RestaurantRepository restaurantRepository;
    @Autowired private RestaurantHoursRepository restaurantHoursRepository;
    @Autowired private MenuItemRepository menuItemRepository;
    @Autowired private DriverJpaRepository driverRepository;
    @Autowired private StaffRepository staffRepository;

    private int menuSeq = 1;

    @Override
    @Transactional
    public void run(String... args) {
        long count = restaurantRepository.count();
        System.out.println("InstructorTestDataLoader: restaurants in DB before seed = " + count);

        // IMPORTANT: don’t keep seeding if data already exists
        if (count > 0) {
            System.out.println("InstructorTestDataLoader: skipping seed (restaurants already exist).");
            return;
        }

        System.out.println("InstructorTestDataLoader: seeding instructor test data...");

        // --- Default owner staff ---
        Staff defaultOwner = new Staff();
        defaultOwner.setStaffId("admin-001");
        defaultOwner.setFirstName("Default");
        defaultOwner.setLastName("Owner");
        defaultOwner.setRoleId(1);
        defaultOwner.setEmail("admin@example.com");
        defaultOwner.setPhone("0000000000");
        defaultOwner.setActive(true);
        staffRepository.save(defaultOwner);

        // --------- RESTAURANTS + ADDRESSES ---------
        Restaurant allChicken = new Restaurant();
        allChicken.setRestaurantId("REST-ACM");
        allChicken.setRestaurantName("All Chicken Meals");
        allChicken.setStreet("234 Lake Street");
        allChicken.setCity("Boston");
        allChicken.setState("MA");
        allChicken.setZip("02132");
        allChicken.setPhone("6174783785");          // no dashes in DB
        allChicken.setEmail("allchicken@example.com");
        allChicken.setHumanContactName("Laura Wimbleton");
        allChicken.setCuisineType("Chicken");
        allChicken.setForceClosed(false);
        allChicken.setOwnerId(defaultOwner.getStaffId());
        restaurantRepository.save(allChicken);

        Restaurant pizzaOnly = new Restaurant();
        pizzaOnly.setRestaurantId("REST-PO");
        pizzaOnly.setRestaurantName("Pizza Only");
        pizzaOnly.setStreet("719 Hobatt Road");
        pizzaOnly.setCity("Chestnut Hill");
        pizzaOnly.setState("MA");
        pizzaOnly.setZip("02129");
        pizzaOnly.setPhone("8574772773");
        pizzaOnly.setEmail("pizzaonly@example.com");
        pizzaOnly.setHumanContactName("Russel Beverton");
        pizzaOnly.setCuisineType("Pizza");
        pizzaOnly.setForceClosed(false);
        pizzaOnly.setOwnerId(defaultOwner.getStaffId());
        restaurantRepository.save(pizzaOnly);

        Restaurant bestBurgers = new Restaurant();
        bestBurgers.setRestaurantId("REST-BB");
        bestBurgers.setRestaurantName("Best Burgers");
        bestBurgers.setStreet("28093 Park Avenue");
        bestBurgers.setCity("Newton Corner");
        bestBurgers.setState("MA");
        bestBurgers.setZip("02125");
        bestBurgers.setPhone("7814670073");
        bestBurgers.setEmail("bestburgers@example.com");
        bestBurgers.setHumanContactName("Eager Alloysis");
        bestBurgers.setCuisineType("Burgers");
        bestBurgers.setForceClosed(false);
        bestBurgers.setOwnerId(defaultOwner.getStaffId());
        restaurantRepository.save(bestBurgers);

        // --------- HOURS ---------
        // helper method for less repetition
        createHours(allChicken,
                "9:00-21:00", "9:00-21:00", "9:00-21:00", "9:00-21:00",
                "9:00-21:00", "8:00-22:00", "8:00-22:00");

        createHours(pizzaOnly,
                "12:00-23:59", "12:00-23:59", "12:00-23:59", "12:00-23:59",
                "CLOSED", "10:00-23:59", "10:00-23:59");

        createHours(bestBurgers,
                "9:00-23:59", "9:00-23:59", "9:00-23:59", "9:00-23:59",
                "9:00-23:59", "CLOSED", "CLOSED");

        // --------- MENU ITEMS ---------
        // All Chicken Meals
        createMenuItem(allChicken, "Nuggets",  "Nuggets",   5.99,  true);
        createMenuItem(allChicken, "Wings",    "Wings",    10.99,  true);
        createMenuItem(allChicken, "Combo",    "Combo",    23.99,  true);
        createMenuItem(allChicken, "Sandwich", "Sandwich",  8.99,  true);
        createMenuItem(allChicken, "Wrap",     "Wrap",      6.99,  true);

        // Pizza Only
        createMenuItem(pizzaOnly, "Pepperoni(Small)", "Pepperoni small", 12.99, true);
        createMenuItem(pizzaOnly, "Pepperoni(Large)", "Pepperoni large", 17.99, true);
        createMenuItem(pizzaOnly, "Supreme",          "Supreme",        21.99, true);
        createMenuItem(pizzaOnly, "Hawaiian",         "Hawaiian",       24.99, true);
        createMenuItem(pizzaOnly, "Your 3 topping",   "Custom 3 topping",15.99,true);

        // Best Burgers
        createMenuItem(bestBurgers, "Butter burger", "Butter burger",  9.99, true);
        createMenuItem(bestBurgers, "Cheese Burger", "Cheese Burger",  5.99, true);
        createMenuItem(bestBurgers, "Hamburger",     "Hamburger",      4.99, true);
        createMenuItem(bestBurgers, "BBSpecial",     "BBSpecial",     12.99, true);
        createMenuItem(bestBurgers, "BBDouble",      "BBDouble",      11.99, true);

        // --------- DRIVERS ---------
        createDriver("Shawn",  "Murray",  true);
        createDriver("Alex",   "Shopper", true);
        createDriver("Lisa",   "Graham",  false); // Inactive
        createDriver("Ryan",   "Graham",  true);
        createDriver("Marcus", "Shane",   true);
        createDriver("Vicky",  "Kissinger", true);
        createDriver("Lucy",   "Gordon",  false);

        // --------- STAFF ---------
        createStaff("Amanda",  "Richard", "richard01", "amanda.richard@example.com", true);
        createStaff("Arthur",  "Cox",     "cox02",     "arthur.cox@example.com",     true);
        createStaff("Charles", "Deckon",  "deckon03",  "charles.deckon@example.com", true);
        createStaff("Francis", "Cox",     "cox04",     "francis.cox@example.com",    true);
        createStaff("Sarah",   "Mullard", "mullard05", "sarah.mullard@example.com",  true);

        System.out.println("InstructorTestDataLoader: done seeding.");
    }

    // ===== helper methods =====

    private void createHours(Restaurant r,
                             String mon, String tue, String wed, String thu,
                             String fri, String sat, String sun) {

        createHoursForDay(r, DayOfWeek.MONDAY,    mon);
        createHoursForDay(r, DayOfWeek.TUESDAY,   tue);
        createHoursForDay(r, DayOfWeek.WEDNESDAY, wed);
        createHoursForDay(r, DayOfWeek.THURSDAY,  thu);
        createHoursForDay(r, DayOfWeek.FRIDAY,    fri);
        createHoursForDay(r, DayOfWeek.SATURDAY,  sat);
        createHoursForDay(r, DayOfWeek.SUNDAY,    sun);
    }

    private void createHoursForDay(Restaurant r, DayOfWeek day, String spec) {
        RestaurantHours h = new RestaurantHours();
        h.setRestaurant(r);
        // DB stores weekday 0-6 (Sunday-Saturday)
        h.setWeekday(day == DayOfWeek.SUNDAY ? 0 : day.getValue());

        if ("CLOSED".equalsIgnoreCase(spec)) {
            h.setOpensAt(null);
            h.setClosesAt(null);
            h.setIsClosed(true);
        } else {
            // spec like "9:00-21:00"
            String[] parts = spec.split("-");
            java.time.LocalTime open = parseTime(parts[0]);
            java.time.LocalTime close = parseTime(parts[1]);

            h.setOpensAt(java.sql.Time.valueOf(open));
            h.setClosesAt(java.sql.Time.valueOf(close));
            h.setIsClosed(false);
        }

        restaurantHoursRepository.save(h);
    }

    private java.time.LocalTime parseTime(String raw) {
        String s = raw.trim();

        // Handle "24:00" as end-of-day
        if (s.equals("24:00") || s.equals("24:00:00")) {
            return java.time.LocalTime.of(23, 59);
        }

        String[] parts = s.split(":");
        if (parts.length == 2) {
            int h = Integer.parseInt(parts[0]);
            int m = Integer.parseInt(parts[1]);
            return java.time.LocalTime.of(h, m);
        } else if (parts.length == 3) {
            int h = Integer.parseInt(parts[0]);
            int m = Integer.parseInt(parts[1]);
            int sec = Integer.parseInt(parts[2]);
            return java.time.LocalTime.of(h, m, sec);
        }

        // Fallback parsing
        return java.time.LocalTime.parse(s, java.time.format.DateTimeFormatter.ofPattern("H:mm"));
    }

    private void createMenuItem(Restaurant r, String foodName,
                                String description, double price, boolean available) {

        MenuItem mi = new MenuItem();
        mi.setMenuItemId(r.getRestaurantId() + "-ITEM-" + (menuSeq++));
        mi.setRestaurant(r);
        mi.setFoodName(foodName);
        mi.setFoodDescription(description);
        mi.setPrice(BigDecimal.valueOf(price));
        mi.setIsAvailable(available);
        mi.setCategory("Main");
        menuItemRepository.save(mi);
    }

    private void createDriver(String first, String last, boolean active) {
        Driver d = new Driver();
        // if your entity uses driverId string, generate or use drv-XXX
        d.setDriverId(first.toLowerCase() + "-" + last.toLowerCase());
        d.setFirstName(first);
        d.setLastName(last);
        d.setActive(active);
        d.setAssignedToOrder(false);
        d.setCreatedAt(java.time.LocalDateTime.now());
        driverRepository.save(d);
    }

    private void createStaff(String first, String last, String username,
                             String email, boolean active) {
        Staff s = new Staff();
        s.setStaffId(username);           // or generate UUID
        s.setFirstName(first);
        s.setLastName(last);
        s.setPhone(null);
        s.setEmail(email);
        s.setRoleId(0);
        s.setActive(active);
        // you can also set a default password hash if needed
        staffRepository.save(s);
    }
}
