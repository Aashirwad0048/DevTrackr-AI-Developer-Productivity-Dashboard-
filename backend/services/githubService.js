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

async function getRepoCommits(token, owner, repo, per_page = 50) {
  if (!token) throw new Error('No GitHub token provided');
  const url = `${baseUrl}/repos/${owner}/${repo}/commits?per_page=${per_page}`;
  const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
}

async function getRepoPulls(token, owner, repo, per_page = 50) {
  if (!token) throw new Error('No GitHub token provided');
  const url = `${baseUrl}/repos/${owner}/${repo}/pulls?state=all&per_page=${per_page}`;
  const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
}

async function getRepoIssues(token, owner, repo, per_page = 50) {
  if (!token) throw new Error('No GitHub token provided');
  const url = `${baseUrl}/repos/${owner}/${repo}/issues?state=all&per_page=${per_page}`;
  const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
}

module.exports = { listUserRepos, getRepoDetails, getRepoCommits, getRepoPulls, getRepoIssues };
