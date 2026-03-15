/* ================================================================
   TONIO — tonio-core.js  |  Navigazione e utility comuni
   v2.0 — Init centralizzato, tutti i moduli avviati qui
   ================================================================ */

var TONIO_NAV = {
  prenotazioni_menu: {
    label: '📅 Prenotazioni',
    subs: [
      { label: '📅 Prenotazioni', page: 'prenotazioni' },
      { label: '📄 Contratti',    page: 'contratti' },
    ]
  },
  anagrafiche: {
    label: '👤 Anagrafiche',
    subs: [
      { label: '👥 Clienti',   page: 'clienti' },
      { label: '🧑 Ospiti',    page: 'ospiti' },
      { label: '🔧 Fornitori', page: 'fornitori' },
    ]
  },
  operativo: {
    label: '🗂 Operativo',
    subs: [
      { label: '📄 Contratti',    page: 'contratti' },
    ]
  },
  contabilita: {
    label: '💰 Contabilità',
    subs: [
      { label: '💰 Incassi',               page: 'incassi' },
      { label: '📊 Spese',                 page: 'spese' },
      { label: '📈 Budget',                page: 'budget' },
    ]
  },
  immobili_tariffe: {
    label: '🏠 Immobili & Tariffe',
    subs: [
      { label: '🏠 Immobili',                  page: 'immobili' },
      { label: '💶 Tariffe',                   page: 'tariffe' },
      { label: '🏷️ Sconti',                    page: 'sconti' },
      { label: '💳 Modalità di Pagamento',     page: 'modalita_pagamento' },
      { label: '📋 Politiche di Cancellazione', page: 'politiche_cancellazione' },
    ]
  },
  gestione: {
    label: '⚙️ Gestione',
    subs: [
      { label: '🔨 Manutenzioni', page: 'manutenzioni' },
      { label: '📁 Documenti',    page: 'documenti' },
      { label: '⚙️ Impostazioni', page: 'impostazioni' },
    ]
  }
};

/* Pulsanti toolbar per pagina */
var TONIO_PAGE_ACTIONS = {
  clienti:             '<button class="nav-action-btn primary" onclick="MSK_Clienti.nuovoCliente()">＋ Nuovo Cliente</button>',
  fornitori:           '<button class="nav-action-btn primary" onclick="MSK_Fornitori.nuovoFornitore()">＋ Nuovo Fornitore</button>',
  ospiti:              '<button class="nav-action-btn primary" onclick="MSK_Ospiti.nuovoOspite()">＋ Nuovo Ospite</button>',
  immobili:            '<button class="nav-action-btn primary" onclick="MSK_Immobili.nuovoImmobile()">＋ Nuovo Immobile</button>',
  modalita_pagamento:       '<button class="nav-action-btn primary" onclick="MSK_Contabilita.nuovaModalitaPagamento()">＋ Nuova Modalità</button>',
  politiche_cancellazione:  '<button class="nav-action-btn primary" onclick="MSK_Contabilita.nuovaPolitica()">＋ Nuova Politica</button>',
  sconti:                   '',
  prenotazioni:             '<button class="nav-action-btn primary" onclick="MSK_Prenotazioni.nuovaPrenotazione()">＋ Nuova Prenotazione</button>',
  tariffe:                  ''
};

var TONIO_currentModule = 'prenotazioni_menu';
var TONIO_currentPage   = 'prenotazioni';

document.addEventListener('DOMContentLoaded', function() {
  /* ---- Costruisce dinamicamente la riga 1 del menu principale ---- */
  _buildNavRow1();

  /* ---- Avvio centralizzato di tutti i moduli ---- */
  if (typeof MSK_Clienti   !== 'undefined') MSK_Clienti.init();
  if (typeof MSK_Fornitori !== 'undefined') MSK_Fornitori.init();
  if (typeof MSK_Ospiti    !== 'undefined') MSK_Ospiti.init();
  if (typeof MSK_Immobili  !== 'undefined') MSK_Immobili.init();
  if (typeof MSK_Contabilita !== 'undefined') MSK_Contabilita.init();
  if (typeof MSK_Tariffe    !== 'undefined') MSK_Tariffe.init();
  if (typeof MSK_Prenotazioni !== 'undefined') MSK_Prenotazioni.init();

  TONIO_setModule('prenotazioni_menu', false);
  TONIO_showPage('prenotazioni');
});

function _buildNavRow1() {
  var r1 = document.getElementById('nav-r1');
  if (!r1) return; /* se non esiste il contenitore, esce senza errori */
  var html = '';
  for (var key in TONIO_NAV) {
    html += '<button class="nav-main-btn" id="nav-main-' + key + '" onclick="TONIO_setModule(\'' + key + '\')">' + TONIO_NAV[key].label + '</button>';
  }
  r1.innerHTML = html;
}

function TONIO_setModule(mod, navigate) {
  if (navigate === undefined) navigate = true;
  TONIO_currentModule = mod;
  document.querySelectorAll('.nav-main-btn').forEach(function(b) { b.classList.remove('active'); });
  var mb = document.getElementById('nav-main-' + mod);
  if (mb) mb.classList.add('active');
  TONIO_buildRow2(TONIO_currentPage);
  if (navigate) {
    TONIO_showPage(TONIO_NAV[mod].subs[0].page);
  }
}

function TONIO_showPage(pageId) {
  TONIO_currentPage = pageId;
  for (var mod in TONIO_NAV) {
    if (TONIO_NAV[mod].subs.find(function(s) { return s.page === pageId; })) {
      if (mod !== TONIO_currentModule) {
        TONIO_currentModule = mod;
        document.querySelectorAll('.nav-main-btn').forEach(function(b) { b.classList.remove('active'); });
        var mb = document.getElementById('nav-main-' + mod);
        if (mb) mb.classList.add('active');
      }
      break;
    }
  }
  TONIO_buildRow2(pageId);
  document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
  var target = document.getElementById('page-' + pageId);
  if (target) target.classList.add('active');
}

function TONIO_buildRow2(activePage) {
  var row2 = document.getElementById('nav-r2');
  if (!row2) return;
  var cfg = TONIO_NAV[TONIO_currentModule];
  var html = '';
  cfg.subs.forEach(function(s) {
    var cls = s.page === activePage ? 'active' : '';
    html += '<button class="nav-sub-btn ' + cls + '" onclick="TONIO_showPage(\'' + s.page + '\')">' + s.label + '</button>';
  });
  html += '<div style="flex:1"></div>';
  if (TONIO_PAGE_ACTIONS[activePage]) html += TONIO_PAGE_ACTIONS[activePage];
  row2.innerHTML = html;
}

function TONIO_toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebar-overlay').classList.toggle('open');
}
function TONIO_closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');
}

/* Tab generici */
function TONIO_setTab(containerId, tabId, btn) {
  var container = document.getElementById(containerId);
  if (!container) return;
  container.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
  container.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  var panel = document.getElementById(containerId + '-tab-' + tabId);
  if (panel) panel.classList.add('active');
}

function TONIO_escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

function TONIO_makeBadge(nome, colore) {
  return '<span class="badge" style="background:' + colore + '22;color:' + colore + ';border:1px solid ' + colore + '44">' + nome + '</span>';
}

/* ================================================================
   UTILITY localStorage — usata da tutti i moduli
   ================================================================ */
var TONIO_Storage = {
  save: function(key, data) {
    try {
      localStorage.setItem('tonio_' + key, JSON.stringify(data));
    } catch(e) {
      console.warn('TONIO Storage: impossibile salvare', key, e);
    }
  },
  load: function(key) {
    try {
      var raw = localStorage.getItem('tonio_' + key);
      return raw ? JSON.parse(raw) : null;
    } catch(e) {
      console.warn('TONIO Storage: impossibile caricare', key, e);
      return null;
    }
  }
};
