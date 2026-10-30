-- V5: Advisor requests and administrative escalations to Super Admin
CREATE TABLE `advisor_requests` (
  `id` binary(16) NOT NULL,
  `advisor_id` binary(16) NOT NULL,
  `club_id` binary(16) DEFAULT NULL,
  `request_type` varchar(40) NOT NULL,
  `priority` varchar(20) NOT NULL DEFAULT 'NORMAL',
  `subject` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'PENDING',
  `admin_response` text DEFAULT NULL,
  `resolved_by_id` binary(16) DEFAULT NULL,
  `resolved_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_advisor_req_advisor` (`advisor_id`),
  KEY `fk_advisor_req_club` (`club_id`),
  KEY `fk_advisor_req_admin` (`resolved_by_id`),
  CONSTRAINT `fk_advisor_req_advisor` FOREIGN KEY (`advisor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_advisor_req_club` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_advisor_req_admin` FOREIGN KEY (`resolved_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
