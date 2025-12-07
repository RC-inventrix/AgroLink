package com.agrolink.productcatalogservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.agrolink.productcatalogservice.model.Vegetable;

public interface VegetableRepository extends JpaRepository<Vegetable, Long>{

}
