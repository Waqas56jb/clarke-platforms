// Demo data that the original page kept in localStorage. Nothing here represents money or real orders.
module.exports = `
CREATE TABLE IF NOT EXISTS issuer_applications (
 id TEXT PRIMARY KEY,
 name TEXT NOT NULL,
 country TEXT NOT NULL,
 symbol TEXT NOT NULL,
 sector TEXT NOT NULL,
 website TEXT NOT NULL DEFAULT '',
 email TEXT NOT NULL,
 share_class TEXT NOT NULL,
 shares INTEGER NOT NULL CHECK(shares >= 1),
 remaining_shares INTEGER NOT NULL CHECK(remaining_shares >= 0),
 price REAL NOT NULL CHECK(price > 0),
 currency TEXT NOT NULL,
 description TEXT NOT NULL,
 files TEXT NOT NULL DEFAULT '[]',
 status TEXT NOT NULL DEFAULT 'Pending review' CHECK(status IN ('Pending review','Approved','Rejected')),
 created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS company_orders (
 id TEXT PRIMARY KEY,
 application_id TEXT NOT NULL REFERENCES issuer_applications(id),
 company TEXT NOT NULL,
 symbol TEXT NOT NULL,
 quantity INTEGER NOT NULL CHECK(quantity >= 1),
 price REAL NOT NULL,
 currency TEXT NOT NULL,
 total REAL NOT NULL,
 created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS fund_ledger (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 sale_value_cents INTEGER NOT NULL CHECK(sale_value_cents > 0),
 fee_cents INTEGER NOT NULL CHECK(fee_cents >= 0),
 created_at TEXT NOT NULL
);
`;
