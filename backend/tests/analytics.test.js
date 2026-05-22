jest.mock('../middleware/authMiddleware', () => (req, res, next) => {
  req.user = { githubToken: 'github-token' };
  next();
});

jest.mock('../services/analyticsService', () => ({
  getAnalyticsForRepo: jest.fn(),
  generateAnalytics: jest.fn(),
  processRepoAnalytics: jest.fn(),
  getRepoAnalyticsWithCache: jest.fn()
}));

const request = require('supertest');
const app = require('../server');
const analyticsService = require('../services/analyticsService');

describe('Analytics route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/analytics/repo/:owner/:repo returns processed metrics', async () => {
    analyticsService.getRepoAnalyticsWithCache.mockResolvedValue({
      commitFrequency: [{ date: '2026-05-20', count: 8 }],
      inactiveContributors: ['johnDoe'],
      prMetrics: { openPRs: 5, mergedPRs: 18, closedPRs: 23, totalPRs: 23, prCompletionRate: 78 },
      issueMetrics: { openIssues: 7, closedIssues: 30, totalIssues: 37, issueResolutionRate: 81 },
      sprint: { sprintProgress: 68 }
    });

    const response = await request(app).get('/api/analytics/repo/devtrackr/demo');

    expect(response.status).toBe(200);
    expect(response.body.sprint.sprintProgress).toBe(68);
    expect(analyticsService.getRepoAnalyticsWithCache).toHaveBeenCalledWith('github-token', 'devtrackr', 'demo', { per_page: 100 });
  });
});
