const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const securityHeaders = require('./middleware/securityHeaders');
const { defaultLimiter } = require('./middleware/rateLimits');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { reviver } = require('./utils/jsonNumberSources');

function createApp() {
  const app = express();
  app.disable('x-powered-by');
  if (env.trustProxy) app.set('trust proxy', env.trustProxy);
  app.use(securityHeaders);
  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: false,
      methods: ['GET', 'POST'],
      allowedHeaders: ['Authorization', 'Content-Type', 'Idempotency-Key'],
      optionsSuccessStatus: 200,
    })
  );
  app.use(defaultLimiter);
  app.use(express.json({ limit: '100kb', strict: false, reviver }));

  app.use(require('./routes/healthRoutes'));
  app.use('/auth', require('./routes/authRoutes'));
  app.use('/wallet', require('./routes/walletRoutes'));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = createApp;
