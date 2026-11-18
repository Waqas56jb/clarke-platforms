const env = require('./config/env');
const createApp = require('./app');
const migrate = require('./db/migrate');
const importLegacy = require('./legacy/importSqlite');
const { startMarketData } = require('./services/marketDataService');

async function start() {
  await migrate();
  await importLegacy();
  startMarketData();
  createApp().listen(env.port, () => console.info(`World Stock Exchange API running at http://localhost:${env.port}`));
}

start().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
