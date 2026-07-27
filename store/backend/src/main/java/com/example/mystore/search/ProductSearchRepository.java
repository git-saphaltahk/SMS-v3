package com.example.mystore.search;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductSearchRepository extends ElasticsearchRepository<ProductDocument, Long> {
    List<ProductDocument> findByNameContainingIgnoreCaseAndActiveTrue(String name);
    List<ProductDocument> findByCategoryAndActiveTrue(String category);
    List<ProductDocument> findByActiveTrue();
}
