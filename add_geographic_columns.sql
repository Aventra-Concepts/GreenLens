-- Add geographic restriction columns to products table if they don't exist
DO $$
BEGIN
    -- Check and add columns to products table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'allowed_countries') THEN
        ALTER TABLE products ADD COLUMN allowed_countries jsonb DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'restricted_countries') THEN
        ALTER TABLE products ADD COLUMN restricted_countries jsonb DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'global_access') THEN
        ALTER TABLE products ADD COLUMN global_access boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'region_restrictions') THEN
        ALTER TABLE products ADD COLUMN region_restrictions jsonb DEFAULT '{}';
    END IF;
    
    -- Check and add columns to ebooks table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ebooks' AND column_name = 'allowed_countries') THEN
        ALTER TABLE ebooks ADD COLUMN allowed_countries jsonb DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ebooks' AND column_name = 'restricted_countries') THEN
        ALTER TABLE ebooks ADD COLUMN restricted_countries jsonb DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ebooks' AND column_name = 'global_access') THEN
        ALTER TABLE ebooks ADD COLUMN global_access boolean DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ebooks' AND column_name = 'region_restrictions') THEN
        ALTER TABLE ebooks ADD COLUMN region_restrictions jsonb DEFAULT '{}';
    END IF;
    
    RAISE NOTICE 'Geographic restriction columns added successfully';
END $$;

-- Set default restrictions based on business rules
-- Gardening tools (products) - restricted to India only by default
UPDATE products 
SET 
    allowed_countries = '["IN"]',
    global_access = false,
    updated_at = CURRENT_TIMESTAMP
WHERE category = 'gardening-tools' AND allowed_countries = '[]';

-- E-books - global access by default
UPDATE ebooks 
SET 
    global_access = true,
    allowed_countries = '[]',
    restricted_countries = '[]',
    updated_at = CURRENT_TIMESTAMP
WHERE global_access IS NULL OR global_access = false;