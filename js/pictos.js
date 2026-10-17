// Pictogramas em SVG: aparelho + posição do corpo.
// Servem para bater o olho e reconhecer o exercício enquanto não temos
// ilustrações/vídeos próprios da Jessica (que podem ser anexados a cada exercício).

const APP = {
  mat:       { s: 54, draw: () => `<rect x="8" y="55" width="104" height="4" rx="2" class="pa"/>` },
  acessorio: { s: 54, draw: () => `<rect x="8" y="55" width="104" height="4" rx="2" class="pa"/><circle cx="100" cy="47" r="7" class="pa"/>` },
  reformer:  { s: 48, draw: () => `
      <rect x="6" y="52" width="108" height="6" rx="3" class="pa"/>
      <rect x="30" y="48" width="46" height="4" rx="1.5" class="pa"/>
      <path d="M100 52 V36 M96 36 H104" class="pa"/>
      <path d="M12 58 V64 M108 58 V64" class="pa"/>` },
  cadillac:  { s: 50, draw: () => `
      <rect x="6" y="51" width="108" height="6" rx="2" class="pa"/>
      <path d="M10 51 V8 H110 V51 M10 57 V64 M110 57 V64" class="pa"/>
      <path d="M100 8 V24" class="pa"/>` },
  chair:     { s: 30, draw: () => `
      <rect x="44" y="31" width="34" height="28" rx="2" class="pa"/>
      <path d="M44 54 L26 48" class="pa"/>` },
  barrel:    { s: 38, draw: () => `
      <path d="M26 60 Q54 22 82 60 Z" class="pa"/>
      <path d="M96 20 V60 M108 20 V60 M96 30 H108 M96 40 H108 M96 50 H108" class="pa"/>` },
};

// Figuras desenhadas a partir da superfície "s" do aparelho.
const POSE = {
  supino: s => `
    <circle cx="26" cy="${s - 5}" r="4.5"/>
    <path d="M31 ${s - 4} H60 L66 ${s - 18} H82"/>
    <path d="M38 ${s - 5} L50 ${s - 11}"/>`,
  prono: s => `
    <circle cx="28" cy="${s - 13}" r="4.5"/>
    <path d="M32 ${s - 10} L62 ${s - 3} H94"/>
    <path d="M36 ${s - 8} L34 ${s - 1}"/>`,
  lateral: s => `
    <circle cx="26" cy="${s - 14}" r="4.5"/>
    <path d="M29 ${s - 9} L60 ${s - 4} H92"/>
    <path d="M60 ${s - 5} L88 ${s - 16}"/>
    <path d="M30 ${s - 9} L30 ${s - 1}"/>`,
  sentado: s => `
    <circle cx="44" cy="${s - 31}" r="4.5"/>
    <path d="M44 ${s - 26} L46 ${s - 2} H84"/>
    <path d="M45 ${s - 21} L64 ${s - 17}"/>`,
  ajoelhado: s => `
    <circle cx="56" cy="${s - 38}" r="4.5"/>
    <path d="M56 ${s - 33} V${s - 15} L56 ${s - 1} H74"/>
    <path d="M56 ${s - 29} L70 ${s - 23}"/>`,
  empe: s => `
    <circle cx="58" cy="${s - 46}" r="4.5"/>
    <path d="M58 ${s - 41} V${s - 20} M58 ${s - 20} L54 ${s} M58 ${s - 20} L63 ${s}"/>
    <path d="M58 ${s - 37} L68 ${s - 28}"/>`,
  quadrupede: s => `
    <circle cx="32" cy="${s - 26}" r="4.5"/>
    <path d="M37 ${s - 23} H70 M40 ${s - 23} V${s} M70 ${s - 23} V${s} H84"/>`,
  invertido: s => `
    <circle cx="28" cy="${s - 5}" r="4.5"/>
    <path d="M33 ${s - 4} L54 ${s - 26} L32 ${s - 34}"/>
    <path d="M38 ${s - 5} L56 ${s - 4}"/>`,
};

export function picto(ex, cls = '') {
  const ap = APP[ex.ap] || APP.mat;
  let s = ap.s;
  // Na chair, quem está em pé ou deitado fica no chão ao lado.
  if (ex.ap === 'chair' && !['sentado', 'ajoelhado'].includes(ex.pos)) s = 58;
  if (ex.ap === 'barrel' && ['empe', 'quadrupede'].includes(ex.pos)) s = 58;
  const pose = (POSE[ex.pos] || POSE.supino)(s);
  const shift = ex.ap === 'chair' && ['sentado', 'ajoelhado'].includes(ex.pos) ? 'translate(12 0)' : '';
  return `<svg class="picto ${cls}" viewBox="0 0 120 68" aria-hidden="true">
    ${ap.draw()}
    <g class="pf" transform="${shift}">${pose}</g>
  </svg>`;
}
