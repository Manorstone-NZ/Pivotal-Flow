-- Migration Script 3: Quote Line Items Table Only
BEGIN;

-- Rename columns from camelCase to snake_case
ALTER TABLE quote_line_items RENAME COLUMN "quoteId" TO quote_id;
ALTER TABLE quote_line_items RENAME COLUMN "lineNumber" TO line_number;
ALTER TABLE quote_line_items RENAME COLUMN "unitPrice" TO unit_price;
ALTER TABLE quote_line_items RENAME COLUMN "unitCost" TO unit_cost;
ALTER TABLE quote_line_items RENAME COLUMN "taxRate" TO tax_rate;
ALTER TABLE quote_line_items RENAME COLUMN "taxAmount" TO tax_amount;
ALTER TABLE quote_line_items RENAME COLUMN "discountType" TO discount_type;
ALTER TABLE quote_line_items RENAME COLUMN "discountValue" TO discount_value;
ALTER TABLE quote_line_items RENAME COLUMN "discountAmount" TO discount_amount;
ALTER TABLE quote_line_items RENAME COLUMN "totalAmount" TO total_amount;
ALTER TABLE quote_line_items RENAME COLUMN "serviceCategoryId" TO service_category_id;
ALTER TABLE quote_line_items RENAME COLUMN "rateCardId" TO rate_card_id;
ALTER TABLE quote_line_items RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE quote_line_items RENAME COLUMN "updatedAt" TO updated_at;

COMMIT;
