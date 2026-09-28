package com.example.demo.service;

import com.example.demo.dto.permission.PermissionResponse;
import com.example.demo.entity.Permission;
import com.example.demo.repository.PermissionRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PermissionService {

    private final PermissionRepository permissionRepository;

    @Transactional(readOnly = true)
    public List<PermissionResponse> getAll() {

        return permissionRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PermissionResponse> getActive() {

        return permissionRepository
                .findByActiveTrueOrderByNameAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public PermissionResponse create(
            Permission permission
    ) {

        if (permissionRepository
                .existsByCodeIgnoreCase(
                        permission.getCode()
                )) {

            throw new RuntimeException(
                    "Permission code already exists"
            );
        }

        permission.setCode(
                permission.getCode()
                        .trim()
                        .toUpperCase()
        );

        permission.setName(
                permission.getName().trim()
        );

        permission.setActive(true);

        return toResponse(
                permissionRepository.save(permission)
        );
    }

    private PermissionResponse toResponse(
            Permission permission
    ) {

        return new PermissionResponse(
                permission.getId(),
                permission.getName(),
                permission.getCode(),
                permission.getDescription(),
                permission.isActive()
        );
    }
}