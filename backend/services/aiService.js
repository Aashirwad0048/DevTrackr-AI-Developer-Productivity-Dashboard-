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
      bottlenecks: bottlenecks.length > 0 ? bottlenecks : ['No obvious bottlenecks detected from the available analytics.'],
      recommendations,
      projectHealth: openPRTitles.length === 0 && openIssueTitles.length === 0 ? 'Stable' : 'Needs attention',
      sprintStatus: data?.sprint?.sprintProgress != null ? `${data.sprint.sprintProgress}% complete` : 'Unknown',
      technicalRisks: openPRTitles.length > 0 || openIssueTitles.length > 0 ? ['Backlog items may delay the next sprint.'] : [],
      contributorInsights: latestCommits.length > 0
        ? latestCommits.map(message => `Recent work includes: ${message}`)
        : (inactive.length > 0
          ? inactive.map(name => `${name} may need follow-up or task redistribution.`)
          : ['Contributor activity is balanced across the tracked period.'])
    };
  };

  const apiKey = process.env.GEMINI_API_KEY || process.env.GEN_AI_KEY || process.env.OPENAI_API_KEY;
  const prompt = `You are an expert software engineering analyst.

Analyze ONLY this GitHub repository.

Repository:
${repoName}

Focus ONLY on:
- project progress
- sprint completion
- code bottlenecks
- unresolved pull requests
- issue resolution
- contributor effectiveness
- development velocity
- technical risks

Do NOT give profile-level advice.

Return ONLY valid JSON:

{
  "summary": "",
  "bottlenecks": [],
  "recommendations": [],
  "projectHealth": "",
  "sprintStatus": "",
  "technicalRisks": []
}

Repository Analytics:
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
        bottlenecks: parsed.bottlenecks || [],
        recommendations: parsed.recommendations || [],
        projectHealth: parsed.projectHealth || '',
        sprintStatus: parsed.sprintStatus || '',
        technicalRisks: parsed.technicalRisks || [],
        contributorInsights: parsed.contributorInsights || []
      };
    } catch (e) {
      const jsonStart = cleaned.indexOf('{');
      if (jsonStart >= 0) {
        const jsonText = cleaned.slice(jsonStart);
        try {
          const parsed = JSON.parse(jsonText);
          return {
            summary: parsed.summary || '',
            bottlenecks: parsed.bottlenecks || [],
            recommendations: parsed.recommendations || [],
            projectHealth: parsed.projectHealth || '',
            sprintStatus: parsed.sprintStatus || '',
            technicalRisks: parsed.technicalRisks || [],
            contributorInsights: parsed.contributorInsights || []
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
