const router = require('express').Router();
const ctrl = require('../controllers/analyticsController');
const auth = require('../middleware/authMiddleware');

router.get('/:repoId', auth, ctrl.getAnalytics);
router.post('/generate', auth, ctrl.generateAnalytics);

module.exports = router;
