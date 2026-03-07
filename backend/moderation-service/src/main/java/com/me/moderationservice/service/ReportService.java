package com.me.moderationservice.service;

import com.me.moderationservice.dto.ReportRequest;
import com.me.moderationservice.model.UserNotification;
import com.me.moderationservice.model.UserReport;
import com.me.moderationservice.model.User; // Ensure you have the shadow User entity in this project
import com.me.moderationservice.repository.ReportRepository;
import com.me.moderationservice.repository.UserNotificationRepository;
import com.me.moderationservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Added for data integrity

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final UserNotificationRepository notificationRepository;

    public UserReport saveReport(UserReport report) {
        return reportRepository.save(report);
    }

    public List<UserReport> getAllReports() {
        return reportRepository.findAll();
    }

    public List<UserReport> getReportsByReportedUser(Long reportedId) {
        return reportRepository.findByReportedId(reportedId);
    }

    /**
     * Resolves a report and applies penalty points to the reported user.
     * Logic: LOW = 0 points, MEDIUM = 1 point, HIGH = 2 points.
     * If user points reach 6, the user is banned.
     */
    @Transactional // Ensures both Report and User updates succeed or fail together
    public UserReport resolveReport(Long reportId, Long adminId, String remarks, String action) {
        // 1. Fetch and update the Report status
        UserReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        report.setAdminId(adminId);
        report.setAdminRemarks(remarks);
        report.setActionTaken(action); // Uses the action selected in the frontend popup
        report.setResolvedAt(LocalDateTime.now());
        report.setStatus("RESOLVED");

        // 2. Fetch the reported User from the shared 'users' table
        User reportedUser = userRepository.findById(report.getReportedId())
                .orElseThrow(() -> new RuntimeException("Reported user not found"));

        // 3. Calculate points based on RiskLevel
        int pointsToAdd = 0;
        if (report.getRiskLevel() == UserReport.RiskLevel.MEDIUM) {
            pointsToAdd = 1;
        } else if (report.getRiskLevel() == UserReport.RiskLevel.HIGH) {
            pointsToAdd = 2;
        }

        // 4. Update user points and check for 6-point ban threshold
        int currentPoints = reportedUser.getPenaltyPoints();
        int newTotalPoints = currentPoints + pointsToAdd;

        reportedUser.setPenaltyPoints(newTotalPoints);

        if (newTotalPoints >= 6) {
            reportedUser.setBanned(true);
        }

        if ("WARNING_ISSUED".equalsIgnoreCase(action)) {
            UserNotification warning = new UserNotification();
            warning.setUserId(report.getReportedId()); // The person who was reported
            warning.setTitle("Account Warning");
            warning.setMessage("Administration has issued a warning regarding: " + remarks);
            warning.setType("WARNING");
            notificationRepository.save(warning);
        }

        // 5. Save both changes to the shared database
        userRepository.save(reportedUser);
        return reportRepository.save(report);
    }

    public List<UserReport> getReportsByReporter(Long reporterId) {
        List<UserReport> reports = reportRepository.findByReporterId(reporterId);
        return reports.isEmpty() ? List.of() : reports;
    }

    public UserReport submitReport(ReportRequest request) {
        UserReport report = new UserReport();
        report.setOrderId(request.getOrderId());
        report.setReporterId(request.getReporterId());
        report.setReportedId(request.getReportedId());
        report.setIssueType(request.getIssueType());
        report.setDescription(request.getDescription());
        report.setEvidenceUrls(request.getEvidenceUrls());

        return reportRepository.save(report);
    }

    public List<UserNotification> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void markNotificationRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }
}