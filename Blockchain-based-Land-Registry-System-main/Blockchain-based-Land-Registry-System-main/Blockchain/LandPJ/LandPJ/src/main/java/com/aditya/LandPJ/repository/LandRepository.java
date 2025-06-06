package com.aditya.LandPJ.repository;

import com.aditya.LandPJ.model.Land;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LandRepository extends MongoRepository<Land, String> {
    List<Land> findBySurveyNumberContainingIgnoreCase(String surveyNumber);
    List<Land> findByLocationContainingIgnoreCase(String location);
}
