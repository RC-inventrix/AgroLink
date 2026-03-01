package com.me.moderationservice.service;

import com.me.moderationservice.dto.ReportRequest;
import com.me.moderationservice.model.UserReport;
import com.me.moderationservice.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final ReportRepository reportRepository;

    public UserReport saveReport(UserReport report) {
        return reportRepository.save(report);
    }

    public List<UserReport> getAllReports() {
        return reportRepository.findAll();
    }

    public List<UserReport> getReportsByReportedUser(Long reportedId) {
        return reportRepository.findByReportedId(reportedId);
    }

    public UserReport resolveReport(Long reportId, Long adminId, String remarks) {
        UserReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        report.setAdminId(adminId);
        report.setAdminRemarks(remarks);
        report.setResolvedAt(LocalDateTime.now());
        report.setStatus("RESOLVED");

        // Automatic outcome based on the RiskLevel mapped from your specific issues
        switch (report.getRiskLevel()) {
            case LOW -> report.setActionTaken("WARNING");
            case MEDIUM -> report.setActionTaken("6H_SUSPENSION");
            case HIGH -> report.setActionTaken("24H_SUSPENSION");
        }

        return reportRepository.save(report);
    }

    public List<UserReport> getReportsByReporter(Long reporterId) {
        List<UserReport> reports = reportRepository.findByReporterId(reporterId);
        if (reports.isEmpty()) {
            // You can return an empty list or throw a custom exception
            return List.of();
        }
        return reports;
    }

    public UserReport submitReport(ReportRequest request) {
        UserReport report = new UserReport();
        report.setOrderId(request.getOrderId());
        report.setReporterId(request.getReporterId());
        report.setReportedId(request.getReportedId());
        report.setIssueType(request.getIssueType());
        report.setDescription(request.getDescription());
        report.setEvidenceUrls(request.getEvidenceUrls()); // Saving the links

        return reportRepository.save(report);
    }


}
