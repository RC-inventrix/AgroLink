package com.agrolink.productcatalogservice.repository;

import com.agrolink.productcatalogservice.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

// No @Repository needed here
public interface ProductRepository extends JpaRepository<Product, Long> {
    // You can add custom queries here later, e.g.:
    // List<Product> findByCategory(String category);
}