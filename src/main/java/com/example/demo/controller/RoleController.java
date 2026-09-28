package com.example.demo.controller;

import com.example.demo.dto.role.RoleRequest;
import com.example.demo.dto.role.RoleResponse;
import com.example.demo.service.RoleService;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.RequestBody;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.example.demo.dto.role.AssignPermissionsRequest; 
import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_MANAGEMENT')")
public class RoleController {

    private final RoleService roleService;


    // =========================================================
    // GET ALL ROLES
    // =========================================================

    @GetMapping
    public ResponseEntity<List<RoleResponse>> getAllRoles() {

        return ResponseEntity.ok(
                roleService.getAllRoles()
        );
    }


    // =========================================================
    // GET ACTIVE ROLES
    // =========================================================

    @GetMapping("/active")
    public ResponseEntity<List<RoleResponse>> getActiveRoles() {

        return ResponseEntity.ok(
                roleService.getActiveRoles()
        );
    }


    // =========================================================
    // GET ROLE BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<RoleResponse> getRoleById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                roleService.getRoleById(id)
        );
    }


    // =========================================================
    // CREATE ROLE
    // =========================================================

    @PostMapping
    public ResponseEntity<RoleResponse> createRole(
            @Valid @RequestBody RoleRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        roleService.createRole(request)
                );
    }


    // =========================================================
    // UPDATE ROLE
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<RoleResponse> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleRequest request
    ) {

        return ResponseEntity.ok(
                roleService.updateRole(
                        id,
                        request
                )
        );
    }


    // =========================================================
    // ACTIVATE / DEACTIVATE
    // =========================================================

    @PatchMapping("/{id}/status")
    public ResponseEntity<RoleResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam boolean active
    ) {

        return ResponseEntity.ok(
                roleService.updateStatus(
                        id,
                        active
                )
        );
    }
    @PutMapping("/{id}/permissions")
      public ResponseEntity<RoleResponse> assignPermissions(
              @PathVariable Long id,
              @Valid @RequestBody AssignPermissionsRequest request
      ) {

          return ResponseEntity.ok(
                  roleService.assignPermissions(
                          id,
                          request.getPermissionIds()
                  )
          );
      }
}