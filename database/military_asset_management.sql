CREATE DATABASE IF NOT EXISTS military_asset_management;
USE military_asset_management;

-- Create tables
CREATE TABLE IF NOT EXISTS bases (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    base_id BIGINT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (base_id) REFERENCES bases(id)
);

CREATE TABLE IF NOT EXISTS equipment_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS assets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    equipment_type_id BIGINT NOT NULL,
    base_id BIGINT NOT NULL,
    serial_number VARCHAR(255),
    quantity INT NOT NULL DEFAULT 1,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_type_id) REFERENCES equipment_types(id),
    FOREIGN KEY (base_id) REFERENCES bases(id)
);

CREATE TABLE IF NOT EXISTS purchases (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    base_id BIGINT NOT NULL,
    equipment_type_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    purchase_date DATE NOT NULL,
    supplier VARCHAR(255),
    reference_number VARCHAR(255),
    unit_cost DECIMAL(10, 2),
    total_cost DECIMAL(15, 2),
    remarks TEXT,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (base_id) REFERENCES bases(id),
    FOREIGN KEY (equipment_type_id) REFERENCES equipment_types(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS transfers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    from_base_id BIGINT NOT NULL,
    to_base_id BIGINT NOT NULL,
    equipment_type_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    transfer_date DATE NOT NULL,
    reference_number VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    remarks TEXT,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_base_id) REFERENCES bases(id),
    FOREIGN KEY (to_base_id) REFERENCES bases(id),
    FOREIGN KEY (equipment_type_id) REFERENCES equipment_types(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    base_id BIGINT NOT NULL,
    equipment_type_id BIGINT NOT NULL,
    personnel_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    assigned_date DATE NOT NULL,
    returned_date DATE,
    status VARCHAR(50) NOT NULL,
    assigned_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (base_id) REFERENCES bases(id),
    FOREIGN KEY (equipment_type_id) REFERENCES equipment_types(id),
    FOREIGN KEY (assigned_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS expenditures (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    base_id BIGINT NOT NULL,
    equipment_type_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    expenditure_date DATE NOT NULL,
    reason VARCHAR(255),
    recorded_by BIGINT,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (base_id) REFERENCES bases(id),
    FOREIGN KEY (equipment_type_id) REFERENCES equipment_types(id),
    FOREIGN KEY (recorded_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(255),
    entity_id BIGINT,
    description TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert Sample Data
INSERT INTO bases (name, location, code) VALUES
('Alpha Base', 'North Region', 'ALPHA-01'),
('Bravo Base', 'South Region', 'BRAVO-02'),
('Central Base', 'Headquarters', 'CENTRAL-00');

-- Passwords are 'Admin@123', 'Commander@123', 'Logistics@123' (bcrypt hashes)
INSERT INTO users (username, email, password, full_name, role, base_id) VALUES
('admin', 'admin@military.demo', '$2a$10$wT8K8U6Y0oO2TfL7I4S63ezE3k4mQ/cQO0b80R7TzCg6yK2i.X6Cq', 'System Admin', 'ROLE_ADMIN', 3),
('commander', 'commander@military.demo', '$2a$10$eE.P8F6/OqY3Xm8D8u.T6e6J/sF6wVb4L0G8n8sP0V4tO9nJ0K6hW', 'Base Commander Alpha', 'ROLE_BASE_COMMANDER', 1),
('logistics', 'logistics@military.demo', '$2a$10$yF0k0I.1R0s4T.zL6Y0q6e6K/bQ4oN2rC9yE4n9rG6yK8jD2wO6kK', 'Central Logistics', 'ROLE_LOGISTICS_OFFICER', 3);

INSERT INTO equipment_types (name, category, description) VALUES
('Utility Vehicle', 'Vehicle', 'Standard multipurpose off-road vehicle'),
('Communication Equipment', 'Communication', 'Long-range field radio'),
('Protective Equipment', 'Protective Equipment', 'Standard issue body armor'),
('Field Equipment', 'General Equipment', 'Field tent kit');
