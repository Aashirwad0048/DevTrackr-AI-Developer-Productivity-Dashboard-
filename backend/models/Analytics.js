const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  repoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Repo' },
  commitFrequency: Array,
  inactiveContributors: Array,
  sprintSummary: String,
  aiRecommendations: Array
}, { timestamps: true });

module.exports = mongoose.model('Analytics', AnalyticsSchema);
