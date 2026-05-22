const router = require('express').Router();
const ctrl = require('../controllers/aiController');
const auth = require('../middleware/authMiddleware');

router.get('/insights/:owner/:repo', auth, ctrl.getInsightsForRepo);

module.exports = router;
