package com.example.demo.mapper;

import com.example.demo.dto.employee.EmployeeRequest;
import com.example.demo.dto.employee.EmployeeResponse;
import com.example.demo.entity.Employee;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(
    componentModel = "spring"
)
public interface EmployeeMapper {

    @Mapping(target = "employeeId", ignore = true)
    @Mapping(target = "employeeCode", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "mustChangePassword", ignore = true)
    @Mapping(target = "department", ignore = true)
    Employee toEntity(EmployeeRequest request);


    @Mapping(target = "employeeId", ignore = true)
    @Mapping(target = "employeeCode", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "mustChangePassword", ignore = true)
    @Mapping(target = "department", ignore = true)
    void updateEntity(
        EmployeeRequest request,
        @MappingTarget Employee employee
    );


    @Mapping(
        target = "departmentId",
        source = "department.departmentId"
    )
    @Mapping(
        target = "departmentName",
        source = "department.departmentName"
    )
    EmployeeResponse toResponse(Employee employee);
}