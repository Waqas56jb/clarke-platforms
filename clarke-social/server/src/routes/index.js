const { Router } = require('express');

const router = Router();

router.use('/auth', require('./authRoutes'));
router.use('/me', require('./meRoutes'));
router.use('/posts', require('./postRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/dating', require('./datingRoutes'));
router.use('/payments', require('./paymentRoutes'));
router.use('/calls', require('./callRoutes'));
router.use('/messages', require('./messageRoutes'));
router.use('/', require('./legacyRoutes'));

module.exports = router;
