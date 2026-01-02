package com.agrolink.productcatalogservice.service;

import com.agrolink.productcatalogservice.dto.ProductRequestDTO;
import com.agrolink.productcatalogservice.model.PriceType;

import com.agrolink.productcatalogservice.model.Product;
import com.agrolink.productcatalogservice.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    // 1. INJECT THE UPLOAD DIRECTORY PATH
    // (Make sure you have file.upload-dir=... in application.properties)
    @Value("${file.upload-dir}")
    private String uploadDir;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // 2. THE NEW CREATE METHOD (Handles DTOs + Files)
    public Product createProduct(ProductRequestDTO request) throws IOException {

        // A. Handle Image Uploads
        List<String> imageFilenames = new ArrayList<>();

        if (request.getImages() != null && !request.getImages().isEmpty()) {
            // Ensure the directory exists
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs(); // Create the folder if it's missing
            }

            for (MultipartFile image : request.getImages()) {
                // Generate a unique name to prevent overwriting
                String filename = System.currentTimeMillis() + "_" + image.getOriginalFilename();
                // Save to disk
                image.transferTo(new File(uploadDir + filename));
                // Add the path to our list
                imageFilenames.add("/images/" + filename);
            }
        }

        // B. Map DTO to Entity (Manual Mapping)
        Product product = Product.builder()
                .vegetableName(request.getVegetableName())
                .category(request.getCategory())
                .quantity(request.getQuantity())
                // Convert String "FIXED" -> Enum FIXED
                .pricingType(PriceType.valueOf(request.getPricingType().toUpperCase()))
                .fixedPrice(request.getFixedPrice())
                .biddingPrice(request.getBiddingPrice())
                .description(request.getDescription())
                .images(imageFilenames)
                .build();

        // C. Parse Dates Safely
        if (request.getBiddingStartDate() != null && !request.getBiddingStartDate().isEmpty()) {
            product.setBiddingStartDate(LocalDateTime.parse(request.getBiddingStartDate()));
        }
        if (request.getBiddingEndDate() != null && !request.getBiddingEndDate().isEmpty()) {
            product.setBiddingEndDate(LocalDateTime.parse(request.getBiddingEndDate()));
        }

        // D. Save to DB
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

    public Product updateProduct(Long id, Product updated) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setVegetableName(updated.getVegetableName());
        product.setCategory(updated.getCategory());
        product.setQuantity(updated.getQuantity());
        product.setPricingType(updated.getPricingType());
        product.setFixedPrice(updated.getFixedPrice());
        product.setBiddingPrice(updated.getBiddingPrice());
        product.setBiddingStartDate(updated.getBiddingStartDate());
        product.setBiddingEndDate(updated.getBiddingEndDate());
        product.setDescription(updated.getDescription());

        // Only update images if the new list is not null (optional logic)
        if (updated.getImages() != null) {
            product.setImages(updated.getImages());
        }

        return productRepository.save(product);
    }
}