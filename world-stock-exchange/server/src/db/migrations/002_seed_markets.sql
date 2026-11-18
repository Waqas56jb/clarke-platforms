-- The instrument list and illustrative values that the site showed before (previously hard-coded in the page).
ALTER TABLE instruments ADD COLUMN quote_based BOOLEAN NOT NULL DEFAULT false;

INSERT INTO instruments (symbol, name, category, sector, price, change_pct, provider_symbol, sort_order, quote_based) VALUES
  ('AAPL', 'Apple Inc. (AAPL)', 'Company stocks', '', 225.4, 1.24, 'AAPL', 1, false),
  ('MSFT', 'Microsoft (MSFT)', 'Company stocks', 'Software', 510.2, 0.82, 'MSFT', 2, false),
  ('ORCL', 'Oracle (ORCL)', 'Company stocks', 'Software', 198.4, 0.65, 'ORCL', 3, false),
  ('ADBE', 'Adobe (ADBE)', 'Company stocks', 'Software', 342.8, -0.42, 'ADBE', 4, false),
  ('CRM', 'Salesforce (CRM)', 'Company stocks', 'Software', 286.5, 0.73, 'CRM', 5, false),
  ('SAP', 'SAP SE (SAP)', 'Company stocks', 'Software', 248.6, 0.38, 'SAP', 6, false),
  ('INTU', 'Intuit (INTU)', 'Company stocks', 'Software', 672.3, -0.21, 'INTU', 7, false),
  ('NOW', 'ServiceNow (NOW)', 'Company stocks', 'Software', 914.2, 0.91, 'NOW', 8, false),
  ('GIC', 'Global Industrial Co.', 'Company stocks', '', 84.75, -0.31, '', 9, false),
  ('EURUSD', 'EUR / USD', 'Currency', '', 1.16, 0.14, '', 10, false),
  ('GBPUSD', 'GBP / USD', 'Currency', '', 1.32, -0.08, '', 11, false),
  ('USDCAD', 'USD / CAD', 'Currency', '', 1.4, 0.05, '', 12, false),
  ('ENERGY', 'Energy sector fund', 'Energy', '', 92.6, 0.63, '', 13, false),
  ('OIL', 'Oil market reference', 'Energy', '', 68.2, -0.44, '', 14, false),
  ('NATGAS', 'Natural gas reference', 'Energy', '', 3.45, 0.21, '', 15, false),
  ('WHEAT', 'Wheat reference', 'Agriculture', '', 5.72, 0.32, '', 16, false),
  ('COFFEE', 'Coffee reference', 'Agriculture', '', 3.18, -0.16, '', 17, false),
  ('SUGAR', 'Sugar reference', 'Agriculture', '', 0.18, 0.09, '', 18, false),
  ('GOODS', 'Verified goods marketplace', 'Goods', '', 150, 0, '', 19, true);

-- US dollars per unit. EUR, GBP and CAD follow the currency instruments above; XCD uses its fixed peg
-- (2.70 per USD); GYD is an illustrative rate.
INSERT INTO fx_rates (currency, usd_per_unit) VALUES
  ('USD', 1),
  ('EUR', 1.16),
  ('GBP', 1.32),
  ('CAD', 0.71428571),
  ('XCD', 0.37037037),
  ('GYD', 0.00478469);
