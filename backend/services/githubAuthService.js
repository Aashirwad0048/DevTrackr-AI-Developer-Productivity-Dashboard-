const axios = require('axios');

async function exchangeCodeForToken(code, redirectUri) {
  const res = await axios.post('https://github.com/login/oauth/access_token', {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code,
    redirect_uri: redirectUri
  }, { headers: { Accept: 'application/json' } });
  return res.data;
}

module.exports = { exchangeCodeForToken };
