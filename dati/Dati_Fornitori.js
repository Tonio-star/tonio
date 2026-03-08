/* ================================================================
   TONIO — Dati_Fornitori.js
   ⚠️  QUESTO FILE CONTIENE SOLO I TUOI DATI FORNITORI.
   NON modificare quando si aggiorna la struttura.
   Aggiungi / modifica fornitori qui in totale sicurezza.
   ================================================================ */

var TONIO_FORNITORI_TIPOLOGIE = [
  { id: 1, ordine: 1, nome: 'Artigiano',    colore: '#4f8ef7' },
  { id: 2, ordine: 2, nome: 'Azienda',      colore: '#34d399' },
  { id: 3, ordine: 3, nome: 'Professionista', colore: '#fbbf24' },
  { id: 4, ordine: 4, nome: 'Ente',         colore: '#a78bfa' },
];

var TONIO_FORNITORI_STATI = [
  { id: 1, ordine: 1, nome: 'Attivo',     colore: '#34d399' },
  { id: 2, ordine: 2, nome: 'Potenziale', colore: '#fbbf24' },
  { id: 3, ordine: 3, nome: 'Inattivo',   colore: '#9aa3b8' },
  { id: 4, ordine: 4, nome: 'Bloccato',   colore: '#f87171' },
];

var TONIO_FORNITORI = [
  {
    id: 1,
    attivo: true,
    nominativo:   'Idraulica Verdi Srl',
    tipologia:    'Azienda',
    stato:        'Attivo',
    note:         'Fornitore principale impianti idraulici',
    /* Contatti */
    cellulare:    '+39 347 9876543',
    cellulare2:   '',
    telefono:     '+39 06 9876543',
    telefono2:    '',
    mail:         'info@idraulicaverdi.it',
    mail2:        '',
    pec:          'idraulicaverdi@pec.it',
    web:          'https://www.idraulicaverdi.it',
    /* Indirizzo */
    via:          'Via Nazionale 10',
    citta:        'Roma',
    cap:          '00184',
    prov:         'RM',
    paese:        'Italia',
    /* Dati fiscali */
    fattStessiDati:   true,
    fatt_nominativo:  'Idraulica Verdi Srl',
    cf:               '',
    piva:             '09876543210',
    sdi:              'XYZ1234',
    fatt_cell:        '+39 347 9876543',
    fatt_tel:         '+39 06 9876543',
    fatt_mail:        'info@idraulicaverdi.it',
    fatt_pec:         'idraulicaverdi@pec.it',
    fatt_via:         'Via Nazionale 10',
    fatt_citta:       'Roma',
    fatt_cap:         '00184',
    fatt_prov:        'RM',
    fatt_paese:       'Italia',
    firmatario:       'Verdi Carlo',
    firmatario_citta: 'Roma',
    firmatario_data:  '1972-03-20',
    firmatario_cf:    'VRDCRL72C20H501Z',
    /* Dati bancari */
    intestatario: 'Idraulica Verdi Srl',
    banca:        'Intesa Sanpaolo',
    iban:         'IT60 X030 6909 6061 0000 0117 200',
    bic:          'BCITITMM',
    /* Sub-record */
    collaboratori: [
      { ordine: 1, nome: 'Carlo Verdi', ruolo: 'Titolare', cellulare: '+39 347 9876543', telefono: '+39 06 9876543', mail: 'carlo@idraulicaverdi.it', note: 'Referente principale' }
    ],
    annotazioni: []
  }
];
