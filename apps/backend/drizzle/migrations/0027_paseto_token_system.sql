-- Migration: PASETO + Opaque Token System
-- Description: Implements secure token storage for PASETO and opaque access tokens

-- Access tokens table for opaque tokens
CREATE TABLE access_tokens (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    token VARCHAR(255) UNIQUE NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    fingerprint VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    revoked_at TIMESTAMP,
    revoked_by TEXT REFERENCES users(id),
    revocation_reason TEXT
);

-- Refresh tokens table for PASETO tokens
CREATE TABLE refresh_tokens (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    token_hash VARCHAR(255) UNIQUE NOT NULL, -- Hash of PASETO token for lookup
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    last_used TIMESTAMP DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    revoked_at TIMESTAMP,
    revoked_by TEXT REFERENCES users(id),
    revocation_reason TEXT
);

-- Public tokens table for customer portal access
CREATE TABLE public_tokens (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    token_hash VARCHAR(255) UNIQUE NOT NULL, -- Hash of PASETO token for lookup
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) NOT NULL, -- 'quote', 'invoice', etc.
    resource_id TEXT NOT NULL,
    purpose VARCHAR(100) NOT NULL, -- 'quote_access', 'invoice_view', etc.
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    last_accessed TIMESTAMP,
    access_count INTEGER DEFAULT 0,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    revoked_at TIMESTAMP,
    revocation_reason TEXT
);

-- Token audit log for security monitoring
CREATE TABLE token_audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    token_type VARCHAR(50) NOT NULL, -- 'access', 'refresh', 'public'
    token_id TEXT, -- Reference to token table
    user_id TEXT REFERENCES users(id),
    tenant_id TEXT REFERENCES tenants(id),
    action VARCHAR(100) NOT NULL, -- 'created', 'validated', 'revoked', 'expired'
    ip_address INET,
    user_agent TEXT,
    additional_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- PASETO key storage for key rotation
CREATE TABLE paseto_keys (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    key_id VARCHAR(50) UNIQUE NOT NULL, -- Key identifier for rotation
    key_type VARCHAR(20) NOT NULL, -- 'local', 'public'
    key_purpose VARCHAR(50) NOT NULL, -- 'access', 'refresh', 'public'
    key_data TEXT NOT NULL, -- Base64 encoded key
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    revoked_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_access_tokens_token ON access_tokens(token);
CREATE INDEX idx_access_tokens_user_tenant ON access_tokens(user_id, tenant_id);
CREATE INDEX idx_access_tokens_session ON access_tokens(session_id);
CREATE INDEX idx_access_tokens_expires ON access_tokens(expires_at);
CREATE INDEX idx_access_tokens_active ON access_tokens(is_active, expires_at);

CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_session ON refresh_tokens(session_id);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_active ON refresh_tokens(is_active, expires_at);

CREATE INDEX idx_public_tokens_hash ON public_tokens(token_hash);
CREATE INDEX idx_public_tokens_resource ON public_tokens(tenant_id, resource_type, resource_id);
CREATE INDEX idx_public_tokens_expires ON public_tokens(expires_at);
CREATE INDEX idx_public_tokens_active ON public_tokens(is_active, expires_at);

CREATE INDEX idx_token_audit_logs_token_type ON token_audit_logs(token_type);
CREATE INDEX idx_token_audit_logs_user_tenant ON token_audit_logs(user_id, tenant_id);
CREATE INDEX idx_token_audit_logs_created ON token_audit_logs(created_at);
CREATE INDEX idx_token_audit_logs_action ON token_audit_logs(action);

CREATE INDEX idx_paseto_keys_key_id ON paseto_keys(key_id);
CREATE INDEX idx_paseto_keys_active ON paseto_keys(is_active, key_purpose);

-- Add constraints
ALTER TABLE access_tokens ADD CONSTRAINT chk_access_tokens_expires CHECK (expires_at > created_at);
ALTER TABLE refresh_tokens ADD CONSTRAINT chk_refresh_tokens_expires CHECK (expires_at > created_at);
ALTER TABLE public_tokens ADD CONSTRAINT chk_public_tokens_expires CHECK (expires_at > created_at);

-- Add token type constraints
ALTER TABLE token_audit_logs ADD CONSTRAINT chk_token_audit_token_type 
    CHECK (token_type IN ('access', 'refresh', 'public'));
    
ALTER TABLE paseto_keys ADD CONSTRAINT chk_paseto_keys_type 
    CHECK (key_type IN ('local', 'public'));
    
ALTER TABLE paseto_keys ADD CONSTRAINT chk_paseto_keys_purpose 
    CHECK (key_purpose IN ('access', 'refresh', 'public'));

-- Insert initial PASETO keys (will be replaced with proper key generation)
INSERT INTO paseto_keys (key_id, key_type, key_purpose, key_data) VALUES
('local-access-v1', 'local', 'access', 'placeholder-key-will-be-generated'),
('local-refresh-v1', 'local', 'refresh', 'placeholder-key-will-be-generated'),
('public-portal-v1', 'public', 'public', 'placeholder-keypair-will-be-generated');

-- Create function to automatically clean expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Delete expired access tokens
    DELETE FROM access_tokens 
    WHERE expires_at < NOW() - INTERVAL '1 day';
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete expired refresh tokens
    DELETE FROM refresh_tokens 
    WHERE expires_at < NOW() - INTERVAL '1 day';
    
    -- Delete expired public tokens
    DELETE FROM public_tokens 
    WHERE expires_at < NOW() - INTERVAL '1 day';
    
    -- Clean old audit logs (keep 90 days)
    DELETE FROM token_audit_logs 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create scheduled cleanup job (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-expired-tokens', '0 2 * * *', 'SELECT cleanup_expired_tokens();');
