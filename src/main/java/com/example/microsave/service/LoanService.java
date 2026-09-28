package com.example.microsave.service;

import com.example.microsave.entity.Loan;
import com.example.microsave.entity.Member;
import com.example.microsave.repository.ContributionRepository;
import com.example.microsave.repository.LoanRepository;
import com.example.microsave.repository.MemberRepository;
import com.example.microsave.repository.RepaymentRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
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

    public Loan createLoan(Loan loan) {

        if (loan.getMember() == null ||
                loan.getMember().getMemberId() == null) {

            throw new RuntimeException("Member is required");
        }

        Member member = memberRepository.findById(
                loan.getMember().getMemberId()
        ).orElseThrow(() ->
                new RuntimeException("Member not found"));

        boolean hasActiveLoan =
                loanRepository
                        .existsByMemberMemberIdAndStatus(
                                member.getMemberId(),
                                Loan.Status.ACTIVE
                        );

        if (hasActiveLoan) {
            throw new RuntimeException(
                    "Member already has an active loan"
            );
        }

        if (loan.getAmount() == null ||
                loan.getAmount().compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Loan amount must be greater than zero"
            );
        }

        loan.setMember(member);

        if (loan.getStatus() == null) {
            loan.setStatus(Loan.Status.ACTIVE);
        }

        return loanRepository.save(loan);
    }

    public List<Loan> getAllLoans() {
        return loanRepository.findAll();
    }

    public Loan getLoanById(Long id) {

        return loanRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Loan not found"));
    }

    public Loan updateLoan(
            Long id,
            Loan loan) {

        Loan existingLoan = getLoanById(id);

        existingLoan.setAmount(
                loan.getAmount()
        );

        existingLoan.setLoanDate(
                loan.getLoanDate()
        );

        if (loan.getStatus() != null) {
            existingLoan.setStatus(
                    loan.getStatus()
            );
        }

        if (loan.getMember() != null &&
                loan.getMember().getMemberId() != null) {

            Member member = memberRepository.findById(
                    loan.getMember().getMemberId()
            ).orElseThrow(() ->
                    new RuntimeException("Member not found"));

            existingLoan.setMember(member);
        }

        return loanRepository.save(existingLoan);
    }

    public void deleteLoan(Long id) {

        Loan loan = getLoanById(id);

        loanRepository.delete(loan);
    }

    public BigDecimal getGroupAvailableBalance(Long groupId) {

        BigDecimal totalContributions =
                contributionRepository
                        .getTotalContributionsByGroupId(
                                groupId
                        );

        BigDecimal outstandingLoans =
                BigDecimal.ZERO;

        List<Loan> loans = loanRepository.findAll();

        for (Loan loan : loans) {

            if (loan.getMember() != null &&
                    loan.getMember().getGroup() != null &&
                    loan.getMember()
                            .getGroup()
                            .getGroupId()
                            .equals(groupId) &&
                    loan.getStatus() == Loan.Status.ACTIVE) {

                BigDecimal repayments =
                        repaymentRepository
                                .getTotalRepaymentByLoanId(
                                        loan.getLoanId()
                                );

                BigDecimal remaining =
                        loan.getAmount()
                                .subtract(repayments);

                if (remaining.compareTo(BigDecimal.ZERO) > 0) {
                    outstandingLoans =
                            outstandingLoans.add(remaining);
                }
            }
        }

        return totalContributions
                .subtract(outstandingLoans);
    }
}