package com.example.demo.mapper;

import com.example.demo.dto.department.DepartmentRequest;
import com.example.demo.dto.department.DepartmentResponse;
import com.example.demo.entity.Department;
import org.mapstruct.Mapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface DepartmentMapper {

    Department toEntity(DepartmentRequest request);

    DepartmentResponse toResponse(Department department);

    void updateEntity(
            DepartmentRequest request,
            @MappingTarget Department department
    );
}