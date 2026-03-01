package com.me.moderationservice.controller;

import com.me.moderationservice.model.IssueType;
import com.me.moderationservice.model.UserReport;
import com.me.moderationservice.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/moderation")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;


    @PostMapping("/user/report")
    public ResponseEntity<UserReport> submitReport(@RequestBody UserReport report) {
        return ResponseEntity.ok(reportService.saveReport(report));
    }

    @GetMapping("/user/my-reports/{userId}")
    public ResponseEntity<List<UserReport>> getMyReports(@PathVariable Long userId) {
        // Implementation to let a user see their own report history
        return ResponseEntity.ok(reportService.getReportsByReporter(userId));
    }


    // 1. Submit a report (Used by Buyers/Farmers)
    @PostMapping("/report")
    public ResponseEntity<UserReport> createReport(@RequestBody UserReport report) {
        return ResponseEntity.ok(reportService.saveReport(report));
    }

    // 2. Resolve a report (Used by Admins)
    @PatchMapping("/resolve/{id}")
    public ResponseEntity<UserReport> resolveReport(
            @PathVariable Long id,
            @RequestParam Long adminId,
            @RequestParam(required = false) String remarks) {
        return ResponseEntity.ok(reportService.resolveReport(id, adminId, remarks));
    }

    // 3. Get all reports for the Admin Dashboard
    @GetMapping("/all")
    public ResponseEntity<List<UserReport>> getAllReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }

    // 4. GET issues for Frontend Radio Buttons
    // This returns a list of objects containing the Enum name and a readable label
    @GetMapping("/issues")
    public ResponseEntity<List<Map<String, String>>> getIssueTypes() {
        List<Map<String, String>> issues = Arrays.stream(IssueType.values())
                .map(type -> Map.of(
                        "id", type.name(),
                        "label", type.name().replace("_", " ").toLowerCase()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(issues);
    }
}