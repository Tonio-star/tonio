/* ================================================================
   TONIO — Msk_Immobili.js  |  Modulo Immobili
   v1.0 — Lista con filtri, maschere lookup: Prodotti, SuperProdotti,
           Tipo, Piani, Anagrafica Immobile
   ================================================================ */

var MSK_Immobili = (function() {

  var prodotti      = [];
  var superprodotti = [];
  var tipi          = [];
  var piani         = [];
  var immobili      = [];

  /* Stato filtri lista */
  var _filtro = { prodotto: '', superprodotto: '', tipo: '', immobile: '' };

  /* Stato maschera anagrafica */
  var currentId = null;
  var editMode  = false;

  /* Vista corrente: 'lista' | 'anagrafica' */
  var _vista = 'lista';

  /* ---- INIT ---- */
  function init() {
    prodotti      = (window.TONIO_IMMOBILI_PRODOTTI      || []).map(function(x){ return Object.assign({},x); });
    superprodotti = (window.TONIO_IMMOBILI_SUPERPRODOTTI || []).map(function(x){ return Object.assign({},x); });
    tipi          = (window.TONIO_IMMOBILI_TIPI          || []).map(function(x){ return Object.assign({},x); });
    piani         = (window.TONIO_IMMOBILI_PIANI         || []).map(function(x){ return Object.assign({},x); });
    immobili      = (window.TONIO_IMMOBILI               || []).map(function(x){ return Object.assign({},x,{
      attivo: x.attivo !== undefined ? x.attivo : true
    }); });
    renderLista();
  }

  /* ================================================================
     LISTA
     ================================================================ */
  function renderLista() {
    _vista = 'lista';
    var page = document.getElementById('page-immobili');
    if (!page) return;

    /* Opzioni select filtri */
    function optsFrom(arr, valField, current) {
      var h = '<option value="">\u2014 Tutti \u2014</option>';
      arr.slice().sort(function(a,b){return a.ordine-b.ordine;}).forEach(function(x){
        h += '<option value="'+TONIO_escapeHtml(x.nome)+'"'+(current===x.nome?' selected':'')+'>'+TONIO_escapeHtml(x.nome)+'</option>';
      });
      return h;
    }

    /* Filtraggio */
    var filtered = immobili.filter(function(im) {
      if (_filtro.prodotto      && im.prodotto      !== _filtro.prodotto)      return false;
      if (_filtro.superprodotto && im.superprodotto !== _filtro.superprodotto) return false;
      if (_filtro.tipo          && im.tipo          !== _filtro.tipo)          return false;
      if (_filtro.immobile) {
        var q = _filtro.immobile.toLowerCase();
        if ((im.immobile||'').toLowerCase().indexOf(q) === -1 &&
            (im.comune||'').toLowerCase().indexOf(q)   === -1 &&
            (im.via||'').toLowerCase().indexOf(q)      === -1) return false;
      }
      return true;
    });

    /* Righe tabella */
    var rows = '';
    if (filtered.length === 0) {
      rows = '<tr><td colspan="13"><div class="empty-state">'
           + '<div class="es-icon">&#127968;</div>'
           + '<h3>Nessun immobile trovato</h3>'
           + '<p>Modifica i filtri o clicca &quot;+ Nuovo Immobile&quot; per iniziare</p>'
           + '</div></td></tr>';
    } else {
      filtered.slice().sort(function(a,b){return (a.ordine||0)-(b.ordine||0);}).forEach(function(im) {
        var opacity = im.attivo === false ? 'opacity:0.55' : '';
        var sel     = im.id === currentId ? 'selected' : '';

        var prodBadge  = im.prodotto      ? TONIO_makeBadge(im.prodotto,      _prodColore(im.prodotto))           : '&mdash;';
        var superBadge = im.superprodotto ? TONIO_makeBadge(im.superprodotto,  _superColore(im.superprodotto))     : '&mdash;';
        var tipoBadge  = im.tipo          ? TONIO_makeBadge(im.tipo,           _tipoColore(im.tipo))               : '&mdash;';

        rows += '<tr class="'+sel+'" style="'+opacity+'" onclick="MSK_Immobili.apriImmobile('+im.id+')">'
          + '<td style="text-align:center;color:var(--text3);font-size:12px">' + (im.ordine||'&mdash;') + '</td>'
          + '<td><div class="td-name">' + TONIO_escapeHtml(im.immobile||'') + '</div></td>'
          + '<td style="text-align:center">' + (im.posti_letto||'&mdash;') + '</td>'
          + '<td>' + tipoBadge + '</td>'
          + '<td>' + TONIO_escapeHtml(im.piano||'&mdash;') + '</td>'
          + '<td>' + prodBadge + '</td>'
          + '<td>' + superBadge + '</td>'
          + '<td>' + TONIO_escapeHtml(im.via||'&mdash;') + '</td>'
          + '<td>' + TONIO_escapeHtml(im.numero||'') + '</td>'
          + '<td>' + TONIO_escapeHtml(im.cap||'') + '</td>'
          + '<td>' + TONIO_escapeHtml(im.comune||'') + '</td>'
          + '<td>' + TONIO_escapeHtml(im.provincia||'') + '</td>'
          + '<td><button class="btn btn-danger btn-sm" onclick="event.stopPropagation();MSK_Immobili.eliminaImmobile('+im.id+')" title="Elimina">&#128465;</button></td>'
          + '</tr>';
      });
    }

    page.innerHTML =
        '<div class="panel">'

      /* ===== HEADER PANEL ===== */
      + '<div class="panel-header">'
      +   '<div class="panel-header-icon">&#127968;</div>'
      +   '<div>'
      +     '<div class="panel-header-title">Immobili</div>'
      +     '<div class="panel-header-sub">' + immobili.length + ' immobil' + (immobili.length === 1 ? 'e' : 'i') + '</div>'
      +   '</div>'
      +   '<div class="panel-header-actions">'
      +     '<button class="btn btn-sm" style="background:#e0f2fe;color:#0369a1;border:1px solid #bae6fd" onclick="MSK_Immobili.openModalProdotti()">&#127981; Prodotti</button>'
      +     '<button class="btn btn-sm" style="background:#fdf4ff;color:#7e22ce;border:1px solid #e9d5ff" onclick="MSK_Immobili.openModalSuperProdotti()">&#11088; Super Prodotti</button>'
      +     '<button class="btn btn-sm" style="background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0" onclick="MSK_Immobili.openModalTipi()">&#127981; Tipo</button>'
      +     '<button class="btn btn-sm" style="background:#fff7ed;color:#c2410c;border:1px solid #fed7aa" onclick="MSK_Immobili.openModalPiani()">&#127970; Piano</button>'
      +     '<button class="btn btn-primary btn-sm" onclick="MSK_Immobili.nuovoImmobile()">&#65291; Anagrafica Immobile</button>'
      +   '</div>'
      + '</div>'

      /* ===== FILTRI ===== */
      + '<div style="padding:12px 20px;background:var(--bg2,#f8fafc);border-bottom:1px solid var(--border);display:flex;flex-wrap:wrap;gap:10px;align-items:center">'
      +   '<span style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text3);letter-spacing:1px">&#128269; Filtri</span>'
      +   '<select class="form-select" style="min-width:140px;max-width:180px" onchange="MSK_Immobili._setFiltro(\'prodotto\',this.value)">'
      +     optsFrom(prodotti, 'nome', _filtro.prodotto)
      +   '</select>'
      +   '<select class="form-select" style="min-width:140px;max-width:180px" onchange="MSK_Immobili._setFiltro(\'superprodotto\',this.value)">'
      +     optsFrom(superprodotti, 'nome', _filtro.superprodotto)
      +   '</select>'
      +   '<select class="form-select" style="min-width:140px;max-width:180px" onchange="MSK_Immobili._setFiltro(\'tipo\',this.value)">'
      +     optsFrom(tipi, 'nome', _filtro.tipo)
      +   '</select>'
      +   '<input class="search-input" style="min-width:180px;max-width:260px" placeholder="&#128269; Cerca immobile, comune, via\u2026" value="'+TONIO_escapeHtml(_filtro.immobile)+'" oninput="MSK_Immobili._setFiltro(\'immobile\',this.value)">'
      +   (_filtro.prodotto||_filtro.superprodotto||_filtro.tipo||_filtro.immobile
      +     ? '<button class="btn btn-ghost btn-sm" onclick="MSK_Immobili._resetFiltri()">\u00d7 Reset filtri</button>'
      +     : '')
      + '</div>'

      /* ===== TABELLA ===== */
      + '<div class="tbl-wrap">'
      +   '<table>'
      +     '<thead><tr>'
      +       '<th style="width:50px">Ord.</th>'
      +       '<th>Immobile</th>'
      +       '<th style="width:70px;text-align:center">Posti Letto</th>'
      +       '<th>Tipo</th>'
      +       '<th>Piano</th>'
      +       '<th>Prodotto</th>'
      +       '<th>Super Prodotto</th>'
      +       '<th>Via</th>'
      +       '<th style="width:50px">N°</th>'
      +       '<th style="width:70px">CAP</th>'
      +       '<th>Comune</th>'
      +       '<th style="width:50px">Prov.</th>'
      +       '<th style="width:50px"></th>'
      +     '</tr></thead>'
      +     '<tbody>' + rows + '</tbody>'
      +   '</table>'
      + '</div>'
      + '</div>';
  }

  function _setFiltro(campo, valore) {
    _filtro[campo] = valore;
    renderLista();
  }

  function _resetFiltri() {
    _filtro = { prodotto: '', superprodotto: '', tipo: '', immobile: '' };
    renderLista();
  }

  /* ================================================================
     ANAGRAFICA IMMOBILE
     ================================================================ */
  function renderAnagrafica(im, mode) {
    _vista = 'anagrafica';
    var page = document.getElementById('page-immobili');
    if (!page) return;
    editMode = mode || false;

    var isNew = !im;
    var titolo = im ? TONIO_escapeHtml(im.immobile||'Immobile') : 'Nuovo Immobile';
    var v   = function(f){ return im ? TONIO_escapeHtml(String(im[f]||'')) : ''; };
    var ro  = isNew ? '' : (editMode ? '' : ' readonly');
    var dis = isNew ? '' : (editMode ? '' : ' disabled');

    /* Opzioni select */
    function buildOpts(arr, currentVal) {
      var h = '<option value="">\u2014 Seleziona \u2014</option>';
      arr.slice().sort(function(a,b){return a.ordine-b.ordine;}).forEach(function(x){
        h += '<option value="'+TONIO_escapeHtml(x.nome)+'"'+(im&&im[currentVal]===x.nome?' selected':'')+'>'+TONIO_escapeHtml(x.nome)+'</option>';
      });
      return h;
    }
    var tipoOpts  = buildOpts(tipi,  'tipo');
    var pianoOpts = buildOpts(piani, 'piano');
    var prodOpts  = buildOpts(prodotti, 'prodotto');
    var superOpts = buildOpts(superprodotti, 'superprodotto');

    var btnEdit     = !isNew && !editMode
      ? '<button class="btn btn-edit btn-sm" onclick="MSK_Immobili._setEditMode(true)">&#9998; Modifica</button>' : '';
    var btnSalva    = isNew || editMode
      ? '<button class="btn btn-primary btn-sm" onclick="MSK_Immobili.salva()">&#128190; Salva</button>' : '';
    var btnAnnulla  = !isNew && editMode
      ? '<button class="btn btn-ghost btn-sm" onclick="MSK_Immobili._setEditMode(false)">&times; Annulla</button>' : '';
    var btnDisattiva = !isNew
      ? (im && im.attivo === false
          ? '<button class="btn btn-success btn-sm" onclick="MSK_Immobili.toggleAttivo()">&#9989; Riattiva</button>'
          : '<button class="btn btn-warning btn-sm" onclick="MSK_Immobili.toggleAttivo()">&#9208; Disattiva</button>')
      : '';
    var btnElimina = !isNew
      ? '<button class="btn btn-danger btn-sm" onclick="MSK_Immobili.eliminaCorrente()">&#128465; Elimina</button>' : '';

    var disattivoBar = (im && im.attivo === false)
      ? '<div style="background:rgba(100,116,139,0.15);border-bottom:1px solid rgba(100,116,139,0.2);padding:8px 20px;font-size:12px;color:#94a3b8;display:flex;align-items:center;gap:8px">&#9208; Questo immobile \u00e8 disattivato</div>'
      : '';

    page.innerHTML =
        '<div class="panel">'

      + '<div class="panel-header" style="background:linear-gradient(135deg,#0c1a2e 0%,#1a3a5c 50%,#0c1a2e 100%);border-bottom:1px solid rgba(79,142,247,0.2);">'
      +   '<button class="btn btn-ghost btn-sm" onclick="MSK_Immobili.tornaLista()" style="background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.2);color:#fff;flex-shrink:0">\u2190 Lista</button>'
      +   '<div class="panel-header-icon" style="background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.2)">&#127968;</div>'
      +   '<div style="min-width:0;flex:1">'
      +     '<div class="panel-header-title" id="scheda-imm-nome" style="color:#fff;font-size:19px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+titolo+'</div>'
      +     '<div class="panel-header-sub" style="color:rgba(255,255,255,0.55)">Scheda immobile</div>'
      +   '</div>'
      +   '<div class="panel-header-actions" style="flex-wrap:wrap;gap:6px">'
      +     btnEdit + btnAnnulla + btnDisattiva + btnElimina + btnSalva
      +   '</div>'
      + '</div>'

      + disattivoBar

      /* ===== FORM CAMPI ===== */
      + '<div style="padding:20px 20px 0">'
      +   '<div class="form-group">'
      +     '<label class="form-label">Nome Immobile *</label>'
      +     '<input class="form-input" id="fim-immobile" value="'+v('immobile')+'" placeholder="Es. Appartamento Roma Centro"'+ro+' oninput="MSK_Immobili._aggiornaHeader()">'
      +   '</div>'
      + '</div>'

      + '<div class="form-grid form-grid-2" style="padding:12px 20px 0">'
      +   '<div class="form-group"><label class="form-label">Posti Letto</label>'
      +     '<input class="form-input" type="number" min="1" id="fim-posti-letto" value="'+v('posti_letto')+'" placeholder="Es. 4"'+ro+'></div>'
      +   '<div class="form-group"><label class="form-label">Tipo</label>'
      +     '<select class="form-select" id="fim-tipo"'+dis+'>'+tipoOpts+'</select></div>'
      + '</div>'

      + '<div class="form-grid form-grid-2" style="padding:12px 20px 0">'
      +   '<div class="form-group"><label class="form-label">Piano</label>'
      +     '<select class="form-select" id="fim-piano"'+dis+'>'+pianoOpts+'</select></div>'
      +   '<div class="form-group"><label class="form-label">Ordinamento</label>'
      +     '<input class="form-input" type="number" min="1" id="fim-ordine" value="'+v('ordine')+'" placeholder="Es. 1"'+ro+'></div>'
      + '</div>'

      + '<div class="form-grid form-grid-2" style="padding:12px 20px 0">'
      +   '<div class="form-group"><label class="form-label">Prodotto</label>'
      +     '<select class="form-select" id="fim-prodotto"'+dis+'>'+prodOpts+'</select></div>'
      +   '<div class="form-group"><label class="form-label">Super Prodotto</label>'
      +     '<select class="form-select" id="fim-superprodotto"'+dis+'>'+superOpts+'</select></div>'
      + '</div>'

      + '<div style="padding:16px 20px 4px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text3);border-top:1px solid var(--border);margin-top:16px">&#128205; Indirizzo</div>'

      + '<div class="form-grid form-grid-2" style="padding:8px 20px 0">'
      +   '<div class="form-group"><label class="form-label">Via</label>'
      +     '<input class="form-input" id="fim-via" value="'+v('via')+'" placeholder="Via Roma"'+ro+'></div>'
      +   '<div class="form-group"><label class="form-label">N°</label>'
      +     '<input class="form-input" id="fim-numero" value="'+v('numero')+'" placeholder="1"'+ro+'></div>'
      + '</div>'

      + '<div class="form-grid form-grid-3" style="padding:12px 20px 20px">'
      +   '<div class="form-group"><label class="form-label">CAP</label>'
      +     '<input class="form-input" id="fim-cap" value="'+v('cap')+'" placeholder="00100"'+ro+'></div>'
      +   '<div class="form-group"><label class="form-label">Comune</label>'
      +     '<input class="form-input" id="fim-comune" value="'+v('comune')+'" placeholder="Roma"'+ro+'></div>'
      +   '<div class="form-group"><label class="form-label">Provincia</label>'
      +     '<input class="form-input" id="fim-provincia" value="'+v('provincia')+'" placeholder="RM" maxlength="3"'+ro+'></div>'
      + '</div>'

      + '</div>'; /* /panel */
  }

  function _aggiornaHeader() {
    var v = (document.getElementById('fim-immobile')||{}).value||'Nuovo Immobile';
    var el = document.getElementById('scheda-imm-nome');
    if (el) el.textContent = v;
  }

  /* ================================================================
     AZIONI LISTA / ANAGRAFICA
     ================================================================ */
  function nuovoImmobile() {
    currentId = null;
    renderAnagrafica(null, true);
    TONIO_showPage('immobili');
  }

  function apriImmobile(id) {
    currentId = id;
    var im = immobili.find(function(x){ return x.id === id; });
    if (!im) return;
    renderAnagrafica(im, false);
    TONIO_showPage('immobili');
  }

  function tornaLista() {
    currentId = null;
    editMode  = false;
    renderLista();
    TONIO_showPage('immobili');
  }

  function eliminaImmobile(id) {
    if (!confirm('Eliminare definitivamente questo immobile?\nL\'operazione non pu\u00f2 essere annullata.')) return;
    immobili = immobili.filter(function(x){ return x.id !== id; });
    if (currentId === id) tornaLista(); else renderLista();
  }

  function eliminaCorrente() {
    if (!currentId) return;
    eliminaImmobile(currentId);
  }

  function toggleAttivo() {
    if (!currentId) return;
    var idx = immobili.findIndex(function(x){ return x.id === currentId; });
    if (idx < 0) return;
    immobili[idx].attivo = !(immobili[idx].attivo !== false);
    renderAnagrafica(immobili[idx], editMode);
  }

  function _setEditMode(on) {
    var im = currentId ? immobili.find(function(x){ return x.id === currentId; }) : null;
    renderAnagrafica(im, on);
  }

  /* ================================================================
     SALVA ANAGRAFICA
     ================================================================ */
  function salva() {
    var nom = _val('fim-immobile');
    if (!nom) { alert('Il campo Nome Immobile \u00e8 obbligatorio'); return; }

    var data = {
      immobile:      nom,
      posti_letto:   parseInt(_val('fim-posti-letto'),10) || 0,
      tipo:          _val('fim-tipo'),
      piano:         _val('fim-piano'),
      ordine:        parseInt(_val('fim-ordine'),10) || 0,
      prodotto:      _val('fim-prodotto'),
      superprodotto: _val('fim-superprodotto'),
      via:           _val('fim-via'),
      numero:        _val('fim-numero'),
      cap:           _val('fim-cap'),
      comune:        _val('fim-comune'),
      provincia:     _val('fim-provincia'),
    };

    if (currentId) {
      var idx = immobili.findIndex(function(x){ return x.id === currentId; });
      if (idx > -1) {
        data.attivo = immobili[idx].attivo !== undefined ? immobili[idx].attivo : true;
        immobili[idx] = Object.assign(immobili[idx], data);
      }
    } else {
      var newId = immobili.length > 0 ? Math.max.apply(null, immobili.map(function(x){return x.id;})) + 1 : 1;
      data.id     = newId;
      data.attivo = true;
      immobili.push(data);
      currentId = newId;
    }

    var saved = immobili.find(function(x){ return x.id === currentId; });
    renderAnagrafica(saved, false);

    /* Flash header */
    var ph = document.querySelector('#page-immobili .panel-header');
    if (ph) {
      ph.style.transition = 'background 0.4s';
      ph.style.background = 'linear-gradient(135deg,#0d3c1f 0%,#1a6e3a 50%,#0d3c1f 100%)';
      setTimeout(function(){
        ph.style.background = 'linear-gradient(135deg,#0c1a2e 0%,#1a3a5c 50%,#0c1a2e 100%)';
      }, 900);
    }
  }

  /* ================================================================
     MODAL PRODOTTI
     ================================================================ */
  function openModalProdotti() {
    _renderLookupModal('modal-imm-prodotti', 'imm-prod', prodotti,
      'MSK_Immobili._moveProd', 'MSK_Immobili._delProd', true);
    document.getElementById('modal-imm-prodotti').classList.add('open');
  }
  function _moveProd(idx,dir){ _moveLookup(prodotti,idx,dir); openModalProdotti(); }
  function _delProd(id){ if(!confirm('Eliminare?'))return; prodotti=prodotti.filter(function(x){return x.id!==id;}); openModalProdotti(); }
  function addProdotto(){ var n=_nextId(prodotti); prodotti.push({id:n,ordine:prodotti.length+1,nome:'Nuovo Prodotto',colore:'#4f8ef7',attivo:true}); openModalProdotti(); }
  function saveProdotti(){
    prodotti=prodotti.map(function(t){
      return Object.assign({},t,{
        nome:(document.getElementById('imm-prod-nome-'+t.id)||{}).value||t.nome,
        colore:(document.getElementById('imm-prod-col-'+t.id)||{}).value||t.colore
      });
    });
    document.getElementById('modal-imm-prodotti').classList.remove('open');
  }

  /* ================================================================
     MODAL SUPER PRODOTTI
     ================================================================ */
  function openModalSuperProdotti() {
    _renderLookupModal('modal-imm-superprodotti', 'imm-super', superprodotti,
      'MSK_Immobili._moveSuper', 'MSK_Immobili._delSuper', true);
    document.getElementById('modal-imm-superprodotti').classList.add('open');
  }
  function _moveSuper(idx,dir){ _moveLookup(superprodotti,idx,dir); openModalSuperProdotti(); }
  function _delSuper(id){ if(!confirm('Eliminare?'))return; superprodotti=superprodotti.filter(function(x){return x.id!==id;}); openModalSuperProdotti(); }
  function addSuperProdotto(){ var n=_nextId(superprodotti); superprodotti.push({id:n,ordine:superprodotti.length+1,nome:'Nuovo Super Prodotto',colore:'#a78bfa',attivo:true}); openModalSuperProdotti(); }
  function saveSuperProdotti(){
    superprodotti=superprodotti.map(function(t){
      return Object.assign({},t,{
        nome:(document.getElementById('imm-super-nome-'+t.id)||{}).value||t.nome,
        colore:(document.getElementById('imm-super-col-'+t.id)||{}).value||t.colore
      });
    });
    document.getElementById('modal-imm-superprodotti').classList.remove('open');
  }

  /* ================================================================
     MODAL TIPI
     ================================================================ */
  function openModalTipi() {
    _renderLookupModal('modal-imm-tipi', 'imm-tipo', tipi,
      'MSK_Immobili._moveTipo', 'MSK_Immobili._delTipo', true);
    document.getElementById('modal-imm-tipi').classList.add('open');
  }
  function _moveTipo(idx,dir){ _moveLookup(tipi,idx,dir); openModalTipi(); }
  function _delTipo(id){ if(!confirm('Eliminare?'))return; tipi=tipi.filter(function(x){return x.id!==id;}); openModalTipi(); }
  function addTipo(){ var n=_nextId(tipi); tipi.push({id:n,ordine:tipi.length+1,nome:'Nuovo Tipo',colore:'#34d399',attivo:true}); openModalTipi(); }
  function saveTipi(){
    tipi=tipi.map(function(t){
      return Object.assign({},t,{
        nome:(document.getElementById('imm-tipo-nome-'+t.id)||{}).value||t.nome,
        colore:(document.getElementById('imm-tipo-col-'+t.id)||{}).value||t.colore
      });
    });
    document.getElementById('modal-imm-tipi').classList.remove('open');
  }

  /* ================================================================
     MODAL PIANI  (senza colore)
     ================================================================ */
  function openModalPiani() {
    _renderPianiModal();
    document.getElementById('modal-imm-piani').classList.add('open');
  }
  function _renderPianiModal() {
    var tbody = document.getElementById('imm-piani-tbody');
    if (!tbody) return;
    tbody.innerHTML = piani.slice().sort(function(a,b){return a.ordine-b.ordine;}).map(function(p,i){
      return '<tr>'
        + '<td style="color:var(--text3);font-size:12px;width:30px">'+p.id+'</td>'
        + '<td style="width:72px">'
        +   '<button class="btn btn-ghost btn-sm" onclick="MSK_Immobili._movePiano('+i+',-1)">\u25b2</button> '
        +   '<button class="btn btn-ghost btn-sm" onclick="MSK_Immobili._movePiano('+i+',1)">\u25bc</button>'
        + '</td>'
        + '<td><input class="lookup-input" id="imm-piano-nome-'+p.id+'" value="'+TONIO_escapeHtml(p.nome)+'"></td>'
        + '<td style="width:40px"><button class="btn btn-danger btn-sm" onclick="MSK_Immobili._delPiano('+p.id+')">\u26d4</button></td>'
        + '</tr>';
    }).join('');
  }
  function _movePiano(idx,dir){ _moveLookup(piani,idx,dir); _renderPianiModal(); }
  function _delPiano(id){ if(!confirm('Eliminare?'))return; piani=piani.filter(function(x){return x.id!==id;}); _renderPianiModal(); }
  function addPiano(){ var n=_nextId(piani); piani.push({id:n,ordine:piani.length+1,nome:'Nuovo Piano'}); _renderPianiModal(); }
  function savePiani(){
    piani=piani.map(function(p){
      return Object.assign({},p,{nome:(document.getElementById('imm-piano-nome-'+p.id)||{}).value||p.nome});
    });
    document.getElementById('modal-imm-piani').classList.remove('open');
  }

  /* ================================================================
     HELPER: render modale lookup con colore
     ================================================================ */
  function _renderLookupModal(modalId, prefix, arr, moveFn, delFn, hasColor) {
    var tbody = document.getElementById(prefix+'-tbody');
    if (!tbody) return;
    tbody.innerHTML = arr.slice().sort(function(a,b){return a.ordine-b.ordine;}).map(function(t,i){
      var colorCell = hasColor
        ? '<td style="width:120px"><input type="color" class="color-swatch" id="'+prefix+'-col-'+t.id+'" value="'+(t.colore||'#4f8ef7')+'">'
          + '<span id="'+prefix+'-prev-'+t.id+'" class="badge" style="margin-left:8px;background:'+(t.colore||'#4f8ef7')+'22;color:'+(t.colore||'#4f8ef7')+';border:1px solid '+(t.colore||'#4f8ef7')+'44">'+TONIO_escapeHtml(t.nome)+'</span></td>'
        : '';
      return '<tr>'
        + '<td style="color:var(--text3);font-size:12px;width:30px">'+t.id+'</td>'
        + '<td style="width:72px">'
        +   '<button class="btn btn-ghost btn-sm" onclick="'+moveFn+'('+i+',-1)">\u25b2</button> '
        +   '<button class="btn btn-ghost btn-sm" onclick="'+moveFn+'('+i+',1)">\u25bc</button>'
        + '</td>'
        + '<td><input class="lookup-input" id="'+prefix+'-nome-'+t.id+'" value="'+TONIO_escapeHtml(t.nome)+'"></td>'
        + colorCell
        + '<td style="width:40px"><button class="btn btn-danger btn-sm" onclick="'+delFn+'('+t.id+')">\u26d4</button></td>'
        + '</tr>';
    }).join('');

    if (hasColor) {
      arr.forEach(function(t){
        var col=document.getElementById(prefix+'-col-'+t.id);
        var nom=document.getElementById(prefix+'-nome-'+t.id);
        var prev=document.getElementById(prefix+'-prev-'+t.id);
        if(col) col.addEventListener('input',function(){if(prev){prev.style.background=this.value+'22';prev.style.color=this.value;prev.style.borderColor=this.value+'44';}});
        if(nom) nom.addEventListener('input',function(){if(prev)prev.textContent=this.value;});
      });
    }
  }

  /* ================================================================
     UTILITY
     ================================================================ */
  function _moveLookup(arr, idx, dir) {
    var s = arr.slice().sort(function(a,b){return a.ordine-b.ordine;});
    var ni = idx + dir;
    if (ni < 0 || ni >= s.length) return;
    var t = s[idx].ordine; s[idx].ordine = s[ni].ordine; s[ni].ordine = t;
    /* aggiorna array originale */
    s.forEach(function(item){
      var orig = arr.find(function(x){return x.id===item.id;});
      if (orig) orig.ordine = item.ordine;
    });
  }

  function _nextId(arr) {
    return arr.length > 0 ? Math.max.apply(null, arr.map(function(x){return x.id;})) + 1 : 1;
  }

  function _val(id) {
    var el = document.getElementById(id); return el ? el.value.trim() : '';
  }

  function _prodColore(n)  { var t=prodotti.find(function(x){return x.nome===n;});      return t?t.colore:'#64748b'; }
  function _superColore(n) { var t=superprodotti.find(function(x){return x.nome===n;}); return t?t.colore:'#64748b'; }
  function _tipoColore(n)  { var t=tipi.find(function(x){return x.nome===n;});          return t?t.colore:'#64748b'; }

  /* ===== API PUBBLICA ===== */
  return {
    init: init,
    nuovoImmobile: nuovoImmobile, apriImmobile: apriImmobile,
    tornaLista: tornaLista, eliminaImmobile: eliminaImmobile,
    eliminaCorrente: eliminaCorrente, toggleAttivo: toggleAttivo,
    salva: salva,
    _setEditMode: _setEditMode, _aggiornaHeader: _aggiornaHeader,
    _setFiltro: _setFiltro, _resetFiltri: _resetFiltri,
    /* Modali */
    openModalProdotti: openModalProdotti, openModalSuperProdotti: openModalSuperProdotti,
    openModalTipi: openModalTipi, openModalPiani: openModalPiani,
    addProdotto: addProdotto, saveProdotti: saveProdotti,
    addSuperProdotto: addSuperProdotto, saveSuperProdotti: saveSuperProdotti,
    addTipo: addTipo, saveTipi: saveTipi,
    addPiano: addPiano, savePiani: savePiani,
    _moveProd: _moveProd, _delProd: _delProd,
    _moveSuper: _moveSuper, _delSuper: _delSuper,
    _moveTipo: _moveTipo, _delTipo: _delTipo,
    _movePiano: _movePiano, _delPiano: _delPiano,
  };
})();

document.addEventListener('DOMContentLoaded', function(){ MSK_Immobili.init(); });
