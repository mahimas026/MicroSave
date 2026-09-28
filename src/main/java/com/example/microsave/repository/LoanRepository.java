package com.example.microsave.repository;

import com.example.microsave.entity.Loan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoanRepository extends JpaRepository<Loan, Long> {

    List<Loan> findByMemberMemberIdAndStatus(
            Long memberId,
            Loan.Status status
    );

    boolean existsByMemberMemberIdAndStatus(
            Long memberId,
            Loan.Status status
    );
}