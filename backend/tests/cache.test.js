jest.mock('../utils/cache', () => ({
  get: jest.fn(),
  set: jest.fn()
}));

jest.mock('../services/githubService', () => ({
  getRepoCommits: jest.fn(),
  getRepoPulls: jest.fn(),
  getRepoIssues: jest.fn()
}));

const cache = require('../utils/cache');
const githubService = require('../services/githubService');
const analyticsService = require('../services/analyticsService');

describe('Analytics service caching', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns cached analytics when cache hits', async () => {
    const cached = { commitFrequency: [{ date: '2026-05-20', count: 8 }] };
    cache.get.mockReturnValue(cached);

    const result = await analyticsService.getRepoAnalyticsWithCache('github-token', 'devtrackr', 'demo', { per_page: 100 });

    expect(result).toBe(cached);
    expect(githubService.getRepoCommits).not.toHaveBeenCalled();
    expect(githubService.getRepoPulls).not.toHaveBeenCalled();
    expect(githubService.getRepoIssues).not.toHaveBeenCalled();
  });

  test('stores analytics in cache when cache misses', async () => {
    cache.get.mockReturnValue(undefined);
    githubService.getRepoCommits.mockResolvedValue([
      { commit: { author: { date: '2026-05-20T10:00:00Z' } }, author: { login: 'john' } },
      { commit: { author: { date: '2026-05-20T12:00:00Z' } }, author: { login: 'john' } }
    ]);
    githubService.getRepoPulls.mockResolvedValue([
      { state: 'open', merged_at: null },
      { state: 'closed', merged_at: '2026-05-21T00:00:00Z' }
    ]);
    githubService.getRepoIssues.mockResolvedValue([
      { state: 'open' },
      { state: 'closed' }
    ]);

    const result = await analyticsService.getRepoAnalyticsWithCache('github-token', 'devtrackr', 'demo', { per_page: 100 });

    expect(result.commitFrequency).toEqual([{ date: '2026-05-20', count: 2 }]);
    expect(cache.set).toHaveBeenCalled();
    expect(githubService.getRepoCommits).toHaveBeenCalled();
  });
});
