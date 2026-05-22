const axios = require('axios');
const { baseUrl } = require('../config/github');

async function listUserRepos(token) {
  if (!token) throw new Error('No GitHub token provided');
  const res = await axios.get(`${baseUrl}/user/repos`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
}

async function getRepoDetails(token, fullName) {
  if (!token) throw new Error('No GitHub token provided');
  const res = await axios.get(`${baseUrl}/repos/${fullName}`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
}

module.exports = { listUserRepos, getRepoDetails };
