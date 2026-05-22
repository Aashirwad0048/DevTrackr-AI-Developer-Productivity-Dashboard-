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
