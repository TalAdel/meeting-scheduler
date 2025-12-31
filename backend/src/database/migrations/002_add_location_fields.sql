-- Migration 002: Add Google Maps location fields (IDEMPOTENT - safe to run multiple times)

-- Step 1: Modify existing location column (safe - only if needed)
DO $$ 
BEGIN
    -- Drop NOT NULL constraint if it exists
    ALTER TABLE meetings ALTER COLUMN location DROP NOT NULL;
EXCEPTION 
    WHEN others THEN NULL; -- Ignore if already nullable
END $$;

DO $$ 
BEGIN
    -- Increase VARCHAR size if needed
    ALTER TABLE meetings ALTER COLUMN location TYPE VARCHAR(500);
EXCEPTION 
    WHEN others THEN NULL; -- Ignore if already correct type
END $$;

-- Step 2: Add new columns (safe with IF NOT EXISTS)
ALTER TABLE meetings 
ADD COLUMN IF NOT EXISTS location_country VARCHAR(2),
ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 8),
ADD COLUMN IF NOT EXISTS longitude NUMERIC(11, 8);

-- Step 3: Add comments (safe - always works)
COMMENT ON COLUMN meetings.location IS 'Address text in any language/format (e.g., "Tour Eiffel, Paris" or "דיזנגוף 50, תל אביב")';
COMMENT ON COLUMN meetings.location_country IS 'Optional ISO 3166-1 alpha-2 country code (e.g., IL, US, FR, JP) for region bias in geocoding';
COMMENT ON COLUMN meetings.latitude IS 'Optional cached latitude for performance (e.g., 32.0853)';
COMMENT ON COLUMN meetings.longitude IS 'Optional cached longitude for performance (e.g., 34.7818)';

-- Step 4: Create index (safe with IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_meetings_coordinates 
ON meetings(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Step 5: Add constraints (safe - check if exists first)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'valid_country_code'
    ) THEN
        ALTER TABLE meetings 
        ADD CONSTRAINT valid_country_code 
        CHECK (
            location_country IS NULL OR 
            (location_country ~ '^[A-Z]{2}$')
        );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'valid_latitude'
    ) THEN
        ALTER TABLE meetings 
        ADD CONSTRAINT valid_latitude 
        CHECK (
            latitude IS NULL OR 
            (latitude >= -90 AND latitude <= 90)
        );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'valid_longitude'
    ) THEN
        ALTER TABLE meetings 
        ADD CONSTRAINT valid_longitude 
        CHECK (
            longitude IS NULL OR 
            (longitude >= -180 AND longitude <= 180)
        );
    END IF;
END $$;
