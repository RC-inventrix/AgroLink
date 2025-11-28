-- Create the schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS agro_schema;

-- Create Roles (Assuming you have a roles table)
INSERT INTO roles (id, name) VALUES (1, 'ROLE_ADMIN') ON CONFLICT DO NOTHING;
INSERT INTO roles (id, name) VALUES (2, 'ROLE_FARMER') ON CONFLICT DO NOTHING;
INSERT INTO roles (id, name) VALUES (3, 'ROLE_BUYER') ON CONFLICT DO NOTHING;

-- Create a Default Admin User (Password should be hashed/encrypted in real app)
INSERT INTO users (username, password, role_id)
VALUES ('admin', 'admin123', 1)
    ON CONFLICT DO NOTHING;