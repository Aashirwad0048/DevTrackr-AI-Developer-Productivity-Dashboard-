jest.mock('../middleware/authMiddleware', () => (req, res, next) => {
  req.user = { githubToken: 'github-token' };
  next();
});

jest.mock('../services/analyticsService', () => ({
  processRepoAnalytics: jest.fn()
}));

jest.mock('../services/aiService', () => ({
  generateInsights: jest.fn()
}));

const request = require('supertest');
const app = require('../server');
const analyticsService = require('../services/analyticsService');
const aiService = require('../services/aiService');

describe('AI insights route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/ai/insights/:owner/:repo returns analytics and insights', async () => {
    analyticsService.processRepoAnalytics.mockResolvedValue({
      commitFrequency: [{ date: '2026-05-20', count: 8 }],
      prMetrics: { openPRs: 5 },
      issueMetrics: { openIssues: 7 }
    });
    aiService.generateInsights.mockResolvedValue({
      summary: 'Backend sprint improved',
      bottlenecks: ['Too many unresolved PRs'],
      recommendations: ['Prioritize issue resolution'],
      contributorInsights: ['2 contributors inactive']
    });

    const response = await request(app).get('/api/ai/insights/devtrackr/demo');

    expect(response.status).toBe(200);
    expect(response.body.insights.summary).toBe('Backend sprint improved');
    expect(aiService.generateInsights).toHaveBeenCalled();
  });
});
