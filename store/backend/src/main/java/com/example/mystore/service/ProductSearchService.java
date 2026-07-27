package com.example.mystore.service;

import com.example.mystore.entity.Product;
import com.example.mystore.repo.ProductRepository;
import com.example.mystore.search.ProductDocument;
import com.example.mystore.search.ProductSearchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductSearchService {

    private final ProductRepository productRepository;
    private final ProductSearchRepository productSearchRepository;

    public ProductSearchService(ProductRepository productRepository,
                                @Autowired(required = false) ProductSearchRepository productSearchRepository) {
        this.productRepository = productRepository;
        this.productSearchRepository = productSearchRepository;
    }

    @Transactional
    public Product indexProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productId));
        if (productSearchRepository != null) {
            ProductDocument document = ProductDocument.fromProduct(product);
            productSearchRepository.save(document);
        }
        return product;
    }

    @Transactional
    public List<Product> indexAllProducts() {
        List<Product> products = productRepository.findAll();
        if (productSearchRepository != null) {
            products.stream()
                    .map(ProductDocument::fromProduct)
                    .forEach(productSearchRepository::save);
        }
        return products;
    }

    @Transactional
    public void deleteIndex(Long productId) {
        if (productSearchRepository != null) {
            productSearchRepository.deleteById(productId);
        }
    }

    public List<Product> search(String query, String category) {
        if (productSearchRepository == null) {
            return productRepository.findAll().stream()
                    .filter(Product::isActive)
                    .filter(product -> category == null || category.isBlank() || category.equalsIgnoreCase(product.getCategory()))
                    .filter(product -> query == null || query.isBlank() || product.getName().toLowerCase().contains(query.toLowerCase()))
                    .collect(Collectors.toList());
        }

        List<ProductDocument> documents;
        boolean hasQuery = query != null && !query.isBlank();
        boolean hasCategory = category != null && !category.isBlank();

        if (hasQuery && hasCategory) {
            documents = productSearchRepository.findByNameContainingIgnoreCaseAndActiveTrue(query).stream()
                    .filter(doc -> category.equalsIgnoreCase(doc.getCategory()))
                    .collect(Collectors.toList());
        } else if (hasQuery) {
            documents = productSearchRepository.findByNameContainingIgnoreCaseAndActiveTrue(query);
        } else if (hasCategory) {
            documents = productSearchRepository.findByCategoryAndActiveTrue(category);
        } else {
            documents = productSearchRepository.findByActiveTrue();
        }

        return documents.stream()
                .map(ProductDocument::toProduct)
                .collect(Collectors.toList());
    }
}
