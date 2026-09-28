package com.example.microsave.controller;

import com.example.microsave.entity.Contribution;
import com.example.microsave.service.ContributionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/contributions")
public class ContributionController {

    private final ContributionService contributionService;

    public ContributionController(
            ContributionService contributionService) {

        this.contributionService = contributionService;
    }

    @PostMapping
    public Contribution createContribution(
            @RequestBody Contribution contribution) {

        return contributionService
                .createContribution(contribution);
    }

    @GetMapping
    public List<Contribution> getAllContributions() {

        return contributionService
                .getAllContributions();
    }

    @GetMapping("/{id}")
    public Contribution getContributionById(
            @PathVariable Long id) {

        return contributionService
                .getContributionById(id);
    }

    @PutMapping("/{id}")
    public Contribution updateContribution(
            @PathVariable Long id,
            @RequestBody Contribution contribution) {

        return contributionService
                .updateContribution(id, contribution);
    }

    @DeleteMapping("/{id}")
    public String deleteContribution(
            @PathVariable Long id) {

        contributionService
                .deleteContribution(id);

        return "Contribution deleted successfully";
    }
}