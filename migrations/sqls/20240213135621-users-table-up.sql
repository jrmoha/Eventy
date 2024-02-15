DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'gender_type'
) THEN CREATE TYPE gender_type AS ENUM('male', 'female');
END IF;
END $$;
CREATE TABLE IF NOT EXISTS person (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    birthdate DATE NOT NULL,
    gender gender_type DEFAULT 'male',
    confirmed BOOLEAN DEFAULT FALSE,
    password_reset_code VARCHAR(6) DEFAULT NULL,
    password_reset_code_expires_at TIMESTAMP DEFAULT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    CONSTRAINT fk_user_person FOREIGN KEY (id) REFERENCES person(id)
);
CREATE TABLE IF NOT EXISTS organizer (
    id SERIAL PRIMARY KEY,
    rate FLOAT DEFAULT 0,
    event_count INTEGER DEFAULT 0,
    CONSTRAINT fk_organizer_person FOREIGN KEY (id) REFERENCES person(id),
    CONSTRAINT fk_organizer_user FOREIGN KEY (id) REFERENCES users(id)
);
CREATE OR REPLACE FUNCTION update_updatedAt()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'person' AND NEW."updatedAt" IS DISTINCT FROM CURRENT_TIMESTAMP THEN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- CREATE TRIGGER trigger_update_updatedAt
-- BEFORE UPDATE ON DATABASE
-- FOR EACH ROW
-- EXECUTE FUNCTION update_updatedAt();