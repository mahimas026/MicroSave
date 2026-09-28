package com.example.microsave.controller;

import com.example.microsave.entity.Repayment;
import com.example.microsave.service.RepaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/repayments")
public class RepaymentController {

    private final RepaymentService repaymentService;

    public RepaymentController(RepaymentService repaymentService) {
        this.repaymentService = repaymentService;
    }

    @PostMapping
    public ResponseEntity<Repayment> createRepayment(
            @Valid @RequestBody Repayment repayment) {

        return new ResponseEntity<>(
                repaymentService.createRepayment(repayment),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<List<Repayment>> getAllRepayments() {

        return ResponseEntity.ok(
                repaymentService.getAllRepayments()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Repayment> getRepaymentById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                repaymentService.getRepaymentById(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Repayment> updateRepayment(
            @PathVariable Long id,
            @Valid @RequestBody Repayment repayment) {

        return ResponseEntity.ok(
                repaymentService.updateRepayment(
                        id,
                        repayment
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteRepayment(
            @PathVariable Long id) {

        repaymentService.deleteRepayment(id);

        return ResponseEntity.ok(
                "Repayment deleted successfully"
        );
    }
}