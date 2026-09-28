package com.example.microsave.controller;

import com.example.microsave.entity.Loan;
import com.example.microsave.service.LoanService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/loans")
public class LoanController {

    private final LoanService loanService;

    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    @PostMapping
    public ResponseEntity<Loan> createLoan(
            @Valid @RequestBody Loan loan) {

        return new ResponseEntity<>(
                loanService.createLoan(loan),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<List<Loan>> getAllLoans() {

        return ResponseEntity.ok(
                loanService.getAllLoans()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Loan> getLoanById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                loanService.getLoanById(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Loan> updateLoan(
            @PathVariable Long id,
            @Valid @RequestBody Loan loan) {

        return ResponseEntity.ok(
                loanService.updateLoan(id, loan)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteLoan(
            @PathVariable Long id) {

        loanService.deleteLoan(id);

        return ResponseEntity.ok(
                "Loan deleted successfully"
        );
    }
}