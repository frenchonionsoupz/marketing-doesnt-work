import Anthropic from '@anthropic-ai/sdk';
import { Resend } from 'resend';
import { profileToHtml } from './profileFormat.js';

// Shared by the local Express server (server/index.js) and the
// Vercel serverless functions (api/*.js).
// Accept whichever name the key was saved under in Vercel
export const CLAUDE_KEY_NAMES = [
  'CLAUDE_API_KEY', 'ANTHROPIC_API_KEY', 'VITE_CLAUDE_API_KEY',
  'VITE_ANTHROPIC_API_KEY', 'CLAUDE_KEY', 'ANTHROPIC_KEY',
];
export const findClaudeKey = () => {
  for (const name of CLAUDE_KEY_NAMES) {
    const v = process.env[name]?.trim();
    if (v) return v;
  }
  return null;
};
const getAnthropic = () => {
  const apiKey = findClaudeKey();
  if (!apiKey) {
    throw new Error('No Claude API key found. In Vercel > Settings > Environment Variables add CLAUDE_API_KEY (tick Production), then Redeploy.');
  }
  return new Anthropic({ apiKey });
};
const getResend = () => {
  if (!process.env.RESEND_API_KEY?.trim()) throw new Error('RESEND_API_KEY is not set on the server');
  return new Resend(process.env.RESEND_API_KEY.trim());
};

// ──────────────────────────────────────────────
// POST /api/generate-profile
// Body: { answers: Array<{ question: string, answer: string, level: string }> }
// ──────────────────────────────────────────────
export async function generateProfile(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
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

    const message = await getAnthropic().messages.create({
      model: process.env.CLAUDE_MODEL || 'claude-opus-4-6',
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
}

// ──────────────────────────────────────────────
// POST /api/send-email
// Body: { email: string, name: string, profile: string }
// ──────────────────────────────────────────────
export async function sendEmail(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    const { email, name, profile } = req.body;
    if (!email || !name || !profile) {
      return res.status(400).json({ error: 'email, name, profile required' });
    }

    const profileHtml = profileToHtml(profile);
    const safeName = String(name).replace(/[<>&"]/g, '');

    const html = `<!DOCTYPE html>
<html>
<head>
  <link href="https://fonts.googleapis.com/css2?family=Cabin:wght@400;700&display=swap" rel="stylesheet"/>
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
                Greetings, <strong style="color:#57f7ff;">${safeName}</strong>.<br/><br/>
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

    const { data, error } = await getResend().emails.send({
      from: process.env.EMAIL_FROM || 'Kyle <kyle@kylewrites.com>',
      to: [email],
      subject: `${safeName}, your Differentiation Scroll is ready ✦`,
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
}

