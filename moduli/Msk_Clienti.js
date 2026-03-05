/* ================================================================
   TONIO — Msk_Clienti.js  |  Modulo Anagrafica Clienti
   ================================================================ */

var MSK_Clienti = (function() {

  var tipologie = [];
  var stati     = [];
  var clienti   = [];
  var currentId = null;
  var collabCnt = 0;

  /* ---- INIT ---- */
  function init() {
    tipologie = (window.TONIO_TIPOLOGIE || []).map(function(x){ return Object.assign({},x); });
    stati     = (window.TONIO_STATI     || []).map(function(x){ return Object.assign({},x); });
    clienti   = (window.TONIO_CLIENTI   || []).map(function(x){ return Object.assign({},x); });
    renderLista();
  }

  /* ================================================================
     LISTA
     ================================================================ */
  function renderLista() {
    var page = document.getElementById('page-clienti');
    if (!page) return;

    var count = clienti.length;
    var rows  = '';

    if (count === 0) {
      rows = '<tr><td colspan="6"><div class="empty-state">'
           + '<div class="es-icon">👥</div>'
           + '<h3>Nessun cliente</h3>'
           + '<p>Clicca "+ Nuovo Cliente" per iniziare</p>'
           + '</div></td></tr>';
    } else {
      clienti.forEach(function(c) {
        var ref = c.collaboratori && c.collaboratori.length > 0 ? c.collaboratori[0] : null;
        var refHtml = ref
          ? '<div class="td-sub">👤 ' + TONIO_escapeHtml(ref.nome) + (ref.ruolo ? ' · ' + TONIO_escapeHtml(ref.ruolo) : '') + '</div>'
          : '';
        var tipoBadge  = c.tipologia ? TONIO_makeBadge(c.tipologia, _tipoColore(c.tipologia)) : '—';
        var statoBadge = c.stato     ? TONIO_makeBadge(c.stato,     _statoColore(c.stato))    : '—';
        var tel = c.cellulare || c.telefono || '—';
        var mailHtml = c.mail ? '<div class="td-contact">' + c.mail.replace('@','&#64;') + '</div>' : '';
        var noteHtml = c.note ? '<div class="td-note">' + TONIO_escapeHtml(c.note) + '</div>' : '—';
        var sel = c.id === currentId ? 'selected' : '';

        rows += '<tr class="' + sel + '" onclick="MSK_Clienti.apriCliente(' + c.id + ')">'
          + '<td><div class="td-name">' + TONIO_escapeHtml(c.nominativo) + '</div>' + refHtml + '</td>'
          + '<td>' + tipoBadge + '</td>'
          + '<td>' + statoBadge + '</td>'
          + '<td><div class="td-contact">' + TONIO_escapeHtml(tel) + '</div>' + mailHtml + '</td>'
          + '<td>' + noteHtml + '</td>'
          + '<td><button class="btn btn-danger btn-sm" onclick="event.stopPropagation();MSK_Clienti.eliminaCliente(' + c.id + ')">🗑</button></td>'
          + '</tr>';
      });
    }

    page.innerHTML =
        '<div class="panel">'
      +   '<div class="panel-header">'
      +     '<div class="panel-header-icon">👥</div>'
      +     '<div>'
      +       '<div class="panel-header-title">Clienti</div>'
      +       '<div class="panel-header-sub">' + count + ' client' + (count === 1 ? 'e' : 'i') + '</div>'
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

  /* ================================================================
     SCHEDA (pagina intera)
     ================================================================ */
  function renderScheda(c) {
    var page = document.getElementById('page-clienti');
    if (!page) return;

    var nom = c ? TONIO_escapeHtml(c.nominativo) : 'Nuovo Cliente';
    var sub = c ? ((c.tipologia || '') + (c.stato ? ' · ' + c.stato : '')) : 'Inserimento nuovo cliente';
    var v   = function(f){ return c ? TONIO_escapeHtml(c[f] || '') : ''; };

    /* select options */
    var tipoOpts = '<option value="">— Seleziona —</option>';
    tipologie.slice().sort(function(a,b){return a.ordine-b.ordine;}).forEach(function(t){
      tipoOpts += '<option value="' + TONIO_escapeHtml(t.nome) + '"' + (c && c.tipologia===t.nome ? ' selected' : '') + '>' + TONIO_escapeHtml(t.nome) + '</option>';
    });
    var statoOpts = '<option value="">— Seleziona —</option>';
    stati.slice().sort(function(a,b){return a.ordine-b.ordine;}).forEach(function(s){
      statoOpts += '<option value="' + TONIO_escapeHtml(s.nome) + '"' + (c && c.stato===s.nome ? ' selected' : '') + '>' + TONIO_escapeHtml(s.nome) + '</option>';
    });

    page.innerHTML =
        '<div class="panel">'

        /* HEADER gradiente blu scuro */
      + '<div class="panel-header" style="background:linear-gradient(135deg,#0d1f3c 0%,#1a3a6e 50%,#0d1f3c 100%);border-bottom:1px solid rgba(79,142,247,0.2);">'
      +   '<button class="btn btn-ghost btn-sm" onclick="MSK_Clienti.tornaLista()" '
      +     'style="background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.2);color:#fff;flex-shrink:0">← Lista</button>'
      +   '<div class="panel-header-icon" style="background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.2)">👤</div>'
      +   '<div style="min-width:0;flex:1">'
      +     '<div class="panel-header-title" id="scheda-nome" style="color:#fff;font-size:19px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + nom + '</div>'
      +     '<div class="panel-header-sub" id="scheda-sub" style="color:rgba(255,255,255,0.55)">' + sub + '</div>'
      +   '</div>'
      +   '<div class="panel-header-actions">'
      +     '<button class="btn btn-sm" onclick="MSK_Clienti.tornaLista()" '
      +       'style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff">✕ Annulla</button>'
      +     '<button class="btn btn-primary btn-sm" onclick="MSK_Clienti.salva()">💾 Salva</button>'
      +   '</div>'
      + '</div>'

      /* TABS */
      + '<div class="tabs-bar" id="st">'
      +   '<button class="tab-btn active" onclick="TONIO_setTab(\'stb\',\'principale\',this)">📋 Principale</button>'
      +   '<button class="tab-btn" onclick="TONIO_setTab(\'stb\',\'fiscali\',this)">🏦 Dati Fiscali</button>'
      +   '<button class="tab-btn" onclick="TONIO_setTab(\'stb\',\'bancari\',this)">💳 Dati Bancari</button>'
      +   '<button class="tab-btn" onclick="TONIO_setTab(\'stb\',\'collaboratori\',this)">👥 Collaboratori</button>'
      +   '<button class="tab-btn" onclick="TONIO_setTab(\'stb\',\'annotazioni\',this)">📝 Annotazioni</button>'
      + '</div>'

      + '<div id="stb">'

      /* === TAB PRINCIPALE === */
      + '<div class="tab-panel active" id="stb-tab-principale">'
      +   '<div class="form-grid">'

      +     '<div class="form-grid form-grid-2">'
      +       '<div class="form-group"><label class="form-label">Tipologia</label>'
      +         '<select class="form-select" id="f-tipo" onchange="MSK_Clienti.aggiornaHeader()">' + tipoOpts + '</select></div>'
      +       '<div class="form-group"><label class="form-label">Stato</label>'
      +         '<select class="form-select" id="f-stato" onchange="MSK_Clienti.aggiornaHeader()">' + statoOpts + '</select></div>'
      +     '</div>'

      +     '<div class="form-group"><label class="form-label">Ragione Sociale / Nominativo *</label>'
      +       '<input class="form-input" id="f-nominativo" value="' + v('nominativo') + '" placeholder="Es. Rossi Mario / Azienda Srl" oninput="MSK_Clienti.aggiornaHeader()"></div>'

      +     '<div class="form-grid form-grid-2">'
      +       '<div class="form-group"><label class="form-label">Cellulare</label>'
      +         '<input class="form-input" id="f-cellulare" value="' + v('cellulare') + '" placeholder="+39 …"></div>'
      +       '<div class="form-group"><label class="form-label">Telefono</label>'
      +         '<input class="form-input" id="f-telefono" value="' + v('telefono') + '" placeholder="+39 …"></div>'
      +     '</div>'

      +     '<div class="form-group"><label class="form-label">E-Mail</label>'
      +       '<input class="form-input" id="f-mail" type="email" value="' + v('mail') + '" placeholder="esempio@mail.it"></div>'

      +     '<div class="form-group"><label class="form-label">Sito Web</label>'
      +       '<input class="form-input" id="f-web" value="' + v('web') + '" placeholder="https://…"></div>'

      +     '<div class="form-group"><label class="form-label">Note</label>'
      +       '<textarea class="form-textarea" id="f-note" placeholder="Note libere…">' + v('note') + '</textarea></div>'

      +   '</div>'
      + '</div>'

      /* === TAB DATI FISCALI === */
      + '<div class="tab-panel" id="stb-tab-fiscali">'
      +   '<div class="form-grid">'

      +     '<div class="form-grid form-grid-2">'
      +       '<div class="form-group"><label class="form-label">Codice Fiscale</label>'
      +         '<input class="form-input" id="f-cf" value="' + v('cf') + '" placeholder="RSSMRA80A01H501Z"></div>'
      +       '<div class="form-group"><label class="form-label">Partita IVA</label>'
      +         '<input class="form-input" id="f-piva" value="' + v('piva') + '" placeholder="01234567890"></div>'
      +     '</div>'

      +     '<div class="form-group"><label class="form-label">Indirizzo</label>'
      +       '<input class="form-input" id="f-indirizzo" value="' + v('indirizzo') + '" placeholder="Via …"></div>'

      +     '<div class="form-grid form-grid-3">'
      +       '<div class="form-group"><label class="form-label">CAP</label>'
      +         '<input class="form-input" id="f-cap" value="' + v('cap') + '" placeholder="00100"></div>'
      +       '<div class="form-group"><label class="form-label">Città</label>'
      +         '<input class="form-input" id="f-citta" value="' + v('citta') + '" placeholder="Roma"></div>'
      +       '<div class="form-group"><label class="form-label">Prov.</label>'
      +         '<input class="form-input" id="f-prov" value="' + v('prov') + '" placeholder="RM" maxlength="3"></div>'
      +     '</div>'

      +     '<div class="form-group"><label class="form-label">Paese</label>'
      +       '<input class="form-input" id="f-paese" value="' + (c && c.paese ? TONIO_escapeHtml(c.paese) : 'Italia') + '"></div>'

      +     '<div class="form-group"><label class="form-label">Codice SDI / PEC</label>'
      +       '<input class="form-input" id="f-sdi" value="' + v('sdi') + '" placeholder="Codice SDI o indirizzo PEC"></div>'

      +   '</div>'
      + '</div>'

      /* === TAB DATI BANCARI === */
      + '<div class="tab-panel" id="stb-tab-bancari">'
      +   '<div class="form-grid">'

      +     '<div class="form-group"><label class="form-label">Banca</label>'
      +       '<input class="form-input" id="f-banca" value="' + v('banca') + '" placeholder="Nome banca"></div>'

      +     '<div class="form-group"><label class="form-label">IBAN</label>'
      +       '<input class="form-input" id="f-iban" value="' + v('iban') + '" placeholder="IT60 X054 2811 1010 0000 0123 456"></div>'

      +     '<div class="form-grid form-grid-2">'
      +       '<div class="form-group"><label class="form-label">BIC / SWIFT</label>'
      +         '<input class="form-input" id="f-bic" value="' + v('bic') + '" placeholder="UNCRITM1…"></div>'
      +       '<div class="form-group"><label class="form-label">Intestatario conto</label>'
      +         '<input class="form-input" id="f-intestatario" value="' + v('intestatario') + '" placeholder="Nome intestatario"></div>'
      +     '</div>'

      +   '</div>'
      + '</div>'

      /* === TAB COLLABORATORI === */
      + '<div class="tab-panel" id="stb-tab-collaboratori">'
      +   '<div id="collab-list"></div>'
      +   '<button class="btn btn-ghost" style="width:100%;margin-top:4px" onclick="MSK_Clienti.addCollab()">＋ Aggiungi Collaboratore</button>'
      + '</div>'

      /* === TAB ANNOTAZIONI === */
      + '<div class="tab-panel" id="stb-tab-annotazioni">'
      +   '<div class="form-group"><label class="form-label">Annotazioni interne</label>'
      +     '<textarea class="form-textarea" id="f-annotazioni" style="min-height:240px" placeholder="Annotazioni private, promemoria, storico comunicazioni…">' + v('annotazioni') + '</textarea></div>'
      + '</div>'

      + '</div>' /* stb */
      + '</div>'; /* panel */

    /* collaboratori */
    collabCnt = 0;
    if (c && c.collaboratori) {
      c.collaboratori.forEach(function(col){ addCollab(col); });
    }
  }

  /* ================================================================
     AZIONI
     ================================================================ */
  function nuovoCliente() {
    currentId = null;
    renderScheda(null);
    TONIO_showPage('clienti');
  }

  function apriCliente(id) {
    currentId = id;
    var c = clienti.find(function(x){ return x.id === id; });
    if (!c) return;
    renderScheda(c);
    TONIO_showPage('clienti');
  }

  function tornaLista() {
    currentId = null;
    renderLista();
    TONIO_showPage('clienti');
  }

  function eliminaCliente(id) {
    if (!confirm('Eliminare questo cliente?')) return;
    clienti = clienti.filter(function(x){ return x.id !== id; });
    if (currentId === id) tornaLista(); else renderLista();
  }

  /* ================================================================
     SALVA
     ================================================================ */
  function salva() {
    var nom = _val('f-nominativo');
    if (!nom) { alert('Il campo Nominativo è obbligatorio'); return; }

    var data = {
      nominativo:   nom,
      tipologia:    _val('f-tipo'),
      stato:        _val('f-stato'),
      cellulare:    _val('f-cellulare'),
      telefono:     _val('f-telefono'),
      mail:         _val('f-mail'),
      web:          _val('f-web'),
      note:         _val('f-note'),
      cf:           _val('f-cf'),
      piva:         _val('f-piva'),
      indirizzo:    _val('f-indirizzo'),
      cap:          _val('f-cap'),
      citta:        _val('f-citta'),
      prov:         _val('f-prov'),
      paese:        _val('f-paese'),
      sdi:          _val('f-sdi'),
      banca:        _val('f-banca'),
      iban:         _val('f-iban'),
      bic:          _val('f-bic'),
      intestatario: _val('f-intestatario'),
      annotazioni:  _val('f-annotazioni'),
      collaboratori: _collectCollabs()
    };

    if (currentId) {
      var idx = clienti.findIndex(function(x){ return x.id === currentId; });
      if (idx > -1) clienti[idx] = Object.assign(clienti[idx], data);
    } else {
      var newId = clienti.length > 0 ? Math.max.apply(null, clienti.map(function(x){ return x.id; })) + 1 : 1;
      data.id = newId;
      clienti.push(data);
      currentId = newId;
    }

    var hn = document.getElementById('scheda-nome');
    var hs = document.getElementById('scheda-sub');
    if (hn) hn.textContent = nom;
    if (hs) hs.textContent = [data.tipologia, data.stato].filter(Boolean).join(' · ') || 'Scheda cliente';
  }

  /* ================================================================
     COLLABORATORI
     ================================================================ */
  function addCollab(data) {
    collabCnt++;
    var idx  = collabCnt;
    var d    = data || {};
    var list = document.getElementById('collab-list');
    if (!list) return;

    var isFirst = list.children.length === 0;
    var div = document.createElement('div');
    div.className = 'collab-card';
    div.id = 'collab-' + idx;
    div.innerHTML =
        '<div class="collab-card-header">'
      +   '<div class="collab-order-btns">'
      +     '<button class="collab-order-btn" onclick="MSK_Clienti.moveCollab(' + idx + ',-1)">▲</button>'
      +     '<button class="collab-order-btn" onclick="MSK_Clienti.moveCollab(' + idx + ',1)">▼</button>'
      +   '</div>'
      +   '<span class="collab-badge-ref" id="collab-badge-' + idx + '">' + (isFirst ? 'REFERENTE' : '#' + idx) + '</span>'
      +   '<button class="collab-remove-btn" onclick="MSK_Clienti.removeCollab(' + idx + ')">🗑</button>'
      + '</div>'
      + '<div class="collab-grid">'
      +   '<div class="form-group" style="grid-column:1/-1"><label class="form-label">Nome e Cognome</label>'
      +     '<input class="form-input" id="collab-nome-' + idx + '" value="' + TONIO_escapeHtml(d.nome||'') + '" placeholder="Nome Cognome"></div>'
      +   '<div class="form-group"><label class="form-label">Ruolo / Qualifica</label>'
      +     '<input class="form-input" id="collab-ruolo-' + idx + '" value="' + TONIO_escapeHtml(d.ruolo||'') + '" placeholder="Es. Referente"></div>'
      +   '<div class="form-group"><label class="form-label">Cellulare</label>'
      +     '<input class="form-input" id="collab-cell-' + idx + '" value="' + TONIO_escapeHtml(d.cellulare||'') + '" placeholder="+39 …"></div>'
      +   '<div class="form-group"><label class="form-label">Telefono</label>'
      +     '<input class="form-input" id="collab-tel-' + idx + '" value="' + TONIO_escapeHtml(d.telefono||'') + '" placeholder="+39 …"></div>'
      +   '<div class="form-group"><label class="form-label">E-Mail</label>'
      +     '<input class="form-input" id="collab-mail-' + idx + '" value="' + TONIO_escapeHtml(d.mail||'') + '" placeholder="mail&#64;…"></div>'
      +   '<div class="form-group" style="grid-column:1/-1"><label class="form-label">Note</label>'
      +     '<textarea class="form-textarea" id="collab-note-' + idx + '" style="min-height:58px" placeholder="Note…">' + TONIO_escapeHtml(d.note||'') + '</textarea></div>'
      + '</div>';

    list.appendChild(div);
    _updateCollabBadges();
  }

  function removeCollab(idx) {
    var el = document.getElementById('collab-' + idx);
    if (el) el.remove();
    _updateCollabBadges();
  }

  function moveCollab(idx, dir) {
    var list = document.getElementById('collab-list');
    var el   = document.getElementById('collab-' + idx);
    if (!el || !list) return;
    if (dir === -1 && el.previousElementSibling) list.insertBefore(el, el.previousElementSibling);
    else if (dir === 1 && el.nextElementSibling)  list.insertBefore(el.nextElementSibling, el);
    _updateCollabBadges();
  }

  function _updateCollabBadges() {
    var list = document.getElementById('collab-list');
    if (!list) return;
    Array.from(list.children).forEach(function(card, i) {
      var n = card.id.replace('collab-', '');
      var badge = document.getElementById('collab-badge-' + n);
      if (badge) badge.textContent = i === 0 ? 'REFERENTE' : '#' + (i + 1);
    });
  }

  function _collectCollabs() {
    var list = document.getElementById('collab-list');
    if (!list) return [];
    return Array.from(list.children).map(function(card, i) {
      var n = card.id.replace('collab-', '');
      var g = function(id){ var el = document.getElementById(id); return el ? el.value.trim() : ''; };
      return {
        ordine: i + 1,
        nome: g('collab-nome-' + n),
        ruolo: g('collab-ruolo-' + n),
        cellulare: g('collab-cell-' + n),
        telefono: g('collab-tel-' + n),
        mail: g('collab-mail-' + n),
        note: g('collab-note-' + n)
      };
    });
  }

  /* ================================================================
     AGGIORNA HEADER LIVE
     ================================================================ */
  function aggiornaHeader() {
    var nom   = (document.getElementById('f-nominativo')||{}).value || 'Nuovo Cliente';
    var tipo  = (document.getElementById('f-tipo') ||{}).value || '';
    var stato = (document.getElementById('f-stato')||{}).value || '';
    var hn = document.getElementById('scheda-nome');
    var hs = document.getElementById('scheda-sub');
    if (hn) hn.textContent = nom;
    if (hs) hs.textContent = [tipo, stato].filter(Boolean).join(' · ') || 'Scheda cliente';
  }

  /* ================================================================
     MODAL TIPOLOGIE
     ================================================================ */
  function openModalTipologie() {
    _renderTipologieModal();
    document.getElementById('modal-tipologie').classList.add('open');
  }

  function _renderTipologieModal() {
    var tbody = document.getElementById('tipo-tbody');
    tbody.innerHTML = tipologie.slice().sort(function(a,b){return a.ordine-b.ordine;}).map(function(t,i){
      return '<tr>'
        + '<td style="color:var(--text3);font-size:12px;width:30px">' + t.id + '</td>'
        + '<td style="width:72px">'
        +   '<button class="btn btn-ghost btn-sm" onclick="MSK_Clienti._moveTipo(' + i + ',-1)">▲</button> '
        +   '<button class="btn btn-ghost btn-sm" onclick="MSK_Clienti._moveTipo(' + i + ',1)">▼</button>'
        + '</td>'
        + '<td><input class="lookup-input" id="tipo-nome-' + t.id + '" value="' + TONIO_escapeHtml(t.nome) + '"></td>'
        + '<td style="width:120px">'
        +   '<input type="color" class="color-swatch" id="tipo-col-' + t.id + '" value="' + t.colore + '">'
        +   '<span id="tipo-prev-' + t.id + '" class="badge" style="margin-left:8px;background:' + t.colore + '22;color:' + t.colore + ';border:1px solid ' + t.colore + '44">' + TONIO_escapeHtml(t.nome) + '</span>'
        + '</td>'
        + '<td style="width:40px"><button class="btn btn-danger btn-sm" onclick="MSK_Clienti._delTipo(' + t.id + ')">🗑</button></td>'
        + '</tr>';
    }).join('');

    tipologie.forEach(function(t){
      var col  = document.getElementById('tipo-col-' + t.id);
      var nom  = document.getElementById('tipo-nome-' + t.id);
      var prev = document.getElementById('tipo-prev-' + t.id);
      if (col) col.addEventListener('input', function(){
        if (prev){ prev.style.background=this.value+'22'; prev.style.color=this.value; prev.style.borderColor=this.value+'44'; }
      });
      if (nom) nom.addEventListener('input', function(){ if(prev) prev.textContent=this.value; });
    });
  }

  function _moveTipo(idx, dir) {
    var sorted = tipologie.slice().sort(function(a,b){return a.ordine-b.ordine;});
    var ni = idx + dir;
    if (ni < 0 || ni >= sorted.length) return;
    var tmp = sorted[idx].ordine; sorted[idx].ordine = sorted[ni].ordine; sorted[ni].ordine = tmp;
    _renderTipologieModal();
  }
  function _delTipo(id) {
    if (!confirm('Eliminare?')) return;
    tipologie = tipologie.filter(function(x){return x.id!==id;});
    _renderTipologieModal();
  }
  function addTipologia() {
    var newId = tipologie.length > 0 ? Math.max.apply(null,tipologie.map(function(x){return x.id;}))+1 : 1;
    tipologie.push({ id:newId, ordine:tipologie.length+1, nome:'Nuova Tipologia', colore:'#4f8ef7' });
    _renderTipologieModal();
  }
  function saveTipologie() {
    tipologie = tipologie.map(function(t){
      return Object.assign({},t,{
        nome:   (document.getElementById('tipo-nome-'+t.id)||{}).value || t.nome,
        colore: (document.getElementById('tipo-col-'+t.id)||{}).value  || t.colore
      });
    });
    document.getElementById('modal-tipologie').classList.remove('open');
  }

  /* ================================================================
     MODAL STATI
     ================================================================ */
  function openModalStati() {
    _renderStatiModal();
    document.getElementById('modal-stati').classList.add('open');
  }

  function _renderStatiModal() {
    var tbody = document.getElementById('stati-tbody');
    tbody.innerHTML = stati.slice().sort(function(a,b){return a.ordine-b.ordine;}).map(function(s,i){
      return '<tr>'
        + '<td style="color:var(--text3);font-size:12px;width:30px">' + s.id + '</td>'
        + '<td style="width:72px">'
        +   '<button class="btn btn-ghost btn-sm" onclick="MSK_Clienti._moveStato(' + i + ',-1)">▲</button> '
        +   '<button class="btn btn-ghost btn-sm" onclick="MSK_Clienti._moveStato(' + i + ',1)">▼</button>'
        + '</td>'
        + '<td><input class="lookup-input" id="stato-nome-' + s.id + '" value="' + TONIO_escapeHtml(s.nome) + '"></td>'
        + '<td style="width:120px">'
        +   '<input type="color" class="color-swatch" id="stato-col-' + s.id + '" value="' + s.colore + '">'
        +   '<span id="stato-prev-' + s.id + '" class="badge" style="margin-left:8px;background:' + s.colore + '22;color:' + s.colore + ';border:1px solid ' + s.colore + '44">' + TONIO_escapeHtml(s.nome) + '</span>'
        + '</td>'
        + '<td style="width:40px"><button class="btn btn-danger btn-sm" onclick="MSK_Clienti._delStato(' + s.id + ')">🗑</button></td>'
        + '</tr>';
    }).join('');

    stati.forEach(function(s){
      var col  = document.getElementById('stato-col-' + s.id);
      var nom  = document.getElementById('stato-nome-' + s.id);
      var prev = document.getElementById('stato-prev-' + s.id);
      if (col) col.addEventListener('input', function(){
        if(prev){ prev.style.background=this.value+'22'; prev.style.color=this.value; prev.style.borderColor=this.value+'44'; }
      });
      if (nom) nom.addEventListener('input', function(){ if(prev) prev.textContent=this.value; });
    });
  }

  function _moveStato(idx, dir) {
    var sorted = stati.slice().sort(function(a,b){return a.ordine-b.ordine;});
    var ni = idx + dir;
    if (ni < 0 || ni >= sorted.length) return;
    var tmp = sorted[idx].ordine; sorted[idx].ordine = sorted[ni].ordine; sorted[ni].ordine = tmp;
    _renderStatiModal();
  }
  function _delStato(id) {
    if (!confirm('Eliminare?')) return;
    stati = stati.filter(function(x){return x.id!==id;});
    _renderStatiModal();
  }
  function addStato() {
    var newId = stati.length > 0 ? Math.max.apply(null,stati.map(function(x){return x.id;}))+1 : 1;
    stati.push({ id:newId, ordine:stati.length+1, nome:'Nuovo Stato', colore:'#34d399' });
    _renderStatiModal();
  }
  function saveStati() {
    stati = stati.map(function(s){
      return Object.assign({},s,{
        nome:   (document.getElementById('stato-nome-'+s.id)||{}).value || s.nome,
        colore: (document.getElementById('stato-col-'+s.id)||{}).value  || s.colore
      });
    });
    document.getElementById('modal-stati').classList.remove('open');
  }

  /* ===== HELPERS ===== */
  function _val(id){ var el=document.getElementById(id); return el?el.value.trim():''; }
  function _tipoColore(n){ var t=tipologie.find(function(x){return x.nome===n;}); return t?t.colore:'#64748b'; }
  function _statoColore(n){ var s=stati.find(function(x){return x.nome===n;}); return s?s.colore:'#64748b'; }

  /* ===== API PUBBLICA ===== */
  return {
    init: init,
    nuovoCliente: nuovoCliente,
    apriCliente:  apriCliente,
    tornaLista:   tornaLista,
    eliminaCliente: eliminaCliente,
    salva: salva,
    aggiornaHeader: aggiornaHeader,
    addCollab:    function(d){ addCollab(d); },
    removeCollab: removeCollab,
    moveCollab:   moveCollab,
    openModalTipologie: openModalTipologie,
    openModalStati:     openModalStati,
    addTipologia: addTipologia,
    saveTipologie: saveTipologie,
    addStato:  addStato,
    saveStati: saveStati,
    _moveTipo:  _moveTipo,
    _delTipo:   _delTipo,
    _moveStato: _moveStato,
    _delStato:  _delStato
  };
})();

document.addEventListener('DOMContentLoaded', function(){ MSK_Clienti.init(); });
