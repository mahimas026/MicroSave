package com.example.microsave.service;

import com.example.microsave.entity.Contribution;
import com.example.microsave.entity.Member;
import com.example.microsave.repository.ContributionRepository;
import com.example.microsave.repository.MemberRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContributionService {

    private final ContributionRepository contributionRepository;
    private final MemberRepository memberRepository;

    public ContributionService(
            ContributionRepository contributionRepository,
            MemberRepository memberRepository) {

        this.contributionRepository = contributionRepository;
        this.memberRepository = memberRepository;
    }

    public Contribution createContribution(
            Contribution contribution) {

        if (contribution.getMember() == null ||
                contribution.getMember().getMemberId() == null) {

            throw new RuntimeException("Member is required");
        }

        Member member = memberRepository.findById(
                contribution.getMember().getMemberId()
        ).orElseThrow(() ->
                new RuntimeException("Member not found"));

        contribution.setMember(member);

        return contributionRepository.save(contribution);
    }

    public List<Contribution> getAllContributions() {
        return contributionRepository.findAll();
    }

    public Contribution getContributionById(Long id) {

        return contributionRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Contribution not found"));
    }

    public Contribution updateContribution(
            Long id,
            Contribution contribution) {

        Contribution existing =
                getContributionById(id);

        existing.setAmount(
                contribution.getAmount()
        );

        existing.setContributionDate(
                contribution.getContributionDate()
        );

        if (contribution.getMember() != null &&
                contribution.getMember().getMemberId() != null) {

            Member member = memberRepository.findById(
                    contribution.getMember().getMemberId()
            ).orElseThrow(() ->
                    new RuntimeException("Member not found"));

            existing.setMember(member);
        }

        return contributionRepository.save(existing);
    }

    public void deleteContribution(Long id) {

        Contribution contribution =
                getContributionById(id);

        contributionRepository.delete(contribution);
    }
}