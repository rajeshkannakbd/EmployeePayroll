package com.example.demo.service;

import com.example.demo.entity.SalaryTemplate;
import com.example.demo.repository.SalaryTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SalaryTemplateService {

    private final SalaryTemplateRepository salaryTemplateRepository;

    @Transactional(readOnly = true)
    public List<SalaryTemplate> getAllTemplates() {
        return salaryTemplateRepository.findAll();
    }

    @Transactional(readOnly = true)
    public SalaryTemplate getTemplateById(Long id) {
        return salaryTemplateRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Salary template not found"));
    }

    @Transactional
    public SalaryTemplate createTemplate(SalaryTemplate template) {

        if (salaryTemplateRepository
                .existsByTemplateName(template.getTemplateName())) {

            throw new RuntimeException(
                    "Salary template already exists");
        }

        normalizeValues(template);

        return salaryTemplateRepository.save(template);
    }

    @Transactional
    public SalaryTemplate updateTemplate(
            Long id,
            SalaryTemplate template) {

        SalaryTemplate existing =
                salaryTemplateRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Salary template not found"));

        existing.setTemplateName(template.getTemplateName());
        existing.setDescription(template.getDescription());
        existing.setBasicSalary(template.getBasicSalary());

        existing.setHra(zeroIfNull(template.getHra()));
        existing.setConveyance(zeroIfNull(template.getConveyance()));
        existing.setSpecialAllowance(
                zeroIfNull(template.getSpecialAllowance()));
        existing.setOtherAllowance(
                zeroIfNull(template.getOtherAllowance()));

        existing.setEpf(zeroIfNull(template.getEpf()));
        existing.setProfessionalTax(
                zeroIfNull(template.getProfessionalTax()));
        existing.setTds(zeroIfNull(template.getTds()));
        existing.setOtherDeductions(
                zeroIfNull(template.getOtherDeductions()));

        existing.setActive(template.getActive());

        return salaryTemplateRepository.save(existing);
    }

    @Transactional
    public void deleteTemplate(Long id) {

        SalaryTemplate template =
                salaryTemplateRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Salary template not found"));

        salaryTemplateRepository.delete(template);
    }

    public BigDecimal calculateGrossSalary(
            SalaryTemplate template) {

        return zeroIfNull(template.getBasicSalary())
                .add(zeroIfNull(template.getHra()))
                .add(zeroIfNull(template.getConveyance()))
                .add(zeroIfNull(template.getSpecialAllowance()))
                .add(zeroIfNull(template.getOtherAllowance()));
    }

    private void normalizeValues(SalaryTemplate template) {

        template.setBasicSalary(
                zeroIfNull(template.getBasicSalary()));

        template.setHra(
                zeroIfNull(template.getHra()));

        template.setConveyance(
                zeroIfNull(template.getConveyance()));

        template.setSpecialAllowance(
                zeroIfNull(template.getSpecialAllowance()));

        template.setOtherAllowance(
                zeroIfNull(template.getOtherAllowance()));

        template.setEpf(
                zeroIfNull(template.getEpf()));

        template.setProfessionalTax(
                zeroIfNull(template.getProfessionalTax()));

        template.setTds(
                zeroIfNull(template.getTds()));

        template.setOtherDeductions(
                zeroIfNull(template.getOtherDeductions()));
    }

    private BigDecimal zeroIfNull(BigDecimal value) {
        return value != null
                ? value
                : BigDecimal.ZERO;
    }
}