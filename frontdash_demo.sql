-- =========================================================
-- FRONTDASH — COMPLETE DEMO DATABASE (SCHEMA + PROCS + SEED)
-- Save as: frontdash_demo.sql
-- Run in MySQL Workbench:  Query > Execute All
-- =========================================================

-- Clean slate
DROP DATABASE IF EXISTS frontdash;
CREATE DATABASE frontdash;
USE frontdash;

-- =========================================================
-- TABLES
-- =========================================================

-- 1) Login credentials (demo: SHA-256 column used ONLY to verify logins in SQL/Java)
DROP TABLE IF EXISTS login_credentials;
CREATE TABLE login_credentials (
    username         VARCHAR(255) PRIMARY KEY,
    hashed_password  VARCHAR(255) NOT NULL,      -- keep for real bcrypt later (backend)
    usertype         INT NOT NULL,               -- 0=staff, 1=owner, 2=admin (example)
    password_sha256  CHAR(64) NULL               -- DEMO ONLY: enables SQL verification
) ENGINE=InnoDB;

-- 2) Staff
DROP TABLE IF EXISTS staff;
CREATE TABLE staff (
    staff_id    VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
    role_id     INT NOT NULL,
    first_name  VARCHAR(255) NOT NULL,
    last_name   VARCHAR(255) NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    phone       VARCHAR(20),
    active      TINYINT NOT NULL DEFAULT 1,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3) Restaurants
DROP TABLE IF EXISTS restaurants;
CREATE TABLE restaurants (
    restaurant_id         VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
    owner_id              VARCHAR(255) NOT NULL,
    restaurant_name       VARCHAR(255) NOT NULL,
    cuisine_type          VARCHAR(100),
    email                 VARCHAR(255) NOT NULL,
    phone                 VARCHAR(20) NOT NULL,
    human_contact_name    VARCHAR(255),
    street                VARCHAR(255),
    city                  VARCHAR(100),
    state                 VARCHAR(50),
    zip                   VARCHAR(20),
    force_closed          BOOLEAN DEFAULT FALSE,
    profile_picture_ref   VARCHAR(500),
    FOREIGN KEY (owner_id) REFERENCES staff(staff_id)
) ENGINE=InnoDB;

-- 4) Restaurant hours
DROP TABLE IF EXISTS restaurant_hours;
CREATE TABLE restaurant_hours (
    hours_id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id  VARCHAR(255) NOT NULL,
    weekday        INT NOT NULL,                 -- 0..6 or 1..7 (you choose semantically)
    opens_at       TIME,
    closes_at      TIME,
    is_closed      BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id),
    UNIQUE KEY unique_restaurant_weekday (restaurant_id, weekday)
) ENGINE=InnoDB;

-- 5) Menu items
DROP TABLE IF EXISTS menu_items;
CREATE TABLE menu_items (
    menu_item_id       VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id      VARCHAR(255) NOT NULL,
    category           VARCHAR(100),
    food_name          VARCHAR(255) NOT NULL,
    food_description   TEXT,
    price              DECIMAL(10,2) NOT NULL,
    is_available       BOOLEAN DEFAULT TRUE,
    item_picture_ref   VARCHAR(500),
    allergens          TEXT,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id)
) ENGINE=InnoDB;

-- 6) Withdrawal requests (owner deactivation)
DROP TABLE IF EXISTS withdraw;
CREATE TABLE withdraw (
    restaurant_id        VARCHAR(255) PRIMARY KEY,
    withdraw_description TEXT,
    withdraw_status      VARCHAR(50) DEFAULT 'pending',  -- pending/approved/rejected
    deny_reason          TEXT,
    requested_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    decision_at          TIMESTAMP NULL,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id)
) ENGINE=InnoDB;

-- 7) Drivers
DROP TABLE IF EXISTS drivers;
CREATE TABLE drivers (
    driver_id          VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
    first_name         VARCHAR(255) NOT NULL,
    last_name          VARCHAR(255) NOT NULL,
    assigned_to_order  BOOLEAN NOT NULL DEFAULT FALSE,
    active             TINYINT NOT NULL DEFAULT 1,
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 8) Orders
DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
    order_id           VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id      VARCHAR(255) NOT NULL,
    staff_id           VARCHAR(255) NULL,         -- optional creator (FK to staff)
    driver_id          VARCHAR(255) NULL,         -- assigned driver (nullable)
    status             VARCHAR(50)  NOT NULL DEFAULT 'pending',
    subtotal           DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax                DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    delivery_fee       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total              DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    delivery_street    VARCHAR(255),
    delivery_city      VARCHAR(100),
    delivery_state     VARCHAR(50),
    delivery_zip       VARCHAR(20),
    placed_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delivered_at       DATETIME NULL,
    updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_orders_restaurant  FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id),
    CONSTRAINT fk_orders_staff       FOREIGN KEY (staff_id)      REFERENCES staff(staff_id),
    CONSTRAINT fk_orders_driver      FOREIGN KEY (driver_id)     REFERENCES drivers(driver_id)
) ENGINE=InnoDB;

CREATE INDEX idx_orders_restaurant_placed_at ON orders (restaurant_id, placed_at);

-- 9) Order items
DROP TABLE IF EXISTS order_items;
CREATE TABLE order_items (
    order_item_id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id             VARCHAR(255) NOT NULL,
    menu_item_id         VARCHAR(255) NOT NULL,
    item_name_snapshot   VARCHAR(255) NOT NULL,
    unit_price_snapshot  DECIMAL(10,2) NOT NULL,
    quantity             INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id)    REFERENCES orders(order_id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_menu  FOREIGN KEY (menu_item_id) REFERENCES menu_items(menu_item_id)
) ENGINE=InnoDB;

CREATE INDEX idx_order_items_order_id ON order_items (order_id);

-- 10) Registration approval
DROP TABLE IF EXISTS approval;
CREATE TABLE approval (
    restaurant_id    VARCHAR(255) PRIMARY KEY,
    approval_status  VARCHAR(50) NOT NULL DEFAULT 'pending',  -- pending/approved/rejected
    decided_at       TIMESTAMP NULL,
    decided_by       VARCHAR(255) NULL                        -- admin/staff id (optional)
) ENGINE=InnoDB;

-- =========================================================
-- DEMO HELPERS (Login verification via SHA-256)
-- =========================================================

DROP FUNCTION IF EXISTS verify_login_sha256;
DELIMITER //
CREATE FUNCTION verify_login_sha256(p_username VARCHAR(255), p_plain VARCHAR(255))
RETURNS TINYINT
DETERMINISTIC
BEGIN
  DECLARE ok TINYINT DEFAULT 0;
  SELECT 1 INTO ok
  FROM login_credentials
  WHERE username = p_username
    AND password_sha256 = SHA2(p_plain, 256)
  LIMIT 1;
  RETURN IFNULL(ok,0);
END//
DELIMITER ;

-- =========================================================
-- STORED PROCEDURES
-- =========================================================

-- Create order
DROP PROCEDURE IF EXISTS sp_create_order;
DELIMITER //
CREATE PROCEDURE sp_create_order(
  IN p_restaurant_id VARCHAR(255),
  IN p_staff_id VARCHAR(255),
  IN p_subtotal DECIMAL(10,2),
  IN p_tax DECIMAL(10,2),
  IN p_delivery_fee DECIMAL(10,2),
  IN p_street VARCHAR(255), IN p_city VARCHAR(100), IN p_state VARCHAR(50), IN p_zip VARCHAR(20)
)
BEGIN
  INSERT INTO orders (restaurant_id, staff_id, subtotal, tax, delivery_fee, total,
                      delivery_street, delivery_city, delivery_state, delivery_zip)
  VALUES (p_restaurant_id, p_staff_id, p_subtotal, p_tax, p_delivery_fee,
          p_subtotal+p_tax+p_delivery_fee, p_street, p_city, p_state, p_zip);

  -- Show the order we just created
  SELECT order_id, restaurant_id, total, status, placed_at
  FROM orders
  WHERE order_id = (SELECT order_id FROM orders ORDER BY placed_at DESC LIMIT 1);
END//
DELIMITER ;

-- Assign driver to order
DROP PROCEDURE IF EXISTS sp_assign_driver;
DELIMITER //
CREATE PROCEDURE sp_assign_driver(IN p_order_id VARCHAR(255), IN p_driver_id VARCHAR(255))
BEGIN
  UPDATE orders
     SET driver_id = p_driver_id,
         status    = 'assigned',
         updated_at = NOW()
   WHERE order_id = p_order_id;

  UPDATE drivers
     SET assigned_to_order = TRUE
   WHERE driver_id = p_driver_id;

  SELECT order_id, driver_id, status FROM orders WHERE order_id = p_order_id;
END//
DELIMITER ;

-- Update delivered time
DROP PROCEDURE IF EXISTS sp_update_delivery_time;
DELIMITER //
CREATE PROCEDURE sp_update_delivery_time(IN p_order_id VARCHAR(255), IN p_delivered_at DATETIME)
BEGIN
  UPDATE orders
     SET delivered_at = p_delivered_at,
         status='delivered',
         updated_at = NOW()
   WHERE order_id = p_order_id;

  SELECT order_id, delivered_at, status FROM orders WHERE order_id = p_order_id;
END//
DELIMITER ;

-- Staff create / inactivate
DROP PROCEDURE IF EXISTS sp_create_staff;
DELIMITER //
CREATE PROCEDURE sp_create_staff(
  IN p_staff_id VARCHAR(255), IN p_role_id INT, IN p_first VARCHAR(255), IN p_last VARCHAR(255),
  IN p_email VARCHAR(255), IN p_phone VARCHAR(20)
)
BEGIN
  INSERT INTO staff (staff_id, role_id, first_name, last_name, email, phone)
  VALUES (p_staff_id, p_role_id, p_first, p_last, p_email, p_phone);

  SELECT staff_id, first_name, last_name, email FROM staff WHERE staff_id = p_staff_id;
END//
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_inactivate_staff;
DELIMITER //
CREATE PROCEDURE sp_inactivate_staff(IN p_staff_id VARCHAR(255))
BEGIN
  UPDATE staff SET active=0 WHERE staff_id=p_staff_id;
  SELECT staff_id, active FROM staff WHERE staff_id=p_staff_id;
END//
DELIMITER ;

-- Drivers create / inactivate
DROP PROCEDURE IF EXISTS sp_create_driver;
DELIMITER //
CREATE PROCEDURE sp_create_driver(IN p_first VARCHAR(255), IN p_last VARCHAR(255))
BEGIN
  INSERT INTO drivers (first_name, last_name) VALUES (p_first, p_last);
  SELECT driver_id, first_name, last_name, created_at FROM drivers ORDER BY created_at DESC LIMIT 1;
END//
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_inactivate_driver;
DELIMITER //
CREATE PROCEDURE sp_inactivate_driver(IN p_driver_id VARCHAR(255))
BEGIN
  UPDATE drivers SET active=0 WHERE driver_id=p_driver_id;
  SELECT driver_id, active FROM drivers WHERE driver_id=p_driver_id;
END//
DELIMITER ;

-- Owner: update menu item
DROP PROCEDURE IF EXISTS sp_owner_update_menu_item;
DELIMITER //
CREATE PROCEDURE sp_owner_update_menu_item(
  IN p_menu_item_id VARCHAR(255),
  IN p_name VARCHAR(255),
  IN p_desc TEXT,
  IN p_price DECIMAL(10,2),
  IN p_available BOOLEAN
)
BEGIN
  UPDATE menu_items
     SET food_name=p_name, food_description=p_desc, price=p_price, is_available=p_available
   WHERE menu_item_id=p_menu_item_id;

  SELECT menu_item_id, food_name, price, is_available FROM menu_items WHERE menu_item_id=p_menu_item_id;
END//
DELIMITER ;

-- Owner: upsert hours
DROP PROCEDURE IF EXISTS sp_owner_upsert_hours;
DELIMITER //
CREATE PROCEDURE sp_owner_upsert_hours(
  IN p_restaurant_id VARCHAR(255),
  IN p_weekday INT,
  IN p_opens TIME,
  IN p_closes TIME,
  IN p_is_closed BOOLEAN
)
BEGIN
  INSERT INTO restaurant_hours (restaurant_id, weekday, opens_at, closes_at, is_closed)
  VALUES (p_restaurant_id, p_weekday, p_opens, p_closes, p_is_closed)
  ON DUPLICATE KEY UPDATE opens_at=VALUES(opens_at), closes_at=VALUES(closes_at), is_closed=VALUES(is_closed);

  SELECT * FROM restaurant_hours WHERE restaurant_id=p_restaurant_id AND weekday=p_weekday;
END//
DELIMITER ;

-- Registration approval flow
DROP PROCEDURE IF EXISTS sp_request_registration;
DELIMITER //
CREATE PROCEDURE sp_request_registration(IN p_restaurant_id VARCHAR(255))
BEGIN
  INSERT INTO approval (restaurant_id, approval_status)
  VALUES (p_restaurant_id, 'pending')
  ON DUPLICATE KEY UPDATE approval_status='pending', decided_at=NULL, decided_by=NULL;

  SELECT restaurant_id, approval_status FROM approval WHERE restaurant_id=p_restaurant_id;
END//
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_decide_registration;
DELIMITER //
CREATE PROCEDURE sp_decide_registration(
  IN p_restaurant_id VARCHAR(255),
  IN p_status VARCHAR(50),      -- 'approved' or 'rejected'
  IN p_admin_id VARCHAR(255)
)
BEGIN
  UPDATE approval
     SET approval_status=p_status, decided_at=NOW(), decided_by=p_admin_id
   WHERE restaurant_id=p_restaurant_id;

  SELECT restaurant_id, approval_status, decided_at FROM approval WHERE restaurant_id=p_restaurant_id;
END//
DELIMITER ;

-- Withdraw flow
DROP PROCEDURE IF EXISTS sp_request_withdraw;
DELIMITER //
CREATE PROCEDURE sp_request_withdraw(IN p_restaurant_id VARCHAR(255), IN p_desc TEXT)
BEGIN
  INSERT INTO withdraw (restaurant_id, withdraw_description, withdraw_status)
  VALUES (p_restaurant_id, p_desc, 'pending')
  ON DUPLICATE KEY UPDATE withdraw_description=p_desc, withdraw_status='pending', decision_at=NULL, deny_reason=NULL;

  SELECT restaurant_id, withdraw_status FROM withdraw WHERE restaurant_id=p_restaurant_id;
END//
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_decide_withdraw;
DELIMITER //
CREATE PROCEDURE sp_decide_withdraw(
  IN p_restaurant_id VARCHAR(255),
  IN p_status VARCHAR(50),     -- 'approved' or 'rejected'
  IN p_reason TEXT
)
BEGIN
  UPDATE withdraw
     SET withdraw_status=p_status,
         decision_at=NOW(),
         deny_reason=IF(p_status='rejected', p_reason, NULL)
   WHERE restaurant_id=p_restaurant_id;

  SELECT restaurant_id, withdraw_status, decision_at, deny_reason FROM withdraw WHERE restaurant_id=p_restaurant_id;
END//
DELIMITER ;

-- =========================================================
-- SEED DATA (so demo runs out-of-the-box)
-- =========================================================

-- Staff (owner & staffer)
INSERT INTO staff (staff_id, role_id, first_name, last_name, email, phone)
VALUES ('staff-001', 1, 'John', 'Doe', 'john@test.com', '555-0001')
ON DUPLICATE KEY UPDATE email=VALUES(email);

INSERT INTO staff (staff_id, role_id, first_name, last_name, email, phone)
VALUES ('staff-002', 0, 'Jane', 'Smith', 'jane@test.com', '555-0002')
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- Restaurants
INSERT INTO restaurants (restaurant_id, owner_id, restaurant_name, cuisine_type, email, phone, human_contact_name, street, city, state, zip)
VALUES ('rest-001', 'staff-001', 'Test Restaurant', 'Italian', 'test@restaurant.com', '555-1111', 'John Doe', '123 Main', 'Dallas', 'TX', '75205')
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- Menu items (one example)
INSERT INTO menu_items (menu_item_id, restaurant_id, category, food_name, food_description, price)
VALUES ('menu-001', 'rest-001', 'Pasta', 'Spaghetti', 'Classic spaghetti with sauce', 12.99)
ON DUPLICATE KEY UPDATE price=VALUES(price);

-- Drivers
INSERT INTO drivers (driver_id, first_name, last_name) VALUES ('drv-001', 'Alex', 'Kim')
ON DUPLICATE KEY UPDATE first_name=VALUES(first_name);

-- Logins (DEMO ONLY: password_sha256 stores SHA2 of plain string for SQL verification)
--  staff.jane / secret123  ;  owner.mario / owner456
INSERT INTO login_credentials (username, hashed_password, usertype, password_sha256)
VALUES ('staff.jane',  'BCRYPT_PLACEHOLDER', 0, SHA2('secret123',256))
ON DUPLICATE KEY UPDATE password_sha256=VALUES(password_sha256);

INSERT INTO login_credentials (username, hashed_password, usertype, password_sha256)
VALUES ('owner.mario', 'BCRYPT_PLACEHOLDER', 1, SHA2('owner456',256))
ON DUPLICATE KEY UPDATE password_sha256=VALUES(password_sha256);

-- Quick check
SELECT 'Database setup complete!' AS status;
