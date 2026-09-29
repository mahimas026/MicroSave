package com.example.microsave.service;

import com.example.microsave.entity.Member;
import com.example.microsave.entity.MemberAccount;
import com.example.microsave.repository.MemberAccountRepository;
import com.example.microsave.repository.MemberRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final MemberRepository memberRepository;
    private final MemberAccountRepository memberAccountRepository;

    public AuthService(
            MemberRepository memberRepository,
            MemberAccountRepository memberAccountRepository) {

        this.memberRepository = memberRepository;
        this.memberAccountRepository = memberAccountRepository;
    }

    // MEMBER REGISTER
    public MemberAccount register(
            Long memberId,
            String memberName,
            String phone,
            String username,
            String password) {

        // Check member exists
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Member not found. Only existing group members can register."
                        ));

        // Check member belongs to a group
        if (member.getGroup() == null) {
            throw new RuntimeException(
                    "Member is not assigned to any group"
            );
        }

        // Verify name
        if (!member.getMemberName().equalsIgnoreCase(memberName)) {
            throw new RuntimeException("Member name does not match");
        }

        // Verify phone
        if (!member.getPhone().equals(phone)) {
            throw new RuntimeException("Phone number does not match");
        }

        // Username already exists
        if (memberAccountRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }

        // Member already has account
        if (memberAccountRepository.existsByMemberMemberId(memberId)) {
            throw new RuntimeException(
                    "This member already has an account"
            );
        }

        MemberAccount account = new MemberAccount();

        account.setUsername(username);
        account.setPassword(password);
        account.setMember(member);

        return memberAccountRepository.save(account);
    }


    // LOGIN
    public MemberAccount login(
            String username,
            String password) {

        MemberAccount account =
                memberAccountRepository.findByUsername(username)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Username not found"
                                ));

        if (!account.getPassword().equals(password)) {
            throw new RuntimeException(
                    "Invalid password"
            );
        }

        return account;
    }
}