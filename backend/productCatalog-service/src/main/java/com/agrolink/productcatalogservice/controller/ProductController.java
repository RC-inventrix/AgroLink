package com.agrolink.productcatalogservice.controller;

import com.agrolink.productcatalogservice.model.Product;
import com.agrolink.productcatalogservice.model.PricingType;
import com.agrolink.productcatalogservice.service.ProductService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {

    private final ProductService productService;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @PostMapping
    public ResponseEntity<Product> addProduct(
            @RequestParam String vegetableName,
            @RequestParam String category,
            @RequestParam double quantity,
            @RequestParam String pricingType,
            @RequestParam(required = false) Double fixedPrice,
            @RequestParam(required = false) Double biddingPrice,
            @RequestParam(required = false) String biddingStartDate,
            @RequestParam(required = false) String biddingEndDate,
            @RequestParam String description,
            @RequestParam(required = false) List<MultipartFile> images
    ) throws IOException {
        List<String> imageFilenames = new ArrayList<>();
        if (images != null) {
            for (MultipartFile image : images) {
                String filename = System.currentTimeMillis() + "_" + image.getOriginalFilename();
                File file = new File(uploadDir + filename);
                image.transferTo(file);
                imageFilenames.add("/images/" + filename);
            }
        }

        Product product = new Product();
        product.setVegetableName(vegetableName);
        product.setCategory(category);
        product.setQuantity(quantity);
        product.setPricingType(pricingType.equalsIgnoreCase("fixed") ? PricingType.FIXED : PricingType.BIDDING);
        product.setFixedPrice(fixedPrice);
        product.setBiddingPrice(biddingPrice);
        product.setBiddingStartDate(biddingStartDate);
        product.setBiddingEndDate(biddingEndDate);
        product.setDescription(description);
        product.setImages(imageFilenames);

        return ResponseEntity.ok(productService.saveProduct(product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Product> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product product) {
        return productService.updateProduct(id, product);
    }
}

