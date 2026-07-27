
-- Loyalty Rules
CREATE TABLE loyalty_rules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    description VARCHAR(100),
    points_per_dollar INTEGER,
    currency_per_point DECIMAL(10,2),
    max_points_per_order INT,
    active BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    
);

-- Products
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150)
    price DECIMAL(10,2),
    category VARCHAR(100),
    stock_quantity INT,
    image_name VARCHAR(255),
    active BOOLEAN NOT NULL
);

-- Users
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(150) UNIQUE,
    active BOOLEAN NOT NULL,
    passwordHash VARCHAR(255),
    role VARCHAR(50),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resetToken VARCHAR(255),
    resetTokenExpiry TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    loyalty_points_balance INT DEFAULT 0
);

-- Orders
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    discount_amount DECIMAL(10,2),
    discount_percent DECIMAL(5,2),
    grand_total DECIMAL(10,2),
    orderSource VARCHAR(50),
    orderStatus VARCHAR(50),
    paymentStatus VARCHAR(50),
    subtotal_total DECIMAL(10,2),
    cashier_id INT,
    customer_id INT,
    coupon_code VARCHAR(100),
    loyalty_points_earned INT,
    loyalty_points_used INT,
    loyalty_rule_name VARCHAR(100),
    FOREIGN KEY (cashier_id) REFERENCES users(id),
    FOREIGN KEY (customer_id) REFERENCES users(id)
);

-- Order Items
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    line_total DECIMAL(10,2),
    quantity INT,
    unit_per_at_time VARCHAR(50),
    order_id INT,
    product_id INT,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Payments
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    amount DECIMAL(10,2),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50),
    stripe_customer_id VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255),
    stripe_session_id VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    order_id INT,
    user_id INT,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Promotion Coupons
CREATE TABLE promotion_coupons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    active BOOLEAN NOT NULL,
    code VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    discountType VARCHAR(50),
    discountValue DECIMAL(10,2),
    max_discount_amount DECIMAL(10,2),
    min_order_subtotal DECIMAL(10,2)
);

-- Reviews
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    comment TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    product_id INT,
    user_id INT,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
