package com.example.microsave.service;

import com.example.microsave.entity.Loan;
import com.example.microsave.entity.Member;
import com.example.microsave.repository.ContributionRepository;
import com.example.microsave.repository.LoanRepository;
import com.example.microsave.repository.MemberRepository;
import com.example.microsave.repository.RepaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class LoanService {

    private final LoanRepository loanRepository;
    private final MemberRepository memberRepository;
    private final ContributionRepository contributionRepository;
    private final RepaymentRepository repaymentRepository;

    public LoanService(
            LoanRepository loanRepository,
            MemberRepository memberRepository,
            ContributionRepository contributionRepository,
            RepaymentRepository repaymentRepository) {

        this.loanRepository = loanRepository;
        this.memberRepository = memberRepository;
        this.contributionRepository = contributionRepository;
        this.repaymentRepository = repaymentRepository;
    }

    @Transactional
    public Loan createLoan(Loan loan) {

        if (loan.getMember() == null ||
                loan.getMember().getMemberId() == null) {

            throw new RuntimeException("Member is required");
        }

        Member member = memberRepository.findById(
                loan.getMember().getMemberId()
        ).orElseThrow(
                () -> new RuntimeException("Member not found")
        );

        // Rule 1:
        // Member with active unpaid loan cannot take another loan.

        List<Loan> activeLoans =
                loanRepository.findByMemberMemberIdAndStatus(
                        member.getMemberId(),
                        Loan.Status.ACTIVE
                );

        for (Loan activeLoan : activeLoans) {

            BigDecimal repayments =
                    repaymentRepository.getTotalRepaymentByLoanId(
                            activeLoan.getLoanId()
                    );

            BigDecimal outstanding =
                    activeLoan.getAmount().subtract(repayments);

            if (outstanding.compareTo(BigDecimal.ZERO) > 0) {

                throw new RuntimeException(
                        "Member already has an active unpaid loan"
                );
            }
        }

        // Calculate total contributions.

        BigDecimal totalContributions =
                contributionRepository
                        .getTotalContributionsByGroupId(
                                member.getGroup().getGroupId()
                        );

        // Calculate outstanding loans.

        List<Loan> groupLoans =
                loanRepository
                        .findByMemberGroupGroupIdAndStatus(
                                member.getGroup().getGroupId(),
                                Loan.Status.ACTIVE
                        );

        BigDecimal outstandingLoans =
                BigDecimal.ZERO;

        for (Loan groupLoan : groupLoans) {

            BigDecimal repayments =
                    repaymentRepository
                            .getTotalRepaymentByLoanId(
                                    groupLoan.getLoanId()
                            );

            BigDecimal outstanding =
                    groupLoan.getAmount()
                            .subtract(repayments);

            if (outstanding.compareTo(BigDecimal.ZERO) > 0) {

                outstandingLoans =
                        outstandingLoans.add(outstanding);
            }
        }

        // Required business rule:
        // Available pool = total contributions - outstanding loans.

        BigDecimal availablePool =
                totalContributions.subtract(outstandingLoans);

        if (loan.getAmount().compareTo(availablePool) > 0) {

            throw new RuntimeException(
                    "Loan amount exceeds group's available pool. " +
                    "Available pool: " + availablePool
            );
        }

        loan.setMember(member);

        if (loan.getLoanDate() == null) {
            loan.setLoanDate(LocalDate.now());
        }

        loan.setStatus(Loan.Status.ACTIVE);

        return loanRepository.save(loan);
    }

    public List<Loan> getAllLoans() {
        return loanRepository.findAll();
    }

    public Loan getLoanById(Long id) {

        return loanRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException("Loan not found")
                );
    }

    public Loan updateLoan(Long id, Loan loan) {

        Loan existingLoan = getLoanById(id);

        existingLoan.setAmount(loan.getAmount());

        if (loan.getLoanDate() != null) {
            existingLoan.setLoanDate(loan.getLoanDate());
        }

        if (loan.getStatus() != null) {
            existingLoan.setStatus(loan.getStatus());
        }

        if (loan.getMember() != null &&
                loan.getMember().getMemberId() != null) {

            Member member = memberRepository.findById(
                    loan.getMember().getMemberId()
            ).orElseThrow(
                    () -> new RuntimeException("Member not found")
            );

            existingLoan.setMember(member);
        }

        return loanRepository.save(existingLoan);
    }

    public void deleteLoan(Long id) {

        Loan loan = getLoanById(id);

        loanRepository.delete(loan);
    }
}