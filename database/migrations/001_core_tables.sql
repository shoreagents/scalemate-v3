-- =====================================================================
-- SCALEMATE OFFSHORE CALCULATOR - CORE TABLES MIGRATION
-- Migration: 001_core_tables.sql
-- =====================================================================

-- =====================================================================
-- CORE TABLES
-- =====================================================================


-- 📋 QUOTE_CALCULATOR TABLE - Main quote entity with session tracking
CREATE TABLE quote_calculator (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,           -- Unique quote ID (Primary Key)
    quote_id VARCHAR(50) UNIQUE NOT NULL,           -- Human-readable quote ID (e.g., "QTE-20250620-1234567890")
    user_id BIGINT NULL,                            -- Foreign Key to users table (if registered user)
    anonymous_session_id BIGINT NULL,               -- Foreign Key to anonymous_sessions (if anonymous user)
    status ENUM('draft', 'in_progress', 'completed', 'expired') DEFAULT 'draft', -- Quote status
    current_step INT DEFAULT 1,                     -- Current step in calculator (1-5)
    location VARCHAR(255),                          -- User's location for this quote
    currency VARCHAR(3) DEFAULT 'USD',              -- Currency for this quote's calculations
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When quote was started
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Last modification
    completed_at TIMESTAMP NULL,                    -- When quote was completed (NULL if not completed)
    expires_at TIMESTAMP,                           -- When quote expires for cleanup
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (anonymous_session_id) REFERENCES anonymous_sessions(id) ON DELETE CASCADE,
    INDEX idx_quote_id (quote_id),
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (anonymous_session_id),
    INDEX idx_status (status)
);

-- =====================================================================
-- ADDITIONAL INDEXES FOR OPTIMIZATION
-- =====================================================================

-- Additional composite indexes for common queries
CREATE INDEX idx_quote_calculator_user_status ON quote_calculator(user_id, status);
CREATE INDEX idx_quote_calculator_session_status ON quote_calculator(anonymous_session_id, status);
CREATE INDEX idx_quote_calculator_created_status ON quote_calculator(created_at, status); 