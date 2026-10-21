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
| Report (8 sezioni) | `/report/esempio` | fatta; `?abbonato=1` mostra l'andamento |
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

Sezioni, nell'ordine: intestazione con il campione e un indice delle sezioni · punteggio con scala a fasce, mediana della categoria come riferimento, distribuzione delle posizioni · "In breve" (sintesi scritta dai dati) e punteggio stimato dopo le azioni · per assistente · per tipo di domanda · chi consigliano al posto tuo + testa a testa + "chi cita chi" (attività × assistente) · mappa domanda × assistente (heatmap, un solo colore: più scuro = posizione migliore) · le parole che usano (con quante volte nelle tue recensioni) · da dove prendono le informazioni (con quanti concorrenti ci sono) · cosa dice ogni assistente di te + errori · tre azioni con "dove puoi arrivare" (punti stimati per azione) · come è stato fatto.
Contesto (`contesto`: attività analizzate, mediana, percentile) e punti stimati per azione oggi sono nel mock; in produzione arrivano dal database e dal modello dei consigli.
Statistiche (`src/lib/stats.ts`): tasso di citazione con intervallo di Wilson al 95%, copertura delle domande, posizione media, stabilità delle risposte (celle concordi su tutte le ripetizioni), punteggio parziale per assistente, concentrazione dei consigli (quota dei primi tre), coerenza dei dati di scheda, proiezione lineare a tre mesi.
Guida alla lettura (`src/lib/glossario.ts`): 16 voci, ognuna con cos'è, come si calcola, come si legge, cosa non è; usata nel report web (sezione "Guida alla lettura") e nel PDF (Allegato C).
Grafici ammessi: barre orizzontali, barre a segmenti, mappa a celle, una linea per l'andamento. Niente torte, radar, gauge.
Il PDF è un rapporto tecnico a 5 pagine: marchio e identificativo documento (`VAI-AAAAMMGG-ID`) in testata, sezioni numerate, tabelle, indice, contesto e stima, chi cita chi, allegati con metodo, pesi, limiti ed elenco domande. In white-label il nome dell'agenzia sostituisce il marchio (`logo` in `ReportPdf`).
Test gratuito: 8 domande × 2 ripetizioni, senza "In breve", "Le parole che usano" e PDF; al loro posto "Nel piano Base trovi anche".
Domande per piano: 8 nel test gratuito, 15 nel Base, 30 nel Pro e Agenzia (`src/lib/prezzi.ts`).

## Marchio

Una risposta di un assistente (la bolla con l'elenco) la cui coda è un segnaposto: il locale che compare nella risposta. La riga accesa con il punto è "tu". Componente `Simbolo` in `src/components/Marchio.tsx`, favicon in `src/app/icon.svg`, versione vettoriale nel PDF, anteprima social generata in `src/app/opengraph-image.tsx`.

## Regole di prodotto (dalla roadmap)

- Italiano del tu, frasi corte, zero inglese nell'interfaccia. "GEO" solo nelle pagine per le agenzie.
- Un colore d'accento (verde scuro) per "tu"; rosso solo per "Invisibile" e per gli errori di scheda.
- Un font (Inter), punteggio a 64 px, testo a 16 px. Solo barre orizzontali e una linea per l'andamento.
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
