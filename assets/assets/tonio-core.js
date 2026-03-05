/* ═══════════════════════════════════════════════════════
   TONIO — tonio-core.js
   Navigazione e funzioni condivise da tutti i moduli.
   NON modificare senza aggiornare TONIO_stato.md
   Versione: 1.0  —  2026-03-05
═══════════════════════════════════════════════════════ */

/* ════════════════════════════════════════
   STRUTTURA MENU
   Per aggiungere un modulo: aggiungere voce in MENU
   e aggiungere il file in moduli/
════════════════════════════════════════ */
const MENU = {
  ana: {
    label: 'Anagrafiche',
    subs: [
      { id: 'pg-clienti',      label: '👥 Clienti',      file: 'moduli/Msk_Clienti.html'      },
      { id: 'pg-ospiti',       label: '🧑 Ospiti',        file: null },
      { id: 'pg-immobili',     label: '🏠 Immobili',      file: null },
    ]
  },
  ope: {
    label: 'Operativo',
    subs: [
      { id: 'pg-prenotazioni', label: '📋 Prenotazioni',  file: null },
      { id: 'pg-preventivi',   label: '📄 Preventivi',    file: null },
    ]
  },
  con: {
    label: 'Contabilità',
    subs: [
      { id: 'pg-entrate',      label: '💰 Entrate/Uscite',file: null },
      { id: 'pg-budget',       label: '📊 Budget',         file: null },
      { id: 'pg-statistiche',  label: '📈 Statistiche',    file: null },
    ]
  },
  ges: {
    label: 'Gestione',
    subs: [
      { id: 'pg-manutenzioni', label: '🔧 Manutenzioni',  file: null },
      { id: 'pg-magazzino',    label: '📦 Magazzino',      file: null },
    ]
  }
};

/* Mappa ogni pageId al suo menu principale e sottomenu */
const P2M = {
  'pg-clienti':   { main: 'ana', sub: 'pg-clienti' },
  'pg-tipologie': { main: 'ana', sub: 'pg-clienti' },
  'pg-stati':     { main: 'ana', sub: 'pg-clienti' },
};

let curMain = 'ana';
let curSub  = 'pg-clienti';
let curPage = 'pg-clienti';

/* ════════════════════════════════════════
   RENDERING NAVIGAZIONE
════════════════════════════════════════ */

/** Costruisce la barra sottomenu (riga 2) */
function buildSub(mainKey, activeId) {
  const row = document.getElementById('deskSub');
  if (!row) return;
  const subs = MENU[mainKey].subs;
  let html = subs.map(s =>
    `<div class="dsm ${s.id === activeId ? 'on' : ''}"
          onclick="clickSub('${mainKey}','${s.id}',${s.file ? `'${s.file}'` : 'null'})">${s.label}</div>`
  ).join('');
  html += `<div class="d-r2-right" id="deskActions2"></div>`;
  row.innerHTML = html;
  buildActions(curPage);
}

/** Click su menu principale */
function setMain(key) {
  curMain = key;
  document.querySelectorAll('.dm').forEach(e => e.classList.remove('on'));
  const el = document.getElementById('dm-' + key);
  if (el) el.classList.add('on');
  const first = MENU[key].subs[0];
  curSub = first.id;
  buildSub(key, first.id);
  if (first.file) loadModule(first.id, first.file);
}

/** Click su sottomenu */
function clickSub(mainKey, subId, file) {
  curSub = subId;
  buildSub(mainKey, subId);
  if (file) loadModule(subId, file);
}

/* ════════════════════════════════════════
   CARICAMENTO MODULI
════════════════════════════════════════ */

/** Cache dei moduli già caricati */
const moduleCache = {};

/** Carica un modulo HTML nella #module-container */
function loadModule(pgId, file) {
  curPage = pgId;

  // Aggiorna subtitle mobile
  const mobLabels = {
    'pg-clienti':   'Clienti',
    'pg-tipologie': 'Tipologie',
    'pg-stati':     'Stati',
  };
  const ms = document.getElementById('mobSub');
  if (ms) ms.textContent = mobLabels[pgId] || pgId;

  const container = document.getElementById('module-container');
  if (!container) return;

  // Se il modulo è in cache, mostralo subito
  if (moduleCache[pgId]) {
    container.innerHTML = moduleCache[pgId];
    _initModule(pgId);
    buildActions(pgId);
    return;
  }

  // Altrimenti caricalo dal file
  container.innerHTML = `<div style="padding:60px;text-align:center;color:var(--muted)">
    <div style="font-size:32px;margin-bottom:12px">⏳</div>
    <div>Caricamento in corso...</div>
  </div>`;

  fetch(file)
    .then(r => { if (!r.ok) throw new Error('File non trovato: ' + file); return r.text(); })
    .then(html => {
      moduleCache[pgId] = html;
      container.innerHTML = html;
      _initModule(pgId);
      buildActions(pgId);
    })
    .catch(() => {
      container.innerHTML = `<div style="padding:60px;text-align:center;color:var(--muted)">
        <div style="font-size:32px;margin-bottom:12px">🚧</div>
        <div style="font-size:16px;font-weight:600;margin-bottom:8px">Modulo non ancora disponibile</div>
        <div style="font-size:13px">Il file <code>${file}</code> non è ancora stato creato.</div>
      </div>`;
    });
}

/** Inizializza script del modulo dopo il caricamento */
function _initModule(pgId) {
  // Esegui eventuali script inline nel modulo caricato
  const container = document.getElementById('module-container');
  if (!container) return;
  container.querySelectorAll('script').forEach(oldScript => {
    const newScript = document.createElement('script');
    newScript.textContent = oldScript.textContent;
    document.body.appendChild(newScript);
    oldScript.remove();
  });
}

/* ════════════════════════════════════════
   PULSANTI AZIONE (destra barra sottomenu)
════════════════════════════════════════ */

/**
 * Ogni modulo può sovrascrivere questa funzione
 * per fornire i propri pulsanti contestuali.
 * Default: nessun pulsante.
 */
function buildActions(pgId) {
  const da = document.getElementById('deskActions2');
  const ma = document.getElementById('mobActions');
  const html = (typeof moduleActions === 'function') ? moduleActions(pgId) : '';
  if (da) da.innerHTML = html;
  if (ma) ma.innerHTML = html;
}

/* ════════════════════════════════════════
   NAVIGAZIONE PUBBLICA
════════════════════════════════════════ */

/** Vai a una pagina (chiamabile da qualsiasi modulo) */
function goPage(pgId) {
  const m = P2M[pgId];
  if (m) {
    curMain = m.main;
    curSub  = m.sub;
    document.querySelectorAll('.dm').forEach(e => e.classList.remove('on'));
    const mainEl = document.getElementById('dm-' + m.main);
    if (mainEl) mainEl.classList.add('on');
    buildSub(m.main, m.sub);
  }
  // Trova il file corrispondente
  let file = null;
  for (const key of Object.keys(MENU)) {
    const found = MENU[key].subs.find(s => s.id === pgId);
    if (found) { file = found.file; break; }
  }
  if (file) loadModule(pgId, file);
}

/* ════════════════════════════════════════
   MOBILE SIDEBAR
════════════════════════════════════════ */
function openSB() {
  document.getElementById('mobSidebar').classList.add('open');
  document.getElementById('mobOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeSB() {
  document.getElementById('mobSidebar').classList.remove('open');
  document.getElementById('mobOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

/* ════════════════════════════════════════
   UTILITY CONDIVISE
════════════════════════════════════════ */

/** Switch tab dentro un pannello */
function setTab(el, paneId) {
  const bar = el.closest('.tabs-bar');
  bar.querySelectorAll('.tab').forEach(t => t.classList.remove('on'));
  el.classList.add('on');
  const panel = bar.closest('.dpanel') || bar.parentElement;
  panel.querySelectorAll(':scope > .tpane').forEach(p => p.classList.remove('on'));
  const pane = document.getElementById(paneId);
  if (pane) pane.classList.add('on');
}

/** Formatta data italiana */
function fmtDate(d) {
  return new Date(d).toLocaleDateString('it-IT', { day:'2-digit', month:'2-digit', year:'numeric' });
}

/** Iniziali da nome */
function initials(name) {
  return (name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

/* ════════════════════════════════════════
   INIT AL CARICAMENTO PAGINA
════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  buildSub('ana', 'pg-clienti');
  loadModule('pg-clienti', 'moduli/Msk_Clienti.html');
});
