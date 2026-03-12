/* ================================================================
   TONIO — Dati_Prenotazioni.js
   ⚠️  QUESTO FILE CONTIENE SOLO I TUOI DATI PRENOTAZIONI.
   NON modificare quando si aggiorna la struttura.
   Aggiungi / modifica prenotazioni qui in totale sicurezza.
   ================================================================ */

var TONIO_PRENOTAZIONI = [
  {
    id: 1,
    attivo: true,
    numero_prenotazione: 'PRE-2026-001',
    protocollo:          'PROT-001',
    /* Date richieste */
    dal:                 '2026-04-01T14:00',
    al:                  '2026-04-08T10:00',
    notti:               7,
    /* Immobile (id collegati ai moduli esistenti) */
    super_prodotto_id:   2,
    prodotto_id:         1,
    via_immobile_id:     1,
    tipo_immobile_id:    1,
    posti_letto:         4,
    piano_id:            3,
    /* Cliente / Ospite */
    cliente_id:          1,
    ospite_id:           1,
    note:                'Prima prenotazione di prova'
  }
];
