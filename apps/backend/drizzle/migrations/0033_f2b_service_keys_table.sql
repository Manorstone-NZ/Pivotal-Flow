-- Migration: F2B Service Keys Table for PASETO v4 Keys
-- Description: Creates service_keys table for PASETO v4 key management

-- Create service_keys table for PASETO v4 key storage
CREATE TABLE IF NOT EXISTS service_keys (
    id TEXT PRIMARY KEY, -- kid (key identifier)
    purpose TEXT NOT NULL CHECK (purpose IN ('paseto-public', 'paseto-local')),
    material TEXT NOT NULL, -- encrypted key material
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    rotates_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_keys_purpose ON service_keys(purpose);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_keys_active ON service_keys(id, purpose, revoked_at) 
WHERE revoked_at IS NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_keys_rotation ON service_keys(rotates_at) 
WHERE rotates_at IS NOT NULL AND revoked_at IS NULL;

-- Add comments for documentation
COMMENT ON TABLE service_keys IS 'Stores PASETO v4 keys for service-to-service and public link authentication';
COMMENT ON COLUMN service_keys.id IS 'Key identifier (kid) used in PASETO tokens';
COMMENT ON COLUMN service_keys.purpose IS 'Key purpose: paseto-public for S2S, paseto-local for public links';
COMMENT ON COLUMN service_keys.material IS 'Encrypted key material (never stored in plain text)';
COMMENT ON COLUMN service_keys.created_at IS 'Key creation timestamp';
COMMENT ON COLUMN service_keys.rotates_at IS 'Scheduled rotation timestamp';
COMMENT ON COLUMN service_keys.revoked_at IS 'Key revocation timestamp';

-- Insert default service keys for PASETO v4
-- Note: In production, these would be generated with proper key material
INSERT INTO service_keys (id, purpose, material) VALUES
    ('paseto-public-default', 'paseto-public', 'ENCRYPTED_PUBLIC_KEY_MATERIAL_PLACEHOLDER'),
    ('paseto-local-default', 'paseto-local', 'ENCRYPTED_LOCAL_KEY_MATERIAL_PLACEHOLDER')
ON CONFLICT (id) DO NOTHING;

-- Create function to get active key by purpose
CREATE OR REPLACE FUNCTION get_active_service_key(purpose_type TEXT)
RETURNS TABLE(key_id TEXT, material TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT sk.id, sk.material
    FROM service_keys sk
    WHERE sk.purpose = purpose_type
      AND sk.revoked_at IS NULL
      AND (sk.rotates_at IS NULL OR sk.rotates_at > NOW())
    ORDER BY sk.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Add comment for function
COMMENT ON FUNCTION get_active_service_key(TEXT) IS 'Retrieves the most recent active service key for the specified purpose';

-- Migration complete
SELECT 'F2B service_keys table migration completed successfully' AS status;

