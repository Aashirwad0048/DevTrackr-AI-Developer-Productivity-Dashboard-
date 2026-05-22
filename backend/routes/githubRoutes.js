const router = require('express').Router();
const ctrl = require('../controllers/githubController');
const auth = require('../middleware/authMiddleware');

router.get('/repos', auth, ctrl.getRepos);
router.get('/repo/:name', auth, ctrl.getRepo);

module.exports = router;
