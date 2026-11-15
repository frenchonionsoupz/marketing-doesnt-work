export default function handler(_req, res) {
  res.status(200).json({
    ok: true,
    claudeKey: Boolean(process.env.CLAUDE_API_KEY),
    resendKey: Boolean(process.env.RESEND_API_KEY),
  });
}
