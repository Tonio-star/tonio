/* ================================================================
   TONIO — Dati_Clienti.js
   ================================================================
   QUESTO FILE CONTIENE SOLO I TUOI DATI.
   NON modificare questo file quando si aggiorna la struttura.
   Aggiungi/modifica clienti qui senza rischio di perdere nulla.
   ================================================================ */

var TONIO_TIPOLOGIE = [
  { id: 1, ordine: 1, nome: 'Privato',     colore: '#1a6fc4' },
  { id: 2, ordine: 2, nome: 'Azienda',     colore: '#0e9c6a' },
  { id: 3, ordine: 3, nome: 'Agenzia',     colore: '#c47a1a' },
  { id: 4, ordine: 4, nome: 'Istituzione', colore: '#7c3aed' },
];

var TONIO_STATI = [
  { id: 1, ordine: 1, nome: 'Attivo',     colore: '#0e9c6a' },
  { id: 2, ordine: 2, nome: 'Potenziale', colore: '#c47a1a' },
  { id: 3, ordine: 3, nome: 'Inattivo',   colore: '#6b7280' },
  { id: 4, ordine: 4, nome: 'Bloccato',   colore: '#dc2626' },
];

var TONIO_CLIENTI = [
  {
    id: 1,
    nominativo:   'Rossi Mario',
    tipologia:    'Privato',
    stato:        'Attivo',
    cellulare:    '+39 333 1234567',
    telefono:     '',
    mail:         'mario.rossi@email.it',
    web:          '',
    note:         'Cliente storico',
    cf:           'RSSMRA80A01H501Z',
    piva:         '',
    indirizzo:    'Via Roma 1',
    cap:          '00100',
    citta:        'Roma',
    prov:         'RM',
    paese:        'Italia',
    sdi:          '',
    banca:        '',
    iban:         '',
    bic:          '',
    intestatario: '',
    annotazioni:  '',
    collaboratori: [
      {
        ordine:    1,
        nome:      'Laura Rossi',
        ruolo:     'Referente',
        cellulare: '+39 333 9876543',
        telefono:  '',
        mail:      'laura@email.it',
        note:      'Contatto principale'
      }
    ]
  },
  {
    id: 2,
    nominativo:   'Bianchi Srl',
    tipologia:    'Azienda',
    stato:        'Potenziale',
    cellulare:    '',
    telefono:     '+39 06 1234567',
    mail:         'info@bianchi.it',
    web:          'https://www.bianchi.it',
    note:         '',
    cf:           '',
    piva:         '01234567890',
    indirizzo:    'Via Veneto 50',
    cap:          '00187',
    citta:        'Roma',
    prov:         'RM',
    paese:        'Italia',
    sdi:          'ABCDE12',
    banca:        'UniCredit',
    iban:         'IT60 X054 2811 1010 0000 0123 456',
    bic:          'UNCRITMM',
    intestatario: 'Bianchi Srl',
    annotazioni:  'Primo contatto febbraio 2026',
    collaboratori: [
      {
        ordine:    1,
        nome:      'Marco Bianchi',
        ruolo:     'Referente',
        cellulare: '+39 347 1111111',
        telefono:  '',
        mail:      'marco@bianchi.it',
        note:      'CEO'
      }
    ]
  }
];
