package com.agrolink.productcatalogservice.service;

import com.agrolink.productcatalogservice.model.Vegetable;
import com.agrolink.productcatalogservice.repository.VegetableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VegetableService {

    private final VegetableRepository repo;

    public Vegetable save(Vegetable vege){
        return repo.save(vege);
    }

    public List<Vegetable> getAll(){
        return repo.findAll();
    }
}
