-- Create user roles and status enums
CREATE TYPE user_role AS ENUM ('user', 'admin', 'employee');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'banned');

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    friendly_id SERIAL UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    session_token VARCHAR(500),
    password_reset_token VARCHAR(500),
    role user_role NOT NULL DEFAULT 'user',
    status user_status NOT NULL DEFAULT 'active',
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(255),
    send_news_letter BOOLEAN DEFAULT false,
    billing_address JSONB,
    shipping_address JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- Create index on session_token
CREATE INDEX idx_users_session_token ON users(session_token);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
