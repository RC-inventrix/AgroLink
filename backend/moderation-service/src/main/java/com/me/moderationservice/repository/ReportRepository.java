package com.me.moderationservice.repository;

import com.me.moderationservice.model.UserReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;


public interface ReportRepository extends JpaRepository<UserReport, Long> {
    // Custom method to find reports for a specific reported user
    List<UserReport> findByReportedId(Long reportedId);

    List<UserReport> findByReporterId(Long reporterId);
}