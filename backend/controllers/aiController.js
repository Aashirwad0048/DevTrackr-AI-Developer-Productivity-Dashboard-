const analyticsService = require('../services/analyticsService');
const aiService = require('../services/aiService');
const cache = require('../utils/cache');

exports.getInsightsForRepo = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const token = req.user?.githubToken || req.query.token;
    if (!token) return res.status(401).json({ error: 'No GitHub token' });

    const cacheKey = `ai_${owner}_${repo}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const analytics = await analyticsService.getRepoAnalyticsWithCache(token, owner, repo, { per_page: 100 });
    const insights = await aiService.generateInsights(analytics, owner, repo);
    const response = { analytics, insights };
    // Cache AI responses for 6 hours to avoid excessive Gemini calls
    cache.set(cacheKey, response, 21600);
    return res.json(response);
  } catch (err) {
    console.error('AI insights error', err.message);
    return res.status(500).json({ error: err.message });
  }
};
