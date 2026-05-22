// Gemini-based AI service using @google/generative-ai
let GoogleGenerativeAI;
try {
  ({ GoogleGenerativeAI } = require('@google/generative-ai'));
} catch (e) {
  console.warn('Gemini SDK not installed. Install with: npm install @google/generative-ai');
}

async function generateInsights(analytics, owner, repo) {
  const repoName = owner && repo ? `${owner}/${repo}` : 'selected repository';

  const buildFallbackInsights = (data) => {
    const commitCount = Array.isArray(data?.commitFrequency)
      ? data.commitFrequency.reduce((sum, entry) => sum + (Number(entry.count) || 0), 0)
      : 0;
    const inactive = Array.isArray(data?.inactiveContributors) ? data.inactiveContributors : [];
    const latestCommits = Array.isArray(data?.latestCommitMessages) ? data.latestCommitMessages.slice(0, 5) : [];
    const openPRTitles = Array.isArray(data?.openPRTitles) ? data.openPRTitles.slice(0, 5) : [];
    const openIssueTitles = Array.isArray(data?.openIssueTitles) ? data.openIssueTitles.slice(0, 5) : [];
    const recommendations = Array.isArray(data?.aiRecommendations) && data.aiRecommendations.length > 0
      ? data.aiRecommendations
      : ['Review recent work distribution', 'Add tests', 'Improve CI'];

    const bottlenecks = [];
    if (openPRTitles.length > 0) {
      bottlenecks.push(`Open PR backlog is visible: ${openPRTitles[0]}.`);
    }
    if (openIssueTitles.length > 0) {
      bottlenecks.push(`Open issue backlog includes: ${openIssueTitles[0]}.`);
    }
    if (inactive.length > 0) {
      bottlenecks.push(`Contributor '${inactive[0]}' appears inactive or underutilized.`);
    }

    return {
      summary: data?.sprintSummary
        ? `${repoName}: ${data.sprintSummary}`
        : `${repoName}: Analytics show ${commitCount} commits across ${Array.isArray(data?.commitFrequency) ? data.commitFrequency.length : 0} tracked days.`,
      projectHealth: openPRTitles.length === 0 && openIssueTitles.length === 0 ? 'Stable' : 'Needs attention',
      sprintStatus: data?.sprint?.sprintProgress != null ? `${data.sprint.sprintProgress}% complete` : 'Unknown',
      commitAnalysis: `Commits observed over the tracked period.`,
      pullRequestAnalysis: `Open PRs: ${openPRTitles.length}`,
      issueAnalysis: `Open Issues: ${openIssueTitles.length}`,
      contributorInsights: latestCommits.length > 0
        ? latestCommits.map(message => `Recent work includes: ${message}`)
        : (inactive.length > 0
          ? inactive.map(name => `${name} may need follow-up or task redistribution.`)
          : ['Contributor activity is balanced across the tracked period.']),
      bottlenecks: bottlenecks.length > 0 ? bottlenecks : ['No obvious bottlenecks detected from the available analytics.'],
      recommendations,
      technicalRisks: openPRTitles.length > 0 || openIssueTitles.length > 0 ? ['Backlog items may delay the next sprint.'] : []
    };
  };

  const apiKey = process.env.GEMINI_API_KEY || process.env.GEN_AI_KEY || process.env.OPENAI_API_KEY;
  const prompt = `You are DevTrackr AI — an advanced software engineering productivity analyst.

Your role is to analyze GitHub repository activity and generate professional repository-level engineering insights.

IMPORTANT:
- Analyze ONLY the provided repository.
- NEVER generate generic GitHub profile advice.
- NEVER generate vague motivational feedback.
- Focus ONLY on repository engineering activity, sprint health, contributor productivity, technical bottlenecks, and development workflow.

Your analysis must reference:
- specific modules (extracted from commit/PR/issue titles)
- commit patterns
- issue categories
- pull request themes
- repository workflows

Every recommendation must be tied to repository evidence. Do NOT give generic software advice.

You are analyzing a real software project repository using:
- commits
- pull requests
- issues
- contributors
- sprint progress
- code activity
- development velocity

--------------------------------------------------
PROJECT CONTEXT
--------------------------------------------------

DevTrackr is an AI-powered developer productivity dashboard.

Core Features:
1. User Authentication
   - Signup/Login
   - JWT authentication
   - Secure sessions

2. GitHub Integration
   - Connect GitHub repositories
   - Fetch commits
   - Fetch issues
   - Fetch pull requests
   - Fetch contributors

3. AI Productivity Analysis
   - AI summarizes commits
   - Detect inactive contributors
   - Sprint progress analysis
   - Development velocity tracking
   - Contributor workload analysis

4. Dashboard Visualization
   - Commit charts
   - Pull request analytics
   - Issue tracking
   - Sprint analytics
   - Contributor activity graphs

5. AI Recommendations
   - Suggest task prioritization
   - Detect technical bottlenecks
   - Detect workflow inefficiencies
   - Suggest sprint improvements
   - Highlight project risks

6. Export Reports
   - Generate downloadable PDF sprint summaries
   - Include analytics and AI recommendations

--------------------------------------------------
ANALYSIS REQUIREMENTS
--------------------------------------------------

Your analysis MUST include:

1. Sprint Summary
- Analyze overall project progress
- Identify whether sprint velocity is improving or slowing
- Mention backend/frontend/devops progress if inferable

2. Commit Analysis
- Analyze commit frequency
- Detect productivity spikes or inactivity
- Identify unstable development patterns

3. Pull Request Analysis
- Detect PR backlog
- Identify delayed reviews
- Analyze merge efficiency
- Mention unresolved pull requests

4. Issue Analysis
- Analyze open vs closed issues
- Detect unresolved blockers
- Mention bug accumulation trends

5. Contributor Analysis
- Detect inactive contributors
- Detect overloaded contributors
- Analyze collaboration effectiveness
- Identify uneven workload distribution

6. Technical Bottlenecks
For every technical issue or bottleneck identified:
1. Explain what happened (using concrete evidence)
2. Explain why it matters
3. Explain the engineering impact
4. Suggest a concrete technical action

Example bottlenecks to look out for:
- authentication delays
- CI/CD incomplete
- backend integration pending
- excessive unresolved issues
- delayed reviews
- missing testing coverage

7. AI Recommendations
Provide actionable engineering recommendations such as:
- prioritize issue resolution
- increase PR review frequency
- improve testing
- refactor unstable modules
- reduce technical debt
- improve CI/CD reliability

--------------------------------------------------
VERY IMPORTANT RULES
--------------------------------------------------

- NEVER hallucinate technologies not present in the repository.
- NEVER invent contributors.
- NEVER generate fake sprint progress.
- If repository activity is too low, explicitly state:
  "Repository activity is insufficient for meaningful analysis."

- Use repository data ONLY.
- Focus on engineering workflow and software delivery quality.

--------------------------------------------------
OUTPUT FORMAT
--------------------------------------------------

Return ONLY valid JSON using the following exact structure:

{
  "summary": "overall sprint summary",
  "projectHealth": "Stable or Needs attention",
  "sprintStatus": "percentage or status",
  "commitAnalysis": "detailed commit analysis",
  "pullRequestAnalysis": "detailed PR analysis",
  "issueAnalysis": "detailed issue analysis",
  "contributorInsights": [
    {
      "contributor": "name",
      "insight": "insight"
    }
  ],
  "bottlenecks": [
    {
      "issue": "issue name",
      "impact": "impact description",
      "solution": "concrete action"
    }
  ],
  "recommendations": [
    "recommendation 1",
    "recommendation 2"
  ],
  "technicalRisks": [
    {
      "risk": "risk name",
      "consequence": "consequence description"
    }
  ]
}

--------------------------------------------------
REPOSITORY DATA
--------------------------------------------------

Repository:
${repoName}

Analytics:
${JSON.stringify(analytics, null, 2)}
`;

  if (!apiKey || !GoogleGenerativeAI) {
    return {
      ...buildFallbackInsights(analytics),
      summary: `${repoName}: Using analytics-based fallback insights because Gemini is unavailable.`
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'models/gemini-flash-latest' });

    const callWithRetries = async (fn, maxRetries = 4, initialDelay = 1000) => {
      let attempt = 0;
      let delay = initialDelay;
      while (true) {
        try {
          return await fn();
        } catch (err) {
          attempt += 1;
          const status = err?.response?.status || err?.status;
          const body = err?.response?.data || err?.data || err?.message || '';
          const isQuota = status === 429 || /quota|Quota|generate_content_free_tier_requests/i.test(JSON.stringify(body));
          if (!isQuota || attempt > maxRetries) {
            throw err;
          }

          let retryMs = null;
          try {
            const parsed = typeof body === 'string' ? JSON.parse(body) : body;
            if (parsed && parsed[2] && parsed[2].retryDelay) {
              const s = parsed[2].retryDelay;
              const m = /([0-9\.]+)s/.exec(s);
              if (m) retryMs = Math.ceil(parseFloat(m[1]) * 1000);
            }
          } catch (e) { /* ignore parse errors */ }

          if (!retryMs) retryMs = delay;
          console.warn(`AI quota hit, retrying in ${retryMs}ms (attempt ${attempt}/${maxRetries})`);
          await new Promise(r => setTimeout(r, retryMs));
          delay = Math.min(delay * 2, 30000);
        }
      }
    };

    const result = await callWithRetries(() => model.generateContent(prompt));
    const response = await result.response;
    let text = '';
    if (response && typeof response.text === 'function') {
      text = response.text();
    } else if (response?.candidates && response.candidates[0]) {
      text = response.candidates[0].content || JSON.stringify(response.candidates[0]);
    } else if (typeof response === 'string') {
      text = response;
    } else {
      text = JSON.stringify(response || result);
    }

    const cleaned = String(text || '')
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    try {
      const parsed = JSON.parse(cleaned);
      return {
        summary: parsed.summary || '',
        projectHealth: parsed.projectHealth || '',
        sprintStatus: parsed.sprintStatus || '',
        commitAnalysis: parsed.commitAnalysis || '',
        pullRequestAnalysis: parsed.pullRequestAnalysis || '',
        issueAnalysis: parsed.issueAnalysis || '',
        contributorInsights: parsed.contributorInsights || [],
        bottlenecks: parsed.bottlenecks || [],
        recommendations: parsed.recommendations || [],
        technicalRisks: parsed.technicalRisks || []
      };
    } catch (e) {
      const jsonStart = cleaned.indexOf('{');
      if (jsonStart >= 0) {
        const jsonText = cleaned.slice(jsonStart);
        try {
          const parsed = JSON.parse(jsonText);
          return {
            summary: parsed.summary || '',
            projectHealth: parsed.projectHealth || '',
            sprintStatus: parsed.sprintStatus || '',
            commitAnalysis: parsed.commitAnalysis || '',
            pullRequestAnalysis: parsed.pullRequestAnalysis || '',
            issueAnalysis: parsed.issueAnalysis || '',
            contributorInsights: parsed.contributorInsights || [],
            bottlenecks: parsed.bottlenecks || [],
            recommendations: parsed.recommendations || [],
            technicalRisks: parsed.technicalRisks || []
          };
        } catch (e2) {}
      }

      return {
        ...buildFallbackInsights(analytics),
        summary: `${repoName}: Gemini returned unstructured text, so analytics-based fallback insights are shown instead.`
      };
    }
    } catch (err) {
      console.error('Gemini Full Error:', err?.response?.data || err?.message || err);
    return {
      ...buildFallbackInsights(analytics),
      summary: `${repoName}: Gemini is unavailable, so analytics-based fallback insights are shown instead.`
    };
  }
}

module.exports = { generateInsights };
