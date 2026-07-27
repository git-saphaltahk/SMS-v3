package com.example.mystore.search;

import com.example.mystore.entity.Product;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.math.BigDecimal;

@Data
@Document(indexName = "products")
public class ProductDocument {
    @Id
    private Long id;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String name;

    @Field(type = FieldType.Keyword)
    private String category;

    @Field(type = FieldType.Double)
    private Double price;

    @Field(type = FieldType.Integer)
    private Integer stockQuantity;

    @Field(type = FieldType.Keyword)
    private String imageName;

    @Field(type = FieldType.Boolean)
    private boolean active;

    public static ProductDocument fromProduct(Product product) {
        ProductDocument document = new ProductDocument();
        document.setId(product.getId());
        document.setName(product.getName());
        document.setCategory(product.getCategory());
        document.setPrice(product.getPrice() != null ? product.getPrice().doubleValue() : null);
        document.setStockQuantity(product.getStockQuantity());
        document.setImageName(product.getImageName());
        document.setActive(product.isActive());
        return document;
    }

    public Product toProduct() {
        Product product = new Product();
        product.setId(this.id);
        product.setName(this.name);
        product.setCategory(this.category);
        product.setPrice(this.price != null ? BigDecimal.valueOf(this.price) : BigDecimal.ZERO);
        product.setStockQuantity(this.stockQuantity != null ? this.stockQuantity : 0);
        product.setImageName(this.imageName);
        product.setActive(this.active);
        return product;
    }
}
