/* ================================================================
   TONIO — Dati_Clienti.js
   ⚠️  QUESTO FILE CONTIENE SOLO I TUOI DATI.
   NON modificare quando si aggiorna la struttura.
   Aggiungi / modifica clienti qui in totale sicurezza.
   ================================================================ */

var TONIO_TIPOLOGIE = [
  { id: 1, ordine: 1, nome: 'Privato',     colore: '#4f8ef7' },
  { id: 2, ordine: 2, nome: 'Azienda',     colore: '#34d399' },
  { id: 3, ordine: 3, nome: 'Agenzia',     colore: '#fbbf24' },
  { id: 4, ordine: 4, nome: 'Istituzione', colore: '#a78bfa' },
];

var TONIO_STATI = [
  { id: 1, ordine: 1, nome: 'Attivo',     colore: '#34d399' },
  { id: 2, ordine: 2, nome: 'Potenziale', colore: '#fbbf24' },
  { id: 3, ordine: 3, nome: 'Inattivo',   colore: '#9aa3b8' },
  { id: 4, ordine: 4, nome: 'Bloccato',   colore: '#f87171' },
];

var TONIO_CLIENTI = [
  {
    id: 1,
    attivo: true,
    nominativo:   'Rossi Mario',
    tipologia:    'Privato',
    stato:        'Attivo',
    note:         'Cliente storico',
    /* Contatti */
    cellulare:    '+39 333 1234567',
    cellulare2:   '',
    telefono:     '',
    telefono2:    '',
    mail:         'mario.rossi@email.it',
    mail2:        '',
    pec:          '',
    web:          '',
    /* Indirizzo */
    via:          'Via Roma 1',
    citta:        'Roma',
    cap:          '00100',
    prov:         'RM',
    paese:        'Italia',
    /* Dati fiscali */
    fattStessiDati:   true,
    fatt_nominativo:  'Rossi Mario',
    cf:               'RSSMRA80A01H501Z',
    piva:             '',
    sdi:              '',
    fatt_cell:        '+39 333 1234567',
    fatt_tel:         '',
    fatt_mail:        'mario.rossi@email.it',
    fatt_pec:         '',
    fatt_via:         'Via Roma 1',
    fatt_citta:       'Roma',
    fatt_cap:         '00100',
    fatt_prov:        'RM',
    fatt_paese:       'Italia',
    firmatario:       'Rossi Mario',
    firmatario_citta: 'Roma',
    firmatario_data:  '1980-01-01',
    firmatario_cf:    'RSSMRA80A01H501Z',
    /* Dati bancari */
    intestatario: '',
    banca:        '',
    iban:         '',
    bic:          '',
    /* Sub-record */
    collaboratori: [
      { ordine: 1, nome: 'Laura Rossi', ruolo: 'Referente', cellulare: '+39 333 9876543', telefono: '', mail: 'laura@email.it', note: 'Contatto principale' }
    ],
    annotazioni: []
  },
  {
    id: 2,
    attivo: true,
    nominativo:   'Bianchi Srl',
    tipologia:    'Azienda',
    stato:        'Potenziale',
    note:         '',
    /* Contatti */
    cellulare:    '',
    cellulare2:   '',
    telefono:     '+39 06 1234567',
    telefono2:    '',
    mail:         'info@bianchi.it',
    mail2:        '',
    pec:          'bianchi@pec.it',
    web:          'https://www.bianchi.it',
    /* Indirizzo */
    via:          'Via Veneto 50',
    citta:        'Roma',
    cap:          '00187',
    prov:         'RM',
    paese:        'Italia',
    /* Dati fiscali */
    fattStessiDati:   true,
    fatt_nominativo:  'Bianchi Srl',
    cf:               '',
    piva:             '01234567890',
    sdi:              'ABCDE12',
    fatt_cell:        '',
    fatt_tel:         '+39 06 1234567',
    fatt_mail:        'info@bianchi.it',
    fatt_pec:         'bianchi@pec.it',
    fatt_via:         'Via Veneto 50',
    fatt_citta:       'Roma',
    fatt_cap:         '00187',
    fatt_prov:        'RM',
    fatt_paese:       'Italia',
    firmatario:       'Bianchi Giovanni',
    firmatario_citta: 'Milano',
    firmatario_data:  '1975-05-15',
    firmatario_cf:    'BNCGNN75E15F205Z',
    /* Dati bancari */
    intestatario: 'Bianchi Srl',
    banca:        'UniCredit',
    iban:         'IT60 X054 2811 1010 0000 0123 456',
    bic:          'UNCRITMM',
    /* Sub-record */
    collaboratori: [
      { ordine: 1, nome: 'Marco Bianchi', ruolo: 'Referente', cellulare: '+39 347 1111111', telefono: '', mail: 'marco@bianchi.it', note: 'CEO' }
    ],
    annotazioni: [
      { destinatario: 'Ufficio Commerciale', data: '2026-02-10', prenotazione: '', ospite: '', descrizione: 'Primo contatto febbraio 2026' }
    ]
  }
];
