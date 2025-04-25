CREATE TYPE user_status AS ENUM ('active', 'inactive', 'banned');
CREATE TYPE user_role AS ENUM ('user', 'admin', 'employee');

CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  street VARCHAR(255) NOT NULL,
  street2 VARCHAR(255),
  city VARCHAR(255) NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  friendly_id SERIAL NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  session_token TEXT,
  password_reset_token TEXT,
  role user_role NOT NULL DEFAULT 'user',
  status user_status NOT NULL DEFAULT 'active',
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  send_news_letter BOOLEAN DEFAULT FALSE,
  billing_address_id UUID REFERENCES addresses(id),
  shipping_address_id UUID REFERENCES addresses(id),
  phone VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);