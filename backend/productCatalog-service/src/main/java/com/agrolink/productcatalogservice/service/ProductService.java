package com.agrolink.productcatalogservice.service;

import com.agrolink.productcatalogservice.dto.ProductRequestDTO;
import com.agrolink.productcatalogservice.model.PriceType;
import com.agrolink.productcatalogservice.model.Product;
import com.agrolink.productcatalogservice.model.ProductImage;
import com.agrolink.productcatalogservice.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final S3Service s3Service;

    public Product createProduct(ProductRequestDTO request) throws IOException {

        // 1. Create the Product object FIRST (without images initially)
        Product product = Product.builder()
                .farmerId(request.getFarmerId())
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
                .pickupAddress(request.getPickupAddress())
                .pickupLatitude(request.getPickupLatitude())
                .pickupLongitude(request.getPickupLongitude())
                .build();

        // 2. Handle Dates
        if (request.getBiddingStartDate() != null && !request.getBiddingStartDate().isEmpty())
            product.setBiddingStartDate(LocalDateTime.parse(request.getBiddingStartDate()));

        if (request.getBiddingEndDate() != null && !request.getBiddingEndDate().isEmpty())
            product.setBiddingEndDate(LocalDateTime.parse(request.getBiddingEndDate()));

        // 3. Process Images
        List<ProductImage> productImages = new ArrayList<>();
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            for (MultipartFile file : request.getImages()) {
                String url = s3Service.uploadFile(file);

                // Create the Image Entity with FarmerID
                ProductImage img = ProductImage.builder()
                        .imageUrl(url)
                        .farmerId(request.getFarmerId()) // Saving Farmer ID as requested
                        .product(product) // Link to parent
                        .build();

                productImages.add(img);
            }
        }

        // 4. Attach images to product
        product.setImages(productImages);

        // 5. Save (Cascading will save the images automatically)
        return productRepository.save(product);
    }

    public List<Product> getAllProducts() { return productRepository.findAll(); }

    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

    public List<Product> getProductsByFarmerId(Long farmerId) {
        return productRepository.findByFarmerId(farmerId);
    }

    // Note: Update method would need similar logic adjustments for images if you implement image editing.
    public Product updateProduct(Long id, Product updated) {
        // ... implementation for update ...
        return productRepository.save(updated);
    }
}