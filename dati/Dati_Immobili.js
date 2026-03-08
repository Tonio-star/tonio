/* ================================================================
   TONIO — Dati_Immobili.js
   ⚠️  QUESTO FILE CONTIENE SOLO I TUOI DATI IMMOBILI.
   NON modificare quando si aggiorna la struttura.
   Aggiungi / modifica immobili qui in totale sicurezza.
   ================================================================ */

var TONIO_IMMOBILI_PRODOTTI = [
  { id: 1, ordine: 1, nome: 'Affitto Breve',   colore: '#4f8ef7', attivo: true },
  { id: 2, ordine: 2, nome: 'Affitto Lungo',   colore: '#34d399', attivo: true },
  { id: 3, ordine: 3, nome: 'B&B',             colore: '#fbbf24', attivo: true },
  { id: 4, ordine: 4, nome: 'Casa Vacanze',    colore: '#a78bfa', attivo: true },
];

var TONIO_IMMOBILI_SUPERPRODOTTI = [
  { id: 1, ordine: 1, nome: 'Standard',        colore: '#4f8ef7', attivo: true },
  { id: 2, ordine: 2, nome: 'Premium',         colore: '#f97316', attivo: true },
  { id: 3, ordine: 3, nome: 'Luxury',          colore: '#a78bfa', attivo: true },
];

var TONIO_IMMOBILI_TIPI = [
  { id: 1, ordine: 1, nome: 'Appartamento',    colore: '#4f8ef7', attivo: true },
  { id: 2, ordine: 2, nome: 'Villa',           colore: '#34d399', attivo: true },
  { id: 3, ordine: 3, nome: 'Monolocale',      colore: '#fbbf24', attivo: true },
  { id: 4, ordine: 4, nome: 'Attico',          colore: '#f87171', attivo: true },
];

var TONIO_IMMOBILI_PIANI = [
  { id: 1, ordine: 1,  nome: 'Piano Terra' },
  { id: 2, ordine: 2,  nome: '1° Piano' },
  { id: 3, ordine: 3,  nome: '2° Piano' },
  { id: 4, ordine: 4,  nome: '3° Piano' },
  { id: 5, ordine: 5,  nome: '4° Piano' },
  { id: 6, ordine: 6,  nome: 'Ultimo Piano' },
  { id: 7, ordine: 7,  nome: 'Seminterrato' },
];

var TONIO_IMMOBILI = [
  {
    id: 1,
    attivo: true,
    ordine: 1,
    immobile:      'Appartamento Roma Centro',
    posti_letto:   4,
    tipo:          'Appartamento',
    piano:         '2° Piano',
    prodotto:      'Affitto Breve',
    superprodotto: 'Premium',
    via:           'Via del Corso',
    numero:        '45',
    cap:           '00186',
    comune:        'Roma',
    provincia:     'RM',
  },
  {
    id: 2,
    attivo: true,
    ordine: 2,
    immobile:      'Villa Trastevere',
    posti_letto:   8,
    tipo:          'Villa',
    piano:         'Piano Terra',
    prodotto:      'Casa Vacanze',
    superprodotto: 'Luxury',
    via:           'Via della Lungara',
    numero:        '12',
    cap:           '00165',
    comune:        'Roma',
    provincia:     'RM',
  }
];
