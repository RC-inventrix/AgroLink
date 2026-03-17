package com.me.moderationservice.repository;

import com.me.moderationservice.model.Announcement;
import org.jspecify.annotations.Nullable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    /**
     * Finds published announcements that match a list of target audiences.
     * Example targets: "ALL", "FARMER", "BUYER"
     */
    List<Announcement> findByStatusAndTargetAudienceInOrderByCreatedAtDesc(
            String status,
            Collection<String> targetAudiences
    );

    /**
     * Finds all announcements for a specific status (e.g., "DRAFT" or "PUBLISHED").
     */
    List<Announcement> findByStatusOrderByCreatedAtDesc(String status);

    @Nullable List<Announcement> findByTargetAudienceIn(List<String> all);
}