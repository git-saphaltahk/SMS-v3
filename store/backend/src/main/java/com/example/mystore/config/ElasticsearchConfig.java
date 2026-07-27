package com.example.mystore.config;

import com.example.mystore.search.ProductDocument;
import jakarta.annotation.PostConstruct;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.IndexOperations;

@Configuration
@ConditionalOnBean(ElasticsearchOperations.class)
public class ElasticsearchConfig {

    private final ElasticsearchOperations elasticsearchOperations;

    public ElasticsearchConfig(ElasticsearchOperations elasticsearchOperations) {
        this.elasticsearchOperations = elasticsearchOperations;
    }

    @PostConstruct
    public void initializeProductIndex() {
        IndexOperations indexOperations = elasticsearchOperations.indexOps(ProductDocument.class);
        if (!indexOperations.exists()) {
            indexOperations.create();
            indexOperations.putMapping(indexOperations.createMapping());
        }
    }
}
