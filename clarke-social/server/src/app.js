const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const env = require('./config/env');
const trustedProxy = require('./middleware/trustedProxy');
const { csrfProtection } = require('./middleware/csrf');
const { apiLimiter } = require('./middleware/rateLimits');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const apiRoutes = require('./routes');

function createApp() {
  const app = express();
  app.disable('x-powered-by');
  if (env.trustProxy) app.set('trust proxy', env.trustProxy);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' }, contentSecurityPolicy: false }));
  // Only the direct routes (uploads, signed files) are called cross-origin, with bearer tokens, not cookies.
  app.use(cors({ origin: env.appOrigin, credentials: false, allowedHeaders: ['Authorization', 'Content-Type'] }));
  app.use(trustedProxy);

  // Public media is embedded by the website, which is a different site from the API host.
  app.use(
    '/uploads',
    express.static(env.uploadDir, {
      immutable: true,
      maxAge: '7d',
      setHeaders: (res) => res.set('Cross-Origin-Resource-Policy', 'cross-origin'),
    }),
    notFound
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use('/api', apiLimiter, csrfProtection, apiRoutes, notFound);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = createApp;
