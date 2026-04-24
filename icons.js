// ============================================================
// ICON SYSTEM — Quest Board
// SVG-based icons that render perfectly on all platforms
// Each icon: { id, label, svg (path d= only, viewBox 0 0 24 24) }
// ============================================================

const ICONS = {
  // ---- TASK ICONS ----
  bed:      { label: 'Bed',        svg: '<path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M2 10V8a2 2 0 0 1 2-2h2"/><path d="M20 10V8a2 2 0 0 1-2-2h-2"/><path d="M2 20h20"/><rect x="6" y="6" width="12" height="4" rx="1"/>' },
  book:     { label: 'Reading',    svg: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>' },
  pencil:   { label: 'Homework',   svg: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>' },
  backpack: { label: 'School bag', svg: '<path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>' },
  broom:    { label: 'Tidy room',  svg: '<path d="m9 3 3 3-7 8H2v-3Z"/><path d="m12 6 4 4-1 1-4-4Z"/><path d="M5 14H2v3l8 4 6-3-5-5"/><path d="m17 7-3-3 3-1 1 3-1 1Z"/>' },
  star:     { label: 'Star',       svg: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>' },
  target:   { label: 'Goal',       svg: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>' },
  apple:    { label: 'Healthy eat',svg: '<path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/>' },
  run:      { label: 'Exercise',   svg: '<circle cx="13" cy="4" r="1"/><path d="m7 21 3-3 3 3"/><path d="m14 8-3 2-2 4 3 3"/><path d="M7.5 11.5 10 14l2-2 3.5 2.5"/><path d="m16 7-2.5 1.5"/>' },
  shower:   { label: 'Shower',     svg: '<path d="m4 4 2.5 2.5"/><path d="M13.5 6.5a4.95 4.95 0 0 0-7 7"/><path d="M15 5 5 15"/><path d="m14 17-3 3-3-3"/><path d="M10 14v7"/>' },
  tooth:    { label: 'Brush teeth',svg: '<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/><path d="M12 8v8"/><path d="M8 12h8"/>' },
  music:    { label: 'Music',      svg: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>' },
  utensils: { label: 'Help cook',  svg: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>' },
  heart:    { label: 'Kind act',   svg: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>' },
  paw:      { label: 'Pet care',   svg: '<circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10C7.5 9 5 9 4 11s1 5 3 6 5 0 6-2 0-5-4-5z"/><circle cx="4" cy="14" r="2"/>' },
  plant:    { label: 'Gardening',  svg: '<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 1 1.5 7.9c-1.6-1-2.9-2.1-3.1-3.6-.3-1.4.4-3 1.6-4.3z"/>' },
  laundry:  { label: 'Laundry',    svg: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><circle cx="12" cy="13" r="4"/><path d="M9 13a3 3 0 0 1 3-3"/>' },
  gamepad:  { label: 'Games',      svg: '<line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="2"/>' },
  // ---- REWARD ICONS ----
  pizza:    { label: 'Pizza',      svg: '<path d="M12 2a10 10 0 0 1 10 10"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10"/><path d="m12 22-2-5-5-2 14-7Z"/><circle cx="12" cy="12" r="2"/>' },
  film:     { label: 'Movie',      svg: '<rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>' },
  phone:    { label: 'Screen time',svg: '<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>' },
  trophy:   { label: 'Trophy',     svg: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>' },
  icecream: { label: 'Ice cream',  svg: '<path d="m7 11 4.08 10.35a1 1 0 0 0 1.84 0L17 11"/><path d="M17 7A5 5 0 0 0 7 7"/><path d="M11 3a3 3 0 0 0 0 6h2a3 3 0 0 0 0-6"/>' },
  palette:  { label: 'Art/craft',  svg: '<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>' },
  soccer:   { label: 'Sport',      svg: '<circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/><circle cx="12" cy="12" r="4.5"/>' },
  dice:     { label: 'Board game', svg: '<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 8h.01"/><path d="M12 12h.01"/><path d="M8 16h.01"/><path d="M8 8h.01"/><path d="M16 16h.01"/>' },
  gift:     { label: 'Surprise',   svg: '<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>' },
  gem:      { label: 'Gem',        svg: '<polygon points="6 3 18 3 22 9 12 22 2 9"/><polyline points="22 9 12 9 6 3"/><line x1="12" y1="22" x2="12" y2="9"/><line x1="2" y1="9" x2="22" y2="9"/>' },
  beach:    { label: 'Beach/park', svg: '<path d="M17.5 8a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z"/><path d="M6 12c0-4 2.5-7 6-8.5"/><path d="m2 20 14.5-8.5"/><path d="M22 20H2"/><path d="M6 20v-8"/>' },
  bike:     { label: 'Bike ride',  svg: '<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>' },
  music2:   { label: 'Concert',    svg: '<path d="m9 18 6-6-6-6"/><path d="m15 18 6-6-6-6"/>' },
  camping:  { label: 'Camping',    svg: '<path d="M3 17h18"/><path d="m12 3-8.5 14h17Z"/><path d="M12 8v5"/>' },
};

// Categorised lists for the picker
const TASK_ICON_IDS   = ['bed','book','pencil','backpack','broom','star','target','apple','run','shower','tooth','music','utensils','heart','paw','plant','laundry','gamepad'];
const REWARD_ICON_IDS = ['pizza','film','phone','trophy','icecream','palette','soccer','dice','gift','gem','beach','bike','music2','camping','star','heart','gamepad','target'];

// Render an inline SVG icon by id
function iconSvg(id, size = 22, color = 'currentColor') {
  const icon = ICONS[id];
  if (!icon) return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icon.svg}</svg>`;
}

// Larger icon for reward cards etc
function iconSvgLg(id, color) { return iconSvg(id, 32, color || 'currentColor'); }
