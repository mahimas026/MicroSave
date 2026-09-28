package com.example.microsave.controller;

import com.example.microsave.entity.Loan;
import com.example.microsave.service.LoanService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/loans")
public class LoanController {

    private final LoanService loanService;

    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    @PostMapping
    public Loan createLoan(
            @RequestBody Loan loan) {

        return loanService.createLoan(loan);
    }

    @GetMapping
    public List<Loan> getAllLoans() {
        return loanService.getAllLoans();
    }

    @GetMapping("/{id}")
    public Loan getLoanById(
            @PathVariable Long id) {

        return loanService.getLoanById(id);
    }

    @PutMapping("/{id}")
    public Loan updateLoan(
            @PathVariable Long id,
            @RequestBody Loan loan) {

        return loanService.updateLoan(id, loan);
    }

    @DeleteMapping("/{id}")
    public String deleteLoan(
            @PathVariable Long id) {

        loanService.deleteLoan(id);

        return "Loan deleted successfully";
    }

    @GetMapping("/group/{groupId}/balance")
    public BigDecimal getGroupBalance(
            @PathVariable Long groupId) {

        return loanService
                .getGroupAvailableBalance(groupId);
    }
}