/* ================================================================
   TONIO — tonio-core.js  |  Navigazione e utility comuni
   ================================================================ */

var TONIO_NAV = {
  anagrafiche: {
    label: '👤 Anagrafiche',
    subs: [
      { label: '👥 Clienti',   page: 'clienti' },
      { label: '🧑 Ospiti',    page: 'ospiti' },
      { label: '🏠 Immobili',  page: 'immobili' },
      { label: '🔧 Fornitori', page: 'fornitori' },
    ]
  },
  operativo: {
    label: '📅 Operativo',
    subs: [
      { label: '📅 Prenotazioni', page: 'prenotazioni' },
      { label: '📄 Contratti',    page: 'contratti' },
    ]
  },
  contabilita: {
    label: '💰 Contabilità',
    subs: [
      { label: '💰 Incassi', page: 'incassi' },
      { label: '📊 Spese',   page: 'spese' },
      { label: '📈 Budget',  page: 'budget' },
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
  clienti: '<button class="nav-action-btn green"  onclick="MSK_Clienti.openModalTipologie()">🏷️ Tipologie</button>'
         + '<button class="nav-action-btn purple" onclick="MSK_Clienti.openModalStati()">🔵 Stati</button>'
         + '<button class="nav-action-btn primary" onclick="MSK_Clienti.nuovoCliente()">＋ Nuovo Cliente</button>'
};

var TONIO_currentModule = 'anagrafiche';
var TONIO_currentPage   = 'clienti';

document.addEventListener('DOMContentLoaded', function() {
  TONIO_setModule('anagrafiche', false);
  TONIO_showPage('clienti');
});

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

/* Tab generici — containerId è l'id del wrapper dei tab */
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
