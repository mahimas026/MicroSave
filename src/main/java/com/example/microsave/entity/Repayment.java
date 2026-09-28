package com.example.microsave.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "repayments")
public class Repayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long repaymentId;

    @NotNull(message = "Loan is required")
    @ManyToOne
    @JoinColumn(name = "loan_id", nullable = false)
    private Loan loan;

    @NotNull(message = "Repayment amount is required")
    @Positive(message = "Repayment amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Repayment date is required")
    private LocalDate repaymentDate;

    public Repayment() {
    }

    public Repayment(Long repaymentId, Loan loan,
                     BigDecimal amount, LocalDate repaymentDate) {
        this.repaymentId = repaymentId;
        this.loan = loan;
        this.amount = amount;
        this.repaymentDate = repaymentDate;
    }

    public Long getRepaymentId() {
        return repaymentId;
    }

    public void setRepaymentId(Long repaymentId) {
        this.repaymentId = repaymentId;
    }

    public Loan getLoan() {
        return loan;
    }

    public void setLoan(Loan loan) {
        this.loan = loan;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getRepaymentDate() {
        return repaymentDate;
    }

    public void setRepaymentDate(LocalDate repaymentDate) {
        this.repaymentDate = repaymentDate;
    }
}