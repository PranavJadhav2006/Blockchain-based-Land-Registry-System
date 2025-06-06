package com.aditya.LandPJ.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "lands")
public class Land {
    @Id
    private String id;
    private String surveyNumber;
    private String location;
    private String coordinates;
    private String owner;
    private String area;
    private String status;
    private String registrationDate;
    private String disputeDetails;

    public Land() {}

    public Land(String id, String surveyNumber, String location, String coordinates,
                String owner, String area, String status, String registrationDate, String disputeDetails) {
        this.id = id;
        this.surveyNumber = surveyNumber;
        this.location = location;
        this.coordinates = coordinates;
        this.owner = owner;
        this.area = area;
        this.status = status;
        this.registrationDate = registrationDate;
        this.disputeDetails = disputeDetails;
    }

    // Getters and setters (same as you wrote)
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSurveyNumber() { return surveyNumber; }
    public void setSurveyNumber(String surveyNumber) { this.surveyNumber = surveyNumber; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getCoordinates() { return coordinates; }
    public void setCoordinates(String coordinates) { this.coordinates = coordinates; }

    public String getOwner() { return owner; }
    public void setOwner(String owner) { this.owner = owner; }

    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRegistrationDate() { return registrationDate; }
    public void setRegistrationDate(String registrationDate) { this.registrationDate = registrationDate; }

    public String getDisputeDetails() { return disputeDetails; }
    public void setDisputeDetails(String disputeDetails) { this.disputeDetails = disputeDetails; }
}
