const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

async function generateInsights(analytics) {
  if (!process.env.OPENAI_API_KEY) {
    // Fallback heuristic if API key not configured
    return {
      summary: 'OpenAI API key not configured. Analytics are available but AI insights are disabled.',
      bottlenecks: [],
      recommendations: [],
      contributorInsights: []
    };
  }

  const prompt = `You are an assistant that converts compact analytics metrics into a short sprint summary, bottlenecks, recommendations, and contributor insights.\n\nAnalytics JSON:\n${JSON.stringify(analytics, null, 2)}\n\nRespond with a JSON object with keys: summary (string), bottlenecks (array of strings), recommendations (array of strings), contributorInsights (array of strings). Keep each entry concise.`;

  const resp = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a helpful assistant that summarizes repository analytics into actionable insights.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 500,
    temperature: 0.2
  });

  const text = resp.data.choices?.[0]?.message?.content || '';
  // Try to parse JSON from the assistant
  try {
    const jsonStart = text.indexOf('{');
    const jsonText = jsonStart >= 0 ? text.slice(jsonStart) : text;
    const parsed = JSON.parse(jsonText);
    return parsed;
  } catch (e) {
    // If parsing fails, return a best-effort text summary
    return { summary: text.trim(), bottlenecks: [], recommendations: [], contributorInsights: [] };
  }
}

module.exports = { generateInsights };
