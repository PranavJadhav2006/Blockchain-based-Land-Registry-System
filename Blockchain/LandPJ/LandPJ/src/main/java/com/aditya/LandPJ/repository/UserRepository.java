package com.aditya.LandPJ.repository;

import com.aditya.LandPJ.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {
    User findByUsername(String username);
}
