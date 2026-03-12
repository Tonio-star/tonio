/* ================================================================
   TONIO — Msk_Prenotazioni.js
   Modulo Operativo — Maschera Prenotazioni
   v1.0 — Lista prenotazioni + form nuova/modifica in unica schermata
   Lookup dinamici da: IMMOBILI (SuperProdotti, Prodotti, Vie, Tipi, Piani)
                       CLIENTI, OSPITI
   ================================================================ */

var MSK_Prenotazioni = (function () {

  /* ================================================================
     DATI IN MEMORIA
  ================================================================ */
  var _prenotazioni = [];
  var _editId       = null;   /* null = nuova, number = modifica */
  var _filtriAperti = false;

  /* ================================================================
     INIT
  ================================================================ */
  function init() {
    var saved = TONIO_Storage.load('prenotazioni');
    _prenotazioni = saved ? saved : JSON.parse(JSON.stringify(TONIO_PRENOTAZIONI));
    _renderPage();
  }

  /* ================================================================
     HELPER — legge gli archivi dai moduli esistenti (lookup)
  ================================================================ */
  function _getSuperProdotti() {
    return (typeof TONIO_IMMOBILI_SUPERPRODOTTI !== 'undefined') ? TONIO_IMMOBILI_SUPERPRODOTTI : [];
  }
  function _getProdotti() {
    return (typeof TONIO_IMMOBILI_PRODOTTI !== 'undefined') ? TONIO_IMMOBILI_PRODOTTI : [];
  }
  function _getTipiImmobile() {
    return (typeof TONIO_IMMOBILI_TIPI !== 'undefined') ? TONIO_IMMOBILI_TIPI : [];
  }
  function _getPiani() {
    return (typeof TONIO_IMMOBILI_PIANI !== 'undefined') ? TONIO_IMMOBILI_PIANI : [];
  }
  function _getImmobili() {
    return (typeof TONIO_IMMOBILI !== 'undefined') ? TONIO_IMMOBILI : [];
  }
  function _getClienti() {
    return (typeof TONIO_CLIENTI !== 'undefined') ? TONIO_CLIENTI : [];
  }
  function _getOspiti() {
    return (typeof TONIO_OSPITI !== 'undefined') ? TONIO_OSPITI : [];
  }

  /* Genera <option> per select da array {id, nome} */
  function _optsById(arr, selectedId) {
    var h = '<option value="">— Seleziona —</option>';
    arr.forEach(function (item) {
      h += '<option value="' + item.id + '"' + (item.id === selectedId ? ' selected' : '') + '>' + TONIO_escapeHtml(item.nome) + '</option>';
    });
    return h;
  }

  /* Genera <option> per select Clienti/Ospiti da array {id, nominativo} */
  function _optsAnag(arr, selectedId) {
    var h = '<option value="">— Seleziona —</option>';
    arr.forEach(function (item) {
      h += '<option value="' + item.id + '"' + (item.id === selectedId ? ' selected' : '') + '>' + TONIO_escapeHtml(item.nominativo) + '</option>';
    });
    return h;
  }

  /* Trova il nome da id in un array {id, nome} */
  function _nomeById(arr, id) {
    if (!id) return '—';
    var found = arr.find(function (x) { return x.id === id || x.id === parseInt(id, 10); });
    return found ? found.nome : '—';
  }

  /* Calcola notti tra due datetime string */
  function _calcolaNotti(dal, al) {
    if (!dal || !al) return 0;
    var d1 = new Date(dal);
    var d2 = new Date(al);
    if (isNaN(d1) || isNaN(d2)) return 0;
    var diff = d2 - d1;
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
  }

  /* Genera numero prenotazione progressivo */
  function _nuovoNumero() {
    var anno = new Date().getFullYear();
    var max  = 0;
    _prenotazioni.forEach(function (p) {
      var m = (p.numero_prenotazione || '').match(/(\d+)$/);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    });
    return 'PRE-' + anno + '-' + String(max + 1).padStart(3, '0');
  }

  /* ================================================================
     RENDER PAGINA PRINCIPALE
  ================================================================ */
  function _renderPage() {
    var c = document.getElementById('page-prenotazioni');
    if (!c) return;

    var superProds     = _getSuperProdotti();
    var prods          = _getProdotti();
    var tipiImmobile   = _getTipiImmobile();
    var piani          = _getPiani();
    var immobili       = _getImmobili();
    var clienti        = _getClienti();
    var ospiti         = _getOspiti();

    /* Vie univoche dagli immobili */
    var vieMap = {};
    immobili.forEach(function (imm) {
      if (imm.via && !vieMap[imm.id]) {
        vieMap[imm.id] = imm.via + (imm.numero ? ', ' + imm.numero : '') + (imm.comune ? ' — ' + imm.comune : '');
      }
    });
    var vieArr = immobili.map(function (imm) {
      return { id: imm.id, nome: imm.immobile + (imm.via ? ' (' + imm.via + ')' : '') };
    });

    /* Valori correnti del form (se in modifica) */
    var rec = _editId !== null ? (_prenotazioni.find(function (p) { return p.id === _editId; }) || null) : null;
    var isNew = !rec;

    var vDal           = rec ? (rec.dal || '') : '';
    var vAl            = rec ? (rec.al  || '') : '';
    var vNotti         = rec ? (rec.notti || 0) : 0;
    var vSuperProd     = rec ? (rec.super_prodotto_id || '') : '';
    var vProd          = rec ? (rec.prodotto_id || '') : '';
    var vVia           = rec ? (rec.via_immobile_id || '') : '';
    var vTipoImm       = rec ? (rec.tipo_immobile_id || '') : '';
    var vPostiLetto    = rec ? (rec.posti_letto || '') : '';
    var vPiano         = rec ? (rec.piano_id || '') : '';
    var vCliente       = rec ? (rec.cliente_id || '') : '';
    var vOspite        = rec ? (rec.ospite_id || '') : '';
    var vNote          = rec ? (rec.note || '') : '';
    var vNumero        = rec ? (rec.numero_prenotazione || '') : '';
    var vProtocollo    = rec ? (rec.protocollo || '') : '';

    c.innerHTML =
      '<div class="list-page">' +

        /* ── HEADER ── */
        '<div class="list-header" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:0">' +
          '<div style="display:flex;align-items:center;gap:12px">' +
            '<h1 class="list-title" style="margin:0">📅 Prenotazioni</h1>' +
            '<span class="list-count" id="pre-count"></span>' +
          '</div>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">' +
            '<button class="btn btn-ghost" style="font-size:12px;padding:6px 12px" onclick="MSK_Prenotazioni.toggleFiltri()">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px"><polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/></svg>' +
              'Filtri' +
            '</button>' +
          '</div>' +
        '</div>' +

        /* ── PANNELLO FILTRI (nascosto di default) ── */
        '<div id="pre-filtri-panel" style="display:none;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-top:12px;margin-bottom:8px">' +
          '<div style="font-size:11px;font-weight:700;color:#64748b;letter-spacing:.6px;text-transform:uppercase;margin-bottom:12px">🔍 FILTRI RICERCA</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:12px">' +
            '<div class="form-group" style="flex:1 1 200px">' +
              '<label class="form-label" style="font-size:11px">Cliente o Ospite</label>' +
              '<input class="form-input" type="text" id="flt-anag" placeholder="Cerca nome..." oninput="MSK_Prenotazioni.applyFiltri()" style="height:34px;font-size:13px">' +
            '</div>' +
            '<div class="form-group" style="flex:1 1 160px">' +
              '<label class="form-label" style="font-size:11px">Check-In dal</label>' +
              '<input class="form-input" type="date" id="flt-checkin" oninput="MSK_Prenotazioni.applyFiltri()" style="height:34px;font-size:13px">' +
            '</div>' +
            '<div class="form-group" style="flex:1 1 160px">' +
              '<label class="form-label" style="font-size:11px">Check-Out al</label>' +
              '<input class="form-input" type="date" id="flt-checkout" oninput="MSK_Prenotazioni.applyFiltri()" style="height:34px;font-size:13px">' +
            '</div>' +
            '<div class="form-group" style="flex:1 1 180px">' +
              '<label class="form-label" style="font-size:11px">N° Prenotazione / Protocollo</label>' +
              '<input class="form-input" type="text" id="flt-numero" placeholder="PRE-..." oninput="MSK_Prenotazioni.applyFiltri()" style="height:34px;font-size:13px">' +
            '</div>' +
            '<div class="form-group" style="flex:1 1 150px">' +
              '<label class="form-label" style="font-size:11px">Super Prodotto</label>' +
              '<select class="form-input" id="flt-superprod" onchange="MSK_Prenotazioni.applyFiltri()" style="height:34px;font-size:13px">' + _optsById(superProds, '') + '</select>' +
            '</div>' +
            '<div class="form-group" style="flex:1 1 150px">' +
              '<label class="form-label" style="font-size:11px">Prodotto</label>' +
              '<select class="form-input" id="flt-prod" onchange="MSK_Prenotazioni.applyFiltri()" style="height:34px;font-size:13px">' + _optsById(prods, '') + '</select>' +
            '</div>' +
            '<div class="form-group" style="flex:1 1 180px">' +
              '<label class="form-label" style="font-size:11px">Immobile</label>' +
              '<select class="form-input" id="flt-immobile" onchange="MSK_Prenotazioni.applyFiltri()" style="height:34px;font-size:13px">' + _optsById(vieArr, '') + '</select>' +
            '</div>' +
          '</div>' +
          '<div style="margin-top:10px">' +
            '<button class="btn btn-ghost" style="font-size:12px" onclick="MSK_Prenotazioni.resetFiltri()">✕ Reset filtri</button>' +
          '</div>' +
        '</div>' +

        /* ── FORM NUOVA / MODIFICA PRENOTAZIONE ── */
        '<div style="background:#f0f4ff;border:1px solid #c7d7f5;border-radius:8px;padding:18px 20px;margin-top:16px;margin-bottom:20px">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px">' +
            '<div style="font-size:12px;font-weight:700;color:#1e3a5f;letter-spacing:.6px;text-transform:uppercase">' +
              (isNew ? '＋ NUOVA PRENOTAZIONE' : '✏️ MODIFICA PRENOTAZIONE — ' + TONIO_escapeHtml(vNumero)) +
            '</div>' +
            (!isNew ? '<button class="btn btn-ghost" style="font-size:12px" onclick="MSK_Prenotazioni.nuovaPrenotazione()">＋ Nuova</button>' : '') +
          '</div>' +

          /* ── Riga 0: Numero, Protocollo ── */
          '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:14px">' +
            '<div class="form-group" style="flex:1 1 160px">' +
              '<label class="form-label" style="font-size:11px">N° Prenotazione</label>' +
              '<input class="form-input" type="text" id="pre-numero" value="' + TONIO_escapeHtml(vNumero) + '" placeholder="Auto" style="height:36px;font-size:13px">' +
            '</div>' +
            '<div class="form-group" style="flex:1 1 160px">' +
              '<label class="form-label" style="font-size:11px">Protocollo</label>' +
              '<input class="form-input" type="text" id="pre-protocollo" value="' + TONIO_escapeHtml(vProtocollo) + '" placeholder="Es. PROT-001" style="height:36px;font-size:13px">' +
            '</div>' +
            '<div class="form-group" style="flex:1 1 160px">' +
              '<label class="form-label" style="font-size:11px">Cliente</label>' +
              '<select class="form-input" id="pre-cliente" style="height:36px;font-size:13px">' + _optsAnag(clienti, parseInt(vCliente, 10)) + '</select>' +
            '</div>' +
            '<div class="form-group" style="flex:1 1 160px">' +
              '<label class="form-label" style="font-size:11px">Ospite</label>' +
              '<select class="form-input" id="pre-ospite" style="height:36px;font-size:13px">' + _optsAnag(ospiti, parseInt(vOspite, 10)) + '</select>' +
            '</div>' +
          '</div>' +

          /* ── Separatore — Date Richieste ── */
          '<div style="font-size:11px;font-weight:700;color:#1e3a5f;letter-spacing:.5px;text-transform:uppercase;background:#dbeafe;padding:5px 10px;border-radius:4px;margin-bottom:10px">📅 DATE RICHIESTE</div>' +

          /* ── Riga 1: Date + Immobile (tutti in fila) ── */
          '<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;margin-bottom:14px">' +

            /* Dal */
            '<div class="form-group" style="flex:1 1 180px">' +
              '<label class="form-label" style="font-size:11px">Dal (data e ora) <span class="req">*</span></label>' +
              '<input class="form-input" type="datetime-local" id="pre-dal" value="' + TONIO_escapeHtml(vDal) + '" onchange="MSK_Prenotazioni.aggiornaNotti()" style="height:36px;font-size:13px">' +
            '</div>' +

            /* Al */
            '<div class="form-group" style="flex:1 1 180px">' +
              '<label class="form-label" style="font-size:11px">Al (data e ora) <span class="req">*</span></label>' +
              '<input class="form-input" type="datetime-local" id="pre-al" value="' + TONIO_escapeHtml(vAl) + '" onchange="MSK_Prenotazioni.aggiornaNotti()" style="height:36px;font-size:13px">' +
            '</div>' +

            /* Notti (calcolato) */
            '<div class="form-group" style="flex:0 0 100px">' +
              '<label class="form-label" style="font-size:11px">Notti</label>' +
              '<input class="form-input" type="text" id="pre-notti" value="' + vNotti + '" readonly style="height:36px;font-size:13px;background:#e0f2fe;color:#0369a1;font-weight:700;text-align:center;cursor:default">' +
            '</div>' +

            /* Super Prodotto */
            '<div class="form-group" style="flex:1 1 140px">' +
              '<label class="form-label" style="font-size:11px">Super Prodotto</label>' +
              '<select class="form-input" id="pre-superprod" style="height:36px;font-size:13px">' + _optsById(superProds, parseInt(vSuperProd, 10)) + '</select>' +
            '</div>' +

            /* Prodotto */
            '<div class="form-group" style="flex:1 1 140px">' +
              '<label class="form-label" style="font-size:11px">Prodotto</label>' +
              '<select class="form-input" id="pre-prod" style="height:36px;font-size:13px">' + _optsById(prods, parseInt(vProd, 10)) + '</select>' +
            '</div>' +

            /* Immobile / Via */
            '<div class="form-group" style="flex:1 1 180px">' +
              '<label class="form-label" style="font-size:11px">Immobile / Via</label>' +
              '<select class="form-input" id="pre-via" style="height:36px;font-size:13px">' + _optsById(vieArr, parseInt(vVia, 10)) + '</select>' +
            '</div>' +

            /* Tipo Immobile */
            '<div class="form-group" style="flex:1 1 130px">' +
              '<label class="form-label" style="font-size:11px">Tipo Immobile</label>' +
              '<select class="form-input" id="pre-tipo-imm" style="height:36px;font-size:13px">' + _optsById(tipiImmobile, parseInt(vTipoImm, 10)) + '</select>' +
            '</div>' +

            /* Posti Letto */
            '<div class="form-group" style="flex:0 0 90px">' +
              '<label class="form-label" style="font-size:11px">Posti Letto</label>' +
              '<input class="form-input" type="number" id="pre-posti" value="' + TONIO_escapeHtml(String(vPostiLetto)) + '" min="1" step="1" style="height:36px;font-size:13px">' +
            '</div>' +

            /* Piano */
            '<div class="form-group" style="flex:1 1 120px">' +
              '<label class="form-label" style="font-size:11px">Piano</label>' +
              '<select class="form-input" id="pre-piano" style="height:36px;font-size:13px">' + _optsById(piani, parseInt(vPiano, 10)) + '</select>' +
            '</div>' +

          '</div>' +

          /* ── Note ── */
          '<div class="form-group" style="margin-bottom:14px">' +
            '<label class="form-label" style="font-size:11px">Note</label>' +
            '<textarea class="form-input" id="pre-note" rows="2" placeholder="Annotazioni libere..." style="font-size:13px;resize:vertical">' + TONIO_escapeHtml(vNote) + '</textarea>' +
          '</div>' +

          /* ── Pulsanti azione ── */
          '<div style="display:flex;flex-wrap:wrap;gap:8px">' +
            '<button class="btn btn-primary" style="font-size:13px" onclick="MSK_Prenotazioni.salva()">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>' +
              'Salva Prenotazione' +
            '</button>' +
            (!isNew ?
            '<button class="btn btn-danger" style="font-size:13px" onclick="MSK_Prenotazioni.elimina(' + _editId + ')">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/></svg>' +
              'Elimina' +
            '</button>' : '') +
            (!isNew ?
            '<button class="btn btn-ghost" style="font-size:13px" onclick="MSK_Prenotazioni.nuovaPrenotazione()">Annulla</button>' : '') +
          '</div>' +

        '</div>' +

        /* ── LISTA PRENOTAZIONI ── */
        '<div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:8px">' +
            '<div style="font-size:11px;font-weight:700;color:#1e3a5f;letter-spacing:.6px;text-transform:uppercase">📂 Prenotazioni Salvate</div>' +
            '<input class="search-input" id="pre-search" type="text" placeholder="🔍 Cerca prenotazione..." oninput="MSK_Prenotazioni.filterList()" style="max-width:280px;font-size:13px">' +
          '</div>' +
          '<div style="overflow-x:auto">' +
            '<table class="data-table" style="min-width:900px">' +
              '<thead>' +
                '<tr>' +
                  '<th>N° Prenotazione</th>' +
                  '<th>Protocollo</th>' +
                  '<th>Cliente</th>' +
                  '<th>Ospite</th>' +
                  '<th>Check-In</th>' +
                  '<th>Check-Out</th>' +
                  '<th style="text-align:center">Notti</th>' +
                  '<th>Immobile</th>' +
                  '<th>Super Prod.</th>' +
                  '<th style="width:80px"></th>' +
                '</tr>' +
              '</thead>' +
              '<tbody id="pre-tbody"></tbody>' +
            '</table>' +
          '</div>' +
        '</div>' +

      '</div>';

    _renderRows(_prenotazioni);
    _aggiornaCount(_prenotazioni.length);
  }

  /* ================================================================
     RENDER RIGHE LISTA
  ================================================================ */
  function _renderRows(list) {
    var tbody = document.getElementById('pre-tbody');
    if (!tbody) return;

    var clienti    = _getClienti();
    var ospiti     = _getOspiti();
    var superProds = _getSuperProdotti();
    var immobili   = _getImmobili();

    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:32px;color:#94a3b8">Nessuna prenotazione trovata</td></tr>';
      return;
    }

    var html = '';
    list.forEach(function (p) {
      var nomeCli    = _nomeByIdAnag(clienti, p.cliente_id);
      var nomeOsp    = _nomeByIdAnag(ospiti,  p.ospite_id);
      var nomeSP     = _nomeById(superProds, p.super_prodotto_id);
      var nomeImm    = _nomeByIdImm(immobili, p.via_immobile_id);
      var dalFmt     = p.dal  ? p.dal.replace('T', ' ').substring(0, 16) : '—';
      var alFmt      = p.al   ? p.al.replace('T', ' ').substring(0, 16)  : '—';
      var isActive   = p.id === _editId;

      html +=
        '<tr class="data-row' + (isActive ? ' active-row' : '') + '" onclick="MSK_Prenotazioni.carica(' + p.id + ')" style="' + (isActive ? 'background:#eff6ff;font-weight:600' : '') + '">' +
          '<td><strong>' + TONIO_escapeHtml(p.numero_prenotazione || '—') + '</strong></td>' +
          '<td>' + TONIO_escapeHtml(p.protocollo || '—') + '</td>' +
          '<td>' + TONIO_escapeHtml(nomeCli) + '</td>' +
          '<td>' + TONIO_escapeHtml(nomeOsp) + '</td>' +
          '<td style="white-space:nowrap">' + TONIO_escapeHtml(dalFmt) + '</td>' +
          '<td style="white-space:nowrap">' + TONIO_escapeHtml(alFmt) + '</td>' +
          '<td style="text-align:center"><span class="badge" style="background:#eff6ff;color:#3b82f6;border:1px solid #bfdbfe">' + (p.notti || 0) + '</span></td>' +
          '<td>' + TONIO_escapeHtml(nomeImm) + '</td>' +
          '<td>' + TONIO_escapeHtml(nomeSP) + '</td>' +
          '<td onclick="event.stopPropagation()">' +
            '<button class="btn-icon btn-danger" title="Elimina" onclick="MSK_Prenotazioni.elimina(' + p.id + ')">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/><path d="M9,6V4h6v2"/></svg>' +
            '</button>' +
          '</td>' +
        '</tr>';
    });
    tbody.innerHTML = html;
  }

  function _nomeByIdAnag(arr, id) {
    if (!id) return '—';
    var found = arr.find(function (x) { return x.id === id || x.id === parseInt(id, 10); });
    return found ? found.nominativo : '—';
  }

  function _nomeByIdImm(arr, id) {
    if (!id) return '—';
    var found = arr.find(function (x) { return x.id === id || x.id === parseInt(id, 10); });
    return found ? found.immobile : '—';
  }

  function _aggiornaCount(n) {
    var c = document.getElementById('pre-count');
    if (c) c.textContent = n + ' prenotazioni';
  }

  /* ================================================================
     CALCOLO NOTTI IN TEMPO REALE
  ================================================================ */
  function aggiornaNotti() {
    var dal   = document.getElementById('pre-dal');
    var al    = document.getElementById('pre-al');
    var notti = document.getElementById('pre-notti');
    if (!dal || !al || !notti) return;
    notti.value = _calcolaNotti(dal.value, al.value);
  }

  /* ================================================================
     NUOVA PRENOTAZIONE (reset form)
  ================================================================ */
  function nuovaPrenotazione() {
    _editId = null;
    _renderPage();
  }

  /* ================================================================
     CARICA PRENOTAZIONE NEL FORM
  ================================================================ */
  function carica(id) {
    _editId = id;
    _renderPage();
    /* scroll al form */
    var c = document.getElementById('page-prenotazioni');
    if (c) c.scrollTop = 0;
  }

  /* ================================================================
     SALVA
  ================================================================ */
  function salva() {
    var numero     = (document.getElementById('pre-numero').value     || '').trim();
    var protocollo = (document.getElementById('pre-protocollo').value || '').trim();
    var dal        = (document.getElementById('pre-dal').value        || '').trim();
    var al         = (document.getElementById('pre-al').value         || '').trim();
    var notti      = parseInt(document.getElementById('pre-notti').value, 10) || 0;
    var superprod  = document.getElementById('pre-superprod').value;
    var prod       = document.getElementById('pre-prod').value;
    var via        = document.getElementById('pre-via').value;
    var tipoImm    = document.getElementById('pre-tipo-imm').value;
    var posti      = parseInt(document.getElementById('pre-posti').value, 10) || 0;
    var piano      = document.getElementById('pre-piano').value;
    var cliente    = document.getElementById('pre-cliente').value;
    var ospite     = document.getElementById('pre-ospite').value;
    var note       = (document.getElementById('pre-note').value       || '').trim();

    if (!dal) { alert('⚠️ Inserire la data di Check-In (Dal).'); document.getElementById('pre-dal').focus(); return; }
    if (!al)  { alert('⚠️ Inserire la data di Check-Out (Al).'); document.getElementById('pre-al').focus();  return; }
    if (new Date(al) <= new Date(dal)) { alert('⚠️ La data Al deve essere successiva alla data Dal.'); return; }

    if (!numero) numero = _nuovoNumero();

    var data = {
      numero_prenotazione: numero,
      protocollo:          protocollo,
      dal:                 dal,
      al:                  al,
      notti:               notti,
      super_prodotto_id:   superprod  ? parseInt(superprod,  10) : null,
      prodotto_id:         prod       ? parseInt(prod,       10) : null,
      via_immobile_id:     via        ? parseInt(via,        10) : null,
      tipo_immobile_id:    tipoImm    ? parseInt(tipoImm,    10) : null,
      posti_letto:         posti      || null,
      piano_id:            piano      ? parseInt(piano,      10) : null,
      cliente_id:          cliente    ? parseInt(cliente,    10) : null,
      ospite_id:           ospite     ? parseInt(ospite,     10) : null,
      note:                note,
      attivo:              true
    };

    if (_editId === null) {
      var newId = _prenotazioni.length > 0 ? Math.max.apply(null, _prenotazioni.map(function (p) { return p.id; })) + 1 : 1;
      data.id = newId;
      _prenotazioni.push(data);
      _editId = newId;
    } else {
      var idx = _prenotazioni.findIndex(function (p) { return p.id === _editId; });
      if (idx !== -1) {
        data.id = _editId;
        _prenotazioni[idx] = data;
      }
    }

    TONIO_Storage.save('prenotazioni', _prenotazioni);
    _renderPage();

    /* Evidenzia la riga appena salvata */
    setTimeout(function () {
      var row = document.querySelector('#pre-tbody tr.active-row');
      if (row) row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }

  /* ================================================================
     ELIMINA
  ================================================================ */
  function elimina(id) {
    var rec = _prenotazioni.find(function (p) { return p.id === id; });
    if (!rec) return;
    if (!confirm('Eliminare la prenotazione "' + (rec.numero_prenotazione || id) + '"?\n\nL\'operazione non può essere annullata.')) return;
    _prenotazioni = _prenotazioni.filter(function (p) { return p.id !== id; });
    if (_editId === id) _editId = null;
    TONIO_Storage.save('prenotazioni', _prenotazioni);
    _renderPage();
  }

  /* ================================================================
     LIVE SEARCH
  ================================================================ */
  function filterList() {
    var q = ((document.getElementById('pre-search') || {}).value || '').toLowerCase();
    var clienti    = _getClienti();
    var ospiti     = _getOspiti();

    var filtered = _prenotazioni.filter(function (p) {
      var nomeCli = _nomeByIdAnag(clienti, p.cliente_id).toLowerCase();
      var nomeOsp = _nomeByIdAnag(ospiti,  p.ospite_id).toLowerCase();
      var num     = (p.numero_prenotazione || '').toLowerCase();
      var prot    = (p.protocollo || '').toLowerCase();
      return nomeCli.indexOf(q) !== -1 || nomeOsp.indexOf(q) !== -1 || num.indexOf(q) !== -1 || prot.indexOf(q) !== -1;
    });
    _renderRows(filtered);
    _aggiornaCount(filtered.length);
  }

  /* ================================================================
     FILTRI
  ================================================================ */
  function toggleFiltri() {
    _filtriAperti = !_filtriAperti;
    var panel = document.getElementById('pre-filtri-panel');
    if (panel) panel.style.display = _filtriAperti ? '' : 'none';
  }

  function applyFiltri() {
    var anag     = ((document.getElementById('flt-anag')     || {}).value || '').toLowerCase();
    var checkin  =  (document.getElementById('flt-checkin')  || {}).value || '';
    var checkout =  (document.getElementById('flt-checkout') || {}).value || '';
    var numero   = ((document.getElementById('flt-numero')   || {}).value || '').toLowerCase();
    var spId     =  (document.getElementById('flt-superprod') || {}).value || '';
    var prodId   =  (document.getElementById('flt-prod')     || {}).value || '';
    var immId    =  (document.getElementById('flt-immobile') || {}).value || '';

    var clienti  = _getClienti();
    var ospiti   = _getOspiti();

    var filtered = _prenotazioni.filter(function (p) {
      var nomeCli = _nomeByIdAnag(clienti, p.cliente_id).toLowerCase();
      var nomeOsp = _nomeByIdAnag(ospiti,  p.ospite_id).toLowerCase();

      if (anag    && nomeCli.indexOf(anag) === -1 && nomeOsp.indexOf(anag) === -1) return false;
      if (checkin  && p.dal  && p.dal.substring(0, 10) < checkin)  return false;
      if (checkout && p.al   && p.al.substring(0, 10)  > checkout) return false;
      if (numero) {
        var n = (p.numero_prenotazione || '').toLowerCase();
        var pr = (p.protocollo || '').toLowerCase();
        if (n.indexOf(numero) === -1 && pr.indexOf(numero) === -1) return false;
      }
      if (spId   && String(p.super_prodotto_id)  !== spId)  return false;
      if (prodId && String(p.prodotto_id)         !== prodId) return false;
      if (immId  && String(p.via_immobile_id)     !== immId)  return false;

      return true;
    });

    _renderRows(filtered);
    _aggiornaCount(filtered.length);
  }

  function resetFiltri() {
    ['flt-anag','flt-checkin','flt-checkout','flt-numero','flt-superprod','flt-prod','flt-immobile'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.value = '';
    });
    _renderRows(_prenotazioni);
    _aggiornaCount(_prenotazioni.length);
  }

  /* ================================================================
     API PUBBLICA
  ================================================================ */
  return {
    init:               init,
    nuovaPrenotazione:  nuovaPrenotazione,
    carica:             carica,
    salva:              salva,
    elimina:            elimina,
    filterList:         filterList,
    aggiornaNotti:      aggiornaNotti,
    toggleFiltri:       toggleFiltri,
    applyFiltri:        applyFiltri,
    resetFiltri:        resetFiltri
  };

})();
