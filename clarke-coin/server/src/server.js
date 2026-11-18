const env = require('./config/env');
const createApp = require('./app');
const migrate = require('./db/migrate');

async function start() {
  // Automatic in development; in production only when RUN_MIGRATIONS_ON_START=true is set deliberately.
  if (!env.isProduction || env.runMigrationsOnStart) await migrate();
  createApp().listen(env.port, () => console.log(`${env.appName} listening on http://localhost:${env.port}`));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
