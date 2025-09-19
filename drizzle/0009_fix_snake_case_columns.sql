-- Fix snake_case column naming in organizations and permissions tables
-- This migration renames camelCase columns to snake_case

-- Rename columns in organizations table
ALTER TABLE organizations RENAME COLUMN "taxId" TO tax_id;
ALTER TABLE organizations RENAME COLUMN "subscriptionPlan" TO subscription_plan;
ALTER TABLE organizations RENAME COLUMN "subscriptionStatus" TO subscription_status;
ALTER TABLE organizations RENAME COLUMN "trialEndsAt" TO trial_ends_at;

-- Rename column in permissions table
ALTER TABLE permissions RENAME COLUMN "createdAt" TO created_at;
