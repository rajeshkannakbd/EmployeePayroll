package com.example.demo.service;

import com.example.demo.entity.Employee;
import com.example.demo.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Employee createEmployee(Employee employee) {
        return employeeRepository.save(employee);
    }
    public Employee getEmployeeById(Long id){
    return employeeRepository.findById(id)
         .orElseThrow(() -> new RuntimeException("Employee not found"));
    }
public Employee updateEmployee(Long id, Employee employee) {

    Employee existingEmployee = employeeRepository
            .findById(id)
            .orElseThrow(() ->
                    new RuntimeException("Employee not found"));

    // Basic information
    existingEmployee.setEmployeeCode(
            employee.getEmployeeCode()
    );

    existingEmployee.setFirstName(
            employee.getFirstName()
    );

    existingEmployee.setLastName(
            employee.getLastName()
    );

    existingEmployee.setEmail(
            employee.getEmail()
    );

    existingEmployee.setPhone(
            employee.getPhone()
    );

    existingEmployee.setDesignation(
            employee.getDesignation()
    );

    existingEmployee.setJoiningDate(
            employee.getJoiningDate()
    );

    existingEmployee.setStatus(
            employee.getStatus()
    );

    // Department
    existingEmployee.setDepartment(
            employee.getDepartment()
    );

    // Statutory information
    existingEmployee.setPanNumber(
            employee.getPanNumber()
    );

    existingEmployee.setUanNumber(
            employee.getUanNumber()
    );

    existingEmployee.setBankAccountNumber(
            employee.getBankAccountNumber()
    );

    existingEmployee.setIfscCode(
            employee.getIfscCode()
    );

    // Employment information
    existingEmployee.setEmploymentType(
            employee.getEmploymentType()
    );

    existingEmployee.setLocation(
            employee.getLocation()
    );


    return employeeRepository.save(existingEmployee);
}
    public void deleteEmployee(Long id){
        employeeRepository.findById(id)
        .orElseThrow(()->new RuntimeException("Employee not found"));
          employeeRepository.deleteById(id);
    }
}   