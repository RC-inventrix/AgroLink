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
    private final S3Service s3Service; // <--- Inject S3Service

    public Product createProduct(ProductRequestDTO request) throws IOException {
        List<String> imageUrls = new ArrayList<>();

        // 1. Upload Images to S3
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            for (MultipartFile file : request.getImages()) {
                String url = s3Service.uploadFile(file); // <--- Call S3
                imageUrls.add(url);
            }
        }

        // 2. Create Product
        Product product = Product.builder()
                .vegetableName(request.getVegetableName())
                .category(request.getCategory())
                .quantity(request.getQuantity())
                .pricingType(PriceType.valueOf(request.getPricingType().toUpperCase()))
                .fixedPrice(request.getFixedPrice())
                .biddingPrice(request.getBiddingPrice())
                .description(request.getDescription())
                .deliveryAvailable(request.getDeliveryAvailable())
                .deliveryFeeFirst3Km(request.getDeliveryFeeFirst3Km())
                .deliveryFeePerKm(request.getDeliveryFeePerKm())
                .images(imageUrls) // Save S3 URLs
                .build();

        // 3. Handle Dates
        if (request.getBiddingStartDate() != null && !request.getBiddingStartDate().isEmpty())
            product.setBiddingStartDate(LocalDateTime.parse(request.getBiddingStartDate()));

        if (request.getBiddingEndDate() != null && !request.getBiddingEndDate().isEmpty())
            product.setBiddingEndDate(LocalDateTime.parse(request.getBiddingEndDate()));

        return productRepository.save(product);
    }

    public List<Product> getAllProducts() { return productRepository.findAll(); }
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
        product.setDeliveryFeeFirst3Km(updated.getDeliveryFeeFirst3Km());
        product.setDeliveryFeePerKm(updated.getDeliveryFeePerKm());

        // Only update images if the new list is not null (optional logic)
        if (updated.getImages() != null) {
            product.setImages(updated.getImages());
        }

        return productRepository.save(product);
    }
}