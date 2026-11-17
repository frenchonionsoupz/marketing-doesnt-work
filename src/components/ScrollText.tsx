import { parseProfile, SCROLL_COLORS as C, SCROLL_FONT, type Run } from '../lib/profileFormat';

// The Differentiation Profile, rendered in Cabin to match the email and PDF
function Runs({ runs, plain }: { runs: Run[]; plain?: boolean }) {
  if (plain) return <>{runs.map(r => r.text).join('')}</>;
  return (
    <>
      {runs.map((r, i) =>
        r.bold ? <strong key={i} style={{ color: '#ffffff', fontWeight: 700 }}>{r.text}</strong> : <span key={i}>{r.text}</span>,
      )}
    </>
  );
}

export function ScrollText({ profile }: { profile: string }) {
  const base = { fontFamily: SCROLL_FONT, color: C.text, fontSize: '17px', lineHeight: 1.7, margin: '10px 0' };
  return (
    <div style={{ fontFamily: SCROLL_FONT }}>
      {parseProfile(profile).map((b, i) => {
        switch (b.type) {
          case 'h1':
            return <h3 key={i} style={{ ...base, color: C.gold, fontSize: '23px', fontWeight: 700, lineHeight: 1.3, margin: '28px 0 10px' }}><Runs runs={b.runs} plain /></h3>;
          case 'h2':
            return <h4 key={i} style={{ ...base, color: C.gold, fontSize: '19px', fontWeight: 700, lineHeight: 1.3, margin: '24px 0 8px' }}><Runs runs={b.runs} plain /></h4>;
          case 'callout':
            return <p key={i} style={{ ...base, color: C.cyan, fontWeight: 700, fontSize: '18px', margin: '16px 0 6px' }}><Runs runs={b.runs} plain /></p>;
          case 'li':
            return (
              <p key={i} style={{ ...base, margin: '6px 0', paddingLeft: '22px', position: 'relative' }}>
                {b.num
                  ? <span style={{ position: 'absolute', left: 0, color: C.cyan, fontWeight: 700 }}>{b.num}.</span>
                  : <span style={{ position: 'absolute', left: '2px', color: C.cyan, fontSize: '12px', top: '3px' }}>◆</span>}
                <Runs runs={b.runs} />
              </p>
            );
          default:
            return <p key={i} style={base}><Runs runs={b.runs} /></p>;
        }
      })}
    </div>
  );
}
