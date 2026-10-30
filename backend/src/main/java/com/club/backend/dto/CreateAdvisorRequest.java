package com.club.backend.dto;

import java.util.UUID;

import com.club.backend.entity.AdvisorRequestPriority;
import com.club.backend.entity.AdvisorRequestType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateAdvisorRequest(
        UUID clubId,
        @NotNull(message = "Request type is required") AdvisorRequestType requestType,
        AdvisorRequestPriority priority,
        @NotBlank(message = "Subject cannot be blank") @Size(max = 200, message = "Subject cannot exceed 200 characters") String subject,
        @NotBlank(message = "Message cannot be blank") @Size(max = 4000, message = "Message cannot exceed 4000 characters") String message
) {}
