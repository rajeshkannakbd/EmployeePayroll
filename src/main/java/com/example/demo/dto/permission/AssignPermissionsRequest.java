package com.example.demo.dto.role;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class AssignPermissionsRequest {

    @NotNull(message = "Permission IDs are required")
    private Set<Long> permissionIds;
}