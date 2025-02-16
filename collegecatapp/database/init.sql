-- Drop existing tables if they exist (ensures fresh start)
DROP TABLE IF EXISTS users;
DROP TYPE IF EXISTS role_enum;

-- create enums
CREATE TYPE role_enum AS ENUM ('HOD','Timetable Coordinator','Lecturer');

-- Users table
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    uname VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role role_enum NOT NULL,
    oauth_provider VARCHAR(50) NOT NULL,
    oauth_id VARCHAR(100) UNIQUE NOT NULL,
    seniority_year INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);