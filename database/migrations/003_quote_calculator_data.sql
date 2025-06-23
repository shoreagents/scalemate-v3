-- =====================================================================
-- SCALEMATE OFFSHORE CALCULATOR - QUOTE CALCULATOR DATA MIGRATION
-- Migration: 003_quote_calculator_data.sql
-- =====================================================================

-- =====================================================================
-- QUOTE CALCULATOR STEP-BY-STEP DATA TABLES
-- =====================================================================

-- 📊 QUOTE_CALCULATOR_BASIC_INFO - Step 1: Properties, team size, annual revenue
CREATE TABLE quote_calculator_basic_info (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,           -- Unique record ID (Primary Key)
    quote_calculator_id BIGINT NOT NULL,            -- Foreign Key to quote_calculator table
    number_of_properties INT,                       -- How many properties user manages
    current_team_size INT,                          -- User's existing team size
    annual_revenue DECIMAL(15,2),                   -- Company's annual revenue (supports up to 999 trillion)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When Step 1 was first saved
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Last update to Step 1
    FOREIGN KEY (quote_calculator_id) REFERENCES quote_calculator(id) ON DELETE CASCADE,
    UNIQUE KEY unique_quote_basic_info (quote_calculator_id) -- One record per quote
);

-- 🔧 QUOTE_CALCULATOR_ROLES - Step 2: Selected roles and team counts
CREATE TABLE quote_calculator_roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,           -- Unique role selection ID (Primary Key)
    quote_calculator_id BIGINT NOT NULL,            -- Foreign Key to quote_calculator table
    role_id BIGINT NOT NULL,                        -- Foreign Key to roles table (which role selected)
    team_count INT NOT NULL DEFAULT 1,              -- How many teams user wants for this role
    order_index INT DEFAULT 0,                      -- Display order in UI (for sorting)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When role was added to quote
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Last modification
    FOREIGN KEY (quote_calculator_id) REFERENCES quote_calculator(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_quote_role (quote_calculator_id, role_id), -- One record per role per quote
    INDEX idx_quote_calculator_id (quote_calculator_id),
    INDEX idx_role_id (role_id)
);

-- ✅ QUOTE_CALCULATOR_ROLE_TASKS - Step 3: Task assignments per role
CREATE TABLE quote_calculator_role_tasks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,           -- Unique task assignment ID (Primary Key)
    quote_calculator_role_id BIGINT NOT NULL,       -- Foreign Key to quote_calculator_roles table
    task_id BIGINT NOT NULL,                        -- Foreign Key to tasks table (which task)
    is_selected BOOLEAN DEFAULT FALSE,              -- Whether user checked this task
    custom_task_name VARCHAR(255),                  -- Custom task name if user added their own
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When task was assigned
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Last modification
    FOREIGN KEY (quote_calculator_role_id) REFERENCES quote_calculator_roles(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_task (quote_calculator_role_id, task_id), -- One record per task per role
    INDEX idx_quote_calculator_role_id (quote_calculator_role_id),
    INDEX idx_task_id (task_id)
);

-- 🎯 QUOTE_CALCULATOR_ROLE_EXPERIENCE - Step 4: Experience level distribution
CREATE TABLE quote_calculator_role_experience (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,           -- Unique experience assignment ID (Primary Key)
    quote_calculator_role_id BIGINT NOT NULL,       -- Foreign Key to quote_calculator_roles table
    experience_level_id BIGINT NOT NULL,            -- Foreign Key to experience_levels table
    team_count INT NOT NULL DEFAULT 0,              -- How many teams at this experience level
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When experience distribution was set
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Last modification
    FOREIGN KEY (quote_calculator_role_id) REFERENCES quote_calculator_roles(id) ON DELETE CASCADE,
    FOREIGN KEY (experience_level_id) REFERENCES experience_levels(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_experience (quote_calculator_role_id, experience_level_id), -- One record per experience per role
    INDEX idx_quote_calculator_role_id (quote_calculator_role_id),
    INDEX idx_experience_level_id (experience_level_id)
);

-- =====================================================================
-- QUOTE CALCULATOR CALCULATIONS TABLES
-- =====================================================================

-- 💰 QUOTE_CALCULATOR_CALCULATIONS - Final cost summaries
CREATE TABLE quote_calculator_calculations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,           -- Unique calculation ID (Primary Key)
    quote_calculator_id BIGINT NOT NULL,            -- Foreign Key to quote_calculator table
    total_monthly_cost_usd DECIMAL(12,2),           -- Total monthly cost in USD
    total_monthly_cost_php DECIMAL(12,2),           -- Total monthly cost in Philippine Pesos
    total_monthly_savings_usd DECIMAL(12,2),        -- Monthly savings compared to US hiring
    total_teams INT,                                -- Total number of teams across all roles
    total_roles INT,                                -- Total number of different roles selected
    calculation_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When calculation was performed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When calculation record was created
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Last calculation update
    FOREIGN KEY (quote_calculator_id) REFERENCES quote_calculator(id) ON DELETE CASCADE,
    UNIQUE KEY unique_quote_calculation (quote_calculator_id), -- One calculation per quote
    INDEX idx_quote_calculator_id (quote_calculator_id)
);

-- 📊 QUOTE_CALCULATOR_ROLE_COSTS - Detailed cost breakdown per role/experience
CREATE TABLE quote_calculator_role_costs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,           -- Unique cost breakdown ID (Primary Key)
    quote_calculator_calculation_id BIGINT NOT NULL, -- Foreign Key to quote_calculator_calculations table
    role_id BIGINT NOT NULL,                        -- Foreign Key to roles table (which role)
    experience_level_id BIGINT NOT NULL,            -- Foreign Key to experience_levels table (which level)
    team_count INT NOT NULL,                        -- How many teams at this role/experience combination
    monthly_cost_per_team_usd DECIMAL(10,2),        -- Monthly cost per team in USD
    monthly_cost_per_team_php DECIMAL(10,2),        -- Monthly cost per team in Philippine Pesos
    total_monthly_cost_usd DECIMAL(12,2),           -- Total monthly cost for all teams (team_count × per_team_cost)
    total_monthly_cost_php DECIMAL(12,2),           -- Total monthly cost for all teams in PHP
    us_equivalent_cost_usd DECIMAL(12,2),           -- What this would cost if hired in US
    monthly_savings_usd DECIMAL(12,2),              -- Monthly savings vs US equivalent
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When cost breakdown was calculated
    FOREIGN KEY (quote_calculator_calculation_id) REFERENCES quote_calculator_calculations(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (experience_level_id) REFERENCES experience_levels(id) ON DELETE CASCADE,
    INDEX idx_calculation_id (quote_calculator_calculation_id),
    INDEX idx_role_id (role_id),
    INDEX idx_experience_level_id (experience_level_id)
);

-- 📝 QUOTE_CALCULATOR_ACTIVITY_LOG - Audit trail of user progress
CREATE TABLE quote_calculator_activity_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,           -- Unique log entry ID (Primary Key)
    quote_calculator_id BIGINT NOT NULL,            -- Foreign Key to quote_calculator table
    step_number INT,                                -- Which step the activity occurred in (1-5)
    action VARCHAR(100),                            -- Action performed (e.g., "role_added", "step_completed", "task_selected")
    previous_data JSON,                             -- Previous values before change (JSON format)
    new_data JSON,                                  -- New values after change (JSON format)
    user_ip VARCHAR(45),                            -- User's IP address when action occurred
    user_agent TEXT,                                -- User's browser/device information
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When activity occurred
    FOREIGN KEY (quote_calculator_id) REFERENCES quote_calculator(id) ON DELETE CASCADE,
    INDEX idx_quote_calculator_id (quote_calculator_id),
    INDEX idx_step_number (step_number),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
); 