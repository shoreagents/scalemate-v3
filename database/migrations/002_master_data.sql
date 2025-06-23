-- =====================================================================
-- SCALEMATE OFFSHORE CALCULATOR - MASTER DATA MIGRATION
-- Migration: 002_master_data.sql
-- =====================================================================

-- =====================================================================
-- MASTER DATA TABLES
-- =====================================================================

-- 🔧 ROLES TABLE - Available roles (Frontend, Backend, DevOps, etc.)
CREATE TABLE roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,           -- Unique role ID (Primary Key)
    name VARCHAR(100) NOT NULL,                     -- Role name (e.g., "Frontend Developer")
    description TEXT,                               -- Detailed role description
    category VARCHAR(50),                           -- Role category (e.g., "Development", "Design", "Management")
    salary_range_min DECIMAL(10,2),                 -- Minimum monthly salary for this role
    salary_range_max DECIMAL(10,2),                 -- Maximum monthly salary for this role
    currency VARCHAR(3) DEFAULT 'USD',              -- Currency for salary ranges
    is_active BOOLEAN DEFAULT TRUE,                 -- Whether role is available for selection
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When role was added to system
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Last role update
    INDEX idx_name (name),
    INDEX idx_category (category),
    INDEX idx_is_active (is_active)
);

-- ✅ TASKS TABLE - Available tasks per role
CREATE TABLE tasks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,           -- Unique task ID (Primary Key)
    role_id BIGINT NOT NULL,                        -- Foreign Key to roles table (which role this task belongs to)
    name VARCHAR(100) NOT NULL,                     -- Task name (e.g., "UI Development", "API Integration")
    description TEXT,                               -- Detailed task description
    complexity_level ENUM('low', 'medium', 'high') DEFAULT 'medium', -- Task difficulty/complexity
    is_default BOOLEAN DEFAULT FALSE,               -- Whether task is pre-selected when role is chosen
    is_active BOOLEAN DEFAULT TRUE,                 -- Whether task is available for selection
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When task was added to system
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Last task update
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    INDEX idx_role_id (role_id),
    INDEX idx_name (name),
    INDEX idx_is_active (is_active),
    INDEX idx_is_default (is_default)
);

-- 📈 EXPERIENCE_LEVELS TABLE - Senior, Mid, Entry levels
CREATE TABLE experience_levels (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,           -- Unique experience level ID (Primary Key)
    name VARCHAR(50) NOT NULL,                      -- Level name (e.g., "Senior Level", "Mid Level", "Entry Level")
    description TEXT,                               -- Level description and requirements
    years_min INT,                                  -- Minimum years of experience
    years_max INT,                                  -- Maximum years of experience (NULL for open-ended)
    salary_multiplier DECIMAL(3,2) DEFAULT 1.00,   -- Salary multiplier (1.0 = base, 1.5 = 50% more)
    order_index INT DEFAULT 0,                      -- Display order in UI (1=Entry, 2=Mid, 3=Senior)
    is_active BOOLEAN DEFAULT TRUE,                 -- Whether level is available for selection
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When level was added to system
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Last level update
    INDEX idx_name (name),
    INDEX idx_order_index (order_index),
    INDEX idx_is_active (is_active)
);

-- =====================================================================
-- ADDITIONAL INDEXES FOR OPTIMIZATION
-- =====================================================================

-- Additional composite indexes for common queries
CREATE INDEX idx_roles_category_active ON roles(category, is_active);
CREATE INDEX idx_tasks_role_active ON tasks(role_id, is_active);
CREATE INDEX idx_experience_levels_order_active ON experience_levels(order_index, is_active); 