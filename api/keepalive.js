// Called once a day by Vercel Cron (see vercel.json) so the free Supabase
// project sees regular activity and doesn't auto-pause.
export default async function handler(_req, res) {
  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
  const key = (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim();
  if (!url || !key) {
    return res.status(500).json({ ok: false, error: 'Supabase URL/key env vars not set' });
  }
  try {
    // A tiny real database query (RLS means it returns nothing, but it counts as activity)
    const r = await fetch(`${url}/rest/v1/profiles?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    return res.status(r.ok ? 200 : 502).json({ ok: r.ok, supabaseStatus: r.status, at: new Date().toISOString() });
  } catch (err) {
    return res.status(502).json({ ok: false, error: err.message });
  }
}
