const analyticsService = require('../services/analyticsService');
const aiService = require('../services/aiService');
const pdfService = require('../services/pdfService');

exports.getAnalytics = async (req, res) => {
  try {
    const { repoId } = req.params;
    const data = await analyticsService.getAnalyticsForRepo(repoId);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.generateAnalytics = async (req, res) => {
  try {
    const payload = req.body;
    const result = await analyticsService.generateAnalytics(payload);
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.generateRepoAnalytics = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const token = req.user?.githubToken || req.query.token;
    if (!token) return res.status(401).json({ error: 'No GitHub token' });
    const data = await analyticsService.getRepoAnalyticsWithCache(token, owner, repo, { per_page: 100 });
    return res.json(data);
  } catch (err) {
    if (err.response?.status === 401) return res.status(401).json({ error: 'GitHub token expired' });
    return res.status(500).json({ error: err.message });
  }
};

exports.downloadReport = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const token = req.user?.githubToken || req.query.token;
    if (!token) return res.status(401).json({ error: 'No GitHub token' });

    // Generate or fetch the cached analytics & insights
    const analytics = await analyticsService.getRepoAnalyticsWithCache(token, owner, repo, { per_page: 100 });
    const insights = await aiService.generateInsights(analytics, owner, repo);

    pdfService.generatePDF(res, {
      repo: `${owner}/${repo}`,
      ...insights
    });
  } catch (err) {
    console.error('PDF error', err.message);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
};
