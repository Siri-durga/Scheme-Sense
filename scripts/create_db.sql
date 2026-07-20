-- Run this in psql if not using Docker
CREATE USER schemesense WITH PASSWORD 'schemesense123';
CREATE DATABASE schemesense OWNER schemesense;
GRANT ALL PRIVILEGES ON DATABASE schemesense TO schemesense;
