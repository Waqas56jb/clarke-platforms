const fs = require('fs');
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const env = require('./config/env');
const { apiLimiter, authLimiter } = require('./middleware/rateLimits');
const errorHandler = require('./middleware/errorHandler');
const paymentController = require('./controllers/paymentController');
const apiRoutes = require('./routes');

function createApp() {
  const app = express();
  app.disable('x-powered-by');
  if (env.trustProxy) app.set('trust proxy', env.trustProxy);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' }, contentSecurityPolicy: false }));
  if (env.appOrigin) app.use(cors({ origin: env.appOrigin, credentials: true }));

  // Registered before the JSON parser: Stripe verifies the signature against the raw body.
  app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), paymentController.webhook);

  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use('/uploads', express.static(env.uploadDir, { fallthrough: false, immutable: true, maxAge: '7d' }));
  app.use('/api/', apiLimiter);
  app.use('/api/auth', authLimiter);
  app.use('/api', apiRoutes);

  if (env.clientDistDir && fs.existsSync(env.clientDistDir)) {
    app.use(express.static(env.clientDistDir));
    app.get('*', (_req, res) => res.sendFile(path.join(env.clientDistDir, 'index.html')));
  }

  app.use(errorHandler);
  return app;
}

module.exports = createApp;
