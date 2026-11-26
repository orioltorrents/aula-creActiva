// Icones SVG de les peces de les analogies (nivell Fàcil). Totes fan servir una graella de 48 × 48.

const svg = (inner) => `<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">${inner}</svg>`;

const BREAD = `<path d="M9 21c-3-1-4-5-1-8 3-4 10-6 16-6s13 2 16 6c3 3 2 7-1 8v17a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3z" fill="#e7b46a" stroke="#a8692a" stroke-width="2.5"/>
  <path d="M14 21v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V21" fill="#fbe7c2"/>`;
const WHEEL = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#1f2937" stroke-width="${r > 8 ? 3.5 : 3}"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.22}" fill="#64748b"/>
  <path d="M${cx - r * 0.7} ${cy}h${r * 1.4}M${cx} ${cy - r * 0.7}v${r * 1.4}" stroke="#94a3b8" stroke-width="1.5"/>`;
const FRAME = `<path d="M14 32l8-14h12l-6 14zM22 18l-2-5h-4M34 18l2-6h4" fill="none" stroke="#2563eb" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/>`;
const CAR_BODY = `<path d="M5 30v-6l6-2 6-8h14l7 8 5 2v6z" fill="#ef4444" stroke="#991b1b" stroke-width="2" stroke-linejoin="round"/>
  <path d="M19 16h5v6h-9zM27 16h4l5 6h-9z" fill="#bfdbfe"/>`;
const FLOWER = (cx, cy, s = 1, petal = "#f472b6") => `<g transform="translate(${cx} ${cy}) scale(${s})">
  ${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-7" rx="4.6" ry="7" fill="${petal}" transform="rotate(${a})"/>`).join("")}
  <circle r="4" fill="#facc15"/></g>`;
const LEG = (x) => `<rect x="${x}" y="22" width="5" height="20" rx="1.5" fill="#92400e"/>`;

export const ICONS = {
  pa: svg(BREAD),
  formatge: svg(`<path d="M5 34l30-20 8 6v18H5z" fill="#fcd34d" stroke="#b45309" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M35 14L5 34h38" fill="none" stroke="#b45309" stroke-width="2"/>
    <circle cx="20" cy="31" r="2.4" fill="#f59e0b"/><circle cx="33" cy="33" r="3" fill="#f59e0b"/><circle cx="29" cy="25" r="1.8" fill="#f59e0b"/>`),
  pernil: svg(`<ellipse cx="24" cy="25" rx="19" ry="14" fill="#f9a8b8" stroke="#be185d" stroke-width="2.5"/>
    <path d="M10 22c8 4 20 4 28-2" fill="none" stroke="#fff1f2" stroke-width="3" stroke-linecap="round"/>
    <path d="M14 31c6 2 14 2 20-1" fill="none" stroke="#fda4af" stroke-width="2" stroke-linecap="round"/>`),
  tomaquet: svg(`<circle cx="24" cy="27" r="16" fill="#ef4444" stroke="#991b1b" stroke-width="2"/>
    <path d="M24 12l-3-5M24 12l7-3M24 12l-8 1M24 12l6 4M24 12l-5 5" stroke="#16a34a" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="17" cy="21" rx="3" ry="5" fill="#fecaca" opacity="0.7"/>`),
  entrepa: svg(`<path d="M5 18c0-6 8-10 19-10s19 4 19 10z" fill="#e7b46a" stroke="#a8692a" stroke-width="2.5"/>
    <rect x="5" y="20" width="38" height="6" rx="2" fill="#fcd34d" stroke="#b45309" stroke-width="2"/>
    <path d="M5 29h38v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" fill="#e7b46a" stroke="#a8692a" stroke-width="2.5"/>`),
  mixt: svg(`<path d="M5 15c0-5 8-9 19-9s19 4 19 9z" fill="#e7b46a" stroke="#a8692a" stroke-width="2.5"/>
    <rect x="5" y="17" width="38" height="5" rx="2" fill="#fcd34d" stroke="#b45309" stroke-width="2"/>
    <rect x="5" y="24" width="38" height="5" rx="2" fill="#f9a8b8" stroke="#be185d" stroke-width="2"/>
    <path d="M5 31h38v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" fill="#e7b46a" stroke="#a8692a" stroke-width="2.5"/>`),
  patomaquet: svg(`${BREAD}<path d="M14 23c4-2 16-2 20 0v11c-4 2-16 2-20 0z" fill="#ef4444" opacity="0.85"/>
    <circle cx="19" cy="27" r="1.4" fill="#fde68a"/><circle cx="28" cy="30" r="1.4" fill="#fde68a"/>`),
  roda: svg(WHEEL(24, 24, 17)),
  quadre: svg(`<g transform="translate(0 4)">${FRAME}</g>`),
  bicicleta: svg(`${WHEEL(12, 33, 9)}${WHEEL(36, 33, 9)}<g transform="translate(-2 1)">${FRAME}</g>`),
  tricicle: svg(`${WHEEL(11, 34, 6.5)}${WHEEL(37, 32, 10)}${WHEEL(20, 36, 5)}<path d="M11 34l11-15h10l5 13M22 19l-2-5h-4M32 19l2-7h4" fill="none" stroke="#7c3aed" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`),
  carrosseria: svg(`<g transform="translate(0 4)">${CAR_BODY}</g>`),
  cotxe: svg(`${CAR_BODY}${WHEEL(14, 33, 6)}${WHEEL(35, 33, 6)}`),
  pota: svg(`<rect x="20" y="5" width="8" height="38" rx="2" fill="#b45309" stroke="#78350f" stroke-width="2"/>`),
  tauler: svg(`<rect x="3" y="18" width="42" height="11" rx="2.5" fill="#d97706" stroke="#78350f" stroke-width="2"/>
    <path d="M8 23h12M26 25h14" stroke="#92400e" stroke-width="1.5" stroke-linecap="round"/>`),
  taula: svg(`<rect x="3" y="14" width="42" height="8" rx="2" fill="#d97706" stroke="#78350f" stroke-width="2"/>${LEG(7)}${LEG(36)}${LEG(15)}${LEG(28)}`),
  flor: svg(`<path d="M24 26v18" stroke="#16a34a" stroke-width="3"/><path d="M24 36c-6-1-9-5-9-8 5 0 8 3 9 8z" fill="#22c55e"/>${FLOWER(24, 18, 1.15)}`),
  cinta: svg(`<path d="M24 24l-14-9v18zM24 24l14-9v18z" fill="#a855f7" stroke="#6b21a8" stroke-width="2" stroke-linejoin="round"/>
    <path d="M24 24l-6 17M24 24l6 17" stroke="#a855f7" stroke-width="4" stroke-linecap="round"/><circle cx="24" cy="24" r="4" fill="#7e22ce"/>`),
  ram: svg(`<path d="M24 26l-8 18M24 26v18M24 26l8 18" stroke="#16a34a" stroke-width="2.5"/>${FLOWER(15, 15, 0.8)}${FLOWER(33, 15, 0.8, "#fb923c")}${FLOWER(24, 22, 0.85, "#f43f5e")}
    <path d="M24 35l-7-4v8zM24 35l7-4v8z" fill="#a855f7"/>`),
  perla: svg(`<circle cx="24" cy="24" r="14" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2"/><circle cx="19" cy="19" r="4.5" fill="#fff"/>`),
  fil: svg(`<path d="M6 30c6-14 12 6 18-6s12 6 18-6" fill="none" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round"/>`),
  polsera: svg(`${Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2;
    return `<circle cx="${(24 + Math.cos(a) * 15).toFixed(1)}" cy="${(24 + Math.sin(a) * 15).toFixed(1)}" r="4.3" fill="#f1f5f9" stroke="#64748b" stroke-width="1.5"/>`;
  }).join("")}`),
};
