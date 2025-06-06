package com.aditya.LandPJ.controller;

import com.aditya.LandPJ.model.Land;
import com.aditya.LandPJ.repository.LandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allow all origins for development
public class LandController {

    @Autowired
    private LandRepository landRepository;

    @GetMapping("/lands")
    public List<Land> getAllLands() {
        return landRepository.findAll();
    }

    @GetMapping("/lands/search")
    public List<Land> searchLands(
            @RequestParam String type,
            @RequestParam String query) {
        if ("surveyNumber".equalsIgnoreCase(type)) {
            return landRepository.findBySurveyNumberContainingIgnoreCase(query);
        } else {
            return landRepository.findByLocationContainingIgnoreCase(query);
        }
    }

    @PostMapping("/lands")
    public Land registerLand(@RequestBody Land land) {
        return landRepository.save(land);
    }

    @PutMapping("/lands/{id}/status")
    public Land updateLandStatus(
            @PathVariable String id,
            @RequestParam String status,
            @RequestParam(required = false) String disputeDetails) {
        Land land = landRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Land not found with id: " + id));

        land.setStatus(status);
        if (disputeDetails != null) {
            land.setDisputeDetails(disputeDetails);
        }
        return landRepository.save(land);
    }
}
