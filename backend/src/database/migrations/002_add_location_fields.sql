
ALTER TABLE meetings 
ALTER COLUMN location DROP NOT NULL,
ALTER COLUMN location TYPE VARCHAR(500);

ALTER TABLE meetings 
ADD COLUMN IF NOT EXISTS location_country VARCHAR(2),
ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 8),
ADD COLUMN IF NOT EXISTS longitude NUMERIC(11, 8);

COMMENT ON COLUMN meetings.location IS 'Address text in any language/format (e.g., "Tour Eiffel, Paris" or "דיזנגוף 50, תל אביב")';
COMMENT ON COLUMN meetings.location_country IS 'Optional ISO 3166-1 alpha-2 country code (e.g., IL, US, FR, JP) for region bias in geocoding';
COMMENT ON COLUMN meetings.latitude IS 'Optional cached latitude for performance (e.g., 32.0853)';
COMMENT ON COLUMN meetings.longitude IS 'Optional cached longitude for performance (e.g., 34.7818)';

CREATE INDEX IF NOT EXISTS idx_meetings_coordinates 
ON meetings(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

ALTER TABLE meetings 
ADD CONSTRAINT valid_country_code 
CHECK (
  location_country IS NULL OR 
  (location_country ~ '^[A-Z]{2}$')
);

ALTER TABLE meetings 
ADD CONSTRAINT valid_latitude 
CHECK (
  latitude IS NULL OR 
  (latitude >= -90 AND latitude <= 90)
);

ALTER TABLE meetings 
ADD CONSTRAINT valid_longitude 
CHECK (
  longitude IS NULL OR 
  (longitude >= -180 AND longitude <= 180)
);

