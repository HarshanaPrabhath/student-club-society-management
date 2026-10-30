package com.club.backend.dto;

import java.time.Instant;
import java.util.UUID;

import com.club.backend.entity.AdvisorRequest;
import com.club.backend.entity.AdvisorRequestPriority;
import com.club.backend.entity.AdvisorRequestStatus;
import com.club.backend.entity.AdvisorRequestType;

public record AdvisorRequestResponse(
        UUID id,
        UUID advisorId,
        String advisorName,
        String advisorEmail,
        UUID clubId,
        String clubName,
        String clubCategory,
        AdvisorRequestType requestType,
        AdvisorRequestPriority priority,
        String subject,
        String message,
        AdvisorRequestStatus status,
        String adminResponse,
        UUID resolvedById,
        String resolvedByName,
        Instant resolvedAt,
        Instant createdAt,
        Instant updatedAt
) {
    public static AdvisorRequestResponse from(AdvisorRequest req) {
        return new AdvisorRequestResponse(
                req.getId(),
                req.getAdvisor() != null ? req.getAdvisor().getId() : null,
                req.getAdvisor() != null ? req.getAdvisor().getName() : null,
                req.getAdvisor() != null ? req.getAdvisor().getEmail() : null,
                req.getClub() != null ? req.getClub().getId() : null,
                req.getClub() != null ? req.getClub().getName() : null,
                req.getClub() != null ? req.getClub().getCategory() : null,
                req.getRequestType(),
                req.getPriority() != null ? req.getPriority() : AdvisorRequestPriority.NORMAL,
                req.getSubject(),
                req.getMessage(),
                req.getStatus(),
                req.getAdminResponse(),
                req.getResolvedBy() != null ? req.getResolvedBy().getId() : null,
                req.getResolvedBy() != null ? req.getResolvedBy().getName() : null,
                req.getResolvedAt(),
                req.getCreatedAt(),
                req.getUpdatedAt()
        );
    }
}
