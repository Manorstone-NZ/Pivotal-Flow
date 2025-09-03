-- Create test user for performance testing
INSERT INTO organizations (id, name, slug, "subscriptionPlan", "subscriptionStatus", settings, "updatedAt") 
VALUES ('test-org-123', 'Performance Test Organization', 'perf-test-org-123', 'basic', 'active', '{}', NOW()) 
ON CONFLICT DO NOTHING;

INSERT INTO users (id, organization_id, email, first_name, last_name, display_name, password_hash, status, timezone, locale, date_format, time_format, preferences, metadata, updated_at) 
VALUES (
    'test-user-123', 
    'test-org-123', 
    'admin@pivotalflow.com', 
    'Admin', 
    'User', 
    'Admin User', 
    '$argon2id$v=19$m=65536,t=3,p=1$LQ3BUM3o4whimFE2S+cb3g$uFmmHzLDBvlvppK0D0cV5gby4RSFJ8/YlMLkHoQR3yY', 
    'active', 
    'UTC', 
    'en-US', 
    'DD MMM YYYY', 
    '24h', 
    '{}', 
    '{}', 
    NOW()
) ON CONFLICT DO NOTHING;

-- Create admin role
INSERT INTO roles (id, organization_id, name, description, is_system, is_active, created_at, updated_at) 
VALUES (
    'test-role-123', 
    'test-org-123', 
    'admin', 
    'Administrator role for performance testing', 
    false, 
    true, 
    NOW(), 
    NOW()
) ON CONFLICT DO NOTHING;

-- Assign user to role
INSERT INTO user_roles (id, user_id, role_id, organization_id, assigned_at, is_active) 
VALUES (
    'test-user-role-123', 
    'test-user-123', 
    'test-role-123', 
    'test-org-123', 
    NOW(), 
    true
) ON CONFLICT DO NOTHING;
