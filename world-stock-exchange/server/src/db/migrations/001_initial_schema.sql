-- World Stock Exchange practice platform. All trading uses virtual balances; no money is held or moved.

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  -- Roles: every account can invest; issuer is self-selected; reviewer is set only by scripts/make-reviewer.js.
  is_investor BOOLEAN NOT NULL DEFAULT true,
  is_issuer BOOLEAN NOT NULL DEFAULT false,
  is_reviewer BOOLEAN NOT NULL DEFAULT false,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  token_version INTEGER NOT NULL DEFAULT 0,
  -- Virtual practice balance in US cents.
  balance_cents BIGINT NOT NULL DEFAULT 1000000 CHECK (balance_cents >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_demo BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE email_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  purpose TEXT NOT NULL CHECK (purpose IN ('verify', 'reset')),
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Market instruments. Prices are illustrative unless updated by a configured market data source.
CREATE TABLE instruments (
  id SERIAL PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Company stocks', 'Currency', 'Energy', 'Agriculture', 'Goods')),
  sector TEXT NOT NULL DEFAULT '',
  price NUMERIC(18, 6) NOT NULL CHECK (price > 0),
  change_pct NUMERIC(9, 4) NOT NULL DEFAULT 0,
  -- Symbol at the market data provider; empty = always illustrative.
  provider_symbol TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'illustrative' CHECK (source IN ('illustrative', 'market')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE watchlist (
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  instrument_id INTEGER NOT NULL REFERENCES instruments (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_demo BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (user_id, instrument_id)
);

-- Practice positions: units held and total cost basis in US cents.
CREATE TABLE holdings (
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  instrument_id INTEGER NOT NULL REFERENCES instruments (id) ON DELETE CASCADE,
  units INTEGER NOT NULL CHECK (units > 0),
  cost_cents BIGINT NOT NULL CHECK (cost_cents >= 0),
  is_demo BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (user_id, instrument_id)
);

CREATE TABLE trades (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  instrument_id INTEGER NOT NULL REFERENCES instruments (id) ON DELETE CASCADE,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  units INTEGER NOT NULL CHECK (units > 0),
  price NUMERIC(18, 6) NOT NULL,
  total_cents BIGINT NOT NULL,
  -- For sells: sale value minus the average cost of the units sold.
  realised_cents BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_demo BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX trades_user_idx ON trades (user_id, created_at DESC);

-- US dollars per one unit of each currency, used to express fund fees in EUR. Illustrative rates.
CREATE TABLE fx_rates (
  currency TEXT PRIMARY KEY,
  usd_per_unit NUMERIC(18, 8) NOT NULL CHECK (usd_per_unit > 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Company listing applications. issuer_id is NULL only for applications imported from the old demo.
CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  issuer_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  symbol TEXT NOT NULL,
  sector TEXT NOT NULL,
  website TEXT NOT NULL DEFAULT '',
  contact_email TEXT NOT NULL,
  share_class TEXT NOT NULL,
  shares BIGINT NOT NULL CHECK (shares >= 1),
  remaining_shares BIGINT NOT NULL CHECK (remaining_shares >= 0 AND remaining_shares <= shares),
  price NUMERIC(18, 4) NOT NULL CHECK (price > 0),
  currency TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  review_note TEXT NOT NULL DEFAULT '',
  reviewed_by INTEGER REFERENCES users (id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_demo BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX applications_status_idx ON applications (status);
CREATE INDEX applications_issuer_idx ON applications (issuer_id);

CREATE TABLE application_documents (
  id SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL REFERENCES applications (id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('prospectus', 'financials', 'incorporation', 'regulatory')),
  original_name TEXT NOT NULL,
  stored_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_demo BOOLEAN NOT NULL DEFAULT false
);

-- Every review decision, so the full history of who decided what and when is kept.
CREATE TABLE application_reviews (
  id SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL REFERENCES applications (id) ON DELETE CASCADE,
  reviewer_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_demo BOOLEAN NOT NULL DEFAULT false
);

-- Practice buy orders against approved company listings (the issuer is the seller).
CREATE TABLE company_orders (
  id SERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  application_id INTEGER NOT NULL REFERENCES applications (id) ON DELETE CASCADE,
  investor_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  quantity BIGINT NOT NULL CHECK (quantity >= 1),
  price NUMERIC(18, 4) NOT NULL,
  currency TEXT NOT NULL,
  total_cents BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_demo BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX company_orders_investor_idx ON company_orders (investor_id);
CREATE INDEX company_orders_application_idx ON company_orders (application_id);

-- Gold & Diamond fund allocation ledger (EUR). An accounting record only: nothing is charged or paid.
CREATE TABLE fund_ledger (
  id SERIAL PRIMARY KEY,
  order_id INTEGER UNIQUE REFERENCES company_orders (id) ON DELETE CASCADE,
  sale_value_eur_cents BIGINT NOT NULL CHECK (sale_value_eur_cents >= 0),
  basis_eur_cents BIGINT NOT NULL CHECK (basis_eur_cents >= 0),
  fee_eur_cents BIGINT NOT NULL CHECK (fee_eur_cents >= 0),
  basis TEXT NOT NULL CHECK (basis IN ('gross', 'profit', 'legacy')),
  rate NUMERIC(6, 4) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_demo BOOLEAN NOT NULL DEFAULT false
);

-- One-time markers (legacy SQLite import, etc.).
CREATE TABLE app_events (
  name TEXT PRIMARY KEY,
  done_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
