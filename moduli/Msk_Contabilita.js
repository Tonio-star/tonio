/* ================================================================
   TONIO — Msk_Contabilita.js
   Modulo Contabilità — Maschera Modalità di Pagamento
   ================================================================ */

var MSK_Contabilita = (function() {

  /* ---- Dati in memoria ---- */
  var _modalita = [];
  var _editId   = null;   /* id in modifica, null = nuova voce */

  /* ================================================================
     INIT
  ================================================================ */
  function init() {
    /* Carica da localStorage oppure usa i dati di default */
    var saved = TONIO_Storage.load('modalita_pagamento');
    _modalita = saved ? saved : JSON.parse(JSON.stringify(TONIO_MODALITA_PAGAMENTO));
    _renderPage();
  }

  /* ================================================================
     RENDER PAGINA LISTA
  ================================================================ */
  function _renderPage() {
    var container = document.getElementById('page-modalita_pagamento');
    if (!container) return;

    container.innerHTML =
      '<div class="list-page">' +
        '<div class="list-header">' +
          '<div class="list-title-area">' +
            '<h1 class="list-title">💳 Modalità di Pagamento</h1>' +
            '<span class="list-count" id="cont-mp-count"></span>' +
          '</div>' +
          '<div class="list-search-area">' +
            '<input class="search-input" id="cont-mp-search" type="text" placeholder="🔍 Cerca modalità..." oninput="MSK_Contabilita.filterList()">' +
          '</div>' +
        '</div>' +
        '<div class="table-wrap">' +
          '<table class="data-table" id="cont-mp-table">' +
            '<thead>' +
              '<tr>' +
                '<th style="width:70px">ID</th>' +
                '<th style="width:110px">Ordine</th>' +
                '<th>Modalità di Pagamento</th>' +
                '<th style="width:110px">Attivo</th>' +
                '<th style="width:80px"></th>' +
              '</tr>' +
            '</thead>' +
            '<tbody id="cont-mp-tbody"></tbody>' +
          '</table>' +
        '</div>' +
      '</div>';

    _renderRows(_modalita);
  }

  /* ================================================================
     RENDER RIGHE
  ================================================================ */
  function _renderRows(list) {
    var tbody = document.getElementById('cont-mp-tbody');
    var count = document.getElementById('cont-mp-count');
    if (!tbody) return;

    if (count) count.textContent = list.length + ' record';

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:32px;color:#94a3b8">Nessuna modalità trovata</td></tr>';
      return;
    }

    var html = '';
    list.forEach(function(m) {
      var attivoHtml = m.attivo
        ? '<span class="badge" style="background:#dcfce7;color:#16a34a;border:1px solid #bbf7d0">✓ Attivo</span>'
        : '<span class="badge" style="background:#f1f5f9;color:#94a3b8;border:1px solid #e2e8f0">✗ Disattivo</span>';

      html +=
        '<tr class="data-row" onclick="MSK_Contabilita.openEdit(' + m.id + ')">' +
          '<td><span class="id-badge">' + m.id + '</span></td>' +
          '<td><span class="ordine-val">' + m.ordine + '</span></td>' +
          '<td><strong>' + TONIO_escapeHtml(m.nome) + '</strong></td>' +
          '<td>' + attivoHtml + '</td>' +
          '<td onclick="event.stopPropagation()">' +
            '<button class="btn-icon btn-danger" title="Elimina" onclick="MSK_Contabilita.elimina(' + m.id + ')">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/><path d="M9,6V4h6v2"/></svg>' +
            '</button>' +
          '</td>' +
        '</tr>';
    });
    tbody.innerHTML = html;
  }

  /* ================================================================
     LIVE SEARCH
  ================================================================ */
  function filterList() {
    var q = (document.getElementById('cont-mp-search').value || '').toLowerCase();
    var filtered = _modalita.filter(function(m) {
      return m.nome.toLowerCase().indexOf(q) !== -1;
    });
    _renderRows(filtered);
  }

  /* ================================================================
     NUOVA MODALITÀ — apre la maschera vuota
  ================================================================ */
  function nuovaModalita() {
    _editId = null;
    _openModal(null);
  }

  /* ================================================================
     APRI MODIFICA
  ================================================================ */
  function openEdit(id) {
    var m = _modalita.find(function(x) { return x.id === id; });
    if (!m) return;
    _editId = id;
    _openModal(m);
  }

  /* ================================================================
     COSTRUISCI E APRI MODAL
  ================================================================ */
  function _openModal(m) {
    var isNew   = !m;
    var nome    = m ? m.nome    : '';
    var ordine  = m ? m.ordine  : (_modalita.length + 1);
    var attivo  = m ? m.attivo  : true;
    var id      = m ? m.id      : '';

    /* Crea overlay modal dinamico */
    var overlay = document.getElementById('modal-cont-mp');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.id = 'modal-cont-mp';
      document.body.appendChild(overlay);
    }

    overlay.innerHTML =
      '<div class="modal modal-md">' +
        '<div class="modal-header">' +
          '<span style="font-size:19px">💳</span>' +
          '<div class="modal-title">' + (isNew ? 'Nuova Modalità di Pagamento' : 'Modifica Modalità di Pagamento') + '</div>' +
          '<button class="modal-close" onclick="MSK_Contabilita.closeModal()">×</button>' +
        '</div>' +
        '<div class="modal-body">' +

          /* Riga ID (solo in modifica) */
          (!isNew ?
          '<div class="form-row">' +
            '<div class="form-group">' +
              '<label class="form-label">ID</label>' +
              '<input class="form-input" type="text" value="' + id + '" readonly style="background:#f8fafc;color:#94a3b8;cursor:default">' +
            '</div>' +
          '</div>' : '') +

          /* Ordinamento */
          '<div class="form-row">' +
            '<div class="form-group">' +
              '<label class="form-label">Ordinamento Manuale</label>' +
              '<input class="form-input" type="number" id="mp-ordine" value="' + ordine + '" min="1">' +
            '</div>' +
          '</div>' +

          /* Modalità di Pagamento */
          '<div class="form-row">' +
            '<div class="form-group">' +
              '<label class="form-label">Modalità di Pagamento <span class="req">*</span></label>' +
              '<input class="form-input" type="text" id="mp-nome" value="' + TONIO_escapeHtml(nome) + '" placeholder="Es. Bonifico Bancario">' +
            '</div>' +
          '</div>' +

          /* Attivo / Disattivo */
          '<div class="form-row">' +
            '<div class="form-group">' +
              '<label class="form-label">Stato</label>' +
              '<div class="toggle-wrap">' +
                '<label class="toggle-label">' +
                  '<input type="checkbox" id="mp-attivo" ' + (attivo ? 'checked' : '') + '>' +
                  '<span class="toggle-slider"></span>' +
                  '<span class="toggle-text" id="mp-attivo-lbl">' + (attivo ? 'Attivo' : 'Disattivo') + '</span>' +
                '</label>' +
              '</div>' +
            '</div>' +
          '</div>' +

        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn btn-primary" onclick="MSK_Contabilita.salva()">' +
            '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>' +
            'Salva' +
          '</button>' +
          (!isNew ?
          '<button class="btn btn-warning" onclick="MSK_Contabilita.toggleAttivo(' + id + ')">' +
            (attivo ? '⛔ Disattiva' : '✅ Attiva') +
          '</button>' : '') +
          (!isNew ?
          '<button class="btn btn-danger" onclick="MSK_Contabilita.elimina(' + id + ')">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/></svg>' +
            'Elimina' +
          '</button>' : '') +
          '<button class="btn btn-ghost" onclick="MSK_Contabilita.closeModal()">Annulla</button>' +
        '</div>' +
      '</div>';

    overlay.classList.add('open');

    /* Toggle label aggiornamento live */
    var chk = document.getElementById('mp-attivo');
    if (chk) {
      chk.addEventListener('change', function() {
        var lbl = document.getElementById('mp-attivo-lbl');
        if (lbl) lbl.textContent = chk.checked ? 'Attivo' : 'Disattivo';
      });
    }
  }

  /* ================================================================
     SALVA
  ================================================================ */
  function salva() {
    var nome   = (document.getElementById('mp-nome').value || '').trim();
    var ordine = parseInt(document.getElementById('mp-ordine').value, 10) || 1;
    var attivo = document.getElementById('mp-attivo').checked;

    if (!nome) {
      alert('⚠️ Inserire la Modalità di Pagamento.');
      document.getElementById('mp-nome').focus();
      return;
    }

    if (_editId === null) {
      /* Nuovo record */
      var newId = _modalita.length > 0 ? Math.max.apply(null, _modalita.map(function(m) { return m.id; })) + 1 : 1;
      _modalita.push({ id: newId, ordine: ordine, nome: nome, attivo: attivo });
    } else {
      /* Modifica record esistente */
      var rec = _modalita.find(function(m) { return m.id === _editId; });
      if (rec) {
        rec.nome   = nome;
        rec.ordine = ordine;
        rec.attivo = attivo;
      }
    }

    /* Riordina per campo ordine */
    _modalita.sort(function(a, b) { return a.ordine - b.ordine; });

    TONIO_Storage.save('modalita_pagamento', _modalita);
    closeModal();
    _renderRows(_modalita);

    /* Aggiorna contatore */
    var count = document.getElementById('cont-mp-count');
    if (count) count.textContent = _modalita.length + ' record';
  }

  /* ================================================================
     TOGGLE ATTIVO / DISATTIVO
  ================================================================ */
  function toggleAttivo(id) {
    var rec = _modalita.find(function(m) { return m.id === id; });
    if (!rec) return;
    rec.attivo = !rec.attivo;
    TONIO_Storage.save('modalita_pagamento', _modalita);
    closeModal();
    _renderRows(_modalita);
  }

  /* ================================================================
     ELIMINA
  ================================================================ */
  function elimina(id) {
    var rec = _modalita.find(function(m) { return m.id === id; });
    if (!rec) return;
    if (!confirm('Eliminare la modalità "' + rec.nome + '"?\n\nL\'operazione non può essere annullata.')) return;
    _modalita = _modalita.filter(function(m) { return m.id !== id; });
    TONIO_Storage.save('modalita_pagamento', _modalita);
    closeModal();
    _renderRows(_modalita);
    var count = document.getElementById('cont-mp-count');
    if (count) count.textContent = _modalita.length + ' record';
  }

  /* ================================================================
     CHIUDI MODAL
  ================================================================ */
  function closeModal() {
    var overlay = document.getElementById('modal-cont-mp');
    if (overlay) overlay.classList.remove('open');
    _editId = null;
  }

  /* ================================================================
     API PUBBLICA
  ================================================================ */
  return {
    init:          init,
    filterList:    filterList,
    nuovaModalita: nuovaModalita,
    openEdit:      openEdit,
    salva:         salva,
    toggleAttivo:  toggleAttivo,
    elimina:       elimina,
    closeModal:    closeModal
  };

})();
