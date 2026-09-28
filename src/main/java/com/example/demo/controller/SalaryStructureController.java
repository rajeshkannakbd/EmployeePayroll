package com.example.demo.controller;

import com.example.demo.dto.salary.SalaryStructureRequest;
import com.example.demo.entity.SalaryStructure;
import com.example.demo.service.SalaryStructureService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/salary-structures")
public class SalaryStructureController {

    private final SalaryStructureService salaryStructureService;

    public SalaryStructureController(
            SalaryStructureService salaryStructureService) {

        this.salaryStructureService = salaryStructureService;
    }

    // ---------------------------------------------------
    // GET ALL
    // Permission: SALARY_STRUCTURE_VIEW
    // GET /salary-structures
    // ---------------------------------------------------

    @PreAuthorize("hasAuthority('SALARY_STRUCTURE_VIEW')")
    @GetMapping
    public ResponseEntity<List<SalaryStructure>>
    getAllSalaryStructures() {

        return ResponseEntity.ok(
                salaryStructureService.getAllSalaryStructures()
        );
    }

    // ---------------------------------------------------
    // GET BY ID
    // Permission: SALARY_STRUCTURE_VIEW
    // GET /salary-structures/{id}
    // ---------------------------------------------------

    @PreAuthorize("hasAuthority('SALARY_STRUCTURE_VIEW')")
    @GetMapping("/{id}")
    public ResponseEntity<SalaryStructure>
    getSalaryStructureById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                salaryStructureService.getSalaryStructureById(id)
        );
    }

    // ---------------------------------------------------
    // CREATE
    // Permission: SALARY_STRUCTURE_EDIT
    // POST /salary-structures
    // ---------------------------------------------------

    @PreAuthorize("hasAuthority('SALARY_STRUCTURE_EDIT')")
    @PostMapping
    public ResponseEntity<SalaryStructure>
    createSalaryStructure(
            @Valid @RequestBody SalaryStructureRequest request) {

        return ResponseEntity.ok(
                salaryStructureService.createSalaryStructure(request)
        );
    }

    // ---------------------------------------------------
    // UPDATE
    // Permission: SALARY_STRUCTURE_EDIT
    // PUT /salary-structures/{id}
    // ---------------------------------------------------

    @PreAuthorize("hasAuthority('SALARY_STRUCTURE_EDIT')")
    @PutMapping("/{id}")
    public ResponseEntity<SalaryStructure>
    updateSalaryStructure(
            @PathVariable Long id,
            @Valid @RequestBody SalaryStructureRequest request) {

        return ResponseEntity.ok(
                salaryStructureService.updateSalaryStructure(
                        id,
                        request
                )
        );
    }

    // ---------------------------------------------------
    // DELETE
    // Permission: SALARY_STRUCTURE_EDIT
    // DELETE /salary-structures/{id}
    // ---------------------------------------------------

    @PreAuthorize("hasAuthority('SALARY_STRUCTURE_EDIT')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    deleteSalaryStructure(
            @PathVariable Long id) {

        salaryStructureService.deleteSalaryStructure(id);

        return ResponseEntity.noContent().build();
    }
}