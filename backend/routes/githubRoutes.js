const router = require('express').Router();
const ctrl = require('../controllers/githubController');
const auth = require('../middleware/authMiddleware');

router.get('/repos', auth, ctrl.getRepos);
router.get('/repo/:name', auth, ctrl.getRepo);
router.get('/commits/:owner/:repo', auth, ctrl.getCommits);
router.get('/pulls/:owner/:repo', auth, ctrl.getPulls);
router.get('/issues/:owner/:repo', auth, ctrl.getIssues);

module.exports = router;
