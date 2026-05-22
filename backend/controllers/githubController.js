const githubService = require('../services/githubService');

exports.getRepos = async (req, res) => {
  try {
    const token = req.user?.githubToken || req.query.token;
    const repos = await githubService.listUserRepos(token);
    res.json(repos);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getRepo = async (req, res) => {
  try {
    const { name } = req.params;
    const token = req.user?.githubToken || req.query.token;
    const repo = await githubService.getRepoDetails(token, name);
    res.json(repo);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getCommits = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const per_page = parseInt(req.query.per_page) || 50;
    const token = req.user?.githubToken || req.query.token;
    const commits = await githubService.getRepoCommits(token, owner, repo, per_page);
    return res.json({ totalCommits: commits.length, commits });
  } catch (err) {
    if (err.response?.status === 401) return res.status(401).json({ error: 'GitHub token expired or unauthorized' });
    if (err.response?.status === 404) return res.status(404).json({ error: 'Repository not found' });
    return res.status(500).json({ error: err.message });
  }
};

exports.getPulls = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const per_page = parseInt(req.query.per_page) || 50;
    const token = req.user?.githubToken || req.query.token;
    const pulls = await githubService.getRepoPulls(token, owner, repo, per_page);
    const openPRs = pulls.filter(p => p.state === 'open').length;
    const closedPRs = pulls.filter(p => p.state !== 'open').length;
    return res.json({ openPRs, closedPRs, pulls });
  } catch (err) {
    if (err.response?.status === 401) return res.status(401).json({ error: 'GitHub token expired or unauthorized' });
    if (err.response?.status === 404) return res.status(404).json({ error: 'Repository not found' });
    return res.status(500).json({ error: err.message });
  }
};

exports.getIssues = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const per_page = parseInt(req.query.per_page) || 50;
    const token = req.user?.githubToken || req.query.token;
    const issues = await githubService.getRepoIssues(token, owner, repo, per_page);
    const openIssues = issues.filter(i => !i.pull_request && i.state === 'open').length;
    const closedIssues = issues.filter(i => !i.pull_request && i.state !== 'open').length;
    return res.json({ openIssues, closedIssues, issues });
  } catch (err) {
    if (err.response?.status === 401) return res.status(401).json({ error: 'GitHub token expired or unauthorized' });
    if (err.response?.status === 404) return res.status(404).json({ error: 'Repository not found' });
    return res.status(500).json({ error: err.message });
  }
};
