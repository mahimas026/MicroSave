package com.example.microsave.controller;

import com.example.microsave.entity.Member;
import com.example.microsave.service.MemberService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/members")
public class MemberController {

    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    @PostMapping
    public Member createMember(
            @RequestBody Member member) {

        return memberService.createMember(member);
    }

    @GetMapping
    public List<Member> getAllMembers() {
        return memberService.getAllMembers();
    }

    @GetMapping("/{id}")
    public Member getMemberById(
            @PathVariable Long id) {

        return memberService.getMemberById(id);
    }

    @PutMapping("/{id}")
    public Member updateMember(
            @PathVariable Long id,
            @RequestBody Member member) {

        return memberService.updateMember(id, member);
    }

    @DeleteMapping("/{id}")
    public String deleteMember(
            @PathVariable Long id) {

        memberService.deleteMember(id);

        return "Member deleted successfully";
    }
}