const fs = require('fs');
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const env = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimits');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const apiRoutes = require('./routes');

function createApp() {
  const app = express();
  app.disable('x-powered-by');
  if (env.trustProxy) app.set('trust proxy', env.trustProxy);
  app.use(helmet());
  if (env.appOrigin) app.use(cors({ origin: env.appOrigin }));
  app.use(express.json({ limit: '100kb' }));
  app.use('/api', apiLimiter, apiRoutes);
  app.use('/api', notFound);

  if (env.clientDistDir && fs.existsSync(env.clientDistDir)) {
    app.use(express.static(env.clientDistDir));
    app.get('*', (_req, res) => res.sendFile(path.join(env.clientDistDir, 'index.html')));
  }

  app.use(errorHandler);
  return app;
}

module.exports = createApp;
