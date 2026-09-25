package com.example.demo.controller;

import com.example.demo.dto.salary.SalaryStructureRequest;
import com.example.demo.entity.SalaryStructure;
import com.example.demo.service.SalaryStructureService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
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
    // GET /salary-structures
    // ---------------------------------------------------

    @GetMapping
    public ResponseEntity<List<SalaryStructure>>
    getAllSalaryStructures() {

        return ResponseEntity.ok(
                salaryStructureService.getAllSalaryStructures()
        );
    }

    // ---------------------------------------------------
    // GET BY ID
    // GET /salary-structures/{id}
    // ---------------------------------------------------

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
    // POST /salary-structures
    // ---------------------------------------------------

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
    // PUT /salary-structures/{id}
    // ---------------------------------------------------

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
    // DELETE /salary-structures/{id}
    // ---------------------------------------------------

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    deleteSalaryStructure(
            @PathVariable Long id) {

        salaryStructureService.deleteSalaryStructure(id);

        return ResponseEntity.noContent().build();
    }
}