package com.agrolink.productcatalogservice.repository;

import com.agrolink.productcatalogservice.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ProductRepository  extends JpaRepository<Product,Long>, JpaSpecificationExecutor<Product> {

}
