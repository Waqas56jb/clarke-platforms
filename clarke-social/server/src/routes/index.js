const { Router } = require('express');

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok', service: 'Clarke API' }));
router.use('/auth', require('./authRoutes'));
router.use('/me', require('./meRoutes'));
router.use('/uploads', require('./uploadRoutes'));
router.use('/posts', require('./postRoutes'));
router.use('/stories', require('./storyRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/notifications', require('./notificationRoutes'));
router.use('/messages', require('./messageRoutes'));
router.use('/dating', require('./datingRoutes'));
router.use('/calls', require('./callRoutes'));
router.use('/payments', require('./paymentRoutes'));
router.use('/files', require('./fileRoutes'));
router.use('/', require('./mediaRoutes'));
router.use('/', require('./discoveryRoutes'));

module.exports = router;
