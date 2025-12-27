package com.agrolink.productcatalogservice.repository;

import com.agrolink.productcatalogservice.model.Product;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

}
