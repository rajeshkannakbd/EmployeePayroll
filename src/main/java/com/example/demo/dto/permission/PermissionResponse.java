package com.example.demo.dto.permission;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PermissionResponse {

    private Long id;

    private String name;

    private String code;

    private String description;

    private boolean active;
}