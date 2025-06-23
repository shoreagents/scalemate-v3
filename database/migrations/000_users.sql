-- =====================================================================
-- SCALEMATE OFFSHORE CALCULATOR - CORE TABLES MIGRATION
-- Migration: 000_users.sql
-- =====================================================================

-- 👤 USERS TABLE - Registered user accounts
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,           -- Unique user ID (Primary Key)
    email VARCHAR(255) UNIQUE NOT NULL,             -- User's email address (login username)
    password_hash VARCHAR(255) NOT NULL,            -- Encrypted password (never store plain text)
    first_name VARCHAR(100),                        -- User's first name
    last_name VARCHAR(100),                         -- User's last name
    company_name VARCHAR(255),                      -- User's company name
    phone VARCHAR(20),                              -- User's phone number
    location VARCHAR(255),                          -- User's geographic location
    currency VARCHAR(3) DEFAULT 'USD',              -- User's preferred currency (USD, PHP, EUR, etc.)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When account was created
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Last profile update
    INDEX idx_email (email)
);

-- 🔐 ANONYMOUS_SESSIONS TABLE - Session management for anonymous users
CREATE TABLE anonymous_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,           -- Unique session ID (Primary Key)
    session_id VARCHAR(100) UNIQUE NOT NULL,        -- Session token (e.g., "SES-20250620-ABCD1234")
    ip_address VARCHAR(45),                         -- User's IP address (supports IPv4 and IPv6)
    user_agent TEXT,                                -- Browser and device information
    location VARCHAR(255),                          -- Detected or entered geographic location
    currency VARCHAR(3) DEFAULT 'USD',              -- Detected or preferred currency
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When session was created
    expires_at TIMESTAMP,                           -- When session expires (for cleanup)
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Last user activity
    INDEX idx_session_id (session_id),
    INDEX idx_expires_at (expires_at)
);
