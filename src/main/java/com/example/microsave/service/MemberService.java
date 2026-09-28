package com.example.microsave.service;

import com.example.microsave.entity.Group;
import com.example.microsave.entity.Member;
import com.example.microsave.repository.GroupRepository;
import com.example.microsave.repository.MemberRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MemberService {

    private final MemberRepository memberRepository;
    private final GroupRepository groupRepository;

    public MemberService(
            MemberRepository memberRepository,
            GroupRepository groupRepository) {

        this.memberRepository = memberRepository;
        this.groupRepository = groupRepository;
    }

    public Member createMember(Member member) {

        if (member.getGroup() == null ||
                member.getGroup().getGroupId() == null) {

            throw new RuntimeException("Group is required");
        }

        Group group = groupRepository.findById(
                member.getGroup().getGroupId()
        ).orElseThrow(() ->
                new RuntimeException("Group not found")
        );

        member.setGroup(group);

        return memberRepository.save(member);
    }

    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }

    public Member getMemberById(Long id) {

        return memberRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Member not found")
                );
    }

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

        if (member.getGroup() != null &&
                member.getGroup().getGroupId() != null) {

            Group group = groupRepository.findById(
                    member.getGroup().getGroupId()
            ).orElseThrow(() ->
                    new RuntimeException("Group not found")
            );

            existingMember.setGroup(group);
        }

        return memberRepository.save(existingMember);
    }

    public void deleteMember(Long id) {

        Member member = getMemberById(id);

        memberRepository.delete(member);
    }
}