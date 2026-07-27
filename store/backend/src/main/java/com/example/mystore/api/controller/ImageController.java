package com.example.mystore.api.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class ImageController {


    @GetMapping("/images/{imageName:.+}")
    public ResponseEntity<Resource> getProductImage(@PathVariable String imageName) {
        Resource imgFile = new ClassPathResource("static/images/" + imageName);

        if (!imgFile.exists()) {
            imgFile = new ClassPathResource("static/images/mystore.jpg");
        }

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG) // simple, assume JPEG
                .body(imgFile);
    }
}