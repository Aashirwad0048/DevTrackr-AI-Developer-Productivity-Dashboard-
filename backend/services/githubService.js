const axios = require('axios');
const { baseUrl } = require('../config/github');

async function listUserRepos(token) {
  const res = await axios.get(`${baseUrl}/user/repos`, { headers: { Authorization: `token ${token}` } });
  return res.data;
}

async function getRepoDetails(token, fullName) {
  const res = await axios.get(`${baseUrl}/repos/${fullName}`, { headers: { Authorization: `token ${token}` } });
  return res.data;
}

module.exports = { listUserRepos, getRepoDetails };
