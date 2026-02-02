package com.agrolink.productcatalogservice.controller;

import com.agrolink.productcatalogservice.dto.ProductRequestDTO;
import com.agrolink.productcatalogservice.model.Product;
import com.agrolink.productcatalogservice.service.ProductService;
import com.agrolink.productcatalogservice.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final S3Service s3Service;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<List<Product>> getProductsByFarmerId(@PathVariable Long farmerId) {
        return ResponseEntity.ok(productService.getProductsByFarmerId(farmerId));
    }

    @GetMapping("/presigned-url")
    public ResponseEntity<Map<String, String>> getPresignedUrl(
            @RequestParam String fileName,
            @RequestParam String contentType) {
        String uploadUrl = s3Service.generatePresignedUrl(fileName, contentType);
        return ResponseEntity.ok(Map.of("uploadUrl", uploadUrl));
    }

    @PostMapping
    public ResponseEntity<Product> addProduct(@RequestBody ProductRequestDTO request) {
        Product newProduct = productService.createProduct(request);
        return ResponseEntity.ok(newProduct);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    // --- UPDATED: PUT uses DTO now for safer updates ---
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody ProductRequestDTO request) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }
}