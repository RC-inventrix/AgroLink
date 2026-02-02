package com.agrolink.productcatalogservice.service;

import com.agrolink.productcatalogservice.dto.ProductRequestDTO;
import com.agrolink.productcatalogservice.model.PriceType;
import com.agrolink.productcatalogservice.model.Product;
import com.agrolink.productcatalogservice.model.ProductImage;
import com.agrolink.productcatalogservice.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public Product createProduct(ProductRequestDTO request) {
        Product product = mapDtoToProduct(request, new Product());
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

    public Product updateProduct(Long id, ProductRequestDTO request) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Update fields
        Product updatedProduct = mapDtoToProduct(request, existingProduct);
        return productRepository.save(updatedProduct);
    }

    // Helper to map DTO to Entity (Used for Create and Update)
    private Product mapDtoToProduct(ProductRequestDTO request, Product product) {
        if (request.getFarmerId() != null) product.setFarmerId(request.getFarmerId());
        if (request.getVegetableName() != null) product.setVegetableName(request.getVegetableName());
        if (request.getCategory() != null) product.setCategory(request.getCategory());
        if (request.getQuantity() > 0) product.setQuantity(request.getQuantity());

        if (request.getPricingType() != null) {
            product.setPricingType(PriceType.valueOf(request.getPricingType().toUpperCase()));
        }

        // Pricing fields (Nullable checks allow clearing if needed, but simple update here)
        if (request.getFixedPrice() != null) product.setFixedPrice(request.getFixedPrice());
        if (request.getBiddingPrice() != null) product.setBiddingPrice(request.getBiddingPrice());

        if (request.getDescription() != null) product.setDescription(request.getDescription());

        if (request.getDeliveryAvailable() != null) product.setDeliveryAvailable(request.getDeliveryAvailable());
        if (request.getDeliveryFeeFirst3Km() != null) product.setDeliveryFeeFirst3Km(request.getDeliveryFeeFirst3Km());
        if (request.getDeliveryFeePerKm() != null) product.setDeliveryFeePerKm(request.getDeliveryFeePerKm());

        // Address
        if (request.getPickupAddress() != null) product.setPickupAddress(request.getPickupAddress());
        if (request.getPickupLatitude() != null) product.setPickupLatitude(request.getPickupLatitude());
        if (request.getPickupLongitude() != null) product.setPickupLongitude(request.getPickupLongitude());

        // Dates
        if (request.getBiddingStartDate() != null && !request.getBiddingStartDate().isEmpty())
            product.setBiddingStartDate(LocalDateTime.parse(request.getBiddingStartDate()));
        if (request.getBiddingEndDate() != null && !request.getBiddingEndDate().isEmpty())
            product.setBiddingEndDate(LocalDateTime.parse(request.getBiddingEndDate()));

        // Images - Only update if provided
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            // Clear existing if necessary or just replace
            List<ProductImage> productImages = new ArrayList<>();
            for (String url : request.getImageUrls()) {
                ProductImage img = ProductImage.builder()
                        .imageUrl(url)
                        .farmerId(product.getFarmerId()) // Ensure farmer ID matches
                        .product(product)
                        .build();
                productImages.add(img);
            }
            product.setImages(productImages);
        }

        return product;
    }
}