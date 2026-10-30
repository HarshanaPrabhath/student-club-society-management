package com.club.backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.club.backend.entity.AdvisorRequest;
import com.club.backend.entity.AdvisorRequestStatus;
import com.club.backend.entity.Club;
import com.club.backend.entity.User;

public interface AdvisorRequestRepository extends JpaRepository<AdvisorRequest, UUID> {

    List<AdvisorRequest> findAllByOrderByCreatedAtDesc();

    List<AdvisorRequest> findAllByAdvisorOrderByCreatedAtDesc(User advisor);

    List<AdvisorRequest> findAllByClubOrderByCreatedAtDesc(Club club);

    long countByStatus(AdvisorRequestStatus status);
}
