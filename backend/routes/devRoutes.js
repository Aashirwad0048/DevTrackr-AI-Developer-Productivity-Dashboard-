const router = require('express').Router();
const ctrl = require('../controllers/devController');

router.post('/seed', ctrl.seedDemo);
router.get('/repos', ctrl.listDemoRepos);
router.get('/analytics/:owner/:repo', ctrl.getDemoAnalytics);
router.get('/ai/:owner/:repo', ctrl.getDemoAI);
router.get('/token', ctrl.getDemoToken);
router.get('/ai/:owner/:repo', ctrl.getDemoAI);

module.exports = router;
