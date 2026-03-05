# TONIO — Stato del Progetto
> Aggiornato: 2026-03-05 | Versione struttura: 1.0

---

## 📁 Struttura Repository

```
tonio/
├── index.html                  ← Portale principale (solo nav + shell)
├── TONIO_stato.md              ← Questo file
├── assets/
│   ├── tonio-core.css          ← Stili condivisi (v1.0)
│   └── tonio-core.js           ← Navigazione + utility condivise (v1.0)
└── moduli/
    ├── Msk_Clienti.html        ← ✅ Completato v1.0
    ├── Msk_Ospiti.html         ← 🔲 Da fare
    ├── Msk_Immobili.html       ← 🔲 Da fare
    ├── Msk_Prenotazioni.html   ← 🔲 Da fare
    ├── Msk_Preventivi.html     ← 🔲 Da fare
    ├── Msk_Entrate.html        ← 🔲 Da fare
    ├── Msk_Budget.html         ← 🔲 Da fare
    ├── Msk_Statistiche.html    ← 🔲 Da fare
    ├── Msk_Manutenzioni.html   ← 🔲 Da fare
    └── Msk_Magazzino.html      ← 🔲 Da fare
```

---

## 🧱 Regole Fondamentali (NON derogare)

| Regola | Dettaglio |
|--------|-----------|
| **Un file per modulo** | Ogni maschera è un file HTML autonomo in `moduli/` |
| **CSS condiviso** | Tutti i moduli usano `assets/tonio-core.css` — non duplicare stili |
| **JS condiviso** | Navigazione e utility in `assets/tonio-core.js` — non duplicare funzioni |
| **Branch Git** | Sviluppo su branch `dev`, merge su `main` solo quando funziona |
| **Nomenclatura** | `Msk_` = maschere, `Tab_` = tabelle ausiliarie, `Rpt_` = report |
| **Email nel codice** | Scrivere `[at]` invece di `@` per evitare offuscamento Cloudflare |

---

## 🗄️ Struttura Dati (Supabase — da collegare)

### Tab_Clienti
| Campo | Tipo | Note |
|-------|------|------|
| id | uuid | PK, auto |
| nominativo | text | required |
| tipologia_id | int | FK → Tab_Clienti_Tipologie |
| stato_id | int | FK → Tab_Clienti_Stati |
| cellulare_1 | text | |
| cellulare_2 | text | |
| telefono_1 | text | |
| telefono_2 | text | |
| email_1 | text | |
| email_2 | text | |
| pec | text | |
| homepage | text | |
| via | text | |
| cap | text | |
| citta | text | |
| provincia | text | |
| nazione | text | default 'Italia' |
| note | text | |
| firmatario_nome | text | |
| firmatario_citta_nascita | text | |
| firmatario_data_nascita | date | |
| firmatario_cf | text | |
| piva | text | |
| codice_fiscale | text | |
| codice_sdi | text | |
| fatt_diversa | boolean | default false |
| fatt_nominativo | text | |
| fatt_piva | text | |
| fatt_via | text | |
| fatt_cap | text | |
| fatt_citta | text | |
| fatt_provincia | text | |
| fatt_nazione | text | |
| fatt_telefono | text | |
| fatt_email | text | |
| fatt_pec | text | |
| iban | text | |
| swift | text | |
| banca | text | |
| intestatario_conto | text | |
| created_at | timestamp | auto |
| updated_at | timestamp | auto |

### Tab_Clienti_Collaboratori
| Campo | Tipo | Note |
|-------|------|------|
| id | uuid | PK |
| cliente_id | uuid | FK → Tab_Clienti |
| ordine | int | per ordinamento manuale |
| nome | text | |
| ruolo | text | |
| cellulare | text | |
| telefono | text | |
| email | text | |
| note | text | |
| is_referente | boolean | default false |

### Tab_Clienti_Annotazioni
| Campo | Tipo | Note |
|-------|------|------|
| id | uuid | PK |
| cliente_id | uuid | FK → Tab_Clienti |
| titolo | text | |
| testo | text | |
| created_at | timestamp | auto |

### Tab_Clienti_Tipologie
| Campo | Tipo | Note |
|-------|------|------|
| id | int | PK, serial |
| ordine | int | |
| label | text | |
| colore | text | hex color |

### Tab_Clienti_Stati
| Campo | Tipo | Note |
|-------|------|------|
| id | int | PK, serial |
| ordine | int | |
| label | text | |
| colore | text | hex color |

---

## ✅ Moduli Completati

### Msk_Clienti.html — v1.0 (2026-03-05)
- Lista clienti con colonne: Nominativo/Referente, Tipologia, Stato, Tel/Cell, Email, Note
- Pannello dettaglio con 5 tab: Dati Generali, Dati Fiscali, Dati Bancari, Collaboratori, Annotazioni
- Tab_Clienti_Tipologie: gestione colori e ordinamento
- Tab_Clienti_Stati: gestione colori e ordinamento
- Ricerca e filtri per tipologia/stato
- Pulsanti: Esporta, Tipologie, Stati, Nuovo Cliente
- Collaboratori con ordinamento manuale
- Toggle "dati fatturazione diversi"
- **Dati**: ancora statici (mock), da collegare a Supabase

---

## 🔲 Prossimi Passi

1. **Supabase setup** — creare progetto e tabelle
2. **Collegare Msk_Clienti a Supabase** — CRUD reale
3. **Msk_Ospiti** — anagrafica ospiti
4. **Msk_Immobili** — anagrafica immobili
5. **Msk_Prenotazioni** — gestione prenotazioni

---

## 🎨 Design System

| Elemento | Valore |
|----------|--------|
| Font | DM Sans (testo) + DM Mono (codici) |
| Colore primario | #2563eb |
| Colore teal | #0d9488 |
| Colore violet | #7c3aed |
| Sfondo nav | #0f1623 |
| Sfondo sub-nav | #162032 |
| Sfondo pagina | #f0f2f7 |
| Radius card | 16px |
| Radius elem | 10px |
| Breakpoint mobile | 768px |

---

## 🔧 Come Aggiungere un Nuovo Modulo

1. Creare `moduli/Msk_NomeModulo.html`
2. Aggiungere voce in `MENU` in `assets/tonio-core.js`
3. Aggiungere voce `P2M` se il modulo ha sotto-pagine
4. Aggiungere link nella sidebar mobile di `index.html`
5. Aggiornare questo file

---

## 🌿 Git Workflow

```bash
# Nuovo sviluppo
git checkout -b dev
# ... lavora ...
git add .
git commit -m "feat: descrizione modifica"

# Quando funziona → merge su main
git checkout main
git merge dev
git push origin main

# GitHub Pages pubblica automaticamente da main
```
