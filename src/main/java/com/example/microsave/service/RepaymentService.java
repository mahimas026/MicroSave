package com.example.microsave.service;

import com.example.microsave.entity.Loan;
import com.example.microsave.entity.Repayment;
import com.example.microsave.repository.LoanRepository;
import com.example.microsave.repository.RepaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class RepaymentService {

    private final RepaymentRepository repaymentRepository;
    private final LoanRepository loanRepository;

    public RepaymentService(
            RepaymentRepository repaymentRepository,
            LoanRepository loanRepository) {

        this.repaymentRepository = repaymentRepository;
        this.loanRepository = loanRepository;
    }

    @Transactional
    public Repayment createRepayment(Repayment repayment) {

        if (repayment.getLoan() == null ||
                repayment.getLoan().getLoanId() == null) {

            throw new RuntimeException("Loan is required");
        }

        Loan loan = loanRepository.findById(
                repayment.getLoan().getLoanId()
        ).orElseThrow(
                () -> new RuntimeException("Loan not found")
        );

        if (loan.getStatus() != Loan.Status.ACTIVE) {

            throw new RuntimeException(
                    "Repayment can only be made against an active loan"
            );
        }

        BigDecimal previousRepayments =
                repaymentRepository.getTotalRepaymentByLoanId(
                        loan.getLoanId()
                );

        BigDecimal remainingAmount =
                loan.getAmount().subtract(previousRepayments);

        if (repayment.getAmount().compareTo(remainingAmount) > 0) {

            throw new RuntimeException(
                    "Repayment amount cannot exceed outstanding loan"
            );
        }

        repayment.setLoan(loan);

        Repayment saved =
                repaymentRepository.save(repayment);

        BigDecimal totalRepayments =
                previousRepayments.add(repayment.getAmount());

        if (totalRepayments.compareTo(loan.getAmount()) == 0) {

            loan.setStatus(Loan.Status.COMPLETED);

            loanRepository.save(loan);
        }

        return saved;
    }

    public List<Repayment> getAllRepayments() {
        return repaymentRepository.findAll();
    }

    public Repayment getRepaymentById(Long id) {

        return repaymentRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Repayment not found"
                        )
                );
    }

    public Repayment updateRepayment(
            Long id,
            Repayment repayment) {

        Repayment existing =
                getRepaymentById(id);

        existing.setAmount(repayment.getAmount());
        existing.setRepaymentDate(
                repayment.getRepaymentDate()
        );

        return repaymentRepository.save(existing);
    }

    public void deleteRepayment(Long id) {

        Repayment repayment =
                getRepaymentById(id);

        repaymentRepository.delete(repayment);
    }
}