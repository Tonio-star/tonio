/* ================================================================
   TONIO — Dati_Tariffe.js
   ⚠️  QUESTO FILE CONTIENE SOLO I TUOI DATI TARIFFE.
   NON modificare quando si aggiorna la struttura.
   Aggiungi / modifica dati qui in totale sicurezza.

   NOTA — Campi ID relazionali (foreign key):
   • super_prodotto_id  → ID da TONIO_IMMOBILI_SUPERPRODOTTI
   • prodotto_id        → ID da TONIO_IMMOBILI_PRODOTTI
   • tipo_immobile_id   → ID da TONIO_IMMOBILI_TIPI  (nelle righe)
   ================================================================ */

var TONIO_TARIFFE_TIPO = [
  { id: 1, ordine: 1, nome: 'Tariffa Base' },
  { id: 2, ordine: 2, nome: 'Tariffa Weekend' },
  { id: 3, ordine: 3, nome: 'Tariffa Alta Stagione' },
  { id: 4, ordine: 4, nome: 'Tariffa Bassa Stagione' },
];

var TONIO_TARIFFE_TRATTAMENTO = [
  { id: 1, ordine: 1, nome: 'Solo Pernottamento',  definizione: 'Solo notte senza colazione' },
  { id: 2, ordine: 2, nome: 'Bed & Breakfast',      definizione: 'Pernottamento con colazione inclusa' },
  { id: 3, ordine: 3, nome: 'Mezza Pensione',        definizione: 'Pernottamento con colazione e cena' },
  { id: 4, ordine: 4, nome: 'Pensione Completa',     definizione: 'Pernottamento con colazione, pranzo e cena' },
  { id: 5, ordine: 5, nome: 'All Inclusive',         definizione: 'Tutto incluso, bevande comprese' },
];

var TONIO_TARIFFE_UNITA_MISURA = [
  { id: 1, ordine: 1, nome: 'Per Notte' },
  { id: 2, ordine: 2, nome: 'Per Persona / Notte' },
  { id: 3, ordine: 3, nome: 'Per Settimana' },
  { id: 4, ordine: 4, nome: 'Per Mese' },
  { id: 5, ordine: 5, nome: 'Forfait' },
];

/* ----------------------------------------------------------------
   Tariffario
   Header (campi unici):
     super_prodotto_id  = ID di TONIO_IMMOBILI_SUPERPRODOTTI  (es. 1 = Standard)
     prodotto_id        = ID di TONIO_IMMOBILI_PRODOTTI       (es. 1 = Affitto Breve)

   Righe dettaglio:
     tipo_immobile_id   = ID di TONIO_IMMOBILI_TIPI           (es. 1 = Appartamento)
   ---------------------------------------------------------------- */
var TONIO_TARIFFARIO = [
  {
    id: 1,
    tipo_tariffa:      'Tariffa Base',
    trattamento:       'Bed & Breakfast',
    super_prodotto_id: 1,   /* Standard  — da TONIO_IMMOBILI_SUPERPRODOTTI */
    prodotto_id:       1,   /* Affitto Breve — da TONIO_IMMOBILI_PRODOTTI  */
    unita_misura:      'Per Notte',
    iva_perc:          10,
    righe: [
      {
        tipo_immobile_id: 1,   /* Appartamento — da TONIO_IMMOBILI_TIPI */
        dal:              '2026-01-01',
        al:               '2026-06-30',
        importo:          80.00,
        obbligatorio:     false,
        chi_paga_cli:     true,
        chi_paga_osp:     false,
        fat_fat:          true,
        fat_nf:           false,
        fatturare_cli:    true,
        fatturare_osp:    false,
        ordinamento:      1
      }
    ]
  }
];
