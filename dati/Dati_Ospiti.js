/* ================================================================
   TONIO — Dati_Ospiti.js
   ⚠️  QUESTO FILE CONTIENE SOLO I TUOI DATI OSPITI.
   NON modificare quando si aggiorna la struttura.
   Aggiungi / modifica ospiti qui in totale sicurezza.
   ================================================================ */

var TONIO_OSPITI_TIPOLOGIE = [
  { id: 1, ordine: 1, nome: 'Privato',     colore: '#4f8ef7' },
  { id: 2, ordine: 2, nome: 'Famiglia',    colore: '#34d399' },
  { id: 3, ordine: 3, nome: 'Coppia',      colore: '#fbbf24' },
  { id: 4, ordine: 4, nome: 'Gruppo',      colore: '#a78bfa' },
  { id: 5, ordine: 5, nome: 'Business',    colore: '#f97316' },
];

var TONIO_OSPITI_STATI = [
  { id: 1, ordine: 1, nome: 'Attivo',      colore: '#34d399' },
  { id: 2, ordine: 2, nome: 'Potenziale',  colore: '#fbbf24' },
  { id: 3, ordine: 3, nome: 'Inattivo',    colore: '#9aa3b8' },
  { id: 4, ordine: 4, nome: 'Bloccato',    colore: '#f87171' },
];

var TONIO_OSPITI = [
  {
    id: 1,
    attivo: true,
    nominativo:   'Ferrari Luca',
    tipologia:    'Privato',
    stato:        'Attivo',
    note:         'Ospite abituale, preferisce camera vista mare',
    /* Contatti */
    cellulare:    '+39 345 1234567',
    cellulare2:   '',
    telefono:     '',
    telefono2:    '',
    mail:         'luca.ferrari@email.it',
    mail2:        '',
    pec:          '',
    web:          '',
    /* Indirizzo */
    via:          'Via Garibaldi 5',
    citta:        'Milano',
    cap:          '20100',
    prov:         'MI',
    paese:        'Italia',
    /* Dati fiscali */
    fattStessiDati:   true,
    fatt_nominativo:  'Ferrari Luca',
    cf:               'FRRLCU85M10F205Z',
    piva:             '',
    sdi:              '',
    fatt_cell:        '+39 345 1234567',
    fatt_tel:         '',
    fatt_mail:        'luca.ferrari@email.it',
    fatt_pec:         '',
    fatt_via:         'Via Garibaldi 5',
    fatt_citta:       'Milano',
    fatt_cap:         '20100',
    fatt_prov:        'MI',
    fatt_paese:       'Italia',
    firmatario:       'Ferrari Luca',
    firmatario_citta: 'Milano',
    firmatario_data:  '1985-08-10',
    firmatario_cf:    'FRRLCU85M10F205Z',
    /* Dati bancari */
    intestatario: '',
    banca:        '',
    iban:         '',
    bic:          '',
    /* Sub-record */
    annotazioni: [
      { destinatario: 'Reception', data: '2026-01-15', prenotazione: 'PRE-001', ospite: 'Ferrari Luca', descrizione: 'Prima prenotazione gennaio 2026' }
    ]
  }
];
