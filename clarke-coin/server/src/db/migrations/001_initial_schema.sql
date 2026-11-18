-- Same tables, columns, keys and indexes the FastAPI/SQLAlchemy models created.
-- Ledger rows are append-only: the API has no code path that updates or deletes them.

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email VARCHAR(320) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  is_active BOOLEAN NOT NULL,
  totp_secret VARCHAR(64),
  mfa_enabled BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email ON users (email);

CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES users (id),
  currency VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS ledger_transactions (
  id UUID PRIMARY KEY,
  idempotency_key VARCHAR(100) NOT NULL UNIQUE,
  transaction_type VARCHAR(30) NOT NULL,
  status VARCHAR(20) NOT NULL,
  reference VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS ledger_entries (
  id UUID PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES ledger_transactions (id),
  wallet_id UUID NOT NULL REFERENCES wallets (id),
  -- Signed posting: debit negative, credit positive.
  amount NUMERIC(24, 8) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_ledger_entries_wallet_id ON ledger_entries (wallet_id);
CREATE INDEX IF NOT EXISTS ix_ledger_wallet_created ON ledger_entries (wallet_id, created_at);
