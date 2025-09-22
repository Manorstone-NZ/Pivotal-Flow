-- Migration: F2B Sessions Table for Opaque Token Authentication
-- Description: Creates sessions table for server-side opaque token storage

-- Create sessions table for opaque token authentication
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    ip_hash TEXT,
    ua_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE sessions 
ADD CONSTRAINT sessions_user_id_fk 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE sessions 
ADD CONSTRAINT sessions_tenant_id_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Add indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_tenant_id ON sessions(tenant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_revoked_at ON sessions(revoked_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_active ON sessions(id, expires_at, revoked_at) 
WHERE revoked_at IS NULL AND expires_at > NOW();

-- Add unique constraint on active sessions per user/tenant combination
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_active_user_tenant 
ON sessions(user_id, tenant_id) 
WHERE revoked_at IS NULL AND expires_at > NOW();

-- Add comments for documentation
COMMENT ON TABLE sessions IS 'Stores server-side opaque session tokens for authentication';
COMMENT ON COLUMN sessions.id IS 'Unique session identifier (opaque, non-guessable)';
COMMENT ON COLUMN sessions.user_id IS 'Reference to the authenticated user';
COMMENT ON COLUMN sessions.tenant_id IS 'Reference to the tenant context';
COMMENT ON COLUMN sessions.expires_at IS 'Session expiration timestamp (15 minutes default)';
COMMENT ON COLUMN sessions.revoked_at IS 'Session revocation timestamp (for explicit logout)';
COMMENT ON COLUMN sessions.ip_hash IS 'Hash of client IP for security tracking';
COMMENT ON COLUMN sessions.ua_hash IS 'Hash of user agent for device tracking';

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sessions_updated_at_trigger
    BEFORE UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_sessions_updated_at();

-- Migration complete
SELECT 'F2B sessions table migration completed successfully' AS status;

