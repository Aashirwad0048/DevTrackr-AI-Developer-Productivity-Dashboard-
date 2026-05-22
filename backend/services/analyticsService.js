const Analytics = require('../models/Analytics');

exports.getAnalyticsForRepo = async (repoId) => {
  return Analytics.findOne({ repoId });
};

exports.generateAnalytics = async (payload) => {
  // placeholder: process payload (commits, prs, issues) and store analysis
  const doc = await Analytics.create(payload);
  return doc;
};
