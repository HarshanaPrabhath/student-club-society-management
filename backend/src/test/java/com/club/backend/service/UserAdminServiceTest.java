package com.club.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import com.club.backend.entity.Club;
import com.club.backend.entity.Membership;
import com.club.backend.entity.MembershipPosition;
import com.club.backend.entity.MembershipStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.club.backend.config.ApiException;
import com.club.backend.dto.CreateUserRequest;
import com.club.backend.dto.UpdateUserRequest;
import com.club.backend.dto.UserAdminResponse;
import com.club.backend.entity.Role;
import com.club.backend.entity.User;
import com.club.backend.repository.UserRepository;
import com.club.backend.security.UserPrincipal;

@ExtendWith(MockitoExtension.class)
class UserAdminServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private com.club.backend.repository.MembershipRepository membershipRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private UserAdminService service;

    private User admin;
    private User student;
    private UserPrincipal adminPrincipal;

    @BeforeEach
    void setUp() {
        admin = User.builder().id(UUID.randomUUID()).name("Admin").email("admin@example.com").role(Role.SUPER_ADMIN).build();
        student = User.builder().id(UUID.randomUUID()).name("Sam").email("sam@example.com").role(Role.STUDENT).build();
        adminPrincipal = new UserPrincipal(admin);
    }

    private void stubActor() {
        when(userRepository.findById(admin.getId())).thenReturn(Optional.of(admin));
    }

    @Test
    void create_savesVerifiedAccountWithChosenRoleAndAuditsIt() {
        stubActor();
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserAdminResponse created = service.create(adminPrincipal,
                new CreateUserRequest("  New Advisor ", " New@Example.com ", "password123", Role.FACULTY_ADVISOR));

        assertThat(created.email()).isEqualTo("new@example.com");
        assertThat(created.name()).isEqualTo("New Advisor");
        assertThat(created.role()).isEqualTo(Role.FACULTY_ADVISOR);
        assertThat(created.active()).isTrue();
        assertThat(created.emailVerified()).isTrue();
        verify(auditLogService).log(eq(admin), eq("CREATE_USER"), eq("USER"), any(), anyString());
    }

    @Test
    void create_defaultsToStudentWhenNoRoleGiven() {
        stubActor();
        when(passwordEncoder.encode("password123")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        assertThat(service.create(adminPrincipal, new CreateUserRequest("Sam", "s@example.com", "password123", null)).role())
                .isEqualTo(Role.STUDENT);
    }

    @Test
    void create_rejectsShortPasswordDuplicateEmailAndBadInput() {
        when(userRepository.existsByEmail("sam@example.com")).thenReturn(true);

        assertThatThrownBy(() -> service.create(adminPrincipal, new CreateUserRequest("Sam", "sam@example.com", "short", null)))
                .isInstanceOf(ApiException.class).hasMessageContaining("Password");
        assertThatThrownBy(() -> service.create(adminPrincipal, new CreateUserRequest("Sam", "sam@example.com", "password123", null)))
                .isInstanceOf(ApiException.class).hasMessageContaining("already exists");
        assertThatThrownBy(() -> service.create(adminPrincipal, new CreateUserRequest("Sam", "not-an-email", "password123", null)))
                .isInstanceOf(ApiException.class).hasMessageContaining("valid email");
        assertThatThrownBy(() -> service.create(adminPrincipal, new CreateUserRequest(" ", "a@b.co", "password123", null)))
                .isInstanceOf(ApiException.class).hasMessageContaining("Name");
        verify(userRepository, never()).save(any());
    }

    @Test
    void update_changesRole() {
        stubActor();
        when(userRepository.findById(student.getId())).thenReturn(Optional.of(student));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserAdminResponse updated = service.update(adminPrincipal, student.getId(),
                new UpdateUserRequest(null, null, Role.FACULTY_ADVISOR));

        assertThat(updated.role()).isEqualTo(Role.FACULTY_ADVISOR);
        verify(auditLogService).log(eq(admin), eq("UPDATE_USER"), eq("USER"), eq(student.getId()), anyString());
    }

    @Test
    void update_cannotChangeYourOwnRole() {
        when(userRepository.findById(admin.getId())).thenReturn(Optional.of(admin));

        assertThatThrownBy(() -> service.update(adminPrincipal, admin.getId(), new UpdateUserRequest(null, null, Role.STUDENT)))
                .isInstanceOf(ApiException.class).hasMessageContaining("own role");
        assertThat(admin.getRole()).isEqualTo(Role.SUPER_ADMIN);
    }

    @Test
    void update_cannotDemoteTheLastActiveSuperAdmin() {
        User otherAdmin = User.builder().id(UUID.randomUUID()).name("Other").email("o@example.com").role(Role.SUPER_ADMIN).build();
        when(userRepository.findById(otherAdmin.getId())).thenReturn(Optional.of(otherAdmin));
        when(userRepository.countByRoleAndActiveTrue(Role.SUPER_ADMIN)).thenReturn(1L);

        assertThatThrownBy(() -> service.update(adminPrincipal, otherAdmin.getId(), new UpdateUserRequest(null, null, Role.STUDENT)))
                .isInstanceOf(ApiException.class).hasMessageContaining("last active Super Admin");
        assertThat(otherAdmin.getRole()).isEqualTo(Role.SUPER_ADMIN);
    }

    @Test
    void update_rejectsEmailAlreadyUsedByAnotherAccount() {
        when(userRepository.findById(student.getId())).thenReturn(Optional.of(student));
        when(userRepository.existsByEmail("taken@example.com")).thenReturn(true);

        assertThatThrownBy(() -> service.update(adminPrincipal, student.getId(), new UpdateUserRequest(null, "taken@example.com", null)))
                .isInstanceOf(ApiException.class).hasMessageContaining("already exists");
    }

    @Test
    void deactivate_disablesTheAccountAndAuditsIt() {
        stubActor();
        when(userRepository.findById(student.getId())).thenReturn(Optional.of(student));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        assertThat(service.setActive(adminPrincipal, student.getId(), false).active()).isFalse();
        verify(auditLogService).log(eq(admin), eq("DEACTIVATE_USER"), eq("USER"), eq(student.getId()), anyString());
    }

    @Test
    void activate_restoresADeactivatedAccount() {
        stubActor();
        student.setActive(false);
        when(userRepository.findById(student.getId())).thenReturn(Optional.of(student));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        assertThat(service.setActive(adminPrincipal, student.getId(), true).active()).isTrue();
        verify(auditLogService).log(eq(admin), eq("ACTIVATE_USER"), eq("USER"), eq(student.getId()), anyString());
    }

    @Test
    void deactivate_cannotDeactivateYourselfOrTheLastActiveSuperAdmin() {
        when(userRepository.findById(admin.getId())).thenReturn(Optional.of(admin));
        assertThatThrownBy(() -> service.setActive(adminPrincipal, admin.getId(), false))
                .isInstanceOf(ApiException.class).hasMessageContaining("own account");

        User otherAdmin = User.builder().id(UUID.randomUUID()).name("Other").email("o@example.com").role(Role.SUPER_ADMIN).build();
        when(userRepository.findById(otherAdmin.getId())).thenReturn(Optional.of(otherAdmin));
        when(userRepository.countByRoleAndActiveTrue(Role.SUPER_ADMIN)).thenReturn(1L);
        assertThatThrownBy(() -> service.setActive(adminPrincipal, otherAdmin.getId(), false))
                .isInstanceOf(ApiException.class).hasMessageContaining("last active Super Admin");
        assertThat(otherAdmin.isActive()).isTrue();
    }

    @Test
    void search_asPresident_onlySearchesClubMembersWithRoleStudent() {
        User pres = User.builder().id(UUID.randomUUID()).name("Pres").email("p@example.com").role(Role.STUDENT).build();
        UserPrincipal presPrincipal = new UserPrincipal(pres);
        Club club = Club.builder().id(UUID.randomUUID()).name("Club A").build();
        Membership presM = Membership.builder().id(UUID.randomUUID()).user(pres).club(club)
                .status(MembershipStatus.APPROVED).position(MembershipPosition.PRESIDENT).build();

        when(membershipRepository.findByUserId(pres.getId())).thenReturn(List.of(presM));
        when(userRepository.searchClubMembers(eq(List.of(club.getId())), eq(MembershipStatus.APPROVED), eq(Role.STUDENT), eq("%sam%"), any()))
                .thenReturn(new PageImpl<>(List.of(student)));

        var result = service.search(presPrincipal, "sam", null, PageRequest.of(0, 10));
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).name()).isEqualTo("Sam");
    }

    @Test
    void deactivate_asPresident_rejectsUserOutsideClub() {
        User pres = User.builder().id(UUID.randomUUID()).name("Pres").email("p@example.com").role(Role.STUDENT).build();
        UserPrincipal presPrincipal = new UserPrincipal(pres);
        Club club = Club.builder().id(UUID.randomUUID()).name("Club A").build();
        Membership presM = Membership.builder().id(UUID.randomUUID()).user(pres).club(club)
                .status(MembershipStatus.APPROVED).position(MembershipPosition.PRESIDENT).build();

        when(membershipRepository.findByUserId(pres.getId())).thenReturn(List.of(presM));
        when(userRepository.findById(student.getId())).thenReturn(Optional.of(student));
        when(membershipRepository.findByUserId(student.getId())).thenReturn(List.of());

        assertThatThrownBy(() -> service.setActive(presPrincipal, student.getId(), false))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("members of their own club");
    }

    @Test
    void deactivate_asPresident_succeedsForMemberInClub() {
        User pres = User.builder().id(UUID.randomUUID()).name("Pres").email("p@example.com").role(Role.STUDENT).build();
        UserPrincipal presPrincipal = new UserPrincipal(pres);
        Club club = Club.builder().id(UUID.randomUUID()).name("Club A").build();
        Membership presM = Membership.builder().id(UUID.randomUUID()).user(pres).club(club)
                .status(MembershipStatus.APPROVED).position(MembershipPosition.PRESIDENT).build();
        Membership studentM = Membership.builder().id(UUID.randomUUID()).user(student).club(club)
                .status(MembershipStatus.APPROVED).position(MembershipPosition.MEMBER).build();

        when(membershipRepository.findByUserId(pres.getId())).thenReturn(List.of(presM));
        when(userRepository.findById(pres.getId())).thenReturn(Optional.of(pres));
        when(userRepository.findById(student.getId())).thenReturn(Optional.of(student));
        when(membershipRepository.findByUserId(student.getId())).thenReturn(List.of(studentM));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        var res = service.setActive(presPrincipal, student.getId(), false);
        assertThat(res.active()).isFalse();
        verify(auditLogService).log(eq(pres), eq("DEACTIVATE_USER"), eq("USER"), eq(student.getId()), anyString());
    }

    @Test
    void setActive_unknownUser_isNotFound() {
        UUID missing = UUID.randomUUID();
        when(userRepository.findById(missing)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.setActive(adminPrincipal, missing, false))
                .isInstanceOf(ApiException.class).hasMessageContaining("not found");
    }
}
