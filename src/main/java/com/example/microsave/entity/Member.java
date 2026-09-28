package com.example.microsave.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "members")
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long memberId;

    @NotBlank(message = "Member name is required")
    private String memberName;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotNull(message = "Group is required")
    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    public Member() {
    }

    public Member(Long memberId, String memberName, String phone, Group group) {
        this.memberId = memberId;
        this.memberName = memberName;
        this.phone = phone;
        this.group = group;
    }

    public Long getMemberId() {
        return memberId;
    }

    public void setMemberId(Long memberId) {
        this.memberId = memberId;
    }

    public String getMemberName() {
        return memberName;
    }

    public void setMemberName(String memberName) {
        this.memberName = memberName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Group getGroup() {
        return group;
    }

    public void setGroup(Group group) {
        this.group = group;
    }
}