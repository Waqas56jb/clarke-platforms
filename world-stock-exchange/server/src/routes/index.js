const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth, optionalAuth, requireRole, requireUploadToken } = require('../middleware/auth');
const { orderLimiter, writeLimiter, uploadLimiter } = require('../middleware/rateLimits');
const { uploadDocument } = require('../middleware/upload');
const { signScoped } = require('../utils/tokens');
const markets = require('../services/marketService');
const trading = require('../services/tradeService');
const applications = require('../services/applicationService');
const reviews = require('../services/reviewService');
const listings = require('../services/listingService');
const fund = require('../services/fundService');

const router = Router();
const a = asyncHandler;
const issuer = [requireAuth, requireRole('issuer')];
const reviewer = [requireAuth, requireRole('reviewer')];

router.get('/health', (_req, res) => res.json({ status: 'ok', service: 'World Stock Exchange API' }));
router.use('/auth', require('./authRoutes'));
router.use('/me', require('./meRoutes'));
router.use('/files', require('./fileRoutes'));

// Markets and watchlist
router.get(
  '/markets',
  optionalAuth,
  a(async (req, res) => res.json(await markets.list(req.user?.id)))
);
router.get(
  '/watchlist',
  requireAuth,
  a(async (req, res) => res.json({ instruments: await markets.watchlist(req.user.id) }))
);
router.post(
  '/watchlist/:instrumentId',
  requireAuth,
  writeLimiter,
  a(async (req, res) => res.json(await markets.toggleWatch(req.user.id, req.params.instrumentId)))
);

// Practice trading (every account is an investor)
router.post(
  '/trades',
  requireAuth,
  orderLimiter,
  a(async (req, res) => res.status(201).json(await trading.placeTrade(req.user.id, req.body)))
);
router.get(
  '/portfolio',
  requireAuth,
  a(async (req, res) => res.json(await trading.portfolio(req.user)))
);

// Public approved listings and practice buy orders
router.get(
  '/listings',
  a(async (_req, res) => res.json({ listings: await listings.list() }))
);
router.get(
  '/listings/:id',
  a(async (req, res) => res.json({ listing: await listings.get(req.params.id) }))
);
router.post(
  '/listings/:id/orders',
  requireAuth,
  orderLimiter,
  a(async (req, res) => res.status(201).json(await listings.buy(req.user, req.params.id, req.body)))
);
router.get(
  '/orders',
  requireAuth,
  a(async (req, res) => res.json({ orders: await listings.investorOrders(req.user.id) }))
);

// Issuer workspace
router.post(
  '/applications',
  ...issuer,
  writeLimiter,
  a(async (req, res) => res.status(201).json({ application: await applications.create(req.user, req.body) }))
);
router.get(
  '/applications/mine',
  ...issuer,
  a(async (req, res) => res.json({ applications: await applications.mine(req.user.id) }))
);
router.get(
  '/issuer/orders',
  ...issuer,
  a(async (req, res) => res.json({ orders: await listings.issuerOrders(req.user.id) }))
);
router.get(
  '/applications/:id',
  requireAuth,
  a(async (req, res) => res.json({ application: await applications.get(req.user, req.params.id) }))
);
router.delete(
  '/applications/:id/documents/:docId',
  ...issuer,
  a(async (req, res) => {
    await applications.removeDocument(req.user, req.params.id, req.params.docId);
    res.json({ ok: true });
  })
);
// A short-lived signed link; the download itself re-checks permission (routes/fileRoutes.js).
router.get(
  '/applications/:id/documents/:docId/link',
  requireAuth,
  a(async (req, res) => {
    const doc = await applications.requireDocument(req.user, req.params.id, req.params.docId);
    const token = signScoped(req.user.id, 'file', '10m', { kind: 'document', id: doc.id });
    res.json({ url: `/api/files/document/${token}` });
  })
);

// Documents go straight to the API host (no proxy body limit), authorised by a short-lived upload token.
router.get('/uploads/token', ...issuer, (req, res) => res.json({ token: signScoped(req.user.id, 'upload', '15m') }));
router.post(
  '/uploads/document/:applicationId',
  uploadLimiter,
  requireUploadToken,
  requireRole('issuer'),
  uploadDocument,
  a(async (req, res) =>
    res
      .status(201)
      .json({
        document: await applications.addDocument(req.user, req.params.applicationId, req.body?.kind, req.upload),
      })
  )
);

// Reviewer screen
router.get(
  '/review/applications',
  ...reviewer,
  a(async (req, res) => res.json({ applications: await reviews.list(req.query.status) }))
);
router.post(
  '/review/applications/:id/decision',
  ...reviewer,
  writeLimiter,
  a(async (req, res) => res.json({ application: await reviews.decide(req.user, req.params.id, req.body) }))
);

// Gold & Diamond fund (read-only; entries are written only when a sale completes)
router.get(
  '/fund',
  a(async (_req, res) => res.json(await fund.summary()))
);

module.exports = router;
