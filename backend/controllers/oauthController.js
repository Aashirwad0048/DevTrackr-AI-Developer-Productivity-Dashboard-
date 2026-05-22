const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const CALLBACK_URL = process.env.GITHUB_CALLBACK_URL;

exports.redirectToGitHub = async (req, res) => {
  // Require authenticated user (authMiddleware should set req.user)
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  // Use JWT as state to identify user during callback
  const state = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '15m' });
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: CALLBACK_URL,
    scope: 'repo',
    state
  });
  const url = `https://github.com/login/oauth/authorize?${params.toString()}`;
  res.redirect(url);
};

exports.githubCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code || !state) return res.status(400).send('Missing code or state');
    // verify state
    let payload;
    try { payload = jwt.verify(state, process.env.JWT_SECRET || 'dev_secret'); }
    catch (e) { return res.status(400).send('Invalid state'); }

    const tokenRes = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: CALLBACK_URL,
      state
    }, { headers: { Accept: 'application/json' } });

    const accessToken = tokenRes.data?.access_token;
    if (!accessToken) return res.status(500).send('Failed to obtain access token');

    // attach token to user
    const user = await User.findById(payload.id);
    if (!user) return res.status(404).send('User not found');
    user.githubToken = accessToken;
    await user.save();

    // Redirect to frontend with success
    const successUrl = process.env.GITHUB_SUCCESS_REDIRECT || (process.env.VITE_API_BASE || 'http://localhost:5173') + '/';
    return res.redirect(successUrl + '?github_connected=1');
  } catch (err) {
    console.error('OAuth callback error', err.message);
    return res.status(500).send('OAuth error');
  }
};
