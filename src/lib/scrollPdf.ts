import { parseProfile, RAINBOW, SCROLL_COLORS as C, type Run } from './profileFormat';

// Builds the Differentiation Scroll as a PDF styled like the email.
// Body text is Cabin (bundled in public/fonts so it embeds in the PDF).

const toBase64 = (buf: ArrayBuffer) => {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin);
};

// Drop characters Cabin can't draw (emoji etc.) and normalise a few symbols
const clean = (s: string) =>
  s
    .replace(/[•●◆✦✧]/g, '-')
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/\u{FE0F}|\u{200D}/gu, '')
    .replace(/[ \t]+/g, ' ');

export async function downloadScrollPdf(profile: string, name: string) {
  const [{ jsPDF }, regular, bold] = await Promise.all([
    import('jspdf'),
    fetch('/fonts/Cabin-Regular.ttf').then(r => r.arrayBuffer()),
    fetch('/fonts/Cabin-Bold.ttf').then(r => r.arrayBuffer()),
  ]);

  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  doc.addFileToVFS('Cabin-Regular.ttf', toBase64(regular));
  doc.addFont('Cabin-Regular.ttf', 'Cabin', 'normal');
  doc.addFileToVFS('Cabin-Bold.ttf', toBase64(bold));
  doc.addFont('Cabin-Bold.ttf', 'Cabin', 'bold');

  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 32;            // page margin to card
  const PAD = 34;          // card padding
  const left = M + PAD;
  const right = W - M - PAD;
  const width = right - left;
  const bottom = H - M - 54;

  const drawPage = () => {
    doc.setFillColor(C.pageBg);
    doc.rect(0, 0, W, H, 'F');
    doc.setFillColor(C.cardBg);
    doc.setDrawColor(C.cyan);
    doc.setLineWidth(2.5);
    doc.rect(M, M, W - 2 * M, H - 2 * M, 'FD');
    // rainbow bars top + bottom
    const seg = (W - 2 * M) / RAINBOW.length;
    RAINBOW.forEach((col, i) => {
      doc.setFillColor(col);
      doc.rect(M + i * seg, M, seg + 0.5, 5, 'F');
      doc.setFillColor(RAINBOW[RAINBOW.length - 1 - i]);
      doc.rect(M + i * seg, H - M - 5, seg + 0.5, 5, 'F');
    });
    // footer
    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.setTextColor('#3a3a6a');
    doc.text('marketingdoesntwork.com', W / 2, H - M - 20, { align: 'center' });
  };

  drawPage();
  let y = M + 52;

  const newPageIfNeeded = (needed: number) => {
    if (y + needed > bottom) {
      doc.addPage();
      drawPage();
      y = M + 44;
    }
  };

  // ── Header (same as the email) ──
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(C.muted);
  doc.setCharSpace(3);
  doc.text('DIFFERENTIATION QUEST', W / 2, y, { align: 'center' });
  doc.setCharSpace(0);
  y += 30;
  doc.setFont('courier', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(C.gold);
  doc.text('YOUR DIFFERENTIATION SCROLL', W / 2, y, { align: 'center' });
  y += 22;
  doc.setFont('courier', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(C.cyan);
  doc.setCharSpace(1.5);
  doc.text('-  QUEST COMPLETE  -', W / 2, y, { align: 'center' });
  doc.setCharSpace(0);
  y += 22;
  doc.setDrawColor(C.rule);
  doc.setLineWidth(1);
  doc.line(left, y, right, y);
  y += 28;

  // Oracle greeting
  doc.setFont('Cabin', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(C.text);
  const greeting = doc.splitTextToSize(
    clean(`Greetings, ${name}. You have completed the Differentiation Quest. What follows is your Differentiation Profile: the truth of what makes you different, written in plain language, ready to be used.`),
    width,
  );
  doc.text(greeting, left, y, { lineHeightFactor: 1.6 });
  y += greeting.length * 12 * 1.6 + 14;
  doc.line(left, y, right, y);
  y += 30;

  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(C.gold);
  doc.setCharSpace(2.5);
  doc.text('YOUR DIFFERENTIATION PROFILE', left, y);
  doc.setCharSpace(0);
  y += 24;

  // Word-wrap a line of mixed regular/bold runs
  const writeRuns = (runs: Run[], x0: number, maxW: number, size: number, color: string, boldColor: string, lh: number) => {
    doc.setFontSize(size);
    const words: { text: string; bold: boolean }[] = [];
    runs.forEach(r => clean(r.text).split(/(\s+)/).forEach(w => w && words.push({ text: w, bold: r.bold })));
    let x = x0;
    let first = true;
    for (const w of words) {
      doc.setFont('Cabin', w.bold ? 'bold' : 'normal');
      const isSpace = /^\s+$/.test(w.text);
      const ww = doc.getTextWidth(isSpace ? ' ' : w.text);
      if (isSpace) { if (!first) x += ww; continue; }
      if (x + ww > x0 + maxW && !first) {
        y += size * lh;
        newPageIfNeeded(size * lh);
        x = x0;
      }
      doc.setTextColor(w.bold ? boldColor : color);
      doc.text(w.text, x, y);
      x += ww;
      first = false;
    }
    y += size * lh;
  };

  for (const block of parseProfile(profile)) {
    switch (block.type) {
      case 'h1':
      case 'h2': {
        const size = block.type === 'h1' ? 19 : 16;
        y += 12;
        newPageIfNeeded(size * 3);
        doc.setFont('Cabin', 'bold');
        doc.setFontSize(size);
        doc.setTextColor(C.gold);
        const lines = doc.splitTextToSize(clean(block.runs[0].text), width);
        lines.forEach((ln: string) => { doc.text(ln, left, y); y += size * 1.3; });
        y += 4;
        break;
      }
      case 'callout':
        y += 8;
        newPageIfNeeded(40);
        writeRuns(block.runs, left, width, 13.5, C.cyan, C.cyan, 1.5);
        y += 2;
        break;
      case 'li':
        newPageIfNeeded(20);
        if (block.num) {
          doc.setFont('Cabin', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(C.cyan);
          doc.text(`${block.num}.`, left, y);
        } else {
          doc.setFillColor(C.cyan);
          // little diamond bullet
          doc.lines([[3, 3], [-3, 3], [-3, -3], [3, -3]], left + 4, y - 7.5, [1, 1], 'F', true);
        }
        writeRuns(block.runs, left + 18, width - 18, 12, C.text, '#ffffff', 1.6);
        y += 4;
        break;
      default:
        newPageIfNeeded(20);
        writeRuns(block.runs, left, width, 12, C.text, '#ffffff', 1.65);
        y += 8;
    }
  }

  // Closing line
  y += 16;
  newPageIfNeeded(40);
  doc.setDrawColor(C.rule);
  doc.line(left, y, right, y);
  y += 24;
  doc.setFont('Cabin', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(C.muted);
  doc.text("The world doesn't need another version of what every other business is doing. It needs you.", W / 2, y, { align: 'center', maxWidth: width });

  doc.save('differentiation-scroll.pdf');
}
