package com.aditya.LandPJ.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String username;
    private String email;

    // No-args constructor
    public User() {
    }

    // All-args constructor (without id, since it's generated)
    public User(String username, String email) {
        this.username = username;
        this.email = email;
    }

    // Getters and setters

    public String getId() {
        return id;
    }

    // No setter for id (optional), as MongoDB generates it automatically

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
