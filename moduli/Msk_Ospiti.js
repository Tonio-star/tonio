/* ================================================================
   TONIO — Msk_Ospiti.js  |  Modulo Anagrafica Ospiti
   v2.0 — Aggiunta scheda Registrazione documento, rimosso Firmatario da Fiscali
   ================================================================ */

var MSK_Ospiti = (function() {

  var tipologie  = [];
  var stati      = [];
  var ospiti     = [];
  var currentId  = null;
  var editMode   = false;
  var annotCnt   = 0;
  var _searchTerm = '';

  /* ---- INIT ---- */
  function init() {
    /* Carica da localStorage (se presenti) o dai dati di default */
    var savedTipologie = TONIO_Storage.load('ospiti_tipologie');
    var savedStati     = TONIO_Storage.load('ospiti_stati');
    var savedOspiti    = TONIO_Storage.load('ospiti');

    tipologie = (savedTipologie || window.TONIO_OSPITI_TIPOLOGIE || []).map(function(x){ return Object.assign({},x); });
    stati     = (savedStati     || window.TONIO_OSPITI_STATI     || []).map(function(x){ return Object.assign({},x); });
    ospiti    = (savedOspiti    || window.TONIO_OSPITI           || []).map(function(x){ return Object.assign({},x,{
      attivo: x.attivo !== undefined ? x.attivo : true
    }); });
    renderLista();
  }

  /* ---- SALVATAGGIO PERSISTENTE ---- */
  function _persist() {
    TONIO_Storage.save('ospiti_tipologie', tipologie);
    TONIO_Storage.save('ospiti_stati', stati);
    TONIO_Storage.save('ospiti', ospiti);
  }

  /* ================================================================
     LISTA
     ================================================================ */
  function renderLista() {
    var page = document.getElementById('page-ospiti');
    if (!page) return;

    var filtered = ospiti.filter(function(c) {
      if (!_searchTerm) return true;
      var q = _searchTerm.toLowerCase();
      return (c.nominativo||'').toLowerCase().indexOf(q) > -1
          || (c.tipologia||'').toLowerCase().indexOf(q) > -1
          || (c.stato||'').toLowerCase().indexOf(q) > -1
          || (c.mail||'').toLowerCase().indexOf(q) > -1
          || (c.cellulare||'').toLowerCase().indexOf(q) > -1
          || (c.telefono||'').toLowerCase().indexOf(q) > -1;
    });

    var count = ospiti.length;
    var rows  = '';

    if (filtered.length === 0) {
      rows = '<tr><td colspan="6"><div class="empty-state">'
           + '<div class="es-icon">&#129489;</div>'
           + '<h3>' + (_searchTerm ? 'Nessun risultato' : 'Nessun ospite') + '</h3>'
           + '<p>' + (_searchTerm ? 'Prova con un termine diverso' : 'Clicca &quot;+ Nuovo Ospite&quot; per iniziare') + '</p>'
           + '</div></td></tr>';
    } else {
      filtered.forEach(function(c) {
        var tipoBadge  = c.tipologia ? TONIO_makeBadge(c.tipologia, _tipoColore(c.tipologia)) : '&mdash;';
        var statoBadge = c.stato     ? TONIO_makeBadge(c.stato, _statoColore(c.stato))         : '&mdash;';
        if (!c.attivo) statoBadge += ' <span class="badge" style="background:rgba(100,116,139,0.15);color:#64748b;border:1px solid rgba(100,116,139,0.3)">DISATTIVO</span>';
        var tel      = c.cellulare  || c.telefono  || '&mdash;';
        var tel2     = c.cellulare2 || c.telefono2 || '';
        var mailHtml  = c.mail  ? '<div class="td-contact">' + TONIO_escapeHtml(c.mail)  + '</div>' : '';
        var mailHtml2 = c.mail2 ? '<div class="td-contact" style="color:var(--text3)">' + TONIO_escapeHtml(c.mail2) + '</div>' : '';
        var noteHtml  = c.note  ? '<div class="td-note">' + TONIO_escapeHtml(c.note) + '</div>' : '&mdash;';
        var sel     = c.id === currentId ? 'selected' : '';
        var opacity = c.attivo === false ? 'opacity:0.55' : '';

        rows += '<tr class="' + sel + '" style="' + opacity + '" onclick="MSK_Ospiti.apriOspite(' + c.id + ')">'
          + '<td><div class="td-name">' + TONIO_escapeHtml(c.nominativo) + '</div></td>'
          + '<td>' + tipoBadge + '</td>'
          + '<td>' + statoBadge + '</td>'
          + '<td>'
          +   '<div class="td-contact">' + tel + '</div>'
          +   (tel2 ? '<div class="td-contact" style="color:var(--text3)">' + TONIO_escapeHtml(tel2) + '</div>' : '')
          +   mailHtml + mailHtml2
          + '</td>'
          + '<td>' + noteHtml + '</td>'
          + '<td><button class="btn btn-danger btn-sm" onclick="event.stopPropagation();MSK_Ospiti.eliminaOspite(' + c.id + ')" title="Elimina">&#128465;</button></td>'
          + '</tr>';
      });
    }

    page.innerHTML =
        '<div class="panel">'
      +   '<div class="panel-header">'
      +     '<div class="panel-header-icon">&#129489;</div>'
      +     '<div>'
      +       '<div class="panel-header-title">Ospiti</div>'
      +       '<div class="panel-header-sub">' + count + ' ospit' + (count === 1 ? 'e' : 'i') + '</div>'
      +     '</div>'
      +     '<div class="panel-header-actions">'
      +       '<button class="btn btn-success btn-sm" onclick="MSK_Ospiti.openModalTipologie()">&#127991; Tipologie</button>'
      +       '<button class="btn btn-edit btn-sm"    onclick="MSK_Ospiti.openModalStati()">&#9679; Stati</button>'
      +     '</div>'
      +   '</div>'
      +   '<div class="search-bar-wrap">'
      +     '<div class="search-wrap">'
      +       '<span class="search-icon">&#128269;</span>'
      +       '<input class="search-input" id="ospiti-search" placeholder="Cerca per nome, tipologia, stato, contatto\u2026" value="' + TONIO_escapeHtml(_searchTerm) + '" oninput="MSK_Ospiti._onSearch(this.value)">'
      +     '</div>'
      +   '</div>'
      +   '<div class="tbl-wrap">'
      +     '<table>'
      +       '<thead><tr>'
      +         '<th>Nominativo</th>'
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
    var el = document.getElementById('ospiti-search');
    if (el) { el.focus(); var l = el.value.length; el.setSelectionRange(l,l); }
  }

  /* ================================================================
     SCHEDA
     ================================================================ */
  function renderScheda(c, mode) {
    var page = document.getElementById('page-ospiti');
    if (!page) return;
    editMode = mode || false;
    annotCnt = 0;

    var isNew = !c;
    var nom   = c ? TONIO_escapeHtml(c.nominativo) : 'Nuovo Ospite';
    var sub   = c ? ((c.tipologia||'') + (c.stato ? ' \u00b7 '+c.stato : '')) : 'Inserimento nuovo ospite';
    var v     = function(f){ return c ? TONIO_escapeHtml(c[f]||'') : ''; };
    var ro    = isNew ? '' : (editMode ? '' : ' readonly');
    var dis   = isNew ? '' : (editMode ? '' : ' disabled');

    var tipoOpts = '<option value="">\u2014 Seleziona \u2014</option>';
    tipologie.slice().sort(function(a,b){return a.ordine-b.ordine;}).forEach(function(t){
      tipoOpts += '<option value="'+TONIO_escapeHtml(t.nome)+'"'+(c&&c.tipologia===t.nome?' selected':'')+'>'+TONIO_escapeHtml(t.nome)+'</option>';
    });
    var statoOpts = '<option value="">\u2014 Seleziona \u2014</option>';
    stati.slice().sort(function(a,b){return a.ordine-b.ordine;}).forEach(function(s){
      statoOpts += '<option value="'+TONIO_escapeHtml(s.nome)+'"'+(c&&c.stato===s.nome?' selected':'')+'>'+TONIO_escapeHtml(s.nome)+'</option>';
    });

    /* Opzioni tipo documento */
    var docTipi = ['Carta d\'Identità','Passaporto','Patente di Guida','Permesso di Soggiorno','Altro'];
    var docTipoOpts = '<option value="">\u2014 Seleziona \u2014</option>';
    docTipi.forEach(function(t){
      docTipoOpts += '<option value="'+TONIO_escapeHtml(t)+'"'+(c&&c.doc_tipo===t?' selected':'')+'>'+TONIO_escapeHtml(t)+'</option>';
    });
    var sessoOpts = ''
      + '<option value="">\u2014</option>'
      + '<option value="M"'+(c&&c.doc_sesso==='M'?' selected':'')+'>M</option>'
      + '<option value="F"'+(c&&c.doc_sesso==='F'?' selected':'')+'>F</option>';

    var btnEdit     = !isNew && !editMode
      ? '<button class="btn btn-edit btn-sm" onclick="MSK_Ospiti._setEditMode(true)">&#9998; Modifica</button>' : '';
    var btnSalva    = isNew || editMode
      ? '<button class="btn btn-primary btn-sm" onclick="MSK_Ospiti.salva()">&#128190; Salva</button>' : '';
    var btnAnnulla  = !isNew && editMode
      ? '<button class="btn btn-ghost btn-sm" onclick="MSK_Ospiti._setEditMode(false)">&times; Annulla</button>' : '';
    var btnDisattiva = !isNew
      ? (c && c.attivo === false
          ? '<button class="btn btn-success btn-sm" onclick="MSK_Ospiti.toggleAttivo()">&#9989; Riattiva</button>'
          : '<button class="btn btn-warning btn-sm" onclick="MSK_Ospiti.toggleAttivo()">&#9208; Disattiva</button>')
      : '';
    var btnElimina  = !isNew
      ? '<button class="btn btn-danger btn-sm" onclick="MSK_Ospiti.eliminaCorrente()">&#128465; Elimina</button>' : '';

    var disattivoBar = (c && c.attivo === false)
      ? '<div style="background:rgba(100,116,139,0.15);border-bottom:1px solid rgba(100,116,139,0.2);padding:8px 20px;font-size:12px;color:#94a3b8;display:flex;align-items:center;gap:8px">&#9208; Questo ospite \u00e8 disattivato e non viene considerato nelle operazioni</div>'
      : '';

    var stessiDatiOn  = c ? (c.fattStessiDati !== false) : true;
    var stessiDatiCls = stessiDatiOn ? 'on' : '';

    var annotAddBtn = (editMode||isNew)
      ? '<button class="annot-add-row" onclick="MSK_Ospiti.addAnnotazione()">&#xFF0B; Aggiungi annotazione</button>'
      : '';

    page.innerHTML =
        '<div class="panel">'

      /* ===== HEADER ===== */
      + '<div class="panel-header" style="background:linear-gradient(135deg,#1a0d3c 0%,#3a1a6e 50%,#1a0d3c 100%);border-bottom:1px solid rgba(167,139,250,0.2);">'
      +   '<button class="btn btn-ghost btn-sm" onclick="MSK_Ospiti.tornaLista()" style="background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.2);color:#fff;flex-shrink:0">\u2190 Lista</button>'
      +   '<div class="panel-header-icon" style="background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.2)">&#129489;</div>'
      +   '<div style="min-width:0;flex:1">'
      +     '<div class="panel-header-title" id="scheda-osp-nome" style="color:#fff;font-size:19px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+nom+'</div>'
      +     '<div class="panel-header-sub"  id="scheda-osp-sub"  style="color:rgba(255,255,255,0.55)">'+sub+'</div>'
      +   '</div>'
      +   '<div class="panel-header-actions" style="flex-wrap:wrap;gap:6px">'
      +     btnEdit + btnAnnulla + btnDisattiva + btnElimina + btnSalva
      +   '</div>'
      + '</div>'

      + disattivoBar

      /* ===== TAB BAR ===== */
      + '<div class="tabs-bar" id="sob">'
      +   '<button class="tab-btn active" onclick="TONIO_setTab(\'sobb\',\'principale\',this)">&#128203; Principale</button>'
      +   '<button class="tab-btn" onclick="TONIO_setTab(\'sobb\',\'registrazione\',this)">&#128196; Registrazione</button>'
      +   '<button class="tab-btn" onclick="TONIO_setTab(\'sobb\',\'fiscali\',this)">&#127968; Dati Fiscali</button>'
      +   '<button class="tab-btn" onclick="TONIO_setTab(\'sobb\',\'bancari\',this)">&#128179; Dati Bancari</button>'
      +   '<button class="tab-btn" onclick="TONIO_setTab(\'sobb\',\'annotazioni\',this)">&#128221; Annotazioni</button>'
      + '</div>'

      + '<div id="sobb">'

      /* ===== TAB PRINCIPALE ===== */
      + '<div class="tab-panel active" id="sobb-tab-principale">'
      + '<div style="padding:20px 20px 0">'
      +   '<div class="form-group">'
      +     '<label class="form-label">Ragione Sociale / Nominativo *</label>'
      +     '<input class="form-input" id="fo-nominativo" value="'+v('nominativo')+'" placeholder="Es. Ferrari Luca"'+ro+' oninput="MSK_Ospiti.aggiornaHeader()">'
      +   '</div>'
      + '</div>'
      + '<div class="form-grid form-grid-2" style="padding:12px 20px 0">'
      +   '<div class="form-group"><label class="form-label">Tipologia</label>'
      +     '<select class="form-select" id="fo-tipo"'+dis+' onchange="MSK_Ospiti.aggiornaHeader()">'+tipoOpts+'</select></div>'
      +   '<div class="form-group"><label class="form-label">Stato</label>'
      +     '<select class="form-select" id="fo-stato"'+dis+' onchange="MSK_Ospiti.aggiornaHeader()">'+statoOpts+'</select></div>'
      + '</div>'
      + '<div style="padding:12px 20px 0">'
      +   '<div class="form-group"><label class="form-label">Note</label>'
      +     '<textarea class="form-textarea" id="fo-note" placeholder="Note libere\u2026"'+ro+'>'+v('note')+'</textarea></div>'
      + '</div>'
      + '<div style="padding:16px 20px 4px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text3);border-top:1px solid var(--border);margin-top:16px">&#128222; Contatti</div>'
      + '<div class="form-grid form-grid-2" style="padding:8px 20px 0">'
      +   '<div class="form-group"><label class="form-label">Cellulare 1</label><input class="form-input" id="fo-cellulare"  value="'+v('cellulare')+'"  placeholder="+39 \u2026"'+ro+'></div>'
      +   '<div class="form-group"><label class="form-label">Cellulare 2</label><input class="form-input" id="fo-cellulare2" value="'+v('cellulare2')+'" placeholder="+39 \u2026"'+ro+'></div>'
      + '</div>'
      + '<div class="form-grid form-grid-2" style="padding:12px 20px 0">'
      +   '<div class="form-group"><label class="form-label">Telefono 1</label><input class="form-input" id="fo-telefono"  value="'+v('telefono')+'"  placeholder="+39 \u2026"'+ro+'></div>'
      +   '<div class="form-group"><label class="form-label">Telefono 2</label><input class="form-input" id="fo-telefono2" value="'+v('telefono2')+'" placeholder="+39 \u2026"'+ro+'></div>'
      + '</div>'
      + '<div class="form-grid form-grid-2" style="padding:12px 20px 0">'
      +   '<div class="form-group"><label class="form-label">Mail 1</label><input class="form-input" id="fo-mail"  type="email" value="'+v('mail')+'"  placeholder="esempio@mail.it"'+ro+'></div>'
      +   '<div class="form-group"><label class="form-label">Mail 2</label><input class="form-input" id="fo-mail2" type="email" value="'+v('mail2')+'" placeholder="esempio@mail.it"'+ro+'></div>'
      + '</div>'
      + '<div class="form-grid form-grid-2" style="padding:12px 20px 0">'
      +   '<div class="form-group"><label class="form-label">PEC</label><input class="form-input" id="fo-pec" type="email" value="'+v('pec')+'" placeholder="pec@esempio.it"'+ro+'></div>'
      +   '<div class="form-group"><label class="form-label">Home Page</label><input class="form-input" id="fo-web" value="'+v('web')+'" placeholder="https://\u2026"'+ro+'></div>'
      + '</div>'
      + '<div style="padding:16px 20px 4px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text3);border-top:1px solid var(--border);margin-top:16px">&#128205; Indirizzo</div>'
      + '<div style="padding:8px 20px 0">'
      +   '<div class="form-group"><label class="form-label">Via</label><input class="form-input" id="fo-via" value="'+v('via')+'" placeholder="Via Roma 1"'+ro+'></div>'
      + '</div>'
      + '<div class="form-grid form-grid-3" style="padding:12px 20px 0">'
      +   '<div class="form-group"><label class="form-label">Citt\u00e0</label><input class="form-input" id="fo-citta" value="'+v('citta')+'" placeholder="Roma"'+ro+'></div>'
      +   '<div class="form-group"><label class="form-label">CAP</label><input class="form-input" id="fo-cap" value="'+v('cap')+'" placeholder="00100"'+ro+'></div>'
      +   '<div class="form-group"><label class="form-label">Provincia</label><input class="form-input" id="fo-prov" value="'+v('prov')+'" placeholder="RM" maxlength="3"'+ro+'></div>'
      + '</div>'
      + '<div style="padding:12px 20px 20px">'
      +   '<div class="form-group"><label class="form-label">Stato / Paese</label><input class="form-input" id="fo-paese" value="'+(c&&c.paese?TONIO_escapeHtml(c.paese):'Italia')+'"'+ro+'></div>'
      + '</div>'
      + '</div>' /* /tab-principale */

      /* ===== TAB REGISTRAZIONE ===== */
      + '<div class="tab-panel" id="sobb-tab-registrazione">'
      + '<div style="padding:16px 20px 4px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text3);margin-top:8px">&#128196; Documento di Identit\u00e0</div>'
      + '<div class="form-grid form-grid-2" style="padding:12px 20px 0">'
      +   '<div class="form-group"><label class="form-label">Tipo Documento</label>'
      +     '<select class="form-select" id="fo-doc-tipo"'+dis+'>'+docTipoOpts+'</select></div>'
      +   '<div class="form-group"><label class="form-label">N\u00b0 Documento</label>'
      +     '<input class="form-input" id="fo-doc-numero" value="'+v('doc_numero')+'" placeholder="Es. CA12345678"'+ro+'></div>'
      + '</div>'
      + '<div class="form-grid form-grid-2" style="padding:12px 20px 0">'
      +   '<div class="form-group"><label class="form-label">Ente di Rilascio</label>'
      +     '<input class="form-input" id="fo-doc-ente" value="'+v('doc_ente')+'" placeholder="Es. Comune di Roma"'+ro+'></div>'
      +   '<div class="form-group"><label class="form-label">Localit\u00e0 Rilascio</label>'
      +     '<input class="form-input" id="fo-doc-localita" value="'+v('doc_localita')+'" placeholder="Es. Roma"'+ro+'></div>'
      + '</div>'
      + '<div class="form-grid form-grid-2" style="padding:12px 20px 0">'
      +   '<div class="form-group"><label class="form-label">Data Emissione</label>'
      +     '<input class="form-input" type="date" id="fo-doc-emissione" value="'+v('doc_emissione')+'"'+ro+'></div>'
      +   '<div class="form-group"><label class="form-label">Data Scadenza</label>'
      +     '<input class="form-input" type="date" id="fo-doc-scadenza" value="'+v('doc_scadenza')+'"'+ro+'></div>'
      + '</div>'
      + '<div style="padding:16px 20px 4px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text3);border-top:1px solid var(--border);margin-top:16px">&#127919; Dati Anagrafici</div>'
      + '<div class="form-grid form-grid-2" style="padding:12px 20px 0">'
      +   '<div class="form-group"><label class="form-label">Luogo di Nascita</label>'
      +     '<input class="form-input" id="fo-doc-luogo-nascita" value="'+v('doc_luogo_nascita')+'" placeholder="Es. Roma"'+ro+'></div>'
      +   '<div class="form-group"><label class="form-label">Provincia Nascita</label>'
      +     '<input class="form-input" id="fo-doc-prov-nascita" value="'+v('doc_prov_nascita')+'" placeholder="RM" maxlength="3"'+ro+'></div>'
      + '</div>'
      + '<div class="form-grid form-grid-3" style="padding:12px 20px 20px">'
      +   '<div class="form-group"><label class="form-label">Data di Nascita</label>'
      +     '<input class="form-input" type="date" id="fo-doc-data-nascita" value="'+v('doc_data_nascita')+'"'+ro+'></div>'
      +   '<div class="form-group"><label class="form-label">Sesso</label>'
      +     '<select class="form-select" id="fo-doc-sesso"'+dis+'>'+sessoOpts+'</select></div>'
      +   '<div class="form-group"><label class="form-label">Stato / Nazionalit\u00e0</label>'
      +     '<input class="form-input" id="fo-doc-stato" value="'+(c&&c.doc_stato?TONIO_escapeHtml(c.doc_stato):'Italia')+'" placeholder="Italia"'+ro+'></div>'
      + '</div>'
      + '</div>' /* /tab-registrazione */

      /* ===== TAB DATI FISCALI ===== */
      + '<div class="tab-panel" id="sobb-tab-fiscali">'
      + '<div style="padding:18px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">'
      +   '<div>'
      +     '<div style="font-size:13px;font-weight:600;color:var(--text)">Stessi dati per fatturazione</div>'
      +     '<div style="font-size:12px;color:var(--text3);margin-top:2px">Se attivo, usa i dati della scheda principale</div>'
      +   '</div>'
      +   '<div class="toggle-switch" onclick="MSK_Ospiti._toggleStessiDati()">'
      +     '<div class="toggle-track '+stessiDatiCls+'" id="toggle-osp-stessi-track"><div class="toggle-thumb"></div></div>'
      +     '<span class="toggle-label" id="toggle-osp-stessi-lbl">'+(stessiDatiOn?'Attivo':'Disattivo')+'</span>'
      +   '</div>'
      + '</div>'
      + '<div id="ospiti-fiscali-fields" style="padding:20px;display:grid;gap:12px">'
      + _buildFiscaliFields(c, ro, dis, stessiDatiOn)
      + '</div>'
      + '</div>' /* /tab-fiscali */

      /* ===== TAB DATI BANCARI ===== */
      + '<div class="tab-panel" id="sobb-tab-bancari">'
      + '<div class="form-grid" style="padding:20px">'
      + '<div class="form-group"><label class="form-label">Intestatario Conto</label>'
      +   '<input class="form-input" id="fo-intestatario" value="'+v('intestatario')+'" placeholder="Nome intestatario"'+ro+'></div>'
      + '<div class="form-group"><label class="form-label">Banca</label>'
      +   '<input class="form-input" id="fo-banca" value="'+v('banca')+'" placeholder="Nome banca"'+ro+'></div>'
      + '<div class="form-group"><label class="form-label">IBAN</label>'
      +   '<input class="form-input" id="fo-iban" value="'+v('iban')+'" placeholder="IT60 X054 2811 1010 0000 0123 456"'+ro+'></div>'
      + '<div class="form-group"><label class="form-label">BIC / Swift</label>'
      +   '<input class="form-input" id="fo-bic" value="'+v('bic')+'" placeholder="UNCRITM1\u2026"'+ro+'></div>'
      + '</div>'
      + '</div>' /* /tab-bancari */

      /* ===== TAB ANNOTAZIONI ===== */
      + '<div class="tab-panel" id="sobb-tab-annotazioni">'
      + '<div style="overflow-x:auto">'
      + '<table class="annot-table">'
      + '<thead><tr>'
      +   '<th>Destinatario</th><th>Data</th><th>N\u00b0 Prenotazione</th>'
      +   '<th>Ospite</th><th>Descrizione</th><th style="width:80px"></th>'
      + '</tr></thead>'
      + '<tbody id="osp-annot-tbody"></tbody>'
      + '</table>'
      + annotAddBtn
      + '</div>'
      + '</div>' /* /tab-annotazioni */

      + '</div>' /* /sobb */
      + '</div>'; /* /panel */

    /* Popola annotazioni */
    if (c && c.annotazioni && Array.isArray(c.annotazioni)) {
      c.annotazioni.forEach(function(a){ addAnnotazione(a); });
    }
  }

  /* ================================================================
     CAMPI FISCALI (senza sezione Firmatario)
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
      +     '<input class="form-input" id="fo-fatt-nominativo" value="'+vFatt('fatt_nominativo','nominativo')+'" placeholder="Nome per fatturazione"'+roFatt+'></div>'
      +   '<div class="form-group"><label class="form-label">Codice Fiscale</label>'
      +     '<input class="form-input" id="fo-cf" value="'+v('cf')+'" placeholder="RSSMRA80A01H501Z"'+ro+'></div>'
      + '</div>'
      + '<div class="form-grid form-grid-2">'
      +   '<div class="form-group"><label class="form-label">Partita IVA</label>'
      +     '<input class="form-input" id="fo-piva" value="'+v('piva')+'" placeholder="01234567890"'+ro+'></div>'
      +   '<div class="form-group"><label class="form-label">Codice Univoco / SDI</label>'
      +     '<input class="form-input" id="fo-sdi" value="'+v('sdi')+'" placeholder="Codice SDI"'+ro+'></div>'
      + '</div>'
      + '<div class="form-grid form-grid-2">'
      +   '<div class="form-group"><label class="form-label">Cellulare 1</label>'
      +     '<input class="form-input" id="fo-fatt-cell" value="'+vFatt('fatt_cell','cellulare')+'" placeholder="+39 \u2026"'+roFatt+'></div>'
      +   '<div class="form-group"><label class="form-label">Telefono 1</label>'
      +     '<input class="form-input" id="fo-fatt-tel" value="'+vFatt('fatt_tel','telefono')+'" placeholder="+39 \u2026"'+roFatt+'></div>'
      + '</div>'
      + '<div class="form-grid form-grid-2">'
      +   '<div class="form-group"><label class="form-label">Mail 1</label>'
      +     '<input class="form-input" id="fo-fatt-mail" type="email" value="'+vFatt('fatt_mail','mail')+'" placeholder="mail@\u2026"'+roFatt+'></div>'
      +   '<div class="form-group"><label class="form-label">PEC</label>'
      +     '<input class="form-input" id="fo-fatt-pec" type="email" value="'+vFatt('fatt_pec','pec')+'" placeholder="pec@\u2026"'+roFatt+'></div>'
      + '</div>'
      + '<div class="form-group"><label class="form-label">Via / Indirizzo Fatturazione</label>'
      +   '<input class="form-input" id="fo-fatt-via" value="'+vFatt('fatt_via','via')+'" placeholder="Via \u2026"'+roFatt+'></div>'
      + '<div class="form-grid form-grid-3">'
      +   '<div class="form-group"><label class="form-label">Citt\u00e0</label>'
      +     '<input class="form-input" id="fo-fatt-citta" value="'+vFatt('fatt_citta','citta')+'" placeholder="Roma"'+roFatt+'></div>'
      +   '<div class="form-group"><label class="form-label">CAP</label>'
      +     '<input class="form-input" id="fo-fatt-cap" value="'+vFatt('fatt_cap','cap')+'" placeholder="00100"'+roFatt+'></div>'
      +   '<div class="form-group"><label class="form-label">Provincia</label>'
      +     '<input class="form-input" id="fo-fatt-prov" value="'+vFatt('fatt_prov','prov')+'" placeholder="RM" maxlength="3"'+roFatt+'></div>'
      + '</div>'
      + '<div class="form-group"><label class="form-label">Stato / Paese</label>'
      +   '<input class="form-input" id="fo-fatt-paese" value="'+(stessiDati&&c?TONIO_escapeHtml(c.paese||'Italia'):(c?TONIO_escapeHtml(c.fatt_paese||''):''))+'" placeholder="Italia"'+roFatt+'></div>';
  }

  function _toggleStessiDati() {
    if (!editMode && currentId) return;
    var track = document.getElementById('toggle-osp-stessi-track');
    var lbl   = document.getElementById('toggle-osp-stessi-lbl');
    if (!track) return;
    var isOn = track.classList.toggle('on');
    if (lbl) lbl.textContent = isOn ? 'Attivo' : 'Disattivo';
    var c = currentId ? ospiti.find(function(x){return x.id===currentId;}) : null;
    var ro = editMode ? '' : ' readonly';
    var container = document.getElementById('ospiti-fiscali-fields');
    if (container) container.innerHTML = _buildFiscaliFields(c, ro, editMode?'':' disabled', isOn);
  }

  /* ================================================================
     EDIT MODE
     ================================================================ */
  function _setEditMode(on) {
    var c = currentId ? ospiti.find(function(x){return x.id===currentId;}) : null;
    renderScheda(c, on);
  }

  /* ================================================================
     AZIONI
     ================================================================ */
  function nuovoOspite() {
    currentId = null;
    renderScheda(null, true);
    TONIO_showPage('ospiti');
  }

  function apriOspite(id) {
    currentId = id;
    var c = ospiti.find(function(x){ return x.id === id; });
    if (!c) return;
    renderScheda(c, false);
    TONIO_showPage('ospiti');
  }

  function tornaLista() {
    currentId = null;
    editMode  = false;
    renderLista();
    TONIO_showPage('ospiti');
  }

  function eliminaOspite(id) {
    if (!confirm('Eliminare definitivamente questo ospite?\nL\'operazione non pu\u00f2 essere annullata.')) return;
    ospiti = ospiti.filter(function(x){ return x.id !== id; });
    _persist();
    if (currentId === id) tornaLista(); else renderLista();
  }

  function eliminaCorrente() {
    if (!currentId) return;
    eliminaOspite(currentId);
  }

  function toggleAttivo() {
    if (!currentId) return;
    var idx = ospiti.findIndex(function(x){return x.id===currentId;});
    if (idx < 0) return;
    ospiti[idx].attivo = !(ospiti[idx].attivo !== false);
    _persist();
    renderScheda(ospiti[idx], editMode);
  }

  /* ================================================================
     SALVA
     ================================================================ */
  function salva() {
    var nom = _val('fo-nominativo');
    if (!nom) { alert('Il campo Nominativo \u00e8 obbligatorio'); return; }

    var stessiDati = document.getElementById('toggle-osp-stessi-track')
      ? document.getElementById('toggle-osp-stessi-track').classList.contains('on')
      : true;

    var cell1 = _val('fo-cellulare');
    var tel1  = _val('fo-telefono');
    var mail1 = _val('fo-mail');
    var pec1  = _val('fo-pec');
    var via1  = _val('fo-via');
    var cit1  = _val('fo-citta');
    var cap1  = _val('fo-cap');
    var prv1  = _val('fo-prov');
    var pae1  = _val('fo-paese');

    var data = {
      nominativo:  nom,
      tipologia:   _val('fo-tipo'),
      stato:       _val('fo-stato'),
      note:        _val('fo-note'),
      cellulare:   cell1,
      cellulare2:  _val('fo-cellulare2'),
      telefono:    tel1,
      telefono2:   _val('fo-telefono2'),
      mail:        mail1,
      mail2:       _val('fo-mail2'),
      pec:         pec1,
      web:         _val('fo-web'),
      via:         via1,
      citta:       cit1,
      cap:         cap1,
      prov:        prv1,
      paese:       pae1,
      /* Registrazione */
      doc_tipo:          _val('fo-doc-tipo'),
      doc_numero:        _val('fo-doc-numero'),
      doc_ente:          _val('fo-doc-ente'),
      doc_localita:      _val('fo-doc-localita'),
      doc_emissione:     _val('fo-doc-emissione'),
      doc_scadenza:      _val('fo-doc-scadenza'),
      doc_luogo_nascita: _val('fo-doc-luogo-nascita'),
      doc_prov_nascita:  _val('fo-doc-prov-nascita'),
      doc_data_nascita:  _val('fo-doc-data-nascita'),
      doc_sesso:         _val('fo-doc-sesso'),
      doc_stato:         _val('fo-doc-stato'),
      /* Fiscali */
      fattStessiDati:  stessiDati,
      fatt_nominativo: stessiDati ? nom   : _val('fo-fatt-nominativo'),
      cf:              _val('fo-cf'),
      piva:            _val('fo-piva'),
      sdi:             _val('fo-sdi'),
      fatt_cell:       stessiDati ? cell1 : _val('fo-fatt-cell'),
      fatt_tel:        stessiDati ? tel1  : _val('fo-fatt-tel'),
      fatt_mail:       stessiDati ? mail1 : _val('fo-fatt-mail'),
      fatt_pec:        stessiDati ? pec1  : _val('fo-fatt-pec'),
      fatt_via:        stessiDati ? via1  : _val('fo-fatt-via'),
      fatt_citta:      stessiDati ? cit1  : _val('fo-fatt-citta'),
      fatt_cap:        stessiDati ? cap1  : _val('fo-fatt-cap'),
      fatt_prov:       stessiDati ? prv1  : _val('fo-fatt-prov'),
      fatt_paese:      stessiDati ? pae1  : _val('fo-fatt-paese'),
      /* Bancari */
      intestatario: _val('fo-intestatario'),
      banca:        _val('fo-banca'),
      iban:         _val('fo-iban'),
      bic:          _val('fo-bic'),
      annotazioni:  _collectAnnotazioni()
    };

    if (currentId) {
      var idx = ospiti.findIndex(function(x){ return x.id === currentId; });
      if (idx > -1) {
        data.attivo = ospiti[idx].attivo !== undefined ? ospiti[idx].attivo : true;
        ospiti[idx] = Object.assign(ospiti[idx], data);
      }
    } else {
      var newId = ospiti.length > 0 ? Math.max.apply(null, ospiti.map(function(x){return x.id;})) + 1 : 1;
      data.id     = newId;
      data.attivo = true;
      ospiti.push(data);
      currentId = newId;
    }

    var saved = ospiti.find(function(x){return x.id===currentId;});
    _persist();
    renderScheda(saved, false);

    var ph = document.querySelector('#page-ospiti .panel-header');
    if (ph) {
      ph.style.transition = 'background 0.4s';
      ph.style.background = 'linear-gradient(135deg,#0d3c1f 0%,#1a6e3a 50%,#0d3c1f 100%)';
      setTimeout(function(){
        ph.style.background = 'linear-gradient(135deg,#1a0d3c 0%,#3a1a6e 50%,#1a0d3c 100%)';
      }, 900);
    }
  }

  /* ================================================================
     ANNOTAZIONI
     ================================================================ */
  function addAnnotazione(data) {
    annotCnt++;
    var idx   = annotCnt;
    var d     = data || {};
    var tbody = document.getElementById('osp-annot-tbody');
    if (!tbody) return;
    var ro = (!editMode && currentId) ? ' readonly' : '';
    var delBtn = (editMode||!currentId)
      ? ' <button class="btn btn-danger btn-sm" onclick="MSK_Ospiti._delAnnotazione('+idx+')" title="Elimina">\u26d4</button>'
      : '';
    var tr = document.createElement('tr');
    tr.id = 'osp-annot-' + idx;
    tr.innerHTML =
        '<td><input class="form-input" style="min-width:130px" id="osp-annot-dest-'+idx+'" value="'+TONIO_escapeHtml(d.destinatario||'')+'" placeholder="Destinatario"'+ro+'></td>'
      + '<td><input class="form-input" type="date" style="min-width:130px" id="osp-annot-data-'+idx+'" value="'+(d.data||'')+'"'+ro+'></td>'
      + '<td><input class="form-input" style="min-width:110px" id="osp-annot-pren-'+idx+'" value="'+TONIO_escapeHtml(d.prenotazione||'')+'" placeholder="N\u00b0 Pren."'+ro+'></td>'
      + '<td><input class="form-input" style="min-width:120px" id="osp-annot-osp-'+idx+'"  value="'+TONIO_escapeHtml(d.ospite||'')+'" placeholder="Ospite"'+ro+'></td>'
      + '<td><input class="form-input" style="min-width:200px" id="osp-annot-desc-'+idx+'" value="'+TONIO_escapeHtml(d.descrizione||'')+'" placeholder="Descrizione"'+ro+'></td>'
      + '<td style="white-space:nowrap">'
      +   '<button class="btn btn-ghost btn-sm" onclick="MSK_Ospiti._stampaAnnotazione('+idx+')" title="Stampa">\u{1F5A8}</button>'
      +   delBtn
      + '</td>';
    tbody.appendChild(tr);
  }

  function _delAnnotazione(idx) {
    var el = document.getElementById('osp-annot-' + idx);
    if (el) el.remove();
  }

  function _stampaAnnotazione(idx) {
    var g = function(id){ var el=document.getElementById(id); return el?el.value:''; };
    var contenuto =
        'Destinatario: '        + g('osp-annot-dest-'+idx) + '\n'
      + 'Data: '                + g('osp-annot-data-'+idx) + '\n'
      + 'N\u00b0 Prenotazione: '+ g('osp-annot-pren-'+idx) + '\n'
      + 'Ospite: '              + g('osp-annot-osp-'+idx)  + '\n'
      + 'Descrizione: '         + g('osp-annot-desc-'+idx);
    var w = window.open('','_blank','width=600,height=400');
    if (!w) { alert('Abilita i popup per stampare'); return; }
    w.document.write('<html><body><pre style="font-family:sans-serif;padding:30px;font-size:14px">'+contenuto+'</pre></body></html>');
    w.document.close();
    w.print();
  }

  function _collectAnnotazioni() {
    var tbody = document.getElementById('osp-annot-tbody');
    if (!tbody) return [];
    return Array.from(tbody.children).map(function(tr) {
      var n = tr.id.replace('osp-annot-','');
      var g = function(id){ var el=document.getElementById(id); return el?el.value.trim():''; };
      return { destinatario:g('osp-annot-dest-'+n), data:g('osp-annot-data-'+n),
               prenotazione:g('osp-annot-pren-'+n), ospite:g('osp-annot-osp-'+n),
               descrizione:g('osp-annot-desc-'+n) };
    });
  }

  /* ================================================================
     MODAL TIPOLOGIE
     ================================================================ */
  function openModalTipologie() { _renderTipologieModal(); document.getElementById('modal-osp-tipologie').classList.add('open'); }
  function _renderTipologieModal() {
    var tbody=document.getElementById('osp-tipo-tbody');
    if(!tbody) return;
    tbody.innerHTML=tipologie.slice().sort(function(a,b){return a.ordine-b.ordine;}).map(function(t,i){
      return '<tr><td style="color:var(--text3);font-size:12px;width:30px">'+t.id+'</td>'
        +'<td style="width:72px"><button class="btn btn-ghost btn-sm" onclick="MSK_Ospiti._moveTipo('+i+',-1)">\u25b2</button> <button class="btn btn-ghost btn-sm" onclick="MSK_Ospiti._moveTipo('+i+',1)">\u25bc</button></td>'
        +'<td><input class="lookup-input" id="osp-tipo-nome-'+t.id+'" value="'+TONIO_escapeHtml(t.nome)+'"></td>'
        +'<td style="width:120px"><input type="color" class="color-swatch" id="osp-tipo-col-'+t.id+'" value="'+t.colore+'">'
        +'<span id="osp-tipo-prev-'+t.id+'" class="badge" style="margin-left:8px;background:'+t.colore+'22;color:'+t.colore+';border:1px solid '+t.colore+'44">'+TONIO_escapeHtml(t.nome)+'</span></td>'
        +'<td style="width:40px"><button class="btn btn-danger btn-sm" onclick="MSK_Ospiti._delTipo('+t.id+')">\u26d4</button></td></tr>';
    }).join('');
    tipologie.forEach(function(t){
      var col=document.getElementById('osp-tipo-col-'+t.id),nom=document.getElementById('osp-tipo-nome-'+t.id),prev=document.getElementById('osp-tipo-prev-'+t.id);
      if(col) col.addEventListener('input',function(){if(prev){prev.style.background=this.value+'22';prev.style.color=this.value;prev.style.borderColor=this.value+'44';}});
      if(nom) nom.addEventListener('input',function(){if(prev)prev.textContent=this.value;});
    });
  }
  function _moveTipo(idx,dir){var s=tipologie.slice().sort(function(a,b){return a.ordine-b.ordine;});var ni=idx+dir;if(ni<0||ni>=s.length)return;var t=s[idx].ordine;s[idx].ordine=s[ni].ordine;s[ni].ordine=t;_renderTipologieModal();}
  function _delTipo(id){if(!confirm('Eliminare?'))return;tipologie=tipologie.filter(function(x){return x.id!==id;});_renderTipologieModal();}
  function addTipologia(){var n=tipologie.length>0?Math.max.apply(null,tipologie.map(function(x){return x.id;}))+1:1;tipologie.push({id:n,ordine:tipologie.length+1,nome:'Nuova Tipologia',colore:'#a78bfa'});_renderTipologieModal();}
  function saveTipologie(){tipologie=tipologie.map(function(t){return Object.assign({},t,{nome:(document.getElementById('osp-tipo-nome-'+t.id)||{}).value||t.nome,colore:(document.getElementById('osp-tipo-col-'+t.id)||{}).value||t.colore});});_persist();document.getElementById('modal-osp-tipologie').classList.remove('open');}

  /* ================================================================
     MODAL STATI
     ================================================================ */
  function openModalStati() { _renderStatiModal(); document.getElementById('modal-osp-stati').classList.add('open'); }
  function _renderStatiModal() {
    var tbody=document.getElementById('osp-stati-tbody');
    if(!tbody) return;
    tbody.innerHTML=stati.slice().sort(function(a,b){return a.ordine-b.ordine;}).map(function(s,i){
      return '<tr><td style="color:var(--text3);font-size:12px;width:30px">'+s.id+'</td>'
        +'<td style="width:72px"><button class="btn btn-ghost btn-sm" onclick="MSK_Ospiti._moveStato('+i+',-1)">\u25b2</button> <button class="btn btn-ghost btn-sm" onclick="MSK_Ospiti._moveStato('+i+',1)">\u25bc</button></td>'
        +'<td><input class="lookup-input" id="osp-stato-nome-'+s.id+'" value="'+TONIO_escapeHtml(s.nome)+'"></td>'
        +'<td style="width:120px"><input type="color" class="color-swatch" id="osp-stato-col-'+s.id+'" value="'+s.colore+'">'
        +'<span id="osp-stato-prev-'+s.id+'" class="badge" style="margin-left:8px;background:'+s.colore+'22;color:'+s.colore+';border:1px solid '+s.colore+'44">'+TONIO_escapeHtml(s.nome)+'</span></td>'
        +'<td style="width:40px"><button class="btn btn-danger btn-sm" onclick="MSK_Ospiti._delStato('+s.id+')">\u26d4</button></td></tr>';
    }).join('');
    stati.forEach(function(s){
      var col=document.getElementById('osp-stato-col-'+s.id),nom=document.getElementById('osp-stato-nome-'+s.id),prev=document.getElementById('osp-stato-prev-'+s.id);
      if(col) col.addEventListener('input',function(){if(prev){prev.style.background=this.value+'22';prev.style.color=this.value;prev.style.borderColor=this.value+'44';}});
      if(nom) nom.addEventListener('input',function(){if(prev)prev.textContent=this.value;});
    });
  }
  function _moveStato(idx,dir){var s=stati.slice().sort(function(a,b){return a.ordine-b.ordine;});var ni=idx+dir;if(ni<0||ni>=s.length)return;var t=s[idx].ordine;s[idx].ordine=s[ni].ordine;s[ni].ordine=t;_renderStatiModal();}
  function _delStato(id){if(!confirm('Eliminare?'))return;stati=stati.filter(function(x){return x.id!==id;});_renderStatiModal();}
  function addStato(){var n=stati.length>0?Math.max.apply(null,stati.map(function(x){return x.id;}))+1:1;stati.push({id:n,ordine:stati.length+1,nome:'Nuovo Stato',colore:'#34d399'});_renderStatiModal();}
  function saveStati(){stati=stati.map(function(s){return Object.assign({},s,{nome:(document.getElementById('osp-stato-nome-'+s.id)||{}).value||s.nome,colore:(document.getElementById('osp-stato-col-'+s.id)||{}).value||s.colore});});_persist();document.getElementById('modal-osp-stati').classList.remove('open');}

  /* ================================================================
     AGGIORNA HEADER LIVE
     ================================================================ */
  function aggiornaHeader() {
    var nom  =(document.getElementById('fo-nominativo')||{}).value||'Nuovo Ospite';
    var tipo =(document.getElementById('fo-tipo')||{}).value||'';
    var stato=(document.getElementById('fo-stato')||{}).value||'';
    var hn=document.getElementById('scheda-osp-nome');
    var hs=document.getElementById('scheda-osp-sub');
    if(hn) hn.textContent=nom;
    if(hs) hs.textContent=[tipo,stato].filter(Boolean).join(' \u00b7 ')||'Scheda ospite';
  }

  /* ===== HELPERS ===== */
  function _val(id){ var el=document.getElementById(id); return el?el.value.trim():''; }
  function _tipoColore(n){ var t=tipologie.find(function(x){return x.nome===n;}); return t?t.colore:'#64748b'; }
  function _statoColore(n){ var s=stati.find(function(x){return x.nome===n;}); return s?s.colore:'#64748b'; }

  /* ===== API PUBBLICA ===== */
  return {
    init:init, nuovoOspite:nuovoOspite, apriOspite:apriOspite,
    tornaLista:tornaLista, eliminaOspite:eliminaOspite,
    eliminaCorrente:eliminaCorrente, toggleAttivo:toggleAttivo,
    salva:salva, aggiornaHeader:aggiornaHeader,
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
