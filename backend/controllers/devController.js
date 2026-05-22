const Repo = require('../models/Repo');
const Analytics = require('../models/Analytics');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

function withDemoRepoContext(analytics) {
  return {
    ...analytics,
    latestCommitMessages: analytics.latestCommitMessages || [
      'Fix JWT auth flow',
      'Add analytics cache',
      'Refactor AI insights'
    ],
    openPRTitles: analytics.openPRTitles || [
      'Improve login UX',
      'Add AI retry handling'
    ],
    openIssueTitles: analytics.openIssueTitles || [
      'Chrome login fallback',
      'Gemini quota handling'
    ],
    recentIssueTitles: analytics.recentIssueTitles || [
      'Chrome login fallback',
      'Gemini quota handling',
      'Demo data improvements'
    ],
    sprint: analytics.sprint || { sprintProgress: 60, completedTasks: 7, totalTasks: 12 }
  };
}

exports.seedDemo = async (req, res) => {
  try {
    // find a demo user (first user)
    const user = await User.findOne() || null;
    const demoRepo = await Repo.create({ repoName: 'demo-repo', owner: 'demo-owner', stars: 42, forks: 5, contributors: ['alice','bob'], pullRequests: [], issues: [] });
    const analytics = await Analytics.create({ repoId: demoRepo._id, commitFrequency: [
      { date: '2026-05-01', count: 4 }, { date: '2026-05-02', count: 2 }, { date: '2026-05-03', count: 6 },
    ], inactiveContributors: ['carol'], sprintSummary: 'Demo sprint went well', aiRecommendations: ['Improve CI', 'Add tests'] , prMetrics: { openPRs: 2, mergedPRs: 5, closedPRs: 1 }, issueMetrics: { openIssues: 3, closedIssues: 8 }, latestCommitMessages: ['Fix JWT auth flow', 'Add analytics cache', 'Refactor AI insights'], openPRTitles: ['Improve login UX', 'Add AI retry handling'], openIssueTitles: ['Chrome login fallback', 'Gemini quota handling'], recentIssueTitles: ['Chrome login fallback', 'Gemini quota handling', 'Demo data improvements'] });
    return res.json({ repo: demoRepo, analytics });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.listDemoRepos = async (req, res) => {
  try {
    const repos = await Repo.find().limit(20).lean();
    return res.json(repos);
  } catch (err) { return res.status(500).json({ error: err.message }); }
};

exports.getDemoAnalytics = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const repoDoc = await Repo.findOne({ owner, repoName: repo });
    if (!repoDoc) return res.status(404).json({ error: 'Demo repo not found' });
    const analytics = await Analytics.findOne({ repoId: repoDoc._id }).lean();
    if (!analytics) return res.status(404).json({ error: 'Demo analytics not found' });
    return res.json(withDemoRepoContext(analytics));
  } catch (err) { return res.status(500).json({ error: err.message }); }
};

exports.getDemoAI = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const repoDoc = await Repo.findOne({ owner, repoName: repo });
    if (!repoDoc) return res.status(404).json({ error: 'Demo repo not found' });
    const analytics = await Analytics.findOne({ repoId: repoDoc._id }).lean();
    if (!analytics) return res.status(404).json({ error: 'Demo analytics not found' });
    const aiService = require('../services/aiService');
    const enriched = withDemoRepoContext(analytics);
    const insights = await aiService.generateInsights(enriched, owner, repo);
    return res.json({ analytics: enriched, insights });
  } catch (err) { return res.status(500).json({ error: err.message }); }
};

exports.getDemoToken = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') return res.status(403).json({ error: 'Not allowed' });
    // Create a demo token that identifies a demo user. If a demo user exists, use its id.
    let user = await User.findOne();
    if (!user) {
      user = await User.create({ name: 'Demo User', email: 'demo@local', password: 'demo' });
    }
    const token = jwt.sign({ id: String(user._id) }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
    return res.json({ token });
  } catch (err) { return res.status(500).json({ error: err.message }); }
};
