package com.example.microsave.repository;

import com.example.microsave.entity.Loan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {

    List<Loan> findByMemberMemberIdAndStatus(
            Long memberId,
            Loan.Status status
    );

    List<Loan> findByMemberGroupGroupIdAndStatus(
            Long groupId,
            Loan.Status status
    );
}
