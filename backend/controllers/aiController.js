const analyticsService = require('../services/analyticsService');
const aiService = require('../services/aiService');

exports.getInsightsForRepo = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const token = req.user?.githubToken || req.query.token;
    if (!token) return res.status(401).json({ error: 'No GitHub token' });

    const analytics = await analyticsService.processRepoAnalytics(token, owner, repo, { per_page: 100 });
    const insights = await aiService.generateInsights(analytics);
    return res.json({ analytics, insights });
  } catch (err) {
    console.error('AI insights error', err.message);
    return res.status(500).json({ error: err.message });
  }
};
