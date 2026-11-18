// Illustrative sample instruments from the original page. Not live prices.
export const ASSETS = [
  { name: 'Apple Inc. (AAPL)', category: 'Company stocks', price: 225.4, change: '+1.24%', up: true },
  {
    name: 'Microsoft (MSFT)',
    category: 'Company stocks',
    sector: 'Software',
    price: 510.2,
    change: '+0.82%',
    up: true,
  },
  { name: 'Oracle (ORCL)', category: 'Company stocks', sector: 'Software', price: 198.4, change: '+0.65%', up: true },
  { name: 'Adobe (ADBE)', category: 'Company stocks', sector: 'Software', price: 342.8, change: '-0.42%', up: false },
  {
    name: 'Salesforce (CRM)',
    category: 'Company stocks',
    sector: 'Software',
    price: 286.5,
    change: '+0.73%',
    up: true,
  },
  { name: 'SAP SE (SAP)', category: 'Company stocks', sector: 'Software', price: 248.6, change: '+0.38%', up: true },
  { name: 'Intuit (INTU)', category: 'Company stocks', sector: 'Software', price: 672.3, change: '-0.21%', up: false },
  {
    name: 'ServiceNow (NOW)',
    category: 'Company stocks',
    sector: 'Software',
    price: 914.2,
    change: '+0.91%',
    up: true,
  },
  { name: 'Global Industrial Co.', category: 'Company stocks', price: 84.75, change: '-0.31%', up: false },
  { name: 'EUR / USD', category: 'Currency', price: 1.16, change: '+0.14%', up: true },
  { name: 'GBP / USD', category: 'Currency', price: 1.32, change: '-0.08%', up: false },
  { name: 'USD / CAD', category: 'Currency', price: 1.4, change: '+0.05%', up: true },
  { name: 'Energy sector fund', category: 'Energy', price: 92.6, change: '+0.63%', up: true },
  { name: 'Oil market reference', category: 'Energy', price: 68.2, change: '-0.44%', up: false },
  { name: 'Natural gas reference', category: 'Energy', price: 3.45, change: '+0.21%', up: true },
  { name: 'Wheat reference', category: 'Agriculture', price: 5.72, change: '+0.32%', up: true },
  { name: 'Coffee reference', category: 'Agriculture', price: 3.18, change: '-0.16%', up: false },
  { name: 'Sugar reference', category: 'Agriculture', price: 0.18, change: '+0.09%', up: true },
  { name: 'Verified goods marketplace', category: 'Goods', price: 150, change: 'Quote-based', up: true },
];

export const MARKET_TABS = [
  ['All', 'All'],
  ['Company stocks', 'Stocks'],
  ['Software', 'Software'],
  ['Currency', 'Currency'],
  ['Energy', 'Oil & gas'],
  ['Agriculture', 'Agriculture'],
  ['Goods', 'Goods'],
];

export function filterAssets(category) {
  if (category === 'All') return ASSETS;
  if (category === 'Software') return ASSETS.filter((a) => a.sector === 'Software');
  return ASSETS.filter((a) => a.category === category);
}

export const SECTORS = [
  'Technology',
  'Energy / Oil & Gas',
  'Agriculture',
  'Mining & Materials',
  'Manufacturing',
  'Financial Services',
  'Healthcare',
  'Other',
];

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'GYD', 'XCD'];
