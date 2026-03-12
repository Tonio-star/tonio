/* ================================================================
   TONIO — Dati_Tariffe.js
   ⚠️  QUESTO FILE CONTIENE SOLO I TUOI DATI TARIFFE.
   NON modificare quando si aggiorna la struttura.
   Aggiungi / modifica dati qui in totale sicurezza.

   v2.0 — super_prodotto_id, prodotto_id, tipo_immobile_id
           sono ora ID numerici (foreign key → modulo Immobili).
           I campi super_prodotto / prodotto / tipo_immobile (stringa)
           sono mantenuti solo per retrocompatibilità con dati salvati
           in localStorage da versioni precedenti.
   ================================================================ */

var TONIO_TARIFFE_TIPO = [
  { id: 1, ordine: 1, nome: 'Tariffa Base' },
  { id: 2, ordine: 2, nome: 'Tariffa Weekend' },
  { id: 3, ordine: 3, nome: 'Tariffa Alta Stagione' },
  { id: 4, ordine: 4, nome: 'Tariffa Bassa Stagione' },
];

var TONIO_TARIFFE_TRATTAMENTO = [
  { id: 1, ordine: 1, nome: 'Solo Pernottamento', definizione: 'Solo notte senza colazione' },
  { id: 2, ordine: 2, nome: 'Bed & Breakfast',    definizione: 'Pernottamento con colazione inclusa' },
  { id: 3, ordine: 3, nome: 'Mezza Pensione',      definizione: 'Pernottamento con colazione e cena' },
  { id: 4, ordine: 4, nome: 'Pensione Completa',   definizione: 'Pernottamento con colazione, pranzo e cena' },
  { id: 5, ordine: 5, nome: 'All Inclusive',        definizione: 'Tutto incluso, bevande comprese' },
];

var TONIO_TARIFFE_UNITA_MISURA = [
  { id: 1, ordine: 1, nome: 'Per Notte' },
  { id: 2, ordine: 2, nome: 'Per Persona / Notte' },
  { id: 3, ordine: 3, nome: 'Per Settimana' },
  { id: 4, ordine: 4, nome: 'Per Mese' },
  { id: 5, ordine: 5, nome: 'Forfait' },
];

/*
  Tariffario — schema aggiornato v2.0
  ─────────────────────────────────────────────────────────────────
  Campi header (unici per tariffa):
    tipo_tariffa     string  — nome del tipo tariffa (archivio interno)
    trattamento      string  — nome del trattamento (archivio interno)
    super_prodotto_id number — ID → TONIO_IMMOBILI_SUPERPRODOTTI
    prodotto_id       number — ID → TONIO_IMMOBILI_PRODOTTI
    unita_misura     string  — nome dell'unità di misura (archivio interno)
    iva_perc         number

  Campi riga (multi-record per tariffa):
    tipo_immobile_id  number — ID → TONIO_IMMOBILI_TIPI
    dal / al         string  — date ISO
    importo          number
    obbligatorio     bool
    chi_paga_cli     bool
    chi_paga_osp     bool
    fat_fat          bool
    fat_nf           bool
    fatturare_cli    bool
    fatturare_osp    bool
    ordinamento      number
  ─────────────────────────────────────────────────────────────────
*/
var TONIO_TARIFFARIO = [
  {
    id: 1,
    /* Campi header */
    tipo_tariffa:      'Tariffa Base',
    trattamento:       'Bed & Breakfast',
    super_prodotto_id: 1,   /* ID 1 = 'Standard' in TONIO_IMMOBILI_SUPERPRODOTTI */
    prodotto_id:       1,   /* ID 1 = 'Affitto Breve' in TONIO_IMMOBILI_PRODOTTI */
    unita_misura:      'Per Notte',
    iva_perc:          10,
    /* Righe dettaglio */
    righe: [
      {
        tipo_immobile_id: 1,    /* ID 1 = 'Appartamento' in TONIO_IMMOBILI_TIPI */
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
