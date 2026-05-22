const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  githubToken: String,
  repositories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Repo' }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
