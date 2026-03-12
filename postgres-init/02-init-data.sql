-- =============================================================
-- AgroLink - PostgreSQL Data Initialization
-- =============================================================
-- This script runs AFTER 01-init-schemas.sql to insert seed data.
-- All seed tables are created in the identity_schema.
-- =============================================================

-- Set the search path to identity_schema for this script
SET search_path TO identity_schema;

-- 1. Create the 'roles' table in identity_schema
CREATE TABLE IF NOT EXISTS identity_schema.roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- 2. Create the 'users' table in identity_schema
CREATE TABLE IF NOT EXISTS identity_schema.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES identity_schema.roles(id)
);

-- 3. Insert default roles
INSERT INTO identity_schema.roles (id, name) VALUES (1, 'ROLE_ADMIN')  ON CONFLICT DO NOTHING;
INSERT INTO identity_schema.roles (id, name) VALUES (2, 'ROLE_FARMER') ON CONFLICT DO NOTHING;
INSERT INTO identity_schema.roles (id, name) VALUES (3, 'ROLE_BUYER')  ON CONFLICT DO NOTHING;

-- 4. Insert default admin with a bcrypt-hashed password.
-- NOTE: Replace the hash below with: bcrypt('your_secure_admin_password', 12)
-- Default hash corresponds to 'ChangeMe@123' - MUST be changed before production use.
INSERT INTO identity_schema.users (username, password, role_id)
VALUES ('admin', '$2a$12$s4X5cCOovAJpJRrTB1Kz3eVMiYKvl/RUCKiWkBf9RFJo5w.SolF2G', 1)
    ON CONFLICT DO NOTHING;
