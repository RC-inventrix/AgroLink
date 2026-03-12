-- =============================================================
-- AgroLink - PostgreSQL Schema Initialization
-- =============================================================
-- This script creates separate logical schemas for each
-- microservice, enabling proper data isolation within a
-- single PostgreSQL database.
--
-- Run order: This file should run BEFORE any service starts.
-- In Docker, place in /docker-entrypoint-initdb.d/
-- =============================================================

-- 1. Identity & User Service Schema
CREATE SCHEMA IF NOT EXISTS identity_schema;

-- 2. Product Catalog Service Schema
CREATE SCHEMA IF NOT EXISTS product_schema;

-- 3. Order & Payment Service Schema
CREATE SCHEMA IF NOT EXISTS order_schema;

-- 4. Chat Service Schema
CREATE SCHEMA IF NOT EXISTS chat_schema;

-- 5. Auction Service Schema
CREATE SCHEMA IF NOT EXISTS auction_schema;

-- 6. Moderation Service Schema
CREATE SCHEMA IF NOT EXISTS moderation_schema;

-- =============================================================
-- Grant privileges to the application user on all schemas
-- =============================================================
DO $$
DECLARE
  app_user TEXT := current_user;
BEGIN
  EXECUTE 'GRANT ALL PRIVILEGES ON SCHEMA identity_schema TO ' || quote_ident(app_user);
  EXECUTE 'GRANT ALL PRIVILEGES ON SCHEMA product_schema TO ' || quote_ident(app_user);
  EXECUTE 'GRANT ALL PRIVILEGES ON SCHEMA order_schema TO ' || quote_ident(app_user);
  EXECUTE 'GRANT ALL PRIVILEGES ON SCHEMA chat_schema TO ' || quote_ident(app_user);
  EXECUTE 'GRANT ALL PRIVILEGES ON SCHEMA auction_schema TO ' || quote_ident(app_user);
  EXECUTE 'GRANT ALL PRIVILEGES ON SCHEMA moderation_schema TO ' || quote_ident(app_user);
END $$;

-- =============================================================
-- Default search_path for the application user
-- =============================================================
ALTER ROLE agro_admin SET search_path TO
  identity_schema,
  product_schema,
  order_schema,
  chat_schema,
  auction_schema,
  moderation_schema,
  public;
