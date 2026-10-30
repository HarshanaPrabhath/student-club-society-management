package com.club.backend.service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.club.backend.config.ApiException;
import com.club.backend.dto.AdvisorRequestResponse;
import com.club.backend.dto.CreateAdvisorRequest;
import com.club.backend.dto.ResolveAdvisorRequest;
import com.club.backend.entity.AdvisorRequest;
import com.club.backend.entity.AdvisorRequestPriority;
import com.club.backend.entity.AdvisorRequestStatus;
import com.club.backend.entity.Club;
import com.club.backend.entity.Role;
import com.club.backend.entity.User;
import com.club.backend.repository.AdvisorRequestRepository;
import com.club.backend.repository.ClubRepository;
import com.club.backend.repository.UserRepository;
import com.club.backend.security.UserPrincipal;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdvisorRequestService {

    private final AdvisorRequestRepository advisorRequestRepository;
    private final UserRepository userRepository;
    private final ClubRepository clubRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    @Transactional
    public AdvisorRequestResponse create(UserPrincipal principal, CreateAdvisorRequest req) {
        User advisor = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        Club club = null;
        if (req.clubId() != null) {
            club = clubRepository.findById(req.clubId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Club not found"));
        }

        AdvisorRequestPriority priority = req.priority() != null ? req.priority() : AdvisorRequestPriority.NORMAL;

        AdvisorRequest advisorRequest = AdvisorRequest.builder()
                .advisor(advisor)
                .club(club)
                .requestType(req.requestType())
                .priority(priority)
                .subject(req.subject().trim())
                .message(req.message().trim())
                .status(AdvisorRequestStatus.PENDING)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        AdvisorRequest saved = advisorRequestRepository.save(advisorRequest);

        // Notify all Super Admins
        String clubName = club != null ? club.getName() : "General Consultation";
        String notificationMsg = String.format("Faculty Advisor %s submitted a %s request (%s) regarding %s: %s",
                advisor.getName(), req.requestType(), priority, clubName, req.subject().trim());

        List<User> superAdmins = userRepository.findByRole(Role.SUPER_ADMIN);
        for (User admin : superAdmins) {
            notificationService.notify(admin, notificationMsg);
        }

        // Audit log
        auditLogService.log(advisor, "CREATE_ADVISOR_REQUEST", "ADVISOR_REQUEST", saved.getId(),
                "Type=" + req.requestType() + ", Club=" + clubName + ", Subject=" + req.subject().trim());

        return AdvisorRequestResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<AdvisorRequestResponse> listForUser(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getRole() == Role.SUPER_ADMIN) {
            return advisorRequestRepository.findAllByOrderByCreatedAtDesc().stream()
                    .map(AdvisorRequestResponse::from)
                    .toList();
        } else {
            return advisorRequestRepository.findAllByAdvisorOrderByCreatedAtDesc(user).stream()
                    .map(AdvisorRequestResponse::from)
                    .toList();
        }
    }

    @Transactional(readOnly = true)
    public AdvisorRequestResponse getById(UserPrincipal principal, UUID id) {
        AdvisorRequest req = advisorRequestRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Request not found"));

        if (!principal.getRole().equals(Role.SUPER_ADMIN.name()) &&
                !req.getAdvisor().getId().equals(principal.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Access denied to this advisor request");
        }

        return AdvisorRequestResponse.from(req);
    }

    @Transactional
    public AdvisorRequestResponse resolve(UserPrincipal principal, UUID id, ResolveAdvisorRequest resolveReq) {
        User admin = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        AdvisorRequest req = advisorRequestRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Request not found"));

        req.setStatus(resolveReq.status());
        if (resolveReq.adminResponse() != null) {
            req.setAdminResponse(resolveReq.adminResponse().trim());
        }
        req.setResolvedBy(admin);
        req.setResolvedAt(Instant.now());
        req.setUpdatedAt(Instant.now());

        AdvisorRequest saved = advisorRequestRepository.save(req);

        // Notify submitting Advisor
        String responsePreview = resolveReq.adminResponse() != null && !resolveReq.adminResponse().isBlank()
                ? ": \"" + resolveReq.adminResponse().trim() + "\""
                : "";
        String msg = String.format("Super Admin updated your request '%s' to %s%s",
                req.getSubject(), resolveReq.status(), responsePreview);
        notificationService.notify(req.getAdvisor(), msg);

        // Audit log
        auditLogService.log(admin, "RESOLVE_ADVISOR_REQUEST", "ADVISOR_REQUEST", saved.getId(),
                "Status=" + resolveReq.status() + ", Subject=" + req.getSubject());

        return AdvisorRequestResponse.from(saved);
    }
}
