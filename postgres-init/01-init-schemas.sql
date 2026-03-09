-- ================================================
-- AgroLink Database Schema Initialization
-- Creates separate schemas for each microservice
-- ================================================

-- Service-specific schemas for data isolation
CREATE SCHEMA IF NOT EXISTS identity_schema;
CREATE SCHEMA IF NOT EXISTS product_schema;
CREATE SCHEMA IF NOT EXISTS order_schema;
CREATE SCHEMA IF NOT EXISTS chat_schema;
CREATE SCHEMA IF NOT EXISTS moderation_schema;
CREATE SCHEMA IF NOT EXISTS auction_schema;

-- ================================================
-- Seed data for identity_schema
-- ================================================

-- Create the 'roles' table
CREATE TABLE IF NOT EXISTS identity_schema.roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Create the 'users' table
CREATE TABLE IF NOT EXISTS identity_schema.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES identity_schema.roles(id)
);

-- Seed default roles
INSERT INTO identity_schema.roles (id, name) VALUES (1, 'ROLE_ADMIN') ON CONFLICT DO NOTHING;
INSERT INTO identity_schema.roles (id, name) VALUES (2, 'ROLE_FARMER') ON CONFLICT DO NOTHING;
INSERT INTO identity_schema.roles (id, name) VALUES (3, 'ROLE_BUYER') ON CONFLICT DO NOTHING;

-- Insert default admin (Password: admin123 - change in production)
INSERT INTO identity_schema.users (username, password, role_id)
VALUES ('admin', 'admin123', 1)
ON CONFLICT DO NOTHING;
