/* ================================================================
   TONIO — Msk_Contabilita.js
   Modulo Contabilità / Tariffe — Tre maschere:
     1. Acconti Anagrafica      (modale da Tariffe)
     2. Modalità di Pagamento   (pagina dedicata, tabella orizzontale)
     3. Politiche di Cancellazione (pagina dedicata)
   v2.0
   ================================================================ */

var MSK_Contabilita = (function () {

  /* ================================================================
     DATI IN MEMORIA
  ================================================================ */
  var _acconti     = [];
  var _modalitaPag = [];
  var _politiche   = [];

  /* ================================================================
     INIT
  ================================================================ */
  function init() {
    var savedAcc = TONIO_Storage.load('tariffe_acconti');
    var savedMod = TONIO_Storage.load('tariffe_modalita_pagamento');
    var savedPol = TONIO_Storage.load('tariffe_politiche_cancellazione');

    _acconti = savedAcc ? savedAcc : JSON.parse(JSON.stringify(
      (typeof TONIO_TARIFFE_ACCONTI !== 'undefined') ? TONIO_TARIFFE_ACCONTI : []
    ));
    _modalitaPag = savedMod ? savedMod : [];
    _politiche = savedPol ? savedPol : JSON.parse(JSON.stringify(
      (typeof TONIO_TARIFFE_POLITICHE_CANCELLAZIONE !== 'undefined') ? TONIO_TARIFFE_POLITICHE_CANCELLAZIONE : []
    ));

    _renderPageModalitaPag();
    _renderPagePolitiche();
  }

  /* ================================================================
     HELPER
  ================================================================ */
  function _getAcconti() {
    return _acconti.slice().sort(function(a,b){ return (a.ordine||0)-(b.ordine||0); });
  }

  function _showToast(msg) {
    var t = document.getElementById('tonio-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'tonio-toast';
      t.style.cssText = 'position:fixed;bottom:30px;right:30px;background:#1e293b;color:#fff;padding:12px 20px;border-radius:8px;z-index:9999;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,.25);transition:opacity .3s';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(t._timer);
    t._timer = setTimeout(function(){ t.style.opacity = '0'; }, 2500);
  }

  /* ================================================================
     1. ACCONTI ANAGRAFICA — modale
  ================================================================ */
  function openModalAcconti() {
    var ov = document.getElementById('modal-cont-acconti');
    if (!ov) {
      ov = document.createElement('div');
      ov.className = 'modal-overlay';
      ov.id = 'modal-cont-acconti';
      document.body.appendChild(ov);
    }
    ov.innerHTML = _buildModalAcconti();
    ov.classList.add('open');
  }

  function _buildModalAcconti() {
    var rows = '';
    _getAcconti().forEach(function(a) {
      rows +=
        '<tr id="acc-row-' + a.id + '">' +
          '<td><span class="id-badge">' + a.id + '</span></td>' +
          '<td><input class="form-input" type="number" id="acc-ord-' + a.id + '" value="' + a.ordine + '" min="1" style="width:70px"></td>' +
          '<td><input class="form-input" type="text" id="acc-nome-' + a.id + '" value="' + TONIO_escapeHtml(a.nome) + '" placeholder="Es. 1° Acconto"></td>' +
          '<td>' +
            '<button class="btn-icon btn-danger" title="Elimina" onclick="MSK_Contabilita._eliminaAcconto(' + a.id + ')">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/></svg>' +
            '</button>' +
          '</td>' +
        '</tr>';
    });

    return (
      '<div class="modal modal-md">' +
        '<div class="modal-header">' +
          '<span style="font-size:19px">💰</span>' +
          '<div class="modal-title">Acconti — Anagrafica</div>' +
          '<button class="modal-close" onclick="MSK_Contabilita.closeModalAcconti()">×</button>' +
        '</div>' +
        '<div class="modal-body">' +
          '<table class="lookup-table">' +
            '<thead><tr><th style="width:60px">ID</th><th style="width:90px">Ordine</th><th>Acconto</th><th style="width:50px"></th></tr></thead>' +
            '<tbody id="acc-tbody">' + rows + '</tbody>' +
          '</table>' +
          '<button class="btn btn-ghost" style="width:100%;margin-top:12px" onclick="MSK_Contabilita._addAcconto()">+ Aggiungi</button>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn btn-primary" onclick="MSK_Contabilita._salvaAcconti()">' +
            '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>' +
            'Salva' +
          '</button>' +
          '<button class="btn btn-ghost" onclick="MSK_Contabilita.closeModalAcconti()">Chiudi</button>' +
        '</div>' +
      '</div>'
    );
  }

  function _addAcconto() {
    var newId = _acconti.length > 0 ? Math.max.apply(null, _acconti.map(function(a){ return a.id; })) + 1 : 1;
    _acconti.push({ id: newId, ordine: newId, nome: '' });
    var tbody = document.getElementById('acc-tbody');
    if (!tbody) return;
    var tr = document.createElement('tr');
    tr.id = 'acc-row-' + newId;
    tr.innerHTML =
      '<td><span class="id-badge">' + newId + '</span></td>' +
      '<td><input class="form-input" type="number" id="acc-ord-' + newId + '" value="' + newId + '" min="1" style="width:70px"></td>' +
      '<td><input class="form-input" type="text" id="acc-nome-' + newId + '" value="" placeholder="Es. 1° Acconto"></td>' +
      '<td><button class="btn-icon btn-danger" onclick="MSK_Contabilita._eliminaAcconto(' + newId + ')">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/></svg>' +
      '</button></td>';
    tbody.appendChild(tr);
    document.getElementById('acc-nome-' + newId).focus();
  }

  function _eliminaAcconto(id) {
    if (!confirm('Eliminare questo acconto?')) return;
    _acconti = _acconti.filter(function(a){ return a.id !== id; });
    var row = document.getElementById('acc-row-' + id);
    if (row) row.remove();
  }

  function _salvaAcconti() {
    _acconti.forEach(function(a) {
      var nomeEl = document.getElementById('acc-nome-' + a.id);
      var ordEl  = document.getElementById('acc-ord-'  + a.id);
      if (nomeEl) a.nome   = nomeEl.value.trim();
      if (ordEl)  a.ordine = parseInt(ordEl.value, 10) || a.ordine;
    });
    _acconti.sort(function(a,b){ return a.ordine - b.ordine; });
    TONIO_Storage.save('tariffe_acconti', _acconti);
    closeModalAcconti();
    _showToast('Acconti salvati');
  }

  function closeModalAcconti() {
    var ov = document.getElementById('modal-cont-acconti');
    if (ov) ov.classList.remove('open');
  }

  /* ================================================================
     2. MODALITA DI PAGAMENTO — pagina dedicata
        Ogni scheda = una modalita (es. "Standard", "Early Bird")
        con righe orizzontali per ogni acconto.
  ================================================================ */
  function _renderPageModalitaPag() {
    var container = document.getElementById('page-modalita_pagamento');
    if (!container) return;

    var html =
      '<div class="list-page">' +
        '<div class="list-header">' +
          '<div class="list-title-area">' +
            '<h1 class="list-title">💳 Modalità di Pagamento</h1>' +
            '<span class="list-count" id="mp-count">' + _modalitaPag.length + ' record</span>' +
          '</div>' +
          '<div class="list-search-area" style="display:flex;gap:8px;align-items:center">' +
            '<input class="search-input" id="mp-search" type="text" placeholder="Cerca..." oninput="MSK_Contabilita.filterModalitaPag()">' +
            '<button class="btn btn-ghost btn-sm" onclick="MSK_Contabilita.openModalAcconti()" title="Gestisci Acconti Anagrafica" style="white-space:nowrap">💰 Acconti</button>' +
          '</div>' +
        '</div>';

    if (_modalitaPag.length === 0) {
      html += '<div style="text-align:center;padding:60px 20px;color:#94a3b8">' +
                '<div style="font-size:48px;margin-bottom:16px">💳</div>' +
                '<p>Nessuna modalità di pagamento.<br>Clicca <strong>+ Nuova Modalità</strong> per creare la prima.</p>' +
              '</div>';
    } else {
      html += '<div id="mp-cards-container">';
      _modalitaPag.forEach(function(rec) {
        html += _buildModalitaCard(rec, false);
      });
      html += '</div>';
    }

    html += '</div>';
    container.innerHTML = html;
  }

  function _buildModalitaCard(rec, editMode) {
    var accList = _getAcconti();
    var mpGlobali = (typeof TONIO_MODALITA_PAGAMENTO !== 'undefined') ? TONIO_MODALITA_PAGAMENTO : [];
    var righe = rec.righe && rec.righe.length > 0 ? rec.righe :
      accList.map(function(a){ return { id_acconto: a.id, perc_importo: '', importo: '', entro_il: '', modalita: '' }; });

    var righeHtml = '';
    righe.forEach(function(r, i) {
      var acc = accList.find(function(a){ return String(a.id) === String(r.id_acconto); });
      var accNome = acc ? acc.nome : 'Acconto';

      var mpOpts = '<option value="">— Seleziona —</option>';
      mpGlobali.forEach(function(m) {
        mpOpts += '<option value="' + TONIO_escapeHtml(m.nome) + '"' + (m.nome === r.modalita ? ' selected' : '') + '>' + TONIO_escapeHtml(m.nome) + '</option>';
      });

      righeHtml +=
        '<tr>' +
          '<td style="font-weight:600;white-space:nowrap;padding:10px 14px">' + TONIO_escapeHtml(accNome) + '</td>' +
          '<td style="padding:6px 14px">' +
            (editMode
              ? '<input class="form-input" type="number" id="mp-perc-' + rec.id + '-' + i + '" value="' + (r.perc_importo||'') + '" min="0" max="100" step="0.01" placeholder="%" style="width:80px">'
              : (r.perc_importo ? r.perc_importo + ' %' : '<span style="color:#94a3b8">—</span>')
            ) +
          '</td>' +
          '<td style="padding:6px 14px">' +
            (editMode
              ? '<input class="form-input" type="number" id="mp-imp-' + rec.id + '-' + i + '" value="' + (r.importo||'') + '" min="0" step="0.01" placeholder="€" style="width:100px">'
              : (r.importo ? '€ ' + parseFloat(r.importo).toFixed(2) : '<span style="color:#94a3b8">—</span>')
            ) +
          '</td>' +
          '<td style="padding:6px 14px">' +
            (editMode
              ? '<input class="form-input" type="date" id="mp-data-' + rec.id + '-' + i + '" value="' + (r.entro_il||'') + '">'
              : (r.entro_il || '<span style="color:#94a3b8">—</span>')
            ) +
          '</td>' +
          '<td style="padding:6px 14px">' +
            (editMode
              ? '<select class="form-input" id="mp-mod-' + rec.id + '-' + i + '">' + mpOpts + '</select>'
              : (r.modalita || '<span style="color:#94a3b8">—</span>')
            ) +
          '</td>' +
        '</tr>';
    });

    return (
      '<div id="mp-card-' + rec.id + '" style="margin-bottom:20px;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden">' +
        '<div style="background:#f8fafc;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e2e8f0">' +
          '<div style="display:flex;align-items:center;gap:12px">' +
            (editMode
              ? '<input class="form-input" type="text" id="mp-nome-' + rec.id + '" value="' + TONIO_escapeHtml(rec.nome) + '" placeholder="Nome modalità..." style="font-weight:700;font-size:15px;max-width:280px">'
              : '<strong style="font-size:15px">' + TONIO_escapeHtml(rec.nome||'(senza nome)') + '</strong>'
            ) +
            '<span style="font-size:12px;color:#94a3b8">' + righe.length + ' rate</span>' +
          '</div>' +
          '<div style="display:flex;gap:8px;align-items:center">' +
            (editMode
              ? '<button class="btn btn-primary btn-sm" onclick="MSK_Contabilita._salvaModalitaPag(' + rec.id + ',' + righe.length + ')">💾 Salva</button>' +
                '<button class="btn btn-ghost btn-sm" onclick="MSK_Contabilita._renderPageModalitaPag()">Annulla</button>'
              : '<button class="btn btn-ghost btn-sm" onclick="MSK_Contabilita._editModalitaCard(' + rec.id + ')">✏️ Modifica</button>' +
                '<button class="btn-icon btn-danger" title="Elimina" onclick="MSK_Contabilita._eliminaModalitaPag(' + rec.id + ')">' +
                  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/></svg>' +
                '</button>'
            ) +
          '</div>' +
        '</div>' +
        '<div style="overflow-x:auto">' +
          '<table class="data-table" style="min-width:620px">' +
            '<thead>' +
              '<tr>' +
                '<th style="min-width:120px">Acconti</th>' +
                '<th style="min-width:110px">% dell\'importo</th>' +
                '<th style="min-width:110px">Importo</th>' +
                '<th style="min-width:130px">Entro il</th>' +
                '<th style="min-width:180px">Modalità di Pagamento</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' + righeHtml + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>'
    );
  }

  function _editModalitaCard(id) {
    var rec = _modalitaPag.find(function(r){ return r.id === id; });
    if (!rec) return;
    var accList = _getAcconti();
    /* Sincronizza righe con acconti correnti */
    if (!rec.righe) rec.righe = [];
    accList.forEach(function(a) {
      var exists = rec.righe.find(function(r){ return String(r.id_acconto) === String(a.id); });
      if (!exists) rec.righe.push({ id_acconto: a.id, perc_importo: '', importo: '', entro_il: '', modalita: '' });
    });
    var cardEl = document.getElementById('mp-card-' + id);
    if (cardEl) cardEl.outerHTML = _buildModalitaCard(rec, true);
  }

  function _salvaModalitaPag(id, nrighe) {
    var rec = _modalitaPag.find(function(r){ return r.id === id; });
    if (!rec) return;
    var nomeEl = document.getElementById('mp-nome-' + id);
    if (nomeEl) rec.nome = nomeEl.value.trim();
    var accList = _getAcconti();
    rec.righe = [];
    for (var i = 0; i < nrighe; i++) {
      var acc = accList[i];
      if (!acc) continue;
      rec.righe.push({
        id_acconto:   acc.id,
        perc_importo: (document.getElementById('mp-perc-' + id + '-' + i) || {}).value || '',
        importo:      (document.getElementById('mp-imp-'  + id + '-' + i) || {}).value || '',
        entro_il:     (document.getElementById('mp-data-' + id + '-' + i) || {}).value || '',
        modalita:     (document.getElementById('mp-mod-'  + id + '-' + i) || {}).value || ''
      });
    }
    TONIO_Storage.save('tariffe_modalita_pagamento', _modalitaPag);
    _renderPageModalitaPag();
    _showToast('Modalità di pagamento salvata');
  }

  function nuovaModalitaPagamento() {
    var newId = _modalitaPag.length > 0 ? Math.max.apply(null, _modalitaPag.map(function(r){ return r.id; })) + 1 : 1;
    var accList = _getAcconti();
    _modalitaPag.push({
      id: newId, ordine: newId, nome: '',
      righe: accList.map(function(a){ return { id_acconto: a.id, perc_importo: '', importo: '', entro_il: '', modalita: '' }; })
    });
    TONIO_Storage.save('tariffe_modalita_pagamento', _modalitaPag);
    _renderPageModalitaPag();
    setTimeout(function(){ _editModalitaCard(newId); }, 50);
  }

  function _eliminaModalitaPag(id) {
    var rec = _modalitaPag.find(function(r){ return r.id === id; });
    if (!rec) return;
    if (!confirm('Eliminare "' + (rec.nome||'questa modalità') + '"?\n\nL\'operazione non può essere annullata.')) return;
    _modalitaPag = _modalitaPag.filter(function(r){ return r.id !== id; });
    TONIO_Storage.save('tariffe_modalita_pagamento', _modalitaPag);
    _renderPageModalitaPag();
    _showToast('Modalità eliminata');
  }

  function filterModalitaPag() {
    var q = (document.getElementById('mp-search') || {}).value || '';
    q = q.toLowerCase();
    document.querySelectorAll('[id^="mp-card-"]').forEach(function(c) {
      c.style.display = c.textContent.toLowerCase().indexOf(q) !== -1 ? '' : 'none';
    });
  }

  /* ================================================================
     3. POLITICHE DI CANCELLAZIONE — pagina dedicata
  ================================================================ */
  function _renderPagePolitiche() {
    var container = document.getElementById('page-politiche_cancellazione');
    if (!container) return;

    container.innerHTML =
      '<div class="list-page">' +
        '<div class="list-header">' +
          '<div class="list-title-area">' +
            '<h1 class="list-title">📋 Politiche di Cancellazione</h1>' +
            '<span class="list-count" id="pol-count">' + _politiche.length + ' record</span>' +
          '</div>' +
          '<div class="list-search-area">' +
            '<input class="search-input" id="pol-search" type="text" placeholder="Cerca politica..." oninput="MSK_Contabilita.filterPolitiche()">' +
          '</div>' +
        '</div>' +
        '<div class="table-wrap">' +
          '<table class="data-table">' +
            '<thead>' +
              '<tr>' +
                '<th style="width:70px">ID</th>' +
                '<th style="width:100px">Ordine</th>' +
                '<th style="min-width:200px">Politica di Cancellazione</th>' +
                '<th>Descrizione</th>' +
                '<th style="width:80px"></th>' +
              '</tr>' +
            '</thead>' +
            '<tbody id="pol-tbody"></tbody>' +
          '</table>' +
        '</div>' +
      '</div>';

    _renderRowsPolitiche(_politiche);
  }

  function _renderRowsPolitiche(list) {
    var tbody = document.getElementById('pol-tbody');
    var count = document.getElementById('pol-count');
    if (!tbody) return;
    if (count) count.textContent = list.length + ' record';
    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:32px;color:#94a3b8">Nessuna politica trovata</td></tr>';
      return;
    }
    var html = '';
    list.forEach(function(p) {
      html +=
        '<tr class="data-row" onclick="MSK_Contabilita.openEditPolitica(' + p.id + ')">' +
          '<td><span class="id-badge">' + p.id + '</span></td>' +
          '<td><span class="ordine-val">' + p.ordine + '</span></td>' +
          '<td><strong>' + TONIO_escapeHtml(p.nome) + '</strong></td>' +
          '<td style="color:#64748b;font-size:13px;max-width:400px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + TONIO_escapeHtml(p.descrizione) + '</td>' +
          '<td onclick="event.stopPropagation()">' +
            '<button class="btn-icon btn-danger" title="Elimina" onclick="MSK_Contabilita.eliminaPolitica(' + p.id + ')">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/><path d="M9,6V4h6v2"/></svg>' +
            '</button>' +
          '</td>' +
        '</tr>';
    });
    tbody.innerHTML = html;
  }

  function filterPolitiche() {
    var q = ((document.getElementById('pol-search') || {}).value || '').toLowerCase();
    var filtered = _politiche.filter(function(p){
      return (p.nome + ' ' + p.descrizione).toLowerCase().indexOf(q) !== -1;
    });
    _renderRowsPolitiche(filtered);
  }

  function nuovaPolitica() { _openModalPolitica(null); }

  function openEditPolitica(id) {
    var p = _politiche.find(function(x){ return x.id === id; });
    if (p) _openModalPolitica(p);
  }

  function _openModalPolitica(p) {
    var isNew = !p;
    var ov = document.getElementById('modal-cont-politica');
    if (!ov) {
      ov = document.createElement('div');
      ov.className = 'modal-overlay';
      ov.id = 'modal-cont-politica';
      document.body.appendChild(ov);
    }
    var id     = p ? p.id      : '';
    var ordine = p ? p.ordine  : (_politiche.length + 1);
    var nome   = p ? p.nome    : '';
    var descr  = p ? p.descrizione : '';

    ov.innerHTML =
      '<div class="modal" style="max-width:600px">' +
        '<div class="modal-header">' +
          '<span style="font-size:19px">📋</span>' +
          '<div class="modal-title">' + (isNew ? 'Nuova Politica di Cancellazione' : 'Modifica Politica di Cancellazione') + '</div>' +
          '<button class="modal-close" onclick="MSK_Contabilita.closeModalPolitica()">×</button>' +
        '</div>' +
        '<div class="modal-body">' +
          (!isNew ?
            '<div class="form-row"><div class="form-group"><label class="form-label">ID</label>' +
            '<input class="form-input" type="text" value="' + id + '" readonly style="background:#f8fafc;color:#94a3b8;cursor:default;max-width:100px">' +
            '</div></div>' : '') +
          '<div class="form-row"><div class="form-group"><label class="form-label">Ordinamento Manuale</label>' +
            '<input class="form-input" type="number" id="pol-ordine" value="' + ordine + '" min="1" style="max-width:120px">' +
          '</div></div>' +
          '<div class="form-row"><div class="form-group"><label class="form-label">Politica di Cancellazione <span class="req">*</span></label>' +
            '<input class="form-input" type="text" id="pol-nome" value="' + TONIO_escapeHtml(nome) + '" placeholder="Es. Non Rimborsabile">' +
          '</div></div>' +
          '<div class="form-row"><div class="form-group"><label class="form-label">Descrizione</label>' +
            '<textarea class="form-input" id="pol-descr" rows="5" placeholder="Descrivi le condizioni..." style="resize:vertical">' + TONIO_escapeHtml(descr) + '</textarea>' +
          '</div></div>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn btn-primary" onclick="MSK_Contabilita.salvaPolitica(' + (isNew ? 'null' : id) + ')">' +
            '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>Salva' +
          '</button>' +
          (!isNew ?
            '<button class="btn btn-danger" onclick="MSK_Contabilita.eliminaPolitica(' + id + ')">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/></svg>Elimina' +
            '</button>' : '') +
          '<button class="btn btn-ghost" onclick="MSK_Contabilita.closeModalPolitica()">Annulla</button>' +
        '</div>' +
      '</div>';

    ov.classList.add('open');
  }

  function salvaPolitica(id) {
    var nome  = ((document.getElementById('pol-nome')   || {}).value || '').trim();
    var descr = ((document.getElementById('pol-descr')  || {}).value || '').trim();
    var ord   = parseInt(((document.getElementById('pol-ordine') || {}).value || '1'), 10) || 1;
    if (!nome) {
      alert('Inserire il nome della Politica di Cancellazione.');
      if (document.getElementById('pol-nome')) document.getElementById('pol-nome').focus();
      return;
    }
    if (id === null || id === 'null') {
      var newId = _politiche.length > 0 ? Math.max.apply(null, _politiche.map(function(p){ return p.id; })) + 1 : 1;
      _politiche.push({ id: newId, ordine: ord, nome: nome, descrizione: descr });
    } else {
      var rec = _politiche.find(function(p){ return p.id === id; });
      if (rec) { rec.nome = nome; rec.descrizione = descr; rec.ordine = ord; }
    }
    _politiche.sort(function(a,b){ return a.ordine - b.ordine; });
    TONIO_Storage.save('tariffe_politiche_cancellazione', _politiche);
    closeModalPolitica();
    _renderRowsPolitiche(_politiche);
    var cnt = document.getElementById('pol-count');
    if (cnt) cnt.textContent = _politiche.length + ' record';
    _showToast('Politica salvata');
  }

  function eliminaPolitica(id) {
    var rec = _politiche.find(function(p){ return p.id === id; });
    if (!rec) return;
    if (!confirm('Eliminare la politica "' + rec.nome + '"?\n\nL\'operazione non può essere annullata.')) return;
    _politiche = _politiche.filter(function(p){ return p.id !== id; });
    TONIO_Storage.save('tariffe_politiche_cancellazione', _politiche);
    closeModalPolitica();
    _renderRowsPolitiche(_politiche);
    var cnt = document.getElementById('pol-count');
    if (cnt) cnt.textContent = _politiche.length + ' record';
    _showToast('Politica eliminata');
  }

  function closeModalPolitica() {
    var ov = document.getElementById('modal-cont-politica');
    if (ov) ov.classList.remove('open');
  }

  /* ================================================================
     API PUBBLICA
  ================================================================ */
  return {
    init:                   init,
    /* Acconti */
    openModalAcconti:       openModalAcconti,
    closeModalAcconti:      closeModalAcconti,
    _addAcconto:            _addAcconto,
    _eliminaAcconto:        _eliminaAcconto,
    _salvaAcconti:          _salvaAcconti,
    /* Modalità Pagamento */
    nuovaModalitaPagamento: nuovaModalitaPagamento,
    filterModalitaPag:      filterModalitaPag,
    _editModalitaCard:      _editModalitaCard,
    _salvaModalitaPag:      _salvaModalitaPag,
    _eliminaModalitaPag:    _eliminaModalitaPag,
    _renderPageModalitaPag: _renderPageModalitaPag,
    /* Politiche */
    nuovaPolitica:          nuovaPolitica,
    openEditPolitica:       openEditPolitica,
    salvaPolitica:          salvaPolitica,
    eliminaPolitica:        eliminaPolitica,
    filterPolitiche:        filterPolitiche,
    closeModalPolitica:     closeModalPolitica
  };

})();
