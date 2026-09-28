package com.example.microsave.repository;

import com.example.microsave.entity.Repayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;

public interface RepaymentRepository
        extends JpaRepository<Repayment, Long> {

    @Query("""
            SELECT COALESCE(SUM(r.amount), 0)
            FROM Repayment r
            WHERE r.loan.loanId = :loanId
            """)
    BigDecimal getTotalRepaymentByLoanId(
            @Param("loanId") Long loanId
    );
}