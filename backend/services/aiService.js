// Minimal AI service placeholder - integrate OpenAI or other models here

exports.summarizeCommits = async (commits) => {
  // simple heuristic summary
  if (!commits || commits.length === 0) return 'No commits';
  return `Processed ${commits.length} commits; key themes: authentication, bugfixes.`;
};
