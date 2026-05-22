const mongoose = require('mongoose');

const RepoSchema = new mongoose.Schema({
  repoName: String,
  owner: String,
  stars: Number,
  forks: Number,
  contributors: Array,
  pullRequests: Array,
  issues: Array
}, { timestamps: true });

module.exports = mongoose.model('Repo', RepoSchema);
