import { CLAUDE_KEY_NAMES, findClaudeKey } from '../server/handlers.js';

// Shows whether keys are present (never their values)
export default function handler(_req, res) {
  res.status(200).json({
    ok: true,
    claudeKey: Boolean(findClaudeKey()),
    claudeKeyFoundAs: CLAUDE_KEY_NAMES.filter(n => process.env[n]?.trim()),
    resendKey: Boolean(process.env.RESEND_API_KEY?.trim()),
    environment: process.env.VERCEL_ENV || 'local',
  });
}
