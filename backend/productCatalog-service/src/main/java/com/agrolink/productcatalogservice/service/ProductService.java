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

        // 1. Create the Product object
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
        // The frontend now sends Pre-signed URLs or S3 paths as Strings.
        List<ProductImage> productImages = new ArrayList<>();

        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            for (String url : request.getImageUrls()) {
                ProductImage img = ProductImage.builder()
                        .imageUrl(url)
                        .farmerId(request.getFarmerId())
                        .product(product)
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

    public Product updateProduct(Long id, Product updated) {
        return productRepository.save(updated);
    }
}