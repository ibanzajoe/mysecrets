-- Drop function
DROP FUNCTION IF EXISTS delete_expired_secrets();

-- Drop trigger
DROP TRIGGER IF EXISTS update_secrets_updated_at ON secrets;

-- Drop indexes
DROP INDEX IF EXISTS idx_secrets_expires_at;
DROP INDEX IF EXISTS idx_secrets_user_id;
DROP INDEX IF EXISTS idx_secrets_token;

-- Drop table
DROP TABLE IF EXISTS secrets;
