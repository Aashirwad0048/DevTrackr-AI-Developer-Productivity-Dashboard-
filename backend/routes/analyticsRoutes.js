const router = require('express').Router();
const ctrl = require('../controllers/analyticsController');
const auth = require('../middleware/authMiddleware');

router.get('/:repoId', auth, ctrl.getAnalytics);
router.post('/generate', auth, ctrl.generateAnalytics);
router.get('/repo/:owner/:repo', auth, ctrl.generateRepoAnalytics);
router.get('/report/:owner/:repo', auth, ctrl.downloadReport);

module.exports = router;
