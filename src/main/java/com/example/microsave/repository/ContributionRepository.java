package com.example.microsave.service;

import com.example.microsave.entity.Group;
import com.example.microsave.entity.Loan;
import com.example.microsave.entity.Member;
import com.example.microsave.repository.ContributionRepository;
import com.example.microsave.repository.GroupRepository;
import com.example.microsave.repository.LoanRepository;
import com.example.microsave.repository.MemberRepository;
import com.example.microsave.repository.RepaymentRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ContributionRepository {

    private final MemberRepository memberRepository;
    private final GroupRepository groupRepository;
    private final ContributionRepository contributionRepository;
    private final LoanRepository loanRepository;
    private final RepaymentRepository repaymentRepository;

    public ContributionRepository(
            MemberRepository memberRepository,
            GroupRepository groupRepository,
            ContributionRepository contributionRepository,
            LoanRepository loanRepository,
            RepaymentRepository repaymentRepository) {

        this.memberRepository = memberRepository;
        this.groupRepository = groupRepository;
        this.contributionRepository = contributionRepository;
        this.loanRepository = loanRepository;
        this.repaymentRepository = repaymentRepository;
    }

    // CREATE MEMBER
    public Member createMember(Member member) {

        if (member.getGroup() == null ||
                member.getGroup().getGroupId() == null) {

            throw new RuntimeException("Group is required");
        }

        Group group = groupRepository.findById(
                member.getGroup().getGroupId()
        ).orElseThrow(
                () -> new RuntimeException("Group not found")
        );

        member.setGroup(group);

        return memberRepository.save(member);
    }

    // GET ALL MEMBERS
    public List<Member> getAllMembers() {

        return memberRepository.findAll();
    }

    // GET MEMBER BY ID
    public Member getMemberById(Long id) {

        return memberRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException("Member not found")
                );
    }

    // UPDATE MEMBER
    public Member updateMember(
            Long id,
            Member member) {

        Member existingMember = getMemberById(id);

        existingMember.setMemberName(
                member.getMemberName()
        );

        existingMember.setPhone(
                member.getPhone()
        );

        // Update group if a new group is provided
        if (member.getGroup() != null &&
                member.getGroup().getGroupId() != null) {

            Group group = groupRepository.findById(
                    member.getGroup().getGroupId()
            ).orElseThrow(
                    () -> new RuntimeException("Group not found")
            );

            existingMember.setGroup(group);
        }

        return memberRepository.save(existingMember);
    }

    // DELETE MEMBER
    public void deleteMember(Long id) {

        Member member = getMemberById(id);

        memberRepository.delete(member);
    }

    // GET MEMBER SAVINGS BALANCE AND OUTSTANDING LOAN
    public Map<String, Object> getMemberBalance(Long memberId) {

        // Check whether member exists
        Member member = getMemberById(memberId);

        /*
         * Calculate THIS MEMBER'S total savings.
         *
         * Example:
         *
         * Member 1:
         * Contribution 500
         * Contribution 500
         * Contribution 1000
         *
         * Savings balance = 2000
         */
        BigDecimal totalSavings =
                contributionRepository
                        .getTotalContributionsByMemberId(
                                memberId
                        );

        /*
         * Find all ACTIVE loans of this member.
         */
        List<Loan> activeLoans =
                loanRepository
                        .findByMemberMemberIdAndStatus(
                                memberId,
                                Loan.Status.ACTIVE
                        );

        /*
         * Calculate total outstanding loan.
         *
         * Outstanding loan =
         * Loan amount - Total repayments
         */
        BigDecimal outstandingLoan =
                BigDecimal.ZERO;

        for (Loan loan : activeLoans) {

            BigDecimal totalRepayments =
                    repaymentRepository
                            .getTotalRepaymentByLoanId(
                                    loan.getLoanId()
                            );

            BigDecimal remainingAmount =
                    loan.getAmount()
                            .subtract(totalRepayments);

            /*
             * Only add positive outstanding amount.
             */
            if (remainingAmount.compareTo(
                    BigDecimal.ZERO) > 0) {

                outstandingLoan =
                        outstandingLoan.add(
                                remainingAmount
                        );
            }
        }

        /*
         * Prepare response.
         */
        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "memberId",
                member.getMemberId()
        );

        response.put(
                "memberName",
                member.getMemberName()
        );

        response.put(
                "savingsBalance",
                totalSavings
        );

        response.put(
                "outstandingLoan",
                outstandingLoan
        );

        return response;
    }
}