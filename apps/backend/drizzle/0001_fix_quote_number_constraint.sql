-- Drop the global unique constraint on quoteNumber
ALTER TABLE "quotes" DROP CONSTRAINT "quotes_quoteNumber_unique";

-- Add organization-specific unique constraint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_quoteNumber_organizationId_unique" UNIQUE("quoteNumber", "organizationId");

