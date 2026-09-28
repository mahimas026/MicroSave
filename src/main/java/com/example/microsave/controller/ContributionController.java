package com.example.microsave.controller;

import com.example.microsave.entity.Contribution;
import com.example.microsave.service.ContributionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<Contribution> createContribution(
            @Valid @RequestBody Contribution contribution) {

        return new ResponseEntity<>(
                contributionService.createContribution(contribution),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<List<Contribution>> getAllContributions() {

        return ResponseEntity.ok(
                contributionService.getAllContributions()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Contribution> getContributionById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                contributionService.getContributionById(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Contribution> updateContribution(
            @PathVariable Long id,
            @Valid @RequestBody Contribution contribution) {

        return ResponseEntity.ok(
                contributionService.updateContribution(
                        id,
                        contribution
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteContribution(
            @PathVariable Long id) {

        contributionService.deleteContribution(id);

        return ResponseEntity.ok(
                "Contribution deleted successfully"
        );
    }
}