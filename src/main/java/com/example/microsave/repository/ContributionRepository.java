package com.example.microsave.repository;

import com.example.microsave.entity.Contribution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;

public interface ContributionRepository
        extends JpaRepository<Contribution, Long> {

    @Query("""
            SELECT COALESCE(SUM(c.amount), 0)
            FROM Contribution c
            WHERE c.member.group.groupId = :groupId
            """)
    BigDecimal getTotalContributionsByGroupId(
            @Param("groupId") Long groupId
    );

    @Query("""
            SELECT COALESCE(SUM(c.amount), 0)
            FROM Contribution c
            WHERE c.member.memberId = :memberId
            """)
    BigDecimal getTotalContributionsByMemberId(
            @Param("memberId") Long memberId
    );
}