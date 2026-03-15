/* fileName: 02-init-data.sql */

-- =============================================================
-- AgroLink - PostgreSQL Data Initialization
-- =============================================================
-- ALL MANUAL TABLE CREATION AND DATA INJECTION HAS BEEN REMOVED.
-- 
-- Reason: Manual table creation here conflicts with Spring Boot's
-- Hibernate (ddl-auto=update) schema generation. 
-- 
-- The Java Entity models (User.java, Admin.java) will now 
-- automatically generate the correct tables and columns upon 
-- application startup.
-- =============================================================

-- (Leave this file completely empty of SQL commands)