package com.club.backend.dto;

import com.club.backend.entity.AdvisorRequestStatus;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ResolveAdvisorRequest(
        @NotNull(message = "Status is required") AdvisorRequestStatus status,
        @Size(max = 4000, message = "Admin response cannot exceed 4000 characters") String adminResponse
) {}
