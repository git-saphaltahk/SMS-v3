package com.example.mystore.data;

import org.springframework.stereotype.Component;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.mystore.repo.UserRepository;
import com.example.mystore.repo.ProductRepository;
import com.example.mystore.repo.ReviewRepository;
import com.example.mystore.entity.User;
import com.example.mystore.entity.Product;
import com.example.mystore.entity.Review;
import com.example.mystore.enums.role.Role;
import com.example.mystore.service.PromotionService;

import java.math.BigDecimal;

@Component
public class SeedData implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;
    private final PromotionService promotionService;

    public SeedData(UserRepository userRepository, ProductRepository productRepository,
                    ReviewRepository reviewRepository, PasswordEncoder passwordEncoder,
                    PromotionService promotionService) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.reviewRepository = reviewRepository;
        this.passwordEncoder = passwordEncoder;
        this.promotionService = promotionService;
    }

    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        seedProducts();
        seedReviews();
        promotionService.seedDefaults();
    }

    private void seedUsers() {
        createUserIfMissing("admin@store.com", "password123", Role.ADMIN);
        createUserIfMissing("manager@store.com", "password123", Role.MANAGER);
        createUserIfMissing("staff@store.com", "password123", Role.CASHIER);
        createUserIfMissing("customer@example.com", "password123", Role.CUSTOMER);
    }

    private void createUserIfMissing(String email, String rawPassword, Role role) {
        if (userRepository.findByEmail(email).isPresent()) return;
        User u = new User();
        u.setEmail(email);
        u.setPasswordHash(passwordEncoder.encode(rawPassword));
        u.setRole(role);
        u.setActive(true);
        userRepository.save(u);
    }

    private void seedProducts() {
        if (productRepository.count() > 0) return;

        Product p1 = new Product();
        p1.setName("Classic T-Shirt");
        p1.setCategory("Men");
        p1.setPrice(new BigDecimal("19.99"));
        p1.setStockQuantity(50);
        p1.setImageName("tshirt.jpg");
        productRepository.save(p1);

        Product p2 = new Product();
        p2.setName("Slim Fit Jeans");
        p2.setCategory("Men");
        p2.setPrice(new BigDecimal("49.99"));
        p2.setStockQuantity(30);
        p2.setImageName("jeans3.jpg");
        productRepository.save(p2);

        Product p3 = new Product();
        p3.setName("Summer Dress");
        p3.setCategory("Women");
        p3.setPrice(new BigDecimal("39.99"));
        p3.setStockQuantity(25);
        p3.setImageName("summerdress.jpg"); 
        productRepository.save(p3);

        Product p4 = new Product();
        p4.setName("Leather Handbag");
        p4.setCategory("Women");
        p4.setPrice(new BigDecimal("59.99"));
        p4.setStockQuantity(15);
        p4.setImageName("leatherbag.jpg"); 
        productRepository.save(p4);

        Product p5 = new Product();
        p5.setName("Running Sneakers");
        p5.setCategory("Kids");
        p5.setPrice(new BigDecimal("29.99"));
        p5.setStockQuantity(40);
        p5.setImageName("sneaker.jpg");
        productRepository.save(p5);

        Product p6 = new Product();
        p6.setName("Cartoon Backpack");
        p6.setCategory("Kids");
        p6.setPrice(new BigDecimal("24.99"));
        p6.setStockQuantity(35);
        p6.setImageName("backpack.jpg"); 
        productRepository.save(p6);
    }

    private void seedReviews() {
        if (reviewRepository.count() > 0) return;

        // Get users and products for review associations
        User customer = userRepository.findByEmail("customer@example.com").orElse(null);
        User admin = userRepository.findByEmail("admin@store.com").orElse(null);
        User manager = userRepository.findByEmail("manager@store.com").orElse(null);
        User staff = userRepository.findByEmail("staff@store.com").orElse(null);

        java.util.List<Product> allProducts = productRepository.findAll();
        if (allProducts.isEmpty() || customer == null) return;

        // Helper to create reviews
        java.util.function.BiFunction<Product, User, Review> createReview = (product, user) -> {
            Review r = new Review();
            r.setProduct(product);
            r.setUser(user);
            return r;
        };

        // Product 0 (Classic T-Shirt) - 4 reviews
        if (allProducts.size() > 0) {
            Product p = allProducts.get(0);
            Review r1 = createReview.apply(p, customer);
            r1.setRating(5); r1.setComment("Excellent quality! Soft fabric, comfortable fit. Highly recommend!");
            reviewRepository.save(r1);

            Review r2 = createReview.apply(p, admin);
            r2.setRating(4); r2.setComment("Nice t-shirt, true color, doesn't fade after washing. Slightly larger than expected.");
            reviewRepository.save(r2);

            Review r3 = createReview.apply(p, manager);
            r3.setRating(5); r3.setComment("Classic style, great quality fabric. My go-to t-shirt!");
            reviewRepository.save(r3);

            Review r4 = createReview.apply(p, staff);
            r4.setRating(4); r4.setComment("Great value for money. Already bought three of these. Fast delivery too.");
            reviewRepository.save(r4);
        }

        // Product 1 (Slim Fit Jeans) - 3 reviews
        if (allProducts.size() > 1) {
            Product p = allProducts.get(1);
            Review r1 = createReview.apply(p, customer);
            r1.setRating(4); r1.setComment("Great fit — slim but not tight. The stretchy fabric is very comfortable.");
            reviewRepository.save(r1);

            Review r2 = createReview.apply(p, admin);
            r2.setRating(5); r2.setComment("Best jeans I've bought in years. Perfect slim fit!");
            reviewRepository.save(r2);

            Review r3 = createReview.apply(p, manager);
            r3.setRating(3); r3.setComment("Good jeans but the pockets are poorly designed — phone falls out easily.");
            reviewRepository.save(r3);
        }

        // Product 2 (Summer Dress) - 4 reviews
        if (allProducts.size() > 2) {
            Product p = allProducts.get(2);
            Review r1 = createReview.apply(p, customer);
            r1.setRating(5); r1.setComment("Absolutely gorgeous dress! Light fabric perfect for summer, looks elegant.");
            reviewRepository.save(r1);

            Review r2 = createReview.apply(p, admin);
            r2.setRating(5); r2.setComment("Bought as a gift for my girlfriend — she absolutely loves it! Great craftsmanship.");
            reviewRepository.save(r2);

            Review r3 = createReview.apply(p, manager);
            r3.setRating(4); r3.setComment("Beautiful dress, perfect length. Would love to see more color options.");
            reviewRepository.save(r3);

            Review r4 = createReview.apply(p, staff);
            r4.setRating(5); r4.setComment("Wore this to a friend's wedding — got so many compliments! Strongly recommend!");
            reviewRepository.save(r4);
        }

        // Product 4 (Running Sneakers) - 3 reviews
        if (allProducts.size() > 4) {
            Product p = allProducts.get(4);
            Review r1 = createReview.apply(p, customer);
            r1.setRating(5); r1.setComment("Very lightweight for running, great cushioning. Ran 5km with no foot fatigue.");
            reviewRepository.save(r1);

            Review r2 = createReview.apply(p, admin);
            r2.setRating(4); r2.setComment("Good sneakers for the price. Comfortable for daily runs.");
            reviewRepository.save(r2);

            Review r3 = createReview.apply(p, manager);
            r3.setRating(4); r3.setComment("My kid loves these sneakers! Stylish design and solid quality.");
            reviewRepository.save(r3);
        }
    }
}
