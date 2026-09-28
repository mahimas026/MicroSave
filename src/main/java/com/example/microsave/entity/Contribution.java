package com.example.microsave.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "contributions")
public class Contribution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long contributionId;

    @NotNull(message = "Member is required")
    @ManyToOne
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @NotNull(message = "Amount is required")
    @Positive(message = "Contribution amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Contribution date is required")
    private LocalDate contributionDate;

    public Contribution() {
    }

    public Contribution(Long contributionId, Member member,
                         BigDecimal amount, LocalDate contributionDate) {
        this.contributionId = contributionId;
        this.member = member;
        this.amount = amount;
        this.contributionDate = contributionDate;
    }

    public Long getContributionId() {
        return contributionId;
    }

    public void setContributionId(Long contributionId) {
        this.contributionId = contributionId;
    }

    public Member getMember() {
        return member;
    }

    public void setMember(Member member) {
        this.member = member;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getContributionDate() {
        return contributionDate;
    }

    public void setContributionDate(LocalDate contributionDate) {
        this.contributionDate = contributionDate;
    }
}