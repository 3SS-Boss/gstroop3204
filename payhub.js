/* ============================================================
  PayHubble
   Accounts and payment handles live in Supabase — real username +
   password sign-in, synced to whatever device you sign in on. No
   money moves through this app; it just shows people how to pay you.

  Design: PayHubble design system (design.md) — one teal ramp sampled
   from the logo, Poppins for display, Inter for body, tabular money.
   ============================================================ */

/* ---------- Supabase: one row per hub, locked down by Row Level Security ----------
   Fill these in from your Supabase project (Settings -> API). The anon key is
   meant to be public in client code like this one — see supabase-schema.sql
   for the policies that keep every hub visible only to its owner. */
var SUPABASE_URL = 'https://eyicpwnlwvrxwpvzmdqc.supabase.co';
var SUPABASE_ANON_KEY = 'sb_publishable_TEtyVSMU-FSMAOviPvXCqw_ACOtV8IR';
var supabase = (typeof window !== 'undefined' && window.supabase && SUPABASE_URL.indexOf('YOUR-PROJECT') === -1)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

/* ============================================================
   Logo motifs and iconography.
   The badge is built from the same thick rounded strokes as the mark,
   at --stroke weight, and its parts get reused as UI icons.
   ============================================================ */
var LOGO_SVG =
  '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">' +
  '<circle cx="24" cy="24" r="21" stroke="currentColor" stroke-width="2"/>' +
  '<circle cx="24" cy="24" r="17" stroke="currentColor" stroke-width="1.1" opacity=".55"/>' +
  '<path d="M24 10.5c4.1 3.5 6.3 8.2 6.3 13.3 0 2.5-.5 4.9-1.5 7.1h-9.6c-1-2.2-1.5-4.6-1.5-7.1 0-5.1 2.2-9.8 6.3-13.3Z" ' +
  'stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>' +
  '<path d="M19.7 27.6 16.2 31v3.3l3.5-1.9M28.3 27.6 31.8 31v3.3l-3.5-1.9" ' +
  'stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>' +
  '<path d="M24 17.6v6.9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
  '<path d="M25.9 19.2c-.5-.6-1.2-.9-2-.9-1.1 0-1.9.6-1.9 1.4 0 2 3.9 1.2 3.9 3.2 0 .9-.9 1.5-2 1.5-.8 0-1.6-.4-2.1-1" ' +
  'stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
  '</svg>';

var SPARK_SVG =
  '<svg viewBox="0 0 120 120" fill="none" aria-hidden="true">' +
  '<path d="M78 14l3.6 10.4L92 28l-10.4 3.6L78 42l-3.6-10.4L64 28l10.4-3.6z" fill="currentColor"/>' +
  '<path d="M40 44l2.4 6.8L49 53l-6.6 2.2L40 62l-2.4-6.8L31 53l6.6-2.2z" fill="currentColor"/>' +
  '<path d="M96 62l1.8 5.2L103 69l-5.2 1.8L96 76l-1.8-5.2L89 69l5.2-1.8z" fill="currentColor"/>' +
  '</svg>';

var SPARKLE_ONE =
  '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
  '<path d="M12 2l2.2 6.3L20.5 10.5l-6.3 2.2L12 19l-2.2-6.3L3.5 10.5l6.3-2.2z" fill="currentColor"/></svg>';

/* Tab icons — 1.5px strokes, same confident weight as the badge. */
function icon(d, extra) {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
}
var ICONS = {
  sell: icon('<rect x="3" y="3" width="7" height="7" rx="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.6"/>' +
    '<rect x="3" y="14" width="7" height="7" rx="1.6"/><path d="M14 14h3v3h-3zM20 14h1M14 20h3M20 17v4"/>'),
  page: icon('<rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M8 8h8M8 12h8M8 16h5"/>'),
  card: icon('<rect x="2.5" y="5" width="19" height="14" rx="3.5"/><path d="M2.5 10h19M6.5 15h4"/>'),
  wallet: icon('<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z"/>' +
    '<path d="M3 8h13M16.5 13.5h1.5"/>'),
  activity: icon('<path d="M3 20h18M6 20v-5.5M11 20V8M16 20v-8.5"/><path d="M6 9.5l5-4 5 3 3-4.5"/>'),
  settings: icon('<path d="M4 7h9M18.5 7H21M4 17h4.5M14 17h7"/><circle cx="15.5" cy="7" r="2.5"/><circle cx="11" cy="17" r="2.5"/>'),
  rocket: icon('<path d="M12 3.5c3.4 2.9 5.2 6.8 5.2 11 0 2-.4 4-1.2 5.9H8c-.8-1.9-1.2-3.9-1.2-5.9 0-4.2 1.8-8.1 5.2-11Z"/>' +
    '<path d="M8.4 17.4 5.5 20.2v2.6M15.6 17.4l2.9 2.8v2.6"/><circle cx="12" cy="10.5" r="2"/>'),
  hub: icon('<circle cx="12" cy="12" r="2.5"/><circle cx="5" cy="6" r="1.8"/><circle cx="19" cy="6" r="1.8"/>' +
    '<circle cx="5" cy="18" r="1.8"/><circle cx="19" cy="18" r="1.8"/>' +
    '<path d="M6.4 7.3 10.2 10.6M17.6 7.3 13.8 10.6M6.4 16.7 10.2 13.4M17.6 16.7 13.8 13.4"/>')
};

/* The Apple logo lives in a private-use codepoint that only Apple devices have a
   font for — everyone else gets a tofu box. Fall back to a plain letter. */
var APPLE_GLYPH = (typeof navigator !== 'undefined' &&
  /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent || '')) ? '' : 'A';

/* ---------- payment method catalog ----------
   Each method keeps its own recognizable brand color — buyers scan for the color
   they know. "fg" is the glyph color that actually reads on that brand color;
   the method name always sits in --ph-text next to it, never white-on-brand. */
var METHODS = [
  {
    k: 'v', id: 'venmo', name: 'Venmo', color: '#008CFF', fg: '#FFFFFF', icon: 'V',
    ph: '@your-venmo', hint: 'Your Venmo username',
    payNote: 'Opens the Venmo app if you have it, otherwise venmo.com.',
    link: function (val, amt, note) {
      var h = val.replace(/^@/, '').trim();
      if (/^https?:/i.test(val)) return val;
      var u = 'https://venmo.com/' + encodeURIComponent(h);
      var q = [];
      if (amt) { q.push('txn=pay'); q.push('amount=' + encodeURIComponent(amt)); }
      if (note) q.push('note=' + encodeURIComponent(note));
      return q.length ? u + '?' + q.join('&') : u;
    }
  },
  {
    k: 'p', id: 'paypal', name: 'PayPal', color: '#003087', fg: '#FFFFFF', icon: 'P',
    ph: 'your-paypal-me-name', hint: 'Your PayPal.Me name',
    payNote: 'Opens PayPal.Me with the amount already filled in.',
    link: function (val, amt) {
      if (/^https?:/i.test(val)) return val;
      var h = val.replace(/^@/, '').trim();
      return 'https://paypal.me/' + encodeURIComponent(h) + (amt ? '/' + encodeURIComponent(amt) : '');
    }
  },
  {
    k: 'c', id: 'cashapp', name: 'Cash App', color: '#00D64F', fg: '#14282E', icon: '$',
    ph: '$yourcashtag', hint: 'Your $Cashtag',
    payNote: 'Opens Cash App with the amount already filled in.',
    link: function (val, amt) {
      if (/^https?:/i.test(val)) return val;
      var h = val.trim().replace(/^\$?/, '');
      return 'https://cash.app/$' + encodeURIComponent(h) + (amt ? '/' + encodeURIComponent(amt) : '');
    }
  },
  { k: 'z', id: 'zelle', name: 'Zelle', color: '#6D1ED4', fg: '#FFFFFF', icon: 'Z', ph: 'phone or email', hint: 'Phone number or email registered with Zelle', link: null },
  { k: 'a', id: 'applecash', name: 'Apple Cash', color: '#14282E', fg: '#FFFFFF', icon: APPLE_GLYPH, ph: 'phone number', hint: 'Phone number for iMessage / Apple Cash', link: null },
  { k: 'g', id: 'googlepay', name: 'Google Pay', color: '#5F6368', fg: '#FFFFFF', icon: 'G', ph: 'phone or email', hint: 'Phone or email on your Google Pay account', link: null },
  { k: 'h', id: 'cash', name: 'Cash', color: '#0F6B51', fg: '#FFFFFF', icon: '¢', ph: 'e.g. Exact change appreciated', hint: 'A short note for people paying in cash', link: null }
];
var M_BY_K = {}; METHODS.forEach(function (m) { M_BY_K[m.k] = m; });

/* ---------- themes for the buyer's page ----------
   The campaign color substitutes for --ph-teal-700 in the header band and the
   primary button only. Type, radii and chips stay fixed, so a buyer still
  recognizes a PayHubble page whoever's colors are on it. */
var THEMES = {
  teal: { name: 'PayHubble teal', primary: '#165564', accent: '#0E3742', tint: '#EAF7F5', line: '#DBDFE2', on: '#FFFFFF' },
  navy: { name: 'Navy', primary: '#1E2A78', accent: '#131C55', tint: '#EEF0F7', line: '#D8DCE8', on: '#FFFFFF' },
  green: { name: 'Forest', primary: '#0F6B51', accent: '#0B4636', tint: '#EAF5F1', line: '#D6E4DE', on: '#FFFFFF' },
  maroon: { name: 'Maroon', primary: '#7A1F2B', accent: '#4A0F18', tint: '#F7EFF0', line: '#E5D8DA', on: '#FFFFFF' },
  purple: { name: 'Purple', primary: '#4C1D95', accent: '#2E1065', tint: '#F2EEFA', line: '#DED6EE', on: '#FFFFFF' },
  ink: { name: 'Ink', primary: '#14282E', accent: '#0B171B', tint: '#EDF1F4', line: '#DBDFE2', on: '#FFFFFF' }
};
var THEME_ORDER = ['teal', 'navy', 'green', 'maroon', 'purple', 'ink'];
function theme(key) { return THEMES[key] || THEMES.teal; }

/* Optional page-builder fields. Each rides in the link only when it is filled in,
   so a plain "pay me" link stays short enough for a cheap NFC tag. */
var PAGE_FIELDS = [
  { k: 'm', id: 'themeKey' },
  { k: 't', id: 'title' },
  { k: 'e', id: 'eyebrow' },
  { k: 'b', id: 'blurb' },
  { k: 'k', id: 'presets' },
  { k: 'w', id: 'aboutTitle' },
  { k: 'o', id: 'about' },
  { k: 'l', id: 'pills' },
  { k: 'y', id: 'badge' },
  { k: 'f', id: 'footer' }
];
var PF_BY_K = {}; PAGE_FIELDS.forEach(function (f) { PF_BY_K[f.k] = f; });

function blankPage() {
  return {
    themeKey: 'teal', title: '', eyebrow: '', blurb: '',
    presets: '', aboutTitle: '', about: '', pills: '', badge: '', footer: ''
  };
}
function parsePresets(str) {
  var list = String(str || '').split(/[,\s]+/)
    .map(function (s) { return parseFloat(String(s).replace(/[^0-9.]/g, '')); })
    .filter(function (n) { return isFinite(n) && n > 0; });
  return list.slice(0, 6);
}
/* Custom methods stay inside the teal ramp — the brand colors above are reserved
   for the apps people actually recognize. */
var CUSTOM_COLORS = ['#2B6774', '#165564', '#42848F', '#0E3742', '#569FA5', '#0F6B51'];

/* ---------- compact profile <-> link encoding ----------
   Format (kept deliberately terse so it fits on a cheap NFC tag):
     1~Name~v:handle~p:handle~x:Label:value~$:12.50~n:note
   Fields joined by "~". First field is the format version.
   Only ~ % and # are escaped inside values; everything else rides as-is. */
function esc(s) { return String(s == null ? '' : s); }
function encField(s) {
  return String(s).replace(/%/g, '%25').replace(/~/g, '%7E').replace(/#/g, '%23')
    .replace(/[^\x20-\x7E]/g, function (c) { return encodeURIComponent(c); });
}
function decField(s) { try { return decodeURIComponent(s); } catch (e) { return s; } }

function encodeProfile(profile, amount, note, page) {
  var parts = ['1', encField(profile.name || '')];
  METHODS.forEach(function (m) {
    var v = (profile[m.id] || '').trim();
    if (v) parts.push(m.k + ':' + encField(v));
  });
  (profile.custom || []).forEach(function (c) {
    if (c.label && c.value) parts.push('x:' + encField(c.label) + ':' + encField(c.value));
  });
  if (amount) parts.push('$:' + encField(amount));
  if (note) parts.push('n:' + encField(note));
  if (page) {
    PAGE_FIELDS.forEach(function (f) {
      var v = (page[f.id] || '').toString().trim();
      /* the default theme is implied, so it costs nothing to leave out */
      if (f.id === 'themeKey' && (!v || v === 'teal')) return;
      if (v) parts.push(f.k + ':' + encField(v));
    });
  }
  return parts.join('~');
}
function decodeProfile(str) {
  var parts = String(str).split('~');
  if (parts[0] !== '1') return null;
  var p = { name: decField(parts[1] || ''), custom: [] }, amount = '', note = '';
  var page = blankPage();
  for (var i = 2; i < parts.length; i++) {
    var f = parts[i]; if (!f) continue;
    var ci = f.indexOf(':'); if (ci < 0) continue;
    var key = f.slice(0, ci), val = f.slice(ci + 1);
    if (key === 'x') {
      var ci2 = val.indexOf(':');
      if (ci2 > -1) p.custom.push({ id: 'c' + i, label: decField(val.slice(0, ci2)), value: decField(val.slice(ci2 + 1)) });
    } else if (key === '$') { amount = decField(val); }
    else if (key === 'n') { note = decField(val); }
    else if (M_BY_K[key]) { p[M_BY_K[key].id] = decField(val); }
    else if (PF_BY_K[key]) { page[PF_BY_K[key].id] = decField(val); }
  }
  return { profile: p, amount: amount, note: note, page: page };
}

/* ---------- app state ---------- */
var S = {
  user: null,               /* {name, pin} */
  profile: null,            /* {name, venmo, paypal, ..., custom:[]} */
  page: null,               /* the buyer-facing page: title, blurb, theme, presets, about */
  settings: { baseUrl: '', qrMode: 'page', shareMethod: '', passUrl: '' },
  activity: [],             /* [{id, amount, note, date, method, paid}] */
  view: 'sell',
  draftAmount: '',
  draftNote: '',
  customerData: null,       /* set when the page is opened from a shared link */
  previewOn: false,
  fullscreen: false,       /* the big code for a booth table */
  nfcSupported: (typeof window !== 'undefined' && 'NDEFReader' in window)
};

function uid() { return Math.random().toString(36).slice(2, 9); }
/* Every currency figure is tabular and carries cents. */
function money(n) {
  return '$' + (Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
/* Hero figures raise the symbol to 0.6em, per the type scale. */
function moneyHero(n) {
  return '<span class="sym">$</span>' +
    (Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function utf8Length(value) {
  return new TextEncoder().encode(String(value)).length;
}
function todayISO() { return new Date().toISOString().slice(0, 10); }
function h(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function toast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._tm); t._tm = setTimeout(function () { t.classList.remove('show'); }, 2200);
}
/* The one expressive animation, reserved for money landing. Once, per event. */
function celebrate() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var wrap = document.createElement('div');
  wrap.className = 'celebrate';
  var spots = [[46, 38], [54, 44], [40, 52], [60, 34], [50, 30]];
  spots.forEach(function (s, i) {
    var el = document.createElement('i');
    el.style.left = s[0] + '%'; el.style.top = s[1] + '%';
    el.style.animationDelay = (i * 45) + 'ms';
    el.innerHTML = SPARKLE_ONE;
    wrap.appendChild(el);
  });
  document.body.appendChild(wrap);
  setTimeout(function () { wrap.remove(); }, 900);
}
function blankProfile(name) {
  var p = { name: name || '', custom: [] };
  METHODS.forEach(function (m) { p[m.id] = ''; });
  return p;
}
function filledMethods(p) {
  var out = [];
  METHODS.forEach(function (m) { if ((p[m.id] || '').trim()) out.push({ m: m, value: p[m.id].trim() }); });
  (p.custom || []).forEach(function (c, i) {
    if (c.label && c.value) out.push({
      m: {
        id: 'custom-' + i, name: c.label, color: CUSTOM_COLORS[i % CUSTOM_COLORS.length], fg: '#FFFFFF',
        icon: (c.label[0] || '?').toUpperCase(), link: null, custom: true
      }, value: c.value
    });
  });
  return out;
}

/* ---------- link building ---------- */
function baseUrl() {
  var b = httpUrl(S.settings.baseUrl);
  if (b) return b.replace(/[#?].*$/, '');
  var loc = location.href.replace(/[#?].*$/, '');
  return loc;
}
function httpUrl(value) {
  var raw = String(value || '').trim();
  if (!raw || /^[a-z][a-z\d+.-]*:/i.test(raw) && !/^https?:\/\//i.test(raw)) return '';
  try {
    var parsed = new URL(/^https?:\/\//i.test(raw) ? raw : 'https://' + raw);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : '';
  } catch (e) { return ''; }
}
function isHosted() {
  var b = baseUrl();
  return /^https?:\/\//i.test(b) && !/^https?:\/\/localhost/i.test(b);
}
function shareLink(amount, note) {
  /* Signed-in sellers get a short link — just their username, with the
     amount/note (if any) as a couple of query params — instead of the
     whole wallet baked into the URL. A buyer's phone looks it up from
     Supabase. Falls back to the old self-contained link when there is no
     account service to look anything up from. */
  if (supabase && S.user && S.user.username) {
    var q = [];
    if (amount) q.push('a=' + encodeURIComponent(amount));
    if (note) q.push('n=' + encodeURIComponent(note));
    return baseUrl() + (q.length ? '?' + q.join('&') : '') + '#' + encodeURIComponent(S.user.username);
  }
  return baseUrl() + '#' + encodeProfile(S.profile, amount, note, S.page);
}
function textCard(amount, note) {
  var lines = [];
  lines.push('Pay ' + (S.profile.name || 'me') + (amount ? ' ' + money(amount) : ''));
  if (note) lines.push(note);
  filledMethods(S.profile).forEach(function (f) { lines.push(f.m.name + ': ' + f.value); });
  return lines.join('\n');
}
function singleLink(amount, note) {
  var f = filledMethods(S.profile).filter(function (x) { return x.m.link; });
  var chosen = f.filter(function (x) { return x.m.id === S.settings.shareMethod; })[0] || f[0];
  if (!chosen) return null;
  return { name: chosen.m.name, url: chosen.m.link(chosen.value, amount, note) };
}
function qrPayload(amount, note) {
  var mode = S.settings.qrMode || 'page';
  if (mode === 'single') { var s = singleLink(amount, note); return s ? s.url : textCard(amount, note); }
  if (mode === 'text') return textCard(amount, note);
  return shareLink(amount, note);
}
/* Rough NDEF size: 1-byte URI prefix code + the rest of the URL, plus ~7 bytes record overhead. */
function ndefBytes(url) {
  var body = url.replace(/^https:\/\/www\./i, '').replace(/^https:\/\//i, '').replace(/^http:\/\//i, '');
  return new TextEncoder().encode(body).length + 8;
}
function tagFit(bytes) {
  if (bytes <= 132) return { label: 'Fits any tag (NTAG213+)', cls: 'ok' };
  if (bytes <= 480) return { label: 'Needs NTAG215 or bigger', cls: 'warn' };
  if (bytes <= 860) return { label: 'Needs NTAG216', cls: 'warn' };
  return { label: 'Too big for common tags', cls: 'err' };
}

/* ---------- QR rendering ----------
   Modules in --ph-text, never pure black, always on white so a phone
   camera has the contrast it needs whatever the app theme is doing. */
function qrSvg(text, dark) {
  try {
    var byteLength = utf8Length(text);
    var ecl = byteLength > 900 ? 'L' : (byteLength > 300 ? 'M' : 'Q');
    return QR.toSvg(QR.encode(text, ecl), 2, dark || '#14282E', '#FFFFFF');
  } catch (e) {
    return '<div class="empty">That is too much data for one QR code &mdash; shorten your note or use a hosted link.</div>';
  }
}

/* ---------- the reusable card (no amount baked in) ---------- */
function cardPayload() {
  if (isHosted()) return shareLink('', '');
  var s = singleLink('', '');
  if (s) return s.url;
  return textCard('', '');
}

/* Draw the payment card to a canvas at print/retina resolution and hand back a PNG. */
function drawCardImage() {
  var rows = Math.min(filledMethods(S.profile).length, 6) +
    (filledMethods(S.profile).length > 6 ? 1 : 0);
  var W = 1000, H = 1022 + Math.max(rows, 1) * 74 + 56;
  var c = document.createElement('canvas');
  c.width = W; c.height = H;
  var g = c.getContext('2d');
  var DISP = 'Poppins, "Century Gothic", Helvetica, Arial, sans-serif';
  var BODY = 'Inter, Helvetica, Arial, sans-serif';

  function rr(x, y, w, hh, r) {
    g.beginPath();
    g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r);
    g.lineTo(x + w, y + hh - r); g.quadraticCurveTo(x + w, y + hh, x + w - r, y + hh);
    g.lineTo(x + r, y + hh); g.quadraticCurveTo(x, y + hh, x, y + hh - r);
    g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath();
  }
  function fit(text, px, maxW, fam) {
    g.font = '600 ' + px + 'px ' + (fam || BODY);
    var t = String(text);
    while (g.measureText(t).width > maxW && t.length > 4) t = t.slice(0, -2);
    return t === String(text) ? t : t + '…';
  }
  function tracked(text, x, y, px, track, fam, weight) {
    g.font = (weight || 600) + ' ' + px + 'px ' + (fam || DISP);
    var chars = String(text).split('');
    var total = chars.reduce(function (s, ch) { return s + g.measureText(ch).width + track; }, -track);
    var cx = x - total / 2;
    chars.forEach(function (ch) {
      g.textAlign = 'left';
      g.fillText(ch, cx, y);
      cx += g.measureText(ch).width + track;
    });
    g.textAlign = 'center';
  }

  g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, W, H);

  /* header — the deep end of the signature gradient, so white type sits at 6.4:1+ */
  var grd = g.createLinearGradient(0, 0, W * .6, 300);
  grd.addColorStop(0, '#2B6774'); grd.addColorStop(1, '#0E3742');
  g.fillStyle = grd; g.fillRect(0, 0, W, 300);

  g.textAlign = 'center';
  g.fillStyle = 'rgba(255,255,255,.8)';
  tracked('SCAN TO PAY', W / 2, 96, 26, 3.6, DISP, 600);

  g.fillStyle = '#FFFFFF';
  g.font = '600 76px ' + DISP;
  g.fillText(fit(S.profile.name || 'me', 76, W - 120, DISP), W / 2, 200);

  var fm = filledMethods(S.profile);
  g.fillStyle = 'rgba(255,255,255,.82)';
  g.font = '400 27px ' + BODY;
  g.fillText(fm.length + (fm.length === 1 ? ' way to pay' : ' ways to pay'), W / 2, 248);

  /* QR panel — border and shadow together, like the double-outlined badge */
  var panelY = 340, panelH = 620;
  g.fillStyle = '#FFFFFF';
  g.strokeStyle = '#DBDFE2'; g.lineWidth = 3;
  rr(70, panelY, W - 140, panelH, 44); g.fill(); g.stroke();

  var payload = cardPayload();
  try {
    var qr = QR.encode(payload, utf8Length(payload) > 300 ? 'M' : 'Q');
    var quiet = 2, units = qr.size + quiet * 2;
    var box = panelH - 90;
    var cell = Math.floor(box / units);
    var qrPx = cell * units;
    var ox = Math.round((W - qrPx) / 2), oy = Math.round(panelY + (panelH - qrPx) / 2) - 14;
    g.fillStyle = '#FFFFFF'; g.fillRect(ox, oy, qrPx, qrPx);
    g.fillStyle = '#14282E';
    for (var y = 0; y < qr.size; y++) for (var x = 0; x < qr.size; x++) {
      if (qr.modules[y][x]) g.fillRect(ox + (x + quiet) * cell, oy + (y + quiet) * cell, cell, cell);
    }
    g.fillStyle = '#5B6670';
    g.font = '400 24px ' + BODY;
    var cap = 'Point any phone camera here';
    if (!isHosted()) {
      var one = singleLink('', '');
      if (one) cap = 'Opens ' + one.name + ' — the rest are listed below';
    }
    g.fillText(cap, W / 2, panelY + panelH - 30);
  } catch (e) {
    g.fillStyle = '#5B6670'; g.font = '400 28px ' + BODY;
    g.fillText('Too much data for one code', W / 2, panelY + panelH / 2);
  }

  /* method list */
  var ly = panelY + panelH + 62;
  g.textAlign = 'left';
  fm.slice(0, 6).forEach(function (f) {
    g.fillStyle = f.m.color;
    rr(70, ly - 30, 44, 44, 14); g.fill();
    g.fillStyle = f.m.fg || '#FFFFFF';
    g.font = '600 22px ' + DISP;
    g.textAlign = 'center';
    g.fillText(String(f.m.icon || f.m.name[0]).toUpperCase(), 92, ly + 1);
    g.textAlign = 'left';
    g.fillStyle = '#14282E';
    g.font = '600 28px ' + DISP;
    g.fillText(f.m.name, 136, ly - 4);
    g.fillStyle = '#5B6670';
    g.font = '400 25px ' + BODY;
    g.fillText(fit(f.value, 25, W - 300), 136, ly + 28);
    ly += 74;
  });
  if (fm.length > 6) {
    g.fillStyle = '#5B6670'; g.font = '400 25px ' + BODY;
    g.fillText('+ ' + (fm.length - 6) + ' more on the page', 136, ly - 4);
  }

  g.fillStyle = '#8D989E';
  tracked('PAYHUBBLE', W / 2, H - 38, 22, 3.1, DISP, 600);

  return c.toDataURL('image/png');
}

/* ---------- wallet pass endpoints ---------- */
function passUrl(kind) {
  var ep = httpUrl(S.settings.passUrl);
  if (!ep) return null;
  var q = 'p=' + kind +
    '&d=' + encodeURIComponent(encodeProfile(S.profile, '', '', S.page)) +
    '&u=' + encodeURIComponent(cardPayload());
  return ep + (ep.indexOf('?') > -1 ? '&' : '?') + q;
}

/* ============================================================
   VIEWS
   ============================================================ */
function badgeArt(cls) {
  return '<span class="badge-art ' + (cls || '') + '">' + LOGO_SVG + '</span>';
}

function viewSignIn() {
  var mode = S.authMode || 'signin';
  var busy = !!S.authBusy;
  var err = S.authError || '';
  return '<div class="wrap">' +
    '<div class="hero"><div class="spark">' + SPARK_SVG + '</div>' +
    '<p class="kicker">Ready to launch</p>' +
    '<h2>Get paid, fast.</h2>' +
    '<p>Save your Venmo, PayPal, Cash App and the rest once. Sign in and they follow you to any device.</p></div>' +
    '<div class="card">' +
    '<div class="seg">' +
    '<button data-act="authmode" data-m="signin"' + (mode === 'signin' ? ' class="on"' : '') + '>Sign in</button>' +
    '<button data-act="authmode" data-m="signup"' + (mode === 'signup' ? ' class="on"' : '') + '>Create account</button>' +
    '</div>' +
    (!supabase ? '<div class="note" style="margin-top:14px">' +
      '<b>Setup needed:</b> this app has not been connected to an account service yet. ' +
      'A site owner needs to fill in <code>SUPABASE_URL</code> and <code>SUPABASE_ANON_KEY</code> near the top of payhub.js ' +
      '(see supabase-schema.sql for the one-time database setup).</div>' : '') +
    (err ? '<div class="note" style="margin-top:14px;background:var(--ph-danger-bg);border-color:transparent;color:var(--ph-danger-fg)">' + h(err) + '</div>' : '') +
    '<div style="margin-top:16px"><label for="au-username">Username</label>' +
    '<input type="text" id="au-username" placeholder="e.g. elizabeth" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false"></div>' +
    (mode === 'signup' ? '<div style="margin-top:14px"><label for="au-email">Email <span style="font-weight:400">(only used if you forget your password)</span></label>' +
      '<input type="text" id="au-email" placeholder="you@example.com" autocomplete="email" autocapitalize="none" autocorrect="off" spellcheck="false"></div>' : '') +
    '<div style="margin-top:14px"><label for="au-password">Password</label>' +
    '<input type="password" id="au-password" placeholder="••••••••" autocomplete="' + (mode === 'signup' ? 'new-password' : 'current-password') + '"></div>' +
    (mode === 'signup' ? '<div style="margin-top:14px"><label for="au-password2">Confirm password</label>' +
      '<input type="password" id="au-password2" placeholder="••••••••" autocomplete="new-password"></div>' : '') +
    '<button class="btn btn-primary btn-block" data-act="' + (mode === 'signup' ? 'signup' : 'signin') + '"' + (busy ? ' disabled' : '') + '>' +
    (busy ? 'Please wait…' : (mode === 'signup' ? 'Create my hub' : 'Sign in')) + '</button>' +
    (mode === 'signin' ? '<button class="btn btn-ghost btn-block" data-act="forgot-password">Forgot password?</button>' : '') +
    '</div></div>';
}

function viewSetNewPassword() {
  var busy = !!S.authBusy;
  var err = S.authError || '';
  return '<div class="wrap"><div class="card center" style="margin-top:60px;text-align:left">' +
    '<h2>Choose a new password</h2>' +
    '<p class="helper">You followed a password reset link. Pick a new password to finish.</p>' +
    (err ? '<div class="note" style="margin-top:14px;background:var(--ph-danger-bg);border-color:transparent;color:var(--ph-danger-fg)">' + h(err) + '</div>' : '') +
    '<div style="margin-top:14px"><label for="np-password">New password</label>' +
    '<input type="password" id="np-password" placeholder="••••••••" autocomplete="new-password"></div>' +
    '<div style="margin-top:14px"><label for="np-password2">Confirm new password</label>' +
    '<input type="password" id="np-password2" placeholder="••••••••" autocomplete="new-password"></div>' +
    '<button class="btn btn-primary btn-block" data-act="set-new-password"' + (busy ? ' disabled' : '') + '>' +
    (busy ? 'Please wait…' : 'Save new password') + '</button>' +
    '</div></div>';
}

function viewLoading() {
  return '<div class="wrap"><div class="card center" style="margin-top:60px">' +
    '<p class="helper">Loading your hub…</p></div></div>';
}

function viewHubNotFound() {
  return '<div class="wrap"><div class="card center" style="margin-top:60px">' +
    '<h2>Link not found</h2>' +
    '<p class="helper">This payment link doesn&rsquo;t match an active PayHubble account. ' +
    'Double-check it with whoever sent it to you.</p>' +
    '<a class="btn btn-ghost btn-block" href="' + h(baseUrl()) + '" style="margin-top:12px">Go to PayHubble</a>' +
    '</div></div>';
}

function viewSell() {
  var amt = S.draftAmount, note = S.draftNote;
  var methods = filledMethods(S.profile);
  var payload = qrPayload(amt, note);
  var bytes = ndefBytes(payload);
  var fit = tagFit(bytes);
  var mode = S.settings.qrMode || 'page';

  var html = '<div class="wrap">';

  if (!methods.length) {
    html += '<div class="card"><div class="empty">' + badgeArt() +
      '<b>Nothing to share yet</b><br>Your code is empty until you save one way to pay you.</div>' +
      '<button class="btn btn-primary btn-block" data-act="go" data-v="wallet">Set up my wallet</button></div>';
    return html + '</div>';
  }

  html += '<div class="card"><h2>Amount</h2>' +
    '<p class="helper">Optional. Leave it blank to just share your payment options.</p>' +
    '<div class="big-amount" id="amt-display">' + moneyHero(amt || 0) + '</div>' +
    '<div class="numpad">' +
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'].map(function (k) {
      return '<button data-act="pad" data-k="' + k + '">' + k + '</button>';
    }).join('') +
    '</div>' +
    '<div style="margin-top:16px"><label for="sell-note">What is it for?</label>' +
    '<input type="text" id="sell-note" value="' + h(note) + '" placeholder="e.g. 3 boxes of cookies" data-live="note"></div>' +
    (amt ? '<div class="center" style="margin-top:12px"><button class="btn btn-ghost btn-sm" data-act="clear-amt">Clear amount</button></div>' : '') +
    '</div>';

  html += '<div class="card"><h2>Show this to your customer</h2>' +
    '<div class="seg">' +
    '<button data-act="qrmode" data-m="page"' + (mode === 'page' ? ' class="on"' : '') + '>All methods</button>' +
    '<button data-act="qrmode" data-m="single"' + (mode === 'single' ? ' class="on"' : '') + '>One app</button>' +
    '<button data-act="qrmode" data-m="text"' + (mode === 'text' ? ' class="on"' : '') + '>Plain text</button>' +
    '</div>';

  if (mode === 'page' && !isHosted()) {
    html += '<div class="note" style="margin-top:14px"><b>Heads up:</b> &ldquo;All methods&rdquo; sends people to a web page, ' +
      'so this app has to live at a real web address first. Until then use <b>One app</b> or <b>Plain text</b> &mdash; ' +
      'both work right now with no setup. <a href="#" data-act="go" data-v="settings">Set my web address</a></div>';
  }
  if (mode === 'single') {
    var sl = singleLink(amt, note);
    html += '<div style="margin-top:14px"><label for="single-sel">Which app?</label><select id="single-sel" data-live="single">' +
      methods.filter(function (x) { return x.m.link; }).map(function (x) {
        return '<option value="' + h(x.m.id) + '"' + (sl && x.m.name === sl.name ? ' selected' : '') + '>' + h(x.m.name) + '</option>';
      }).join('') + '</select>' +
      '<p class="helper">Opens straight into ' + h(sl ? sl.name : '') + (amt ? ' with ' + money(amt) + ' already filled in.' : '.') + '</p></div>';
  }

  html += '<div class="qrbox" style="margin-top:14px">' + qrSvg(payload) + '</div>' +
    '<p class="helper center">' + (mode === 'text'
      ? 'Their camera will show this as text they can read and copy.'
      : 'Any phone camera scans this &mdash; no app needed.') + '</p>';

  html += '<button class="btn btn-primary btn-block" data-act="fs-enter">Show full screen</button>' +
    '<button class="btn btn-secondary btn-block" data-act="share">Send as a text or link</button>' +
    '<button class="btn btn-ghost btn-block" data-act="copy" data-val="' + h(payload) + '">Copy</button>';

  if (amt) html += '<button class="btn btn-ghost btn-block" data-act="log-sale">Log this as a request</button>';
  html += '<details class="raw"><summary>Show the raw link</summary>' +
    '<div class="linkbox" style="margin-top:8px">' + h(payload) + '</div></details>';
  html += '</div>';

  /* NFC card */
  html += '<div class="card"><h2>Write it to an NFC tag</h2>';
  if (mode === 'text') {
    html += '<p class="helper">Switch to <b>All methods</b> or <b>One app</b> first &mdash; a tag has to hold a link for the tap to open anything.</p>';
  } else {
    html += '<p class="helper">Hold a blank NFC sticker or card against the back of your phone and tap the button. ' +
      'After that, anyone who taps the tag &mdash; iPhone or Android &mdash; goes straight to your payment options.</p>' +
      '<div class="pill-row"><span class="chip">' + bytes + ' bytes</span><span class="chip ' + fit.cls + '">' + h(fit.label) + '</span></div>';
    if (S.nfcSupported) {
      html += '<button class="btn btn-primary btn-block" data-act="nfc-write" data-val="' + h(payload) + '">Write to tag</button>' +
        '<button class="btn btn-ghost btn-block" data-act="nfc-read">Read a tag</button>';
    } else {
      html += '<div class="note blue" style="margin-top:14px">Your phone or browser cannot write NFC tags. ' +
        'Writing needs <b>Chrome on Android</b> over https. iPhones can <i>read</i> the tag once it is written &mdash; ' +
        'they just cannot write it. Any cheap NFC writer app also works.</div>';
    }
  }
  html += '</div>';

  html += '<button class="btn btn-secondary btn-block" data-act="preview">Preview what they will see</button>';
  return html + '</div>';
}

function viewWallet() {
  var p = S.profile;
  var html = '<div class="wrap"><div class="card"><h2>Your payment methods</h2>' +
    '<p class="helper">Fill in whichever you actually use. Blank ones are simply left out. ' +
    'Nothing here processes money &mdash; it only shows people where to send it.</p>' +
    '<div style="margin-top:8px">';

  METHODS.forEach(function (m) {
    html += '<div class="pm-field">' +
      '<div class="ic" style="background:' + m.color + ';color:' + m.fg + '">' + h(m.icon) + '</div>' +
      '<div class="bd"><label for="wf-' + m.id + '">' + h(m.name) + '</label>' +
      '<input type="text" id="wf-' + m.id + '" value="' + h(p[m.id] || '') + '" placeholder="' + h(m.ph) + '" ' +
      'autocapitalize="none" autocorrect="off" spellcheck="false"></div></div>';
  });

  (p.custom || []).forEach(function (c, i) {
    html += '<div class="pm-field">' +
      '<div class="ic" style="background:' + CUSTOM_COLORS[i % CUSTOM_COLORS.length] + ';color:#fff">' +
      h((c.label || '?')[0].toUpperCase()) + '</div>' +
      '<div class="bd"><div class="row"><div><label>Name</label>' +
      '<input type="text" data-cl="' + c.id + '" value="' + h(c.label) + '" placeholder="e.g. Chime"></div>' +
      '<div><label>Handle or link</label>' +
      '<input type="text" data-cv="' + c.id + '" value="' + h(c.value) + '" placeholder="@handle"></div></div></div>' +
      '<button class="remove-x" data-act="rm-custom" data-id="' + h(c.id) + '" title="Remove ' + h(c.label || 'payment method') + '" aria-label="Remove ' + h(c.label || 'payment method') + '" style="margin-top:22px">&times;</button></div>';
  });

  html += '</div>' +
    '<button class="btn btn-secondary btn-block" data-act="add-custom">+ Add another method</button>' +
    '<button class="btn btn-primary btn-block" data-act="save-wallet">Save wallet</button>' +
    '</div>';

  var f = filledMethods(p);
  html += '<div class="card"><h3>Ready to share</h3>';
  if (!f.length) html += '<div class="empty">' + badgeArt() + 'Nothing saved yet.</div>';
  else f.forEach(function (x) {
    html += '<div class="pm"><div class="ic" style="background:' + x.m.color + ';color:' + (x.m.fg || '#fff') + '">' + h(x.m.icon) + '</div>' +
      '<div class="bd"><div class="nm">' + h(x.m.name) + '</div><div class="vl">' + h(x.value) + '</div></div>' +
      (x.m.link ? '<span class="chip ok">1-tap</span>' : '<span class="chip info">copy</span>') + '</div>';
  });
  html += '</div></div>';
  return html;
}

/* Full-screen code for a table at a booth: nothing but the code, and the phone
   is asked to stay awake so it does not dim halfway through a sale. */
function viewFullscreen() {
  var payload = qrPayload(S.draftAmount, S.draftNote);
  return '<div class="fsqr">' +
    '<button class="fs-done" data-act="fs-exit">Done</button>' +
    '<div class="code">' + qrSvg(payload) + '</div>' +
    (S.draftAmount ? '<div class="fs-amt">' + money(S.draftAmount) + '</div>' : '') +
    (S.draftNote ? '<div class="fs-for">' + h(S.draftNote) + '</div>' : '') +
    '<div class="fs-hint">Point a phone camera at the code</div>' +
    '<div class="fs-wake">' + (S._wake ? 'Screen will stay on' :
      (('wakeLock' in navigator) ? 'Turn your brightness up' :
        'Turn your brightness up — and set auto-lock to Never')) + '</div>' +
    '</div>';
}

async function keepAwake() {
  try {
    if ('wakeLock' in navigator && !S._wake) {
      S._wake = await navigator.wakeLock.request('screen');
      S._wake.addEventListener('release', function () { S._wake = null; });
      return true;
    }
  } catch (e) { }
  return false;
}
function releaseAwake() {
  try { if (S._wake) { S._wake.release(); S._wake = null; } } catch (e) { }
}
/* Phones drop the lock when you switch apps; take it back on return. */
document.addEventListener('visibilitychange', function () {
  if (document.visibilityState === 'visible' && S.fullscreen) keepAwake();
});

function viewPage() {
  var pg = S.page || blankPage();
  var presets = parsePresets(pg.presets);
  var linkLen = ndefBytes(shareLink('', ''));
  var fit = tagFit(linkLen);

  var html = '<div class="wrap">';

  html += '<div class="card"><h2>Your payment page</h2>' +
    '<p class="helper">This is the page people land on when they scan your code. Leave it all blank and they ' +
    'get a clean &ldquo;Pay ' + h(S.profile.name || 'me') + '&rdquo; screen. Fill it in and you have a fundraiser page.</p>' +
    '<button class="btn btn-primary btn-block" data-act="preview">See what they will see</button></div>';

  html += '<div class="card"><h3>Color</h3>' +
    '<p class="helper">Your color replaces PayHubble teal in the header band and the pay buttons. Everything else stays put.</p>' +
    '<div class="swatches">' +
    THEME_ORDER.map(function (k) {
      var t = THEMES[k];
      return '<button type="button" class="swatch' + (pg.themeKey === k ? ' on' : '') + '" data-act="theme" data-k="' + k + '" ' +
        'aria-pressed="' + (pg.themeKey === k) + '" aria-label="' + h(t.name) + '" title="' + h(t.name) + '" ' +
        'style="background:linear-gradient(155deg,' + t.primary + ',' + t.accent + ')"></button>';
    }).join('') +
    '</div>' +
    '<p class="helper">' + h(theme(pg.themeKey).name) + '</p></div>';

  html += '<div class="card"><h3>Headline</h3>' +
    '<div style="margin-top:12px"><label for="pg-eyebrow">Small line above the title</label>' +
    '<input type="text" id="pg-eyebrow" value="' + h(pg.eyebrow) + '" placeholder="e.g. Percussion"></div>' +
    '<div style="margin-top:14px"><label for="pg-title">Title</label>' +
    '<input type="text" id="pg-title" value="' + h(pg.title) + '" placeholder="e.g. Bake Sale"></div>' +
    '<div style="margin-top:14px"><label for="pg-blurb">One or two sentences</label>' +
    '<textarea id="pg-blurb" rows="3" placeholder="e.g. Every dollar goes straight to new percussion gear and travel for the section.">' + h(pg.blurb) + '</textarea></div>' +
    '</div>';

  html += '<div class="card"><h3>Amount buttons</h3>' +
    '<p class="helper">What the buyer can tap when you have not set a price. They can always type their own.</p>' +
    '<div style="margin-top:12px"><label for="pg-presets">Preset amounts</label>' +
    '<input type="text" id="pg-presets" value="' + h(pg.presets) + '" placeholder="1, 5, 10, 20" inputmode="numeric"></div>' +
    '<p class="helper">' + (presets.length
      ? 'Buttons: ' + presets.map(function (n) { return '$' + n; }).join('  ')
      : 'Empty, so the page falls back to $1, $5, $10, $20.') + '</p>' +
    '<div class="note blue" style="margin-top:12px">These only show when you have <b>not</b> typed an amount on the Sell tab. ' +
    'Set an amount there and the page becomes a bill with a fixed total instead.</div></div>';

  html += '<div class="card"><h3>About section</h3>' +
    '<p class="helper">Optional. Good for explaining where the money goes.</p>' +
    '<div style="margin-top:12px"><label for="pg-abouttitle">Heading</label>' +
    '<input type="text" id="pg-abouttitle" value="' + h(pg.aboutTitle) + '" placeholder="About Campaign"></div>' +
    '<div style="margin-top:14px"><label for="pg-about">Text <span style="font-weight:400">(blank line starts a new paragraph)</span></label>' +
    '<textarea id="pg-about" rows="5" placeholder="Tell people about the group and why you are raising money.">' + h(pg.about) + '</textarea></div>' +
    '<div style="margin-top:14px"><label for="pg-pills">Tag pills, comma separated</label>' +
    '<input type="text" id="pg-pills" value="' + h(pg.pills) + '" placeholder="Teamwork, Leadership, Self-Discipline"></div>' +
    '<div style="margin-top:14px"><label for="pg-badge">Badge</label>' +
    '<input type="text" id="pg-badge" value="' + h(pg.badge) + '" placeholder="501(c)(3) Nonprofit"></div>' +
    '<div style="margin-top:14px"><label for="pg-footer">Footer line</label>' +
    '<input type="text" id="pg-footer" value="' + h(pg.footer) + '" placeholder="Thank you for the support"></div>' +
    '</div>';

  html += '<div class="card"><h3>Link size</h3>' +
    '<p class="helper">Everything on this page travels inside the QR code and the NFC tag, so more text means a bigger link. ' +
    'Only matters if you are writing cheap tags.</p>' +
    '<div class="pill-row"><span class="chip">' + linkLen + ' bytes</span>' +
    '<span class="chip ' + fit.cls + '">' + h(fit.label) + '</span></div></div>';

  html += '<button class="btn btn-primary btn-block" data-act="save-page">Save page</button>';
  html += '<button class="btn btn-danger btn-block" data-act="clear-page">Clear everything</button>';

  return html + '</div>';
}

function viewCard() {
  var fm = filledMethods(S.profile);
  if (!fm.length) {
    return '<div class="wrap"><div class="card"><div class="empty">' + badgeArt() +
      '<b>Add a payment method first</b><br>Your card needs at least one way to pay you.</div>' +
      '<button class="btn btn-primary btn-block" data-act="go" data-v="wallet">Set up my wallet</button></div></div>';
  }
  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
  var aUrl = passUrl('apple'), gUrl = passUrl('google');

  var html = '<div class="wrap">';

  /* --- the card image --- */
  html += '<div class="card"><h2>Your payment card</h2>' +
    '<p class="helper">One card with every way to pay you. It has no amount on it, so the same card works ' +
    'for every sale &mdash; hand someone your phone, they scan it, done.</p>' +
    '<div class="cardprev" style="margin-top:14px"><img id="card-img" alt="Your PayHubble payment card"></div>' +
    (!isHosted()
      ? '<div class="note" style="margin-top:14px">The code on this card opens ' +
      h((singleLink('', '') || { name: 'your first payment app' }).name) +
      ' only, because the full page needs a web address. The other methods are printed on the card, so people can still ' +
      'read them. <a href="#" data-act="go" data-v="settings">Set a web address</a> and the code covers everything.</div>'
      : '') +
    (isIOS
      ? '<div class="note blue" style="margin-top:14px"><b>To save it:</b> press and hold the card above, then choose <b>Save to Photos</b>. ' +
      'Set it as your lock screen and you can show it without unlocking.</div>'
      : '') +
    '<button class="btn btn-primary btn-block" data-act="save-card">Save card image</button>' +
    '<button class="btn btn-secondary btn-block" data-act="share-card">Send the card to someone</button>' +
    '</div>';

  /* --- Apple Wallet --- */
  html += '<div class="card"><h2>Apple Wallet</h2>';
  if (aUrl) {
    html += '<p class="helper">Adds a real Wallet card. Double-click the side button, show the QR, get paid.</p>' +
      '<a class="wbtn apple" href="' + h(aUrl) + '"> Add to Apple Wallet</a>';
  } else {
    html += '<p class="helper">Apple requires every Wallet card to be cryptographically signed with a certificate ' +
      'from a paid Apple Developer account ($99/year). There is no way around it &mdash; iOS rejects unsigned cards. ' +
      'The generator is built and waiting; it needs your certificate and a place to run.</p>' +
      '<ol class="steps">' +
      '<li>Get an Apple Developer account and create a Pass Type ID certificate (the included guide walks through it).</li>' +
      '<li>Deploy the pass service from the <b>payhub-passes</b> folder to Netlify or run it on your own machine.</li>' +
      '<li>Paste its address into Settings, and this button turns on.</li>' +
      '</ol>' +
      '<button class="wbtn apple" disabled> Add to Apple Wallet</button>' +
      '<p class="helper center">Not set up yet</p>' +
      '<div class="note" style="margin-top:10px">Meanwhile the card image above does the same job on any phone, ' +
      'for free &mdash; save it to Photos and it is one swipe away.</div>';
  }
  html += '</div>';

  /* --- Google Wallet --- */
  html += '<div class="card"><h2>Google Wallet</h2>';
  if (gUrl) {
    html += '<p class="helper">The Android equivalent. Same card, same QR.</p>' +
      '<a class="wbtn google" href="' + h(gUrl) + '">Add to Google Wallet</a>';
  } else {
    html += '<p class="helper">Google’s issuer account is free, but it needs a Google Wallet Console signup and ' +
      'business verification before it will issue cards. The generator is included and works the same way as Apple’s ' +
      '&mdash; once your service is running, this button turns on too.</p>' +
      '<button class="wbtn google" disabled>Add to Google Wallet</button>' +
      '<p class="helper center">Not set up yet</p>';
  }
  html += '</div>';

  /* --- home screen --- */
  html += '<div class="card"><h2>Put PayHubble on your home screen</h2>';
  if (standalone) {
    html += '<p class="helper">✓ Already installed &mdash; you are running it from your home screen right now.</p>';
  } else if (!isHosted()) {
    html += '<p class="helper">This works once the app lives at a web address. ' +
      '<a href="#" data-act="go" data-v="settings">Set that up</a> and come back.</p>';
  } else if (isIOS) {
    html += '<p class="helper">Free, instant, and the fastest option of all &mdash; one tap from your home screen ' +
      'straight to your QR code.</p><ol class="steps">' +
      '<li>Open this page in <b>Safari</b> (not Chrome &mdash; only Safari can install it).</li>' +
      '<li>Tap the <b>Share</b> button at the bottom.</li>' +
      '<li>Scroll down and tap <b>Add to Home Screen</b>.</li>' +
      '<li>Name it PayHubble and tap <b>Add</b>.</li></ol>';
  } else {
    html += '<p class="helper">One tap from your home screen straight to your QR code.</p><ol class="steps">' +
      '<li>Open this page in <b>Chrome</b>.</li>' +
      '<li>Tap the <b>⋮</b> menu, top right.</li>' +
      '<li>Tap <b>Add to Home screen</b> or <b>Install app</b>.</li></ol>';
  }
  html += '</div>';

  html += '<div class="card"><h3>Which should you use?</h3>' +
    '<div class="kv"><span>Card image in Photos</span><b>Free, works now</b></div>' +
    '<div class="kv"><span>Home screen icon</span><b>Free, needs hosting</b></div>' +
    '<div class="kv"><span>Apple Wallet</span><b>$99/year</b></div>' +
    '<div class="kv"><span>Google Wallet</span><b>Free, needs approval</b></div>' +
    '<p class="helper">Apple Wallet is the slickest &mdash; it opens without unlocking your phone. ' +
    'But a saved photo on your lock screen gets you 90% of that for nothing.</p></div>';

  return html + '</div>';
}

function viewActivity() {
  var a = S.activity.slice().sort(function (x, y) { return y.ts - x.ts; });
  var owed = a.filter(function (r) { return !r.paid; }).reduce(function (s, r) { return s + Number(r.amount || 0); }, 0);
  var paid = a.filter(function (r) { return r.paid; }).reduce(function (s, r) { return s + Number(r.amount || 0); }, 0);
  var total = paid + owed;
  var pct = total > 0 ? Math.round((paid / total) * 100) : 0;

  var html = '<div class="wrap">';

  html += '<div class="hero"><div class="spark">' + SPARK_SVG + '</div>' +
    '<p class="kicker">Money in</p>' +
    '<div class="fig">' + moneyHero(paid) + '</div>' +
    '<p>' + (owed > 0 ? 'You&rsquo;re owed ' + money(owed) + ' more' : 'Nothing outstanding') + '</p>' +
    (total > 0 ? '<div class="track' + (pct >= 100 ? ' done' : '') + '"><i style="width:' + pct + '%"></i></div>' : '') +
    '</div>';

  html += '<div class="card">' +
    '<div class="kv"><span>Marked paid</span><b class="money">' + money(paid) + '</b></div>' +
    '<div class="kv"><span>Still waiting</span><b class="money">' + money(owed) + '</b></div>' +
    '<div class="kv"><span>Requests logged</span><b class="money">' + a.length + '</b></div>' +
    '<p class="helper">You log these yourself when you share an amount. PayHubble cannot see your Venmo or PayPal balance.</p></div>';

  /* No API tells us when someone pays via Venmo, PayPal, cash, etc. — the
     merchant self-reports it, so "Mark paid" also asks how and stamps when. */
  var viaOpts = filledMethods(S.profile).map(function (x) { return x.m.name; });
  if (!viaOpts.length) viaOpts = ['Venmo', 'PayPal', 'Cash App', 'Zelle', 'Cash'];
  viaOpts.push('Other');

  html += '<div class="card"><h3>History</h3>';
  if (!a.length) html += '<div class="empty">' + badgeArt() +
    'Nothing logged yet. Share an amount on the Sell tab and tap &ldquo;Log this as a request&rdquo;.</div>';
  else a.forEach(function (r) {
    html += '<div class="list-item" style="align-items:flex-start">' +
      '<div style="flex:1;min-width:0"><b class="money">' + money(r.amount) + '</b> ' +
      '<span class="mini">' + h(r.date) + '</span>' +
      (r.note ? '<div class="mini" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + h(r.note) + '</div>' : '') +
      '<div style="margin-top:4px"><span class="chip ' + (r.paid ? 'ok' : 'warn') + '">' + (r.paid ? 'Paid' : 'Owed') + '</span></div>' +
      (r.paid && r.method ? '<div class="mini" style="margin-top:2px">via ' + h(r.method) + (r.paidDate ? ' &middot; ' + h(r.paidDate) : '') + '</div>' : '') +
      (r.paid ? '' : '<select class="via-sel" id="via-' + r.id + '" aria-label="How are they paying?" style="margin-top:8px;max-width:200px">' +
        viaOpts.map(function (nm) { return '<option value="' + h(nm) + '">' + h(nm) + '</option>'; }).join('') +
        '</select>') +
      '</div>' +
      '<button class="btn btn-sm ' + (r.paid ? 'btn-secondary' : 'btn-primary') + '" data-act="toggle-paid" data-id="' + r.id + '">' +
      (r.paid ? 'Undo' : 'Mark paid') + '</button>' +
      '<button class="remove-x" data-act="rm-activity" data-id="' + h(r.id) + '" title="Remove request" aria-label="Remove request">&times;</button>' +
      '</div>';
  });
  html += '</div></div>';
  return html;
}

function viewSettings() {
  return '<div class="wrap">' +
    '<div class="card"><h2>Web address</h2>' +
    '<p class="helper">For the &ldquo;All methods&rdquo; QR code and NFC tags to open on someone else&rsquo;s phone, ' +
    'this app has to live somewhere public. Deploy this folder to Netlify, GitHub Pages, or any static host, ' +
    'then paste the address here.</p>' +
    '<div style="margin-top:14px"><label for="set-base">Public address of this app</label>' +
    '<input type="text" id="set-base" value="' + h(S.settings.baseUrl || '') + '" placeholder="https://yourname.netlify.app/payhub.html" autocapitalize="none" spellcheck="false"></div>' +
    '<button class="btn btn-primary btn-block" data-act="save-settings">Save</button>' +
    '<p class="helper">' + (isHosted() ? '✓ Links point at ' + h(baseUrl()) : 'Right now links point at this file, which only works on this device.') + '</p>' +
    '</div>' +

    '<div class="card"><h2>Wallet pass service</h2>' +
    '<p class="helper">Apple and Google both require passes to be signed on a server &mdash; a browser cannot do it. ' +
    'Deploy the <b>payhub-passes</b> folder, then paste its address here to switch on the ' +
    '&ldquo;Add to Apple Wallet&rdquo; and &ldquo;Add to Google Wallet&rdquo; buttons.</p>' +
    '<div style="margin-top:14px"><label for="set-pass">Pass service address</label>' +
    '<input type="text" id="set-pass" value="' + h(S.settings.passUrl || '') + '" ' +
    'placeholder="https://yourname.netlify.app/.netlify/functions/pass" autocapitalize="none" spellcheck="false"></div>' +
    '<button class="btn btn-primary btn-block" data-act="save-settings">Save</button>' +
    '<p class="helper">' + (S.settings.passUrl ? '✓ Wallet buttons are on' : 'Wallet buttons are off until this is set') + '</p>' +
    '</div>' +

    '<div class="card"><h3>Account</h3>' +
    '<div class="kv"><span>Username</span><b>' + h(S.user.username) + '</b></div>' +
    '<div class="kv"><span>Email</span><b>' + h(S.user.email || '—') + '</b></div>' +
    '<div class="kv"><span>Data</span><b>Synced to your PayHubble account</b></div>' +
    '<button class="btn btn-ghost btn-block" data-act="change-password">Change password</button>' +
    '<button class="btn btn-ghost btn-block" data-act="export">Export my data</button>' +
    '<button class="btn btn-danger btn-block" data-act="signout">Sign out</button>' +
    '</div>' +

    '<div class="card"><h3>How the tap works</h3>' +
    '<p class="helper" style="margin-top:8px">A true phone-to-phone tap is not something any web app can do &mdash; iPhones will not ' +
    'broadcast a link over NFC, and Android will not do it from a browser. What does work everywhere is a ' +
    '<b>physical NFC tag</b>: a sticker or card you write once and then let people tap. iPhones from the XS on read ' +
    'those tags with no app open at all. The QR code is the universal backup, and it is usually faster anyway.</p>' +
    '</div></div>';
}

/* ---------- what the customer sees ----------
   Two shapes, chosen automatically:
     - the seller set an amount  → a bill. Fixed total, no picker.
     - the seller left it blank  → a donation jar. The buyer picks the amount.
   The campaign color only reaches the header band, the pay-button rules and the
  sticky total; type, radii and chips stay PayHubble's. */
function viewCustomer(data, isPreview) {
  var p = data.profile, amt = data.amount, note = data.note;
  var pg = data.page || blankPage();
  var th = theme(pg.themeKey);
  var f = filledMethods(p);
  var fixed = !!(amt && Number(amt) > 0);
  var presets = parsePresets(pg.presets);
  if (!presets.length) presets = [1, 5, 10, 20];

  /* the amount the buyer is currently on */
  CUST.fixed = fixed;
  CUST.amount = fixed ? String(amt) : String(presets[Math.min(1, presets.length - 1)]);
  CUST.note = note || pg.title || '';
  CUST.methods = f;

  var html = '';
  if (isPreview) html += '<div class="wrap" style="padding-bottom:0"><div class="note blue previewnote' +
    (f.length ? ' below-amtbar' : '') + '" style="margin:14px 0 0">Preview &mdash; ' +
    'this is exactly what someone sees after scanning your code. ' +
    '<a href="#" data-act="close-preview">Back to PayHubble</a></div></div>';

  html += '<div class="pp" style="--pri:' + th.primary + ';--acc:' + th.accent +
    ';--tint:' + th.tint + ';--ln:' + th.line + '">';

  /* hero */
  html += '<div class="hero2">' +
    (pg.eyebrow ? '<p class="eyebrow">' + h(pg.eyebrow) + '</p>' : '') +
    '<h1 class="title">' + h(pg.title || ('Pay ' + (p.name || 'me'))) + '</h1>' +
    (pg.blurb ? '<p class="blurb">' + h(pg.blurb) + '</p>'
      : (pg.title ? '<p class="blurb">Pick an amount below, then pay however is easiest.</p>' : '')) +
    '</div>';

  html += '<div class="body2">';

  /* amount */
  if (fixed) {
    html += '<div class="panel due"><p class="plabel">Amount due</p>' +
      '<div class="amt">' + moneyHero(amt) + '</div>' +
      (note ? '<div class="for">' + h(note) + '</div>' : '') +
      '</div>';
  } else {
    html += '<div class="panel"><p class="plabel">Choose an amount</p>' +
      '<div class="agrid">' +
      presets.map(function (n, i) {
        return '<button class="abtn' + (String(n) === CUST.amount ? ' on' : '') +
          '" data-act="cust-amt" data-amt="' + n + '">$' + n + '</button>';
      }).join('') +
      '</div>' +
      '<div class="custom"><span>$</span>' +
      '<input type="number" id="cust-custom" min="1" step="0.01" placeholder="Other" ' +
      'inputmode="decimal" data-live="cust-amount" aria-label="Other amount"></div>' +
      '</div>';
  }

  /* payment cards */
  if (!f.length) {
    html += '<div class="panel"><div class="empty">This link does not have any payment methods in it.</div></div>';
  } else {
    html += '<div class="cards2">';
    f.forEach(function (x, i) {
      var glyph = h(x.m.icon || (x.m.name[0] || '?').toUpperCase());
      var linkable = !!x.m.link || /^https?:/i.test(x.value);
      html += '<div class="pcard">' +
        '<div class="phead">' +
        '<div class="glyph" style="background:' + x.m.color + ';color:' + (x.m.fg || '#fff') + '">' + glyph + '</div>' +
        '<div class="pmeta"><h3>' + h(x.m.name) + '</h3>' +
        '<div class="handle">' + h(x.value) + '</div></div>' +
        '</div>';
      if (linkable) {
        html += '<a class="paybtn" style="--mc:' + x.m.color + '" data-paylink="' + i + '" ' +
          'href="' + h(payLink(x, CUST.amount, CUST.note)) + '" target="_blank" rel="noopener">' +
          h(payLabel(x, CUST.amount)) + '</a>';
      } else if (x.m.id === 'cash') {
        /* Nothing to copy or tap — the handle itself is the instruction. */
        html += '<p class="pnote" style="margin-top:0">' + h(copyHint(x.m)) + '</p>';
      } else {
        html += '<button class="paybtn" style="--mc:' + x.m.color + '" ' +
          'data-act="cust-copy" data-val="' + h(x.value) + '" data-i="' + i + '">' +
          'Copy ' + h(x.m.name) + ' info</button>' +
          '<p class="confirm" id="cf-' + i + '"></p>' +
          '<p class="pnote">' + h(copyHint(x.m)) + '</p>';
      }
      html += '</div>';
    });
    html += '</div>';
    var linkNames = f.filter(function (x) { return x.m.link; }).map(function (x) { return x.m.name; });
    if (linkNames.length) {
      var listed = linkNames.length > 1
        ? linkNames.slice(0, -1).join(', ') + ' and ' + linkNames[linkNames.length - 1]
        : linkNames[0];
      html += '<p class="gridnote">' + h(listed) + ' open with the amount already filled in.</p>';
    }
  }

  /* about */
  if (pg.about || pg.pills || pg.badge) {
    html += '<div class="panel about2">' +
      '<h3>' + h(pg.aboutTitle || 'About') + '</h3>' +
      (pg.about ? pg.about.split(/\n+/).filter(Boolean).map(function (para) {
        return '<p>' + h(para) + '</p>';
      }).join('') : '') +
      (pg.pills ? '<div class="pills">' + pg.pills.split(',').map(function (s) {
        return s.trim() ? '<span>' + h(s.trim()) + '</span>' : '';
      }).join('') + '</div>' : '') +
      (pg.badge ? '<span class="badge2">' + h(pg.badge) + '</span>' : '') +
      '</div>';
  }

  html += '</div>';
  html += '<div class="foot2">' + h(pg.footer || ((p.name || 'PayHubble') + ' — thank you')) + '</div>';

  if (f.length) {
    html += '<div class="amtbar" id="amt-bar">' +
      '<span class="lbl">' + (fixed ? 'Total' : 'Sending') + '</span>' +
      '<span class="bar-amt">' + (CUST.amount ? money(CUST.amount) : 'Choose an amount') + '</span>' +
      (fixed ? '' : '<button data-act="cust-change">Change</button>') +
      '</div>';
  }

  html += '</div>';
  return html;
}

/* Button label carries the amount, so the last thing they read before tapping
   is the number they are about to send. */
function payLabel(x, amount) {
  var n = parseFloat(amount);
  return (isFinite(n) && n > 0)
    ? 'Pay ' + money(amount) + ' with ' + x.m.name
    : 'Pay with ' + x.m.name;
}

/* Live buyer-side amount state, so changing the amount just rewrites the
   hrefs instead of re-rendering the whole page under the buyer's finger. */
var CUST = { amount: '', fixed: false, note: '', methods: [] };

function payLink(x, amount, note) {
  if (x.m.link) return x.m.link(x.value, amount, note);
  return /^https?:/i.test(x.value) ? x.value : '#';
}
function copyHint(m) {
  if (m.id === 'zelle') return 'Zelle does not open from a link — copy this, then send from your own bank app.';
  if (m.id === 'applecash') return 'Send it in Messages to this number, then tap the Apple Cash button.';
  if (m.id === 'googlepay') return 'Open Google Pay and send to this number or email.';
  if (m.id === 'cash') return 'Paying in person — bring it to the table.';
  return 'Copy this, then send it from that app.';
}

/* Rewrite every deep link for the amount the buyer has chosen. */
function refreshCustomerLinks() {
  var raw = String(CUST.amount || '').trim();
  var n = parseFloat(raw);
  /* keep what they typed — "25.00" reads better in PayPal than "25" */
  var amt = (isFinite(n) && n > 0) ? raw : '';
  CUST.methods.forEach(function (x, i) {
    var el = document.querySelector('[data-paylink="' + i + '"]');
    if (el) {
      el.setAttribute('href', payLink(x, amt, CUST.note));
      el.textContent = payLabel(x, amt);
    }
  });
  var bar = document.querySelector('#amt-bar .bar-amt');
  if (bar) bar.textContent = amt ? money(amt) : 'Choose an amount';
  document.querySelectorAll('[data-act="cust-amt"]').forEach(function (b) {
    b.classList.toggle('on', b.getAttribute('data-amt') === CUST.amount);
  });
}

/* The fixed amount bar's height isn't constant — it wraps to two lines on
   narrow phones (long "Choose an amount" text, a name, a Change button all
   competing for width) — so measure it instead of guessing a fixed offset
   for the preview banner sitting above it. */
function fixPreviewNoteOffset() {
  var note = document.querySelector('.previewnote.below-amtbar');
  var bar = document.getElementById('amt-bar');
  if (note && bar) note.style.marginTop = (bar.offsetHeight + 14) + 'px';
}
window.addEventListener('resize', function () { if (S.previewOn) fixPreviewNoteOffset(); });

/* ============================================================
   RENDER
   ============================================================ */
function render() {
  var root = document.getElementById('root');

  if (S.fullscreen && S.user) {
    root.innerHTML = viewFullscreen();
    return;
  }

  /* customer view: someone opened a shared link */
  if (S.customerData && !S.previewOn) {
    root.innerHTML = viewCustomer(S.customerData, false);
    return;
  }
  if (S.previewOn) {
    root.innerHTML = viewCustomer({ profile: S.profile, amount: S.draftAmount, note: S.draftNote, page: S.page }, true);
    fixPreviewNoteOffset();
    return;
  }
  if (S.hubNotFound) { root.innerHTML = viewHubNotFound(); return; }
  if (S.booting) { root.innerHTML = header('') + viewLoading(); return; }
  if (S.recoveryMode) { root.innerHTML = header('') + viewSetNewPassword(); return; }
  if (!S.user) { root.innerHTML = header('') + viewSignIn(); return; }

  var body = S.view === 'wallet' ? viewWallet()
    : S.view === 'page' ? viewPage()
      : S.view === 'card' ? viewCard()
        : S.view === 'activity' ? viewActivity()
          : S.view === 'settings' ? viewSettings()
            : viewSell();

  root.innerHTML = header(S.user.username) + body + tabs();
  var noteEl = document.getElementById('sell-note');
  if (noteEl && S._focusNote) { noteEl.focus(); noteEl.setSelectionRange(noteEl.value.length, noteEl.value.length); S._focusNote = false; }

  drawCardInto();
}

/* The card is drawn in Poppins; redraw once the webfont has actually landed so
   the PNG matches the app instead of falling back to Helvetica. */
var _cardFontWaited = false;
function drawCardInto() {
  var img = document.getElementById('card-img');
  if (!img) return;
  try { S._cardPng = drawCardImage(); img.src = S._cardPng; }
  catch (e) { img.alt = 'Could not draw the card'; }
  if (!_cardFontWaited && document.fonts && document.fonts.ready) {
    _cardFontWaited = true;
    document.fonts.ready.then(function () {
      var again = document.getElementById('card-img');
      if (!again) return;
      try { S._cardPng = drawCardImage(); again.src = S._cardPng; } catch (e) { }
    });
  }
}

/* Wordmark: wide geometric caps at 0.14em — the one place the tracking lives. */
function header(who) {
  return '<header class="top"><div class="in"><span class="logo">' + LOGO_SVG + '</span>' +
    '<h1>PayHubble</h1>' +
    (who ? '<div class="who">' + h(who) + '</div>' : '') + '</div></header>';
}
function tabs() {
  var items = [['sell', 'sell', 'Sell'], ['page', 'page', 'Page'], ['card', 'card', 'Card'],
  ['wallet', 'wallet', 'Wallet'], ['activity', 'activity', 'Money'], ['settings', 'settings', 'More']];
  return '<nav class="tabs"><div class="in">' + items.map(function (it) {
    var on = S.view === it[0];
    return '<button data-act="go" data-v="' + it[0] + '"' + (on ? ' class="on" aria-current="page"' : '') + '>' +
      '<span class="ic">' + ICONS[it[1]] + '</span>' + it[2] + '</button>';
  }).join('') + '</div></nav>';
}

/* ============================================================
   ACTIONS
   ============================================================ */
async function saveAll() {
  if (!S.user || !supabase) return;
  try {
    await supabase.from('hubs').update({
      profile: S.profile, page: S.page, settings: S.settings, activity: S.activity,
      updated_at: new Date().toISOString()
    }).eq('user_id', S.user.id);
  } catch (e) { toast('Could not save — check your connection'); }
}
/* Pull the signed-in user's payment methods, page and activity down from
   Supabase. If this is their very first sign-in and no hub row exists yet
   (e.g. it was created outside the normal sign-up flow), start a blank one. */
async function loadHub(uid) {
  var blank = { baseUrl: '', qrMode: 'page', shareMethod: '', passUrl: '' };
  try {
    var res = await supabase.from('hubs').select('profile,page,settings,activity').eq('user_id', uid).single();
    var data = res.data;
    if (data) {
      S.profile = data.profile || blankProfile(S.user.username);
      S.page = Object.assign(blankPage(), data.page || {});
      S.settings = Object.assign({}, blank, data.settings || {});
      S.activity = data.activity || [];
    } else {
      S.profile = blankProfile(S.user.username);
      S.page = blankPage();
      S.settings = blank;
      S.activity = [];
      await supabase.from('hubs').insert({ user_id: uid, profile: S.profile, page: S.page, settings: S.settings, activity: S.activity });
    }
  } catch (e) {
    S.profile = blankProfile(S.user.username);
    S.page = blankPage();
    S.settings = blank;
    S.activity = [];
  }
  if (!S.profile.custom) S.profile.custom = [];
}
/* A Supabase session only carries the user's id and email; the username
   they log in with lives in the profiles table. Normally that row is
   created at sign-up, but if "Confirm email" is on there's no session yet
   at that point to create it under — so the username sign-up asked for
   rides along as auth metadata and gets claimed here instead, the first
   time they actually have a session (i.e. right after confirming). */
async function establishSession(session) {
  var uid = session.user.id;
  var email = session.user.email || '';
  var metaUsername = (session.user.user_metadata && session.user.user_metadata.username) || '';
  var username = metaUsername || email.split('@')[0];
  try {
    var res = await supabase.from('profiles').select('username').eq('id', uid).single();
    if (res.data && res.data.username) {
      username = res.data.username;
    } else if (metaUsername) {
      var ins = await supabase.from('profiles').insert({ id: uid, username: metaUsername });
      if (!ins.error) username = metaUsername;
    }
  } catch (e) { }
  S.user = { id: uid, username: username, email: email };
  await loadHub(uid);
}
function readWalletInputs() {
  METHODS.forEach(function (m) {
    var el = document.getElementById('wf-' + m.id);
    if (el) S.profile[m.id] = el.value.trim();
  });
  (S.profile.custom || []).forEach(function (c) {
    var l = document.querySelector('[data-cl="' + c.id + '"]');
    var v = document.querySelector('[data-cv="' + c.id + '"]');
    if (l) c.label = l.value.trim();
    if (v) c.value = v.value.trim();
  });
}
async function copyText(t) {
  try {
    if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(t); toast('Copied'); return; }
  } catch (e) { }
  var ta = document.createElement('textarea');
  ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); toast('Copied'); } catch (e) { toast('Could not copy — select it by hand'); }
  document.body.removeChild(ta);
}

document.addEventListener('click', async function (e) {
  var el = e.target.closest('[data-act]');
  if (!el) return;
  var act = el.getAttribute('data-act');
  if (el.tagName === 'A' && (act === 'go' || act === 'close-preview')) e.preventDefault();

  if (act === 'authmode') {
    S.authMode = el.getAttribute('data-m'); S.authError = ''; render(); return;
  }
  if (act === 'signin') {
    if (!supabase) { S.authError = 'Account service is not set up yet.'; render(); return; }
    var uname = (document.getElementById('au-username').value || '').trim().toLowerCase();
    var pw = document.getElementById('au-password').value || '';
    if (!uname || !pw) { S.authError = 'Enter your username and password.'; render(); return; }
    S.authBusy = true; S.authError = ''; render();
    try {
      var em = await supabase.rpc('email_for_username', { uname: uname });
      if (em.error || !em.data) { S.authBusy = false; S.authError = 'No account with that username.'; render(); return; }
      var res = await supabase.auth.signInWithPassword({ email: em.data, password: pw });
      if (res.error) { S.authBusy = false; S.authError = 'Incorrect username or password.'; render(); return; }
      await establishSession(res.data.session);
      S.authBusy = false; render(); toast('Welcome back, ' + S.user.username);
    } catch (e) { S.authBusy = false; S.authError = 'Something went wrong. Try again.'; render(); }
    return;
  }
  if (act === 'signup') {
    if (!supabase) { S.authError = 'Account service is not set up yet.'; render(); return; }
    var uname = (document.getElementById('au-username').value || '').trim().toLowerCase();
    var email = (document.getElementById('au-email').value || '').trim();
    var pw = document.getElementById('au-password').value || '';
    var pw2 = document.getElementById('au-password2').value || '';
    if (!/^[a-z0-9_.-]{3,24}$/.test(uname)) { S.authError = 'Username should be 3-24 characters: letters, numbers, . _ -'; render(); return; }
    if (!/^\S+@\S+\.\S+$/.test(email)) { S.authError = 'Enter a valid email — it is only used if you forget your password.'; render(); return; }
    if (pw.length < 8) { S.authError = 'Password must be at least 8 characters.'; render(); return; }
    if (pw !== pw2) { S.authError = 'Passwords do not match.'; render(); return; }
    S.authBusy = true; S.authError = ''; render();
    try {
      var avail = await supabase.rpc('username_available', { uname: uname });
      if (avail.data === false) { S.authBusy = false; S.authError = 'That username is taken.'; render(); return; }
      var signed = await supabase.auth.signUp({ email: email, password: pw, options: { data: { username: uname } } });
      if (signed.error) { S.authBusy = false; S.authError = signed.error.message || 'Could not create your account.'; render(); return; }
      var uid = signed.data.user && signed.data.user.id;
      if (!signed.data.session) {
        /* "Confirm email" is on in Supabase — there's no session yet to create
           the username/wallet row under, so it has to wait until after they
           click the emailed link and sign in for the first time. */
        S.authBusy = false;
        S.authError = uid ? 'Check your inbox to confirm your email, then sign in.'
          : 'Could not create your account. Try again.';
        render(); return;
      }
      var profErr = await supabase.from('profiles').insert({ id: uid, username: uname });
      if (profErr.error) { S.authBusy = false; S.authError = 'That username was just taken — try another, or sign in if it was you.'; render(); return; }
      S.profile = blankProfile(uname); S.page = blankPage();
      S.settings = { baseUrl: '', qrMode: 'page', shareMethod: '', passUrl: '' }; S.activity = [];
      await supabase.from('hubs').insert({ user_id: uid, profile: S.profile, page: S.page, settings: S.settings, activity: S.activity });
      S.user = { id: uid, username: uname, email: email };
      S.authBusy = false; S.view = 'wallet'; render(); toast('Welcome, ' + uname);
    } catch (e) { S.authBusy = false; S.authError = 'Something went wrong. Try again.'; render(); }
    return;
  }
  if (act === 'forgot-password') {
    if (!supabase) { toast('Account service is not set up yet.'); return; }
    var email = prompt('Enter the email you signed up with:');
    if (!email) return;
    try { await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: baseUrl() }); } catch (e) { }
    toast('If that email has an account, a reset link is on its way.');
    return;
  }
  if (act === 'set-new-password') {
    var np = document.getElementById('np-password').value || '';
    var np2 = document.getElementById('np-password2').value || '';
    if (np.length < 8) { S.authError = 'Password must be at least 8 characters.'; render(); return; }
    if (np !== np2) { S.authError = 'Passwords do not match.'; render(); return; }
    S.authBusy = true; S.authError = ''; render();
    try {
      var upd = await supabase.auth.updateUser({ password: np });
      if (upd.error) { S.authBusy = false; S.authError = upd.error.message || 'Could not update password.'; render(); return; }
      S.recoveryMode = false; S.authBusy = false;
      var sess = await supabase.auth.getSession();
      if (sess.data.session) await establishSession(sess.data.session);
      render(); toast('Password updated');
    } catch (e) { S.authBusy = false; S.authError = 'Something went wrong. Try again.'; render(); }
    return;
  }
  if (act === 'go') {
    if (S.fullscreen) { S.fullscreen = false; releaseAwake(); }
    if (S.view === 'wallet') { readWalletInputs(); await saveAll(); }
    if (S.view === 'page') { readPageInputs(); await saveAll(); }
    S.view = el.getAttribute('data-v'); S.previewOn = false; render(); return;
  }

  if (act === 'pad') {
    var k = el.getAttribute('data-k');
    var cur = S.draftAmount || '';
    if (k === '⌫') cur = cur.slice(0, -1);
    else if (k === '.') { if (cur.indexOf('.') < 0) cur = (cur || '0') + '.'; }
    else { if (/\.\d\d$/.test(cur)) return; cur += k; }
    S.draftAmount = cur;
    render();
    return;
  }
  if (act === 'clear-amt') { S.draftAmount = ''; render(); return; }
  if (act === 'qrmode') { S.settings.qrMode = el.getAttribute('data-m'); await saveAll(); render(); return; }
  if (act === 'copy') { await copyText(el.getAttribute('data-val')); return; }

  if (act === 'share') {
    var payload = qrPayload(S.draftAmount, S.draftNote);
    var msg = (S.settings.qrMode === 'text') ? payload : (S.draftAmount ? 'Pay ' + money(S.draftAmount) + ' to ' + S.profile.name : 'Pay ' + S.profile.name);
    try {
      if (navigator.share) {
        await navigator.share(S.settings.qrMode === 'text' ? { text: payload } : { title: 'Pay ' + S.profile.name, text: msg, url: payload });
        return;
      }
    } catch (err) { if (err && err.name === 'AbortError') return; }
    await copyText(payload);
    toast('Copied — paste it into a text message');
    return;
  }

  if (act === 'log-sale') {
    S.activity.push({ id: uid(), amount: Number(S.draftAmount) || 0, note: S.draftNote, date: todayISO(), ts: Date.now(), paid: false });
    await saveAll();
    toast('Logged — see Money');
    return;
  }
  if (act === 'toggle-paid') {
    var r = S.activity.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0];
    if (r) {
      r.paid = !r.paid;
      if (r.paid) {
        var sel = document.getElementById('via-' + r.id);
        r.method = sel ? sel.value : '';
        r.paidDate = todayISO();
        r.paidTs = Date.now();
      } else {
        r.method = ''; r.paidDate = ''; r.paidTs = null;
      }
      await saveAll(); render();
      if (r.paid) { celebrate(); toast('Paid via ' + r.method + ' — nice'); }
    }
    return;
  }
  if (act === 'rm-activity') {
    S.activity = S.activity.filter(function (x) { return x.id !== el.getAttribute('data-id'); });
    await saveAll(); render(); return;
  }

  if (act === 'add-custom') {
    readWalletInputs();
    if (!S.profile.custom) S.profile.custom = [];
    S.profile.custom.push({ id: uid(), label: '', value: '' });
    render(); return;
  }
  if (act === 'rm-custom') {
    readWalletInputs();
    S.profile.custom = (S.profile.custom || []).filter(function (c) { return c.id !== el.getAttribute('data-id'); });
    await saveAll(); render(); return;
  }
  if (act === 'save-wallet') {
    readWalletInputs();
    S.profile.custom = (S.profile.custom || []).filter(function (c) { return c.label || c.value; });
    await saveAll(); render(); toast('Wallet saved'); return;
  }
  if (act === 'save-settings') {
    var bEl = document.getElementById('set-base');
    if (bEl) S.settings.baseUrl = httpUrl(bEl.value);
    var pEl = document.getElementById('set-pass');
    if (pEl) S.settings.passUrl = httpUrl(pEl.value);
    await saveAll(); render(); toast('Saved'); return;
  }
  if (act === 'change-password') {
    var np = prompt('New password (at least 8 characters):');
    if (np === null) return;
    if (np.length < 8) { toast('Password must be at least 8 characters'); return; }
    try {
      var upd = await supabase.auth.updateUser({ password: np });
      if (upd.error) { toast(upd.error.message || 'Could not update password'); return; }
      toast('Password updated');
    } catch (e) { toast('Could not update password'); }
    return;
  }
  if (act === 'export') {
    var blob = new Blob([JSON.stringify({ user: { username: S.user.username, email: S.user.email }, profile: S.profile, activity: S.activity }, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'payhub-backup.json'; a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    return;
  }
  if (act === 'signout') {
    if (!confirm('Sign out of PayHubble on this device?')) return;
    if (supabase) { try { await supabase.auth.signOut(); } catch (e) { } }
    S.user = null; S.profile = null; S.page = blankPage(); S.activity = [];
    S.settings = { baseUrl: '', qrMode: 'page', shareMethod: '', passUrl: '' };
    S.view = 'sell'; render(); return;
  }
  /* ---- page builder ---- */
  if (act === 'theme') {
    readPageInputs();
    S.page.themeKey = el.getAttribute('data-k');
    await saveAll(); render(); return;
  }
  if (act === 'save-page') {
    readPageInputs();
    await saveAll(); render(); toast('Page saved'); return;
  }
  if (act === 'clear-page') {
    if (!confirm('Clear the headline, about section and colors? Your payment methods are not touched.')) return;
    S.page = blankPage();
    await saveAll(); render(); toast('Page cleared'); return;
  }

  /* ---- the buyer's amount picker ---- */
  if (act === 'cust-amt') {
    CUST.amount = el.getAttribute('data-amt');
    var ci = document.getElementById('cust-custom');
    if (ci) ci.value = '';
    refreshCustomerLinks();
    return;
  }
  if (act === 'cust-copy') {
    await copyText(el.getAttribute('data-val'));
    var cf = document.getElementById('cf-' + el.getAttribute('data-i'));
    if (cf) {
      cf.textContent = 'Copied — now paste it in that app.';
      clearTimeout(cf._tm);
      cf._tm = setTimeout(function () { cf.textContent = ''; }, 4000);
    }
    return;
  }

  if (act === 'save-card') {
    var png = S._cardPng || drawCardImage();
    var a2 = document.createElement('a');
    a2.href = png;
    a2.download = 'payhub-card-' + (S.profile.name || 'me').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.png';
    document.body.appendChild(a2); a2.click(); document.body.removeChild(a2);
    toast('Card saved');
    return;
  }
  if (act === 'share-card') {
    var png2 = S._cardPng || drawCardImage();
    try {
      var res = await fetch(png2);
      var blob = await res.blob();
      var file = new File([blob], 'payhub-card.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Pay ' + S.profile.name });
        return;
      }
    } catch (err) { if (err && err.name === 'AbortError') return; }
    toast('Sharing images is not supported here — use Save card image');
    return;
  }
  if (act === 'fs-enter') {
    S.fullscreen = true;
    render();
    await keepAwake();
    render();
    window.scrollTo(0, 0);
    return;
  }
  if (act === 'fs-exit') { S.fullscreen = false; releaseAwake(); render(); return; }
  if (act === 'cust-change') {
    var panel = document.querySelector('.pp .panel');
    if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    var ci2 = document.getElementById('cust-custom');
    if (ci2) setTimeout(function () { ci2.focus(); }, 350);
    return;
  }
  if (act === 'preview') { S.previewOn = true; render(); window.scrollTo(0, 0); return; }
  if (act === 'close-preview') { S.previewOn = false; render(); return; }

  if (act === 'nfc-write') {
    if (!('NDEFReader' in window)) { toast('This browser cannot write NFC tags'); return; }
    try {
      toast('Hold the tag against your phone…');
      var ndef = new NDEFReader();
      await ndef.write({ records: [{ recordType: 'url', data: el.getAttribute('data-val') }] });
      toast('✓ Tag written');
    } catch (err) {
      toast('Write failed: ' + (err && err.message ? err.message : 'try again'));
    }
    return;
  }
  if (act === 'nfc-read') {
    if (!('NDEFReader' in window)) { toast('This browser cannot read NFC tags'); return; }
    try {
      var rd = new NDEFReader();
      await rd.scan();
      toast('Hold a tag against your phone…');
      rd.onreading = function (ev) {
        var found = '';
        for (var rec of ev.message.records) {
          if (rec.recordType === 'url' || rec.recordType === 'text') {
            found = new TextDecoder(rec.encoding || 'utf-8').decode(rec.data);
          }
        }
        toast(found ? 'Tag says: ' + found.slice(0, 60) : 'Tag is empty');
      };
    } catch (err) { toast('Scan failed: ' + (err && err.message ? err.message : '')); }
    return;
  }
});

/* Swatches are divs, so give them the keyboard behaviour a button would have. */
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  var sw = e.target.closest && e.target.closest('.swatch[data-act="theme"]');
  if (!sw) return;
  e.preventDefault();
  sw.click();
});

function readPageInputs() {
  if (!S.page) S.page = blankPage();
  [['pg-eyebrow', 'eyebrow'], ['pg-title', 'title'], ['pg-blurb', 'blurb'], ['pg-presets', 'presets'],
  ['pg-abouttitle', 'aboutTitle'], ['pg-about', 'about'], ['pg-pills', 'pills'],
  ['pg-badge', 'badge'], ['pg-footer', 'footer']].forEach(function (pair) {
    var el = document.getElementById(pair[0]);
    if (el) S.page[pair[1]] = el.value.trim();
  });
}

document.addEventListener('input', function (e) {
  var live = e.target.getAttribute && e.target.getAttribute('data-live');
  if (live === 'note') { S.draftNote = e.target.value; scheduleQrRefresh(); }
  if (live === 'single') { S.settings.shareMethod = e.target.value; saveAll(); render(); }
  if (live === 'cust-amount') {
    /* Clearing the field must clear the amount too — otherwise the buttons keep
       advertising the old number while the box reads empty. */
    CUST.amount = e.target.value.trim();
    refreshCustomerLinks();
  }
});
var _qrTm = null;
function scheduleQrRefresh() {
  clearTimeout(_qrTm);
  _qrTm = setTimeout(function () {
    if (S.view !== 'sell' || S.previewOn) return;
    S._focusNote = true;
    render();
  }, 700);
}

/* ============================================================
   BOOT
   ============================================================ */
(async function boot() {
  var hash = location.hash ? location.hash.slice(1) : '';
  var isRecoveryHash = /(^|&)type=recovery(&|$)/.test(hash) || /access_token=/.test(hash);
  if (hash && hash.indexOf('1~') === 0) {
    var parsed = decodeProfile(hash);
    if (parsed) S.customerData = parsed;
  } else if (hash && !isRecoveryHash && supabase) {
    /* Short link: just a username, e.g. #elizabeth, plus an optional
       ?a=12.50&n=cookies for the amount/note. Nothing sensitive rides in
       the link itself — a buyer's phone looks the wallet up from Supabase,
       which is what keeps these links (and the NFC tags built from them)
       short no matter how many payment methods or how much page text
       someone has saved. */
    S.booting = true; render();
    var uname = decodeURIComponent(hash.split('?')[0]);
    try {
      var res = await supabase.rpc('public_hub', { uname: uname });
      var row = res.data && res.data[0];
      if (row) {
        var params = new URLSearchParams(location.search);
        S.customerData = {
          profile: Object.assign({ custom: [] }, row.profile || {}),
          page: Object.assign(blankPage(), row.page || {}),
          amount: params.get('a') || '', note: params.get('n') || ''
        };
      } else { S.hubNotFound = true; }
    } catch (e) { S.hubNotFound = true; }
    S.booting = false;
  }
  /* A buyer opening a shared payment link never needs to sign in —
     skip session restore entirely and go straight to the customer view. */
  if (!S.customerData && !S.hubNotFound && supabase) {
    S.booting = true; render();
    supabase.auth.onAuthStateChange(function (event, session) {
      if (event === 'PASSWORD_RECOVERY') { S.recoveryMode = true; render(); }
      if (event === 'SIGNED_OUT') { S.user = null; S.profile = null; render(); }
    });
    try {
      var res = await supabase.auth.getSession();
      if (res.data.session && res.data.session.user) await establishSession(res.data.session);
    } catch (e) { }
    S.booting = false;
  }
  render();
})();
