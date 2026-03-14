/* ================================================================
   TONIO — Msk_Prenotazioni.js
   Modulo Operativo — Maschera Prenotazioni
   v2.0 — Maschera completa in unica schermata secondo SAD
   Sezioni:
     1. GENERALE RICHIESTA
     2. SOGGIORNO RICHIESTO
     3. SOGGIORNO CONFERMATO + ASSEGNAZIONE
     4. LOCAZIONE / SERVIZI / EXTRA
     5. CAUZIONE
     6. OSPITE — Termini e Modalità di Pagamento
     7. CLIENTE — Termini e Modalità di Pagamento
   ================================================================ */

var MSK_Prenotazioni = (function () {

  /* ================================================================
     DATI IN MEMORIA
  ================================================================ */
  var _prenotazioni = [];
  var _editId       = null;
  var _filtriAperti = false;

  /* ================================================================
     INIT
  ================================================================ */
  function init() {
    var saved = TONIO_Storage.load('prenotazioni');
    _prenotazioni = saved ? saved : JSON.parse(JSON.stringify(TONIO_PRENOTAZIONI));
    _renderListPage();
  }

  /* ================================================================
     HELPER — lookup archivi
  ================================================================ */
  function _getSuperProdotti() { return (typeof TONIO_IMMOBILI_SUPERPRODOTTI !== 'undefined') ? TONIO_IMMOBILI_SUPERPRODOTTI : []; }
  function _getProdotti()       { return (typeof TONIO_IMMOBILI_PRODOTTI !== 'undefined')      ? TONIO_IMMOBILI_PRODOTTI      : []; }
  function _getTipiImmobile()   { return (typeof TONIO_IMMOBILI_TIPI !== 'undefined')          ? TONIO_IMMOBILI_TIPI          : []; }
  function _getPiani()          { return (typeof TONIO_IMMOBILI_PIANI !== 'undefined')         ? TONIO_IMMOBILI_PIANI         : []; }
  function _getImmobili()       { return (typeof TONIO_IMMOBILI !== 'undefined')               ? TONIO_IMMOBILI               : []; }
  function _getClienti()        { return (typeof TONIO_CLIENTI !== 'undefined')                ? TONIO_CLIENTI                : []; }
  function _getOspiti()         { return (typeof TONIO_OSPITI !== 'undefined')                 ? TONIO_OSPITI                 : []; }
  function _getModalitaPag()    { return (typeof TONIO_MODALITA_PAGAMENTO !== 'undefined')     ? TONIO_MODALITA_PAGAMENTO     : []; }

  function _optsById(arr, selectedId) {
    var h = '<option value="">— Seleziona —</option>';
    arr.forEach(function (item) {
      h += '<option value="' + item.id + '"' + (item.id === selectedId ? ' selected' : '') + '>' + TONIO_escapeHtml(item.nome) + '</option>';
    });
    return h;
  }
  function _optsAnag(arr, selectedId) {
    var h = '<option value="">— Seleziona —</option>';
    arr.forEach(function (item) {
      h += '<option value="' + item.id + '"' + (item.id === selectedId ? ' selected' : '') + '>' + TONIO_escapeHtml(item.nominativo) + '</option>';
    });
    return h;
  }
  function _nomeById(arr, id) {
    if (!id) return '—';
    var found = arr.find(function (x) { return x.id === id || x.id === parseInt(id, 10); });
    return found ? found.nome : '—';
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
  function _calcolaNotti(dal, al) {
    if (!dal || !al) return 0;
    var d1 = new Date(dal), d2 = new Date(al);
    if (isNaN(d1) || isNaN(d2)) return 0;
    return Math.max(0, Math.round((d2 - d1) / 86400000));
  }
  function _nuovoNumero() {
    var anno = new Date().getFullYear(), max = 0;
    _prenotazioni.forEach(function (p) {
      var m = (p.numero_prenotazione || '').match(/(\d+)$/);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    });
    return 'PRE-' + anno + '-' + String(max + 1).padStart(3, '0');
  }

  /* CSS condiviso per la maschera */
  var _CSS = [
    '.pre-section{border:1px solid #e2e8f0;border-radius:6px;margin-bottom:10px;overflow:hidden}',
    '.pre-section-head{background:#1e3a5f;color:#fff;font-size:10px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;padding:5px 10px;display:flex;align-items:center;gap:6px}',
    '.pre-section-body{padding:10px 12px;background:#fff}',
    '.pre-row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:6px}',
    '.pre-field{display:flex;flex-direction:column;gap:2px;min-width:80px}',
    '.pre-field label{font-size:10px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.4px;white-space:nowrap}',
    '.pre-field input,.pre-field select,.pre-field textarea{font-size:12px;border:1px solid #d1d5db;border-radius:4px;padding:4px 6px;background:#fff;color:#1e293b;height:30px}',
    '.pre-field textarea{height:auto;resize:vertical}',
    '.pre-field input[readonly]{background:#f1f5f9;color:#475569;cursor:default}',
    '.pre-field input.bold-blue{background:#dbeafe;color:#1d4ed8;font-weight:700;text-align:center}',
    '.pre-field input.status-confirmed{background:#dcfce7;color:#166534;font-weight:700;text-align:center}',
    '.pre-field input.status-cancelled{background:#fee2e2;color:#991b1b;font-weight:700;text-align:center}',
    '.pre-badge-conf{display:inline-block;background:#dcfce7;color:#166534;border:1px solid #86efac;border-radius:4px;font-size:10px;font-weight:700;padding:2px 7px;cursor:pointer;user-select:none}',
    '.pre-badge-ann{display:inline-block;background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;border-radius:4px;font-size:10px;font-weight:700;padding:2px 7px;cursor:pointer;user-select:none}',
    '.pre-badge-neu{display:inline-block;background:#f1f5f9;color:#475569;border:1px solid #cbd5e1;border-radius:4px;font-size:10px;font-weight:700;padding:2px 7px;cursor:pointer;user-select:none}',
    /* Tabella servizi */
    '.srv-table{width:100%;border-collapse:collapse;font-size:11px}',
    '.srv-table th{background:#f8fafc;font-size:9px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:#64748b;padding:4px 5px;border:1px solid #e2e8f0;white-space:nowrap;text-align:center}',
    '.srv-table td{padding:3px 4px;border:1px solid #e2e8f0;vertical-align:middle}',
    '.srv-table td input[type=text],.srv-table td input[type=number],.srv-table td input[type=date],.srv-table td select{width:100%;font-size:11px;border:1px solid #d1d5db;border-radius:3px;padding:2px 4px;height:26px}',
    '.srv-table td input[type=checkbox]{width:14px;height:14px;cursor:pointer}',
    '.srv-table .td-calc{background:#f0f9ff;color:#0369a1;font-weight:600;text-align:right}',
    /* Tabella pagamenti */
    '.pag-table{width:100%;border-collapse:collapse;font-size:11px}',
    '.pag-table th{background:#f8fafc;font-size:9px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:#64748b;padding:4px 5px;border:1px solid #e2e8f0;text-align:center;white-space:nowrap}',
    '.pag-table td{padding:3px 4px;border:1px solid #e2e8f0;vertical-align:middle}',
    '.pag-table td input[type=text],.pag-table td input[type=number],.pag-table td input[type=date],.pag-table td select{width:100%;font-size:11px;border:1px solid #d1d5db;border-radius:3px;padding:2px 4px;height:26px}',
    '.pag-table td input[type=checkbox]{width:14px;height:14px;cursor:pointer}',
    '.pag-table .td-tot{background:#fefce8;font-weight:700;font-size:12px}',
    '.pag-table .td-ft{background:#f0fdf4;color:#166534;text-align:right}',
    '.pag-table .td-nf{background:#fff7ed;color:#9a3412;text-align:right}',
    /* Cauzione */
    '.cau-box{display:grid;grid-template-columns:auto 1fr;gap:4px 10px;font-size:11px;align-items:center}',
    '.cau-box label{font-size:10px;font-weight:600;color:#64748b;text-transform:uppercase;white-space:nowrap}',
    '.cau-box input{font-size:11px;border:1px solid #d1d5db;border-radius:4px;padding:3px 6px;height:26px}',
    /* Azioni flottanti */
    '.pre-actions{display:flex;flex-wrap:wrap;gap:8px;padding:10px 0 4px}',
  ].join('');

  /* ================================================================
     RENDER PAGINA LISTA (entry point)
  ================================================================ */
  function _renderListPage() {
    var c = document.getElementById('page-prenotazioni');
    if (!c) return;

    var superProds   = _getSuperProdotti();
    var prods        = _getProdotti();
    var immobili     = _getImmobili();
    var vieArr       = immobili.map(function (imm) {
      return { id: imm.id, nome: imm.immobile + (imm.via ? ' (' + imm.via + ')' : '') };
    });

    c.innerHTML =
      '<style>' + _CSS + '</style>' +
      '<div class="list-page">' +

        /* ── HEADER ── */
        '<div class="list-header" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:0">' +
          '<div style="display:flex;align-items:center;gap:12px">' +
            '<h1 class="list-title" style="margin:0">📅 Prenotazioni</h1>' +
            '<span class="list-count" id="pre-count"></span>' +
          '</div>' +
          '<div style="display:flex;gap:8px;align-items:center">' +
            '<button class="btn btn-ghost" style="font-size:12px;padding:6px 12px" onclick="MSK_Prenotazioni.toggleFiltri()">🔍 Filtri</button>' +
          '</div>' +
        '</div>' +

        /* ── PANNELLO FILTRI ── */
        '<div id="pre-filtri-panel" style="display:none;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-top:10px">' +
          '<div style="font-size:11px;font-weight:700;color:#64748b;letter-spacing:.6px;text-transform:uppercase;margin-bottom:10px">🔍 FILTRI RICERCA</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:10px">' +
            '<div class="form-group" style="flex:1 1 200px"><label class="form-label" style="font-size:11px">Cliente o Ospite</label><input class="form-input" type="text" id="flt-anag" placeholder="Cerca nome..." oninput="MSK_Prenotazioni.applyFiltri()" style="height:32px;font-size:12px"></div>' +
            '<div class="form-group" style="flex:1 1 150px"><label class="form-label" style="font-size:11px">Check-In dal</label><input class="form-input" type="date" id="flt-checkin" oninput="MSK_Prenotazioni.applyFiltri()" style="height:32px;font-size:12px"></div>' +
            '<div class="form-group" style="flex:1 1 150px"><label class="form-label" style="font-size:11px">Check-Out al</label><input class="form-input" type="date" id="flt-checkout" oninput="MSK_Prenotazioni.applyFiltri()" style="height:32px;font-size:12px"></div>' +
            '<div class="form-group" style="flex:1 1 150px"><label class="form-label" style="font-size:11px">N° Prenotazione</label><input class="form-input" type="text" id="flt-numero" placeholder="PRE-..." oninput="MSK_Prenotazioni.applyFiltri()" style="height:32px;font-size:12px"></div>' +
            '<div class="form-group" style="flex:1 1 150px"><label class="form-label" style="font-size:11px">Super Prodotto</label><select class="form-input" id="flt-superprod" onchange="MSK_Prenotazioni.applyFiltri()" style="height:32px;font-size:12px">' + _optsById(superProds, '') + '</select></div>' +
            '<div class="form-group" style="flex:1 1 150px"><label class="form-label" style="font-size:11px">Prodotto</label><select class="form-input" id="flt-prod" onchange="MSK_Prenotazioni.applyFiltri()" style="height:32px;font-size:12px">' + _optsById(prods, '') + '</select></div>' +
            '<div class="form-group" style="flex:1 1 180px"><label class="form-label" style="font-size:11px">Immobile</label><select class="form-input" id="flt-immobile" onchange="MSK_Prenotazioni.applyFiltri()" style="height:32px;font-size:12px">' + _optsById(vieArr, '') + '</select></div>' +
          '</div>' +
          '<div style="margin-top:8px"><button class="btn btn-ghost" style="font-size:11px" onclick="MSK_Prenotazioni.resetFiltri()">✕ Reset filtri</button></div>' +
        '</div>' +

        /* ── LISTA ── */
        '<div style="margin-top:14px">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:8px">' +
            '<div style="font-size:11px;font-weight:700;color:#1e3a5f;letter-spacing:.6px;text-transform:uppercase">📂 Prenotazioni</div>' +
            '<input class="search-input" id="pre-search" type="text" placeholder="🔍 Cerca..." oninput="MSK_Prenotazioni.filterList()" style="max-width:260px;font-size:12px">' +
          '</div>' +
          '<div style="overflow-x:auto">' +
            '<table class="data-table" style="min-width:860px;font-size:12px">' +
              '<thead><tr>' +
                '<th>N° Pren.</th><th>Stato</th><th>Data</th><th>Cliente</th><th>Ospite</th>' +
                '<th>Check-In</th><th>Check-Out</th><th style="text-align:center">Notti</th>' +
                '<th>Immobile</th><th style="width:80px"></th>' +
              '</tr></thead>' +
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
    var clienti  = _getClienti();
    var ospiti   = _getOspiti();
    var immobili = _getImmobili();

    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:28px;color:#94a3b8">Nessuna prenotazione trovata</td></tr>';
      return;
    }

    var html = '';
    list.forEach(function (p) {
      var nomeCli  = _nomeByIdAnag(clienti, p.cliente_id);
      var nomeOsp  = _nomeByIdAnag(ospiti, p.ospite_id);
      var nomeImm  = _nomeByIdImm(immobili, p.via_immobile_id);
      var dalFmt   = p.dal ? p.dal.replace('T',' ').substring(0,16) : '—';
      var alFmt    = p.al  ? p.al.replace('T',' ').substring(0,16)  : '—';
      var dataPren = p.data_prenotazione ? p.data_prenotazione.substring(0,10) : '—';
      var stato    = p.stato || 'Aperta';
      var statoCol = stato === 'Confermata' ? '#dcfce7;color:#166534' :
                     stato === 'Annullata'  ? '#fee2e2;color:#991b1b' : '#f1f5f9;color:#475569';

      html +=
        '<tr class="data-row" onclick="MSK_Prenotazioni.apriMaschera(' + p.id + ')" style="cursor:pointer">' +
          '<td><strong>' + TONIO_escapeHtml(p.numero_prenotazione || '—') + '</strong></td>' +
          '<td><span style="display:inline-block;background:' + statoCol + ';border-radius:4px;padding:2px 7px;font-size:10px;font-weight:700">' + TONIO_escapeHtml(stato) + '</span></td>' +
          '<td style="white-space:nowrap">' + TONIO_escapeHtml(dataPren) + '</td>' +
          '<td>' + TONIO_escapeHtml(nomeCli) + '</td>' +
          '<td>' + TONIO_escapeHtml(nomeOsp) + '</td>' +
          '<td style="white-space:nowrap">' + TONIO_escapeHtml(dalFmt) + '</td>' +
          '<td style="white-space:nowrap">' + TONIO_escapeHtml(alFmt) + '</td>' +
          '<td style="text-align:center"><span class="badge" style="background:#eff6ff;color:#3b82f6;border:1px solid #bfdbfe">' + (p.notti || 0) + '</span></td>' +
          '<td>' + TONIO_escapeHtml(nomeImm) + '</td>' +
          '<td onclick="event.stopPropagation()">' +
            '<button class="btn-icon btn-danger" title="Elimina" onclick="MSK_Prenotazioni.elimina(' + p.id + ')">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/><path d="M9,6V4h6v2"/></svg>' +
            '</button>' +
          '</td>' +
        '</tr>';
    });
    tbody.innerHTML = html;
  }

  function _aggiornaCount(n) {
    var el = document.getElementById('pre-count');
    if (el) el.textContent = n + ' prenotazioni';
  }

  /* ================================================================
     APRI MASCHERA COMPLETA (in overlay / full page)
  ================================================================ */
  function apriMaschera(id) {
    _editId = (id !== undefined && id !== null) ? id : null;
    _renderMaschera();
  }

  function nuovaPrenotazione() {
    _editId = null;
    _renderMaschera();
  }

  /* ================================================================
     RENDER MASCHERA COMPLETA
  ================================================================ */
  function _renderMaschera() {
    var c = document.getElementById('page-prenotazioni');
    if (!c) return;

    var rec    = _editId !== null ? (_prenotazioni.find(function (p) { return p.id === _editId; }) || null) : null;
    var isNew  = !rec;

    /* Lookup arrays */
    var superProds    = _getSuperProdotti();
    var prods         = _getProdotti();
    var tipiImmobile  = _getTipiImmobile();
    var piani         = _getPiani();
    var immobili      = _getImmobili();
    var clienti       = _getClienti();
    var ospiti        = _getOspiti();
    var modPag        = _getModalitaPag();

    var vieArr = immobili.map(function (imm) {
      return { id: imm.id, nome: imm.immobile + (imm.via ? ' (' + imm.via + ')' : '') };
    });

    /* Valori record */
    var r = rec || {};
    var vNum       = r.numero_prenotazione || '';
    var vData      = r.data_prenotazione   || _today();
    var vProt      = r.protocollo          || '';
    var vRedatto   = r.redatto             || '';
    var vCliente   = r.cliente_id          || '';
    var vContatto  = r.contatto            || '';
    var vTelefono  = r.telefono            || '';
    var vMail      = r.mail                || '';
    var vRifRich   = r.rif_richiesta       || '';
    var vRifGruppo = r.rif_gruppo          || '';
    var vPrevNum   = r.preventivo_num      || '';
    var vStato     = r.stato               || 'Aperta';

    /* Soggiorno richiesto */
    var vDalRich   = r.dal_richiesto       || '';
    var vOraDalR   = r.ora_dal_richiesto   || '';
    var vAlRich    = r.al_richiesto        || '';
    var vOraAlR    = r.ora_al_richiesto    || '';
    var vNottiR    = r.notti_richieste     || 0;
    var vSpR       = r.sp_richiesto_id     || '';
    var vProdR     = r.prod_richiesto_id   || '';
    var vViaR      = r.via_richiesto_id    || '';
    var vTipoR     = r.tipo_richiesto_id   || '';
    var vPostiR    = r.posti_richiesti     || '';
    var vPianoR    = r.piano_richiesto_id  || '';
    var vVistaR    = r.vista_richiesta     || '';

    /* Soggiorno confermato */
    var vDal       = r.dal                 || '';
    var vOraDal    = r.ora_dal             || '';
    var vAl        = r.al                  || '';
    var vOraAl     = r.ora_al             || '';
    var vNotti     = r.notti               || 0;
    var vSP        = r.super_prodotto_id   || '';
    var vProd      = r.prodotto_id         || '';
    var vVia       = r.via_immobile_id     || '';
    var vTipo      = r.tipo_immobile_id    || '';
    var vPosti     = r.posti_letto         || '';
    var vPiano     = r.piano_id            || '';
    var vVista     = r.vista               || '';
    var vImmobile  = r.immobile_assegnato  || '';

    /* Ospite */
    var vOspite    = r.ospite_id           || '';
    var vDettagli  = r.dettagli_ospite     || '';
    var vTotOsp    = r.tot_ospiti          || '';
    var vAdulti    = r.adulti              || '';
    var vChd       = r.bambini             || '';
    var vInf       = r.infants             || '';
    var vAnimali   = r.animali             || '';
    var vNoteResp  = r.note_responsabile   || '';
    var vNoteCli   = r.note_cliente        || '';
    var vNoteOsp   = r.note_ospite         || '';
    var vNoteImm   = r.note_immobile       || '';
    var vNoteCol   = r.note_collaboratori  || '';
    var vProtocolloOsp = r.protocollo_ospite || '';
    var vCellOsp   = r.cellulare_ospite    || '';
    var vTipOsp    = r.tipologia_ospite    || '';

    /* Servizi */
    var vServizi   = r.servizi             || [];

    /* Cauzione */
    var vCau       = r.cauzione            || {};

    /* Pagamenti ospite */
    var vPagOsp    = r.pagamenti_ospite    || [];
    /* Pagamenti cliente */
    var vPagCli    = r.pagamenti_cliente   || [];

    /* ---- HTML MASCHERA ---- */

    /* Helper field */
    function fld(label, content, grow) {
      return '<div class="pre-field" style="flex:' + (grow || '0 0 auto') + '">' +
               '<label>' + label + '</label>' + content + '</div>';
    }
    function inp(id, val, type, extra) {
      return '<input type="' + (type||'text') + '" id="' + id + '" value="' + TONIO_escapeHtml(String(val||'')) + '"' + (extra||'') + '>';
    }
    function sel(id, optsHtml, extra) {
      return '<select id="' + id + '"' + (extra||'') + '>' + optsHtml + '</select>';
    }

    /* --------- SEZIONE 1: GENERALE RICHIESTA --------- */
    var secGenerale =
      '<div class="pre-section">' +
        '<div class="pre-section-head">📋 GENERALE RICHIESTA' +
          (isNew ? '' : '&nbsp;&nbsp;<span style="font-size:9px;opacity:.8">ID ' + _editId + '</span>') +
          '<div style="flex:1"></div>' +
          /* Stato buttons */
          '<span id="badge-aperta"  class="' + (vStato==='Aperta'     ? 'pre-badge-neu'  : 'pre-badge-neu')  + '" onclick="MSK_Prenotazioni._setStato(\'Aperta\')"   style="cursor:pointer">APERTA</span>&nbsp;' +
          '<span id="badge-conf"    class="' + (vStato==='Confermata' ? 'pre-badge-conf' : 'pre-badge-neu') + '" onclick="MSK_Prenotazioni._setStato(\'Confermata\')" style="cursor:pointer">CONFERMATA</span>&nbsp;' +
          '<span id="badge-ann"     class="' + (vStato==='Annullata'  ? 'pre-badge-ann'  : 'pre-badge-neu')  + '" onclick="MSK_Prenotazioni._setStato(\'Annullata\')"  style="cursor:pointer">ANNULLATA</span>&nbsp;&nbsp;' +
          '<span style="font-size:9px;opacity:.7">|</span>&nbsp;&nbsp;' +
          '<span class="pre-badge-neu" onclick="MSK_Prenotazioni._copiaParziale()" style="cursor:pointer">COPIA PARZIALE</span>&nbsp;' +
          '<span class="pre-badge-neu" onclick="MSK_Prenotazioni._copiaTutto()" style="cursor:pointer">COPIA TUTTO</span>' +
        '</div>' +
        '<div class="pre-section-body">' +
          '<input type="hidden" id="pre-stato" value="' + TONIO_escapeHtml(vStato) + '">' +
          '<div class="pre-row">' +
            fld('Data', inp('pre-data', vData, 'date'), '0 0 120px') +
            fld('N° Prenotazione', inp('pre-numero', vNum, 'text', ' placeholder="Auto"'), '0 0 140px') +
            fld('Redatto', inp('pre-redatto', vRedatto), '1 1 120px') +
            fld('Cliente', sel('pre-cliente', _optsAnag(clienti, parseInt(vCliente,10))), '1 1 160px') +
            fld('Contatto', inp('pre-contatto', vContatto), '1 1 130px') +
            fld('Telefono', inp('pre-telefono', vTelefono), '1 1 120px') +
            fld('Mail', inp('pre-mail', vMail, 'email'), '1 1 150px') +
            fld('Rif. Richiesta', inp('pre-rif-rich', vRifRich), '1 1 120px') +
            fld('Rif. Gruppo', inp('pre-rif-gruppo', vRifGruppo), '1 1 120px') +
            fld('Preventivo N°', inp('pre-prev-num', vPrevNum), '0 0 110px') +
            fld('Protocollo', inp('pre-protocollo', vProt), '0 0 110px') +
          '</div>' +
        '</div>' +
      '</div>';

    /* --------- SEZIONE 2: SOGGIORNO RICHIESTO --------- */
    var secRichiesto =
      '<div class="pre-section">' +
        '<div class="pre-section-head">📅 SOGGIORNO RICHIESTO</div>' +
        '<div class="pre-section-body">' +
          '<div class="pre-row">' +
            fld('Dal — Data', inp('pre-dal-rich', vDalRich, 'date', ' onchange="MSK_Prenotazioni.aggiornaNottiR()"'), '0 0 120px') +
            fld('Ora', inp('pre-ora-dal-rich', vOraDalR, 'time'), '0 0 80px') +
            fld('Al — Data', inp('pre-al-rich', vAlRich, 'date', ' onchange="MSK_Prenotazioni.aggiornaNottiR()"'), '0 0 120px') +
            fld('Ora', inp('pre-ora-al-rich', vOraAlR, 'time'), '0 0 80px') +
            fld('Notti', '<input type="text" id="pre-notti-rich" value="' + vNottiR + '" class="bold-blue" readonly>', '0 0 55px') +
            fld('Super Prodotto', sel('pre-sp-rich', _optsById(superProds, parseInt(vSpR,10))), '1 1 130px') +
            fld('Prodotto', sel('pre-prod-rich', _optsById(prods, parseInt(vProdR,10))), '1 1 130px') +
            fld('Via Immobile', sel('pre-via-rich', _optsById(vieArr, parseInt(vViaR,10))), '1 1 160px') +
            fld('Tipo Immobile', sel('pre-tipo-rich', _optsById(tipiImmobile, parseInt(vTipoR,10))), '1 1 120px') +
            fld('Posti Letto', inp('pre-posti-rich', vPostiR, 'number', ' min="1" step="1"'), '0 0 70px') +
            fld('Piano', sel('pre-piano-rich', _optsById(piani, parseInt(vPianoR,10))), '0 0 100px') +
            fld('Vista', inp('pre-vista-rich', vVistaR), '0 0 90px') +
          '</div>' +
        '</div>' +
      '</div>';

    /* --------- SEZIONE 3: SOGGIORNO CONFERMATO + ASSEGNAZIONE --------- */
    var secConfermato =
      '<div class="pre-section">' +
        '<div class="pre-section-head">✅ SOGGIORNO CONFERMATO &amp; ASSEGNAZIONE</div>' +
        '<div class="pre-section-body">' +
          /* Riga date + immobile */
          '<div class="pre-row">' +
            fld('Check-In Data', inp('pre-dal', vDal, 'date', ' onchange="MSK_Prenotazioni.aggiornaNotti()"'), '0 0 120px') +
            fld('Ora', inp('pre-ora-dal', vOraDal, 'time'), '0 0 80px') +
            fld('Check-Out Data', inp('pre-al', vAl, 'date', ' onchange="MSK_Prenotazioni.aggiornaNotti()"'), '0 0 120px') +
            fld('Ora', inp('pre-ora-al', vOraAl, 'time'), '0 0 80px') +
            fld('Notti', '<input type="text" id="pre-notti" value="' + vNotti + '" class="bold-blue" readonly>', '0 0 55px') +
            fld('Super Prodotto', sel('pre-superprod', _optsById(superProds, parseInt(vSP,10))), '1 1 130px') +
            fld('Prodotto', sel('pre-prod', _optsById(prods, parseInt(vProd,10))), '1 1 130px') +
            fld('Via Immobile', sel('pre-via', _optsById(vieArr, parseInt(vVia,10))), '1 1 160px') +
            fld('Tipo Immobile', sel('pre-tipo-imm', _optsById(tipiImmobile, parseInt(vTipo,10))), '1 1 120px') +
            fld('Posti Letto', inp('pre-posti', vPosti, 'number', ' min="1" step="1"'), '0 0 70px') +
            fld('Piano', sel('pre-piano', _optsById(piani, parseInt(vPiano,10))), '0 0 100px') +
            fld('Vista', inp('pre-vista', vVista), '0 0 90px') +
          '</div>' +
          /* Riga assegnazione immobile */
          '<div class="pre-row" style="margin-top:4px">' +
            fld('Immobile Assegnato', inp('pre-immobile-ass', vImmobile), '1 1 200px') +
            '<div class="pre-field" style="flex:0 0 auto;justify-content:flex-end">' +
              '<label>&nbsp;</label>' +
              '<div style="display:flex;gap:5px">' +
                '<button class="btn btn-ghost" style="height:30px;font-size:11px;padding:0 8px" onclick="MSK_Prenotazioni._sceltaImmobile()">🏠 SCELTA</button>' +
                '<button class="btn btn-ghost" style="height:30px;font-size:11px;padding:0 8px" onclick="MSK_Prenotazioni._vediImmobile()">👁 VEDI</button>' +
                '<button class="btn btn-ghost" style="height:30px;font-size:11px;padding:0 8px" onclick="MSK_Prenotazioni._checkDisponibilita()">📅 DISPON.</button>' +
                '<button class="btn btn-ghost" style="height:30px;font-size:11px;padding:0 8px" onclick="MSK_Prenotazioni._vediDettagliInterni()">🔍 DETTAGLI INTERNI</button>' +
              '</div>' +
            '</div>' +
          '</div>' +

          /* Riga ospite + note */
          '<div class="pre-row" style="margin-top:8px;align-items:flex-start">' +
            /* Ospite */
            '<div class="pre-field" style="flex:1 1 160px">' +
              '<label>Nominativo Ospite</label>' +
              sel('pre-ospite', _optsAnag(ospiti, parseInt(vOspite,10))) +
            '</div>' +
            fld('Dettagli', inp('pre-dettagli-osp', vDettagli), '1 1 100px') +
            fld('Tot. Ospiti', inp('pre-tot-osp', vTotOsp, 'number', ' min="1" step="1"'), '0 0 65px') +
            fld('Adulti', inp('pre-adulti', vAdulti, 'number', ' min="0" step="1"'), '0 0 55px') +
            fld('Bambini', inp('pre-chd', vChd, 'number', ' min="0" step="1"'), '0 0 60px') +
            fld('Infants', inp('pre-inf', vInf, 'number', ' min="0" step="1"'), '0 0 55px') +
            fld('Animali', inp('pre-animali', vAnimali, 'number', ' min="0" step="1"'), '0 0 60px') +
            fld('Protocollo', inp('pre-prot-osp', vProtocolloOsp), '0 0 100px') +
            fld('Cellulare', inp('pre-cell-osp', vCellOsp), '0 0 120px') +
            fld('Tipologia', inp('pre-tip-osp', vTipOsp), '0 0 100px') +
          '</div>' +

          /* Note */
          '<div class="pre-row" style="margin-top:6px;align-items:flex-start">' +
            fld('Note Resp. Coordinamento', '<textarea id="pre-note-resp" rows="2" style="width:100%;font-size:11px;border:1px solid #d1d5db;border-radius:4px;padding:3px 5px;resize:vertical">' + TONIO_escapeHtml(vNoteResp) + '</textarea>', '2 1 180px') +
            fld('Note Cliente', '<textarea id="pre-note-cli" rows="2" style="width:100%;font-size:11px;border:1px solid #d1d5db;border-radius:4px;padding:3px 5px;resize:vertical">' + TONIO_escapeHtml(vNoteCli) + '</textarea>', '1 1 150px') +
            fld('Note Ospite', '<textarea id="pre-note-osp" rows="2" style="width:100%;font-size:11px;border:1px solid #d1d5db;border-radius:4px;padding:3px 5px;resize:vertical">' + TONIO_escapeHtml(vNoteOsp) + '</textarea>', '1 1 150px') +
            fld('Note Collaboratori', '<textarea id="pre-note-col" rows="2" style="width:100%;font-size:11px;border:1px solid #d1d5db;border-radius:4px;padding:3px 5px;resize:vertical">' + TONIO_escapeHtml(vNoteCol) + '</textarea>', '1 1 150px') +
            fld('Note Immobile', '<textarea id="pre-note-imm" rows="2" style="width:100%;font-size:11px;border:1px solid #d1d5db;border-radius:4px;padding:3px 5px;resize:vertical">' + TONIO_escapeHtml(vNoteImm) + '</textarea>', '1 1 150px') +
            /* Pulsanti CANC / DISPON / DETTAGLI */
            '<div class="pre-field" style="flex:0 0 auto;justify-content:flex-end">' +
              '<label>&nbsp;</label>' +
              '<div style="display:flex;flex-direction:column;gap:4px">' +
                '<button class="btn btn-danger" style="height:26px;font-size:10px;padding:0 8px" onclick="MSK_Prenotazioni._cancella()">🗑 CANC</button>' +
                '<button class="btn btn-ghost" style="height:26px;font-size:10px;padding:0 8px" onclick="MSK_Prenotazioni._checkDisponibilita()">📅 DISPON</button>' +
                '<button class="btn btn-ghost" style="height:26px;font-size:10px;padding:0 8px" onclick="MSK_Prenotazioni._vediDettagliInterni()">🔍 DETTAGLI</button>' +
                '<button class="btn btn-ghost" style="height:26px;font-size:10px;padding:0 8px" onclick="MSK_Prenotazioni._pulizie()">🧹 PULIZIE</button>' +
                '<button class="btn btn-ghost" style="height:26px;font-size:10px;padding:0 8px" onclick="MSK_Prenotazioni._lavanderia()">👕 LAVANDERIA</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    /* --------- SEZIONE 4: LOCAZIONE / SERVIZI / EXTRA --------- */
    var secServizi = _buildSectionServizi(vServizi);

    /* --------- SEZIONE 5: CAUZIONE --------- */
    var secCauzione = _buildSectionCauzione(vCau);

    /* --------- SEZIONE 6 & 7: PAGAMENTI OSPITE + CLIENTE --------- */
    var secPagamenti = _buildSectionPagamenti(vPagOsp, vPagCli, modPag);

    /* --------- PULSANTI AZIONE --------- */
    var secAzioni =
      '<div class="pre-actions">' +
        '<button class="btn btn-primary" onclick="MSK_Prenotazioni.salva()">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>Salva Prenotazione' +
        '</button>' +
        '<button class="btn btn-ghost" onclick="MSK_Prenotazioni._stampa()">🖨 Stampa</button>' +
        (!isNew ? '<button class="btn btn-danger" onclick="MSK_Prenotazioni.elimina(' + _editId + ')">🗑 Elimina</button>' : '') +
        '<button class="btn btn-ghost" onclick="MSK_Prenotazioni._tornaLista()">← Torna alla Lista</button>' +
      '</div>';

    /* Assembla tutto */
    c.innerHTML =
      '<style>' + _CSS + '</style>' +
      '<div class="list-page" style="padding:10px 12px">' +
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">' +
          '<h1 class="list-title" style="margin:0;font-size:16px">📅 ' + (isNew ? 'Nuova Prenotazione' : 'Prenotazione — ' + TONIO_escapeHtml(vNum)) + '</h1>' +
        '</div>' +
        secAzioni +
        secGenerale +
        secRichiesto +
        secConfermato +
        secServizi +
        secCauzione +
        secPagamenti +
        secAzioni +
      '</div>';
  }

  /* ================================================================
     SEZIONE SERVIZI
  ================================================================ */
  function _buildSectionServizi(righe) {
    if (!righe || !righe.length) {
      righe = [{ descr:'', um:'', dal:'', al:'', n:'', sconto_p:'', sconto_e:'', iva_p:'', obbligatorio:false, osp:false, cli:false, pro:false, nf:false, i:false, ft:false }];
    }

    var thead =
      '<tr>' +
        '<th style="text-align:left;min-width:160px">Locazione / Servizio / Extra</th>' +
        '<th>Unità di Misura</th>' +
        '<th>Imp. Unitario</th>' +
        '<th>Dal</th>' +
        '<th>Al</th>' +
        '<th>N°</th>' +
        '<th>Imponibile</th>' +
        '<th>% Sc.</th>' +
        '<th>€ Sc.</th>' +
        '<th>Imp. Scontato</th>' +
        '<th>IVA %</th>' +
        '<th>IVA €</th>' +
        '<th>TOTALE</th>' +
        '<th>Osp</th><th>Cli</th><th>Pro</th><th>N</th><th>I</th>' +
        '<th>% Ft</th><th>€ Ft</th>' +
        '<th>Ft</th><th>NF</th><th>Osp</th><th>Cli</th>' +
        '<th></th>' +
      '</tr>';

    var tbodyRows = '';
    righe.forEach(function (r, idx) {
      function ch(val) { return val ? ' checked' : ''; }
      tbodyRows +=
        '<tr id="srv-row-' + idx + '">' +
          '<td><input type="text" id="srv-descr-' + idx + '" value="' + TONIO_escapeHtml(r.descr||'') + '" style="width:100%;min-width:150px"></td>' +
          '<td><input type="text" id="srv-um-' + idx + '" value="' + TONIO_escapeHtml(r.um||'') + '"></td>' +
          '<td><input type="number" id="srv-imp-' + idx + '" value="' + (r.imp||'') + '" step="0.01" oninput="MSK_Prenotazioni._calcSrv(' + idx + ')" style="width:70px"></td>' +
          '<td><input type="date" id="srv-dal-' + idx + '" value="' + (r.dal||'') + '" style="width:110px"></td>' +
          '<td><input type="date" id="srv-al-' + idx + '" value="' + (r.al||'') + '" style="width:110px"></td>' +
          '<td><input type="number" id="srv-n-' + idx + '" value="' + (r.n||'') + '" step="1" oninput="MSK_Prenotazioni._calcSrv(' + idx + ')" style="width:50px"></td>' +
          '<td class="td-calc"><input type="text" id="srv-impon-' + idx + '" value="' + (r.imponibile||'') + '" readonly class="bold-blue" style="width:70px"></td>' +
          '<td><input type="number" id="srv-sc-p-' + idx + '" value="' + (r.sconto_p||'') + '" step="0.01" placeholder="%" oninput="MSK_Prenotazioni._calcSrv(' + idx + ')" style="width:50px"></td>' +
          '<td><input type="number" id="srv-sc-e-' + idx + '" value="' + (r.sconto_e||'') + '" step="0.01" placeholder="€" oninput="MSK_Prenotazioni._calcSrv(' + idx + ')" style="width:60px"></td>' +
          '<td class="td-calc"><input type="text" id="srv-scontato-' + idx + '" value="' + (r.imp_scontato||'') + '" readonly class="bold-blue" style="width:70px"></td>' +
          '<td><input type="number" id="srv-iva-p-' + idx + '" value="' + (r.iva_p||'') + '" step="0.01" placeholder="%" oninput="MSK_Prenotazioni._calcSrv(' + idx + ')" style="width:50px"></td>' +
          '<td class="td-calc"><input type="text" id="srv-iva-e-' + idx + '" value="' + (r.iva_e||'') + '" readonly class="bold-blue" style="width:60px"></td>' +
          '<td class="td-calc"><input type="text" id="srv-tot-' + idx + '" value="' + (r.totale||'') + '" readonly class="bold-blue" style="width:70px"></td>' +
          '<td style="text-align:center"><input type="checkbox" id="srv-osp-' + idx + '"' + ch(r.osp) + '></td>' +
          '<td style="text-align:center"><input type="checkbox" id="srv-cli-' + idx + '"' + ch(r.cli) + '></td>' +
          '<td style="text-align:center"><input type="checkbox" id="srv-pro-' + idx + '"' + ch(r.pro) + '></td>' +
          '<td style="text-align:center"><input type="checkbox" id="srv-n-flag-' + idx + '"' + ch(r.nf) + '></td>' +
          '<td style="text-align:center"><input type="checkbox" id="srv-i-' + idx + '"' + ch(r.i) + '></td>' +
          '<td><input type="number" id="srv-ft-p-' + idx + '" value="' + (r.ft_p||'') + '" step="0.01" placeholder="%" style="width:50px"></td>' +
          '<td><input type="number" id="srv-ft-e-' + idx + '" value="' + (r.ft_e||'') + '" step="0.01" placeholder="€" style="width:60px"></td>' +
          '<td style="text-align:center"><input type="checkbox" id="srv-ft-' + idx + '"' + ch(r.ft) + '></td>' +
          '<td style="text-align:center"><input type="checkbox" id="srv-nf2-' + idx + '"' + ch(r.nf2) + '></td>' +
          '<td style="text-align:center"><input type="checkbox" id="srv-osp2-' + idx + '"' + ch(r.osp2) + '></td>' +
          '<td style="text-align:center"><input type="checkbox" id="srv-cli2-' + idx + '"' + ch(r.cli2) + '></td>' +
          '<td><button class="btn btn-ghost" style="height:24px;font-size:10px;padding:0 6px" onclick="MSK_Prenotazioni._removeSrv(' + idx + ')">✕</button></td>' +
        '</tr>';
    });

    /* Riga TOTALE */
    tbodyRows +=
      '<tr style="background:#f8fafc;font-weight:700">' +
        '<td colspan="12" style="text-align:right;padding-right:8px;font-size:11px;font-weight:700;color:#1e3a5f">TOTALE</td>' +
        '<td class="td-calc"><input type="text" id="srv-gran-tot" readonly class="bold-blue" style="width:70px"></td>' +
        '<td colspan="11"></td>' +
      '</tr>';

    return (
      '<div class="pre-section">' +
        '<div class="pre-section-head">🛒 LOCAZIONE — SERVIZI — EXTRA' +
          '<div style="flex:1"></div>' +
          '<button class="pre-badge-neu" onclick="MSK_Prenotazioni._addSrv()" style="cursor:pointer">＋ Aggiungi Riga</button>&nbsp;' +
          '<button class="pre-badge-neu" onclick="MSK_Prenotazioni._inserisciObbligatori()" style="cursor:pointer">⚡ Inserisci Servizi e Extra Obbligatori</button>' +
        '</div>' +
        '<div class="pre-section-body" style="overflow-x:auto">' +
          '<table class="srv-table" id="srv-table">' +
            '<thead>' + thead + '</thead>' +
            '<tbody id="srv-tbody">' + tbodyRows + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>'
    );
  }

  /* ================================================================
     SEZIONE CAUZIONE
  ================================================================ */
  function _buildSectionCauzione(cau) {
    cau = cau || {};
    return (
      '<div class="pre-section">' +
        '<div class="pre-section-head">🔒 CAUZIONE</div>' +
        '<div class="pre-section-body">' +
          '<div style="display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">' +
            /* Colonna sinistra — stati */
            '<div style="flex:0 0 auto">' +
              '<div class="cau-box">' +
                '<label>In Custodia</label><input type="checkbox" id="cau-custodia"' + (cau.in_custodia?' checked':'') + '>' +
                '<label>Restituita</label><input type="checkbox" id="cau-restituita"' + (cau.restituita?' checked':'') + '>' +
                '<label>Trattenuta</label><input type="checkbox" id="cau-trattenuta"' + (cau.trattenuta?' checked':'') + '>' +
              '</div>' +
            '</div>' +
            /* Colonna importi */
            '<div style="flex:0 0 auto">' +
              '<table style="border-collapse:collapse;font-size:11px">' +
                '<thead><tr>' +
                  '<th style="background:#f8fafc;padding:4px 8px;border:1px solid #e2e8f0;font-size:9px;letter-spacing:.5px;text-transform:uppercase"></th>' +
                  '<th style="background:#f8fafc;padding:4px 8px;border:1px solid #e2e8f0;font-size:9px;letter-spacing:.5px;text-transform:uppercase">Importo</th>' +
                  '<th style="background:#f8fafc;padding:4px 8px;border:1px solid #e2e8f0;font-size:9px;letter-spacing:.5px;text-transform:uppercase">Data</th>' +
                '</tr></thead>' +
                '<tbody>' +
                  '<tr>' +
                    '<td style="border:1px solid #e2e8f0;padding:3px 6px;font-size:10px;font-weight:600;color:#64748b;white-space:nowrap">STAMPA</td>' +
                    '<td style="border:1px solid #e2e8f0;padding:2px 4px"><input type="number" id="cau-imp-stampa" value="' + (cau.imp_stampa||'') + '" step="0.01" style="width:80px;height:24px;font-size:11px;border:1px solid #d1d5db;border-radius:3px;padding:2px 4px"></td>' +
                    '<td style="border:1px solid #e2e8f0;padding:2px 4px"><input type="date" id="cau-dt-stampa" value="' + (cau.dt_stampa||'') + '" style="height:24px;font-size:11px;border:1px solid #d1d5db;border-radius:3px;padding:2px 4px"></td>' +
                  '</tr>' +
                  '<tr>' +
                    '<td style="border:1px solid #e2e8f0;padding:3px 6px;font-size:10px;font-weight:600;color:#64748b;white-space:nowrap">IN CUSTODIA</td>' +
                    '<td style="border:1px solid #e2e8f0;padding:2px 4px"><input type="number" id="cau-imp-cust" value="' + (cau.imp_custodia||'') + '" step="0.01" style="width:80px;height:24px;font-size:11px;border:1px solid #d1d5db;border-radius:3px;padding:2px 4px"></td>' +
                    '<td style="border:1px solid #e2e8f0;padding:2px 4px"><input type="date" id="cau-dt-cust" value="' + (cau.dt_custodia||'') + '" style="height:24px;font-size:11px;border:1px solid #d1d5db;border-radius:3px;padding:2px 4px"></td>' +
                  '</tr>' +
                  '<tr>' +
                    '<td style="border:1px solid #e2e8f0;padding:3px 6px;font-size:10px;font-weight:600;color:#64748b;white-space:nowrap">RESTITUITA</td>' +
                    '<td style="border:1px solid #e2e8f0;padding:2px 4px"><input type="number" id="cau-imp-rest" value="' + (cau.imp_restituita||'') + '" step="0.01" style="width:80px;height:24px;font-size:11px;border:1px solid #d1d5db;border-radius:3px;padding:2px 4px"></td>' +
                    '<td style="border:1px solid #e2e8f0;padding:2px 4px"><input type="date" id="cau-dt-rest" value="' + (cau.dt_restituita||'') + '" style="height:24px;font-size:11px;border:1px solid #d1d5db;border-radius:3px;padding:2px 4px"></td>' +
                  '</tr>' +
                  '<tr>' +
                    '<td style="border:1px solid #e2e8f0;padding:3px 6px;font-size:10px;font-weight:600;color:#64748b;white-space:nowrap">TRATTENUTA</td>' +
                    '<td style="border:1px solid #e2e8f0;padding:2px 4px"><input type="number" id="cau-imp-tratt" value="' + (cau.imp_trattenuta||'') + '" step="0.01" style="width:80px;height:24px;font-size:11px;border:1px solid #d1d5db;border-radius:3px;padding:2px 4px"></td>' +
                    '<td style="border:1px solid #e2e8f0;padding:2px 4px"><input type="date" id="cau-dt-tratt" value="' + (cau.dt_trattenuta||'') + '" style="height:24px;font-size:11px;border:1px solid #d1d5db;border-radius:3px;padding:2px 4px"></td>' +
                  '</tr>' +
                '</tbody>' +
              '</table>' +
            '</div>' +
            /* Motivo trattenuta */
            '<div style="flex:1 1 200px">' +
              '<label style="font-size:10px;font-weight:600;color:#64748b;text-transform:uppercase;display:block;margin-bottom:3px">Motivo Trattenuta</label>' +
              '<textarea id="cau-motivo" rows="4" style="width:100%;font-size:11px;border:1px solid #d1d5db;border-radius:4px;padding:4px 6px;resize:vertical">' + TONIO_escapeHtml(cau.motivo||'') + '</textarea>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  /* ================================================================
     SEZIONE PAGAMENTI
  ================================================================ */
  function _buildSectionPagamenti(pagOsp, pagCli, modPag) {
    function _optsModPag(selectedId) {
      var h = '<option value="">— Seleziona —</option>';
      modPag.forEach(function (m) {
        h += '<option value="' + m.id + '"' + (m.id === selectedId ? ' selected':'') + '>' + TONIO_escapeHtml(m.nome) + '</option>';
      });
      return h;
    }

    var causali = ['1° Acconto  Deposito Cauzionale','2° Acconto','3° Acconto','4° Saldo'];
    if (!pagOsp || !pagOsp.length) {
      pagOsp = causali.map(function(c,i){return {causale:c,perc:'',importo:'',mod_pag:'',entro:'',pagata:'',incassato:'',da_incassare:'',ft:false,nf:false,num_doc:'',dat_doc:''};});
    }
    if (!pagCli || !pagCli.length) {
      pagCli = causali.map(function(c,i){return {causale:c,perc:'',importo:'',mod_pag:'',entro:'',pagata:'',incassato:'',da_incassare:'',ft:false,nf:false,num_doc:'',dat_doc:''};});
    }

    function _buildPagTable(rows, prefix) {
      var thead =
        '<tr>' +
          '<th style="text-align:left;min-width:180px">Causale</th>' +
          '<th>%</th><th>Importo</th><th>Mod. Pagamento</th>' +
          '<th>Entro il</th><th>Pagata il</th>' +
          '<th>Incassato</th><th>Da Incassare</th>' +
          '<th>Ft</th><th>NF</th><th>N° Doc</th><th>Dat.Doc</th>' +
        '</tr>';
      var tbody = '';
      rows.forEach(function (r, idx) {
        function ch(val) { return val ? ' checked':''; }
        tbody +=
          '<tr>' +
            '<td><input type="text" id="' + prefix + '-caus-' + idx + '" value="' + TONIO_escapeHtml(r.causale||'') + '" style="width:100%;min-width:170px"></td>' +
            '<td><input type="number" id="' + prefix + '-perc-' + idx + '" value="' + (r.perc||'') + '" step="0.01" placeholder="%" oninput="MSK_Prenotazioni._calcPag(\'' + prefix + '\',' + idx + ')" style="width:55px"></td>' +
            '<td><input type="number" id="' + prefix + '-imp-' + idx + '" value="' + (r.importo||'') + '" step="0.01" oninput="MSK_Prenotazioni._calcPag(\'' + prefix + '\',' + idx + ')" style="width:70px"></td>' +
            '<td><select id="' + prefix + '-mod-' + idx + '" style="min-width:130px">' + _optsModPag(r.mod_pag) + '</select></td>' +
            '<td><input type="date" id="' + prefix + '-entro-' + idx + '" value="' + (r.entro||'') + '" style="width:110px"></td>' +
            '<td><input type="date" id="' + prefix + '-pag-' + idx + '" value="' + (r.pagata||'') + '" style="width:110px"></td>' +
            '<td class="td-ft"><input type="number" id="' + prefix + '-inc-' + idx + '" value="' + (r.incassato||'') + '" step="0.01" style="width:70px"></td>' +
            '<td class="td-nf"><input type="number" id="' + prefix + '-dainc-' + idx + '" value="' + (r.da_incassare||'') + '" step="0.01" readonly style="width:70px;background:#fff7ed"></td>' +
            '<td style="text-align:center"><input type="checkbox" id="' + prefix + '-ft-' + idx + '"' + ch(r.ft) + '></td>' +
            '<td style="text-align:center"><input type="checkbox" id="' + prefix + '-nf-' + idx + '"' + ch(r.nf) + '></td>' +
            '<td><input type="text" id="' + prefix + '-numdoc-' + idx + '" value="' + TONIO_escapeHtml(r.num_doc||'') + '" style="width:80px"></td>' +
            '<td><input type="date" id="' + prefix + '-datdoc-' + idx + '" value="' + (r.dat_doc||'') + '" style="width:110px"></td>' +
          '</tr>';
      });
      /* Riga totali */
      tbody +=
        '<tr class="td-tot">' +
          '<td style="text-align:right;font-size:11px;font-weight:700;color:#1e3a5f">TOTALE</td>' +
          '<td><input type="text" id="' + prefix + '-tot-perc" readonly style="width:55px;background:#fefce8;font-weight:700"></td>' +
          '<td><input type="text" id="' + prefix + '-tot-imp" readonly style="width:70px;background:#fefce8;font-weight:700"></td>' +
          '<td colspan="5"></td>' +
          '<td colspan="1"><input type="text" id="' + prefix + '-tot-ft" readonly style="width:60px;background:#f0fdf4;font-weight:700"></td>' +
          '<td colspan="1"><input type="text" id="' + prefix + '-tot-nf" readonly style="width:60px;background:#fff7ed;font-weight:700"></td>' +
          '<td colspan="2"></td>' +
        '</tr>';

      return '<table class="pag-table"><thead>' + thead + '</thead><tbody>' + tbody + '</tbody></table>';
    }

    return (
      '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:10px">' +

        /* OSPITE */
        '<div class="pre-section" style="flex:1 1 600px">' +
          '<div class="pre-section-head">👤 OSPITE — TERMINI E MODALITÀ DI PAGAMENTO</div>' +
          '<div class="pre-section-body" style="overflow-x:auto">' +
            _buildPagTable(pagOsp, 'pag-osp') +
          '</div>' +
        '</div>' +

        /* CLIENTE */
        '<div class="pre-section" style="flex:1 1 600px">' +
          '<div class="pre-section-head">🏢 CLIENTE — TERMINI E MODALITÀ DI PAGAMENTO</div>' +
          '<div class="pre-section-body" style="overflow-x:auto">' +
            _buildPagTable(pagCli, 'pag-cli') +
          '</div>' +
        '</div>' +

      '</div>'
    );
  }

  /* ================================================================
     HELPERS CALCOLO SERVIZI
  ================================================================ */
  function _calcSrv(idx) {
    var imp    = parseFloat(document.getElementById('srv-imp-'   + idx).value)  || 0;
    var n      = parseFloat(document.getElementById('srv-n-'     + idx).value)  || 0;
    var scP    = parseFloat(document.getElementById('srv-sc-p-'  + idx).value)  || 0;
    var scE    = parseFloat(document.getElementById('srv-sc-e-'  + idx).value)  || 0;
    var ivaP   = parseFloat(document.getElementById('srv-iva-p-' + idx).value)  || 0;

    var impon  = imp * n;
    var scontato = scP ? impon * (1 - scP/100) : impon - scE;
    if (scontato < 0) scontato = 0;
    var ivaE   = scontato * ivaP / 100;
    var tot    = scontato + ivaE;

    var setV = function(id, v) { var el=document.getElementById(id); if(el) el.value = v ? v.toFixed(2) : ''; };
    setV('srv-impon-'   + idx, impon);
    setV('srv-scontato-'+ idx, scontato);
    setV('srv-iva-e-'   + idx, ivaE);
    setV('srv-tot-'     + idx, tot);

    _calcSrvGranTot();
  }

  function _calcSrvGranTot() {
    var tot = 0;
    var i = 0;
    while (true) {
      var el = document.getElementById('srv-tot-' + i);
      if (!el) break;
      tot += parseFloat(el.value) || 0;
      i++;
    }
    var gt = document.getElementById('srv-gran-tot');
    if (gt) gt.value = tot.toFixed(2);
  }

  function _calcPag(prefix, idx) {
    /* aggiorna "da incassare" = importo - incassato */
    var imp = parseFloat((document.getElementById(prefix + '-imp-' + idx) || {}).value) || 0;
    var inc = parseFloat((document.getElementById(prefix + '-inc-' + idx) || {}).value) || 0;
    var el  = document.getElementById(prefix + '-dainc-' + idx);
    if (el) el.value = (imp - inc).toFixed(2);
    /* ricalcola totali */
    _calcPagTot(prefix, idx === 0 ? 4 : 4); /* assume max 4 righe */
  }

  function _calcPagTot(prefix, maxRows) {
    var totPerc = 0, totImp = 0, totFt = 0, totNf = 0;
    for (var i = 0; i < maxRows; i++) {
      var ep = document.getElementById(prefix + '-perc-' + i);
      var ei = document.getElementById(prefix + '-imp-' + i);
      var ef = document.getElementById(prefix + '-ft-' + i);
      var en = document.getElementById(prefix + '-nf-' + i);
      if (!ep) break;
      totPerc += parseFloat(ep.value) || 0;
      totImp  += parseFloat(ei ? ei.value : 0) || 0;
      if (ef && ef.checked) totFt += parseFloat(ei ? ei.value : 0) || 0;
      if (en && en.checked) totNf += parseFloat(ei ? ei.value : 0) || 0;
    }
    var setV = function(id, v) { var el=document.getElementById(id); if(el) el.value = v ? v.toFixed(2) : ''; };
    setV(prefix + '-tot-perc', totPerc);
    setV(prefix + '-tot-imp',  totImp);
    setV(prefix + '-tot-ft',   totFt);
    setV(prefix + '-tot-nf',   totNf);
  }

  /* ================================================================
     AGGIUNGI / RIMUOVI RIGA SERVIZI
  ================================================================ */
  function _addSrv() {
    var tbody = document.getElementById('srv-tbody');
    if (!tbody) return;
    /* conta righe esistenti (esclusi la riga totale) */
    var rows = tbody.querySelectorAll('tr[id^="srv-row-"]');
    var idx  = rows.length;
    var tr   = document.createElement('tr');
    tr.id    = 'srv-row-' + idx;
    tr.innerHTML =
      '<td><input type="text" id="srv-descr-' + idx + '" style="width:100%;min-width:150px"></td>' +
      '<td><input type="text" id="srv-um-' + idx + '"></td>' +
      '<td><input type="number" id="srv-imp-' + idx + '" step="0.01" oninput="MSK_Prenotazioni._calcSrv(' + idx + ')" style="width:70px"></td>' +
      '<td><input type="date" id="srv-dal-' + idx + '" style="width:110px"></td>' +
      '<td><input type="date" id="srv-al-' + idx + '" style="width:110px"></td>' +
      '<td><input type="number" id="srv-n-' + idx + '" step="1" oninput="MSK_Prenotazioni._calcSrv(' + idx + ')" style="width:50px"></td>' +
      '<td class="td-calc"><input type="text" id="srv-impon-' + idx + '" readonly class="bold-blue" style="width:70px"></td>' +
      '<td><input type="number" id="srv-sc-p-' + idx + '" step="0.01" placeholder="%" oninput="MSK_Prenotazioni._calcSrv(' + idx + ')" style="width:50px"></td>' +
      '<td><input type="number" id="srv-sc-e-' + idx + '" step="0.01" placeholder="€" oninput="MSK_Prenotazioni._calcSrv(' + idx + ')" style="width:60px"></td>' +
      '<td class="td-calc"><input type="text" id="srv-scontato-' + idx + '" readonly class="bold-blue" style="width:70px"></td>' +
      '<td><input type="number" id="srv-iva-p-' + idx + '" step="0.01" placeholder="%" oninput="MSK_Prenotazioni._calcSrv(' + idx + ')" style="width:50px"></td>' +
      '<td class="td-calc"><input type="text" id="srv-iva-e-' + idx + '" readonly class="bold-blue" style="width:60px"></td>' +
      '<td class="td-calc"><input type="text" id="srv-tot-' + idx + '" readonly class="bold-blue" style="width:70px"></td>' +
      '<td style="text-align:center"><input type="checkbox" id="srv-osp-' + idx + '"></td>' +
      '<td style="text-align:center"><input type="checkbox" id="srv-cli-' + idx + '"></td>' +
      '<td style="text-align:center"><input type="checkbox" id="srv-pro-' + idx + '"></td>' +
      '<td style="text-align:center"><input type="checkbox" id="srv-n-flag-' + idx + '"></td>' +
      '<td style="text-align:center"><input type="checkbox" id="srv-i-' + idx + '"></td>' +
      '<td><input type="number" id="srv-ft-p-' + idx + '" step="0.01" placeholder="%" style="width:50px"></td>' +
      '<td><input type="number" id="srv-ft-e-' + idx + '" step="0.01" placeholder="€" style="width:60px"></td>' +
      '<td style="text-align:center"><input type="checkbox" id="srv-ft-' + idx + '"></td>' +
      '<td style="text-align:center"><input type="checkbox" id="srv-nf2-' + idx + '"></td>' +
      '<td style="text-align:center"><input type="checkbox" id="srv-osp2-' + idx + '"></td>' +
      '<td style="text-align:center"><input type="checkbox" id="srv-cli2-' + idx + '"></td>' +
      '<td><button class="btn btn-ghost" style="height:24px;font-size:10px;padding:0 6px" onclick="MSK_Prenotazioni._removeSrv(' + idx + ')">✕</button></td>';

    /* inserisci prima della riga totale */
    var totRow = tbody.querySelector('tr:last-child');
    tbody.insertBefore(tr, totRow);
  }

  function _removeSrv(idx) {
    var tr = document.getElementById('srv-row-' + idx);
    if (tr) tr.remove();
    _calcSrvGranTot();
  }

  function _inserisciObbligatori() {
    alert('Funzione "Inserisci Servizi e Extra Obbligatori" — da collegare ai dati Tariffario.');
  }

  /* ================================================================
     FUNZIONI STUB (da implementare con moduli futuri)
  ================================================================ */
  function _sceltaImmobile()      { alert('Apertura selezione immobile disponibile.'); }
  function _vediImmobile()        { alert('Visualizza scheda immobile.'); }
  function _checkDisponibilita()  { alert('Controllo disponibilità immobile.'); }
  function _vediDettagliInterni() { alert('Dettagli interni immobile.'); }
  function _pulizie()             { alert('Gestione pulizie.'); }
  function _lavanderia()          { alert('Gestione lavanderia.'); }
  function _stampa()              { window.print(); }
  function _cancella()            {
    if (!_editId) return;
    if (confirm('Annullare questa prenotazione?')) {
      _setStato('Annullata');
      salva();
    }
  }
  function _copiaParziale()       { alert('Copia parziale — scegli i campi da copiare.'); }
  function _copiaTutto() {
    if (!_editId) return;
    var src = _prenotazioni.find(function(p){return p.id===_editId;});
    if (!src) return;
    var copia = JSON.parse(JSON.stringify(src));
    delete copia.id;
    copia.numero_prenotazione = '';
    copia.data_prenotazione   = _today();
    var newId = _prenotazioni.length > 0 ? Math.max.apply(null, _prenotazioni.map(function(p){return p.id;})) + 1 : 1;
    copia.id = newId;
    _prenotazioni.push(copia);
    TONIO_Storage.save('prenotazioni', _prenotazioni);
    _editId = newId;
    _renderMaschera();
  }

  /* ================================================================
     SET STATO
  ================================================================ */
  function _setStato(stato) {
    var el = document.getElementById('pre-stato');
    if (el) el.value = stato;
    ['Aperta','Confermata','Annullata'].forEach(function(s) {
      var key = s === 'Aperta' ? 'aperta' : s === 'Confermata' ? 'conf' : 'ann';
      var badge = document.getElementById('badge-' + key);
      if (!badge) return;
      badge.className = (s === stato)
        ? (s === 'Confermata' ? 'pre-badge-conf' : s === 'Annullata' ? 'pre-badge-ann' : 'pre-badge-neu')
        : 'pre-badge-neu';
    });
  }

  /* ================================================================
     CALCOLO NOTTI REAL-TIME
  ================================================================ */
  function aggiornaNotti() {
    var dal   = (document.getElementById('pre-dal')   || {}).value || '';
    var al    = (document.getElementById('pre-al')    || {}).value || '';
    var notti = document.getElementById('pre-notti');
    if (notti) notti.value = _calcolaNotti(dal, al);
  }
  function aggiornaNottiR() {
    var dal   = (document.getElementById('pre-dal-rich') || {}).value || '';
    var al    = (document.getElementById('pre-al-rich')  || {}).value || '';
    var notti = document.getElementById('pre-notti-rich');
    if (notti) notti.value = _calcolaNotti(dal, al);
  }

  /* ================================================================
     HELPERS
  ================================================================ */
  function _today() {
    return new Date().toISOString().substring(0,10);
  }

  function _readServizi() {
    var servizi = [];
    var i = 0;
    while (true) {
      var el = document.getElementById('srv-descr-' + i);
      if (!el) break;
      function v(id) { var e=document.getElementById(id); return e?e.value:''; }
      function cb(id){ var e=document.getElementById(id); return !!(e&&e.checked); }
      servizi.push({
        descr:       v('srv-descr-'  + i),
        um:          v('srv-um-'     + i),
        imp:         parseFloat(v('srv-imp-'    + i)) || 0,
        dal:         v('srv-dal-'    + i),
        al:          v('srv-al-'     + i),
        n:           parseFloat(v('srv-n-'      + i)) || 0,
        imponibile:  parseFloat(v('srv-impon-'  + i)) || 0,
        sconto_p:    parseFloat(v('srv-sc-p-'   + i)) || 0,
        sconto_e:    parseFloat(v('srv-sc-e-'   + i)) || 0,
        imp_scontato:parseFloat(v('srv-scontato-'+i)) || 0,
        iva_p:       parseFloat(v('srv-iva-p-'  + i)) || 0,
        iva_e:       parseFloat(v('srv-iva-e-'  + i)) || 0,
        totale:      parseFloat(v('srv-tot-'    + i)) || 0,
        osp:         cb('srv-osp-'    + i),
        cli:         cb('srv-cli-'    + i),
        pro:         cb('srv-pro-'    + i),
        nf:          cb('srv-n-flag-' + i),
        i:           cb('srv-i-'      + i),
        ft_p:        parseFloat(v('srv-ft-p-'   + i)) || 0,
        ft_e:        parseFloat(v('srv-ft-e-'   + i)) || 0,
        ft:          cb('srv-ft-'     + i),
        nf2:         cb('srv-nf2-'    + i),
        osp2:        cb('srv-osp2-'   + i),
        cli2:        cb('srv-cli2-'   + i),
      });
      i++;
    }
    return servizi;
  }

  function _readCauzione() {
    function v(id) { var e=document.getElementById(id); return e?e.value:''; }
    function cb(id){ var e=document.getElementById(id); return !!(e&&e.checked); }
    return {
      in_custodia:   cb('cau-custodia'),
      restituita:    cb('cau-restituita'),
      trattenuta:    cb('cau-trattenuta'),
      imp_stampa:    parseFloat(v('cau-imp-stampa')) || 0,
      dt_stampa:     v('cau-dt-stampa'),
      imp_custodia:  parseFloat(v('cau-imp-cust'))  || 0,
      dt_custodia:   v('cau-dt-cust'),
      imp_restituita:parseFloat(v('cau-imp-rest'))  || 0,
      dt_restituita: v('cau-dt-rest'),
      imp_trattenuta:parseFloat(v('cau-imp-tratt')) || 0,
      dt_trattenuta: v('cau-dt-tratt'),
      motivo:        v('cau-motivo'),
    };
  }

  function _readPagamenti(prefix, maxRows) {
    var rows = [];
    for (var i = 0; i < maxRows; i++) {
      var ep = document.getElementById(prefix + '-caus-' + i);
      if (!ep) break;
      function v(id) { var e=document.getElementById(id); return e?e.value:''; }
      function cb(id){ var e=document.getElementById(id); return !!(e&&e.checked); }
      rows.push({
        causale:      v(prefix + '-caus-'   + i),
        perc:         parseFloat(v(prefix + '-perc-'   + i)) || 0,
        importo:      parseFloat(v(prefix + '-imp-'    + i)) || 0,
        mod_pag:      v(prefix + '-mod-'    + i),
        entro:        v(prefix + '-entro-'  + i),
        pagata:       v(prefix + '-pag-'    + i),
        incassato:    parseFloat(v(prefix + '-inc-'    + i)) || 0,
        da_incassare: parseFloat(v(prefix + '-dainc-'  + i)) || 0,
        ft:           cb(prefix + '-ft-'    + i),
        nf:           cb(prefix + '-nf-'    + i),
        num_doc:      v(prefix + '-numdoc-' + i),
        dat_doc:      v(prefix + '-datdoc-' + i),
      });
    }
    return rows;
  }

  /* ================================================================
     SALVA
  ================================================================ */
  function salva() {
    function v(id) { var e=document.getElementById(id); return e?(e.value||''):''; }

    var dal = v('pre-dal');
    var al  = v('pre-al');

    if (dal && al && new Date(al) <= new Date(dal)) {
      alert('⚠️ La data Check-Out deve essere successiva al Check-In.');
      return;
    }

    var numero = v('pre-numero') || _nuovoNumero();

    var data = {
      numero_prenotazione:  numero,
      data_prenotazione:    v('pre-data'),
      protocollo:           v('pre-protocollo'),
      redatto:              v('pre-redatto'),
      cliente_id:           v('pre-cliente')    ? parseInt(v('pre-cliente'),10)    : null,
      contatto:             v('pre-contatto'),
      telefono:             v('pre-telefono'),
      mail:                 v('pre-mail'),
      rif_richiesta:        v('pre-rif-rich'),
      rif_gruppo:           v('pre-rif-gruppo'),
      preventivo_num:       v('pre-prev-num'),
      stato:                v('pre-stato') || 'Aperta',
      /* Soggiorno richiesto */
      dal_richiesto:        v('pre-dal-rich'),
      ora_dal_richiesto:    v('pre-ora-dal-rich'),
      al_richiesto:         v('pre-al-rich'),
      ora_al_richiesto:     v('pre-ora-al-rich'),
      notti_richieste:      parseInt(v('pre-notti-rich'),10) || 0,
      sp_richiesto_id:      v('pre-sp-rich')    ? parseInt(v('pre-sp-rich'),10)    : null,
      prod_richiesto_id:    v('pre-prod-rich')  ? parseInt(v('pre-prod-rich'),10)  : null,
      via_richiesto_id:     v('pre-via-rich')   ? parseInt(v('pre-via-rich'),10)   : null,
      tipo_richiesto_id:    v('pre-tipo-rich')  ? parseInt(v('pre-tipo-rich'),10)  : null,
      posti_richiesti:      parseInt(v('pre-posti-rich'),10) || 0,
      piano_richiesto_id:   v('pre-piano-rich') ? parseInt(v('pre-piano-rich'),10) : null,
      vista_richiesta:      v('pre-vista-rich'),
      /* Soggiorno confermato */
      dal:                  dal,
      ora_dal:              v('pre-ora-dal'),
      al:                   al,
      ora_al:               v('pre-ora-al'),
      notti:                parseInt(v('pre-notti'),10) || 0,
      super_prodotto_id:    v('pre-superprod')  ? parseInt(v('pre-superprod'),10)  : null,
      prodotto_id:          v('pre-prod')       ? parseInt(v('pre-prod'),10)       : null,
      via_immobile_id:      v('pre-via')        ? parseInt(v('pre-via'),10)        : null,
      tipo_immobile_id:     v('pre-tipo-imm')   ? parseInt(v('pre-tipo-imm'),10)   : null,
      posti_letto:          parseInt(v('pre-posti'),10) || 0,
      piano_id:             v('pre-piano')      ? parseInt(v('pre-piano'),10)      : null,
      vista:                v('pre-vista'),
      immobile_assegnato:   v('pre-immobile-ass'),
      /* Ospite */
      ospite_id:            v('pre-ospite')     ? parseInt(v('pre-ospite'),10)     : null,
      dettagli_ospite:      v('pre-dettagli-osp'),
      tot_ospiti:           parseInt(v('pre-tot-osp'),10)   || 0,
      adulti:               parseInt(v('pre-adulti'),10)    || 0,
      bambini:              parseInt(v('pre-chd'),10)       || 0,
      infants:              parseInt(v('pre-inf'),10)       || 0,
      animali:              parseInt(v('pre-animali'),10)   || 0,
      protocollo_ospite:    v('pre-prot-osp'),
      cellulare_ospite:     v('pre-cell-osp'),
      tipologia_ospite:     v('pre-tip-osp'),
      note_responsabile:    v('pre-note-resp'),
      note_cliente:         v('pre-note-cli'),
      note_ospite:          v('pre-note-osp'),
      note_collaboratori:   v('pre-note-col'),
      note_immobile:        v('pre-note-imm'),
      /* Servizi */
      servizi:              _readServizi(),
      /* Cauzione */
      cauzione:             _readCauzione(),
      /* Pagamenti */
      pagamenti_ospite:     _readPagamenti('pag-osp', 10),
      pagamenti_cliente:    _readPagamenti('pag-cli', 10),
      attivo:               true
    };

    if (_editId === null) {
      var newId = _prenotazioni.length > 0 ? Math.max.apply(null, _prenotazioni.map(function(p){return p.id;})) + 1 : 1;
      data.id   = newId;
      _prenotazioni.push(data);
      _editId   = newId;
    } else {
      var idx = _prenotazioni.findIndex(function(p){return p.id===_editId;});
      if (idx !== -1) { data.id = _editId; _prenotazioni[idx] = data; }
    }

    TONIO_Storage.save('prenotazioni', _prenotazioni);
    alert('✅ Prenotazione salvata correttamente.');
  }

  /* ================================================================
     ELIMINA
  ================================================================ */
  function elimina(id) {
    var rec = _prenotazioni.find(function(p){return p.id===id;});
    if (!rec) return;
    if (!confirm('Eliminare la prenotazione "' + (rec.numero_prenotazione||id) + '"?\nL\'operazione non può essere annullata.')) return;
    _prenotazioni = _prenotazioni.filter(function(p){return p.id!==id;});
    if (_editId === id) _editId = null;
    TONIO_Storage.save('prenotazioni', _prenotazioni);
    _tornaLista();
  }

  /* ================================================================
     TORNA LISTA
  ================================================================ */
  function _tornaLista() {
    _editId = null;
    _renderListPage();
  }

  /* ================================================================
     LIVE SEARCH
  ================================================================ */
  function filterList() {
    var q       = ((document.getElementById('pre-search')||{}).value||'').toLowerCase();
    var clienti = _getClienti();
    var ospiti  = _getOspiti();
    var filtered = _prenotazioni.filter(function(p){
      var nc = _nomeByIdAnag(clienti, p.cliente_id).toLowerCase();
      var no = _nomeByIdAnag(ospiti,  p.ospite_id).toLowerCase();
      var num = (p.numero_prenotazione||'').toLowerCase();
      return nc.indexOf(q)!==-1||no.indexOf(q)!==-1||num.indexOf(q)!==-1;
    });
    _renderRows(filtered);
    _aggiornaCount(filtered.length);
  }

  /* ================================================================
     FILTRI
  ================================================================ */
  function toggleFiltri() {
    _filtriAperti = !_filtriAperti;
    var p = document.getElementById('pre-filtri-panel');
    if (p) p.style.display = _filtriAperti ? '' : 'none';
  }

  function applyFiltri() {
    var anag    = ((document.getElementById('flt-anag')     ||{}).value||'').toLowerCase();
    var checkin =  (document.getElementById('flt-checkin')  ||{}).value||'';
    var checkout=  (document.getElementById('flt-checkout') ||{}).value||'';
    var numero  = ((document.getElementById('flt-numero')   ||{}).value||'').toLowerCase();
    var spId    =  (document.getElementById('flt-superprod')||{}).value||'';
    var prodId  =  (document.getElementById('flt-prod')     ||{}).value||'';
    var immId   =  (document.getElementById('flt-immobile') ||{}).value||'';

    var clienti = _getClienti();
    var ospiti  = _getOspiti();

    var filtered = _prenotazioni.filter(function(p){
      var nc = _nomeByIdAnag(clienti, p.cliente_id).toLowerCase();
      var no = _nomeByIdAnag(ospiti,  p.ospite_id).toLowerCase();
      if (anag    && nc.indexOf(anag)===-1 && no.indexOf(anag)===-1) return false;
      if (checkin  && p.dal  && p.dal.substring(0,10)  < checkin)   return false;
      if (checkout && p.al   && p.al.substring(0,10)   > checkout)  return false;
      if (numero) { var n=(p.numero_prenotazione||'').toLowerCase(); if(n.indexOf(numero)===-1) return false; }
      if (spId   && String(p.super_prodotto_id) !== spId)   return false;
      if (prodId && String(p.prodotto_id)        !== prodId) return false;
      if (immId  && String(p.via_immobile_id)    !== immId)  return false;
      return true;
    });
    _renderRows(filtered);
    _aggiornaCount(filtered.length);
  }

  function resetFiltri() {
    ['flt-anag','flt-checkin','flt-checkout','flt-numero','flt-superprod','flt-prod','flt-immobile'].forEach(function(id){
      var el=document.getElementById(id); if(el) el.value='';
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
    apriMaschera:       apriMaschera,
    salva:              salva,
    elimina:            elimina,
    filterList:         filterList,
    aggiornaNotti:      aggiornaNotti,
    aggiornaNottiR:     aggiornaNottiR,
    toggleFiltri:       toggleFiltri,
    applyFiltri:        applyFiltri,
    resetFiltri:        resetFiltri,
    /* esposti per onclick inline */
    _calcSrv:           _calcSrv,
    _calcPag:           _calcPag,
    _addSrv:            _addSrv,
    _removeSrv:         _removeSrv,
    _inserisciObbligatori: _inserisciObbligatori,
    _setStato:          _setStato,
    _sceltaImmobile:    _sceltaImmobile,
    _vediImmobile:      _vediImmobile,
    _checkDisponibilita: _checkDisponibilita,
    _vediDettagliInterni: _vediDettagliInterni,
    _pulizie:           _pulizie,
    _lavanderia:        _lavanderia,
    _stampa:            _stampa,
    _cancella:          _cancella,
    _copiaParziale:     _copiaParziale,
    _copiaTutto:        _copiaTutto,
    _tornaLista:        _tornaLista,
  };

})();
