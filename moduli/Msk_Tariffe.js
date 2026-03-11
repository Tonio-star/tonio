/* ================================================================
   TONIO — Msk_Tariffe.js
   Modulo Tariffe — Tipo Tariffa, Trattamento, Unità di Misura,
                    Tariffario
   ================================================================ */

var MSK_Tariffe = (function () {

  /* ================================================================
     DATI IN MEMORIA
  ================================================================ */
  var _tipoTariffa   = [];
  var _trattamento   = [];
  var _unitaMisura   = [];
  var _tariffario    = [];

  /* id in modifica per ogni lookup */
  var _editTipo      = null;
  var _editTratt     = null;
  var _editUnita     = null;
  var _editTariff    = null;   /* id header tariffario */

  /* ================================================================
     INIT
  ================================================================ */
  function init() {
    var savedTipo   = TONIO_Storage.load('tariffe_tipo');
    var savedTratt  = TONIO_Storage.load('tariffe_trattamento');
    var savedUnita  = TONIO_Storage.load('tariffe_unita_misura');
    var savedTariff = TONIO_Storage.load('tariffe_tariffario');

    _tipoTariffa  = savedTipo   ? savedTipo   : JSON.parse(JSON.stringify(TONIO_TARIFFE_TIPO));
    _trattamento  = savedTratt  ? savedTratt  : JSON.parse(JSON.stringify(TONIO_TARIFFE_TRATTAMENTO));
    _unitaMisura  = savedUnita  ? savedUnita  : JSON.parse(JSON.stringify(TONIO_TARIFFE_UNITA_MISURA));
    _tariffario   = savedTariff ? savedTariff : JSON.parse(JSON.stringify(TONIO_TARIFFARIO));

    _renderTipoPage();
    _renderTrattPage();
    _renderUnitaPage();
    _renderTariffPage();
  }

  /* ================================================================
     ─────────────────────────────────────────────────────────────
     MASCHERA 1 — TIPO TARIFFA
     ─────────────────────────────────────────────────────────────
  ================================================================ */
  function _renderTipoPage() {
    var c = document.getElementById('page-tariffe_tipo');
    if (!c) return;
    c.innerHTML =
      '<div class="list-page">' +
        '<div class="list-header">' +
          '<div class="list-title-area">' +
            '<h1 class="list-title">🏷️ Tipo Tariffa</h1>' +
            '<span class="list-count" id="tar-tipo-count"></span>' +
          '</div>' +
          '<div class="list-search-area">' +
            '<input class="search-input" id="tar-tipo-search" type="text" placeholder="🔍 Cerca tipo tariffa..." oninput="MSK_Tariffe.filterTipo()">' +
          '</div>' +
        '</div>' +
        '<div class="table-wrap">' +
          '<table class="data-table" id="tar-tipo-table">' +
            '<thead><tr>' +
              '<th style="width:70px">ID</th>' +
              '<th style="width:110px">Ordine</th>' +
              '<th>Tipo Tariffa</th>' +
              '<th style="width:80px"></th>' +
            '</tr></thead>' +
            '<tbody id="tar-tipo-tbody"></tbody>' +
          '</table>' +
        '</div>' +
      '</div>';
    _renderTipoRows(_tipoTariffa);
  }

  function _renderTipoRows(list) {
    var tbody = document.getElementById('tar-tipo-tbody');
    var count = document.getElementById('tar-tipo-count');
    if (!tbody) return;
    if (count) count.textContent = list.length + ' record';
    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:32px;color:#94a3b8">Nessun tipo tariffa trovato</td></tr>';
      return;
    }
    var html = '';
    list.forEach(function (r) {
      html +=
        '<tr class="data-row" onclick="MSK_Tariffe.openEditTipo(' + r.id + ')">' +
          '<td><span class="id-badge">' + r.id + '</span></td>' +
          '<td><span class="ordine-val">' + r.ordine + '</span></td>' +
          '<td><strong>' + TONIO_escapeHtml(r.nome) + '</strong></td>' +
          '<td onclick="event.stopPropagation()">' +
            '<button class="btn-icon btn-danger" title="Elimina" onclick="MSK_Tariffe.eliminaTipo(' + r.id + ')">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/><path d="M9,6V4h6v2"/></svg>' +
            '</button>' +
          '</td>' +
        '</tr>';
    });
    tbody.innerHTML = html;
  }

  function filterTipo() {
    var q = (document.getElementById('tar-tipo-search').value || '').toLowerCase();
    _renderTipoRows(_tipoTariffa.filter(function (r) { return r.nome.toLowerCase().indexOf(q) !== -1; }));
  }

  function nuovoTipoTariffa() { _editTipo = null; _openModalTipo(null); }

  function openEditTipo(id) {
    var r = _tipoTariffa.find(function (x) { return x.id === id; });
    if (!r) return;
    _editTipo = id;
    _openModalTipo(r);
  }

  function _openModalTipo(r) {
    var isNew  = !r;
    var nome   = r ? r.nome   : '';
    var ordine = r ? r.ordine : (_tipoTariffa.length + 1);
    var id     = r ? r.id     : '';
    var ov     = _getOrCreateOverlay('modal-tar-tipo');

    ov.innerHTML =
      '<div class="modal modal-md">' +
        '<div class="modal-header">' +
          '<span style="font-size:19px">🏷️</span>' +
          '<div class="modal-title">' + (isNew ? 'Nuovo Tipo Tariffa' : 'Modifica Tipo Tariffa') + '</div>' +
          '<button class="modal-close" onclick="MSK_Tariffe.closeModalTipo()">×</button>' +
        '</div>' +
        '<div class="modal-body">' +
          (!isNew ? '<div class="form-row"><div class="form-group"><label class="form-label">ID</label><input class="form-input" type="text" value="' + id + '" readonly style="background:#f8fafc;color:#94a3b8;cursor:default"></div></div>' : '') +
          '<div class="form-row"><div class="form-group"><label class="form-label">Ordinamento Manuale</label><input class="form-input" type="number" id="tar-tipo-ordine" value="' + ordine + '" min="1"></div></div>' +
          '<div class="form-row"><div class="form-group"><label class="form-label">Tipo Tariffa <span class="req">*</span></label><input class="form-input" type="text" id="tar-tipo-nome" value="' + TONIO_escapeHtml(nome) + '" placeholder="Es. Tariffa Base"></div></div>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn btn-primary" onclick="MSK_Tariffe.salvaTipo()">' +
            '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>Salva' +
          '</button>' +
          (!isNew ? '<button class="btn btn-danger" onclick="MSK_Tariffe.eliminaTipo(' + id + ')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/></svg>Elimina</button>' : '') +
          '<button class="btn btn-ghost" onclick="MSK_Tariffe.closeModalTipo()">Annulla</button>' +
        '</div>' +
      '</div>';
    ov.classList.add('open');
  }

  function salvaTipo() {
    var nome   = (document.getElementById('tar-tipo-nome').value || '').trim();
    var ordine = parseInt(document.getElementById('tar-tipo-ordine').value, 10) || 1;
    if (!nome) { alert('⚠️ Inserire il Tipo Tariffa.'); document.getElementById('tar-tipo-nome').focus(); return; }
    if (_editTipo === null) {
      var newId = _tipoTariffa.length > 0 ? Math.max.apply(null, _tipoTariffa.map(function (r) { return r.id; })) + 1 : 1;
      _tipoTariffa.push({ id: newId, ordine: ordine, nome: nome });
    } else {
      var rec = _tipoTariffa.find(function (r) { return r.id === _editTipo; });
      if (rec) { rec.nome = nome; rec.ordine = ordine; }
    }
    _tipoTariffa.sort(function (a, b) { return a.ordine - b.ordine; });
    TONIO_Storage.save('tariffe_tipo', _tipoTariffa);
    closeModalTipo();
    _renderTipoRows(_tipoTariffa);
    var c = document.getElementById('tar-tipo-count'); if (c) c.textContent = _tipoTariffa.length + ' record';
  }

  function eliminaTipo(id) {
    var rec = _tipoTariffa.find(function (r) { return r.id === id; });
    if (!rec) return;
    if (!confirm('Eliminare il tipo tariffa "' + rec.nome + '"?\nL\'operazione non può essere annullata.')) return;
    _tipoTariffa = _tipoTariffa.filter(function (r) { return r.id !== id; });
    TONIO_Storage.save('tariffe_tipo', _tipoTariffa);
    closeModalTipo();
    _renderTipoRows(_tipoTariffa);
    var c = document.getElementById('tar-tipo-count'); if (c) c.textContent = _tipoTariffa.length + ' record';
  }

  function closeModalTipo() {
    var ov = document.getElementById('modal-tar-tipo');
    if (ov) ov.classList.remove('open');
    _editTipo = null;
  }

  /* ================================================================
     ─────────────────────────────────────────────────────────────
     MASCHERA 2 — TRATTAMENTO
     Layout ORIZZONTALE come richiesto dal SAD
     ─────────────────────────────────────────────────────────────
  ================================================================ */
  function _renderTrattPage() {
    var c = document.getElementById('page-tariffe_trattamento');
    if (!c) return;
    c.innerHTML =
      '<div class="list-page">' +
        '<div class="list-header">' +
          '<div class="list-title-area">' +
            '<h1 class="list-title">🍽️ Trattamento</h1>' +
            '<span class="list-count" id="tar-tratt-count"></span>' +
          '</div>' +
          '<div class="list-search-area">' +
            '<input class="search-input" id="tar-tratt-search" type="text" placeholder="🔍 Cerca trattamento..." oninput="MSK_Tariffe.filterTratt()">' +
          '</div>' +
        '</div>' +
        '<div class="table-wrap">' +
          '<table class="data-table" id="tar-tratt-table">' +
            '<thead><tr>' +
              '<th style="width:70px">ID</th>' +
              '<th style="width:110px">Ordine</th>' +
              '<th>Trattamento</th>' +
              '<th>Definizione</th>' +
              '<th style="width:80px"></th>' +
            '</tr></thead>' +
            '<tbody id="tar-tratt-tbody"></tbody>' +
          '</table>' +
        '</div>' +
      '</div>';
    _renderTrattRows(_trattamento);
  }

  function _renderTrattRows(list) {
    var tbody = document.getElementById('tar-tratt-tbody');
    var count = document.getElementById('tar-tratt-count');
    if (!tbody) return;
    if (count) count.textContent = list.length + ' record';
    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:32px;color:#94a3b8">Nessun trattamento trovato</td></tr>';
      return;
    }
    var html = '';
    list.forEach(function (r) {
      html +=
        '<tr class="data-row" onclick="MSK_Tariffe.openEditTratt(' + r.id + ')">' +
          '<td><span class="id-badge">' + r.id + '</span></td>' +
          '<td><span class="ordine-val">' + r.ordine + '</span></td>' +
          '<td><strong>' + TONIO_escapeHtml(r.nome) + '</strong></td>' +
          '<td style="color:#64748b;font-size:13px">' + TONIO_escapeHtml(r.definizione || '') + '</td>' +
          '<td onclick="event.stopPropagation()">' +
            '<button class="btn-icon btn-danger" title="Elimina" onclick="MSK_Tariffe.eliminaTratt(' + r.id + ')">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/><path d="M9,6V4h6v2"/></svg>' +
            '</button>' +
          '</td>' +
        '</tr>';
    });
    tbody.innerHTML = html;
  }

  function filterTratt() {
    var q = (document.getElementById('tar-tratt-search').value || '').toLowerCase();
    _renderTrattRows(_trattamento.filter(function (r) {
      return r.nome.toLowerCase().indexOf(q) !== -1 || (r.definizione || '').toLowerCase().indexOf(q) !== -1;
    }));
  }

  function nuovoTrattamento() { _editTratt = null; _openModalTratt(null); }

  function openEditTratt(id) {
    var r = _trattamento.find(function (x) { return x.id === id; });
    if (!r) return;
    _editTratt = id;
    _openModalTratt(r);
  }

  function _openModalTratt(r) {
    var isNew      = !r;
    var nome       = r ? r.nome       : '';
    var definizione = r ? r.definizione : '';
    var ordine     = r ? r.ordine     : (_trattamento.length + 1);
    var id         = r ? r.id         : '';
    var ov         = _getOrCreateOverlay('modal-tar-tratt');

    /* Layout ORIZZONTALE: campi affiancati su una riga */
    ov.innerHTML =
      '<div class="modal" style="max-width:760px">' +
        '<div class="modal-header">' +
          '<span style="font-size:19px">🍽️</span>' +
          '<div class="modal-title">' + (isNew ? 'Nuovo Trattamento' : 'Modifica Trattamento') + '</div>' +
          '<button class="modal-close" onclick="MSK_Tariffe.closeModalTratt()">×</button>' +
        '</div>' +
        '<div class="modal-body">' +
          /* Riga orizzontale: ID | Ordine | Trattamento | Definizione */
          '<div class="form-row" style="display:flex;gap:16px;align-items:flex-end;flex-wrap:nowrap">' +
            (!isNew ?
            '<div class="form-group" style="flex:0 0 70px">' +
              '<label class="form-label">ID</label>' +
              '<input class="form-input" type="text" value="' + id + '" readonly style="background:#f8fafc;color:#94a3b8;cursor:default">' +
            '</div>' : '') +
            '<div class="form-group" style="flex:0 0 100px">' +
              '<label class="form-label">Ordine</label>' +
              '<input class="form-input" type="number" id="tar-tratt-ordine" value="' + ordine + '" min="1">' +
            '</div>' +
            '<div class="form-group" style="flex:1 1 200px">' +
              '<label class="form-label">Trattamento <span class="req">*</span></label>' +
              '<input class="form-input" type="text" id="tar-tratt-nome" value="' + TONIO_escapeHtml(nome) + '" placeholder="Es. Bed & Breakfast">' +
            '</div>' +
            '<div class="form-group" style="flex:2 1 300px">' +
              '<label class="form-label">Definizione</label>' +
              '<input class="form-input" type="text" id="tar-tratt-def" value="' + TONIO_escapeHtml(definizione) + '" placeholder="Breve descrizione del trattamento">' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn btn-primary" onclick="MSK_Tariffe.salvaTratt()">' +
            '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>Salva' +
          '</button>' +
          (!isNew ? '<button class="btn btn-danger" onclick="MSK_Tariffe.eliminaTratt(' + id + ')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/></svg>Elimina</button>' : '') +
          '<button class="btn btn-ghost" onclick="MSK_Tariffe.closeModalTratt()">Annulla</button>' +
        '</div>' +
      '</div>';
    ov.classList.add('open');
  }

  function salvaTratt() {
    var nome        = (document.getElementById('tar-tratt-nome').value || '').trim();
    var definizione = (document.getElementById('tar-tratt-def').value  || '').trim();
    var ordine      = parseInt(document.getElementById('tar-tratt-ordine').value, 10) || 1;
    if (!nome) { alert('⚠️ Inserire il Trattamento.'); document.getElementById('tar-tratt-nome').focus(); return; }
    if (_editTratt === null) {
      var newId = _trattamento.length > 0 ? Math.max.apply(null, _trattamento.map(function (r) { return r.id; })) + 1 : 1;
      _trattamento.push({ id: newId, ordine: ordine, nome: nome, definizione: definizione });
    } else {
      var rec = _trattamento.find(function (r) { return r.id === _editTratt; });
      if (rec) { rec.nome = nome; rec.definizione = definizione; rec.ordine = ordine; }
    }
    _trattamento.sort(function (a, b) { return a.ordine - b.ordine; });
    TONIO_Storage.save('tariffe_trattamento', _trattamento);
    closeModalTratt();
    _renderTrattRows(_trattamento);
    var c = document.getElementById('tar-tratt-count'); if (c) c.textContent = _trattamento.length + ' record';
  }

  function eliminaTratt(id) {
    var rec = _trattamento.find(function (r) { return r.id === id; });
    if (!rec) return;
    if (!confirm('Eliminare il trattamento "' + rec.nome + '"?\nL\'operazione non può essere annullata.')) return;
    _trattamento = _trattamento.filter(function (r) { return r.id !== id; });
    TONIO_Storage.save('tariffe_trattamento', _trattamento);
    closeModalTratt();
    _renderTrattRows(_trattamento);
    var c = document.getElementById('tar-tratt-count'); if (c) c.textContent = _trattamento.length + ' record';
  }

  function closeModalTratt() {
    var ov = document.getElementById('modal-tar-tratt');
    if (ov) ov.classList.remove('open');
    _editTratt = null;
  }

  /* ================================================================
     ─────────────────────────────────────────────────────────────
     MASCHERA 3 — UNITÀ DI MISURA
     ─────────────────────────────────────────────────────────────
  ================================================================ */
  function _renderUnitaPage() {
    var c = document.getElementById('page-tariffe_unita');
    if (!c) return;
    c.innerHTML =
      '<div class="list-page">' +
        '<div class="list-header">' +
          '<div class="list-title-area">' +
            '<h1 class="list-title">📐 Unità di Misura</h1>' +
            '<span class="list-count" id="tar-unita-count"></span>' +
          '</div>' +
          '<div class="list-search-area">' +
            '<input class="search-input" id="tar-unita-search" type="text" placeholder="🔍 Cerca unità..." oninput="MSK_Tariffe.filterUnita()">' +
          '</div>' +
        '</div>' +
        '<div class="table-wrap">' +
          '<table class="data-table">' +
            '<thead><tr>' +
              '<th style="width:70px">ID</th>' +
              '<th style="width:110px">Ordine</th>' +
              '<th>Unità di Misura</th>' +
              '<th style="width:80px"></th>' +
            '</tr></thead>' +
            '<tbody id="tar-unita-tbody"></tbody>' +
          '</table>' +
        '</div>' +
      '</div>';
    _renderUnitaRows(_unitaMisura);
  }

  function _renderUnitaRows(list) {
    var tbody = document.getElementById('tar-unita-tbody');
    var count = document.getElementById('tar-unita-count');
    if (!tbody) return;
    if (count) count.textContent = list.length + ' record';
    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:32px;color:#94a3b8">Nessuna unità trovata</td></tr>';
      return;
    }
    var html = '';
    list.forEach(function (r) {
      html +=
        '<tr class="data-row" onclick="MSK_Tariffe.openEditUnita(' + r.id + ')">' +
          '<td><span class="id-badge">' + r.id + '</span></td>' +
          '<td><span class="ordine-val">' + r.ordine + '</span></td>' +
          '<td><strong>' + TONIO_escapeHtml(r.nome) + '</strong></td>' +
          '<td onclick="event.stopPropagation()">' +
            '<button class="btn-icon btn-danger" title="Elimina" onclick="MSK_Tariffe.eliminaUnita(' + r.id + ')">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/><path d="M9,6V4h6v2"/></svg>' +
            '</button>' +
          '</td>' +
        '</tr>';
    });
    tbody.innerHTML = html;
  }

  function filterUnita() {
    var q = (document.getElementById('tar-unita-search').value || '').toLowerCase();
    _renderUnitaRows(_unitaMisura.filter(function (r) { return r.nome.toLowerCase().indexOf(q) !== -1; }));
  }

  function nuovaUnitaMisura() { _editUnita = null; _openModalUnita(null); }

  function openEditUnita(id) {
    var r = _unitaMisura.find(function (x) { return x.id === id; });
    if (!r) return;
    _editUnita = id;
    _openModalUnita(r);
  }

  function _openModalUnita(r) {
    var isNew  = !r;
    var nome   = r ? r.nome   : '';
    var ordine = r ? r.ordine : (_unitaMisura.length + 1);
    var id     = r ? r.id     : '';
    var ov     = _getOrCreateOverlay('modal-tar-unita');

    ov.innerHTML =
      '<div class="modal modal-md">' +
        '<div class="modal-header">' +
          '<span style="font-size:19px">📐</span>' +
          '<div class="modal-title">' + (isNew ? 'Nuova Unità di Misura' : 'Modifica Unità di Misura') + '</div>' +
          '<button class="modal-close" onclick="MSK_Tariffe.closeModalUnita()">×</button>' +
        '</div>' +
        '<div class="modal-body">' +
          (!isNew ? '<div class="form-row"><div class="form-group"><label class="form-label">ID</label><input class="form-input" type="text" value="' + id + '" readonly style="background:#f8fafc;color:#94a3b8;cursor:default"></div></div>' : '') +
          '<div class="form-row"><div class="form-group"><label class="form-label">Ordinamento Manuale</label><input class="form-input" type="number" id="tar-unita-ordine" value="' + ordine + '" min="1"></div></div>' +
          '<div class="form-row"><div class="form-group"><label class="form-label">Unità di Misura <span class="req">*</span></label><input class="form-input" type="text" id="tar-unita-nome" value="' + TONIO_escapeHtml(nome) + '" placeholder="Es. Per Notte"></div></div>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn btn-primary" onclick="MSK_Tariffe.salvaUnita()">' +
            '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>Salva' +
          '</button>' +
          (!isNew ? '<button class="btn btn-danger" onclick="MSK_Tariffe.eliminaUnita(' + id + ')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/></svg>Elimina</button>' : '') +
          '<button class="btn btn-ghost" onclick="MSK_Tariffe.closeModalUnita()">Annulla</button>' +
        '</div>' +
      '</div>';
    ov.classList.add('open');
  }

  function salvaUnita() {
    var nome   = (document.getElementById('tar-unita-nome').value || '').trim();
    var ordine = parseInt(document.getElementById('tar-unita-ordine').value, 10) || 1;
    if (!nome) { alert('⚠️ Inserire l\'Unità di Misura.'); document.getElementById('tar-unita-nome').focus(); return; }
    if (_editUnita === null) {
      var newId = _unitaMisura.length > 0 ? Math.max.apply(null, _unitaMisura.map(function (r) { return r.id; })) + 1 : 1;
      _unitaMisura.push({ id: newId, ordine: ordine, nome: nome });
    } else {
      var rec = _unitaMisura.find(function (r) { return r.id === _editUnita; });
      if (rec) { rec.nome = nome; rec.ordine = ordine; }
    }
    _unitaMisura.sort(function (a, b) { return a.ordine - b.ordine; });
    TONIO_Storage.save('tariffe_unita_misura', _unitaMisura);
    closeModalUnita();
    _renderUnitaRows(_unitaMisura);
    var c = document.getElementById('tar-unita-count'); if (c) c.textContent = _unitaMisura.length + ' record';
  }

  function eliminaUnita(id) {
    var rec = _unitaMisura.find(function (r) { return r.id === id; });
    if (!rec) return;
    if (!confirm('Eliminare l\'unità di misura "' + rec.nome + '"?\nL\'operazione non può essere annullata.')) return;
    _unitaMisura = _unitaMisura.filter(function (r) { return r.id !== id; });
    TONIO_Storage.save('tariffe_unita_misura', _unitaMisura);
    closeModalUnita();
    _renderUnitaRows(_unitaMisura);
    var c = document.getElementById('tar-unita-count'); if (c) c.textContent = _unitaMisura.length + ' record';
  }

  function closeModalUnita() {
    var ov = document.getElementById('modal-tar-unita');
    if (ov) ov.classList.remove('open');
    _editUnita = null;
  }

  /* ================================================================
     ─────────────────────────────────────────────────────────────
     MASCHERA 4 — TARIFFARIO
     Layout ORIZZONTALE come da SAD — sezione HEADER (campi unici)
     + sezione RIGHE (multi-record inseribili)
     ─────────────────────────────────────────────────────────────
  ================================================================ */
  function _renderTariffPage() {
    var c = document.getElementById('page-tariffe');
    if (!c) return;
    c.innerHTML =
      '<div class="list-page">' +
        '<div class="list-header">' +
          '<div class="list-title-area">' +
            '<h1 class="list-title">💶 Tariffario</h1>' +
            '<span class="list-count" id="tar-tariff-count"></span>' +
          '</div>' +
          '<div class="list-search-area">' +
            '<input class="search-input" id="tar-tariff-search" type="text" placeholder="🔍 Cerca tariffa..." oninput="MSK_Tariffe.filterTariff()">' +
          '</div>' +
        '</div>' +
        '<div class="table-wrap" style="overflow-x:auto">' +
          '<table class="data-table" style="min-width:900px">' +
            '<thead>' +
              '<tr style="background:#f8fafc">' +
                '<th colspan="6" style="background:#1e3a5f;color:#fff;text-align:left;padding:8px 12px;font-size:12px;letter-spacing:.5px">INTESTAZIONE TARIFFA (unica per riga)</th>' +
                '<th colspan="2" style="width:80px"></th>' +
              '</tr>' +
              '<tr>' +
                '<th>Tipo Tariffa</th>' +
                '<th>Trattamento</th>' +
                '<th>Super Prodotto</th>' +
                '<th>Prodotto</th>' +
                '<th>Unità di Misura</th>' +
                '<th style="width:80px">% IVA</th>' +
                '<th style="width:80px">Righe</th>' +
                '<th style="width:80px"></th>' +
              '</tr>' +
            '</thead>' +
            '<tbody id="tar-tariff-tbody"></tbody>' +
          '</table>' +
        '</div>' +
      '</div>';
    _renderTariffRows(_tariffario);
  }

  function _renderTariffRows(list) {
    var tbody = document.getElementById('tar-tariff-tbody');
    var count = document.getElementById('tar-tariff-count');
    if (!tbody) return;
    if (count) count.textContent = list.length + ' tariffe';
    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:32px;color:#94a3b8">Nessuna tariffa trovata</td></tr>';
      return;
    }
    var html = '';
    list.forEach(function (r) {
      var nRighe = (r.righe || []).length;
      html +=
        '<tr class="data-row" onclick="MSK_Tariffe.openEditTariff(' + r.id + ')">' +
          '<td><strong>' + TONIO_escapeHtml(r.tipo_tariffa || '—') + '</strong></td>' +
          '<td>' + TONIO_escapeHtml(r.trattamento || '—') + '</td>' +
          '<td>' + TONIO_escapeHtml(r.super_prodotto || '—') + '</td>' +
          '<td>' + TONIO_escapeHtml(r.prodotto || '—') + '</td>' +
          '<td>' + TONIO_escapeHtml(r.unita_misura || '—') + '</td>' +
          '<td style="text-align:center">' + (r.iva_perc !== undefined && r.iva_perc !== null ? r.iva_perc + '%' : '—') + '</td>' +
          '<td style="text-align:center">' +
            '<span class="badge" style="background:#eff6ff;color:#3b82f6;border:1px solid #bfdbfe">' + nRighe + '</span>' +
          '</td>' +
          '<td onclick="event.stopPropagation()">' +
            '<button class="btn-icon btn-danger" title="Elimina" onclick="MSK_Tariffe.eliminaTariff(' + r.id + ')">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/><path d="M9,6V4h6v2"/></svg>' +
            '</button>' +
          '</td>' +
        '</tr>';
    });
    tbody.innerHTML = html;
  }

  function filterTariff() {
    var q = (document.getElementById('tar-tariff-search').value || '').toLowerCase();
    _renderTariffRows(_tariffario.filter(function (r) {
      return (r.tipo_tariffa || '').toLowerCase().indexOf(q) !== -1 ||
             (r.trattamento  || '').toLowerCase().indexOf(q) !== -1 ||
             (r.prodotto     || '').toLowerCase().indexOf(q) !== -1;
    }));
  }

  function nuovaTariffa() { _editTariff = null; _openModalTariff(null); }

  function openEditTariff(id) {
    var r = _tariffario.find(function (x) { return x.id === id; });
    if (!r) return;
    _editTariff = id;
    _openModalTariff(r);
  }

  /* ─── helper: costruisce <option> per un select ─── */
  function _opts(arr, selected, emptyLabel) {
    var html = '<option value="">' + (emptyLabel || '— Seleziona —') + '</option>';
    arr.forEach(function (item) {
      var v = item.nome;
      html += '<option value="' + TONIO_escapeHtml(v) + '"' + (v === selected ? ' selected' : '') + '>' + TONIO_escapeHtml(v) + '</option>';
    });
    return html;
  }

  /* ─── helper: costruisce una riga dettaglio del tariffario ─── */
  function _buildRigaHtml(riga, idx) {
    var tipiAppartamento = (typeof TONIO_IMMOBILI_TIPI !== 'undefined') ? TONIO_IMMOBILI_TIPI : [];

    return (
      '<tr class="tariff-riga" data-idx="' + idx + '">' +
        '<td>' +
          '<select class="form-input form-input-sm" id="tr-tipo-app-' + idx + '">' +
            _opts(tipiAppartamento, riga ? riga.tipo_appartamento : '') +
          '</select>' +
        '</td>' +
        '<td><input class="form-input form-input-sm" type="date" id="tr-dal-' + idx + '" value="' + (riga ? riga.dal || '' : '') + '"></td>' +
        '<td><input class="form-input form-input-sm" type="date" id="tr-al-' + idx + '"  value="' + (riga ? riga.al  || '' : '') + '"></td>' +
        '<td><input class="form-input form-input-sm" type="number" id="tr-importo-' + idx + '" value="' + (riga ? riga.importo || '' : '') + '" step="0.01" min="0" placeholder="0,00" style="text-align:right"></td>' +
        /* Obbligatorio */
        '<td style="text-align:center"><input type="checkbox" id="tr-obl-' + idx + '"' + (riga && riga.obbligatorio ? ' checked' : '') + '></td>' +
        /* Chi Paga */
        '<td style="text-align:center"><input type="checkbox" id="tr-cp-cli-' + idx + '"' + (riga && riga.chi_paga_cli ? ' checked' : '') + '></td>' +
        '<td style="text-align:center"><input type="checkbox" id="tr-cp-osp-' + idx + '"' + (riga && riga.chi_paga_osp ? ' checked' : '') + '></td>' +
        /* Fatturare a */
        '<td style="text-align:center"><input type="checkbox" id="tr-fat-' + idx + '"'    + (riga && riga.fat_fat ? ' checked' : '') + '></td>' +
        '<td style="text-align:center"><input type="checkbox" id="tr-nf-' + idx + '"'     + (riga && riga.fat_nf  ? ' checked' : '') + '></td>' +
        '<td style="text-align:center"><input type="checkbox" id="tr-fcli-' + idx + '"'   + (riga && riga.fatturare_cli ? ' checked' : '') + '></td>' +
        '<td style="text-align:center"><input type="checkbox" id="tr-fosp-' + idx + '"'   + (riga && riga.fatturare_osp ? ' checked' : '') + '></td>' +
        /* Ordinamento */
        '<td><input class="form-input form-input-sm" type="number" id="tr-ord-' + idx + '" value="' + (riga ? riga.ordinamento || (idx + 1) : (idx + 1)) + '" min="1" style="width:60px"></td>' +
        '<td style="text-align:center">' +
          '<button class="btn-icon btn-danger" title="Rimuovi riga" onclick="MSK_Tariffe.removeRiga(' + idx + ')" style="padding:4px 6px">' +
            '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/></svg>' +
          '</button>' +
        '</td>' +
      '</tr>'
    );
  }

  /* Contatore righe temporaneo */
  var _righeCount = 0;

  function _openModalTariff(r) {
    var isNew        = !r;
    var tipo_tariffa = r ? r.tipo_tariffa   : '';
    var trattamento  = r ? r.trattamento    : '';
    var super_prod   = r ? r.super_prodotto : '';
    var prodotto     = r ? r.prodotto       : '';
    var unita        = r ? r.unita_misura   : '';
    var iva          = r ? (r.iva_perc !== undefined ? r.iva_perc : '') : '';
    var righe        = r ? (r.righe || []) : [];
    var id           = r ? r.id : '';

    _righeCount = righe.length;

    /* Legge lookup da memoria */
    var superProds = (typeof TONIO_IMMOBILI_SUPERPRODOTTI !== 'undefined') ? TONIO_IMMOBILI_SUPERPRODOTTI : [];
    var prods      = (typeof TONIO_IMMOBILI_PRODOTTI      !== 'undefined') ? TONIO_IMMOBILI_PRODOTTI      : [];

    var ov = _getOrCreateOverlay('modal-tar-tariff');

    /* ─── righe dettaglio ─── */
    var righeHtml = '';
    righe.forEach(function (riga, idx) { righeHtml += _buildRigaHtml(riga, idx); });

    ov.innerHTML =
      '<div class="modal" style="max-width:1100px;width:97vw">' +
        '<div class="modal-header">' +
          '<span style="font-size:19px">💶</span>' +
          '<div class="modal-title">' + (isNew ? 'Nuova Tariffa' : 'Modifica Tariffa') + '</div>' +
          '<button class="modal-close" onclick="MSK_Tariffe.closeModalTariff()">×</button>' +
        '</div>' +
        '<div class="modal-body" style="padding:20px">' +

          /* ── SEZIONE HEADER (orizzontale, campi unici) ── */
          '<div style="background:#f0f4ff;border:1px solid #c7d7f5;border-radius:8px;padding:14px 18px;margin-bottom:20px">' +
            '<div style="font-size:11px;font-weight:700;color:#1e3a5f;letter-spacing:.6px;text-transform:uppercase;margin-bottom:12px">📌 Dati Tariffa (unici)</div>' +
            '<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end">' +
              (!isNew ?
              '<div class="form-group" style="flex:0 0 60px">' +
                '<label class="form-label" style="font-size:11px">ID</label>' +
                '<input class="form-input" type="text" value="' + id + '" readonly style="background:#f8fafc;color:#94a3b8;cursor:default;height:36px;font-size:13px">' +
              '</div>' : '') +
              '<div class="form-group" style="flex:1 1 160px">' +
                '<label class="form-label" style="font-size:11px">Tipo Tariffa <span class="req">*</span></label>' +
                '<select class="form-input" id="tar-tf-tipo" style="height:36px;font-size:13px">' + _opts(_tipoTariffa, tipo_tariffa) + '</select>' +
              '</div>' +
              '<div class="form-group" style="flex:1 1 160px">' +
                '<label class="form-label" style="font-size:11px">Trattamento</label>' +
                '<select class="form-input" id="tar-tf-tratt" style="height:36px;font-size:13px">' + _opts(_trattamento, trattamento) + '</select>' +
              '</div>' +
              '<div class="form-group" style="flex:1 1 140px">' +
                '<label class="form-label" style="font-size:11px">Super Prodotto</label>' +
                '<select class="form-input" id="tar-tf-superprod" style="height:36px;font-size:13px">' + _opts(superProds, super_prod) + '</select>' +
              '</div>' +
              '<div class="form-group" style="flex:1 1 140px">' +
                '<label class="form-label" style="font-size:11px">Prodotto</label>' +
                '<select class="form-input" id="tar-tf-prod" style="height:36px;font-size:13px">' + _opts(prods, prodotto) + '</select>' +
              '</div>' +
              '<div class="form-group" style="flex:1 1 140px">' +
                '<label class="form-label" style="font-size:11px">Unità di Misura</label>' +
                '<select class="form-input" id="tar-tf-unita" style="height:36px;font-size:13px">' + _opts(_unitaMisura, unita) + '</select>' +
              '</div>' +
              '<div class="form-group" style="flex:0 0 90px">' +
                '<label class="form-label" style="font-size:11px">% IVA</label>' +
                '<input class="form-input" type="number" id="tar-tf-iva" value="' + iva + '" min="0" max="100" step="1" placeholder="0" style="height:36px;font-size:13px">' +
              '</div>' +
            '</div>' +
          '</div>' +

          /* ── SEZIONE RIGHE (multi-record) ── */
          '<div style="font-size:11px;font-weight:700;color:#1e3a5f;letter-spacing:.6px;text-transform:uppercase;margin-bottom:10px">📋 Righe Tariffario</div>' +
          '<div style="overflow-x:auto">' +
            '<table class="data-table" style="min-width:1000px;font-size:12px" id="tar-righe-table">' +
              '<thead>' +
                '<tr style="background:#f8fafc">' +
                  '<th colspan="4"></th>' +
                  '<th colspan="1" style="text-align:center;background:#fef9ef;color:#92400e;border-bottom:2px solid #f97316;font-size:10px"></th>' +
                  '<th colspan="2" style="text-align:center;background:#f0fdf4;color:#166534;border-bottom:2px solid #22c55e;font-size:10px">Chi Paga</th>' +
                  '<th colspan="4" style="text-align:center;background:#eff6ff;color:#1e40af;border-bottom:2px solid #3b82f6;font-size:10px">Fatturare a</th>' +
                  '<th colspan="2"></th>' +
                '</tr>' +
                '<tr style="background:#f1f5f9;font-size:11px">' +
                  '<th>Tipo Appartamento</th>' +
                  '<th>Dal</th>' +
                  '<th>Al</th>' +
                  '<th>Importo</th>' +
                  '<th style="text-align:center">Obblig.</th>' +
                  '<th style="text-align:center">Cli</th>' +
                  '<th style="text-align:center">Osp</th>' +
                  '<th style="text-align:center">Fat</th>' +
                  '<th style="text-align:center">NF</th>' +
                  '<th style="text-align:center">Cli</th>' +
                  '<th style="text-align:center">Osp</th>' +
                  '<th style="text-align:center;width:60px">Ord.</th>' +
                  '<th style="width:40px"></th>' +
                '</tr>' +
              '</thead>' +
              '<tbody id="tar-righe-tbody">' + righeHtml + '</tbody>' +
            '</table>' +
          '</div>' +
          '<button class="btn btn-ghost" style="margin-top:10px;font-size:13px" onclick="MSK_Tariffe.addRiga()">＋ Aggiungi Riga</button>' +

        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn btn-primary" onclick="MSK_Tariffe.salvaTariff()">' +
            '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>Salva' +
          '</button>' +
          (!isNew ? '<button class="btn btn-danger" onclick="MSK_Tariffe.eliminaTariff(' + id + ')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/></svg>Elimina</button>' : '') +
          '<button class="btn btn-ghost" onclick="MSK_Tariffe.closeModalTariff()">Annulla</button>' +
        '</div>' +
      '</div>';

    ov.classList.add('open');
  }

  /* Aggiunge una riga vuota alla tabella dettaglio */
  function addRiga() {
    var tbody = document.getElementById('tar-righe-tbody');
    if (!tbody) return;
    var idx = _righeCount++;
    var tr = document.createElement('tr');
    tr.innerHTML = _buildRigaHtml(null, idx).replace(/^<tr[^>]*>/, '').replace(/<\/tr>$/, '');
    tr.className = 'tariff-riga';
    tr.setAttribute('data-idx', idx);
    tbody.insertAdjacentHTML('beforeend', _buildRigaHtml(null, idx));
  }

  /* Rimuove una riga dalla tabella */
  function removeRiga(idx) {
    var row = document.querySelector('.tariff-riga[data-idx="' + idx + '"]');
    if (row) row.parentNode.removeChild(row);
  }

  /* Legge tutte le righe dalla tabella DOM */
  function _leggiRighe() {
    var rows = document.querySelectorAll('.tariff-riga');
    var righe = [];
    rows.forEach(function (row) {
      var idx = parseInt(row.getAttribute('data-idx'), 10);
      var g = function (id) { var el = document.getElementById(id + '-' + idx); return el ? el : null; };
      var gv = function (id) { var el = g(id); return el ? el.value : ''; };
      var gc = function (id) { var el = g(id); return el ? el.checked : false; };

      righe.push({
        tipo_appartamento: gv('tr-tipo-app'),
        dal:               gv('tr-dal'),
        al:                gv('tr-al'),
        importo:           parseFloat(gv('tr-importo')) || 0,
        obbligatorio:      gc('tr-obl'),
        chi_paga_cli:      gc('tr-cp-cli'),
        chi_paga_osp:      gc('tr-cp-osp'),
        fat_fat:           gc('tr-fat'),
        fat_nf:            gc('tr-nf'),
        fatturare_cli:     gc('tr-fcli'),
        fatturare_osp:     gc('tr-fosp'),
        ordinamento:       parseInt(gv('tr-ord'), 10) || 1
      });
    });
    return righe;
  }

  function salvaTariff() {
    var tipo_tariffa  = document.getElementById('tar-tf-tipo').value;
    var trattamento   = document.getElementById('tar-tf-tratt').value;
    var super_prodotto = document.getElementById('tar-tf-superprod').value;
    var prodotto      = document.getElementById('tar-tf-prod').value;
    var unita_misura  = document.getElementById('tar-tf-unita').value;
    var iva_perc      = parseFloat(document.getElementById('tar-tf-iva').value) || 0;
    var righe         = _leggiRighe();

    if (!tipo_tariffa) { alert('⚠️ Selezionare il Tipo Tariffa.'); return; }

    if (_editTariff === null) {
      var newId = _tariffario.length > 0 ? Math.max.apply(null, _tariffario.map(function (r) { return r.id; })) + 1 : 1;
      _tariffario.push({ id: newId, tipo_tariffa: tipo_tariffa, trattamento: trattamento, super_prodotto: super_prodotto, prodotto: prodotto, unita_misura: unita_misura, iva_perc: iva_perc, righe: righe });
    } else {
      var rec = _tariffario.find(function (r) { return r.id === _editTariff; });
      if (rec) { rec.tipo_tariffa = tipo_tariffa; rec.trattamento = trattamento; rec.super_prodotto = super_prodotto; rec.prodotto = prodotto; rec.unita_misura = unita_misura; rec.iva_perc = iva_perc; rec.righe = righe; }
    }

    TONIO_Storage.save('tariffe_tariffario', _tariffario);
    closeModalTariff();
    _renderTariffRows(_tariffario);
    var c = document.getElementById('tar-tariff-count'); if (c) c.textContent = _tariffario.length + ' tariffe';
  }

  function eliminaTariff(id) {
    var rec = _tariffario.find(function (r) { return r.id === id; });
    if (!rec) return;
    if (!confirm('Eliminare la tariffa "' + (rec.tipo_tariffa || id) + '"?\nL\'operazione non può essere annullata.')) return;
    _tariffario = _tariffario.filter(function (r) { return r.id !== id; });
    TONIO_Storage.save('tariffe_tariffario', _tariffario);
    closeModalTariff();
    _renderTariffRows(_tariffario);
    var c = document.getElementById('tar-tariff-count'); if (c) c.textContent = _tariffario.length + ' tariffe';
  }

  function closeModalTariff() {
    var ov = document.getElementById('modal-tar-tariff');
    if (ov) ov.classList.remove('open');
    _editTariff = null;
    _righeCount = 0;
  }

  /* ================================================================
     UTILITY COMUNE
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
    init: init,
    /* Tipo Tariffa */
    filterTipo:       filterTipo,
    nuovoTipoTariffa: nuovoTipoTariffa,
    openEditTipo:     openEditTipo,
    salvaTipo:        salvaTipo,
    eliminaTipo:      eliminaTipo,
    closeModalTipo:   closeModalTipo,
    /* Trattamento */
    filterTratt:      filterTratt,
    nuovoTrattamento: nuovoTrattamento,
    openEditTratt:    openEditTratt,
    salvaTratt:       salvaTratt,
    eliminaTratt:     eliminaTratt,
    closeModalTratt:  closeModalTratt,
    /* Unità di Misura */
    filterUnita:      filterUnita,
    nuovaUnitaMisura: nuovaUnitaMisura,
    openEditUnita:    openEditUnita,
    salvaUnita:       salvaUnita,
    eliminaUnita:     eliminaUnita,
    closeModalUnita:  closeModalUnita,
    /* Tariffario */
    filterTariff:     filterTariff,
    nuovaTariffa:     nuovaTariffa,
    openEditTariff:   openEditTariff,
    addRiga:          addRiga,
    removeRiga:       removeRiga,
    salvaTariff:      salvaTariff,
    eliminaTariff:    eliminaTariff,
    closeModalTariff: closeModalTariff
  };

})();
