package com.club.backend.dto;

import java.time.Instant;
import java.util.UUID;

import com.club.backend.entity.Membership;
import com.club.backend.entity.MembershipPosition;
import com.club.backend.entity.MembershipStatus;
import com.club.backend.entity.Role;

public record MembershipResponse(
        UUID id,
        UUID userId,
        String userName,
        String userEmail,
        Role userRole,
        Boolean userActive,
        UUID clubId,
        String clubName,
        MembershipPosition position,
        MembershipStatus status,
        Instant joinedAt) {

    public MembershipResponse(UUID id, UUID userId, String userName, UUID clubId, String clubName,
            MembershipPosition position, MembershipStatus status, Instant joinedAt) {
        this(id, userId, userName, null, null, true, clubId, clubName, position, status, joinedAt);
    }

    public static MembershipResponse from(Membership membership) {
        return new MembershipResponse(
                membership.getId(),
                membership.getUser().getId(),
                membership.getUser().getName(),
                membership.getUser().getEmail(),
                membership.getUser().getRole(),
                membership.getUser().isActive(),
                membership.getClub().getId(),
                membership.getClub().getName(),
                membership.getPosition(),
                membership.getStatus(),
                membership.getJoinedAt());
    }
}
