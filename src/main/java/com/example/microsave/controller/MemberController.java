package com.example.microsave.controller;

import com.example.microsave.entity.Member;
import com.example.microsave.service.MemberService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/members")
public class MemberController {

    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    @PostMapping
    public ResponseEntity<Member> createMember(
            @Valid @RequestBody Member member) {

        return new ResponseEntity<>(
                memberService.createMember(member),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<List<Member>> getAllMembers() {

        return ResponseEntity.ok(
                memberService.getAllMembers()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Member> getMemberById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                memberService.getMemberById(id)
        );
    }

    @GetMapping("/{id}/balance")
    public ResponseEntity<Map<String, Object>> getMemberBalance(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                memberService.getMemberBalance(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Member> updateMember(
            @PathVariable Long id,
            @Valid @RequestBody Member member) {

        return ResponseEntity.ok(
                memberService.updateMember(id, member)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMember(
            @PathVariable Long id) {

        memberService.deleteMember(id);

        return ResponseEntity.ok(
                "Member deleted successfully"
        );
    }
}