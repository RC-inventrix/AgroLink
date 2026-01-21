package com.agrolink.orderpaymentservice.service;

import com.agrolink.orderpaymentservice.repository.RequirementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Slf4j
public class RequirementCleanupService {

    private final RequirementRepository requirementRepository;

    /**
     * Runs every day at midnight (00:00:00).
     * Cron format: "second minute hour day month day-of-week"
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void deleteExpiredRequirements() {
        LocalDate today = LocalDate.now();
        log.info("Starting automatic cleanup for requirements expired before: {}", today);

        try {
            requirementRepository.deleteByExpectedDateBefore(today);
            log.info("Cleanup completed successfully.");
        } catch (Exception e) {
            log.error("Error during automatic cleanup: {}", e.getMessage());
        }
    }

}
