package com.example.microsave.controller;

import com.example.microsave.entity.Repayment;
import com.example.microsave.service.RepaymentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/repayments")
public class RepaymentController {

    private final RepaymentService repaymentService;

    public RepaymentController(
            RepaymentService repaymentService) {

        this.repaymentService = repaymentService;
    }

    @PostMapping
    public Repayment createRepayment(
            @RequestBody Repayment repayment) {

        return repaymentService
                .createRepayment(repayment);
    }

    @GetMapping
    public List<Repayment> getAllRepayments() {

        return repaymentService
                .getAllRepayments();
    }

    @GetMapping("/{id}")
    public Repayment getRepaymentById(
            @PathVariable Long id) {

        return repaymentService
                .getRepaymentById(id);
    }

    @PutMapping("/{id}")
    public Repayment updateRepayment(
            @PathVariable Long id,
            @RequestBody Repayment repayment) {

        return repaymentService
                .updateRepayment(id, repayment);
    }

    @DeleteMapping("/{id}")
    public String deleteRepayment(
            @PathVariable Long id) {

        repaymentService
                .deleteRepayment(id);

        return "Repayment deleted successfully";
    }
}