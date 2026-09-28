package com.example.microsave.service;

import com.example.microsave.entity.Loan;
import com.example.microsave.entity.Repayment;
import com.example.microsave.repository.LoanRepository;
import com.example.microsave.repository.RepaymentRepository;
import org.springframework.stereotype.Service;

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

    public Repayment createRepayment(
            Repayment repayment) {

        if (repayment.getLoan() == null ||
                repayment.getLoan().getLoanId() == null) {

            throw new RuntimeException("Loan is required");
        }

        Loan loan = loanRepository.findById(
                repayment.getLoan().getLoanId()
        ).orElseThrow(() ->
                new RuntimeException("Loan not found"));

        if (loan.getStatus() != Loan.Status.ACTIVE) {

            throw new RuntimeException(
                    "Loan is not active"
            );
        }

        if (repayment.getAmount() == null ||
                repayment.getAmount()
                        .compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Repayment amount must be greater than zero"
            );
        }

        BigDecimal alreadyPaid =
                repaymentRepository
                        .getTotalRepaymentByLoanId(
                                loan.getLoanId()
                        );

        BigDecimal remaining =
                loan.getAmount().subtract(alreadyPaid);

        if (repayment.getAmount()
                .compareTo(remaining) > 0) {

            throw new RuntimeException(
                    "Repayment cannot be greater than outstanding loan"
            );
        }

        repayment.setLoan(loan);

        Repayment saved =
                repaymentRepository.save(repayment);

        BigDecimal newTotal =
                alreadyPaid.add(repayment.getAmount());

        if (newTotal.compareTo(loan.getAmount()) == 0) {

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
                .orElseThrow(() ->
                        new RuntimeException(
                                "Repayment not found"));
    }

    public Repayment updateRepayment(
            Long id,
            Repayment repayment) {

        Repayment existing =
                getRepaymentById(id);

        existing.setAmount(
                repayment.getAmount()
        );

        existing.setRepaymentDate(
                repayment.getRepaymentDate()
        );

        if (repayment.getLoan() != null &&
                repayment.getLoan().getLoanId() != null) {

            Loan loan = loanRepository.findById(
                    repayment.getLoan().getLoanId()
            ).orElseThrow(() ->
                    new RuntimeException("Loan not found"));

            existing.setLoan(loan);
        }

        return repaymentRepository.save(existing);
    }

    public void deleteRepayment(Long id) {

        Repayment repayment =
                getRepaymentById(id);

        repaymentRepository.delete(repayment);
    }
}