import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'answers array required' });
    }

    const answersBlock = answers
      .map(({ question, answer, level }) => `[${level}] Q: ${question}\nA: ${answer}`)
      .join('\n\n');

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1500,
      system: `You are a positioning strategist helping a content creator discover their unique differentiation. Based on their answers below, write their Differentiation Profile. It should include: their core positioning statement, 3 things that make them genuinely different, their ideal client in plain language, and one thing they should stop doing that's making them invisible. Be specific, direct, and use their own words back at them where possible. No fluff.`,
      messages: [{ role: 'user', content: `Here are the respondent's word-for-word answers:\n\n${answersBlock}\n\nWrite their Differentiation Profile now.` }],
    });

    const profile = message.content[0].type === 'text' ? message.content[0].text : '';
    return res.json({ profile });
  } catch (err) {
    console.error('Claude API error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
