package com.example.microsave.repository;

import com.example.microsave.entity.MemberAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MemberAccountRepository
        extends JpaRepository<MemberAccount, Long> {

    Optional<MemberAccount> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByMemberMemberId(Long memberId);
}