// Email copy of src/lib/profileFormat.ts: profile text -> styled HTML.

const FONT = "'Cabin','Helvetica Neue',Arial,sans-serif";

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function inline(text) {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part) =>
      part.startsWith('**') && part.endsWith('**') && part.length > 4
        ? `<strong style="color:#ffffff;font-weight:700;">${esc(part.slice(2, -2))}</strong>`
        : esc(part.replace(/\*\*/g, '').replace(/(^|\s)\*(\S[^*]*\S|\S)\*(?=\s|$|[.,;:!?])/g, '$1$2')),
    )
    .join('');
}

export function profileToHtml(profile) {
  return profile
    .split('\n')
    .map((raw) => {
      const l = raw.trim();
      if (!l || /^[-*_]{3,}$/.test(l)) return '';
      if (/^#{2,}\s*/.test(l))
        return `<h2 style="font-family:${FONT};color:#ffdd57;font-size:19px;font-weight:700;margin:26px 0 8px;line-height:1.3;">${esc(l.replace(/^#+\s*/, '').replace(/\*\*/g, ''))}</h2>`;
      if (/^#\s*/.test(l))
        return `<h1 style="font-family:${FONT};color:#ffdd57;font-size:23px;font-weight:700;margin:28px 0 12px;line-height:1.3;">${esc(l.replace(/^#\s*/, '').replace(/\*\*/g, ''))}</h1>`;
      if (/^[-•*]\s+/.test(l))
        return `<p style="font-family:${FONT};color:#f0f0f0;font-size:16px;line-height:1.65;margin:6px 0 6px 4px;padding-left:18px;text-indent:-18px;"><span style="color:#57f7ff;">&#9670;&nbsp;&nbsp;</span>${inline(l.replace(/^[-•*]\s+/, ''))}</p>`;
      if (/^\d+[.)]\s+/.test(l)) {
        const n = l.match(/^(\d+)/)[1];
        return `<p style="font-family:${FONT};color:#f0f0f0;font-size:16px;line-height:1.65;margin:6px 0 6px 4px;padding-left:22px;text-indent:-22px;"><span style="color:#57f7ff;font-weight:700;">${n}.&nbsp;&nbsp;</span>${inline(l.replace(/^\d+[.)]\s+/, ''))}</p>`;
      }
      if (/^\*\*[^*]+\*\*:?$/.test(l))
        return `<p style="font-family:${FONT};color:#57f7ff;font-size:17px;font-weight:700;margin:16px 0 6px;">${esc(l.replace(/\*\*/g, ''))}</p>`;
      return `<p style="font-family:${FONT};color:#f0f0f0;font-size:16px;margin:10px 0;line-height:1.7;">${inline(l)}</p>`;
    })
    .join('\n');
}
