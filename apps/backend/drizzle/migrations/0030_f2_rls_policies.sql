-- Migration: Add RLS Policies for F2 Rate Cards Tables
-- Description: Enable Row Level Security for F2 rate cards and services tables

-- Enable RLS on F2 tables
ALTER TABLE f2_rate_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE f2_services ENABLE ROW LEVEL SECURITY;

-- Create tenant isolation policies for F2 rate cards
CREATE POLICY tenant_isolation_f2_rate_cards ON f2_rate_cards
  FOR ALL TO authenticated
  USING (
    CASE 
      WHEN current_setting('app.tenant_id', true) IS NULL THEN true -- Allow when no tenant context (admin operations)
      ELSE tenant_id = current_setting('app.tenant_id')::text
    END
  );

-- Create tenant isolation policies for F2 services
CREATE POLICY tenant_isolation_f2_services ON f2_services
  FOR ALL TO authenticated
  USING (
    CASE 
      WHEN current_setting('app.tenant_id', true) IS NULL THEN true -- Allow when no tenant context (admin operations)
      ELSE EXISTS (
        SELECT 1 FROM f2_rate_cards 
        WHERE f2_rate_cards.id = f2_services.rate_card_id 
        AND f2_rate_cards.tenant_id = current_setting('app.tenant_id')::text
      )
    END
  );

-- Add performance indexes for RLS
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_f2_rate_cards_tenant_rls 
ON f2_rate_cards(tenant_id) WHERE tenant_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_f2_services_rate_card_rls 
ON f2_services(rate_card_id) WHERE rate_card_id IS NOT NULL;

-- Add comments for documentation
COMMENT ON POLICY tenant_isolation_f2_rate_cards ON f2_rate_cards IS 'Ensures F2 rate cards can only be accessed within their tenant context';
COMMENT ON POLICY tenant_isolation_f2_services ON f2_services IS 'Ensures F2 services can only be accessed within their parent rate card tenant context';

-- Migration complete
SELECT 'F2 RLS policies migration completed successfully' AS status;
