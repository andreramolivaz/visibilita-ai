# Visibilità AI

Un servizio self-service in italiano che dice a un'attività locale se ChatGPT, Gemini, Google AI, Claude, Perplexity e Grok la consigliano o consigliano i concorrenti, e cosa fare per cambiare le cose.

**Promessa:** in 60 secondi sai se ti consigliano, chi ti passa davanti e le tre cose da sistemare. Il test gratuito aggancia, l'abbonamento da 29 € al mese paga.

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
| Prezzi, Agenzie, Privacy | `/prezzi` `/agenzie` `/privacy` | fatte |

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

Statistiche (`src/lib/stats.ts`): tasso di citazione con intervallo di Wilson al 95%, quota di voce (citazioni tue su tutte le citazioni di attività, come Peec/Profound/Semrush/BrightLocal), copertura, nei primi tre (al posto della posizione media, instabile per costruzione), territorio, stabilità delle risposte, punteggio parziale per assistente, concentrazione dei consigli, dati corretti, confronto diretto. Nessuna previsione: le risposte degli assistenti non hanno una base statistica che le renda prevedibili; mostriamo l'andamento.
Riferimenti esterni (`src/lib/riferimenti.ts`): gli studi di settore (SOCi, Insites, Local Falcon, SparkToro, BrightLocal) con cui il report confronta il risultato, perché uno zero è la norma e non un difetto della misura.
Definizioni (`src/lib/glossario.ts`): 18 voci, ognuna con cos'è, come si calcola, come si legge, cosa non è; nel report web (note tecniche) e nel PDF (Allegato C).
Grafici ammessi: barre orizzontali, barre a segmenti, mappa a celle, una linea per l'andamento. Niente torte, radar, gauge, previsioni.
Il PDF è un rapporto tecnico di 5 pagine: sintesi e azioni · concorrenti e dove ti trovano · mappa e fonti · cosa dicono di te e metodo · riferimenti esterni e definizioni. Marchio e identificativo documento (`VAI-AAAAMMGG-ID`) in testata; in white-label il nome dell'agenzia sostituisce il marchio (`logo` in `ReportPdf`).
Test gratuito: 8 domande × 2 ripetizioni, senza "Le parole che usano" e PDF; al loro posto "Nel piano Base trovi anche".
Domande per piano: 8 nel test gratuito, 15 nel Base, 30 nel Pro e Agenzia (`src/lib/prezzi.ts`). Nell'abbonamento le ripetizioni sono in giorni diversi.

## Le domande e i settori

Sei tipi di domanda, dallo studio dei prompt reali (Semrush 2025–26, Otterly, Citations.press, BrightLocal): generica, per bisogno, per specialità, per requisito, di confronto, sul nome; più l'inglese per chi esporta o riceve stranieri. I modelli sono scritti per 36 categorie in ordine di numerosità (ISTAT-ASIA 2023 via Eurostat), da «Negozi al dettaglio» (532 mila imprese) a «Musei» (1.282), in `src/data/profiles/`; ogni profilo ha anche fonti attese, metriche e azioni ammesse. Lo studio completo («Visibilità AI per tutte le attività italiane: settori, domande reali, fonti, metriche e metodo di raccolta») è in `docs/studio-settori-domande.md`; `docs/genera-profili.mjs` riscrive i profili da un'unica tabella (`node docs/genera-profili.mjs src/data/profiles`, poi rigenerare `index.ts`).

## Marchio

Una risposta di un assistente (la bolla con l'elenco) la cui coda è un segnaposto: il locale che compare nella risposta. La riga accesa con il punto è "tu". Componente `Simbolo` in `src/components/Marchio.tsx`, favicon in `src/app/icon.svg`, versione vettoriale nel PDF, anteprima social generata in `src/app/opengraph-image.tsx`.

## Regole di prodotto (dalla roadmap)

- Italiano del tu, frasi corte, zero inglese nell'interfaccia. "GEO" solo nelle pagine per le agenzie.
- Un colore d'accento (verde scuro) per "tu"; rosso solo per "Invisibile" e per gli errori di scheda.
- Un font (Instrument Sans), punteggio a 64 px, testo a 16 px. Solo barre orizzontali e una linea per l'andamento.
- Ogni numero con il suo campione ("2 su 3"), mai un sì/no. Ogni consiglio legato a un dato del report.
- Mai "ChatGPT" o "GPT" nel nome o nel dominio. I marchi solo nel testo ("funziona con ChatGPT, Gemini…").
- Nessuna registrazione prima del risultato.

## Prossimi passi

1. **Profilo attività**: Google Places + lettura del sito + verifica portali → JSON (Claude).
2. **Scansione**: coda con un worker per motore (OpenAI Responses, Gemini grounding, DataForSEO), ripetizioni, cache 7 giorni.
3. **Analisi risposte**: riconoscimento dell'attività e dei concorrenti (nome + indirizzo + telefono, alias), estrazione fonti.
4. **Consigli**: prompt Claude con JSON in ingresso e in uscita, azioni solo dal profilo della categoria.
5. **Abbonamento**: Stripe Checkout, link magico via Resend, area personale minima.
6. **Database**: Supabase; tabella motori/pesi e profili di categoria caricati da `src/data`.
