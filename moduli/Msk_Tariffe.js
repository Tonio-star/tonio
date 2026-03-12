/* ================================================================
   TONIO — Msk_Tariffe.js
   Modulo Tariffe — Tipo Tariffa, Trattamento, Unità di Misura,
                    Tariffario (unica maschera inline)
   v4.3 — Sconti: full-screen, campi in riga unica, Descrizione ×2/×5, sticky fino a Condizioni, Sconti Salvati in scroll
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
     HELPER LOOKUP — legge dal localStorage (live) con fallback globale,
     ordinato per campo ordine
  ================================================================ */
  function _getSuperProdotti() {
    var d = TONIO_Storage.load('immobili_superprodotti');
    if (!d || !d.length) d = (typeof TONIO_IMMOBILI_SUPERPRODOTTI !== 'undefined') ? TONIO_IMMOBILI_SUPERPRODOTTI : [];
    return d.slice().sort(function(a,b){ return (a.ordine||0)-(b.ordine||0); });
  }
  function _getProdotti() {
    var d = TONIO_Storage.load('immobili_prodotti');
    if (!d || !d.length) d = (typeof TONIO_IMMOBILI_PRODOTTI !== 'undefined') ? TONIO_IMMOBILI_PRODOTTI : [];
    return d.slice().sort(function(a,b){ return (a.ordine||0)-(b.ordine||0); });
  }
  function _getTipiImmobile() {
    var d = TONIO_Storage.load('immobili_tipi');
    if (!d || !d.length) d = (typeof TONIO_IMMOBILI_TIPI !== 'undefined') ? TONIO_IMMOBILI_TIPI : [];
    return d.slice().sort(function(a,b){ return (a.ordine||0)-(b.ordine||0); });
  }
  function _nomeById(arr, id) {
    if (!id && id !== 0) return '—';
    var f = arr.find(function(x){ return String(x.id) === String(id); });
    return f ? f.nome : '—';
  }
  function _optsById(arr, selectedId) {
    var h = '<option value="">— Seleziona —</option>';
    arr.forEach(function(item) {
      var sel = (String(item.id) === String(selectedId)) ? ' selected' : '';
      h += '<option value="' + item.id + '"' + sel + '>' + TONIO_escapeHtml(item.nome) + '</option>';
    });
    return h;
  }

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

    /* Render solo la pagina principale Tariffario — le altre tre sono ora solo modali */
    _renderTariffPage();
  }

  /* ================================================================
     ─────────────────────────────────────────────────────────────
     MASCHERA PRINCIPALE — TARIFFARIO (unica pagina inline)
     I campi header + righe dettaglio sono visibili direttamente
     nella pagina, senza aprire una sotto-maschera.
     I pulsanti Tipo Tariffa / Trattamento / Unità di Misura
     sono posizionati nel margine destro dell'header.
     ─────────────────────────────────────────────────────────────
  ================================================================ */
  function _renderTariffPage() {
    var c = document.getElementById('page-tariffe');
    if (!c) return;

    function opts(arr, selected) {
      var h = '<option value="">— Seleziona —</option>';
      arr.forEach(function (item) { var v = item.nome;
        h += '<option value="' + TONIO_escapeHtml(v) + '"' + (v === selected ? ' selected' : '') + '>' + TONIO_escapeHtml(v) + '</option>';
      });
      return h;
    }
    var superProds = _getSuperProdotti();
    var prods      = _getProdotti();
    var _curRec  = (_editTariffId !== null) ? (_tariffario.find(function(r){ return r.id === _editTariffId; }) || null) : null;
    var _curSPid = _curRec ? (_curRec.id_superprodotto || '') : '';
    var _curPid  = _curRec ? (_curRec.id_prodotto       || '') : '';

    /* Costruisci le righe esistenti del tariffario */
    var righeHtml = _buildTariffRigheHtml();

    c.innerHTML =
      '<div class="list-page">' +
        '<div style="position:sticky;top:0;z-index:100;background:#fff;padding-bottom:8px;border-bottom:2px solid #e2e8f0;margin-left:-24px;margin-right:-24px;padding-left:24px;padding-right:24px">' +

        /* ── HEADER: "CREA TARIFFE" a sinistra, pulsanti lookup verso il margine destro ── */
        '<div class="list-header" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">' +
          '<div style="display:flex;align-items:center;gap:12px">' +
            '<h1 class="list-title" style="margin:0;white-space:nowrap">CREA TARIFFE</h1>' +
            '<span class="list-count" id="tar-count"></span>' +
          '</div>' +
          /* Pulsanti lookup sul margine destro, orizzontali, nell'ordine richiesto */
          '<div style="display:flex;flex-direction:row;gap:8px;align-items:center;margin-left:auto">' +
            '<button class="btn btn-ghost" style="font-size:12px;padding:6px 12px;white-space:nowrap" onclick="MSK_Tariffe.openModalTipo()">' +
              '🏷️ Tipo Tariffa' +
            '</button>' +
            '<button class="btn btn-ghost" style="font-size:12px;padding:6px 12px;white-space:nowrap" onclick="MSK_Tariffe.openModalTratt()">' +
              '🍽️ Trattamento' +
            '</button>' +
            '<button class="btn btn-ghost" style="font-size:12px;padding:6px 12px;white-space:nowrap" onclick="MSK_Tariffe.openModalUnita()">' +
              '📐 Unità di Misura' +
            '</button>' +
            '<button class="btn btn-ghost" style="font-size:12px;padding:6px 12px;white-space:nowrap" onclick="MSK_Tariffe.openModalSconti()">' +
              '🏷️ Sconti' +
            '</button>' +
          '</div>' +
        '</div>' +

        /* ── SEZIONE HEADER TARIFFA (campi unici, orizzontali) ── */
        '<div style="background:#f0f4ff;border:1px solid #c7d7f5;border-radius:8px;padding:16px 20px;margin-bottom:20px">' +
          '<div style="font-size:11px;font-weight:700;color:#1e3a5f;letter-spacing:.6px;text-transform:uppercase;margin-bottom:12px">📌 Dati Tariffa (unici per ogni tariffario)</div>' +
          '<div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end">' +
            '<div class="form-group" style="flex:0 0 60px">' +
              '<label class="form-label" style="font-size:11px">ID</label>' +
              '<input class="form-input" type="text" id="tf-id" value="" readonly style="background:#f8fafc;color:#94a3b8;cursor:default;height:36px;font-size:13px;width:100%">' +
            '</div>' +
            '<div class="form-group" style="flex:1 1 150px">' +
              '<label class="form-label" style="font-size:11px">Tipo Tariffa <span class="req">*</span></label>' +
              '<select class="form-input" id="tf-tipo" style="height:36px;font-size:13px">' + opts(_tipoTariffa, '') + '</select>' +
            '</div>' +
            '<div class="form-group" style="flex:1 1 150px">' +
              '<label class="form-label" style="font-size:11px">Trattamento</label>' +
              '<select class="form-input" id="tf-tratt" style="height:36px;font-size:13px">' + opts(_trattamento, '') + '</select>' +
            '</div>' +
            '<div class="form-group" style="flex:1 1 130px">' +
              '<label class="form-label" style="font-size:11px">Super Prodotto</label>' +
              '<select class="form-input" id="tf-superprod" style="height:36px;font-size:13px">' + _optsById(superProds, _curSPid) + '</select>' +
            '</div>' +
            '<div class="form-group" style="flex:1 1 130px">' +
              '<label class="form-label" style="font-size:11px">Prodotto</label>' +
              '<select class="form-input" id="tf-prod" style="height:36px;font-size:13px">' + _optsById(prods, _curPid) + '</select>' +
            '</div>' +
            '<div class="form-group" style="flex:1 1 130px">' +
              '<label class="form-label" style="font-size:11px">Unità di Misura</label>' +
              '<select class="form-input" id="tf-unita" style="height:36px;font-size:13px">' + opts(_unitaMisura, '') + '</select>' +
            '</div>' +
            '<div class="form-group" style="flex:0 0 90px">' +
              '<label class="form-label" style="font-size:11px">% IVA</label>' +
              '<input class="form-input" type="number" id="tf-iva" value="" min="0" max="100" step="1" placeholder="0" style="height:36px;font-size:13px;width:100%">' +
            '</div>' +
          '</div>' +
          /* Bottoni azione header */
          '<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">' +
            '<button class="btn btn-primary" style="font-size:13px" onclick="MSK_Tariffe.nuovaTariffa()">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
              'Nuovo Tariffario' +
            '</button>' +
            '<button class="btn btn-warning" style="font-size:13px" id="tf-btn-salva-header" onclick="MSK_Tariffe.salvaTariffHeader()" style="display:none">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>' +
              'Salva Tariffario' +
            '</button>' +
            '<button class="btn btn-danger" style="font-size:13px;display:none" id="tf-btn-elimina-header" onclick="MSK_Tariffe.eliminaTariff()">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/></svg>' +
              'Elimina Tariffario' +
            '</button>' +
            '<button class="btn btn-ghost" style="font-size:13px;display:none" id="tf-btn-annulla" onclick="MSK_Tariffe.annullaTariff()">' +
              'Annulla' +
            '</button>' +
          '</div>' +
        '</div>' +

        /* ── SEZIONE RIGHE TARIFFARIO ── */
        '<div style="margin-bottom:10px;display:flex;justify-content:space-between;align-items:center">' +
          '<div style="font-size:11px;font-weight:700;color:#1e3a5f;letter-spacing:.6px;text-transform:uppercase">📋 Righe Tariffario</div>' +
          '<button class="btn btn-ghost" style="font-size:12px;padding:5px 10px" id="tf-btn-add-riga" onclick="MSK_Tariffe.addRiga()" disabled>' +
            '＋ Aggiungi Tariffa' +
          '</button>' +
        '</div>' +
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

        /* pulsante salva righe (visibile solo quando c'è una tariffa selezionata) */
        '<div style="margin-top:14px">' +
          '<button class="btn btn-primary" style="font-size:13px;display:none" id="tf-btn-salva-righe" onclick="MSK_Tariffe.salvaRighe()">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>' +
            'Salva Tariffe' +
          '</button>' +
        '</div>' +

        /* ── LISTA TARIFFE ESISTENTI ── */
        '<div style="margin-top:32px">' +
          '<div style="font-size:11px;font-weight:700;color:#1e3a5f;letter-spacing:.6px;text-transform:uppercase;margin-bottom:10px">📂 Tariffari Salvati</div>' +
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

      '</div>'; /* fine list-page */

    _renderListaTariffe(_tariffario);
    _aggiornaCount();
  }

  /* ── Costruisce le righe dettaglio per la tabella inline ── */
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

  /* ── Costruisce una singola riga TR ── */
  function _buildRigaHtml(riga, idx) {
    var tipiImmobile = _getTipiImmobile();
    var curTIid = riga ? (riga.id_tipo_immobile || '') : '';
    var optsImmobile = '<option value="">— Seleziona —</option>';
    tipiImmobile.forEach(function (item) {
      var sel = (String(item.id) === String(curTIid)) ? ' selected' : '';
      optsImmobile += '<option value="' + item.id + '"' + sel + '>' + TONIO_escapeHtml(item.nome) + '</option>';
    });

    return (
      '<tr class="tariff-riga" data-idx="' + idx + '">' +
        '<td style="min-width:140px">' +
          '<select class="form-input form-input-sm" id="tr-tipo-imm-' + idx + '">' + optsImmobile + '</select>' +
        '</td>' +
        '<td><input class="form-input form-input-sm" type="date" id="tr-dal-' + idx + '" value="' + (riga ? riga.dal || '' : '') + '"></td>' +
        '<td><input class="form-input form-input-sm" type="date" id="tr-al-'  + idx + '" value="' + (riga ? riga.al  || '' : '') + '"></td>' +
        /* Importo allargato per 999.999,99 */
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

  /* ── Render lista tariffe salvate ── */
  function _renderListaTariffe(list) {
    var tbody = document.getElementById('tar-lista-tbody');
    if (!tbody) return;
    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:24px;color:#94a3b8">Nessuna tariffa salvata</td></tr>';
      return;
    }
    var _spArr = _getSuperProdotti();
    var _pArr  = _getProdotti();
    var html = '';
    list.forEach(function (r) {
      var nRighe = (r.righe || []).length;
      var isActive = r.id === _editTariffId;
      var nomeSP = r.id_superprodotto ? _nomeById(_spArr, r.id_superprodotto) : (r.super_prodotto || '—');
      var nomeP  = r.id_prodotto      ? _nomeById(_pArr,  r.id_prodotto)      : (r.prodotto       || '—');
      html +=
        '<tr class="data-row' + (isActive ? ' active-row' : '') + '" onclick="MSK_Tariffe.caricaTariffa(' + r.id + ')" style="' + (isActive ? 'background:#eff6ff;font-weight:600' : '') + '">' +
          '<td><strong>' + TONIO_escapeHtml(r.tipo_tariffa || '—') + '</strong></td>' +
          '<td>' + TONIO_escapeHtml(r.trattamento || '—') + '</td>' +
          '<td>' + TONIO_escapeHtml(nomeSP) + '</td>' +
          '<td>' + TONIO_escapeHtml(nomeP)  + '</td>' +
          '<td>' + TONIO_escapeHtml(r.unita_misura   || '—') + '</td>' +
          '<td style="text-align:center">' + (r.iva_perc !== undefined ? r.iva_perc + '%' : '—') + '</td>' +
          '<td style="text-align:center">' +
            '<span class="badge" style="background:#eff6ff;color:#3b82f6;border:1px solid #bfdbfe">' + nRighe + '</span>' +
          '</td>' +
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

  /* ── Mostra/nasconde i pulsanti di modifica ── */
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

  /* ── Carica una tariffa esistente nel form header + righe ── */
  function caricaTariffa(id) {
    var rec = _tariffario.find(function (r) { return r.id === id; });
    if (!rec) return;
    _editTariffId = id;
    _righeCount   = 0;

    /* Ricostruisce la pagina con la tariffa selezionata */
    _renderTariffPage();

    /* Popola i campi header */
    var _s = function (elId, val) { var el = document.getElementById(elId); if (el) el.value = val !== undefined && val !== null ? val : ''; };
    _s('tf-id',        rec.id);
    _s('tf-tipo',      rec.tipo_tariffa  || '');
    _s('tf-tratt',     rec.trattamento   || '');
    _s('tf-superprod', rec.id_superprodotto || '');
    _s('tf-prod',      rec.id_prodotto       || '');
    _s('tf-unita',     rec.unita_misura  || '');
    _s('tf-iva',       rec.iva_perc      !== undefined ? rec.iva_perc : '');

    _setBtnVisibility(true);
  }

  /* ── Nuova tariffa: pulisce il form ── */
  function nuovaTariffa() {
    _editTariffId = null;
    _righeCount   = 0;
    _renderTariffPage();

    /* Pulisce i campi header */
    ['tf-id','tf-tipo','tf-tratt','tf-superprod','tf-prod','tf-unita','tf-iva'].forEach(function (id) {
      var el = document.getElementById(id); if (el) el.value = '';
    });

    /* Mostra i pulsanti di inserimento */
    var btnSalvaH = document.getElementById('tf-btn-salva-header');
    if (btnSalvaH) { btnSalvaH.style.display = ''; btnSalvaH.textContent = ''; }
    /* Ricostruisci il pulsante salva con icona */
    if (btnSalvaH) {
      btnSalvaH.innerHTML =
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>Salva Tariffario';
    }
    var btnAnnulla = document.getElementById('tf-btn-annulla');
    if (btnAnnulla) btnAnnulla.style.display = '';
    var btnAddRiga = document.getElementById('tf-btn-add-riga');
    if (btnAddRiga) btnAddRiga.disabled = false;
    /* Nasconde elimina — non esiste ancora */
    var btnElimina = document.getElementById('tf-btn-elimina-header');
    if (btnElimina) btnElimina.style.display = 'none';
    var btnSalvaR = document.getElementById('tf-btn-salva-righe');
    if (btnSalvaR) btnSalvaR.style.display = '';
  }

  /* ── Legge i valori dell'header dal DOM ── */
  function _leggiHeader() {
    var gv = function (id) { var el = document.getElementById(id); return el ? (el.value || '').trim() : ''; };
    var spv = gv('tf-superprod'); var pv = gv('tf-prod');
    return {
      tipo_tariffa:     gv('tf-tipo'),
      trattamento:      gv('tf-tratt'),
      id_superprodotto: spv ? parseInt(spv, 10) : null,
      id_prodotto:      pv  ? parseInt(pv,  10) : null,
      unita_misura:     gv('tf-unita'),
      iva_perc:         parseFloat(gv('tf-iva')) || 0
    };
  }

  /* ── Salva solo i campi header (crea o aggiorna la tariffa) ── */
  function salvaTariffHeader() {
    var h = _leggiHeader();
    if (!h.tipo_tariffa) { alert('⚠️ Selezionare il Tipo Tariffa.'); return; }

    if (_editTariffId === null) {
      /* Nuovo record */
      var newId = _tariffario.length > 0 ? Math.max.apply(null, _tariffario.map(function (r) { return r.id; })) + 1 : 1;
      _tariffario.push({ id: newId, tipo_tariffa: h.tipo_tariffa, trattamento: h.trattamento, id_superprodotto: h.id_superprodotto, id_prodotto: h.id_prodotto, unita_misura: h.unita_misura, iva_perc: h.iva_perc, righe: [] });
      _editTariffId = newId;
    } else {
      var rec = _tariffario.find(function (r) { return r.id === _editTariffId; });
      if (rec) { rec.tipo_tariffa = h.tipo_tariffa; rec.trattamento = h.trattamento; rec.id_superprodotto = h.id_superprodotto; rec.id_prodotto = h.id_prodotto; rec.unita_misura = h.unita_misura; rec.iva_perc = h.iva_perc; }
    }

    TONIO_Storage.save('tariffe_tariffario', _tariffario);
    _setBtnVisibility(true);
    /* Aggiorna ID nel campo */
    var elId = document.getElementById('tf-id');
    if (elId) elId.value = _editTariffId;
    _renderListaTariffe(_tariffario);
    _aggiornaCount();
    _showToast('Intestazione salvata ✓');
  }

  /* ── Aggiunge una riga vuota ── */
  function addRiga() {
    var tbody = document.getElementById('tar-righe-tbody');
    if (!tbody) return;
    var idx = _righeCount++;
    tbody.insertAdjacentHTML('beforeend', _buildRigaHtml(null, idx));
  }

  /* ── Rimuove una riga ── */
  function removeRiga(idx) {
    var row = document.querySelector('.tariff-riga[data-idx="' + idx + '"]');
    if (row) row.parentNode.removeChild(row);
  }

  /* ── Legge le righe dal DOM ── */
  function _leggiRighe() {
    var rows = document.querySelectorAll('.tariff-riga');
    var righe = [];
    rows.forEach(function (row) {
      var idx = parseInt(row.getAttribute('data-idx'), 10);
      var gv = function (id) { var el = document.getElementById(id + '-' + idx); return el ? el.value : ''; };
      var gc = function (id) { var el = document.getElementById(id + '-' + idx); return el ? el.checked : false; };
      var tiv = gv('tr-tipo-imm');
      righe.push({
        id_tipo_immobile: tiv ? parseInt(tiv, 10) : null,
        dal:            gv('tr-dal'),
        al:             gv('tr-al'),
        importo:        parseFloat(gv('tr-importo')) || 0,
        obbligatorio:   gc('tr-obl'),
        chi_paga_cli:   gc('tr-cp-cli'),
        chi_paga_osp:   gc('tr-cp-osp'),
        fat_fat:        gc('tr-fat'),
        fat_nf:         gc('tr-nf'),
        fatturare_cli:  gc('tr-fcli'),
        fatturare_osp:  gc('tr-fosp'),
        ordinamento:    parseInt(gv('tr-ord'), 10) || 1
      });
    });
    return righe;
  }

  /* ── Salva le righe della tariffa corrente ── */
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

  /* ── Elimina la tariffa corrente in editing ── */
  function eliminaTariff() {
    if (_editTariffId === null) return;
    eliminaTariffId(_editTariffId);
  }

  /* ── Elimina una tariffa per ID ── */
  function eliminaTariffId(id) {
    var rec = _tariffario.find(function (r) { return r.id === id; });
    if (!rec) return;
    if (!confirm('Eliminare la tariffa "' + (rec.tipo_tariffa || id) + '"?\nL\'operazione non può essere annullata.')) return;
    _tariffario = _tariffario.filter(function (r) { return r.id !== id; });
    TONIO_Storage.save('tariffe_tariffario', _tariffario);
    if (_editTariffId === id) { _editTariffId = null; _righeCount = 0; }
    _renderTariffPage();
  }

  /* ── Annulla la modifica corrente ── */
  function annullaTariff() {
    _editTariffId = null;
    _righeCount   = 0;
    _renderTariffPage();
  }

  /* ── Live search ── */
  function filterTariff() {
    var q = (document.getElementById('tar-search') ? document.getElementById('tar-search').value : '').toLowerCase();
    var _spArr = _getSuperProdotti(); var _pArr = _getProdotti();
    _renderListaTariffe(_tariffario.filter(function (r) {
      var nSP = r.id_superprodotto ? _nomeById(_spArr, r.id_superprodotto).toLowerCase() : (r.super_prodotto||'').toLowerCase();
      var nP  = r.id_prodotto      ? _nomeById(_pArr,  r.id_prodotto).toLowerCase()      : (r.prodotto||'').toLowerCase();
      return (r.tipo_tariffa||'').toLowerCase().indexOf(q)!==-1 || (r.trattamento||'').toLowerCase().indexOf(q)!==-1 || nSP.indexOf(q)!==-1 || nP.indexOf(q)!==-1;
    }));
  }

  /* ── Toast di conferma ── */
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
     ─────────────────────────────────────────────────────────────
     MODALE TIPO TARIFFA (aperta da pulsante nel Tariffario)
     ─────────────────────────────────────────────────────────────
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
          '<div style="margin-top:14px;padding:12px;background:#f8fafc;border-radius:6px;border:1px solid #e2e8f0" id="tipo-form-inline">' +
            '<div style="font-size:11px;font-weight:700;color:#64748b;margin-bottom:8px" id="tipo-form-title">＋ NUOVO TIPO TARIFFA</div>' +
            '<div style="display:flex;gap:10px;align-items:flex-end">' +
              '<div class="form-group" style="flex:0 0 80px"><label class="form-label" style="font-size:11px">Ordine</label><input class="form-input" type="number" id="tipo-ordine" value="' + (_tipoTariffa.length + 1) + '" min="1" style="height:34px"></div>' +
              '<div class="form-group" style="flex:1"><label class="form-label" style="font-size:11px">Tipo Tariffa <span class="req">*</span></label><input class="form-input" type="text" id="tipo-nome" placeholder="Es. Tariffa Alta Stagione" style="height:34px"></div>' +
              '<button class="btn btn-primary" style="height:34px;font-size:12px" onclick="MSK_Tariffe.salvaTipo()">Salva</button>' +
              '<button class="btn btn-ghost" style="height:34px;font-size:12px" onclick="MSK_Tariffe.annullaTipo()">Annulla</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn btn-ghost" onclick="MSK_Tariffe.closeModalTipo()">Chiudi</button>' +
        '</div>' +
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
    /* Riaggiorna select nel form header */
    _refreshHeaderSelects();
  }

  function annullaTipo() {
    _editTipo = null;
    var title = document.getElementById('tipo-form-title'); if (title) title.textContent = '＋ NUOVO TIPO TARIFFA';
    var elNom = document.getElementById('tipo-nome'); if (elNom) elNom.value = '';
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
          '<td style="color:#64748b;font-size:12px">' + TONIO_escapeHtml(r.definizione || '') + '</td>' +
          '<td onclick="event.stopPropagation()">' +
            '<button class="btn-icon btn-danger" onclick="MSK_Tariffe.eliminaTratt(' + r.id + ')">' +
              '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/></svg>' +
            '</button>' +
          '</td>' +
        '</tr>';
    });

    ov.innerHTML =
      '<div class="modal" style="max-width:760px">' +
        '<div class="modal-header">' +
          '<span style="font-size:19px">🍽️</span>' +
          '<div class="modal-title">Trattamento</div>' +
          '<button class="modal-close" onclick="MSK_Tariffe.closeModalTratt()">×</button>' +
        '</div>' +
        '<div class="modal-body">' +
          '<table class="data-table"><thead><tr><th style="width:55px">ID</th><th style="width:80px">Ordine</th><th>Trattamento</th><th>Definizione</th><th style="width:50px"></th></tr></thead>' +
          '<tbody>' + html + '</tbody></table>' +
          /* Form inline orizzontale */
          '<div style="margin-top:14px;padding:12px;background:#f8fafc;border-radius:6px;border:1px solid #e2e8f0">' +
            '<div style="font-size:11px;font-weight:700;color:#64748b;margin-bottom:8px" id="tratt-form-title">＋ NUOVO TRATTAMENTO</div>' +
            '<div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:nowrap">' +
              '<div class="form-group" style="flex:0 0 70px"><label class="form-label" style="font-size:11px">Ordine</label><input class="form-input" type="number" id="tratt-ordine" value="' + (_trattamento.length + 1) + '" min="1" style="height:34px"></div>' +
              '<div class="form-group" style="flex:1 1 180px"><label class="form-label" style="font-size:11px">Trattamento <span class="req">*</span></label><input class="form-input" type="text" id="tratt-nome" placeholder="Es. Bed & Breakfast" style="height:34px"></div>' +
              '<div class="form-group" style="flex:2 1 240px"><label class="form-label" style="font-size:11px">Definizione</label><input class="form-input" type="text" id="tratt-def" placeholder="Breve descrizione" style="height:34px"></div>' +
              '<button class="btn btn-primary" style="height:34px;font-size:12px" onclick="MSK_Tariffe.salvaTratt()">Salva</button>' +
              '<button class="btn btn-ghost" style="height:34px;font-size:12px" onclick="MSK_Tariffe.annullaTratt()">Annulla</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn btn-ghost" onclick="MSK_Tariffe.closeModalTratt()">Chiudi</button>' +
        '</div>' +
      '</div>';
    ov.classList.add('open');
  }

  function _clickTratt(id) {
    _editTratt = id;
    var rec = _trattamento.find(function (r) { return r.id === id; });
    if (!rec) return;
    var title = document.getElementById('tratt-form-title'); if (title) title.textContent = '✏️ MODIFICA TRATTAMENTO';
    var elOrd = document.getElementById('tratt-ordine'); if (elOrd) elOrd.value = rec.ordine;
    var elNom = document.getElementById('tratt-nome');  if (elNom) elNom.value  = rec.nome;
    var elDef = document.getElementById('tratt-def');   if (elDef) elDef.value  = rec.definizione || '';
  }

  function salvaTratt() {
    var nome        = (document.getElementById('tratt-nome').value || '').trim();
    var definizione = (document.getElementById('tratt-def').value  || '').trim();
    var ordine      = parseInt(document.getElementById('tratt-ordine').value, 10) || 1;
    if (!nome) { alert('⚠️ Inserire il Trattamento.'); return; }
    if (_editTratt === null) {
      var newId = _trattamento.length > 0 ? Math.max.apply(null, _trattamento.map(function (r) { return r.id; })) + 1 : 1;
      _trattamento.push({ id: newId, ordine: ordine, nome: nome, definizione: definizione });
    } else {
      var rec = _trattamento.find(function (r) { return r.id === _editTratt; });
      if (rec) { rec.nome = nome; rec.definizione = definizione; rec.ordine = ordine; }
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
    ['tratt-nome','tratt-def'].forEach(function (id) { var el = document.getElementById(id); if (el) el.value = ''; });
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
              '<button class="btn btn-ghost" style="height:34px;font-size:12px" onclick="MSK_Tariffe.annullaUnita()">Annulla</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn btn-ghost" onclick="MSK_Tariffe.closeModalUnita()">Chiudi</button>' +
        '</div>' +
      '</div>';
    ov.classList.add('open');
  }

  function _clickUnita(id) {
    _editUnita = id;
    var rec = _unitaMisura.find(function (r) { return r.id === id; });
    if (!rec) return;
    var title = document.getElementById('unita-form-title'); if (title) title.textContent = '✏️ MODIFICA UNITÀ DI MISURA';
    var elOrd = document.getElementById('unita-ordine'); if (elOrd) elOrd.value = rec.ordine;
    var elNom = document.getElementById('unita-nome');  if (elNom) elNom.value  = rec.nome;
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
    var elNom = document.getElementById('unita-nome'); if (elNom) elNom.value = '';
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
     AGGIORNA SELECT NELL'HEADER dopo modifica lookup
  ================================================================ */
  function _refreshHeaderSelects() {
    function setN(elId, arr, cur) {
      var el = document.getElementById(elId); if (!el) return;
      var h = '<option value="">— Seleziona —</option>';
      arr.forEach(function(i){ h += '<option value="'+TONIO_escapeHtml(i.nome)+'"'+(i.nome===cur?' selected':'')+'>'+TONIO_escapeHtml(i.nome)+'</option>'; });
      el.innerHTML = h;
    }
    function setI(elId, arr, curId) { var el = document.getElementById(elId); if (!el) return; el.innerHTML = _optsById(arr, curId); }
    var sp = _getSuperProdotti(); var p = _getProdotti();
    var elSP = document.getElementById('tf-superprod'); var elP = document.getElementById('tf-prod');
    setN('tf-tipo',  _tipoTariffa, document.getElementById('tf-tipo')  ? document.getElementById('tf-tipo').value  : '');
    setN('tf-tratt', _trattamento, document.getElementById('tf-tratt') ? document.getElementById('tf-tratt').value : '');
    setI('tf-superprod', sp, elSP ? elSP.value : '');
    setI('tf-prod',      p,  elP  ? elP.value  : '');
    setN('tf-unita', _unitaMisura, document.getElementById('tf-unita') ? document.getElementById('tf-unita').value : '');
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
     MASCHERA SCONTI — storage key: 'tariffe_sconti'
     Struttura record: { id, nome_sconto, descrizione_sconto, righe[] }
     Struttura riga:   { preno_dal, preno_al, date_dal, date_al,
                         min_notti, min_anticipo, max_anticipo,
                         sc_tot_perc, sc_tot_eur,
                         sc_notte_perc, sc_notte_eur }
  ================================================================ */
  var _sconti     = [];
  var _editSconto = null;   /* id sconto in editing, null = nessuno */

  function _initSconti() {
    var saved = TONIO_Storage.load('tariffe_sconti');
    _sconti = saved ? saved : (typeof TONIO_TARIFFE_SCONTI !== 'undefined' ? JSON.parse(JSON.stringify(TONIO_TARIFFE_SCONTI)) : []);
  }

  function openModalSconti() {
    _initSconti(); _editSconto = null;
    /* Forza overlay a zero padding → modale occupa tutto lo schermo */
    var ov = document.getElementById('modal-tar-sconti');
    if (!ov) { ov = document.createElement('div'); ov.className = 'modal-overlay'; ov.id = 'modal-tar-sconti'; document.body.appendChild(ov); }
    ov.style.padding = '0';
    _renderModalSconti();
  }

  /* ── Righe condizioni dello sconto selezionato ── */
  function _buildScontiRighe(sc) {
    var html = '';
    (sc.righe || []).forEach(function(r, i) {
      html +=
        '<tr class="tariff-riga" data-sc-idx="' + i + '">' +
          /* Sconto Prenotabile */
          '<td><input class="form-input form-input-sm" type="date" id="sc-r-pdal-' + i + '" value="' + (r.preno_dal||'') + '" style="min-width:130px"></td>' +
          '<td><input class="form-input form-input-sm" type="date" id="sc-r-pal-'  + i + '" value="' + (r.preno_al||'')  + '" style="min-width:130px"></td>' +
          /* Date Scontate */
          '<td><input class="form-input form-input-sm" type="date" id="sc-r-ddal-' + i + '" value="' + (r.date_dal||'') + '" style="min-width:130px"></td>' +
          '<td><input class="form-input form-input-sm" type="date" id="sc-r-dal-'  + i + '" value="' + (r.date_al||'')  + '" style="min-width:130px"></td>' +
          /* Notti + anticipi */
          '<td><input class="form-input form-input-sm" type="number" id="sc-r-mn-'  + i + '" value="' + (r.min_notti||'')    + '" min="0" placeholder="GG" style="width:60px;text-align:right"></td>' +
          '<td><input class="form-input form-input-sm" type="number" id="sc-r-mia-' + i + '" value="' + (r.min_anticipo||'') + '" min="0" placeholder="GG" style="width:60px;text-align:right"></td>' +
          '<td><input class="form-input form-input-sm" type="number" id="sc-r-mxa-' + i + '" value="' + (r.max_anticipo||'') + '" min="0" placeholder="GG" style="width:60px;text-align:right"></td>' +
          /* Importi sconto */
          '<td><input class="form-input form-input-sm" type="number" id="sc-r-stp-' + i + '" value="' + (r.sc_tot_perc||'')   + '" min="0" max="100" step="0.1" placeholder="%" style="width:68px;text-align:right"></td>' +
          '<td><input class="form-input form-input-sm" type="number" id="sc-r-ste-' + i + '" value="' + (r.sc_tot_eur||'')    + '" min="0" step="0.01" placeholder="€"  style="width:78px;text-align:right"></td>' +
          '<td><input class="form-input form-input-sm" type="number" id="sc-r-snp-' + i + '" value="' + (r.sc_notte_perc||'') + '" min="0" max="100" step="0.1" placeholder="%" style="width:68px;text-align:right"></td>' +
          '<td><input class="form-input form-input-sm" type="number" id="sc-r-sne-' + i + '" value="' + (r.sc_notte_eur||'')  + '" min="0" step="0.01" placeholder="€"  style="width:78px;text-align:right"></td>' +
          '<td style="text-align:center;padding:2px 4px">' +
            '<button class="btn-icon btn-danger" title="Rimuovi" onclick="MSK_Tariffe._removeRigaSconto(' + i + ')" style="padding:3px 5px">' +
              '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/></svg>' +
            '</button>' +
          '</td>' +
        '</tr>';
    });
    return html;
  }

  function _renderModalSconti() {
    var ov = _getOrCreateOverlay('modal-tar-sconti');

    /* Lista sconti */
    var listHtml = '';
    _sconti.forEach(function(sc) {
      var isActive = _editSconto === sc.id;
      listHtml +=
        '<tr class="data-row' + (isActive ? ' active-row' : '') + '" onclick="MSK_Tariffe._clickSconto(' + sc.id + ')" style="' + (isActive ? 'background:#eff6ff;font-weight:600;cursor:pointer' : 'cursor:pointer') + '">' +
          '<td><span class="id-badge">' + sc.id + '</span></td>' +
          '<td><strong>' + TONIO_escapeHtml(sc.nome_sconto || '') + '</strong></td>' +
          '<td style="color:#64748b;font-size:12px;max-width:300px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + TONIO_escapeHtml(sc.descrizione_sconto || '') + '</td>' +
          '<td style="text-align:center">' + ((sc.righe||[]).length) + '</td>' +
          '<td onclick="event.stopPropagation()">' +
            '<button class="btn-icon btn-danger" onclick="MSK_Tariffe._eliminaSconto(' + sc.id + ')">' +
              '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/></svg>' +
            '</button>' +
          '</td>' +
        '</tr>';
    });

    var curSc   = (_editSconto !== null) ? (_sconti.find(function(x){ return x.id === _editSconto; }) || {}) : {};
    var righeHtml = curSc.righe ? _buildScontiRighe(curSc) : '';
    var hasEdit   = _editSconto !== null;

    ov.innerHTML =
      /* ══════════════════════════════════════════════════════════
         STRUTTURA MODALE SCONTI v4.3 — FULL SCREEN
         ┌──────────────────────────────────────────────────────┐
         │ HEADER fisso   🏷️ Sconti                       [×]  │
         ├──────────────────────────────────────────────────────┤
         │ ZONA FISSA (flex-shrink:0)                           │
         │  ┌ DATI SCONTO (#f0f4ff, bordo, radius) ──────────┐  │
         │  │ [ID 60px]  [Nome ×1]  [Descrizione ×2, h=180] │  │
         │  │ [Nuovo Sconto] [Salva Sconto] [Annulla]        │  │
         │  └────────────────────────────────────────────────┘  │
         │  📋 Condizioni Sconto   [＋ Aggiungi Condizione]     │
         ├──────────────────────────────────────────────────────┤
         │ AREA SCROLL (flex:1, overflow-y:auto)                │
         │  tabella condizioni                                  │
         │  [Salva Condizioni]                                  │
         │  📂 Sconti Salvati                                    │
         ├──────────────────────────────────────────────────────┤
         │ FOOTER fisso                            [Chiudi]     │
         └──────────────────────────────────────────────────────┘
      ══════════════════════════════════════════════════════════ */

      /* ── div.modal sovrascritto per full-screen ── */
      '<div class="modal" style="' +
          'width:100vw;max-width:100vw;' +
          'height:100vh;max-height:100vh;' +
          'border-radius:0;border:none;box-shadow:none;' +
          'display:flex;flex-direction:column;overflow:hidden' +
      '">' +

        /* ══ HEADER fisso ══ */
        '<div class="modal-header" style="' +
            'flex-shrink:0;' +
            'background:#fff;' +
            'border-bottom:1px solid #e2e8f0;' +
            'padding:14px 24px' +
        '">' +
          '<span style="font-size:19px">🏷️</span>' +
          '<div class="modal-title">Sconti</div>' +
          '<button class="modal-close" onclick="MSK_Tariffe.closeModalSconti()">×</button>' +
        '</div>' +

        /* ══ ZONA FISSA: Dati Sconto + barra Condizioni ══ */
        '<div style="' +
            'flex-shrink:0;' +
            'background:#fff;' +
            'border-bottom:2px solid #e2e8f0;' +
            'padding:16px 24px 12px;' +
            'display:flex;flex-direction:column;gap:12px' +
        '">' +

          /* ─ BOX DATI SCONTO ─ */
          '<div style="background:#f0f4ff;border:1px solid #c7d7f5;border-radius:8px;padding:16px 20px">' +
            '<div style="' +
                'font-size:11px;font-weight:700;color:#1e3a5f;' +
                'letter-spacing:.6px;text-transform:uppercase;margin-bottom:12px' +
            '">📌 Dati Sconto</div>' +

            /* ── RIGA UNICA: [ID 60px] + [Nome ×1] + [Descrizione ×2, h=180px]
               flex-wrap: su schermi stretti (< ~600px) i campi vanno in colonna ── */
            '<div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start;margin-bottom:14px">' +

              /* ID — larghezza fissa 60px */
              '<div class="form-group" style="flex:0 0 60px;min-width:60px">' +
                '<label class="form-label" style="font-size:11px">ID</label>' +
                '<input class="form-input" type="text" id="sc-id"' +
                  ' value="' + (curSc.id !== undefined ? curSc.id : '') + '" readonly' +
                  ' style="background:#f8fafc;color:#94a3b8;cursor:default;height:36px;font-size:13px;width:100%">' +
              '</div>' +

              /* Nome Sconto — flex:1 (proporzionale) */
              '<div class="form-group" style="flex:1 1 160px;min-width:140px">' +
                '<label class="form-label" style="font-size:11px">Nome Sconto <span class="req">*</span></label>' +
                '<input class="form-input" type="text" id="sc-nome"' +
                  ' value="' + TONIO_escapeHtml(curSc.nome_sconto || '') + '"' +
                  ' placeholder="Es. Prenota Presto"' +
                  ' style="height:36px;font-size:13px;width:100%">' +
              '</div>' +

              /* Descrizione Sconto — flex:2 (doppio larghezza), height:180px (5×36) */
              '<div class="form-group" style="flex:2 1 320px;min-width:200px">' +
                '<label class="form-label" style="font-size:11px">Descrizione Sconto</label>' +
                '<textarea class="form-input" id="sc-desc"' +
                  ' placeholder="Descrivi le condizioni: periodo prenotabile, date scontate, acconto, rimborso..."' +
                  ' style="font-size:13px;width:100%;height:180px;min-height:180px;resize:vertical;padding:8px 10px;line-height:1.5;box-sizing:border-box">' +
                  TONIO_escapeHtml(curSc.descrizione_sconto || '') +
                '</textarea>' +
              '</div>' +
            '</div>' + /* fine riga campi */

            /* Pulsanti */
            '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
              '<button class="btn btn-primary" style="font-size:13px" onclick="MSK_Tariffe._nuovoSconto()">' +
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px">' +
                  '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>' +
                '</svg>Nuovo Sconto</button>' +
              '<button class="btn btn-warning" style="font-size:13px" onclick="MSK_Tariffe._salvaSconto()">' +
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px">' +
                  '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>' +
                  '<polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/>' +
                '</svg>Salva Sconto</button>' +
              '<button class="btn btn-ghost" style="font-size:13px" onclick="MSK_Tariffe._annullaSconto()">Annulla</button>' +
            '</div>' +
          '</div>' + /* fine box dati sconto */

          /* ─ BARRA CONDIZIONI (rimane fissa con i Dati Sconto) ─ */
          '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0">' +
            '<div style="font-size:11px;font-weight:700;color:#1e3a5f;letter-spacing:.6px;text-transform:uppercase">' +
              '📋 Condizioni Sconto' +
            '</div>' +
            '<button class="btn btn-ghost" style="font-size:12px;padding:5px 10px"' +
              ' onclick="MSK_Tariffe._addRigaSconto()"' + (!hasEdit ? ' disabled' : '') + '>' +
              '＋ Aggiungi Condizione' +
            '</button>' +
          '</div>' +

        '</div>' + /* fine zona fissa */

        /* ══ AREA SCROLL: tabella condizioni + [Salva Condizioni] + Sconti Salvati ══ */
        '<div style="flex:1 1 auto;overflow-y:auto;overflow-x:hidden;padding:0 24px 32px">' +

          /* Tabella condizioni — scroll orizzontale interno */
          '<div style="overflow-x:auto;margin-top:12px">' +
            '<table class="data-table" style="min-width:1050px;font-size:12px;width:100%">' +
              '<thead>' +
                '<tr>' +
                  '<th colspan="2" style="text-align:center;background:#dbeafe;color:#1d4ed8;border-bottom:2px solid #93c5fd;font-size:10px">Sconto Prenotabile</th>' +
                  '<th colspan="2" style="text-align:center;background:#dcfce7;color:#166534;border-bottom:2px solid #86efac;font-size:10px">Date Scontate</th>' +
                  '<th colspan="3" style="text-align:center;background:#fef9c3;color:#854d0e;border-bottom:2px solid #fde047;font-size:10px">Anticipo / Notti</th>' +
                  '<th colspan="4" style="text-align:center;background:#fff0f0;color:#b91c1c;border-bottom:2px solid #fca5a5;font-size:10px">Importo Sconto</th>' +
                  '<th style="width:40px"></th>' +
                '</tr>' +
                '<tr style="background:#f1f5f9">' +
                  '<th style="background:#dbeafe;text-align:center;font-size:10px">Dal</th>' +
                  '<th style="background:#dbeafe;text-align:center;font-size:10px">Al</th>' +
                  '<th style="background:#dcfce7;text-align:center;font-size:10px">Dal</th>' +
                  '<th style="background:#dcfce7;text-align:center;font-size:10px">Al</th>' +
                  '<th style="background:#fef9c3;text-align:center;font-size:10px">Min.<br>Notti<br><span style=\'font-weight:400;color:#92400e\'>GG</span></th>' +
                  '<th style="background:#fef9c3;text-align:center;font-size:10px">Min.<br>Anticipo<br><span style=\'font-weight:400;color:#92400e\'>GG</span></th>' +
                  '<th style="background:#fef9c3;text-align:center;font-size:10px">Max<br>Anticipo<br><span style=\'font-weight:400;color:#92400e\'>GG</span></th>' +
                  '<th style="background:#fff0f0;text-align:center;font-size:10px">Sc. Totale<br>Loc. %</th>' +
                  '<th style="background:#fff0f0;text-align:center;font-size:10px">Sc. Totale<br>Loc. €</th>' +
                  '<th style="background:#fff0f0;text-align:center;font-size:10px">Sc. Notte<br>%</th>' +
                  '<th style="background:#fff0f0;text-align:center;font-size:10px">Sc. Notte<br>€</th>' +
                  '<th style="width:40px"></th>' +
                '</tr>' +
              '</thead>' +
              '<tbody id="sc-righe-tbody">' + righeHtml + '</tbody>' +
            '</table>' +
          '</div>' +

          /* Pulsante Salva Condizioni */
          '<div style="margin-top:14px">' +
            '<button class="btn btn-primary"' +
              ' style="font-size:13px' + (!hasEdit ? ';display:none' : '') + '"' +
              ' id="sc-btn-salva-righe" onclick="MSK_Tariffe._salvaRigheSconto()">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px">' +
                '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>' +
                '<polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/>' +
              '</svg>Salva Condizioni' +
            '</button>' +
          '</div>' +

          /* 📂 SCONTI SALVATI — primo elemento nella zona scroll */
          '<div style="margin-top:32px">' +
            '<div style="font-size:11px;font-weight:700;color:#1e3a5f;letter-spacing:.6px;text-transform:uppercase;margin-bottom:10px">' +
              '📂 Sconti Salvati' +
            '</div>' +
            '<div style="overflow-x:auto">' +
              '<table class="data-table" style="min-width:580px;width:100%">' +
                '<thead><tr>' +
                  '<th style="width:50px">ID</th>' +
                  '<th>Nome Sconto</th>' +
                  '<th>Descrizione</th>' +
                  '<th style="width:60px;text-align:center">Righe</th>' +
                  '<th style="width:40px"></th>' +
                '</tr></thead>' +
                '<tbody>' + listHtml + '</tbody>' +
              '</table>' +
            '</div>' +
          '</div>' +

        '</div>' + /* fine area scroll */

        /* ══ FOOTER fisso ══ */
        '<div class="modal-footer" style="flex-shrink:0;background:#fff;border-top:1px solid #e2e8f0">' +
          '<button class="btn btn-ghost" onclick="MSK_Tariffe.closeModalSconti()">Chiudi</button>' +
        '</div>' +

      '</div>'; /* fine modal full-screen */
    ov.classList.add('open');
  }

  function _clickSconto(id) { _editSconto = id; _renderModalSconti(); }

  function _nuovoSconto() { _editSconto = null; _renderModalSconti(); }

  function _salvaSconto() {
    var nome = (document.getElementById('sc-nome') ? document.getElementById('sc-nome').value||'' : '').trim();
    var desc = (document.getElementById('sc-desc') ? document.getElementById('sc-desc').value||'' : '').trim();
    if (!nome) { alert('⚠️ Inserire il Nome Sconto.'); return; }
    if (_editSconto === null) {
      var nid = _sconti.length > 0 ? Math.max.apply(null, _sconti.map(function(x){ return x.id; })) + 1 : 1;
      _sconti.push({ id: nid, nome_sconto: nome, descrizione_sconto: desc, righe: [] });
      _editSconto = nid;
    } else {
      var sc = _sconti.find(function(x){ return x.id === _editSconto; });
      if (sc) { sc.nome_sconto = nome; sc.descrizione_sconto = desc; }
    }
    TONIO_Storage.save('tariffe_sconti', _sconti);
    _renderModalSconti();
    _showToast('Sconto salvato ✓');
  }

  function _annullaSconto() { _editSconto = null; _renderModalSconti(); }

  function _eliminaSconto(id) {
    var sc = _sconti.find(function(x){ return x.id === id; });
    if (!sc) return;
    if (!confirm('Eliminare lo sconto "' + (sc.nome_sconto || id) + '"?')) return;
    _sconti = _sconti.filter(function(x){ return x.id !== id; });
    TONIO_Storage.save('tariffe_sconti', _sconti);
    if (_editSconto === id) _editSconto = null;
    _renderModalSconti();
  }

  function _addRigaSconto() {
    if (_editSconto === null) { alert('⚠️ Prima salva il nome dello sconto.'); return; }
    var sc = _sconti.find(function(x){ return x.id === _editSconto; });
    if (!sc) return;
    sc.righe = sc.righe || [];
    sc.righe.push({ preno_dal:'', preno_al:'', date_dal:'', date_al:'', min_notti:'', min_anticipo:'', max_anticipo:'', sc_tot_perc:'', sc_tot_eur:'', sc_notte_perc:'', sc_notte_eur:'' });
    TONIO_Storage.save('tariffe_sconti', _sconti);
    _renderModalSconti();
  }

  function _removeRigaSconto(idx) {
    if (_editSconto === null) return;
    var sc = _sconti.find(function(x){ return x.id === _editSconto; });
    if (!sc || !sc.righe) return;
    if (!confirm('Rimuovere questa condizione?')) return;
    sc.righe.splice(idx, 1);
    TONIO_Storage.save('tariffe_sconti', _sconti);
    _renderModalSconti();
  }

  function _salvaRigheSconto() {
    if (_editSconto === null) { alert('⚠️ Prima salva il nome dello sconto.'); return; }
    var sc = _sconti.find(function(x){ return x.id === _editSconto; });
    if (!sc) return;
    var rows = document.querySelectorAll('#sc-righe-tbody .tariff-riga[data-sc-idx]');
    sc.righe = [];
    rows.forEach(function(row) {
      var i = row.getAttribute('data-sc-idx');
      var g = function(pfx) { var el = document.getElementById(pfx + i); return el ? el.value.trim() : ''; };
      sc.righe.push({
        preno_dal:     g('sc-r-pdal-'),
        preno_al:      g('sc-r-pal-'),
        date_dal:      g('sc-r-ddal-'),
        date_al:       g('sc-r-dal-'),
        min_notti:     g('sc-r-mn-')  ? parseInt(g('sc-r-mn-'), 10)    : '',
        min_anticipo:  g('sc-r-mia-') ? parseInt(g('sc-r-mia-'), 10)   : '',
        max_anticipo:  g('sc-r-mxa-') ? parseInt(g('sc-r-mxa-'), 10)   : '',
        sc_tot_perc:   g('sc-r-stp-') ? parseFloat(g('sc-r-stp-'))     : '',
        sc_tot_eur:    g('sc-r-ste-') ? parseFloat(g('sc-r-ste-'))     : '',
        sc_notte_perc: g('sc-r-snp-') ? parseFloat(g('sc-r-snp-'))     : '',
        sc_notte_eur:  g('sc-r-sne-') ? parseFloat(g('sc-r-sne-'))     : ''
      });
    });
    TONIO_Storage.save('tariffe_sconti', _sconti);
    _renderModalSconti();
    _showToast('Condizioni salvate ✓');
  }

  function closeModalSconti() {
    var ov = document.getElementById('modal-tar-sconti');
    if (ov) { ov.classList.remove('open'); ov.style.padding = ''; }
    _editSconto = null;
  }

  /* ================================================================
     API PUBBLICA
  ================================================================ */
  return {
    init:             init,
    /* Tariffario inline */
    nuovaTariffa:     nuovaTariffa,
    caricaTariffa:    caricaTariffa,
    salvaTariffHeader: salvaTariffHeader,
    salvaRighe:       salvaRighe,
    addRiga:          addRiga,
    removeRiga:       removeRiga,
    eliminaTariff:    eliminaTariff,
    eliminaTariffId:  eliminaTariffId,
    annullaTariff:    annullaTariff,
    filterTariff:     filterTariff,
    /* Modali lookup */
    openModalTipo:    openModalTipo,
    _clickTipo:       _clickTipo,
    salvaTipo:        salvaTipo,
    annullaTipo:      annullaTipo,
    eliminaTipo:      eliminaTipo,
    closeModalTipo:   closeModalTipo,
    openModalTratt:   openModalTratt,
    _clickTratt:      _clickTratt,
    salvaTratt:       salvaTratt,
    annullaTratt:     annullaTratt,
    eliminaTratt:     eliminaTratt,
    closeModalTratt:  closeModalTratt,
    openModalUnita:   openModalUnita,
    _clickUnita:      _clickUnita,
    salvaUnita:       salvaUnita,
    annullaUnita:     annullaUnita,
    eliminaUnita:     eliminaUnita,
    closeModalUnita:  closeModalUnita,
    /* Sconti */
    openModalSconti:   openModalSconti,
    closeModalSconti:  closeModalSconti,
    _clickSconto:      _clickSconto,
    _nuovoSconto:      _nuovoSconto,
    _salvaSconto:      _salvaSconto,
    _annullaSconto:    _annullaSconto,
    _eliminaSconto:    _eliminaSconto,
    _addRigaSconto:    _addRigaSconto,
    _removeRigaSconto: _removeRigaSconto,
    _salvaRigheSconto: _salvaRigheSconto
  };

})();
