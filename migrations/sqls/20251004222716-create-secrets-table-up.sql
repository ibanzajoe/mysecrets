-- Create secrets table
CREATE TABLE secrets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    encrypted_secret TEXT NOT NULL,
    iv VARCHAR(100) NOT NULL,
    accessed BOOLEAN DEFAULT false,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX idx_secrets_token ON secrets(token);
CREATE INDEX idx_secrets_user_id ON secrets(user_id);
CREATE INDEX idx_secrets_expires_at ON secrets(expires_at);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_secrets_updated_at
    BEFORE UPDATE ON secrets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to delete expired secrets
CREATE OR REPLACE FUNCTION delete_expired_secrets()
RETURNS void AS $$
BEGIN
    DELETE FROM secrets WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
