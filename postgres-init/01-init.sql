-- 1. Create the Schema
CREATE SCHEMA IF NOT EXISTS agro_schema;

-- 2. Create the 'roles' table explicitly
CREATE TABLE IF NOT EXISTS roles (
                                     id SERIAL PRIMARY KEY,
                                     name VARCHAR(50) UNIQUE NOT NULL
    );

-- 3. Create the 'users' table (so you can insert the admin)
CREATE TABLE IF NOT EXISTS users (
                                     id SERIAL PRIMARY KEY,
                                     username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles(id)
    );

-- 4. NOW insert the data (Safe because tables exist)
INSERT INTO roles (id, name) VALUES (1, 'ROLE_ADMIN') ON CONFLICT DO NOTHING;
INSERT INTO roles (id, name) VALUES (2, 'ROLE_FARMER') ON CONFLICT DO NOTHING;
INSERT INTO roles (id, name) VALUES (3, 'ROLE_BUYER') ON CONFLICT DO NOTHING;

-- Insert default admin (Password: admin123)
INSERT INTO users (username, password, role_id)
VALUES ('admin', 'admin123', 1)
    ON CONFLICT DO NOTHING;