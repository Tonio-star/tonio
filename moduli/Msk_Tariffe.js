/* ================================================================
   TONIO — Msk_Tariffe.js
   Modulo Tariffe — Tipo Tariffa, Trattamento, Unità di Misura,
                    Tariffario (unica maschera inline)
   v3.0 — Lookup by ID per SuperProdotto, Prodotto, TipoImmobile
          (foreign key verso modulo Immobili — nessun dato duplicato)
   ================================================================ */

var MSK_Tariffe = (function () {

  /* ================================================================
     DATI IN MEMORIA
  ================================================================ */
  var _tipoTariffa  = [];
  var _trattamento  = [];
  var _unitaMisura  = [];
  var _tariffario   = [];

  /* id riga in modifica nel tariffario inline */
  var _editTariffId = null;
  /* contatore indici righe dettaglio */
  var _righeCount   = 0;

  /* ================================================================
     INIT
  ================================================================ */
  function init() {
    var savedTipo   = TONIO_Storage.load('tariffe_tipo');
    var savedTratt  = TONIO_Storage.load('tariffe_trattamento');
    var savedUnita  = TONIO_Storage.load('tariffe_unita_misura');
    var savedTariff = TONIO_Storage.load('tariffe_tariffario');

    _tipoTariffa = savedTipo   ? savedTipo   : JSON.parse(JSON.stringify(TONIO_TARIFFE_TIPO));
    _trattamento = savedTratt  ? savedTratt  : JSON.parse(JSON.stringify(TONIO_TARIFFE_TRATTAMENTO));
    _unitaMisura = savedUnita  ? savedUnita  : JSON.parse(JSON.stringify(TONIO_TARIFFE_UNITA_MISURA));
    _tariffario  = savedTariff ? savedTariff : JSON.parse(JSON.stringify(TONIO_TARIFFARIO));

    _renderTariffPage();
  }

  /* ================================================================
     HELPER LOOKUP — produce <option> con value=ID, testo=nome
     Usato per SuperProdotto, Prodotto, TipoImmobile
     (dati letti live dal modulo Immobili — nessuna copia locale)
  ================================================================ */

  /* Restituisce array da modulo Immobili */
  function _getSuperProdotti() {
    return (typeof TONIO_IMMOBILI_SUPERPRODOTTI !== 'undefined') ? TONIO_IMMOBILI_SUPERPRODOTTI : [];
  }
  function _getProdotti() {
    return (typeof TONIO_IMMOBILI_PRODOTTI !== 'undefined') ? TONIO_IMMOBILI_PRODOTTI : [];
  }
  function _getTipiImmobile() {
    return (typeof TONIO_IMMOBILI_TIPI !== 'undefined') ? TONIO_IMMOBILI_TIPI : [];
  }

  /* <option value="ID">Nome</option> — selectedId è un numero */
  function _optsById(arr, selectedId) {
    var h = '<option value="">— Seleziona —</option>';
    arr.forEach(function (item) {
      var sel = (item.id === selectedId || String(item.id) === String(selectedId)) ? ' selected' : '';
      h += '<option value="' + item.id + '"' + sel + '>' + TONIO_escapeHtml(item.nome) + '</option>';
    });
    return h;
  }

  /* <option value="nome">nome</option> — per Tipo Tariffa, Trattamento, Unità (archivi interni) */
  function _optsByNome(arr, selected) {
    var h = '<option value="">— Seleziona —</option>';
    arr.forEach(function (item) {
      h += '<option value="' + TONIO_escapeHtml(item.nome) + '"' + (item.nome === selected ? ' selected' : '') + '>' + TONIO_escapeHtml(item.nome) + '</option>';
    });
    return h;
  }

  /* Trova il nome di un elemento da id nell'array */
  function _nomeById(arr, id) {
    if (!id && id !== 0) return '—';
    var found = arr.find(function (x) { return String(x.id) === String(id); });
    return found ? found.nome : '—';
  }

  /* ================================================================
     MASCHERA PRINCIPALE — TARIFFARIO (unica pagina inline)
  ================================================================ */
  function _renderTariffPage() {
    var c = document.getElementById('page-tariffe');
    if (!c) return;

    var superProds   = _getSuperProdotti();
    var prods        = _getProdotti();

    /* Valori correnti se in editing */
    var curRec = _editTariffId !== null ? _tariffario.find(function (r) { return r.id === _editTariffId; }) : null;
    var curSP  = curRec ? (curRec.super_prodotto_id || '') : '';
    var curP   = curRec ? (curRec.prodotto_id       || '') : '';

    var righeHtml = _buildTariffRigheHtml();

    c.innerHTML =
      '<div class="list-page">' +

        /* ── HEADER ── */
        '<div class="list-header" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">' +
          '<div style="display:flex;align-items:center;gap:12px">' +
            '<h1 class="list-title" style="margin:0;white-space:nowrap">CREA TARIFFE</h1>' +
            '<span class="list-count" id="tar-count"></span>' +
          '</div>' +
          '<div style="display:flex;flex-direction:row;gap:8px;align-items:center;margin-left:auto">' +
            '<button class="btn btn-ghost" style="font-size:12px;padding:6px 12px;white-space:nowrap" onclick="MSK_Tariffe.openModalTipo()">🏷️ Tipo Tariffa</button>' +
            '<button class="btn btn-ghost" style="font-size:12px;padding:6px 12px;white-space:nowrap" onclick="MSK_Tariffe.openModalTratt()">🍽️ Trattamento</button>' +
            '<button class="btn btn-ghost" style="font-size:12px;padding:6px 12px;white-space:nowrap" onclick="MSK_Tariffe.openModalUnita()">📐 Unità di Misura</button>' +
          '</div>' +
        '</div>' +

        /* ── SEZIONE HEADER TARIFFA ── */
        '<div style="background:#f0f4ff;border:1px solid #c7d7f5;border-radius:8px;padding:16px 20px;margin-bottom:20px">' +
          '<div style="font-size:11px;font-weight:700;color:#1e3a5f;letter-spacing:.6px;text-transform:uppercase;margin-bottom:12px">📌 Dati Tariffa (unici per ogni tariffario)</div>' +
          '<div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end">' +

            /* ID */
            '<div class="form-group" style="flex:0 0 60px">' +
              '<label class="form-label" style="font-size:11px">ID</label>' +
              '<input class="form-input" type="text" id="tf-id" value="" readonly style="background:#f8fafc;color:#94a3b8;cursor:default;height:36px;font-size:13px;width:100%">' +
            '</div>' +

            /* Tipo Tariffa — value = nome (archivio interno) */
            '<div class="form-group" style="flex:1 1 150px">' +
              '<label class="form-label" style="font-size:11px">Tipo Tariffa <span class="req">*</span></label>' +
              '<select class="form-input" id="tf-tipo" style="height:36px;font-size:13px">' +
                _optsByNome(_tipoTariffa, curRec ? curRec.tipo_tariffa : '') +
              '</select>' +
            '</div>' +

            /* Trattamento — value = nome (archivio interno) */
            '<div class="form-group" style="flex:1 1 150px">' +
              '<label class="form-label" style="font-size:11px">Trattamento</label>' +
              '<select class="form-input" id="tf-tratt" style="height:36px;font-size:13px">' +
                _optsByNome(_trattamento, curRec ? curRec.trattamento : '') +
              '</select>' +
            '</div>' +

            /* ★ Super Prodotto — value = ID (foreign key → TONIO_IMMOBILI_SUPERPRODOTTI) */
            '<div class="form-group" style="flex:1 1 130px">' +
              '<label class="form-label" style="font-size:11px">Super Prodotto</label>' +
              '<select class="form-input" id="tf-superprod" style="height:36px;font-size:13px">' +
                _optsById(superProds, curSP) +
              '</select>' +
            '</div>' +

            /* ★ Prodotto — value = ID (foreign key → TONIO_IMMOBILI_PRODOTTI) */
            '<div class="form-group" style="flex:1 1 130px">' +
              '<label class="form-label" style="font-size:11px">Prodotto</label>' +
              '<select class="form-input" id="tf-prod" style="height:36px;font-size:13px">' +
                _optsById(prods, curP) +
              '</select>' +
            '</div>' +

            /* Unità di Misura — value = nome (archivio interno) */
            '<div class="form-group" style="flex:1 1 130px">' +
              '<label class="form-label" style="font-size:11px">Unità di Misura</label>' +
              '<select class="form-input" id="tf-unita" style="height:36px;font-size:13px">' +
                _optsByNome(_unitaMisura, curRec ? curRec.unita_misura : '') +
              '</select>' +
            '</div>' +

            /* % IVA */
            '<div class="form-group" style="flex:0 0 90px">' +
              '<label class="form-label" style="font-size:11px">% IVA</label>' +
              '<input class="form-input" type="number" id="tf-iva" value="' + (curRec && curRec.iva_perc !== undefined ? curRec.iva_perc : '') + '" min="0" max="100" step="1" placeholder="0" style="height:36px;font-size:13px;width:100%">' +
            '</div>' +

          '</div>' +

          /* Bottoni azione header */
          '<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">' +
            '<button class="btn btn-primary" style="font-size:13px" onclick="MSK_Tariffe.nuovaTariffa()">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
              'Nuova Tariffa' +
            '</button>' +
            '<button class="btn btn-warning" style="font-size:13px" id="tf-btn-salva-header" onclick="MSK_Tariffe.salvaTariffHeader()" style="display:none">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>' +
              'Salva Intestazione' +
            '</button>' +
            '<button class="btn btn-danger" style="font-size:13px;display:none" id="tf-btn-elimina-header" onclick="MSK_Tariffe.eliminaTariff()">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/></svg>' +
              'Elimina Tariffa' +
            '</button>' +
            '<button class="btn btn-ghost" style="font-size:13px;display:none" id="tf-btn-annulla" onclick="MSK_Tariffe.annullaTariff()">Annulla</button>' +
          '</div>' +
        '</div>' +

        /* ── SEZIONE RIGHE TARIFFARIO ── */
        '<div style="margin-bottom:10px;display:flex;justify-content:space-between;align-items:center">' +
          '<div style="font-size:11px;font-weight:700;color:#1e3a5f;letter-spacing:.6px;text-transform:uppercase">📋 Righe Tariffario</div>' +
          '<button class="btn btn-ghost" style="font-size:12px;padding:5px 10px" id="tf-btn-add-riga" onclick="MSK_Tariffe.addRiga()" disabled>＋ Aggiungi Riga</button>' +
        '</div>' +
        '<div style="overflow-x:auto">' +
          '<table class="data-table" style="min-width:1100px;font-size:12px">' +
            '<thead>' +
              '<tr>' +
                '<th colspan="4"></th>' +
                '<th colspan="1" style="text-align:center;background:#fff0f0;color:#b91c1c;border-bottom:2px solid #fca5a5;font-size:10px">Obbl.</th>' +
                '<th colspan="2" style="text-align:center;background:#dbeafe;color:#1d4ed8;border-bottom:2px solid #93c5fd;font-size:10px">Chi Paga</th>' +
                '<th colspan="4" style="text-align:center;background:#fef9c3;color:#854d0e;border-bottom:2px solid #fde047;font-size:10px">Fatturare a</th>' +
                '<th colspan="2"></th>' +
              '</tr>' +
              '<tr style="background:#f1f5f9">' +
                '<th>Tipo Immobile</th>' +
                '<th>Dal</th>' +
                '<th>Al</th>' +
                '<th style="min-width:130px">Importo</th>' +
                '<th style="text-align:center;background:#fff0f0">Obblig.</th>' +
                '<th style="text-align:center;background:#dbeafe">Cli</th>' +
                '<th style="text-align:center;background:#dcfce7">Osp</th>' +
                '<th style="text-align:center;background:#fef9c3">Fat</th>' +
                '<th style="text-align:center;background:#94a3b8;color:#fff">NF</th>' +
                '<th style="text-align:center;background:#dbeafe">Cli</th>' +
                '<th style="text-align:center;background:#dcfce7">Osp</th>' +
                '<th style="text-align:center;width:60px">Ord.</th>' +
                '<th style="width:40px"></th>' +
              '</tr>' +
            '</thead>' +
            '<tbody id="tar-righe-tbody">' + righeHtml + '</tbody>' +
          '</table>' +
        '</div>' +

        /* Pulsante salva righe */
        '<div style="margin-top:14px">' +
          '<button class="btn btn-primary" style="font-size:13px;display:none" id="tf-btn-salva-righe" onclick="MSK_Tariffe.salvaRighe()">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>' +
            'Salva Righe' +
          '</button>' +
        '</div>' +

        /* ── LISTA TARIFFE SALVATE ── */
        '<div style="margin-top:32px">' +
          '<div style="font-size:11px;font-weight:700;color:#1e3a5f;letter-spacing:.6px;text-transform:uppercase;margin-bottom:10px">📂 Tariffe Salvate</div>' +
          '<div style="margin-bottom:10px">' +
            '<input class="search-input" id="tar-search" type="text" placeholder="🔍 Cerca tariffa..." oninput="MSK_Tariffe.filterTariff()" style="max-width:320px">' +
          '</div>' +
          '<div class="table-wrap" style="overflow-x:auto">' +
            '<table class="data-table" style="min-width:800px">' +
              '<thead><tr>' +
                '<th>Tipo Tariffa</th>' +
                '<th>Trattamento</th>' +
                '<th>Super Prodotto</th>' +
                '<th>Prodotto</th>' +
                '<th>Unità di Misura</th>' +
                '<th style="width:70px">% IVA</th>' +
                '<th style="width:70px">Righe</th>' +
                '<th style="width:80px"></th>' +
              '</tr></thead>' +
              '<tbody id="tar-lista-tbody"></tbody>' +
            '</table>' +
          '</div>' +
        '</div>' +

      '</div>';

    _renderListaTariffe(_tariffario);
    _aggiornaCount();

    /* Ripristina visibilità pulsanti se in editing */
    if (_editTariffId !== null) {
      var elId = document.getElementById('tf-id');
      if (elId) elId.value = _editTariffId;
      _setBtnVisibility(true);
    }
  }

  /* ================================================================
     BUILD RIGHE TARIFFARIO
  ================================================================ */

  function _buildTariffRigheHtml() {
    if (_editTariffId === null) return '';
    var rec = _tariffario.find(function (r) { return r.id === _editTariffId; });
    if (!rec) return '';
    var html = '';
    (rec.righe || []).forEach(function (riga, idx) {
      html += _buildRigaHtml(riga, idx);
    });
    _righeCount = (rec.righe || []).length;
    return html;
  }

  /* ★ Tipo Immobile nella riga — value = ID (foreign key → TONIO_IMMOBILI_TIPI) */
  function _buildRigaHtml(riga, idx) {
    var tipiImmobile  = _getTipiImmobile();
    var curTipoId     = riga ? (riga.tipo_immobile_id || '') : '';
    var optsImmobile  = _optsById(tipiImmobile, curTipoId);

    return (
      '<tr class="tariff-riga" data-idx="' + idx + '">' +
        '<td style="min-width:150px">' +
          '<select class="form-input form-input-sm" id="tr-tipo-imm-' + idx + '">' + optsImmobile + '</select>' +
        '</td>' +
        '<td><input class="form-input form-input-sm" type="date" id="tr-dal-' + idx + '" value="' + (riga ? riga.dal || '' : '') + '"></td>' +
        '<td><input class="form-input form-input-sm" type="date" id="tr-al-'  + idx + '" value="' + (riga ? riga.al  || '' : '') + '"></td>' +
        '<td style="min-width:130px"><input class="form-input form-input-sm" type="number" id="tr-importo-' + idx + '" value="' + (riga ? riga.importo || '' : '') + '" step="0.01" min="0" max="999999.99" placeholder="0,00" style="text-align:right;width:125px"></td>' +
        '<td style="text-align:center;background:#fff0f0"><input type="checkbox" id="tr-obl-'    + idx + '"' + (riga && riga.obbligatorio  ? ' checked' : '') + '></td>' +
        '<td style="text-align:center;background:#dbeafe"><input type="checkbox" id="tr-cp-cli-' + idx + '"' + (riga && riga.chi_paga_cli  ? ' checked' : '') + '></td>' +
        '<td style="text-align:center;background:#dcfce7"><input type="checkbox" id="tr-cp-osp-' + idx + '"' + (riga && riga.chi_paga_osp  ? ' checked' : '') + '></td>' +
        '<td style="text-align:center;background:#fef9c3"><input type="checkbox" id="tr-fat-'    + idx + '"' + (riga && riga.fat_fat       ? ' checked' : '') + '></td>' +
        '<td style="text-align:center;background:#94a3b8"><input type="checkbox" id="tr-nf-'     + idx + '"' + (riga && riga.fat_nf        ? ' checked' : '') + '></td>' +
        '<td style="text-align:center;background:#dbeafe"><input type="checkbox" id="tr-fcli-'   + idx + '"' + (riga && riga.fatturare_cli ? ' checked' : '') + '></td>' +
        '<td style="text-align:center;background:#dcfce7"><input type="checkbox" id="tr-fosp-'   + idx + '"' + (riga && riga.fatturare_osp ? ' checked' : '') + '></td>' +
        '<td><input class="form-input form-input-sm" type="number" id="tr-ord-' + idx + '" value="' + (riga ? riga.ordinamento || (idx + 1) : (idx + 1)) + '" min="1" style="width:55px"></td>' +
        '<td style="text-align:center">' +
          '<button class="btn-icon btn-danger" title="Rimuovi riga" onclick="MSK_Tariffe.removeRiga(' + idx + ')" style="padding:4px 6px">' +
            '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/></svg>' +
          '</button>' +
        '</td>' +
      '</tr>'
    );
  }

  /* ================================================================
     RENDER LISTA TARIFFE SALVATE
     Mostra nomi descrittivi risolti dagli ID
  ================================================================ */
  function _renderListaTariffe(list) {
    var tbody = document.getElementById('tar-lista-tbody');
    if (!tbody) return;
    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:24px;color:#94a3b8">Nessuna tariffa salvata</td></tr>';
      return;
    }
    var superProds = _getSuperProdotti();
    var prods      = _getProdotti();
    var html = '';
    list.forEach(function (r) {
      var nRighe   = (r.righe || []).length;
      var isActive = r.id === _editTariffId;
      /* Risolve nomi da ID per la visualizzazione */
      var nomeSP  = r.super_prodotto_id ? _nomeById(superProds, r.super_prodotto_id) : (r.super_prodotto || '—');
      var nomeP   = r.prodotto_id       ? _nomeById(prods,      r.prodotto_id)       : (r.prodotto       || '—');
      html +=
        '<tr class="data-row' + (isActive ? ' active-row' : '') + '" onclick="MSK_Tariffe.caricaTariffa(' + r.id + ')" style="' + (isActive ? 'background:#eff6ff;font-weight:600' : '') + '">' +
          '<td><strong>' + TONIO_escapeHtml(r.tipo_tariffa || '—') + '</strong></td>' +
          '<td>' + TONIO_escapeHtml(r.trattamento  || '—') + '</td>' +
          '<td>' + TONIO_escapeHtml(nomeSP) + '</td>' +
          '<td>' + TONIO_escapeHtml(nomeP)  + '</td>' +
          '<td>' + TONIO_escapeHtml(r.unita_misura || '—') + '</td>' +
          '<td style="text-align:center">' + (r.iva_perc !== undefined ? r.iva_perc + '%' : '—') + '</td>' +
          '<td style="text-align:center"><span class="badge" style="background:#eff6ff;color:#3b82f6;border:1px solid #bfdbfe">' + nRighe + '</span></td>' +
          '<td onclick="event.stopPropagation()">' +
            '<button class="btn-icon btn-danger" title="Elimina" onclick="MSK_Tariffe.eliminaTariffId(' + r.id + ')">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/><path d="M9,6V4h6v2"/></svg>' +
            '</button>' +
          '</td>' +
        '</tr>';
    });
    tbody.innerHTML = html;
  }

  function _aggiornaCount() {
    var c = document.getElementById('tar-count');
    if (c) c.textContent = _tariffario.length + ' tariffe';
  }

  function _setBtnVisibility(editing) {
    var btnSalvaH   = document.getElementById('tf-btn-salva-header');
    var btnElimina  = document.getElementById('tf-btn-elimina-header');
    var btnAnnulla  = document.getElementById('tf-btn-annulla');
    var btnSalvaR   = document.getElementById('tf-btn-salva-righe');
    var btnAddRiga  = document.getElementById('tf-btn-add-riga');
    if (btnSalvaH)  btnSalvaH.style.display  = editing ? '' : 'none';
    if (btnElimina) btnElimina.style.display  = editing ? '' : 'none';
    if (btnAnnulla) btnAnnulla.style.display  = editing ? '' : 'none';
    if (btnSalvaR)  btnSalvaR.style.display   = editing ? '' : 'none';
    if (btnAddRiga) btnAddRiga.disabled        = !editing;
  }

  /* ================================================================
     CARICA TARIFFA NEL FORM
  ================================================================ */
  function caricaTariffa(id) {
    var rec = _tariffario.find(function (r) { return r.id === id; });
    if (!rec) return;
    _editTariffId = id;
    _righeCount   = 0;
    /* _renderTariffPage già popola i campi usando curRec */
    _renderTariffPage();
  }

  /* ================================================================
     NUOVA TARIFFA
  ================================================================ */
  function nuovaTariffa() {
    _editTariffId = null;
    _righeCount   = 0;
    _renderTariffPage();

    /* Mostra pulsanti inserimento */
    var btnSalvaH  = document.getElementById('tf-btn-salva-header');
    var btnAnnulla = document.getElementById('tf-btn-annulla');
    var btnAddRiga = document.getElementById('tf-btn-add-riga');
    var btnElimina = document.getElementById('tf-btn-elimina-header');
    var btnSalvaR  = document.getElementById('tf-btn-salva-righe');
    if (btnSalvaH)  { btnSalvaH.style.display = ''; btnSalvaH.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>Salva Intestazione'; }
    if (btnAnnulla) btnAnnulla.style.display = '';
    if (btnAddRiga) btnAddRiga.disabled = false;
    if (btnElimina) btnElimina.style.display = 'none';
    if (btnSalvaR)  btnSalvaR.style.display = '';
  }

  /* ================================================================
     LEGGI HEADER DAL DOM
  ================================================================ */
  function _leggiHeader() {
    var gv = function (id) { var el = document.getElementById(id); return el ? (el.value || '').trim() : ''; };
    return {
      tipo_tariffa:     gv('tf-tipo'),
      trattamento:      gv('tf-tratt'),
      /* ★ salva ID numerico per Super Prodotto e Prodotto */
      super_prodotto_id: gv('tf-superprod') ? parseInt(gv('tf-superprod'), 10) : null,
      prodotto_id:       gv('tf-prod')      ? parseInt(gv('tf-prod'),      10) : null,
      unita_misura:     gv('tf-unita'),
      iva_perc:         parseFloat(gv('tf-iva')) || 0
    };
  }

  /* ================================================================
     SALVA INTESTAZIONE TARIFFA
  ================================================================ */
  function salvaTariffHeader() {
    var h = _leggiHeader();
    if (!h.tipo_tariffa) { alert('⚠️ Selezionare il Tipo Tariffa.'); return; }

    if (_editTariffId === null) {
      var newId = _tariffario.length > 0 ? Math.max.apply(null, _tariffario.map(function (r) { return r.id; })) + 1 : 1;
      _tariffario.push({
        id:               newId,
        tipo_tariffa:     h.tipo_tariffa,
        trattamento:      h.trattamento,
        super_prodotto_id: h.super_prodotto_id,
        prodotto_id:       h.prodotto_id,
        unita_misura:     h.unita_misura,
        iva_perc:         h.iva_perc,
        righe:            []
      });
      _editTariffId = newId;
    } else {
      var rec = _tariffario.find(function (r) { return r.id === _editTariffId; });
      if (rec) {
        rec.tipo_tariffa      = h.tipo_tariffa;
        rec.trattamento       = h.trattamento;
        rec.super_prodotto_id = h.super_prodotto_id;
        rec.prodotto_id       = h.prodotto_id;
        rec.unita_misura      = h.unita_misura;
        rec.iva_perc          = h.iva_perc;
      }
    }

    TONIO_Storage.save('tariffe_tariffario', _tariffario);
    _setBtnVisibility(true);
    var elId = document.getElementById('tf-id');
    if (elId) elId.value = _editTariffId;
    _renderListaTariffe(_tariffario);
    _aggiornaCount();
    _showToast('Intestazione salvata ✓');
  }

  /* ================================================================
     AGGIUNGI / RIMUOVI RIGA
  ================================================================ */
  function addRiga() {
    var tbody = document.getElementById('tar-righe-tbody');
    if (!tbody) return;
    var idx = _righeCount++;
    tbody.insertAdjacentHTML('beforeend', _buildRigaHtml(null, idx));
  }

  function removeRiga(idx) {
    var row = document.querySelector('.tariff-riga[data-idx="' + idx + '"]');
    if (row) row.parentNode.removeChild(row);
  }

  /* ================================================================
     LEGGI RIGHE DAL DOM
     ★ tipo_immobile_id — salva ID numerico
  ================================================================ */
  function _leggiRighe() {
    var rows = document.querySelectorAll('.tariff-riga');
    var righe = [];
    rows.forEach(function (row) {
      var idx = parseInt(row.getAttribute('data-idx'), 10);
      var gv  = function (id) { var el = document.getElementById(id + '-' + idx); return el ? el.value : ''; };
      var gc  = function (id) { var el = document.getElementById(id + '-' + idx); return el ? el.checked : false; };
      var tipoImmVal = gv('tr-tipo-imm');
      righe.push({
        /* ★ ID numerico per il Tipo Immobile */
        tipo_immobile_id: tipoImmVal ? parseInt(tipoImmVal, 10) : null,
        dal:              gv('tr-dal'),
        al:               gv('tr-al'),
        importo:          parseFloat(gv('tr-importo')) || 0,
        obbligatorio:     gc('tr-obl'),
        chi_paga_cli:     gc('tr-cp-cli'),
        chi_paga_osp:     gc('tr-cp-osp'),
        fat_fat:          gc('tr-fat'),
        fat_nf:           gc('tr-nf'),
        fatturare_cli:    gc('tr-fcli'),
        fatturare_osp:    gc('tr-fosp'),
        ordinamento:      parseInt(gv('tr-ord'), 10) || 1
      });
    });
    return righe;
  }

  /* ================================================================
     SALVA RIGHE
  ================================================================ */
  function salvaRighe() {
    if (_editTariffId === null) { alert('⚠️ Prima salva l\'intestazione tariffa.'); return; }
    var rec = _tariffario.find(function (r) { return r.id === _editTariffId; });
    if (!rec) return;
    rec.righe = _leggiRighe();
    TONIO_Storage.save('tariffe_tariffario', _tariffario);
    _renderListaTariffe(_tariffario);
    _aggiornaCount();
    _showToast('Righe salvate ✓');
  }

  /* ================================================================
     ELIMINA TARIFFA
  ================================================================ */
  function eliminaTariff() {
    if (_editTariffId === null) return;
    eliminaTariffId(_editTariffId);
  }

  function eliminaTariffId(id) {
    var rec = _tariffario.find(function (r) { return r.id === id; });
    if (!rec) return;
    if (!confirm('Eliminare la tariffa "' + (rec.tipo_tariffa || id) + '"?\nL\'operazione non può essere annullata.')) return;
    _tariffario = _tariffario.filter(function (r) { return r.id !== id; });
    TONIO_Storage.save('tariffe_tariffario', _tariffario);
    if (_editTariffId === id) { _editTariffId = null; _righeCount = 0; }
    _renderTariffPage();
  }

  function annullaTariff() {
    _editTariffId = null;
    _righeCount   = 0;
    _renderTariffPage();
  }

  /* ================================================================
     LIVE SEARCH
  ================================================================ */
  function filterTariff() {
    var q = (document.getElementById('tar-search') ? document.getElementById('tar-search').value : '').toLowerCase();
    var superProds = _getSuperProdotti();
    var prods      = _getProdotti();
    _renderListaTariffe(_tariffario.filter(function (r) {
      var nomeSP = r.super_prodotto_id ? _nomeById(superProds, r.super_prodotto_id).toLowerCase() : (r.super_prodotto || '').toLowerCase();
      var nomeP  = r.prodotto_id       ? _nomeById(prods, r.prodotto_id).toLowerCase()           : (r.prodotto       || '').toLowerCase();
      return (r.tipo_tariffa  || '').toLowerCase().indexOf(q) !== -1 ||
             (r.trattamento   || '').toLowerCase().indexOf(q) !== -1 ||
             nomeSP.indexOf(q) !== -1 ||
             nomeP.indexOf(q)  !== -1;
    }));
  }

  /* ================================================================
     AGGIORNA SELECT HEADER dopo modifica lookup interni
     (SuperProdotto e Prodotto leggono sempre live da TONIO_IMMOBILI_*)
  ================================================================ */
  function _refreshHeaderSelects() {
    function setOptsByNome(elId, arr, curVal) {
      var el = document.getElementById(elId);
      if (!el) return;
      var h = '<option value="">— Seleziona —</option>';
      arr.forEach(function (item) {
        h += '<option value="' + TONIO_escapeHtml(item.nome) + '"' + (item.nome === curVal ? ' selected' : '') + '>' + TONIO_escapeHtml(item.nome) + '</option>';
      });
      el.innerHTML = h;
    }
    function setOptsById(elId, arr, curId) {
      var el = document.getElementById(elId);
      if (!el) return;
      el.innerHTML = _optsById(arr, curId);
    }
    var superProds = _getSuperProdotti();
    var prods      = _getProdotti();
    var curSP  = document.getElementById('tf-superprod') ? document.getElementById('tf-superprod').value : '';
    var curP   = document.getElementById('tf-prod')      ? document.getElementById('tf-prod').value      : '';
    setOptsByNome('tf-tipo',  _tipoTariffa, document.getElementById('tf-tipo')  ? document.getElementById('tf-tipo').value  : '');
    setOptsByNome('tf-tratt', _trattamento, document.getElementById('tf-tratt') ? document.getElementById('tf-tratt').value : '');
    setOptsById('tf-superprod', superProds, curSP);
    setOptsById('tf-prod',      prods,      curP);
    setOptsByNome('tf-unita', _unitaMisura, document.getElementById('tf-unita') ? document.getElementById('tf-unita').value : '');
  }

  /* ================================================================
     TOAST
  ================================================================ */
  function _showToast(msg) {
    var t = document.getElementById('tonio-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'tonio-toast';
      t.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#1e3a5f;color:#fff;padding:10px 20px;border-radius:8px;font-size:13px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,.2);transition:opacity .3s';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.style.opacity = '0'; }, 2000);
  }

  /* ================================================================
     MODALE TIPO TARIFFA
  ================================================================ */
  var _editTipo = null;

  function openModalTipo() { _editTipo = null; _renderModalTipo(); }

  function _renderModalTipo() {
    var ov = _getOrCreateOverlay('modal-tar-tipo');
    var html = '';
    _tipoTariffa.forEach(function (r) {
      html +=
        '<tr class="data-row" onclick="MSK_Tariffe._clickTipo(' + r.id + ')" id="tipo-row-' + r.id + '">' +
          '<td><span class="id-badge">' + r.id + '</span></td>' +
          '<td><span class="ordine-val">' + r.ordine + '</span></td>' +
          '<td><strong>' + TONIO_escapeHtml(r.nome) + '</strong></td>' +
          '<td onclick="event.stopPropagation()">' +
            '<button class="btn-icon btn-danger" onclick="MSK_Tariffe.eliminaTipo(' + r.id + ')">' +
              '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/></svg>' +
            '</button>' +
          '</td>' +
        '</tr>';
    });
    ov.innerHTML =
      '<div class="modal" style="max-width:600px">' +
        '<div class="modal-header">' +
          '<span style="font-size:19px">🏷️</span>' +
          '<div class="modal-title">Tipo Tariffa</div>' +
          '<button class="modal-close" onclick="MSK_Tariffe.closeModalTipo()">×</button>' +
        '</div>' +
        '<div class="modal-body">' +
          '<table class="data-table"><thead><tr><th style="width:60px">ID</th><th style="width:90px">Ordine</th><th>Tipo Tariffa</th><th style="width:50px"></th></tr></thead>' +
          '<tbody>' + html + '</tbody></table>' +
          '<div style="margin-top:14px;padding:12px;background:#f8fafc;border-radius:6px;border:1px solid #e2e8f0">' +
            '<div style="font-size:11px;font-weight:700;color:#64748b;margin-bottom:8px" id="tipo-form-title">＋ NUOVO TIPO TARIFFA</div>' +
            '<div style="display:flex;gap:10px;align-items:flex-end">' +
              '<div class="form-group" style="flex:0 0 80px"><label class="form-label" style="font-size:11px">Ordine</label><input class="form-input" type="number" id="tipo-ordine" value="' + (_tipoTariffa.length + 1) + '" min="1" style="height:34px"></div>' +
              '<div class="form-group" style="flex:1"><label class="form-label" style="font-size:11px">Tipo Tariffa <span class="req">*</span></label><input class="form-input" type="text" id="tipo-nome" placeholder="Es. Tariffa Alta Stagione" style="height:34px"></div>' +
              '<button class="btn btn-primary" style="height:34px;font-size:12px" onclick="MSK_Tariffe.salvaTipo()">Salva</button>' +
              '<button class="btn btn-ghost"   style="height:34px;font-size:12px" onclick="MSK_Tariffe.annullaTipo()">Annulla</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="modal-footer"><button class="btn btn-ghost" onclick="MSK_Tariffe.closeModalTipo()">Chiudi</button></div>' +
      '</div>';
    ov.classList.add('open');
  }

  function _clickTipo(id) {
    _editTipo = id;
    var rec = _tipoTariffa.find(function (r) { return r.id === id; });
    if (!rec) return;
    var title = document.getElementById('tipo-form-title');
    var elOrd = document.getElementById('tipo-ordine');
    var elNom = document.getElementById('tipo-nome');
    if (title) title.textContent = '✏️ MODIFICA TIPO TARIFFA';
    if (elOrd) elOrd.value = rec.ordine;
    if (elNom) elNom.value = rec.nome;
  }

  function salvaTipo() {
    var nome   = (document.getElementById('tipo-nome').value || '').trim();
    var ordine = parseInt(document.getElementById('tipo-ordine').value, 10) || 1;
    if (!nome) { alert('⚠️ Inserire il Tipo Tariffa.'); return; }
    if (_editTipo === null) {
      var newId = _tipoTariffa.length > 0 ? Math.max.apply(null, _tipoTariffa.map(function (r) { return r.id; })) + 1 : 1;
      _tipoTariffa.push({ id: newId, ordine: ordine, nome: nome });
    } else {
      var rec = _tipoTariffa.find(function (r) { return r.id === _editTipo; });
      if (rec) { rec.nome = nome; rec.ordine = ordine; }
    }
    _tipoTariffa.sort(function (a, b) { return a.ordine - b.ordine; });
    TONIO_Storage.save('tariffe_tipo', _tipoTariffa);
    _editTipo = null;
    _renderModalTipo();
    _refreshHeaderSelects();
  }

  function annullaTipo() {
    _editTipo = null;
    var title = document.getElementById('tipo-form-title'); if (title) title.textContent = '＋ NUOVO TIPO TARIFFA';
    var elNom = document.getElementById('tipo-nome');   if (elNom) elNom.value = '';
    var elOrd = document.getElementById('tipo-ordine'); if (elOrd) elOrd.value = _tipoTariffa.length + 1;
  }

  function eliminaTipo(id) {
    var rec = _tipoTariffa.find(function (r) { return r.id === id; });
    if (!rec) return;
    if (!confirm('Eliminare "' + rec.nome + '"?')) return;
    _tipoTariffa = _tipoTariffa.filter(function (r) { return r.id !== id; });
    TONIO_Storage.save('tariffe_tipo', _tipoTariffa);
    if (_editTipo === id) _editTipo = null;
    _renderModalTipo();
    _refreshHeaderSelects();
  }

  function closeModalTipo() {
    var ov = document.getElementById('modal-tar-tipo'); if (ov) ov.classList.remove('open');
    _editTipo = null;
  }

  /* ================================================================
     MODALE TRATTAMENTO
  ================================================================ */
  var _editTratt = null;

  function openModalTratt() { _editTratt = null; _renderModalTratt(); }

  function _renderModalTratt() {
    var ov = _getOrCreateOverlay('modal-tar-tratt');
    var html = '';
    _trattamento.forEach(function (r) {
      html +=
        '<tr class="data-row" onclick="MSK_Tariffe._clickTratt(' + r.id + ')">' +
          '<td><span class="id-badge">' + r.id + '</span></td>' +
          '<td><span class="ordine-val">' + r.ordine + '</span></td>' +
          '<td><strong>' + TONIO_escapeHtml(r.nome) + '</strong></td>' +
          '<td>' + TONIO_escapeHtml(r.definizione || '') + '</td>' +
          '<td onclick="event.stopPropagation()">' +
            '<button class="btn-icon btn-danger" onclick="MSK_Tariffe.eliminaTratt(' + r.id + ')">' +
              '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/></svg>' +
            '</button>' +
          '</td>' +
        '</tr>';
    });
    ov.innerHTML =
      '<div class="modal" style="max-width:700px">' +
        '<div class="modal-header">' +
          '<span style="font-size:19px">🍽️</span>' +
          '<div class="modal-title">Trattamento</div>' +
          '<button class="modal-close" onclick="MSK_Tariffe.closeModalTratt()">×</button>' +
        '</div>' +
        '<div class="modal-body">' +
          '<table class="data-table"><thead><tr><th style="width:60px">ID</th><th style="width:90px">Ordine</th><th>Trattamento</th><th>Definizione</th><th style="width:50px"></th></tr></thead>' +
          '<tbody>' + html + '</tbody></table>' +
          '<div style="margin-top:14px;padding:12px;background:#f8fafc;border-radius:6px;border:1px solid #e2e8f0">' +
            '<div style="font-size:11px;font-weight:700;color:#64748b;margin-bottom:8px" id="tratt-form-title">＋ NUOVO TRATTAMENTO</div>' +
            '<div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap">' +
              '<div class="form-group" style="flex:0 0 80px"><label class="form-label" style="font-size:11px">Ordine</label><input class="form-input" type="number" id="tratt-ordine" value="' + (_trattamento.length + 1) + '" min="1" style="height:34px"></div>' +
              '<div class="form-group" style="flex:1 1 150px"><label class="form-label" style="font-size:11px">Trattamento <span class="req">*</span></label><input class="form-input" type="text" id="tratt-nome" placeholder="Es. Bed & Breakfast" style="height:34px"></div>' +
              '<div class="form-group" style="flex:2 1 200px"><label class="form-label" style="font-size:11px">Definizione</label><input class="form-input" type="text" id="tratt-def" placeholder="Breve descrizione" style="height:34px"></div>' +
              '<button class="btn btn-primary" style="height:34px;font-size:12px" onclick="MSK_Tariffe.salvaTratt()">Salva</button>' +
              '<button class="btn btn-ghost"   style="height:34px;font-size:12px" onclick="MSK_Tariffe.annullaTratt()">Annulla</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="modal-footer"><button class="btn btn-ghost" onclick="MSK_Tariffe.closeModalTratt()">Chiudi</button></div>' +
      '</div>';
    ov.classList.add('open');
  }

  function _clickTratt(id) {
    _editTratt = id;
    var rec = _trattamento.find(function (r) { return r.id === id; });
    if (!rec) return;
    var title = document.getElementById('tratt-form-title');
    if (title) title.textContent = '✏️ MODIFICA TRATTAMENTO';
    var elOrd = document.getElementById('tratt-ordine'); if (elOrd) elOrd.value = rec.ordine;
    var elNom = document.getElementById('tratt-nome');   if (elNom) elNom.value = rec.nome;
    var elDef = document.getElementById('tratt-def');    if (elDef) elDef.value = rec.definizione || '';
  }

  function salvaTratt() {
    var nome   = (document.getElementById('tratt-nome').value || '').trim();
    var def    = (document.getElementById('tratt-def').value  || '').trim();
    var ordine = parseInt(document.getElementById('tratt-ordine').value, 10) || 1;
    if (!nome) { alert('⚠️ Inserire il Trattamento.'); return; }
    if (_editTratt === null) {
      var newId = _trattamento.length > 0 ? Math.max.apply(null, _trattamento.map(function (r) { return r.id; })) + 1 : 1;
      _trattamento.push({ id: newId, ordine: ordine, nome: nome, definizione: def });
    } else {
      var rec = _trattamento.find(function (r) { return r.id === _editTratt; });
      if (rec) { rec.nome = nome; rec.ordine = ordine; rec.definizione = def; }
    }
    _trattamento.sort(function (a, b) { return a.ordine - b.ordine; });
    TONIO_Storage.save('tariffe_trattamento', _trattamento);
    _editTratt = null;
    _renderModalTratt();
    _refreshHeaderSelects();
  }

  function annullaTratt() {
    _editTratt = null;
    var title = document.getElementById('tratt-form-title'); if (title) title.textContent = '＋ NUOVO TRATTAMENTO';
    var elNom = document.getElementById('tratt-nome');   if (elNom) elNom.value = '';
    var elDef = document.getElementById('tratt-def');    if (elDef) elDef.value = '';
    var elOrd = document.getElementById('tratt-ordine'); if (elOrd) elOrd.value = _trattamento.length + 1;
  }

  function eliminaTratt(id) {
    var rec = _trattamento.find(function (r) { return r.id === id; });
    if (!rec) return;
    if (!confirm('Eliminare "' + rec.nome + '"?')) return;
    _trattamento = _trattamento.filter(function (r) { return r.id !== id; });
    TONIO_Storage.save('tariffe_trattamento', _trattamento);
    if (_editTratt === id) _editTratt = null;
    _renderModalTratt();
    _refreshHeaderSelects();
  }

  function closeModalTratt() {
    var ov = document.getElementById('modal-tar-tratt'); if (ov) ov.classList.remove('open');
    _editTratt = null;
  }

  /* ================================================================
     MODALE UNITÀ DI MISURA
  ================================================================ */
  var _editUnita = null;

  function openModalUnita() { _editUnita = null; _renderModalUnita(); }

  function _renderModalUnita() {
    var ov = _getOrCreateOverlay('modal-tar-unita');
    var html = '';
    _unitaMisura.forEach(function (r) {
      html +=
        '<tr class="data-row" onclick="MSK_Tariffe._clickUnita(' + r.id + ')">' +
          '<td><span class="id-badge">' + r.id + '</span></td>' +
          '<td><span class="ordine-val">' + r.ordine + '</span></td>' +
          '<td><strong>' + TONIO_escapeHtml(r.nome) + '</strong></td>' +
          '<td onclick="event.stopPropagation()">' +
            '<button class="btn-icon btn-danger" onclick="MSK_Tariffe.eliminaUnita(' + r.id + ')">' +
              '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/></svg>' +
            '</button>' +
          '</td>' +
        '</tr>';
    });
    ov.innerHTML =
      '<div class="modal" style="max-width:600px">' +
        '<div class="modal-header">' +
          '<span style="font-size:19px">📐</span>' +
          '<div class="modal-title">Unità di Misura</div>' +
          '<button class="modal-close" onclick="MSK_Tariffe.closeModalUnita()">×</button>' +
        '</div>' +
        '<div class="modal-body">' +
          '<table class="data-table"><thead><tr><th style="width:60px">ID</th><th style="width:90px">Ordine</th><th>Unità di Misura</th><th style="width:50px"></th></tr></thead>' +
          '<tbody>' + html + '</tbody></table>' +
          '<div style="margin-top:14px;padding:12px;background:#f8fafc;border-radius:6px;border:1px solid #e2e8f0">' +
            '<div style="font-size:11px;font-weight:700;color:#64748b;margin-bottom:8px" id="unita-form-title">＋ NUOVA UNITÀ DI MISURA</div>' +
            '<div style="display:flex;gap:10px;align-items:flex-end">' +
              '<div class="form-group" style="flex:0 0 80px"><label class="form-label" style="font-size:11px">Ordine</label><input class="form-input" type="number" id="unita-ordine" value="' + (_unitaMisura.length + 1) + '" min="1" style="height:34px"></div>' +
              '<div class="form-group" style="flex:1"><label class="form-label" style="font-size:11px">Unità di Misura <span class="req">*</span></label><input class="form-input" type="text" id="unita-nome" placeholder="Es. Per Notte" style="height:34px"></div>' +
              '<button class="btn btn-primary" style="height:34px;font-size:12px" onclick="MSK_Tariffe.salvaUnita()">Salva</button>' +
              '<button class="btn btn-ghost"   style="height:34px;font-size:12px" onclick="MSK_Tariffe.annullaUnita()">Annulla</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="modal-footer"><button class="btn btn-ghost" onclick="MSK_Tariffe.closeModalUnita()">Chiudi</button></div>' +
      '</div>';
    ov.classList.add('open');
  }

  function _clickUnita(id) {
    _editUnita = id;
    var rec = _unitaMisura.find(function (r) { return r.id === id; });
    if (!rec) return;
    var title = document.getElementById('unita-form-title'); if (title) title.textContent = '✏️ MODIFICA UNITÀ DI MISURA';
    var elOrd = document.getElementById('unita-ordine'); if (elOrd) elOrd.value = rec.ordine;
    var elNom = document.getElementById('unita-nome');   if (elNom) elNom.value = rec.nome;
  }

  function salvaUnita() {
    var nome   = (document.getElementById('unita-nome').value || '').trim();
    var ordine = parseInt(document.getElementById('unita-ordine').value, 10) || 1;
    if (!nome) { alert('⚠️ Inserire l\'Unità di Misura.'); return; }
    if (_editUnita === null) {
      var newId = _unitaMisura.length > 0 ? Math.max.apply(null, _unitaMisura.map(function (r) { return r.id; })) + 1 : 1;
      _unitaMisura.push({ id: newId, ordine: ordine, nome: nome });
    } else {
      var rec = _unitaMisura.find(function (r) { return r.id === _editUnita; });
      if (rec) { rec.nome = nome; rec.ordine = ordine; }
    }
    _unitaMisura.sort(function (a, b) { return a.ordine - b.ordine; });
    TONIO_Storage.save('tariffe_unita_misura', _unitaMisura);
    _editUnita = null;
    _renderModalUnita();
    _refreshHeaderSelects();
  }

  function annullaUnita() {
    _editUnita = null;
    var title = document.getElementById('unita-form-title'); if (title) title.textContent = '＋ NUOVA UNITÀ DI MISURA';
    var elNom = document.getElementById('unita-nome');   if (elNom) elNom.value = '';
    var elOrd = document.getElementById('unita-ordine'); if (elOrd) elOrd.value = _unitaMisura.length + 1;
  }

  function eliminaUnita(id) {
    var rec = _unitaMisura.find(function (r) { return r.id === id; });
    if (!rec) return;
    if (!confirm('Eliminare "' + rec.nome + '"?')) return;
    _unitaMisura = _unitaMisura.filter(function (r) { return r.id !== id; });
    TONIO_Storage.save('tariffe_unita_misura', _unitaMisura);
    if (_editUnita === id) _editUnita = null;
    _renderModalUnita();
    _refreshHeaderSelects();
  }

  function closeModalUnita() {
    var ov = document.getElementById('modal-tar-unita'); if (ov) ov.classList.remove('open');
    _editUnita = null;
  }

  /* ================================================================
     UTILITY
  ================================================================ */
  function _getOrCreateOverlay(id) {
    var ov = document.getElementById(id);
    if (!ov) {
      ov = document.createElement('div');
      ov.className = 'modal-overlay';
      ov.id = id;
      document.body.appendChild(ov);
    }
    return ov;
  }

  /* ================================================================
     API PUBBLICA
  ================================================================ */
  return {
    init:              init,
    /* Tariffario inline */
    nuovaTariffa:      nuovaTariffa,
    caricaTariffa:     caricaTariffa,
    salvaTariffHeader: salvaTariffHeader,
    salvaRighe:        salvaRighe,
    addRiga:           addRiga,
    removeRiga:        removeRiga,
    eliminaTariff:     eliminaTariff,
    eliminaTariffId:   eliminaTariffId,
    annullaTariff:     annullaTariff,
    filterTariff:      filterTariff,
    /* Modali lookup */
    openModalTipo:     openModalTipo,
    _clickTipo:        _clickTipo,
    salvaTipo:         salvaTipo,
    annullaTipo:       annullaTipo,
    eliminaTipo:       eliminaTipo,
    closeModalTipo:    closeModalTipo,
    openModalTratt:    openModalTratt,
    _clickTratt:       _clickTratt,
    salvaTratt:        salvaTratt,
    annullaTratt:      annullaTratt,
    eliminaTratt:      eliminaTratt,
    closeModalTratt:   closeModalTratt,
    openModalUnita:    openModalUnita,
    _clickUnita:       _clickUnita,
    salvaUnita:        salvaUnita,
    annullaUnita:      annullaUnita,
    eliminaUnita:      eliminaUnita,
    closeModalUnita:   closeModalUnita
  };

})();
