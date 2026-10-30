package com.club.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.club.backend.dto.AdvisorRequestResponse;
import com.club.backend.dto.CreateAdvisorRequest;
import com.club.backend.dto.ResolveAdvisorRequest;
import com.club.backend.security.UserPrincipal;
import com.club.backend.service.AdvisorRequestService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/advisor-requests")
@RequiredArgsConstructor
public class AdvisorRequestController {

    private final AdvisorRequestService advisorRequestService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('FACULTY_ADVISOR', 'SUPER_ADMIN')")
    public AdvisorRequestResponse create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateAdvisorRequest request) {
        return advisorRequestService.create(principal, request);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('FACULTY_ADVISOR', 'SUPER_ADMIN')")
    public List<AdvisorRequestResponse> list(@AuthenticationPrincipal UserPrincipal principal) {
        return advisorRequestService.listForUser(principal);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('FACULTY_ADVISOR', 'SUPER_ADMIN')")
    public AdvisorRequestResponse getById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        return advisorRequestService.getById(principal, id);
    }

    @PutMapping("/{id}/resolve")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public AdvisorRequestResponse resolve(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody ResolveAdvisorRequest request) {
        return advisorRequestService.resolve(principal, id, request);
    }
}
