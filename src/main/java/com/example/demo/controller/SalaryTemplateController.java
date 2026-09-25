package com.example.demo.controller;

import com.example.demo.entity.SalaryTemplate;
import com.example.demo.service.SalaryTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/salary-templates")
@RequiredArgsConstructor
public class SalaryTemplateController {

    private final SalaryTemplateService salaryTemplateService;

    @GetMapping
    public List<SalaryTemplate> getAllTemplates() {
        return salaryTemplateService.getAllTemplates();
    }

    @GetMapping("/{id}")
    public SalaryTemplate getTemplateById(
            @PathVariable Long id) {

        return salaryTemplateService.getTemplateById(id);
    }

    @PostMapping
    public SalaryTemplate createTemplate(
            @RequestBody SalaryTemplate template) {

        return salaryTemplateService.createTemplate(template);
    }

    @PutMapping("/{id}")
    public SalaryTemplate updateTemplate(
            @PathVariable Long id,
            @RequestBody SalaryTemplate template) {

        return salaryTemplateService.updateTemplate(id, template);
    }

    @DeleteMapping("/{id}")
    public String deleteTemplate(
            @PathVariable Long id) {

        salaryTemplateService.deleteTemplate(id);

        return "Salary template deleted successfully";
    }
}