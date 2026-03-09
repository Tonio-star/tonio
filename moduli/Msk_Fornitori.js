/* ================================================================
   TONIO — Msk_Fornitori.js  |  Modulo Anagrafica Fornitori
   v1.1 — Aggiunto salvataggio localStorage (dati persistenti)
   ================================================================ */

var MSK_Fornitori = (function() {

  var tipologie  = [];
  var stati      = [];
  var fornitori  = [];
  var currentId  = null;
  var editMode   = false;
  var collabCnt  = 0;
  var annotCnt   = 0;
  var _searchTerm = '';

  /* ---- INIT ---- */
  function init() {
    /* Carica da localStorage (se presenti) o dai dati di default */
    var savedTipologie = TONIO_Storage.load('fornitori_tipologie');
    var savedStati     = TONIO_Storage.load('fornitori_stati');
    var savedFornitori = TONIO_Storage.load('fornitori');

    tipologie = (savedTipologie || window.TONIO_FORNITORI_TIPOLOGIE || []).map(function(x){ return Object.assign({},x); });
    stati     = (savedStati     || window.TONIO_FORNITORI_STATI     || []).map(function(x){ return Object.assign({},x); });
    fornitori = (savedFornitori || window.TONIO_FORNITORI           || []).map(function(x){ return Object.assign({},x,{
      attivo: x.attivo !== undefined ? x.attivo : true
    }); });
    renderLista();
  }

  /* ---- SALVATAGGIO PERSISTENTE ---- */
  function _persist() {
    TONIO_Storage.save('fornitori_tipologie', tipologie);
    TONIO_Storage.save('fornitori_stati', stati);
    TONIO_Storage.save('fornitori', fornitori);
  }

  /* ================================================================
     LISTA
     ================================================================ */
  function renderLista() {
    var page = document.getElementById('page-fornitori');
    if (!page) return;

    var filtered = fornitori.filter(function(c) {
      if (!_searchTerm) return true;
      var q = _searchTerm.toLowerCase();
      return (c.nominativo||'').toLowerCase().indexOf(q) > -1
          || (c.tipologia||'').toLowerCase().indexOf(q) > -1
          || (c.stato||'').toLowerCase().indexOf(q) > -1
          || (c.mail||'').toLowerCase().indexOf(q) > -1
          || (c.cellulare||'').toLowerCase().indexOf(q) > -1
          || (c.telefono||'').toLowerCase().indexOf(q) > -1;
    });

    var count = fornitori.length;
    var rows  = '';

    if (filtered.length === 0) {
      rows = '<tr><td colspan="6"><div class="empty-state">'
           + '<div class="es-icon">&#128295;</div>'
           + '<h3>' + (_searchTerm ? 'Nessun risultato' : 'Nessun fornitore') + '</h3>'
           + '<p>' + (_searchTerm ? 'Prova con un termine diverso' : 'Clicca &quot;+ Nuovo Fornitore&quot; per iniziare') + '</p>'
           + '</div></td></tr>';
    } else {
      filtered.forEach(function(c) {
        var ref = c.collaboratori && c.collaboratori.length > 0 ? c.collaboratori[0] : null;
        var refHtml = ref
          ? '<div class="td-sub">&#128100; ' + TONIO_escapeHtml(ref.nome) + (ref.ruolo ? ' &middot; ' + TONIO_escapeHtml(ref.ruolo) : '') + '</div>'
          : '';
        var refContact = ref
          ? '<div class="td-sub" style="margin-top:3px">' + TONIO_escapeHtml(ref.cellulare||ref.telefono||'') + (ref.mail ? ' &middot; ' + TONIO_escapeHtml(ref.mail) : '') + '</div>'
          : '';
        var tipoBadge  = c.tipologia ? TONIO_makeBadge(c.tipologia, _tipoColore(c.tipologia)) : '&mdash;';
        var statoBadge = c.stato     ? TONIO_makeBadge(c.stato, _statoColore(c.stato))         : '&mdash;';
        if (!c.attivo) statoBadge += ' <span class="badge" style="background:rgba(100,116,139,0.15);color:#64748b;border:1px solid rgba(100,116,139,0.3)">DISATTIVO</span>';
        var tel  = c.cellulare  || c.telefono  || '&mdash;';
        var tel2 = c.cellulare2 || c.telefono2 || '';
        var mailHtml  = c.mail  ? '<div class="td-contact">' + TONIO_escapeHtml(c.mail)  + '</div>' : '';
        var mailHtml2 = c.mail2 ? '<div class="td-contact" style="color:var(--text3)">' + TONIO_escapeHtml(c.mail2) + '</div>' : '';
        var noteHtml  = c.note  ? '<div class="td-note">' + TONIO_escapeHtml(c.note) + '</div>' : '&mdash;';
        var sel     = c.id === currentId ? 'selected' : '';
        var opacity = c.attivo === false ? 'opacity:0.55' : '';

        rows += '<tr class="' + sel + '" style="' + opacity + '" onclick="MSK_Fornitori.apriFornitore(' + c.id + ')">'
          + '<td><div class="td-name">' + TONIO_escapeHtml(c.nominativo) + '</div>' + refHtml + '</td>'
          + '<td>' + tipoBadge + '</td>'
          + '<td>' + statoBadge + '</td>'
          + '<td>'
          +   '<div class="td-contact">' + tel + '</div>'
          +   (tel2 ? '<div class="td-contact" style="color:var(--text3)">' + TONIO_escapeHtml(tel2) + '</div>' : '')
          +   mailHtml + mailHtml2
          +   refContact
          + '</td>'
          + '<td>' + noteHtml + '</td>'
          + '<td><button class="btn btn-danger btn-sm" onclick="event.stopPropagation();MSK_Fornitori.eliminaFornitore(' + c.id + ')" title="Elimina">&#128465;</button></td>'
          + '</tr>';
      });
    }

    page.innerHTML =
        '<div class="panel">'
      +   '<div class="panel-header">'
      +     '<div class="panel-header-icon">&#128295;</div>'
      +     '<div>'
      +       '<div class="panel-header-title">Fornitori</div>'
      +       '<div class="panel-header-sub">' + count + ' fornitore' + (count === 1 ? '' : 'i') + '</div>'
      +     '</div>'
      +     '<div class="panel-header-actions">'
      +       '<button class="btn btn-success btn-sm" onclick="MSK_Fornitori.openModalTipologie()">&#127991; Tipologie</button>'
      +       '<button class="btn btn-edit btn-sm"    onclick="MSK_Fornitori.openModalStati()">&#9679; Stati</button>'
      +     '</div>'
      +   '</div>'
      +   '<div class="search-bar-wrap">'
      +     '<div class="search-wrap">'
      +       '<span class="search-icon">&#128269;</span>'
      +       '<input class="search-input" id="fornitori-search" placeholder="Cerca per nome, tipologia, stato, contatto\u2026" value="' + TONIO_escapeHtml(_searchTerm) + '" oninput="MSK_Fornitori._onSearch(this.value)">'
      +     '</div>'
      +   '</div>'
      +   '<div class="tbl-wrap">'
      +     '<table>'
      +       '<thead><tr>'
      +         '<th>Nominativo / Referente</th>'
      +         '<th>Tipologia</th>'
      +         '<th>Stato</th>'
      +         '<th>Contatti</th>'
      +         '<th>Note</th>'
      +         '<th></th>'
      +       '</tr></thead>'
      +       '<tbody>' + rows + '</tbody>'
      +     '</table>'
      +   '</div>'
      + '</div>';
  }

  function _onSearch(val) {
    _searchTerm = val;
    renderLista();
    var el = document.getElementById('fornitori-search');
    if (el) { el.focus(); var l = el.value.length; el.setSelectionRange(l,l); }
  }

  /* ================================================================
     SCHEDA
     ================================================================ */
  function renderScheda(c, mode) {
    var page = document.getElementById('page-fornitori');
    if (!page) return;
    editMode  = mode || false;
    collabCnt = 0;
    annotCnt  = 0;

    var isNew = !c;
    var nom   = c ? TONIO_escapeHtml(c.nominativo) : 'Nuovo Fornitore';
    var sub   = c ? ((c.tipologia||'') + (c.stato ? ' \u00b7 '+c.stato : '')) : 'Inserimento nuovo fornitore';
    var v     = function(f){ return c ? TONIO_escapeHtml(c[f]||'') : ''; };
    var ro    = isNew ? '' : (editMode ? '' : ' readonly');
    var dis   = isNew ? '' : (editMode ? '' : ' disabled');

    var tipoOpts = '<option value="">\u2014 Seleziona \u2014</option>';
    tipologie.slice().sort(function(a,b){return a.ordine-b.ordine;}).forEach(function(t){
      tipoOpts += '<option value="' + TONIO_escapeHtml(t.nome) + '"'+(c&&c.tipologia===t.nome?' selected':'')+'>'+TONIO_escapeHtml(t.nome)+'</option>';
    });
    var statoOpts = '<option value="">\u2014 Seleziona \u2014</option>';
    stati.slice().sort(function(a,b){return a.ordine-b.ordine;}).forEach(function(s){
      statoOpts += '<option value="' + TONIO_escapeHtml(s.nome) + '"'+(c&&c.stato===s.nome?' selected':'')+'>'+TONIO_escapeHtml(s.nome)+'</option>';
    });

    var btnEdit     = !isNew && !editMode
      ? '<button class="btn btn-edit btn-sm" onclick="MSK_Fornitori._setEditMode(true)">&#9998; Modifica</button>' : '';
    var btnSalva    = isNew || editMode
      ? '<button class="btn btn-primary btn-sm" onclick="MSK_Fornitori.salva()">&#128190; Salva</button>' : '';
    var btnAnnulla  = !isNew && editMode
      ? '<button class="btn btn-ghost btn-sm" onclick="MSK_Fornitori._setEditMode(false)">&times; Annulla</button>' : '';
    var btnDisattiva = !isNew
      ? (c && c.attivo === false
          ? '<button class="btn btn-success btn-sm" onclick="MSK_Fornitori.toggleAttivo()">&#9989; Riattiva</button>'
          : '<button class="btn btn-warning btn-sm" onclick="MSK_Fornitori.toggleAttivo()">&#9208; Disattiva</button>')
      : '';
    var btnElimina  = !isNew
      ? '<button class="btn btn-danger btn-sm" onclick="MSK_Fornitori.eliminaCorrente()">&#128465; Elimina</button>' : '';

    var disattivoBar = (c && c.attivo === false)
      ? '<div style="background:rgba(100,116,139,0.15);border-bottom:1px solid rgba(100,116,139,0.2);padding:8px 20px;font-size:12px;color:#94a3b8;display:flex;align-items:center;gap:8px">&#9208; Questo fornitore \u00e8 disattivato e non viene considerato nelle operazioni</div>'
      : '';

    var stessiDatiOn  = c ? (c.fattStessiDati !== false) : true;
    var stessiDatiCls = stessiDatiOn ? 'on' : '';

    var collabAddBtn = '<button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="MSK_Fornitori.addCollab()">&#xFF0B; Aggiungi Collaboratore</button>';
    var annotAddBtn = (editMode||isNew)
      ? '<button class="annot-add-row" onclick="MSK_Fornitori.addAnnotazione()">&#xFF0B; Aggiungi annotazione</button>'
      : '';

    page.innerHTML =
        '<div class="panel">'

      + '<div class="panel-header" style="background:linear-gradient(135deg,#1a2e0d 0%,#2d5a1a 50%,#1a2e0d 100%);border-bottom:1px solid rgba(79,200,100,0.2);">'
      +   '<button class="btn btn-ghost btn-sm" onclick="MSK_Fornitori.tornaLista()" style="background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.2);color:#fff;flex-shrink:0">\u2190 Lista</button>'
      +   '<div class="panel-header-icon" style="background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.2)">&#128295;</div>'
      +   '<div style="min-width:0;flex:1">'
      +     '<div class="panel-header-title" id="scheda-forn-nome" style="color:#fff;font-size:19px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+nom+'</div>'
      +     '<div class="panel-header-sub"  id="scheda-forn-sub"  style="color:rgba(255,255,255,0.55)">'+sub+'</div>'
      +   '</div>'
      +   '<div class="panel-header-actions" style="flex-wrap:wrap;gap:6px">'
      +     btnEdit + btnAnnulla + btnDisattiva + btnElimina + btnSalva
      +   '</div>'
      + '</div>'

      + disattivoBar

      + '<div class="tabs-bar" id="sfb">'
      +   '<button class="tab-btn active" onclick="TONIO_setTab(\'sfbb\',\'principale\',this)">&#128203; Principale</button>'
      +   '<button class="tab-btn" onclick="TONIO_setTab(\'sfbb\',\'fiscali\',this)">&#127968; Dati Fiscali</button>'
      +   '<button class="tab-btn" onclick="TONIO_setTab(\'sfbb\',\'bancari\',this)">&#128179; Dati Bancari</button>'
      +   '<button class="tab-btn" onclick="TONIO_setTab(\'sfbb\',\'collaboratori\',this)">&#128101; Collaboratori</button>'
      +   '<button class="tab-btn" onclick="TONIO_setTab(\'sfbb\',\'annotazioni\',this)">&#128221; Annotazioni</button>'
      + '</div>'

      + '<div id="sfbb">'

      /* ===== TAB PRINCIPALE ===== */
      + '<div class="tab-panel active" id="sfbb-tab-principale">'

      + '<div style="padding:20px 20px 0">'
      +   '<div class="form-group">'
      +     '<label class="form-label">Ragione Sociale / Nominativo *</label>'
      +     '<input class="form-input" id="ff-nominativo" value="'+v('nominativo')+'" placeholder="Es. Rossi Mario / Azienda Srl"'+ro+' oninput="MSK_Fornitori.aggiornaHeader()">'
      +   '</div>'
      + '</div>'

      + '<div class="form-grid form-grid-2" style="padding:12px 20px 0">'
      +   '<div class="form-group"><label class="form-label">Tipologia</label>'
      +     '<select class="form-select" id="ff-tipo"'+dis+' onchange="MSK_Fornitori.aggiornaHeader()">'+tipoOpts+'</select></div>'
      +   '<div class="form-group"><label class="form-label">Stato</label>'
      +     '<select class="form-select" id="ff-stato"'+dis+' onchange="MSK_Fornitori.aggiornaHeader()">'+statoOpts+'</select></div>'
      + '</div>'

      + '<div style="padding:12px 20px 0">'
      +   '<div class="form-group"><label class="form-label">Note</label>'
      +     '<textarea class="form-textarea" id="ff-note" placeholder="Note libere\u2026"'+ro+'>'+v('note')+'</textarea></div>'
      + '</div>'

      + '<div style="padding:16px 20px 4px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text3);border-top:1px solid var(--border);margin-top:16px">&#128222; Contatti</div>'

      + '<div class="form-grid form-grid-2" style="padding:8px 20px 0">'
      +   '<div class="form-group"><label class="form-label">Cellulare 1</label>'
      +     '<input class="form-input" id="ff-cellulare"  value="'+v('cellulare')+'"  placeholder="+39 \u2026"'+ro+'></div>'
      +   '<div class="form-group"><label class="form-label">Cellulare 2</label>'
      +     '<input class="form-input" id="ff-cellulare2" value="'+v('cellulare2')+'" placeholder="+39 \u2026"'+ro+'></div>'
      + '</div>'

      + '<div class="form-grid form-grid-2" style="padding:12px 20px 0">'
      +   '<div class="form-group"><label class="form-label">Telefono 1</label>'
      +     '<input class="form-input" id="ff-telefono"  value="'+v('telefono')+'"  placeholder="+39 \u2026"'+ro+'></div>'
      +   '<div class="form-group"><label class="form-label">Telefono 2</label>'
      +     '<input class="form-input" id="ff-telefono2" value="'+v('telefono2')+'" placeholder="+39 \u2026"'+ro+'></div>'
      + '</div>'

      + '<div class="form-grid form-grid-2" style="padding:12px 20px 0">'
      +   '<div class="form-group"><label class="form-label">Mail 1</label>'
      +     '<input class="form-input" id="ff-mail"  type="email" value="'+v('mail')+'"  placeholder="esempio@mail.it"'+ro+'></div>'
      +   '<div class="form-group"><label class="form-label">Mail 2</label>'
      +     '<input class="form-input" id="ff-mail2" type="email" value="'+v('mail2')+'" placeholder="esempio@mail.it"'+ro+'></div>'
      + '</div>'

      + '<div class="form-grid form-grid-2" style="padding:12px 20px 0">'
      +   '<div class="form-group"><label class="form-label">PEC</label>'
      +     '<input class="form-input" id="ff-pec" type="email" value="'+v('pec')+'" placeholder="pec@esempio.it"'+ro+'></div>'
      +   '<div class="form-group"><label class="form-label">Home Page</label>'
      +     '<input class="form-input" id="ff-web" value="'+v('web')+'" placeholder="https://\u2026"'+ro+'></div>'
      + '</div>'

      + '<div style="padding:16px 20px 4px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text3);border-top:1px solid var(--border);margin-top:16px">&#128205; Indirizzo</div>'

      + '<div style="padding:8px 20px 0">'
      +   '<div class="form-group"><label class="form-label">Via</label>'
      +     '<input class="form-input" id="ff-via" value="'+v('via')+'" placeholder="Via Roma 1"'+ro+'></div>'
      + '</div>'

      + '<div class="form-grid form-grid-3" style="padding:12px 20px 0">'
      +   '<div class="form-group"><label class="form-label">Citt\u00e0</label>'
      +     '<input class="form-input" id="ff-citta" value="'+v('citta')+'" placeholder="Roma"'+ro+'></div>'
      +   '<div class="form-group"><label class="form-label">CAP</label>'
      +     '<input class="form-input" id="ff-cap" value="'+v('cap')+'" placeholder="00100"'+ro+'></div>'
      +   '<div class="form-group"><label class="form-label">Provincia</label>'
      +     '<input class="form-input" id="ff-prov" value="'+v('prov')+'" placeholder="RM" maxlength="3"'+ro+'></div>'
      + '</div>'

      + '<div style="padding:12px 20px 20px">'
      +   '<div class="form-group"><label class="form-label">Stato / Paese</label>'
      +     '<input class="form-input" id="ff-paese" value="'+(c&&c.paese?TONIO_escapeHtml(c.paese):'Italia')+'"'+ro+'></div>'
      + '</div>'

      + '</div>' /* /tab-principale */

      /* ===== TAB DATI FISCALI ===== */
      + '<div class="tab-panel" id="sfbb-tab-fiscali">'
      + '<div style="padding:18px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">'
      +   '<div>'
      +     '<div style="font-size:13px;font-weight:600;color:var(--text)">Stessi dati per fatturazione</div>'
      +     '<div style="font-size:12px;color:var(--text3);margin-top:2px">Se attivo, usa i dati della scheda principale</div>'
      +   '</div>'
      +   '<div class="toggle-switch" onclick="MSK_Fornitori._toggleStessiDati()">'
      +     '<div class="toggle-track '+stessiDatiCls+'" id="toggle-forn-stessi-track"><div class="toggle-thumb"></div></div>'
      +     '<span class="toggle-label" id="toggle-forn-stessi-lbl">'+(stessiDatiOn?'Attivo':'Disattivo')+'</span>'
      +   '</div>'
      + '</div>'
      + '<div id="fornitori-fiscali-fields" style="padding:20px;display:grid;gap:12px">'
      + _buildFiscaliFields(c, ro, dis, stessiDatiOn)
      + '</div>'
      + '</div>' /* /tab-fiscali */

      /* ===== TAB DATI BANCARI ===== */
      + '<div class="tab-panel" id="sfbb-tab-bancari">'
      + '<div class="form-grid" style="padding:20px">'
      + '<div class="form-group"><label class="form-label">Intestatario Conto</label>'
      +   '<input class="form-input" id="ff-intestatario" value="'+v('intestatario')+'" placeholder="Nome intestatario"'+ro+'></div>'
      + '<div class="form-group"><label class="form-label">Banca</label>'
      +   '<input class="form-input" id="ff-banca" value="'+v('banca')+'" placeholder="Nome banca"'+ro+'></div>'
      + '<div class="form-group"><label class="form-label">IBAN</label>'
      +   '<input class="form-input" id="ff-iban" value="'+v('iban')+'" placeholder="IT60 X054 2811 1010 0000 0123 456"'+ro+'></div>'
      + '<div class="form-group"><label class="form-label">BIC / Swift</label>'
      +   '<input class="form-input" id="ff-bic" value="'+v('bic')+'" placeholder="UNCRITM1\u2026"'+ro+'></div>'
      + '</div>'
      + '</div>' /* /tab-bancari */

      /* ===== TAB COLLABORATORI ===== */
      + '<div class="tab-panel" id="sfbb-tab-collaboratori">'
      + '<div style="padding:16px 20px">'
      + '<div id="forn-collab-list"></div>'
      + collabAddBtn
      + '</div>'
      + '</div>' /* /tab-collaboratori */

      /* ===== TAB ANNOTAZIONI ===== */
      + '<div class="tab-panel" id="sfbb-tab-annotazioni">'
      + '<div style="overflow-x:auto">'
      + '<table class="annot-table">'
      + '<thead><tr>'
      +   '<th>Destinatario</th>'
      +   '<th>Data</th>'
      +   '<th>N\u00b0 Prenotazione</th>'
      +   '<th>Ospite</th>'
      +   '<th>Descrizione</th>'
      +   '<th style="width:80px"></th>'
      + '</tr></thead>'
      + '<tbody id="forn-annot-tbody"></tbody>'
      + '</table>'
      + annotAddBtn
      + '</div>'
      + '</div>' /* /tab-annotazioni */

      + '</div>' /* /sfbb */
      + '</div>'; /* /panel */

    /* Popola subrecord */
    if (c && c.collaboratori) {
      c.collaboratori.forEach(function(col){ addCollab(col); });
    }
    if (c && c.annotazioni && Array.isArray(c.annotazioni)) {
      c.annotazioni.forEach(function(a){ addAnnotazione(a); });
    }
    if (!editMode && !isNew) _lockCollabFields();
  }

  /* ================================================================
     CAMPI FISCALI
     ================================================================ */
  function _buildFiscaliFields(c, ro, dis, stessiDati) {
    var v = function(f){ return c ? TONIO_escapeHtml(c[f]||'') : ''; };
    var roFatt = stessiDati ? ' readonly' : ro;
    var vFatt  = function(fiscale, principale) {
      if (stessiDati && c) return TONIO_escapeHtml(c[principale]||'');
      return c ? TONIO_escapeHtml(c[fiscale]||'') : '';
    };
    return ''
      + '<div class="form-grid form-grid-2">'
      +   '<div class="form-group"><label class="form-label">Nominativo Fatturazione</label>'
      +     '<input class="form-input" id="ff-fatt-nominativo" value="'+vFatt('fatt_nominativo','nominativo')+'" placeholder="Nome per fatturazione"'+roFatt+'></div>'
      +   '<div class="form-group"><label class="form-label">Codice Fiscale</label>'
      +     '<input class="form-input" id="ff-cf" value="'+v('cf')+'" placeholder="RSSMRA80A01H501Z"'+ro+'></div>'
      + '</div>'
      + '<div class="form-grid form-grid-2">'
      +   '<div class="form-group"><label class="form-label">Partita IVA</label>'
      +     '<input class="form-input" id="ff-piva" value="'+v('piva')+'" placeholder="01234567890"'+ro+'></div>'
      +   '<div class="form-group"><label class="form-label">Codice Univoco / SDI</label>'
      +     '<input class="form-input" id="ff-sdi" value="'+v('sdi')+'" placeholder="Codice SDI"'+ro+'></div>'
      + '</div>'
      + '<div class="form-grid form-grid-2">'
      +   '<div class="form-group"><label class="form-label">Cellulare 1</label>'
      +     '<input class="form-input" id="ff-fatt-cell" value="'+vFatt('fatt_cell','cellulare')+'" placeholder="+39 \u2026"'+roFatt+'></div>'
      +   '<div class="form-group"><label class="form-label">Telefono 1</label>'
      +     '<input class="form-input" id="ff-fatt-tel" value="'+vFatt('fatt_tel','telefono')+'" placeholder="+39 \u2026"'+roFatt+'></div>'
      + '</div>'
      + '<div class="form-grid form-grid-2">'
      +   '<div class="form-group"><label class="form-label">Mail 1</label>'
      +     '<input class="form-input" id="ff-fatt-mail" type="email" value="'+vFatt('fatt_mail','mail')+'" placeholder="mail@\u2026"'+roFatt+'></div>'
      +   '<div class="form-group"><label class="form-label">PEC</label>'
      +     '<input class="form-input" id="ff-fatt-pec" type="email" value="'+vFatt('fatt_pec','pec')+'" placeholder="pec@\u2026"'+roFatt+'></div>'
      + '</div>'
      + '<div class="form-group"><label class="form-label">Via / Indirizzo Fatturazione</label>'
      +   '<input class="form-input" id="ff-fatt-via" value="'+vFatt('fatt_via','via')+'" placeholder="Via \u2026"'+roFatt+'></div>'
      + '<div class="form-grid form-grid-3">'
      +   '<div class="form-group"><label class="form-label">Citt\u00e0</label>'
      +     '<input class="form-input" id="ff-fatt-citta" value="'+vFatt('fatt_citta','citta')+'" placeholder="Roma"'+roFatt+'></div>'
      +   '<div class="form-group"><label class="form-label">CAP</label>'
      +     '<input class="form-input" id="ff-fatt-cap" value="'+vFatt('fatt_cap','cap')+'" placeholder="00100"'+roFatt+'></div>'
      +   '<div class="form-group"><label class="form-label">Provincia</label>'
      +     '<input class="form-input" id="ff-fatt-prov" value="'+vFatt('fatt_prov','prov')+'" placeholder="RM" maxlength="3"'+roFatt+'></div>'
      + '</div>'
      + '<div class="form-group"><label class="form-label">Stato / Paese</label>'
      +   '<input class="form-input" id="ff-fatt-paese" value="'+(stessiDati&&c?TONIO_escapeHtml(c.paese||'Italia'):(c?TONIO_escapeHtml(c.fatt_paese||''):''))+'" placeholder="Italia"'+roFatt+'></div>'
      + '<div style="border-top:1px solid var(--border);padding-top:16px;margin-top:4px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text3)">&#9997; Firmatario Contratto</div>'
      + '<div class="form-group"><label class="form-label">Firmatario Contratto</label>'
      +   '<input class="form-input" id="ff-firmatario" value="'+v('firmatario')+'" placeholder="Nome e Cognome"'+ro+'></div>'
      + '<div class="form-grid form-grid-3">'
      +   '<div class="form-group"><label class="form-label">Citt\u00e0 di Nascita</label>'
      +     '<input class="form-input" id="ff-firmatario-citta" value="'+v('firmatario_citta')+'" placeholder="Roma"'+ro+'></div>'
      +   '<div class="form-group"><label class="form-label">Data di Nascita</label>'
      +     '<input class="form-input" id="ff-firmatario-data" type="date" value="'+v('firmatario_data')+'"'+ro+'></div>'
      +   '<div class="form-group"><label class="form-label">Codice Fiscale Firmatario</label>'
      +     '<input class="form-input" id="ff-firmatario-cf" value="'+v('firmatario_cf')+'" placeholder="RSSMRA80A01H501Z"'+ro+'></div>'
      + '</div>';
  }

  function _toggleStessiDati() {
    if (!editMode && currentId) return;
    var track = document.getElementById('toggle-forn-stessi-track');
    var lbl   = document.getElementById('toggle-forn-stessi-lbl');
    if (!track) return;
    var isOn = track.classList.toggle('on');
    if (lbl) lbl.textContent = isOn ? 'Attivo' : 'Disattivo';
    var c = currentId ? fornitori.find(function(x){return x.id===currentId;}) : null;
    var ro = editMode ? '' : ' readonly';
    var container = document.getElementById('fornitori-fiscali-fields');
    if (container) container.innerHTML = _buildFiscaliFields(c, ro, editMode?'':' disabled', isOn);
  }

  /* ================================================================
     EDIT MODE
     ================================================================ */
  function _setEditMode(on) {
    var c = currentId ? fornitori.find(function(x){return x.id===currentId;}) : null;
    renderScheda(c, on);
  }

  function _lockCollabFields() {
    var list = document.getElementById('forn-collab-list');
    if (!list) return;
    list.querySelectorAll('input,textarea,select').forEach(function(el){ el.setAttribute('readonly',''); });
    list.querySelectorAll('.collab-remove-btn').forEach(function(btn){ btn.style.display='none'; });
  }

  /* ================================================================
     AZIONI
     ================================================================ */
  function nuovoFornitore() {
    currentId = null;
    renderScheda(null, true);
    TONIO_showPage('fornitori');
  }

  function apriFornitore(id) {
    currentId = id;
    var c = fornitori.find(function(x){ return x.id === id; });
    if (!c) return;
    renderScheda(c, false);
    TONIO_showPage('fornitori');
  }

  function tornaLista() {
    currentId  = null;
    editMode   = false;
    renderLista();
    TONIO_showPage('fornitori');
  }

  function eliminaFornitore(id) {
    if (!confirm('Eliminare definitivamente questo fornitore?\nL\'operazione non pu\u00f2 essere annullata.')) return;
    fornitori = fornitori.filter(function(x){ return x.id !== id; });
    _persist();
    if (currentId === id) tornaLista(); else renderLista();
  }

  function eliminaCorrente() {
    if (!currentId) return;
    eliminaFornitore(currentId);
  }

  function toggleAttivo() {
    if (!currentId) return;
    var idx = fornitori.findIndex(function(x){return x.id===currentId;});
    if (idx < 0) return;
    fornitori[idx].attivo = !(fornitori[idx].attivo !== false);
    _persist();
    renderScheda(fornitori[idx], editMode);
  }

  /* ================================================================
     SALVA
     ================================================================ */
  function salva() {
    var nom = _val('ff-nominativo');
    if (!nom) { alert('Il campo Nominativo \u00e8 obbligatorio'); return; }

    var stessiDati = document.getElementById('toggle-forn-stessi-track')
      ? document.getElementById('toggle-forn-stessi-track').classList.contains('on')
      : true;

    var cell1 = _val('ff-cellulare');
    var tel1  = _val('ff-telefono');
    var mail1 = _val('ff-mail');
    var pec1  = _val('ff-pec');
    var via1  = _val('ff-via');
    var cit1  = _val('ff-citta');
    var cap1  = _val('ff-cap');
    var prv1  = _val('ff-prov');
    var pae1  = _val('ff-paese');

    var data = {
      nominativo:       nom,
      tipologia:        _val('ff-tipo'),
      stato:            _val('ff-stato'),
      note:             _val('ff-note'),
      cellulare:        cell1,
      cellulare2:       _val('ff-cellulare2'),
      telefono:         tel1,
      telefono2:        _val('ff-telefono2'),
      mail:             mail1,
      mail2:            _val('ff-mail2'),
      pec:              pec1,
      web:              _val('ff-web'),
      via:              via1,
      citta:            cit1,
      cap:              cap1,
      prov:             prv1,
      paese:            pae1,
      fattStessiDati:   stessiDati,
      fatt_nominativo:  stessiDati ? nom   : _val('ff-fatt-nominativo'),
      cf:               _val('ff-cf'),
      piva:             _val('ff-piva'),
      sdi:              _val('ff-sdi'),
      fatt_cell:        stessiDati ? cell1  : _val('ff-fatt-cell'),
      fatt_tel:         stessiDati ? tel1   : _val('ff-fatt-tel'),
      fatt_mail:        stessiDati ? mail1  : _val('ff-fatt-mail'),
      fatt_pec:         stessiDati ? pec1   : _val('ff-fatt-pec'),
      fatt_via:         stessiDati ? via1   : _val('ff-fatt-via'),
      fatt_citta:       stessiDati ? cit1   : _val('ff-fatt-citta'),
      fatt_cap:         stessiDati ? cap1   : _val('ff-fatt-cap'),
      fatt_prov:        stessiDati ? prv1   : _val('ff-fatt-prov'),
      fatt_paese:       stessiDati ? pae1   : _val('ff-fatt-paese'),
      firmatario:       _val('ff-firmatario'),
      firmatario_citta: _val('ff-firmatario-citta'),
      firmatario_data:  _val('ff-firmatario-data'),
      firmatario_cf:    _val('ff-firmatario-cf'),
      intestatario:     _val('ff-intestatario'),
      banca:            _val('ff-banca'),
      iban:             _val('ff-iban'),
      bic:              _val('ff-bic'),
      collaboratori:    _collectCollabs(),
      annotazioni:      _collectAnnotazioni()
    };

    if (currentId) {
      var idx = fornitori.findIndex(function(x){ return x.id === currentId; });
      if (idx > -1) {
        data.attivo = fornitori[idx].attivo !== undefined ? fornitori[idx].attivo : true;
        fornitori[idx] = Object.assign(fornitori[idx], data);
      }
    } else {
      var newId = fornitori.length > 0 ? Math.max.apply(null, fornitori.map(function(x){return x.id;})) + 1 : 1;
      data.id     = newId;
      data.attivo = true;
      fornitori.push(data);
      currentId = newId;
    }

    var saved = fornitori.find(function(x){return x.id===currentId;});
    _persist();
    renderScheda(saved, false);

    /* Flash verde header */
    var ph = document.querySelector('#page-fornitori .panel-header');
    if (ph) {
      ph.style.transition = 'background 0.4s';
      ph.style.background = 'linear-gradient(135deg,#0d3c1f 0%,#1a6e3a 50%,#0d3c1f 100%)';
      setTimeout(function(){
        ph.style.background = 'linear-gradient(135deg,#1a2e0d 0%,#2d5a1a 50%,#1a2e0d 100%)';
      }, 900);
    }
  }

  /* ================================================================
     COLLABORATORI
     ================================================================ */
  function addCollab(data) {
    collabCnt++;
    var idx  = collabCnt;
    var d    = data || {};
    var list = document.getElementById('forn-collab-list');
    if (!list) return;
    var isFirst = list.children.length === 0;
    var ro = (!editMode && currentId) ? ' readonly' : '';
    var div = document.createElement('div');
    div.className = 'collab-card';
    div.id = 'forn-collab-' + idx;
    div.innerHTML =
        '<div class="collab-card-header">'
      +   '<div class="collab-order-btns">'
      +     '<button class="collab-order-btn" onclick="MSK_Fornitori.moveCollab('+idx+',-1)">\u25b2</button>'
      +     '<button class="collab-order-btn" onclick="MSK_Fornitori.moveCollab('+idx+',1)">\u25bc</button>'
      +   '</div>'
      +   '<span class="collab-badge-ref" id="forn-collab-badge-'+idx+'">'+(isFirst?'REFERENTE':'#'+idx)+'</span>'
      +   '<button class="collab-remove-btn" onclick="MSK_Fornitori.removeCollab('+idx+')">\u26d4</button>'
      + '</div>'
      + '<div class="collab-grid">'
      +   '<div class="form-group" style="grid-column:1/-1"><label class="form-label">Nome e Cognome</label>'
      +     '<input class="form-input" id="forn-collab-nome-'+idx+'" value="'+TONIO_escapeHtml(d.nome||'')+'" placeholder="Nome Cognome"'+ro+'></div>'
      +   '<div class="form-group"><label class="form-label">Ruolo / Qualifica</label>'
      +     '<input class="form-input" id="forn-collab-ruolo-'+idx+'" value="'+TONIO_escapeHtml(d.ruolo||'')+'" placeholder="Es. Referente"'+ro+'></div>'
      +   '<div class="form-group"><label class="form-label">Cellulare</label>'
      +     '<input class="form-input" id="forn-collab-cell-'+idx+'" value="'+TONIO_escapeHtml(d.cellulare||'')+'" placeholder="+39 \u2026"'+ro+'></div>'
      +   '<div class="form-group"><label class="form-label">Telefono</label>'
      +     '<input class="form-input" id="forn-collab-tel-'+idx+'" value="'+TONIO_escapeHtml(d.telefono||'')+'" placeholder="+39 \u2026"'+ro+'></div>'
      +   '<div class="form-group"><label class="form-label">E-Mail</label>'
      +     '<input class="form-input" id="forn-collab-mail-'+idx+'" value="'+TONIO_escapeHtml(d.mail||'')+'" placeholder="mail@\u2026"'+ro+'></div>'
      +   '<div class="form-group" style="grid-column:1/-1"><label class="form-label">Note</label>'
      +     '<textarea class="form-textarea" id="forn-collab-note-'+idx+'" style="min-height:58px" placeholder="Note\u2026"'+ro+'>'+TONIO_escapeHtml(d.note||'')+'</textarea></div>'
      + '</div>';
    list.appendChild(div);
    _updateCollabBadges();
  }

  function removeCollab(idx) {
    var el = document.getElementById('forn-collab-' + idx);
    if (el) el.remove();
    _updateCollabBadges();
  }

  function moveCollab(idx, dir) {
    var list = document.getElementById('forn-collab-list');
    var el   = document.getElementById('forn-collab-' + idx);
    if (!el || !list) return;
    if (dir === -1 && el.previousElementSibling) list.insertBefore(el, el.previousElementSibling);
    else if (dir === 1 && el.nextElementSibling)  list.insertBefore(el.nextElementSibling, el);
    _updateCollabBadges();
  }

  function _updateCollabBadges() {
    var list = document.getElementById('forn-collab-list');
    if (!list) return;
    Array.from(list.children).forEach(function(card, i) {
      var n = card.id.replace('forn-collab-','');
      var badge = document.getElementById('forn-collab-badge-' + n);
      if (badge) badge.textContent = i === 0 ? 'REFERENTE' : '#' + (i+1);
    });
  }

  function _collectCollabs() {
    var list = document.getElementById('forn-collab-list');
    if (!list) return [];
    return Array.from(list.children).map(function(card, i) {
      var n = card.id.replace('forn-collab-','');
      var g = function(id){ var el=document.getElementById(id); return el?el.value.trim():''; };
      return { ordine:i+1, nome:g('forn-collab-nome-'+n), ruolo:g('forn-collab-ruolo-'+n),
               cellulare:g('forn-collab-cell-'+n), telefono:g('forn-collab-tel-'+n),
               mail:g('forn-collab-mail-'+n), note:g('forn-collab-note-'+n) };
    });
  }

  /* ================================================================
     ANNOTAZIONI
     ================================================================ */
  function addAnnotazione(data) {
    annotCnt++;
    var idx   = annotCnt;
    var d     = data || {};
    var tbody = document.getElementById('forn-annot-tbody');
    if (!tbody) return;
    var ro = (!editMode && currentId) ? ' readonly' : '';
    var delBtn = (editMode||!currentId)
      ? ' <button class="btn btn-danger btn-sm" onclick="MSK_Fornitori._delAnnotazione('+idx+')" title="Elimina">\u26d4</button>'
      : '';
    var tr = document.createElement('tr');
    tr.id = 'forn-annot-' + idx;
    tr.innerHTML =
        '<td><input class="form-input" style="min-width:130px" id="forn-annot-dest-'+idx+'" value="'+TONIO_escapeHtml(d.destinatario||'')+'" placeholder="Destinatario"'+ro+'></td>'
      + '<td><input class="form-input" type="date" style="min-width:130px" id="forn-annot-data-'+idx+'" value="'+(d.data||'')+'"'+ro+'></td>'
      + '<td><input class="form-input" style="min-width:110px" id="forn-annot-pren-'+idx+'" value="'+TONIO_escapeHtml(d.prenotazione||'')+'" placeholder="N\u00b0 Pren."'+ro+'></td>'
      + '<td><input class="form-input" style="min-width:120px" id="forn-annot-osp-'+idx+'"  value="'+TONIO_escapeHtml(d.ospite||'')+'" placeholder="Ospite"'+ro+'></td>'
      + '<td><input class="form-input" style="min-width:200px" id="forn-annot-desc-'+idx+'" value="'+TONIO_escapeHtml(d.descrizione||'')+'" placeholder="Descrizione"'+ro+'></td>'
      + '<td style="white-space:nowrap">'
      +   '<button class="btn btn-ghost btn-sm" onclick="MSK_Fornitori._stampaAnnotazione('+idx+')" title="Stampa">\u{1F5A8}</button>'
      +   delBtn
      + '</td>';
    tbody.appendChild(tr);
  }

  function _delAnnotazione(idx) {
    var el = document.getElementById('forn-annot-' + idx);
    if (el) el.remove();
  }

  function _stampaAnnotazione(idx) {
    var g = function(id){ var el=document.getElementById(id); return el?el.value:''; };
    var contenuto =
        'Destinatario: '   + g('forn-annot-dest-'+idx) + '\n'
      + 'Data: '           + g('forn-annot-data-'+idx) + '\n'
      + 'N\u00b0 Prenotazione: '+ g('forn-annot-pren-'+idx) + '\n'
      + 'Ospite: '         + g('forn-annot-osp-'+idx)  + '\n'
      + 'Descrizione: '    + g('forn-annot-desc-'+idx);
    var w = window.open('','_blank','width=600,height=400');
    if (!w) { alert('Abilita i popup per stampare'); return; }
    w.document.write('<html><body><pre style="font-family:sans-serif;padding:30px;font-size:14px">'+contenuto+'</pre></body></html>');
    w.document.close();
    w.print();
  }

  function _collectAnnotazioni() {
    var tbody = document.getElementById('forn-annot-tbody');
    if (!tbody) return [];
    return Array.from(tbody.children).map(function(tr) {
      var n = tr.id.replace('forn-annot-','');
      var g = function(id){ var el=document.getElementById(id); return el?el.value.trim():''; };
      return { destinatario:g('forn-annot-dest-'+n), data:g('forn-annot-data-'+n),
               prenotazione:g('forn-annot-pren-'+n), ospite:g('forn-annot-osp-'+n),
               descrizione:g('forn-annot-desc-'+n) };
    });
  }

  /* ================================================================
     MODAL TIPOLOGIE
     ================================================================ */
  function openModalTipologie() { _renderTipologieModal(); document.getElementById('modal-forn-tipologie').classList.add('open'); }
  function _renderTipologieModal() {
    var tbody=document.getElementById('forn-tipo-tbody');
    if(!tbody) return;
    tbody.innerHTML=tipologie.slice().sort(function(a,b){return a.ordine-b.ordine;}).map(function(t,i){
      return '<tr><td style="color:var(--text3);font-size:12px;width:30px">'+t.id+'</td>'
        +'<td style="width:72px"><button class="btn btn-ghost btn-sm" onclick="MSK_Fornitori._moveTipo('+i+',-1)">\u25b2</button> <button class="btn btn-ghost btn-sm" onclick="MSK_Fornitori._moveTipo('+i+',1)">\u25bc</button></td>'
        +'<td><input class="lookup-input" id="forn-tipo-nome-'+t.id+'" value="'+TONIO_escapeHtml(t.nome)+'"></td>'
        +'<td style="width:120px"><input type="color" class="color-swatch" id="forn-tipo-col-'+t.id+'" value="'+t.colore+'">'
        +'<span id="forn-tipo-prev-'+t.id+'" class="badge" style="margin-left:8px;background:'+t.colore+'22;color:'+t.colore+';border:1px solid '+t.colore+'44">'+TONIO_escapeHtml(t.nome)+'</span></td>'
        +'<td style="width:40px"><button class="btn btn-danger btn-sm" onclick="MSK_Fornitori._delTipo('+t.id+')">\u26d4</button></td></tr>';
    }).join('');
    tipologie.forEach(function(t){
      var col=document.getElementById('forn-tipo-col-'+t.id),nom=document.getElementById('forn-tipo-nome-'+t.id),prev=document.getElementById('forn-tipo-prev-'+t.id);
      if(col) col.addEventListener('input',function(){if(prev){prev.style.background=this.value+'22';prev.style.color=this.value;prev.style.borderColor=this.value+'44';}});
      if(nom) nom.addEventListener('input',function(){if(prev)prev.textContent=this.value;});
    });
  }
  function _moveTipo(idx,dir){var s=tipologie.slice().sort(function(a,b){return a.ordine-b.ordine;});var ni=idx+dir;if(ni<0||ni>=s.length)return;var t=s[idx].ordine;s[idx].ordine=s[ni].ordine;s[ni].ordine=t;_renderTipologieModal();}
  function _delTipo(id){if(!confirm('Eliminare?'))return;tipologie=tipologie.filter(function(x){return x.id!==id;});_renderTipologieModal();}
  function addTipologia(){var n=tipologie.length>0?Math.max.apply(null,tipologie.map(function(x){return x.id;}))+1:1;tipologie.push({id:n,ordine:tipologie.length+1,nome:'Nuova Tipologia',colore:'#4f8ef7'});_renderTipologieModal();}
  function saveTipologie(){tipologie=tipologie.map(function(t){return Object.assign({},t,{nome:(document.getElementById('forn-tipo-nome-'+t.id)||{}).value||t.nome,colore:(document.getElementById('forn-tipo-col-'+t.id)||{}).value||t.colore});});_persist();document.getElementById('modal-forn-tipologie').classList.remove('open');}

  /* ================================================================
     MODAL STATI
     ================================================================ */
  function openModalStati() { _renderStatiModal(); document.getElementById('modal-forn-stati').classList.add('open'); }
  function _renderStatiModal() {
    var tbody=document.getElementById('forn-stati-tbody');
    if(!tbody) return;
    tbody.innerHTML=stati.slice().sort(function(a,b){return a.ordine-b.ordine;}).map(function(s,i){
      return '<tr><td style="color:var(--text3);font-size:12px;width:30px">'+s.id+'</td>'
        +'<td style="width:72px"><button class="btn btn-ghost btn-sm" onclick="MSK_Fornitori._moveStato('+i+',-1)">\u25b2</button> <button class="btn btn-ghost btn-sm" onclick="MSK_Fornitori._moveStato('+i+',1)">\u25bc</button></td>'
        +'<td><input class="lookup-input" id="forn-stato-nome-'+s.id+'" value="'+TONIO_escapeHtml(s.nome)+'"></td>'
        +'<td style="width:120px"><input type="color" class="color-swatch" id="forn-stato-col-'+s.id+'" value="'+s.colore+'">'
        +'<span id="forn-stato-prev-'+s.id+'" class="badge" style="margin-left:8px;background:'+s.colore+'22;color:'+s.colore+';border:1px solid '+s.colore+'44">'+TONIO_escapeHtml(s.nome)+'</span></td>'
        +'<td style="width:40px"><button class="btn btn-danger btn-sm" onclick="MSK_Fornitori._delStato('+s.id+')">\u26d4</button></td></tr>';
    }).join('');
    stati.forEach(function(s){
      var col=document.getElementById('forn-stato-col-'+s.id),nom=document.getElementById('forn-stato-nome-'+s.id),prev=document.getElementById('forn-stato-prev-'+s.id);
      if(col) col.addEventListener('input',function(){if(prev){prev.style.background=this.value+'22';prev.style.color=this.value;prev.style.borderColor=this.value+'44';}});
      if(nom) nom.addEventListener('input',function(){if(prev)prev.textContent=this.value;});
    });
  }
  function _moveStato(idx,dir){var s=stati.slice().sort(function(a,b){return a.ordine-b.ordine;});var ni=idx+dir;if(ni<0||ni>=s.length)return;var t=s[idx].ordine;s[idx].ordine=s[ni].ordine;s[ni].ordine=t;_renderStatiModal();}
  function _delStato(id){if(!confirm('Eliminare?'))return;stati=stati.filter(function(x){return x.id!==id;});_renderStatiModal();}
  function addStato(){var n=stati.length>0?Math.max.apply(null,stati.map(function(x){return x.id;}))+1:1;stati.push({id:n,ordine:stati.length+1,nome:'Nuovo Stato',colore:'#34d399'});_renderStatiModal();}
  function saveStati(){stati=stati.map(function(s){return Object.assign({},s,{nome:(document.getElementById('forn-stato-nome-'+s.id)||{}).value||s.nome,colore:(document.getElementById('forn-stato-col-'+s.id)||{}).value||s.colore});});_persist();document.getElementById('modal-forn-stati').classList.remove('open');}

  /* ================================================================
     AGGIORNA HEADER LIVE
     ================================================================ */
  function aggiornaHeader() {
    var nom  =(document.getElementById('ff-nominativo')||{}).value||'Nuovo Fornitore';
    var tipo =(document.getElementById('ff-tipo')||{}).value||'';
    var stato=(document.getElementById('ff-stato')||{}).value||'';
    var hn=document.getElementById('scheda-forn-nome');
    var hs=document.getElementById('scheda-forn-sub');
    if(hn) hn.textContent=nom;
    if(hs) hs.textContent=[tipo,stato].filter(Boolean).join(' \u00b7 ')||'Scheda fornitore';
  }

  /* ===== HELPERS ===== */
  function _val(id){ var el=document.getElementById(id); return el?el.value.trim():''; }
  function _tipoColore(n){ var t=tipologie.find(function(x){return x.nome===n;}); return t?t.colore:'#64748b'; }
  function _statoColore(n){ var s=stati.find(function(x){return x.nome===n;}); return s?s.colore:'#64748b'; }

  /* ===== API PUBBLICA ===== */
  return {
    init:init, nuovoFornitore:nuovoFornitore, apriFornitore:apriFornitore,
    tornaLista:tornaLista, eliminaFornitore:eliminaFornitore,
    eliminaCorrente:eliminaCorrente, toggleAttivo:toggleAttivo,
    salva:salva, aggiornaHeader:aggiornaHeader,
    addCollab:function(d){addCollab(d);}, removeCollab:removeCollab, moveCollab:moveCollab,
    addAnnotazione:function(d){addAnnotazione(d);},
    _delAnnotazione:_delAnnotazione, _stampaAnnotazione:_stampaAnnotazione,
    openModalTipologie:openModalTipologie, openModalStati:openModalStati,
    addTipologia:addTipologia, saveTipologie:saveTipologie,
    addStato:addStato, saveStati:saveStati,
    _moveTipo:_moveTipo, _delTipo:_delTipo,
    _moveStato:_moveStato, _delStato:_delStato,
    _setEditMode:_setEditMode, _toggleStessiDati:_toggleStessiDati,
    _onSearch:_onSearch
  };
})();

/* Init viene chiamato da tonio-core.js nel DOMContentLoaded centralizzato */
