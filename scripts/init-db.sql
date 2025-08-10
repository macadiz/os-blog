-- Open Blog Database Initialization Script
-- This script sets up the initial database configuration

-- Create extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone to UTC
SET timezone = 'UTC';

-- Create indexes for better performance (will be created by Prisma migrations)
-- These are just placeholders for any manual optimization needed

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Open Blog database initialized successfully at %', NOW();
END $$;
