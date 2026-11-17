// Turns the AI's markdown-ish profile text into simple blocks so the
// on-page scroll and the PDF render it the same way the email does.
// (server/profileFormat.js is the email's copy of this logic.)

export interface Run { text: string; bold: boolean }
export type BlockType = 'h1' | 'h2' | 'li' | 'callout' | 'p';
export interface Block { type: BlockType; runs: Run[]; num?: string }

// Split "plain **bold** plain" into runs
export function parseInline(text: string): Run[] {
  const runs: Run[] = [];
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      runs.push({ text: part.slice(2, -2), bold: true });
    } else {
      runs.push({ text: part.replace(/\*\*/g, '').replace(/(^|\s)\*(\S[^*]*\S|\S)\*(?=\s|$|[.,;:!?])/g, '$1$2'), bold: false });
    }
  }
  return runs;
}

export function parseProfile(profile: string): Block[] {
  const blocks: Block[] = [];
  for (const raw of profile.split('\n')) {
    const l = raw.trim();
    if (!l || /^[-*_]{3,}$/.test(l)) continue; // blank lines + horizontal rules
    if (/^#{2,}\s*/.test(l)) {
      blocks.push({ type: 'h2', runs: [{ text: l.replace(/^#+\s*/, '').replace(/\*\*/g, ''), bold: true }] });
    } else if (/^#\s*/.test(l)) {
      blocks.push({ type: 'h1', runs: [{ text: l.replace(/^#\s*/, '').replace(/\*\*/g, ''), bold: true }] });
    } else if (/^[-•*]\s+/.test(l)) {
      blocks.push({ type: 'li', runs: parseInline(l.replace(/^[-•*]\s+/, '')) });
    } else if (/^\d+[.)]\s+/.test(l)) {
      blocks.push({ type: 'li', num: l.match(/^(\d+)/)![1], runs: parseInline(l.replace(/^\d+[.)]\s+/, '')) });
    } else if (/^\*\*[^*]+\*\*:?$/.test(l)) {
      blocks.push({ type: 'callout', runs: [{ text: l.replace(/\*\*/g, ''), bold: true }] });
    } else {
      blocks.push({ type: 'p', runs: parseInline(l) });
    }
  }
  return blocks;
}

// Shared look, matching the email
export const SCROLL_COLORS = {
  pageBg: '#060618',
  cardBg: '#0d0d3b',
  innerBg: '#06061e',
  cyan: '#57f7ff',
  gold: '#ffdd57',
  goldDark: '#8b6914',
  text: '#f0f0f0',
  muted: '#8888aa',
  rule: '#1a1a4a',
};
export const RAINBOW = ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#00ffff', '#0088ff', '#8800ff', '#ff0088'];
export const SCROLL_FONT = "'Cabin', 'Helvetica Neue', Arial, sans-serif";
