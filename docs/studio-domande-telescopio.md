# Il telescopio delle domande: quante, quali, come

Studio a supporto del set di domande di Visibilità AI (21 ottobre 2026). Risponde a tre domande: quante domande servono perché i numeri reggano, come si costruiscono per dare statistiche utili e non banali, e cosa fanno gli strumenti seri e la ricerca.

## 1. Cosa dice la ricerca

**La varianza sta nelle domande, non nelle ripetizioni.** Chi ha misurato le fonti di variabilità delle risposte degli assistenti trova che la differenza tra una domanda e l'altra è maggiore di quella tra due ripetizioni della stessa domanda; dopo cinque ripetizioni il guadagno di precisione per chiamata è il più basso di tutte le leve, mentre lingue, modelli e parafrasi rendono di più per lo stesso costo. Raccomandazione esplicita: «fermati intorno a cinque ripetizioni per cella e spendi in ampiezza» (Where Does the Noise Come From? A Variance-Components Decomposition, arXiv 2607.13304, 2026).

**Un protocollo standard per le ripetizioni.** Il Dice Roll Method (arXiv 2609.04047, 2026) propone di trattare ogni risposta come un campione: 5 ripetizioni per uno studio esplorativo (G = 0,58), 10 per uno confermativo (0,74), 15 per uno rigoroso (0,81), con un pilota per stimare le componenti di varianza; e una batteria di metriche di famiglie diverse (volume, composizione dell'insieme, concentrazione, similarità) invece di un indicatore solo. Le formulazioni dello stesso intento sono una faccetta con varianza propria: vanno campionate, non scelte una volta.

**Gli assistenti con ricerca web convergono presto.** In un audit a campione finito (arXiv 2609.05059, 2026), gli assistenti senza ricerca continuavano ad aggiungere nomi mai visti alla quindicesima ripetizione; quello con ricerca web (Perplexity) raggiungeva il 100% della ricchezza stimata entro cinque. Una ripetizione sola mostra il 62–77% dei nomi di cinque ripetizioni; i sei assistenti si sovrappongono poco (il migliore copre l'83% dell'unione). Conseguenza: interrogare tutti e sei, con 2–3 ripetizioni ciascuno, è la configurazione giusta per API con ricerca.

**Quante risposte per un intervallo accettabile.** Con una quota osservata vicina al 25%, 72 risposte danno un intervallo al 95% di circa ±10 punti e 300 circa ±5; per distinguere un passaggio dal 20% al 30% servono circa 294 risposte per periodo. La varianza tra domande supera quella entro la domanda: con budget limitato, più domande battono più ripetizioni; le varianti di formulazione sono «repliche» dello stesso intento e vanno marcate come tali (cloro.dev, AI Visibility Sample Size, 2026; Evertune, Methodology, 2026: 100 domande × 100 ripetizioni danno ±1 punto complessivo e ±2 per tema; una domanda chiesta una volta ha un margine di ±44 punti).

**La posizione conta meno della presenza.** La stessa domanda ripetuta restituisce la stessa lista meno di una volta su cento e nello stesso ordine circa una su mille, ma i nomi forti restano nel 60–90% delle risposte (SparkToro, 2026). Per questo il report usa «nei primi tre» e le quote, non la posizione media.

**La geografia è una dimensione.** Local Falcon misura la visibilità AI da una griglia di punti GPS (es. 7×7 su due miglia), con una risposta, una lista di nomi e una posizione per ogni punto; gli assistenti concentrano i consigli su pochi nomi (i primi cinque raccolgono l'80% e più delle citazioni: Dudy et al., IUI 2025, arXiv 2504.05325). Google stesso scompone una domanda in più sotto-domande in parallelo (query fan-out) e le ricompone: una domanda «grande» è in realtà un fascio di domande più piccole (Search Engine Journal, 2026).

**Quello che chiedono davvero.** Le domande agli assistenti sono frasi di 8–25 parole con un luogo e almeno un vincolo (Semrush, 2025–26); una su quattro è un confronto tra nomi (Citations.press, 2026); le piattaforme professionali le raggruppano per intento e tema e misurano quote e margini a livello di gruppo (Evertune; Semrush Prompt Research, con intenti informazionale, navigazionale, commerciale, transazionale, di compito).

## 2. Il disegno

**Famiglie.** Nove famiglie di domanda: generiche, per bisogno, per specialità, per requisito, per occasione (chi chiede e perché: famiglia, coppia, lavoro, gruppo, turisti, budget, subito; per le aziende: piccole serie, grandi volumi, urgenza, certificazioni, startup, estero), vicino a te, di confronto (una per concorrente noto), sul nome, in inglese. Le prime sei sono «spontanee» (il cliente non fa il nome dell'attività) e fanno il punteggio; le altre tre sono riportate a parte.

**Il telescopio.** Lo stesso intento a tre livelli di zoom: città («a Bergamo»), zona («in zona centro a Bergamo»), vicino a te («vicino a me», con la posizione impostata nelle API in cinque punti: l'indirizzo e 1,2 km a nord, est, sud, ovest; nove con le diagonali nel set esteso). Per il B2B: provincia, regione, Italia. Gli assistenti che accettano le coordinate sono Gemini (`retrievalConfig.latLng`), Google AI (`location_coordinate` di DataForSEO) e Perplexity (`user_location` con latitudine e longitudine); ChatGPT e Claude accettano città e regione; Grok nessuna posizione. La mappa «intorno a te» è calcolata solo sui primi tre, e il report lo dichiara.

**Formulazioni.** I template che iniziano con la categoria («pizzeria aperta la domenica a Bergamo») sono chiesti in tre forme: diretta, colloquiale («cerco una pizzeria aperta la domenica a Bergamo: cosa mi consigli?»), imperativa («consigliami una pizzeria aperta la domenica a Bergamo»). Gli articoli sono calcolati dal nome della categoria («una pizzeria», «uno studio dentistico», «l'officina»). Le domande di un gruppo di intento con più formulazioni non vengono riscritte dal modello linguistico: la loro differenza è una misura del report («in N intenti su M la formulazione non cambia il risultato»).

**Quote per piano.** Report singolo 36 domande (generiche 6, bisogno 6, specialità 6, requisito 4, occasione 4, vicino 5, confronto 2, nome 3), 2 ripetizioni nella stessa giornata: 432 risposte, 72 per famiglia da sei. Base 48 (8, 8, 7, 6, 6, 5, 3, 3, inglese 2 dove previsto), 3 ripetizioni in tre giorni: 864 risposte. Pro 72 (12, 12, 10, 8, 8, 9 punti, 5, 4, inglese 4), 2 ripetizioni ogni due settimane. Le famiglie che non arrivano alla quota (poche specialità, nessun requisito) lasciano il posto alle altre, così il totale resta quello del piano. Le quote prendono prima una variante per ogni intento, poi le repliche: con poche domande c'è copertura, con tante c'è profondità.

**Cosa si può leggere, in più.** Per famiglia, con intervallo: cosa manca (orari e prestazioni, occasioni, zona). Per zoom: dove manca (in città, in zona, intorno a te). Intorno a te: la mappa 3×3 dei punti. Per occasione: quali pubblici gli assistenti non ti assegnano. Formulazione: quanto contano le parole. Confronto diretto per concorrente: in quante risposte sei il primo nome. Il resto è invariato: quota di voce, nei primi tre, territorio, fonti, parole, cosa dicono di te, tre azioni.

**Costo per scansione (stima, da misurare con le chiavi vere).** Una domanda sui sei assistenti costa circa 10–12 centesimi (ChatGPT con ricerca ≈ 1,7 c; Gemini con grounding ≈ 3,5 c, più Maps; DataForSEO ≈ 0,5 c; Claude con ricerca ≈ 2 c; Perplexity ≈ 1 c; Grok ≈ 2,5 c). Report singolo ≈ 8 €, Base ≈ 16 € al mese, Pro ogni due settimane ≈ 32 € al mese: per il Pro settimanale servirebbero 79–99 € al mese.

## 3. Fonti

- The Dice Roll Method: A Standardized Protocol for Repeated-Query Auditing of LLM Brand Recommendations, arXiv 2609.04047 (2026).
- Measuring Brand and Source Discovery under Repeated LLM Queries: A Finite-Sample Audit, arXiv 2609.05059 (2026).
- Where Does the Noise Come From? A Variance-Components Decomposition of Non-Determinism in LLM Brand Answers, arXiv 2607.13304 (2026).
- Evertune, How Evertune Measures AI Visibility — Methodology (2026).
- cloro.dev, AI Visibility Sample Size: How Many Prompts and Runs (2026).
- Local Falcon, How Local Falcon's Local AI Visibility Tracking Works (2026).
- Dudy et al., Large language models create an uneven informational layer over cities, IUI 2025, arXiv 2504.05325.
- Search Engine Journal, Google explains query fan-out in AI search (2026).
- Semrush, AI search traffic study (2025); Semrush Prompt Research report (2026).
- SparkToro, AI recommendation inconsistency study (2026); Citations.press (2026).
- IAB Italia, Osservatorio Search in Italy 2026 (1.000 adulti online, marzo 2026): 35,3% decide gli acquisti con la ricerca generativa (19,6% nel 2025); 64,4% visita poi un negozio fisico.
