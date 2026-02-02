# HeyImpact — ESRS Reporting Tool

Webbasiertes Tool zur Erstellung von Nachhaltigkeitsberichten nach ESRS (European Sustainability Reporting Standards) mit VSME-Kompatibilitaet.

## Tech Stack

- **Frontend**: React 18, React Router, Vite
- **Backend**: Node.js, Express
- **KI-Assistent**: Adacor Private AI (Mistral)
- **Datenformat**: JSON (dateibasiert, keine Datenbank)

## Projektstruktur

```
heyimpact-app/
  client/                 Frontend (React/Vite)
    src/
      pages/              Seitenkomponenten (Dashboard, Environmental, Social, ...)
      components/         UI-Komponenten (Card, TabPanel, FormField, ...)
      hooks/              Custom Hooks (useReport, useAuth, useTodos, ...)
      context/            React Context (Chat, ActiveTab)
      utils/              Hilfsfunktionen (scoring, formatting, chatHelpers, ...)
      theme/              Design Tokens
    dist/                 Build-Output (generiert)
  server/
    src/
      routes/             API-Endpunkte (auth, reports, llm, chat, documents, export)
      models/             Datenmodell + Defaults
      services/           Business-Logik (LLM, Validierung, Export)
      middleware/          Auth + Error Handler
      data/
        reports/          Gespeicherte Berichte (JSON)
        uploads/          Hochgeladene Dokumente
        import_2024.json  Vorbefuellte Importdaten
  package.json            Root-Workspace-Config
```

## Lokale Entwicklung

### Voraussetzungen

- Node.js >= 18
- npm >= 9

### Setup

```bash
npm install
```

### .env konfigurieren

```bash
cp .env.example .env   # oder manuell anlegen
```

Erforderliche Variablen:

| Variable | Beschreibung | Default |
|---|---|---|
| `PORT` | Server-Port | `3001` |
| `APP_PASSWORD` | Login-Passwort | `esrs2025` |
| `JWT_SECRET` | Secret fuer JWT-Token | (hardcoded Fallback) |
| `ADACOR_API_KEY` | API-Key fuer KI-Assistent | (leer = KI deaktiviert) |

### Starten

```bash
npm run dev
```

Startet Frontend (http://localhost:5173) und Backend (http://localhost:3001) parallel.
Vite proxied `/api`-Requests automatisch an den Backend-Server.

### Nur Frontend oder Backend

```bash
npm run dev:client    # Nur Vite Dev Server
npm run dev:server    # Nur Express (mit --watch)
```

## Production Build

```bash
npm run build         # Baut Frontend nach client/dist/
npm start             # Startet Express, serviert API + Frontend
```

Express liefert in Production:
1. Alle `/api/*`-Routen als JSON-API
2. Statische Dateien aus `client/dist/`
3. SPA-Fallback: alle anderen Routen erhalten `index.html`

## Deployment auf Railway

### Einstellungen

Wenn das gesamte Repository nur die App enthaelt (kein Monorepo), muss kein Root Directory gesetzt werden.

| Feld | Wert |
|---|---|
| Build Command | `npm run build` |
| Start Command | `npm start` |

### Environment Variables

In Railway unter Settings > Variables setzen:

- `PORT` — wird von Railway automatisch gesetzt
- `APP_PASSWORD` — Login-Passwort fuer die App
- `JWT_SECRET` — sicherer zufaelliger String
- `ADACOR_API_KEY` — API-Key fuer den KI-Assistenten

### Hinweise

- Kein Dockerfile noetig, Railway erkennt Node.js automatisch
- Daten werden dateibasiert im Filesystem gespeichert — bei Railway-Redeployments gehen gespeicherte Berichte verloren (Ephemeral Filesystem). Fuer persistente Daten muesste ein Volume oder eine Datenbank angebunden werden.
- Der KI-Assistent funktioniert nur mit gueltigem `ADACOR_API_KEY`

## API-Endpunkte

| Route | Beschreibung |
|---|---|
| `POST /api/auth/login` | Authentifizierung |
| `GET /api/reports` | Alle Berichte auflisten |
| `GET /api/reports/:id` | Einzelnen Bericht laden |
| `POST /api/reports` | Neuen Bericht erstellen |
| `PUT /api/reports/:id` | Bericht speichern |
| `POST /api/documents/upload` | Dokument-Upload (PDF/DOCX) |
| `POST /api/llm/generate` | LLM-Textgenerierung |
| `POST /api/chat` | KI-Chat-Nachrichten |
| `POST /api/export/pdf` | PDF-Export |
| `GET /api/health` | Health Check |

## Seitenstruktur

| Route | Seite | Inhalt |
|---|---|---|
| `/` | Dashboard | Uebersicht, Bericht erstellen/laden |
| `/import` | Dokument-Import | PDF/DOCX hochladen, Daten extrahieren |
| `/organization` | Unternehmensdaten | Stammdaten, Geschaeftsmodell, Scope |
| `/iro` | IRO-Bewertung | Impacts, Risiken, Opportunities je Thema |
| `/materiality` | Wesentlichkeit | Wesentlichkeitsanalyse der ESRS-Themen |
| `/environmental` | Umwelt (E1-E5) | Klima, Verschmutzung, Wasser, Biodiversitaet, Kreislaufwirtschaft |
| `/social` | Soziales (S1-S4) | Belegschaft, Lieferkette, Gemeinschaften, Verbraucher |
| `/governance` | Governance (G1) | Gremien, Compliance, Hinweisgebersystem, Datensicherheit, KI, Kontroverse Sektoren |
| `/targets` | Ziele & Massnahmen | Uebergreifende Ziele und Massnahmen |
| `/vsme` | VSME-Uebersicht | Read-only Darstellung aller Daten im VSME-Schema (B1-B11, C1-C9) + Abdeckungsstatus |
| `/export` | Export | PDF-Generierung |
| `/todos` | Todos | Aufgabenverwaltung |

## VSME-Kompatibilitaet

Die App erhebt Daten primaer nach ESRS. Die VSME-Uebersichtsseite (`/vsme`) bildet diese Daten auf das VSME-Schema ab:

- **Basic Module (B1-B11)**: Basiskennzahlen zu Organisation, Umwelt, Soziales, Governance
- **Comprehensive Module (C1-C9)**: Erweiterte Angaben zu Geschaeftsmodell, Klimazielen, Menschenrechten, kontroversen Sektoren
- **Abdeckungsstatus**: Ampel-Uebersicht welche VSME-Disclosures befuellt sind

## Archiv

Das Verzeichnis `_archive_streamlit/` (eine Ebene hoeher) enthaelt die alte Python/Streamlit-Version der App. Diese wird nicht mehr verwendet.
