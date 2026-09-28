package com.example.demo.dto.role;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RoleRequest {

    @NotBlank(message = "Role name is required")
    @Size(
        min = 2,
        max = 100,
        message = "Role name must be between 2 and 100 characters"
    )
    private String name;

    @NotBlank(message = "Role code is required")
    @Size(
        min = 2,
        max = 50,
        message = "Role code must be between 2 and 50 characters"
    )
    private String code;

    @Size(
        max = 500,
        message = "Description cannot exceed 500 characters"
    )
    private String description;
}