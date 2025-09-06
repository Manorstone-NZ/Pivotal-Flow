-- Migration: Implement ISO 4217 Currency Validation
-- This migration adds proper currency validation to prevent invalid currency codes

-- 1. Create currencies lookup table with ISO 4217 codes
CREATE TABLE IF NOT EXISTS currencies (
  code VARCHAR(3) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

-- 2. Populate with common ISO 4217 currency codes
INSERT INTO currencies (code, name, symbol) VALUES
  ('NZD', 'New Zealand Dollar', 'NZ$'),
  ('USD', 'US Dollar', '$'),
  ('EUR', 'Euro', '€'),
  ('GBP', 'British Pound', '£'),
  ('AUD', 'Australian Dollar', 'A$'),
  ('CAD', 'Canadian Dollar', 'C$'),
  ('CHF', 'Swiss Franc', 'CHF'),
  ('JPY', 'Japanese Yen', '¥'),
  ('CNY', 'Chinese Yuan', '¥'),
  ('INR', 'Indian Rupee', '₹'),
  ('SGD', 'Singapore Dollar', 'S$'),
  ('HKD', 'Hong Kong Dollar', 'HK$'),
  ('KRW', 'South Korean Won', '₩'),
  ('SEK', 'Swedish Krona', 'kr'),
  ('NOK', 'Norwegian Krone', 'kr'),
  ('DKK', 'Danish Krone', 'kr'),
  ('PLN', 'Polish Złoty', 'zł'),
  ('CZK', 'Czech Koruna', 'Kč'),
  ('HUF', 'Hungarian Forint', 'Ft'),
  ('RUB', 'Russian Ruble', '₽'),
  ('TRY', 'Turkish Lira', '₺'),
  ('BRL', 'Brazilian Real', 'R$'),
  ('MXN', 'Mexican Peso', '$'),
  ('ARS', 'Argentine Peso', '$'),
  ('CLP', 'Chilean Peso', '$'),
  ('COP', 'Colombian Peso', '$'),
  ('PEN', 'Peruvian Sol', 'S/'),
  ('UYU', 'Uruguayan Peso', '$'),
  ('VND', 'Vietnamese Dong', '₫'),
  ('THB', 'Thai Baht', '฿'),
  ('MYR', 'Malaysian Ringgit', 'RM'),
  ('IDR', 'Indonesian Rupiah', 'Rp'),
  ('PHP', 'Philippine Peso', '₱'),
  ('ZAR', 'South African Rand', 'R'),
  ('EGP', 'Egyptian Pound', 'E£'),
  ('NGN', 'Nigerian Naira', '₦'),
  ('KES', 'Kenyan Shilling', 'KSh'),
  ('GHS', 'Ghanaian Cedi', 'GH₵'),
  ('UGX', 'Ugandan Shilling', 'USh'),
  ('TZS', 'Tanzanian Shilling', 'TSh'),
  ('ETB', 'Ethiopian Birr', 'Br'),
  ('MAD', 'Moroccan Dirham', 'MAD'),
  ('TND', 'Tunisian Dinar', 'DT'),
  ('DZD', 'Algerian Dinar', 'DA'),
  ('LYD', 'Libyan Dinar', 'LD'),
  ('SDG', 'Sudanese Pound', 'SDG'),
  ('IQD', 'Iraqi Dinar', 'ع.د'),
  ('SAR', 'Saudi Riyal', 'ر.س'),
  ('AED', 'UAE Dirham', 'د.إ'),
  ('QAR', 'Qatari Riyal', 'ر.ق'),
  ('KWD', 'Kuwaiti Dinar', 'د.ك'),
  ('BHD', 'Bahraini Dinar', 'BD'),
  ('OMR', 'Omani Rial', 'ر.ع.'),
  ('JOD', 'Jordanian Dinar', 'د.أ'),
  ('LBP', 'Lebanese Pound', 'ل.ل'),
  ('ILS', 'Israeli Shekel', '₪'),
  ('EGP', 'Egyptian Pound', 'E£'),
  ('ZAR', 'South African Rand', 'R'),
  ('NGN', 'Nigerian Naira', '₦'),
  ('KES', 'Kenyan Shilling', 'KSh'),
  ('GHS', 'Ghanaian Cedi', 'GH₵'),
  ('UGX', 'Ugandan Shilling', 'USh'),
  ('TZS', 'Tanzanian Shilling', 'TSh'),
  ('ETB', 'Ethiopian Birr', 'Br'),
  ('MAD', 'Moroccan Dirham', 'MAD'),
  ('TND', 'Tunisian Dinar', 'DT'),
  ('DZD', 'Algerian Dinar', 'DA'),
  ('LYD', 'Libyan Dinar', 'LD'),
  ('SDG', 'Sudanese Pound', 'SDG'),
  ('IQD', 'Iraqi Dinar', 'ع.د'),
  ('SAR', 'Saudi Riyal', 'ر.س'),
  ('AED', 'UAE Dirham', 'د.إ'),
  ('QAR', 'Qatari Riyal', 'ر.ق'),
  ('KWD', 'Kuwaiti Dinar', 'د.ك'),
  ('BHD', 'Bahraini Dinar', 'BD'),
  ('OMR', 'Omani Rial', 'ر.ع.'),
  ('JOD', 'Jordanian Dinar', 'د.أ'),
  ('LBP', 'Lebanese Pound', 'ل.ل'),
  ('ILS', 'Israeli Shekel', '₪');

-- 3. Add CHECK constraints to existing currency fields
-- Note: We'll need to ensure existing data is valid before adding constraints

-- Check if there are any invalid currency codes in existing data
-- If there are, we'll need to clean them up first
DO $$
BEGIN
  -- Check organizations table
  IF EXISTS (
    SELECT 1 FROM organizations 
    WHERE currency NOT IN (SELECT code FROM currencies)
  ) THEN
    RAISE NOTICE 'Found invalid currency codes in organizations table. Please clean up data before adding constraints.';
  END IF;
  
  -- Check rate_cards table
  IF EXISTS (
    SELECT 1 FROM rate_cards 
    WHERE currency NOT IN (SELECT code FROM currencies)
  ) THEN
    RAISE NOTICE 'Found invalid currency codes in rate_cards table. Please clean up data before adding constraints.';
  END IF;
  
  -- Check rate_card_items table
  IF EXISTS (
    SELECT 1 FROM rate_card_items 
    WHERE currency NOT IN (SELECT code FROM currencies)
  ) THEN
    RAISE NOTICE 'Found invalid currency codes in rate_card_items table. Please clean up data before adding constraints.';
  END IF;
  
  -- Check quotes table
  IF EXISTS (
    SELECT 1 FROM quotes 
    WHERE currency NOT IN (SELECT code FROM currencies)
  ) THEN
    RAISE NOTICE 'Found invalid currency codes in quotes table. Please clean up data before adding constraints.';
  END IF;
END $$;

-- 4. Add CHECK constraints (only if no invalid data exists)
-- Organizations table
ALTER TABLE organizations 
  ADD CONSTRAINT organizations_currency_valid 
  CHECK (currency IN (SELECT code FROM currencies WHERE is_active = true));

-- Rate cards table
ALTER TABLE rate_cards 
  ADD CONSTRAINT rate_cards_currency_valid 
  CHECK (currency IN (SELECT code FROM currencies WHERE is_active = true));

-- Rate card items table
ALTER TABLE rate_card_items 
  ADD CONSTRAINT rate_card_items_currency_valid 
  CHECK (currency IN (SELECT code FROM currencies WHERE is_active = true));

-- Quotes table
ALTER TABLE quotes 
  ADD CONSTRAINT quotes_currency_valid 
  CHECK (currency IN (SELECT code FROM currencies WHERE is_active = true));

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_currencies_active ON currencies(is_active);
CREATE INDEX IF NOT EXISTS idx_currencies_code ON currencies(code);

-- 6. Add comments for documentation
COMMENT ON TABLE currencies IS 'ISO 4217 currency codes for validation and display purposes';
COMMENT ON COLUMN currencies.code IS 'ISO 4217 3-letter currency code (e.g., USD, EUR, NZD)';
COMMENT ON COLUMN currencies.name IS 'Full currency name for display purposes';
COMMENT ON COLUMN currencies.symbol IS 'Currency symbol for display purposes';
COMMENT ON COLUMN currencies.is_active IS 'Whether this currency is currently active and valid';

-- 7. Create a function to get active currencies
CREATE OR REPLACE FUNCTION get_active_currencies()
RETURNS TABLE(code VARCHAR(3), name VARCHAR(100), symbol VARCHAR(10)) AS $$
BEGIN
  RETURN QUERY
  SELECT c.code, c.name, c.symbol
  FROM currencies c
  WHERE c.is_active = true
  ORDER BY c.code;
END;
$$ LANGUAGE plpgsql;

-- 8. Create a function to validate currency code
CREATE OR REPLACE FUNCTION is_valid_currency(currency_code VARCHAR(3))
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM currencies 
    WHERE code = currency_code AND is_active = true
  );
END;
$$ LANGUAGE plpgsql;
