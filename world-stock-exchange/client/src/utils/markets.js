// Market filters, data-source labels and the issuer form options (the server validates the same lists).
export const MARKET_TABS = [
  ['All', 'All'],
  ['Company stocks', 'Stocks'],
  ['Software', 'Software'],
  ['Currency', 'Currency'],
  ['Energy', 'Oil & gas'],
  ['Agriculture', 'Agriculture'],
  ['Goods', 'Goods'],
];

export function filterInstruments(instruments, category) {
  if (category === 'All') return instruments;
  if (category === 'Software') return instruments.filter((i) => i.sector === 'Software');
  return instruments.filter((i) => i.category === category);
}

export const isMarketData = (instrument) => instrument.source === 'market';

export const ILLUSTRATIVE_LABEL = 'Illustrative data';
export const MARKET_LABEL = 'Market data from Finnhub (may be delayed)';

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
