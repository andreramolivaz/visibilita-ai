# Visibilità AI

Un servizio self-service in italiano che dice a un'attività locale se ChatGPT, Gemini, Google AI, Claude, Perplexity e Grok la consigliano o consigliano i concorrenti, e cosa fare per cambiare le cose.

**Promessa:** in pochi minuti sai se ti consigliano, chi ti passa davanti e le tre cose da sistemare. Il report singolo a 49 € apre, l'abbonamento da 29 € al mese tiene.

**Cosa non è:** non una suite SEO, non una dashboard con 40 metriche. Un punteggio, un confronto, tre azioni.

La roadmap completa è nel progetto (`Roadmap – Visibilità AI per attività locali.pdf`).

## Stato

Fase 0: interfaccia con dati di esempio. Le cinque schermate ci sono, i motori non sono ancora collegati.

| Schermata | Percorso | Stato |
|---|---|---|
| Landing con report di esempio | `/` | fatta |
| Conferma profilo e domande | `/conferma?q=…` | fatta, profilo finto |
| Scansione con avanzamento | `/scansione?id=…` | simulata |
| Report (7 sezioni + note tecniche) | `/report/esempio` | fatta; `?abbonato=1` mostra l'andamento |
| Prezzi, Privacy | `/prezzi` `/privacy` | fatte |

## Avvio

```bash
npm install
npm run dev
```

Nessuna chiave API serve per la demo. Per i motori veri, copia `.env.example` in `.env.local`.

## Struttura

```
src/
  app/                 pagine (App Router, Next.js 16)
  components/          interfaccia; report/ è la pagina del report
  lib/
    types.ts           modello dati: profilo, domande, risposte, report
    engines.ts         gli 8 motori con peso nel punteggio (Audicom, lug 2026)
    score.ts           punteggio 0–100 e verdetto
    profiles.ts        carica i profili e genera le domande
    mock-report.ts     report di esempio (pizzeria a Bergamo)
  data/profiles/       un JSON per categoria: domande, fonti, metriche, azioni
```

## Il report

Pensato per essere letto in trenta secondi dal titolare e verificato in dieci minuti da chi vuole i numeri. Sezioni, nell'ordine: intestazione con il campione · **In 30 secondi** (dove sei: punteggio, scala con la mediana della categoria, quota di voce; chi ti passa davanti; la prima cosa da fare) · distribuzione delle posizioni e andamento (abbonamento) · **cosa fare, in ordine di impatto** con il punteggio stimato dopo le azioni · **chi consigliano al posto tuo**: una tabella sola con citazioni, quota di voce, presenza nei primi tre, domande senza di te, assistente dove ciascuno è più forte, più il confronto diretto («meglio tu o X?») · **dove ti trovano**: territorio (domande dove ci sei / dove c'è un concorrente e tu no / dove non c'è nessuno), per assistente, per tipo di domanda, mappa domanda × assistente · **da dove prendono le informazioni** e **le parole che usano** · **cosa dicono di te** con dati corretti sì/no e tono (segnalato solo se critico) · **note tecniche**, chiuse di default: numeri chiave con campione e intervallo, dati della scansione, riferimenti esterni, definizioni.
Ogni sezione ha una riga di lettura (`src/lib/letture.ts`): un fatto con i suoi numeri, niente aggettivi. Nessuna sintesi narrativa.

Punteggio e numeri chiave usano solo le **domande spontanee**, quelle in cui il cliente non fa il nome dell'attività (generiche, per bisogno, per specialità, per requisito): misurano se gli assistenti ti consigliano da soli. Le domande sul nome e di confronto, in cui compari quasi per forza, sono riportate a parte (mappa, per tipo, cosa dicono di te, confronto diretto).

Statistiche (`src/lib/stats.ts`): tasso di citazione con due intervalli al 95% (Wilson sulle risposte e «tra domande», da un bootstrap a grappoli che ricampiona le domande intere, perché le risposte alla stessa domanda sono correlate), stima ridotta beta-binomiale per famiglie e punti della griglia con il peso della media dichiarato, sensibilità alla forma della domanda (breve contro richiesta di più opzioni, appaiata per domanda), informative contate sulle risposte con almeno un nome, quota di voce (citazioni tue su tutte le citazioni di attività, come Peec/Profound/Semrush/BrightLocal), copertura, nei primi tre (al posto della posizione media, instabile per costruzione), territorio, stabilità delle risposte, punteggio parziale per assistente, concentrazione dei consigli, dati corretti, confronto diretto. Nessuna previsione: le risposte degli assistenti non hanno una base statistica che le renda prevedibili; mostriamo l'andamento.
Riferimenti esterni (`src/lib/riferimenti.ts`): gli studi di settore (SOCi, Insites, Local Falcon, SparkToro, BrightLocal) con cui il report confronta il risultato, perché uno zero è la norma e non un difetto della misura.
Definizioni (`src/lib/glossario.ts`): 18 voci, ognuna con cos'è, come si calcola, come si legge, cosa non è; nel report web (note tecniche) e nel PDF (Allegato C).
Grafici ammessi: barre orizzontali, barre a segmenti, mappa a celle, una linea per l'andamento. Niente torte, radar, gauge, previsioni.
Il PDF è un rapporto tecnico di 5 pagine: sintesi e azioni · concorrenti e dove ti trovano · mappa e fonti · cosa dicono di te e metodo · riferimenti esterni e definizioni. Marchio e identificativo documento (`VAI-AAAAMMGG-ID`) in testata; in white-label il nome dell'agenzia sostituisce il marchio (`logo` in `ReportPdf`).
Report singolo (49 € una tantum): 36 domande × 2 ripetizioni nella stessa giornata, report completo con PDF. Piani: Base 48 domande × 3 ripetizioni in tre giorni, ogni mese; Pro 72 domande × 2, ogni due settimane (`src/lib/prezzi.ts`). Il pagamento del report singolo passa da Stripe Checkout (modalità pagamento): la scansione nasce «in attesa di pagamento» e parte dal webhook, o dalla verifica della sessione al ritorno; senza Stripe parte subito (dimostrazione se non ci sono assistenti, mai a pagamento).

## Il profilo e le domande (`src/lib/profilo/`)

Da «nome, città» (o link di Google Maps) a profilo e domande, con dati veri:

1. **Scheda Google** (`places.ts`, Places API New: Text Search con recensioni e attributi, Nearby Search): nome, indirizzo, città/zona/provincia/regione, telefono, sito, categoria, fascia di prezzo, orari, rating, le 5 recensioni più rilevanti, gli attributi (asporto, dehors, prenotazione, cani, parcheggio, aperto la domenica…) che diventano **requisiti**, e i concorrenti della stessa categoria entro 3 km, dal più noto: il primo è il **concorrente del confronto diretto**.
2. **Recensioni** (`termini.ts`): termini ricorrenti (parole e frasi di 2–3 parole, senza le comuni, senza attraversare la punteggiatura), contati per recensione: «forno a legna: in 12 recensioni». Diventano **specialità**.
3. **Sito** (`sito.ts`): pagina iniziale più fino a 4 pagine chiave (menu, servizi, lavorazioni, prodotti, chi siamo); i termini vengono prima da intestazioni e voci di elenco (frasi già intere), poi dal testo. Note: menu o listino solo in PDF, sito assente o quasi vuoto.
4. **Ricerche Google** (`suggerimenti.ts`): i suggerimenti per «categoria città», tolti categoria, città e parole di luogo: restano i vincoli che la gente aggiunge («senza glutine», «aperta ora»). Diventano requisiti.
5. **Generazione** (`profiles.ts`): i modelli della categoria riempiti con specialità, requisiti e concorrente; ogni domanda porta la sua **origine** (scheda, recensioni, sito, ricerche, modello, titolare), mostrata nella conferma. Nei set da 30 le ultime tre spontanee sono «esplora» e possono ruotare; le altre restano fisse per il confronto nel tempo.
6. **Varianti** (`varianti.ts`, Anthropic Messages API, `ANTHROPIC_MODEL`): le domande spontanee riscritte come prompt veri, stesso luogo e stessi vincoli; una variante che perde il luogo o esce dalle 6–30 parole viene scartata. Senza chiave, restano i modelli.
7. **Il titolare**: nella conferma può scrivere cosa gli chiedono al telefono; diventa una delle domande.

Senza `GOOGLE_PLACES_API_KEY` il profilo è quello di esempio con il nome digitato. Cache in memoria (7 giorni scheda e suggerimenti, 3 il sito); in produzione va nel database. Costi Places: Text Search con recensioni e attributi è nello SKU «Enterprise + Atmosphere» (circa 40 $ per 1.000 richieste), Nearby «Pro» (circa 35 $ per 1.000); con la cache, una richiesta di ciascuno per attività.

## La scansione (`src/lib/motori/`, `src/lib/scansione/`, `src/lib/analisi/`)

- **Assistenti** (`motori/`): un adattatore per ciascuno, stessa interfaccia (`interroga(domanda, città, regione, coordinate)` → testo, URL citate o consultate, modello, canale, orari). ChatGPT: Responses API con `web_search` e `user_location`; Gemini: grounding Google Search + Google Maps con `latLng`; Google AI: AI Mode e AI Overviews letti dalla pagina dei risultati con DataForSEO (località italiana); Claude: Messages API con `web_search` e `user_location`; Perplexity: Sonar con `user_location`; Grok: Responses API con `web_search`. Unica istruzione di sistema: «Rispondi in italiano». Un assistente è attivo solo con la sua chiave; con zero chiavi la scansione è una dimostrazione.
- **Coda** (`scansione/`): una cella per domanda × assistente × ripetizione, con data di esecuzione (report singolo: tutto subito; abbonamento: una ripetizione al giorno). `avanza()` esegue un lotto di celle scadute (un assistente alla volta per assistente, assistenti in parallelo, entro un tempo massimo), salva ogni cella e, se restano celle, si richiama (`/api/scansioni/[id]/avanza`, protetta da `CODA_SEGRETO`); a fine celle costruisce il report. Il passaggio giornaliero (`/api/cron/scansioni`, Vercel Cron alle 06:00 UTC, `CRON_SECRET`) riprende le celle dei giorni successivi. Deposito in memoria senza Supabase, tabelle `scansioni`, `celle`, `report`, `test_gratuiti` con Supabase. Limite senza Stripe: `MAX_TEST_GRATUITI_AL_GIORNO` scansioni al giorno.
- **Analisi** (`analisi/`): riconoscimento a regole dichiarate (nucleo del nome senza parole generiche, intero e vicino; telefono o indirizzo; nomi in elenco estratti da voci numerate, puntate e grassetti; concorrenti vicini dalla scheda come nomi canonici), posizione = ordine di prima comparsa tra i nomi riconosciuti (oltre il quinto non conta); fonti dalle URL (portali con nome, sito dell'attività come «Sito ufficiale», altrimenti dominio); termini ricorrenti nelle risposte spontanee confrontati con le recensioni; descrizioni dalla domanda sul nome con tono (segnalato solo se critico) ed errori (telefono diverso, giorno di chiusura che da te è aperto); tre azioni a regole con punti stimati (fonte più citata in cui non ci sei, dati sbagliati, sito povero, termini mancanti, domande per bisogno deboli, inglese). `costruisciReport()` applica le stesse formule del report di esempio ai dati veri.
- **Pagina di scansione**: con i motori segue la coda (stato ogni 3 secondi) e apre il report quando è pronto; senza, mostra la dimostrazione e apre il report di esempio.

## Le domande e i settori

Dodici famiglie di domanda, dallo studio dei prompt reali e dallo studio «Domande e statistiche» (`docs/studio-domande-statistiche.md`): generica, per bisogno, per specialità, per requisito (con orari e urgenza), per prezzo, per occasione, per recensioni, vicino a te (posizione impostata in cinque punti intorno all'attività nel Base e nel Pro), informativa (contata a parte), di confronto, sul nome, in inglese. Si contano intenti distinti (`QUOTE` in `src/lib/profiles.ts`: report singolo 36, Base 48, Pro 72); ogni intento spontaneo ha due forme, breve e con la richiesta esplicita di più opzioni (`secondaForma`), che sono le sue ripetizioni; nei confronti la seconda forma inverte i nomi. Lo stesso intento è chiesto a più livelli di zoom (città, zona; provincia, regione, Italia per il B2B). Il set non si mostra al titolare prima della scansione. I modelli sono scritti per 36 categorie in ordine di numerosità (ISTAT-ASIA 2023 via Eurostat) in `src/data/profiles/`, con template per prezzo, orari, occasione, recensioni, vicino a te e informative per gruppo di settori; `docs/genera-profili.mjs` li rigenera da un'unica tabella (`node docs/genera-profili.mjs src/data/profiles`). Lo studio dei settori è in `docs/studio-settori-domande.md`.

## Marchio

Una risposta di un assistente (la bolla con l'elenco) la cui coda è un segnaposto: il locale che compare nella risposta. La riga accesa con il punto è "tu". Componente `Simbolo` in `src/components/Marchio.tsx`, favicon in `src/app/icon.svg`, versione vettoriale nel PDF, anteprima social generata in `src/app/opengraph-image.tsx`.

## Regole di prodotto (dalla roadmap)

- Italiano del tu, frasi corte, zero inglese nell'interfaccia. Niente «gratis», niente conteggi di domande sul sito: il set è il metodo.
- Un colore d'accento (verde scuro) per "tu"; rosso solo per "Invisibile" e per gli errori di scheda.
- Un font per tutto (Instrument Sans, titoli leggermente condensati con l'asse `wdth`), punteggio a 64 px, testo a 16 px. Solo barre orizzontali, barre a segmenti, mappe a celle a un colore e una linea per l'andamento.
- Mai corsivo. Le domande scritte dai clienti sono nello stesso font, in peso medio.
- Ogni numero con il suo campione ("2 su 3"), mai un sì/no. Ogni consiglio legato a un dato del report.
- Mai "ChatGPT" o "GPT" nel nome o nel dominio. I marchi solo nel testo ("funziona con ChatGPT, Gemini…").
- Nessuna registrazione prima del risultato.

## Prossimi passi

1. **Profilo attività**: fatto (`src/lib/profilo/`); manca la verifica della presenza sui portali di categoria.
2. **Scansione**: fatta (`src/lib/scansione/`, `src/lib/motori/`); da provare con le chiavi vere e da misurare (tempi, errori per assistente, costo per scansione); cache delle risposte 7 giorni ancora da fare.
3. **Analisi risposte**: fatta a regole (`src/lib/analisi/`); da misurare la precisione del riconoscimento su un campione a mano (Allegato A del metodo) e da aggiungere gli alias del nome.
4. **Consigli**: oggi a regole; un passaggio con Claude può riscrivere il «dato» delle azioni e il tono delle descrizioni, con JSON in ingresso e in uscita e azioni solo dal profilo della categoria.
5. **Abbonamento**: Stripe Checkout, link magico via Resend, area personale minima.
6. **Database**: Supabase; tabella motori/pesi e profili di categoria caricati da `src/data`.
