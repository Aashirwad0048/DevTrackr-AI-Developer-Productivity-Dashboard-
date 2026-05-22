const githubService = require('./githubService');
const cache = require('../utils/cache');

function toDateKey(iso) {
  const d = new Date(iso);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

async function calculateCommitFrequency(commits) {
  const map = {};
  (commits || []).forEach(c => {
    const date = c.commit?.author?.date || c.commit?.committer?.date || c.author?.date;
    if (!date) return;
    const key = toDateKey(date);
    map[key] = (map[key] || 0) + 1;
  });
  const dailyCommits = Object.keys(map).sort().map(date => ({ date, count: map[date] }));
  return { dailyCommits };
}

async function detectInactiveContributors(commits, daysThreshold = 14) {
  const last = {};
  (commits || []).forEach(c => {
    const when = c.commit?.author?.date || c.commit?.committer?.date;
    const author = (c.author && c.author.login) || (c.commit?.author?.name) || 'unknown';
    if (!when) return;
    const prev = last[author];
    if (!prev || new Date(when) > new Date(prev)) last[author] = when;
  });
  const now = Date.now();
  const inactive = Object.keys(last).filter(a => {
    const diffDays = Math.floor((now - new Date(last[a]).getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= daysThreshold;
  });
  return { inactiveContributors: inactive, lastActivity: last };
}

async function calculatePRMetrics(pulls) {
  const total = (pulls || []).length;
  const open = (pulls || []).filter(p => p.state === 'open').length;
  const merged = (pulls || []).filter(p => p.merged_at).length;
  const closed = total - open;
  const completionRate = total === 0 ? 0 : Math.round((merged / total) * 100);
  return { totalPRs: total, openPRs: open, closedPRs: closed, mergedPRs: merged, prCompletionRate: completionRate };
}

async function calculateIssueMetrics(issues) {
  const pureIssues = (issues || []).filter(i => !i.pull_request);
  const total = pureIssues.length;
  const open = pureIssues.filter(i => i.state === 'open').length;
  const closed = total - open;
  const resolutionRate = total === 0 ? 0 : Math.round((closed / total) * 100);
  return { totalIssues: total, openIssues: open, closedIssues: closed, issueResolutionRate: resolutionRate };
}

async function generateSprintProgress({ mergedPRs = 0, closedIssues = 0, totalPRs = 0, totalIssues = 0 }) {
  const completed = mergedPRs + closedIssues;
  const total = totalPRs + totalIssues;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { sprintProgress: percent, completedTasks: completed, totalTasks: total };
}

async function processRepoAnalytics(token, owner, repo, opts = {}) {
  const per_page = opts.per_page || 100;
  const [commits, pulls, issues] = await Promise.all([
    githubService.getRepoCommits(token, owner, repo, per_page),
    githubService.getRepoPulls(token, owner, repo, per_page),
    githubService.getRepoIssues(token, owner, repo, per_page)
  ]);

  const commitFreq = await calculateCommitFrequency(commits);
  const inactive = await detectInactiveContributors(commits, opts.inactiveDays || 14);
  const prMetrics = await calculatePRMetrics(pulls);
  const issueMetrics = await calculateIssueMetrics(issues);
  const sprint = await generateSprintProgress({
    mergedPRs: prMetrics.mergedPRs,
    closedIssues: issueMetrics.closedIssues,
    totalPRs: prMetrics.totalPRs,
    totalIssues: issueMetrics.totalIssues
  });

  return {
    commitFrequency: commitFreq.dailyCommits,
    inactiveContributors: inactive.inactiveContributors,
    lastActivity: inactive.lastActivity,
    prMetrics,
    issueMetrics,
    sprint
  };
}

async function getRepoAnalyticsWithCache(token, owner, repo, opts = {}) {
  const per_page = opts.per_page || 100;
  const inactiveDays = opts.inactiveDays || 14;
  const cacheKey = `analytics_${owner}_${repo}_${per_page}_${inactiveDays}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const analytics = await processRepoAnalytics(token, owner, repo, opts);
  cache.set(cacheKey, analytics);
  return analytics;
}

module.exports = {
  calculateCommitFrequency,
  detectInactiveContributors,
  calculatePRMetrics,
  calculateIssueMetrics,
  generateSprintProgress,
  processRepoAnalytics,
  getRepoAnalyticsWithCache
};
