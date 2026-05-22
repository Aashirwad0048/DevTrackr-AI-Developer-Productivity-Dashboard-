const githubService = require('./githubService');

function toDateKey(iso) {
  const d = new Date(iso);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

async function calculateCommitFrequency(commits) {
  // group commits by date (UTC)
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
  // Determine last commit date per author (use author.login or commit.author.name)
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
  // filter out pull requests that appear in issues list
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
  // fetch raw data from GitHub
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
  const sprint = await generateSprintProgress({ mergedPRs: prMetrics.mergedPRs, closedIssues: issueMetrics.closedIssues, totalPRs: prMetrics.totalPRs, totalIssues: issueMetrics.totalIssues });

  return {
    commitFrequency: commitFreq.dailyCommits,
    inactiveContributors: inactive.inactiveContributors,
    lastActivity: inactive.lastActivity,
    prMetrics,
    issueMetrics,
    sprint
  };
}

module.exports = {
  calculateCommitFrequency,
  detectInactiveContributors,
  calculatePRMetrics,
  calculateIssueMetrics,
  generateSprintProgress,
  processRepoAnalytics
};
const Analytics = require('../models/Analytics');

exports.getAnalyticsForRepo = async (repoId) => {
  return Analytics.findOne({ repoId });
};

exports.generateAnalytics = async (payload) => {
  // placeholder: process payload (commits, prs, issues) and store analysis
  const doc = await Analytics.create(payload);
  return doc;
};
