package com.agrolink.productcatalogservice.service;

import com.agrolink.productcatalogservice.model.Product;
import com.agrolink.productcatalogservice.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    public Product updateProduct(Long id, Product updated) {
        Product product = productRepository.findById(id).orElseThrow();
        product.setVegetableName(updated.getVegetableName());
        product.setCategory(updated.getCategory());
        product.setQuantity(updated.getQuantity());
        product.setPricingType(updated.getPricingType());
        product.setFixedPrice(updated.getFixedPrice());
        product.setBiddingPrice(updated.getBiddingPrice());
        product.setBiddingStartDate(updated.getBiddingStartDate());
        product.setBiddingEndDate(updated.getBiddingEndDate());
        product.setDescription(updated.getDescription());
        product.setImages(updated.getImages());
        return productRepository.save(product);
    }
}
