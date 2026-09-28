package com.example.demo.controller;

import com.example.demo.dto.permission.PermissionResponse;
import com.example.demo.entity.Permission;
import com.example.demo.service.PermissionService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/permissions")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('PERMISSION_MANAGEMENT')")
public class PermissionController {

    private final PermissionService permissionService;

    @GetMapping
    public ResponseEntity<List<PermissionResponse>> getAll() {

        return ResponseEntity.ok(
                permissionService.getAll()
        );
    }

    @GetMapping("/active")
    public ResponseEntity<List<PermissionResponse>> getActive() {

        return ResponseEntity.ok(
                permissionService.getActive()
        );
    }

    @PostMapping
    public ResponseEntity<PermissionResponse> create(
            @RequestBody Permission permission
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        permissionService.create(permission)
                );
    }
}