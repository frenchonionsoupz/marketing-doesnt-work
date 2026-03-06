import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import { Resend } from 'resend';
import { config } from 'dotenv';

config({ path: new URL('../.env', import.meta.url).pathname });

const app = express();
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173', 'https://marketingdoesntwork.com'] }));
app.use(express.json({ limit: '10mb' }));

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);

// ──────────────────────────────────────────────
// POST /api/generate-profile
// Body: { answers: Array<{ question: string, answer: string, level: string }> }
// ──────────────────────────────────────────────
app.post('/api/generate-profile', async (req, res) => {
  try {
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'answers array required' });
    }

    // Build the answers block – using their word-for-word responses
    const answersBlock = answers
      .map(({ question, answer, level }) =>
        `[${level}] Q: ${question}\nA: ${answer}`
      )
      .join('\n\n');

    const systemPrompt = `You are a positioning strategist helping a content creator discover their unique differentiation. Based on their answers below, write their Differentiation Profile. It should include: their core positioning statement, 3 things that make them genuinely different, their ideal client in plain language, and one thing they should stop doing that's making them invisible. Be specific, direct, and use their own words back at them where possible. No fluff.`;

    const userMessage = `Here are the respondent's word-for-word answers:\n\n${answersBlock}\n\nWrite their Differentiation Profile now.`;

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const profile = message.content[0].type === 'text' ? message.content[0].text : '';

    return res.json({ profile });
  } catch (err) {
    console.error('Claude API error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────
// POST /api/send-email
// Body: { email: string, name: string, profile: string }
// ──────────────────────────────────────────────
app.post('/api/send-email', async (req, res) => {
  try {
    const { email, name, profile } = req.body;
    if (!email || !name || !profile) {
      return res.status(400).json({ error: 'email, name, profile required' });
    }

    // Format profile as clean HTML sections
    const profileHtml = profile
      .split('\n')
      .map(line => {
        const l = line.trim();
        if (!l) return '';
        if (l.startsWith('##')) return `<h2 style="color:#ffdd57;font-size:16px;margin:24px 0 8px;">${l.replace(/^##\s*/, '')}</h2>`;
        if (l.startsWith('#')) return `<h1 style="color:#ffdd57;font-size:20px;margin:28px 0 12px;">${l.replace(/^#\s*/, '')}</h1>`;
        if (l.startsWith('- ') || l.startsWith('• ')) return `<li style="color:#f0f0f0;margin:6px 0 6px 16px;">${l.replace(/^[-•]\s*/, '')}</li>`;
        if (l.match(/^\d+\./)) return `<li style="color:#f0f0f0;margin:6px 0 6px 16px;">${l.replace(/^\d+\.\s*/, '')}</li>`;
        if (l.startsWith('**') && l.endsWith('**')) return `<p style="color:#57f7ff;font-weight:bold;margin:12px 0;">${l.replace(/\*\*/g, '')}</p>`;
        return `<p style="color:#f0f0f0;margin:10px 0;line-height:1.7;">${l}</p>`;
      })
      .join('\n');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Your Differentiation Profile</title>
</head>
<body style="margin:0;padding:0;background:#060618;font-family:'Courier New',monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#060618;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#0d0d3b;border:3px solid #57f7ff;box-shadow:0 0 30px rgba(87,247,255,0.15);">
          <!-- Rainbow bar -->
          <tr>
            <td height="5" style="background:linear-gradient(90deg,#ff0000,#ff8800,#ffff00,#00ff00,#00ffff,#0088ff,#8800ff,#ff0088);font-size:0;">&nbsp;</td>
          </tr>
          <!-- Header -->
          <tr>
            <td style="padding:40px 40px 24px;text-align:center;border-bottom:1px solid #1a1a4a;">
              <p style="color:#8888aa;font-size:10px;letter-spacing:4px;margin:0 0 12px;">DIFFERENTIATION QUEST</p>
              <h1 style="color:#ffdd57;font-size:28px;margin:0 0 12px;text-shadow:0 0 20px rgba(255,221,87,0.4);">YOUR SCROLL IS READY</h1>
              <p style="color:#57f7ff;font-size:12px;margin:0;letter-spacing:2px;">✦ QUEST COMPLETE ✦</p>
            </td>
          </tr>
          <!-- Oracle message -->
          <tr>
            <td style="padding:28px 40px;border-bottom:1px solid #1a1a4a;">
              <p style="color:#8888aa;font-size:10px;letter-spacing:2px;margin:0 0 8px;">✦ THE ORACLE ✦</p>
              <p style="color:#f0f0f0;font-size:13px;line-height:1.9;margin:0;">
                Greetings, <strong style="color:#57f7ff;">${name}</strong>.<br/><br/>
                You have completed the Differentiation Quest. What follows is your Differentiation Profile — the truth of what makes you different, written in plain language, ready to be used.
              </p>
            </td>
          </tr>
          <!-- Profile -->
          <tr>
            <td style="padding:32px 40px;">
              <div style="background:#06061e;border:2px solid #8b6914;padding:28px;margin-bottom:20px;">
                <p style="color:#ffdd57;font-size:10px;letter-spacing:3px;margin:0 0 20px;">YOUR DIFFERENTIATION PROFILE</p>
                ${profileHtml}
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 40px;text-align:center;border-top:1px solid #1a1a4a;">
              <p style="color:#2a2a5a;font-size:10px;margin:0 0 8px;">marketingdoesntwork.com</p>
              <p style="color:#1a1a3a;font-size:9px;margin:0;">The world doesn't need another version of what every other business is doing. It needs you.</p>
            </td>
          </tr>
          <!-- Rainbow bar bottom -->
          <tr>
            <td height="5" style="background:linear-gradient(90deg,#ff0088,#8800ff,#0088ff,#00ffff,#00ff00,#ffff00,#ff8800,#ff0000);font-size:0;">&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const { data, error } = await resend.emails.send({
      from: 'Kyle <kyle@kylewrites.com>',
      to: [email],
      subject: `${name}, your Differentiation Scroll is ready ✦`,
      html,
      text: `Your Differentiation Profile\n\n${profile}`,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ success: true, id: data?.id });
  } catch (err) {
    console.error('Email error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API server running on port ${PORT}`));
