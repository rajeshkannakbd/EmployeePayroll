package com.example.demo.service;

import com.example.demo.dto.role.RoleRequest;
import com.example.demo.dto.role.RoleResponse;
import com.example.demo.entity.Role;
import com.example.demo.repository.RoleRepository;
import com.example.demo.dto.permission.PermissionResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.entity.Permission;
import com.example.demo.repository.PermissionRepository;
import java.util.HashSet;
import java.util.Set;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    // =========================================================
    // GET ALL ROLES
    // =========================================================

    @Transactional(readOnly = true)
    public List<RoleResponse> getAllRoles() {

        return roleRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // =========================================================
    // GET ACTIVE ROLES
    // =========================================================

    @Transactional(readOnly = true)
    public List<RoleResponse> getActiveRoles() {

        return roleRepository
                .findByActiveTrueOrderByNameAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // =========================================================
    // GET ROLE BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public RoleResponse getRoleById(Long id) {

        Role role = findRole(id);

        return toResponse(role);
    }


    // =========================================================
    // CREATE ROLE
    // =========================================================

    @Transactional
    public RoleResponse createRole(RoleRequest request) {

        String name = request.getName().trim();
        String code = request.getCode().trim().toUpperCase();

        if (roleRepository.existsByCodeIgnoreCase(code)) {

            throw new RuntimeException(
                    "Role code already exists"
            );
        }

        if (roleRepository.existsByNameIgnoreCase(name)) {

            throw new RuntimeException(
                    "Role name already exists"
            );
        }

        Role role = new Role();

        role.setName(name);
        role.setCode(code);
        role.setDescription(
                request.getDescription()
        );
        role.setActive(true);

        Role savedRole =
                roleRepository.save(role);

        return toResponse(savedRole);
    }


    // =========================================================
    // UPDATE ROLE
    // =========================================================

    @Transactional
    public RoleResponse updateRole(
            Long id,
            RoleRequest request
    ) {

        Role existingRole = findRole(id);

        String name = request.getName().trim();
        String code = request.getCode().trim().toUpperCase();


        // Check duplicate code

        roleRepository
                .findByCodeIgnoreCase(code)
                .ifPresent(role -> {

                    if (!role.getId().equals(id)) {

                        throw new RuntimeException(
                                "Role code already exists"
                        );
                    }
                });


        // Check duplicate name

        roleRepository
                .findAll()
                .stream()
                .filter(role ->
                        role.getName()
                                .equalsIgnoreCase(name)
                )
                .filter(role ->
                        !role.getId().equals(id)
                )
                .findFirst()
                .ifPresent(role -> {

                    throw new RuntimeException(
                            "Role name already exists"
                    );
                });


        existingRole.setName(name);
        existingRole.setCode(code);
        existingRole.setDescription(
                request.getDescription()
        );

        Role updatedRole =
                roleRepository.save(existingRole);

        return toResponse(updatedRole);
    }


    // =========================================================
    // ACTIVATE / DEACTIVATE
    // =========================================================

    @Transactional
    public RoleResponse updateStatus(
            Long id,
            boolean active
    ) {

        Role role = findRole(id);

        role.setActive(active);

        Role updatedRole =
                roleRepository.save(role);

        return toResponse(updatedRole);
    }


    // =========================================================
    // FIND ROLE
    // =========================================================

    private Role findRole(Long id) {

        return roleRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Role not found"
                        )
                );
    }


    // =========================================================
    // ENTITY → RESPONSE
    // =========================================================

    private RoleResponse toResponse(Role role) {

    Set<PermissionResponse> permissions = role.getPermissions()
        .stream()
        .map(permission -> new PermissionResponse(
            permission.getId(),
            permission.getName(),
            permission.getCode(),
            permission.getDescription(),
            permission.isActive()
        ))
        .collect(Collectors.toSet());

    return new RoleResponse(
        role.getId(),
        role.getName(),
        role.getCode(),
        role.getDescription(),
        role.isActive(),
        role.getCreatedAt(),
        role.getUpdatedAt(),
        permissions
    );
}
    @Transactional
public RoleResponse assignPermissions(
        Long roleId,
        Set<Long> permissionIds
) {

    Role role = findRole(roleId);

    Set<Permission> permissions =
            new HashSet<>(
                    permissionRepository.findAllById(
                            permissionIds
                    )
            );

    if (permissions.size() != permissionIds.size()) {
        throw new RuntimeException(
                "One or more permissions were not found"
        );
    }

    boolean containsInactive =
            permissions.stream()
                    .anyMatch(permission ->
                            !permission.isActive()
                    );

    if (containsInactive) {
        throw new RuntimeException(
                "Inactive permissions cannot be assigned"
        );
    }

    role.setPermissions(permissions);

    Role savedRole =
            roleRepository.save(role);

    return toResponse(savedRole);
}
}