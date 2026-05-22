const router = require('express').Router();
const oauthCtrl = require('../controllers/oauthController');
const auth = require('../middleware/authMiddleware');

router.get('/github', auth, oauthCtrl.redirectToGitHub);
router.get('/github/url', auth, oauthCtrl.githubUrl);
router.get('/github/callback', oauthCtrl.githubCallback);

module.exports = router;
