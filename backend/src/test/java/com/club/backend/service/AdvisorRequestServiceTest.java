package com.club.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.club.backend.config.ApiException;
import com.club.backend.dto.AdvisorRequestResponse;
import com.club.backend.dto.CreateAdvisorRequest;
import com.club.backend.dto.ResolveAdvisorRequest;
import com.club.backend.entity.AdvisorRequest;
import com.club.backend.entity.AdvisorRequestPriority;
import com.club.backend.entity.AdvisorRequestStatus;
import com.club.backend.entity.AdvisorRequestType;
import com.club.backend.entity.Club;
import com.club.backend.entity.Role;
import com.club.backend.entity.User;
import com.club.backend.repository.AdvisorRequestRepository;
import com.club.backend.repository.ClubRepository;
import com.club.backend.repository.UserRepository;
import com.club.backend.security.UserPrincipal;

@ExtendWith(MockitoExtension.class)
class AdvisorRequestServiceTest {

    @Mock
    private AdvisorRequestRepository advisorRequestRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ClubRepository clubRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private AdvisorRequestService advisorRequestService;

    private User advisor;
    private User superAdmin;
    private Club club;
    private UserPrincipal advisorPrincipal;
    private UserPrincipal adminPrincipal;

    @BeforeEach
    void setUp() {
        advisor = User.builder()
                .id(UUID.randomUUID())
                .name("Dr. Advisor")
                .email("advisor@university.edu")
                .role(Role.FACULTY_ADVISOR)
                .build();

        superAdmin = User.builder()
                .id(UUID.randomUUID())
                .name("Super Admin")
                .email("admin@university.edu")
                .role(Role.SUPER_ADMIN)
                .build();

        club = Club.builder()
                .id(UUID.randomUUID())
                .name("Disruptive Society")
                .category("Special Interest")
                .build();

        advisorPrincipal = new UserPrincipal(advisor);
        adminPrincipal = new UserPrincipal(superAdmin);
    }

    @Test
    void createRequest_createsPendingRequestAndNotifiesSuperAdmins() {
        CreateAdvisorRequest req = new CreateAdvisorRequest(
                club.getId(),
                AdvisorRequestType.CLUB_DELETION,
                AdvisorRequestPriority.URGENT,
                "Requesting club dissolution due to misconduct",
                "Repeated non-compliance with student affairs policies."
        );

        when(userRepository.findById(advisor.getId())).thenReturn(Optional.of(advisor));
        when(clubRepository.findById(club.getId())).thenReturn(Optional.of(club));
        when(userRepository.findByRole(Role.SUPER_ADMIN)).thenReturn(List.of(superAdmin));
        when(advisorRequestRepository.save(any(AdvisorRequest.class))).thenAnswer(invocation -> {
            AdvisorRequest saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            return saved;
        });

        AdvisorRequestResponse response = advisorRequestService.create(advisorPrincipal, req);

        assertThat(response).isNotNull();
        assertThat(response.subject()).isEqualTo("Requesting club dissolution due to misconduct");
        assertThat(response.requestType()).isEqualTo(AdvisorRequestType.CLUB_DELETION);
        assertThat(response.priority()).isEqualTo(AdvisorRequestPriority.URGENT);
        assertThat(response.status()).isEqualTo(AdvisorRequestStatus.PENDING);
        assertThat(response.clubName()).isEqualTo("Disruptive Society");

        verify(notificationService).notify(any(User.class), any(String.class));
        verify(auditLogService).log(any(), any(), any(), any(), any());
    }

    @Test
    void listForUser_advisorSeesOnlyTheirOwnRequests() {
        AdvisorRequest req1 = AdvisorRequest.builder()
                .id(UUID.randomUUID())
                .advisor(advisor)
                .club(club)
                .requestType(AdvisorRequestType.DISCIPLINARY_ACTION)
                .subject("Disciplinary concern")
                .message("Issue description")
                .status(AdvisorRequestStatus.PENDING)
                .build();

        when(userRepository.findById(advisor.getId())).thenReturn(Optional.of(advisor));
        when(advisorRequestRepository.findAllByAdvisorOrderByCreatedAtDesc(advisor)).thenReturn(List.of(req1));

        List<AdvisorRequestResponse> list = advisorRequestService.listForUser(advisorPrincipal);

        assertThat(list).hasSize(1);
        assertThat(list.get(0).subject()).isEqualTo("Disciplinary concern");
    }

    @Test
    void listForUser_superAdminSeesAllRequests() {
        AdvisorRequest req1 = AdvisorRequest.builder()
                .id(UUID.randomUUID())
                .advisor(advisor)
                .club(club)
                .requestType(AdvisorRequestType.CLUB_DELETION)
                .subject("Delete club")
                .message("Message")
                .status(AdvisorRequestStatus.PENDING)
                .build();

        when(userRepository.findById(superAdmin.getId())).thenReturn(Optional.of(superAdmin));
        when(advisorRequestRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(req1));

        List<AdvisorRequestResponse> list = advisorRequestService.listForUser(adminPrincipal);

        assertThat(list).hasSize(1);
        assertThat(list.get(0).subject()).isEqualTo("Delete club");
    }

    @Test
    void resolve_superAdminResolvesRequestAndNotifiesAdvisor() {
        UUID reqId = UUID.randomUUID();
        AdvisorRequest req = AdvisorRequest.builder()
                .id(reqId)
                .advisor(advisor)
                .club(club)
                .requestType(AdvisorRequestType.CLUB_DELETION)
                .subject("Delete club")
                .message("Violations reported")
                .status(AdvisorRequestStatus.PENDING)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        ResolveAdvisorRequest resolveReq = new ResolveAdvisorRequest(
                AdvisorRequestStatus.RESOLVED,
                "Approved. The club will be decommissioned following administrative hearing."
        );

        when(userRepository.findById(superAdmin.getId())).thenReturn(Optional.of(superAdmin));
        when(advisorRequestRepository.findById(reqId)).thenReturn(Optional.of(req));
        when(advisorRequestRepository.save(any(AdvisorRequest.class))).thenAnswer(i -> i.getArgument(0));

        AdvisorRequestResponse res = advisorRequestService.resolve(adminPrincipal, reqId, resolveReq);

        assertThat(res.status()).isEqualTo(AdvisorRequestStatus.RESOLVED);
        assertThat(res.adminResponse()).contains("decommissioned");
        assertThat(res.resolvedByName()).isEqualTo("Super Admin");

        verify(notificationService).notify(any(User.class), any(String.class));
        verify(auditLogService).log(any(), any(), any(), any(), any());
    }
}
