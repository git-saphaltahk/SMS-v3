package com.example.mystore.api.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import com.example.mystore.api.dto.PosCheckoutRequest;
import com.example.mystore.api.dto.ReceiptResponse;
import com.example.mystore.entity.Product;
import com.example.mystore.helper.CurrentUser;
import com.example.mystore.repo.ProductRepository;
import com.example.mystore.service.PosCheckoutService;
import com.example.mystore.service.ProductSearchService;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductsController {

    private final ProductRepository productRepository;
    private final PosCheckoutService posCheckoutService;
    private final ProductSearchService productSearchService;
    private final CurrentUser currentUser;

    public ProductsController(ProductRepository productRepository,
                              PosCheckoutService posCheckoutService,
                              ProductSearchService productSearchService,
                              CurrentUser currentUser) {
        this.productRepository = productRepository;
        this.posCheckoutService = posCheckoutService;
        this.productSearchService = productSearchService;
        this.currentUser = currentUser;
    }

    @GetMapping
    public List<Product> listAll(@RequestParam(required = false) String category,
                                 @RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return productSearchService.search(search, category);
        }
        if (category != null && !category.isEmpty()) {
            return productRepository.findByCategory(category);
        }
        return productRepository.findAll();
    }

    @GetMapping("/categories")
    public List<String> listCategories() {
        return productRepository.findDistinctCategories();
    }

    @GetMapping("/{id}")
    public Product getById(@PathVariable Long id) {
        return productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
    }

    @GetMapping("/search")
    public List<Product> search(@RequestParam(required = false) String query,
                                @RequestParam(required = false) String category) {
        return productSearchService.search(query, category);
    }

    @PostMapping("/reindex")
    public List<Product> reindexAllProducts() {
        return productSearchService.indexAllProducts();
    }

    @PostMapping("/reindex/{id}")
    public Product reindexProduct(@PathVariable Long id) {
        return productSearchService.indexProduct(id);
    }

    public static class ProductRequest {
        public String name;
        public BigDecimal price;
        public Integer stock; // frontend uses stock
        public String category; // optional
        public String imageName;
        public Boolean active;
    }

    @PostMapping
    public Product create(@RequestBody ProductRequest req) {
        Product p = new Product();
        p.setName(req.name);
        p.setPrice(req.price != null ? req.price : BigDecimal.ZERO);
        p.setStockQuantity(req.stock != null ? req.stock : 0);
        p.setCategory(req.category != null ? req.category : "");
        p.setImageName(req.imageName);
        if (req.active != null) p.setActive(req.active);
        Product saved = productRepository.save(p);
        productSearchService.indexProduct(saved.getId());
        return saved;
    }

    @PutMapping("/{id}")
    @Transactional
    public Product update(@PathVariable Long id, @RequestBody ProductRequest req) {
        Product p = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        if (req.name != null) p.setName(req.name);
        if (req.price != null) p.setPrice(req.price);
        if (req.stock != null) p.setStockQuantity(req.stock);
        if (req.category != null) p.setCategory(req.category);
        if (req.imageName != null) p.setImageName(req.imageName);
        if (req.active != null) p.setActive(req.active);
        Product updated = productRepository.save(p);
        productSearchService.indexProduct(updated.getId());
        return updated;
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        productRepository.deleteById(id);
        productSearchService.deleteIndex(id);
    }

    @PostMapping("/pos-checkout")
    public ReceiptResponse posCheckout(@RequestBody PosCheckoutRequest req) {
        Long cashierId = currentUser.getCurrentUserId();
        return posCheckoutService.checkout(cashierId, req);
    }

}
