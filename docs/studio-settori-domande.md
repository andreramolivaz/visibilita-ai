# Visibilità AI per tutte le attività italiane: settori, domande reali, fonti, metriche e metodo di raccolta

Studio di ricerca – 21 ottobre 2026. Tutte le cifre sono riferite alla fonte e alla data indicate nel link; dove un numero esatto non esiste, lo dico e riporto la migliore stima disponibile.

---

## Sintesi in dieci punti

1. In Italia ci sono **5.849.524 imprese registrate** (Registro Imprese, 31/12/2025) e **4.616.886 imprese attive** (ISTAT-ASIA 2023, che include i liberi professionisti ma esclude l'agricoltura). Sono due perimetri diversi e il prodotto deve scegliere il secondo come base, perché è quello che include avvocati, commercialisti, medici e dentisti.
2. I settori più numerosi per **imprese attive** sono: commercio al dettaglio (532.049), costruzioni (532.957, di cui 143.550 impiantisti), commercio all'ingrosso (360.471), manifattura (352.446, di cui 142.457 metalmeccanica), sanità privata (343.584), ristorazione (269.338), studi tecnici (231.564), immobiliare (227.527), studi legali (178.713), parrucchieri ed estetica (137.466), commercialisti (133.140).
3. Negli USA il **45% dei consumatori** ha usato un assistente AI per trovare un'attività locale nell'ultimo anno (era il 6% un anno prima); in Italia ChatGPT ha **9,6 milioni** di utenti mensili e Gemini **9,4 milioni** (Audicom, luglio 2026). AI Mode è disponibile in italiano dall'8 ottobre 2025.
4. Le domande agli assistenti sono **2-3 volte più lunghe** di una ricerca Google (Google Italia), in media 23 parole in ChatGPT senza ricerca web contro 4,2 in modalità ricerca (Semrush 2025). Sono frasi complete con un bisogno, un luogo e un vincolo, non keyword.
5. Il **B2B** è già dentro gli assistenti: l'89% dei buyer B2B usa la GenAI nel processo d'acquisto (Forrester), il 50% dei buyer software inizia la ricerca in una chat AI (G2, ott. 2025). Le domande B2B differiscono per geografia (provincia/regione, non quartiere), vincoli (certificazioni, lotti, tempi) e lingua (inglese per l'export: 137.664 operatori italiani esportano).
6. Essere raccomandati è **raro**: ChatGPT raccomanda l'1,2% delle sedi monitorate da SOCi (contro il 35,9% nel local pack); l'83% dei ristoranti non compare mai in ChatGPT (Local Falcon); il 40,9% delle attività locali non è mai raccomandato da ChatGPT e il 68,8% da Perplexity (Insites). Questo è esattamente il valore del prodotto.
7. Le **fonti** che gli assistenti citano sono poche e concentrate: siti dell'attività (72% delle query di awareness in ChatGPT), Google Maps, Yelp/TripAdvisor, OTA (55% delle citazioni hotel), directory di settore (41% delle citazioni su prompt di selezione fornitori). Per l'Italia servono misurazioni proprie: non esistono studi pubblici sulle quote di MioDottore, Immobiliare.it, PagineGialle, Europages nelle risposte AI.
8. Le metriche degli strumenti concorrenti convergono su quattro numeri: **visibilità** (% risposte che menzionano il brand), **share of voice** (% delle menzioni totali), **posizione media**, **citazioni per fonte**. Sentiment e "AI rank" hanno poco valore per un'attività singola.
9. Le risposte AI sono **instabili**: la probabilità di ottenere la stessa lista due volte è sotto 1/100, nello stesso ordine circa 1/1000 (SparkToro, ~3.000 esecuzioni). Una misura difendibile richiede ripetizioni (decine di esecuzioni per prompt) e intervalli di confidenza, non un singolo run.
10. **API e app non coincidono**: Brandlight ha misurato un overlap di brand tra interfaccia e API del 6-12%; ma su prompt chiusi (Massive) l'accordo sale all'87%. Il prodotto deve dichiarare il canale, fissare la località (OpenAI `user_location`, Perplexity `user_location`, Gemini Maps `latLng`) e rivalidare ogni trimestre.

---

## 1. I settori in Italia, dal più grande al più piccolo

### 1.1 Due fonti, due perimetri

- **Movimprese (Unioncamere-InfoCamere)** conta le imprese *registrate* presso le Camere di commercio: 5.849.524 al 31 dicembre 2025, con 323.533 iscrizioni e 266.934 cessazioni nell'anno (saldo +56.599, +0,96%). Include l'agricoltura (676.530) e anche imprese inattive o in liquidazione; non include i liberi professionisti iscritti agli Ordini. Fonte: [comunicato Movimprese anno 2025, 23 gennaio 2026](https://www.unioncamere.gov.it/sites/default/files/articoli/2026-01/23012026_com_movi_anno_2025.docx) (versione PDF su [InfoCamere](https://www.infocamere.it/dam/jcr:b69525da-fd2b-437a-87e2-5f803d17e20c/2025_a_4c.pdf)).
- **ISTAT – Registro statistico delle imprese attive (ASIA)** conta le imprese *attive* dell'industria e dei servizi: 4.616.886 imprese e 18.644.423 addetti nel 2023. Include le partite IVA dei professionisti (avvocati, commercialisti, medici), esclude agricoltura e PA. Fonte: [ISTAT, Annuario statistico italiano 2025, cap. 14 "Imprese", prospetto 14.1](https://www.istat.it/storage/ASI/2025/capitoli/C14.pdf). Il dettaglio per codice ATECO/NACE a 3 e 4 cifre è lo stesso registro trasmesso a Eurostat (SBS, dataset [sbs_ovw_act](https://ec.europa.eu/eurostat/databrowser/view/sbs_ovw_act/default/table), aggiornamento 30/09/2026), che ho interrogato via API per l'Italia, anno 2023.

Per un prodotto che vende a "tutte le attività" la base corretta è ASIA: è l'unica che mette insieme la pizzeria, lo studio dentistico e l'avvocato. Movimprese serve per i trend annuali e per l'agricoltura.

### 1.2 Macro-settori (imprese registrate, Movimprese, 31/12/2025)

| Settore ATECO | Stock 31/12/2025 | Var. 2025 |
|---|---:|---:|
| Commercio (G) | 1.336.985 | −0,72% |
| Costruzioni (F) | 818.723 | +1,12% |
| Agricoltura, silvicoltura, pesca (A) | 676.530 | −1,17% |
| Attività manifatturiere (C) | 486.155 | −0,80% |
| Alloggio e ristorazione (I) | 457.023 | +1,66% |
| Attività immobiliari (L) | 313.710 | +2,69% |
| Attività professionali, scientifiche e tecniche (M) | 262.081 | +3,97% |
| Altre attività di servizi (S) | 256.988 | +2,32% |
| Noleggio, agenzie di viaggio, servizi alle imprese (N) | 220.886 | +3,08% |
| Trasporto e magazzinaggio (H) | 156.156 | +1,49% |
| Attività finanziarie e assicurative (K) | 148.367 | +5,89% |
| Informazione e comunicazione (J) | 142.487 | +2,05% |
| Attività artistiche, sportive, intrattenimento (R) | 82.924 | +2,29% |
| Sanità e assistenza sociale (Q) | 48.638 | +2,52% |
| Istruzione (P) | 37.399 | +4,80% |

Fonte: [Movimprese 2025, tab. 4](https://www.unioncamere.gov.it/sites/default/files/articoli/2026-01/23012026_com_movi_anno_2025.docx). Nota: Sanità (48.638) e Istruzione (37.399) sono piccoli qui perché i medici e i formatori liberi professionisti non sono "imprese" per il Registro.

### 1.3 Classifica per categoria-prodotto (imprese attive, ISTAT-ASIA 2023 via Eurostat)

Questa è la classifica utile per decidere l'ordine di copertura del prodotto. I codici sono NACE Rev. 2 = ATECO 2007. Fonte unica: [Eurostat sbs_ovw_act, Italia, 2023, ENT_NR](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/sbs_ovw_act?format=JSON&lang=EN&geo=IT&time=2023&indic_sbs=ENT_NR) (aggregazioni mie, somme dei codici indicati).

| # | Categoria (come la vede il cliente) | Codici | Imprese attive 2023 |
|---:|---|---|---:|
| 1 | Negozi al dettaglio (tutti) | G47 | 532.049 |
| | – di cui alimentari specializzati | G472 | 108.499 |
| | – abbigliamento | G4771 | 57.081 |
| | – ambulanti | G478 | 71.166 |
| | – tabaccherie | G4726 | 31.338 |
| | – farmacie | G4773 | 19.644 |
| | – e-commerce puro | G4791 | 19.493 |
| 2 | Costruzioni (tutte) | F | 532.957 |
| | – finiture (imbianchini, pavimentisti, serramentisti, cartongesso…) | F433 | 247.954 |
| | – impiantisti (elettricisti 66.035; idraulici/termoidraulici 62.786; altri 14.729) | F432 | 143.550 |
| | – imprese edili (costruzione edifici + opere civili) | F41+F42 | 116.734 |
| 3 | Commercio all'ingrosso (incl. 197.311 agenti e rappresentanti) | G46 | 360.471 |
| 4 | Manifattura (tutta) | C | 352.446 |
| | – metalmeccanica (metalli, prodotti in metallo, elettronica, elettrotecnica, macchinari, mezzi di trasporto, riparazione/installazione macchine) | C24–C30 + C33 | 142.457 |
| | – di cui carpenteria metallica e serramenti in metallo | C251 | 27.773 |
| | – di cui lavorazioni meccaniche e trattamenti (conto terzi) | C256 | 22.232 |
| | – di cui macchinari e apparecchiature | C28 | 17.592 |
| | – alimentare e bevande (di cui 24.242 panifici/pasticcerie) | C10+C11 | 51.005 |
| | – moda (tessile, abbigliamento, pelle/calzature) | C13–C15 | 51.140 |
| | – legno e mobili | C16+C31 | 35.235 |
| 5 | Sanità privata (tutta) | Q86 | 343.584 |
| | – studi medici generici | Q8621 | 71.021 |
| | – studi medici specialistici | Q8622 | 76.434 |
| | – studi dentistici | Q8623 | 52.500 |
| | – altre attività sanitarie (fisioterapisti, psicologi, infermieri, laboratori, poliambulatori) | Q8690 | 142.931 |
| 6 | Ristorazione | I56 | 269.338 |
| | – ristoranti, pizzerie, take-away | I561 | 161.510 |
| | – bar, pasticcerie con somministrazione, gelaterie | I563 | 104.501 |
| 7 | Studi tecnici (ingegneri 151.859; architetti 79.705) | M711 | 231.564 |
| 8 | Immobiliare (tutto) | L68 | 227.527 |
| | – agenzie immobiliari | L6831 | 37.773 |
| | – amministratori di condominio e gestione immobili | L6832 | 18.052 |
| 9 | Altre attività professionali (consulenti vari 108.333; design 50.707; fotografi 19.026; traduttori 9.182) | M74 | 187.248 |
| 10 | Studi legali | M691 | 178.713 |
| 11 | Parrucchieri, barbieri, estetiste | S9602 | 137.466 |
| 12 | Commercialisti, consulenti del lavoro, contabilità | M692 | 133.140 |
| 13 | Consulenza aziendale e direzionale | M702 | 100.907 |
| 14 | Informatica (software house, consulenza IT 58.741; data/hosting/web 40.411) | J62+J63 | 99.152 |
| 15 | Agenti assicurativi, mediatori creditizi, consulenti finanziari | K66 | 96.669 |
| 16 | Trasporti e logistica (autotrasporto merci 55.798; traslochi 1.735; magazzini/spedizionieri 21.631; corrieri 3.946) | H494+H52+H53 | 83.111 |
| 17 | Servizi di supporto alle imprese (segreteria, call center, recupero crediti, imballaggio, altro) | N82 | 77.225 |
| 18 | Autofficine, carrozzerie, gommisti, elettrauto | G4520 | 73.249 |
| 19 | Ricettività (hotel 21.203; case vacanza, affitti brevi, B&B imprenditoriali 37.152; campeggi 1.528) | I55 | 60.113 |
| 20 | Pulizie e giardinaggio (pulizie 32.018 + altre 5.576; giardinieri 19.566) | N81 | 59.303 |
| 21 | Istruzione privata (altra istruzione: lingue, formazione, ripetizioni 22.362; sport 10.622; autoscuole 4.670; culturale 4.771) | P85 | 47.833 |
| 22 | Arte e spettacolo (artisti, produzione eventi) | R90 | 43.316 |
| 23 | Agenzie di comunicazione, pubblicità, PR, ricerche di mercato | M731+M7021+M732 | 39.835 |
| 24 | Sport e fitness (palestre 3.575; impianti sportivi 3.609; club 2.033; altre attività sportive incl. personal trainer 9.880; parchi e divertimento 14.277) | R93 | 33.374 |
| 25 | Concessionarie auto e moto | G4511+G4540 | 31.638 |
| 26 | Taxi e NCC | H4932 | 26.883 |
| 27 | Riparazione beni personali (elettronica, elettrodomestici, calzature, orologi) | S95 | 24.122 |
| 28 | Agenzie di viaggio (4.671), tour operator (5.102), altri servizi di prenotazione (10.133) | N79 | 19.906 |
| 29 | Veterinari | M75 | 17.815 |
| 30 | Noleggio (auto 3.482; attrezzature; altro) | N77 | 16.077 |
| 31 | Lavanderie e tintorie | S9601 | 14.745 |
| 32 | Ricerca e sviluppo | M72 | 14.425 |
| 33 | Gestione rifiuti e recupero materiali | E38 | 6.703 |
| 34 | Organizzazione di convegni e fiere | N8230 | 4.492 |
| 35 | Vigilanza e investigazioni | N80 | 2.343 |
| 36 | Musei e istituzioni culturali private | R91 | 1.282 |

Avvertenze: S9609 "altri servizi alla persona" (37.349) contiene onoranze funebri, tatuatori, centri benessere non classificati; Q8690 non separa i fisioterapisti dagli psicologi; P8559 non separa le scuole di lingue dai centri di formazione: per questi tre gruppi non esiste un conteggio ufficiale separato a livello ASIA.

### 1.4 Numeri di settore da altre fonti (per confronto e per l'agricoltura)

- **Ristorazione**: FIPE conta circa **328.000 imprese** nel 2024 (−1,2% sul 2023), 1,5 milioni di occupati, consumi oltre 96 miliardi ([FIPE, Rapporto Ristorazione 2025, comunicato 9 aprile 2025](https://www.fipe.it/wp-content/uploads/2025/04/CS-Rapporto-2025.pdf)). Confcommercio su dati InfoCamere: **103.100 bar** e **168.300 ristoranti** attivi nel 2024; i bar sono −19,1% dal 2012, i ristoranti +17,1% ([Confcommercio, 15 novembre 2025](https://www.confcommerciomilano.it/export/sites/unione/doc/news_comunicati/pdf/2025/176-15.11.2025-Confcommercio-su-desertificazione-commerciale.pdf)).
- **Commercio al dettaglio**: 433.600 negozi in sede fissa e 70.900 ambulanti attivi nel 2024 (totale dettaglio 534.500), −18,9% dal 2012 (stessa fonte Confcommercio).
- **Alloggio**: 22.100 alberghi e 43.100 "altre forme di alloggio" (B&B ecc.) come imprese attive nel 2024 (Confcommercio); come *esercizi* ISTAT conta nel 2024 **32.943 alberghi** e **232.376 esercizi extra-alberghieri** (156.398 alloggi in affitto gestiti in forma imprenditoriale, 35.015 B&B, 21.215 agriturismi, 2.751 campeggi) ([ISTAT, Annuario 2025, cap. 19, prospetto 19.1](https://www.istat.it/storage/ASI/2025/capitoli/C19.pdf)). La differenza tra 60.113 imprese ASIA e 265.319 esercizi ISTAT è dovuta a B&B e affitti brevi non imprenditoriali: per il prodotto significa che il "parco clienti" ricettivo è molto più ampio del Registro Imprese.
- **Agriturismi**: **26.360 aziende** autorizzate nel 2024 (+0,9%) (ISTAT, "Le aziende agrituristiche in Italia", via [Italpress, 9 marzo 2026](https://www.italpress.com/?p=655552)).
- **Agricoltura**: 676.530 imprese registrate (Movimprese 2025); non in ASIA.
- **Avvocati**: **233.260 iscritti a Cassa Forense** nel 2024, in calo dell'1,6% ([Rapporto Censis-Cassa Forense 2025](https://miolegale.it/notizie/rapporto-censis-avvocatura/)). ASIA conta 178.713 "attività legali" (studi, incluse società).
- **Commercialisti**: **119.050 iscritti all'Albo** a fine 2025, −0,8% ([Rapporto 2026 FNC, via Informazione Fiscale](https://www.informazionefiscale.it/stipendio-commercialista-quanto-guadagna-dati-rapporto)).
- **Odontoiatri**: circa **65.000 iscritti** all'Albo odontoiatri FNOMCeO ([Italpress, 24 marzo 2026](https://www.italpress.com/in-italia-65-mila-odontoiatri-professione-in-crescita/)); ASIA conta 52.500 studi dentistici.
- **Musei**: **4.416 musei e istituzioni similari** (ISTAT 2022, citato nel [rapporto Censis "Musei di vetro", 28 maggio 2026](https://www.censis.it/wp-content/uploads/2026/05/Sito-Musei-di-vetro.pdf)); la maggioranza è pubblica (58-71% per area), quindi il mercato "museo" per il prodotto è piccolo e per lo più istituzionale.
- **Imprese esportatrici**: **137.664 operatori** hanno venduto beni all'estero nel 2022 (ISTAT-ICE, Annuario 2023, via [Air Cargo Italy](https://aircargoitaly.com/?p=30979)); il 46,4% vende in un solo Paese. È la platea per cui le domande in inglese contano.

### 1.5 Che cosa implica per l'ordine di copertura

Partendo dalle 10 categorie attuali (ristoranti, hotel, dentisti, parrucchieri, idraulici, palestre, agenzie immobiliari, avvocati/commercialisti, musei, altro), l'ordine di estensione per numerosità è:

1. Negozi al dettaglio (532 mila, oggi scoperti) – da articolare almeno in alimentari, abbigliamento, farmacie/ottici, ferramenta/arredo, elettronica.
2. Edilizia completa: imprese edili e ristrutturazioni (117 mila), finiture (248 mila), elettricisti (66 mila) accanto agli idraulici già coperti.
3. Sanità privata completa: medici generici e specialisti (147 mila), fisioterapisti/psicologi/poliambulatori (143 mila) accanto ai dentisti.
4. Manifattura B2B: metalmeccanica (142 mila), alimentare (51 mila), moda (51 mila), legno-arredo (35 mila).
5. Commercio all'ingrosso e fornitori B2B (360 mila, di cui 197 mila agenti).
6. Studi tecnici (232 mila), consulenza (101 mila), informatica (99 mila), comunicazione (40 mila).
7. Autoriparazione (73 mila) e concessionarie (32 mila).
8. Trasporti e logistica (83 mila).
9. Estetica (dentro S9602), pulizie e giardinaggio (59 mila), istruzione privata (48 mila), agenzie viaggi (20 mila), veterinari (18 mila).

---

## 2. Cosa chiedono davvero le persone agli assistenti AI

### 2.1 Quanto si usa l'AI per trovare un'attività

- **Consumatori (USA)**: il 45% ha usato strumenti AI per avere raccomandazioni su attività locali negli ultimi 12 mesi, contro il 6% dell'anno precedente; l'AI è il terzo canale dopo Google e Facebook; ChatGPT è stato usato dal 31%, Google AI Mode dal 23%; il 63% degli utilizzatori si fida delle raccomandazioni ma il 97% le ricontrolla almeno a volte con le recensioni e l'88% verifica le fonti ([BrightLocal, Local Consumer Review Survey 2026, 1.002 adulti USA](https://www.brightlocal.com/research/lcrs-ai-trust/)). Nell'ultima ricerca di un'attività locale il 23% ha usato uno strumento AI, il 31% lo usa almeno mensilmente, ma solo l'8% lo sceglie come primo canale e solo il 18% contatterebbe l'attività senza ulteriori verifiche ([BrightLocal, luglio 2026, 1.227 consumatori](https://www.brightlocal.com/research/consumer-search-behavior-channels/)).
- **Italia**: audience mensile 18-74 anni a luglio 2026: ChatGPT 9,625 milioni, Gemini 9,374 milioni, Copilot 2,367, Claude 1,802, Perplexity 1,016 ([dati Audicom elaborati dall'AI Observatory di V. Cosenza, l'Adige 16 ottobre 2026](https://www.ladige.it/tecnologia/chatgpt-piu-usata-da-italiani-ma-cresce-gemini-ed-e-prima-su-mobile-tu9kzt4r)). AI Mode è disponibile in Italia e in italiano dall'8 ottobre 2025 ([Google Italia](https://blog.google/intl/it-it/ai-mode-arriva-anche-in-italia/)). Non esiste un'indagine italiana pubblica sull'uso dell'AI specificamente per cercare attività locali: il dato BrightLocal va considerato un tetto, non una stima italiana.
- **Uso generale di ChatGPT**: il 49% dei messaggi è "Asking" (chiedere informazioni o consigli), il 40% "Doing"; la ricerca di informazioni ("Seeking Information") è salita dal 14% al 24% dei messaggi tra luglio 2024 e luglio 2025, la "Practical Guidance" è stabile al 29%; i messaggi non lavorativi sono oltre il 70% ([Chatterji et al., "How People Use ChatGPT", NBER WP 34255, campione ~1,1 milioni di conversazioni](https://www.nber.org/system/files/working_papers/w34255/w34255.pdf)).

### 2.2 Che forma hanno le domande

- **Lunghezza**: nel 2025 un prompt medio a ChatGPT era di **23 parole**, contro **4,2** quando l'utente usa la modalità ricerca ([Semrush, 80 milioni di record clickstream, febbraio 2025](https://www.semrush.com/news/379285-new-semrush-study-reveals-chatgpt-search-trends-insights-from-80-million-clickstream-records/)). L'aggiornamento 2026 mostra convergenza: prompt con ricerca attiva da 4,7 a 8,7 parole, senza ricerca da 24,9 a 13,5; ChatGPT attiva la ricerca web sul 34,5% delle query; il 65-85% dei prompt non è riconducibile a nessuna keyword tradizionale ([Semrush, aprile 2026](https://www.semrush.com/blog/chatgpt-search-insights/)). Su un campione di 1.827 prompt reali indicizzati, media 42 parole e mediana 11 ([Metehan Yeşilyurt, agosto 2025](https://metehan.ai/pdf/i-analyzed-1827-real-user-prompts-from-chatgpt-here-what-ive-found-agentic-search.pdf)).
- **Google**: "le query in AI Mode sono in media lunghe il doppio delle ricerche tradizionali" (Sundar Pichai, [trimestrale Q1 2025, 24 aprile 2025](https://blog.google/inside-google/message-ceo/alphabet-earnings-q1-2025)); a ottobre 2025 "tipicamente il doppio" e "quasi tre volte" ([ppc.land su Q3 2025](https://ppc.land/google-executives-hint-at-a-unified-ai-search-interface/)); Google Italia al lancio: domande "due o tre volte più lunghe" ([blog.google/intl/it-it](https://blog.google/intl/it-it/ai-mode-arriva-anche-in-italia/)).
- **Intento**: circa il 70% delle query ChatGPT ricade in un intento "sconosciuto" rispetto alla tassonomia SEO (Semrush 2025); i prompt che somigliano a ricerche classiche sono per lo più navigazionali o transazionali (Semrush 2026). Otterly raccomanda di tracciare cinque famiglie: informativi, comparativi, task, valutativi ("Is X worth it?", "best tools for … under $50"), ideativi ([Otterly](https://ai-cache.otterly.ai/blog/prompts-tracking-research-chatgpt/index.html)).

Conseguenza pratica: i template devono essere frasi di 8-25 parole con almeno due vincoli (luogo + bisogno/specialità), non "dentista Milano".

### 2.3 I sette tipi di domanda, con evidenze

| Tipo | Che cosa contiene | Esempi documentati |
|---|---|---|
| **Generica** | categoria + luogo, "migliore", "consigli" | "recommend a plumber in Denver" (prompt di test [Insites](https://insites.com/blog/the-ai-visibility-benchmark-how-10000-local-businesses-actually-perform-in-chatgpt-and-perplexity/)); "best Italian restaurant near me" ([Local Falcon](https://www.localfalcon.com/research/the-ai-visibility-crisis-why-83-percent-of-restaurants-dont-exist-in-chatgpt)) |
| **Bisogno** | urgenza, orario, prezzo, situazione personale | "Which plumbers in Manchester can install an outdoor tap today at a good price?" ([Insites](https://insites.com/blog/what-ai-uses-to-choose-local-businesses-and-what-it-ignores/)); memoria ChatGPT che aggiunge "vegan" e "San Francisco" a una ricerca ristoranti ([OpenAI Help](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt)) |
| **Specialità/servizio** | la prestazione precisa | "what is the best dentist in park slope for teeth straightening?" ([BrightLocal](https://www.brightlocal.com/blog/new-local-ai-visibility-tracker/)) |
| **Zona** | città, quartiere, provincia, "vicino a me" | la localizzazione IP e, se attiva, quella precisa del dispositivo influenzano i risultati ([OpenAI Help](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt)) |
| **Requisito** | certificazione, convenzione, fattura, compatibilità | "Give me three CRM solutions for a hospital that work on iPads" ([G2](https://learn.g2.com/ai-search-surging-for-b2b-buyers)) |
| **Confronto** | "X o Y?", "meglio…" | 890 prompt di confronto su 3.850 (23%) nello studio Citations.press ([link](https://www.thailand-business-news.com/?p=328948)) |
| **Nome** | verifica di un'attività specifica, recensioni | "Does Bright Smile dentist in brooklyn do cosmetic dentistry?" ([BrightLocal](https://www.brightlocal.com/blog/new-local-ai-visibility-tracker/)); prompt di "verifica" = 21% dello studio Citations.press; Insites misura "awareness" (ChatGPT conosce il 93,6% delle attività ma ha i dettagli giusti solo nel 55,6%) |

Nel campione reale di Metehan le query commerciali contengono termini come "price", "supplier", "manufacturer" e un luogo (es. "Shanghai high-temperature filter", "air shower room price"): è la forma tipica del prompt B2B.

### 2.4 Consumer vs B2B: le differenze che contano

**Adozione B2B.** L'89% dei buyer B2B ha adottato la GenAI come fonte di informazione autonoma in ogni fase dell'acquisto ([Forrester, Buyers' Journey Survey 2024](https://www.forrester.com/report/b2b-buyer-adoption-of-generative-ai/RES181769)); il 50% dei buyer di software inizia il percorso in una chat AI anziché su Google (+71% in quattro mesi), la chat AI è la prima fonte per costruire la shortlist, ChatGPT è preferito dal 47% ([G2, 1.000+ buyer, ottobre 2025](https://learn.g2.com/ai-search-surging-for-b2b-buyers)); il 48% dei buyer USA usa la GenAI per scoprire fornitori contro il 14% nel resto del mondo, il 56% dei buyer tech contro il 28% negli altri settori ([Responsive, "Inside the Buyer's Mind", 350 buyer, via Demand Gen Report](https://www.demandgenreport.com/?p=50784)); il 94% usa LLM nel processo d'acquisto e il 95% dei fornitori vincenti era già nella shortlist del primo giorno ([6sense Buyer Experience Report 2025, 4.510 buyer, via GrackerAI](https://gracker.ai/data-and-research-reports/b2b-buyer-procurement-starts-in-chat-window)). Il dato "14% fuori USA" dice che in Italia il B2B su AI è in fase iniziale: è un mercato da educare, non ancora da difendere.

**Come cambiano le domande.**

| Dimensione | Consumer | B2B / industriale |
|---|---|---|
| Geografia | città, quartiere, "vicino a me", "zona {zona}" | provincia, regione, "nord Italia", distretto ("zona Brescia", "bassa bergamasca"), oppure nessun luogo se il fornitore spedisce |
| Oggetto | la prestazione per sé | lavorazione + materiale + spessore/lotto: "taglio laser lamiera inox 3 mm", "stampaggio plastica piccole serie" |
| Vincoli | prezzo, orario, urgenza, parcheggio | certificazioni (ISO 9001, EN 1090, ISO 13485, IATF 16949, BRC/IFC, SOA), "conto terzi", capacità, "piccole serie", lead time ("consegna in 48 ore"), campionatura, MOQ, pagamento |
| Verifica | recensioni, foto, prenotazione | referenze, clienti serviti, fatturato, anni di attività, sito con catalogo/PDF, LinkedIn |
| Lingua | italiano | italiano e inglese ("Italian supplier of…", "contract manufacturer in Lombardy") per 137.664 esportatori; le piattaforme AI citano per l'80,4% domini .com e l'.it non compare tra i primi 10 TLD citati da ChatGPT ([Profound, 680 milioni di citazioni](https://www.tryprofound.com/blog/ai-platform-citation-patterns)); la copertura dei dataset di monitoraggio è "più forte in inglese" ([Ahrefs](https://ahrefs.com/blog/brand-radar-methodology/)) |
| Forma | spesso una sola domanda | prompt lunghi con elenco di requisiti, richiesta di "3-5 fornitori", tabella comparativa, "one-shotting" della shortlist (G2) |

### 2.5 Che cosa si chiede per settore (sintesi)

| Settore | Tipi dominanti | Nota |
|---|---|---|
| Ristoranti/bar | generica, bisogno (orario, prezzo, bambini, cani), specialità (cucina), zona | il 97% ricontrolla con le recensioni; TheFork è integrata in ChatGPT come app ([Techprincess](https://techprincess.it/thefork-chatgpt-prenotazioni-ristoranti-conversazione-ai/amp/)) |
| Hotel/B&B/agriturismi | zona + bisogno (budget, parcheggio, pet, famiglia), confronto | le OTA sono il 55% delle fonti citate ([Cloudbeds](https://hoteltechnologynews.com/2025/07/research-otas-dominate-as-primary-source-in-ai-powered-hotel-discovery/)) |
| Medici/dentisti/fisioterapisti | specialità, requisito (convenzionato, urgenza, lingua), nome | prompt di verifica sul singolo studio (BrightLocal esempio dentista) |
| Idraulici/elettricisti/edili | bisogno (urgenza, "oggi"), specialità (caldaia, perdita), requisito (preventivo, fattura, bonus) | prompt-tipo Insites su Manchester |
| Avvocati/commercialisti | specialità (materia), bisogno (primo consulto, costo), requisito (gratuito patrocinio, forfettario) | — |
| Immobiliare | zona + servizio (vendere/affittare/valutare), confronto, nome | — |
| Parrucchieri/estetica | specialità (trattamento), bisogno (prezzo, senza appuntamento, orario) | — |
| Autofficine | bisogno (urgenza, preventivo), specialità (marca, ibride/elettriche, revisione), zona | — |
| Palestre/sport | bisogno (orario, prezzo, corsi), specialità (crossfit, pilates), zona | — |
| Metalmeccanica/manifattura | specialità (lavorazione+materiale), requisito (certificazioni, conto terzi, lotti), zona (provincia/regione), inglese | prompt "supplier/manufacturer/price" nei dati reali (Metehan) |
| Logistica | requisito (ADR, temperatura controllata, groupage), zona (tratte), capacità | — |
| Agenzie comunicazione/IT | specialità (servizio), confronto, requisito (budget, settore cliente), nome | B2B: la chat AI è la prima fonte per la shortlist (G2) |
| Scuole di lingue/formazione | specialità (certificazione, livello), bisogno (sera, online, prezzo), zona | — |
| Musei | generica (cosa vedere), bisogno (bambini, pioggia, gratis), nome | AI Overviews travel: 63,8% delle citazioni "cosa vedere" fuori dalla top 10 organica ([SEOZoom](https://www.seozoom.com/?p=34853)) |

### 2.6 Quanto spesso l'AI raccomanda davvero un'attività

- ChatGPT raccomanda l'**1,2%** delle sedi monitorate (oltre 350.000 sedi, 2.751 brand multi-sede), contro il 35,9% di presenza nel Google 3-pack: la visibilità AI è "quasi 30 volte più selettiva" ([SOCi, Local Visibility Index 2026, comunicato 28 gennaio 2026](https://www.soci.ai/news/in-ai-driven-discovery-few-brands-are-chosen-most-disappear/)); Gemini 11%, Perplexity 7,4%; accuratezza dei dati di profilo circa 68% su ChatGPT e Perplexity, 100% su Gemini; le sedi raccomandate da ChatGPT hanno rating medio 4,3 ([Search Engine Land](https://searchengineland.com/ai-local-visibility-report-2026-468085)).
- Su 10.000 attività locali USA, ChatGPT ne "conosce" il 93,6% ma non ne raccomanda mai il **40,9%** (Perplexity 68,8%) su cinque prompt di raccomandazione; telefono sbagliato nel 30,1% dei casi (ChatGPT) e 38,8% (Perplexity); le attività più raccomandate hanno in media 304 recensioni contro 118, e sono nel local pack nel 74,6% dei casi contro 21,1% ([Insites, luglio 2026](https://insites.com/blog/the-ai-visibility-benchmark-how-10000-local-businesses-actually-perform-in-chatgpt-and-perplexity/)). Il sito dell'attività è citato da ChatGPT nel 72% delle query di awareness e reputazione; Core Web Vitals, schema, llms.txt e FAQ schema non hanno correlazione misurabile ([Insites, maggio 2026](https://insites.com/blog/what-ai-uses-to-choose-local-businesses-and-what-it-ignores/)).
- L'**83%** dei ristoranti non compare mai nei risultati ChatGPT (189.905 risultati, febbraio 2026), contro il 14% invisibile su Google; ChatGPT sembra preferire rating ≥4,5 ([Local Falcon](https://www.localfalcon.com/research/the-ai-visibility-crisis-why-83-percent-of-restaurants-dont-exist-in-chatgpt)).
- Gli hotel raccomandati sono per il 72% affiliati a catene; i brand hanno un vantaggio di 4,43 punti di visibilità sugli indipendenti ([Cloudbeds, 145 hotel, 6 destinazioni](https://hoteltechnologynews.com/2025/07/research-otas-dominate-as-primary-source-in-ai-powered-hotel-discovery/)).

Per il prodotto: un risultato "0 citazioni su N domande" è la norma, non un bug. Il report deve spiegarlo con questi benchmark, altrimenti il cliente penserà che lo strumento non funzioni.

---

## 3. Template di domande per settore, in italiano colloquiale

Legenda tipi: **G** generica · **B** bisogno · **S** specialità/servizio · **Z** zona · **R** requisito · **C** confronto · **N** nome. Placeholder: `{categoria}` `{citta}` `{zona}` `{provincia}` `{regione}` `{specialita}` `{requisito}` `{nome}`. L'ordine segue la numerosità del §1.3. Le frasi sono volutamente colloquiali e a volte sgrammaticate, come i prompt reali.

### 3.1 Negozi al dettaglio (532.049)
1. «dove posso comprare {specialita} a {citta}? cerco un negozio fisico non online» — S/Z
2. «miglior negozio di {categoria} a {citta} zona {zona}» — G/Z
3. «negozio di {categoria} aperto la domenica a {citta}» — B
4. «{categoria} a {citta} che fa anche {requisito} (es. riparazioni, ordini su misura, consegna a casa)» — R
5. «cerco un negozio a {citta} dove trovare {specialita} di qualità senza spendere una follia» — B/S
6. «{nome} a {citta} è un buon negozio? recensioni» — N
7. «meglio {nome} o {nome} per comprare {specialita} a {citta}?» — C
8. «negozi di {categoria} vicino a me a {citta}, apertura ora» — Z/B
9. «negozio di {categoria} a {citta} con personale competente che mi consigli {specialita}» — B
10. «un posto a {citta} dove comprare {specialita} per un regalo, budget 50 euro» — B

### 3.2 Imprese edili e ristrutturazioni (116.734)
1. «impresa edile seria a {citta} per ristrutturare un appartamento di 80 mq» — G/B
2. «chi mi consigli per {specialita} (rifacimento bagno, cappotto termico, tetto) a {citta}?» — S
3. «impresa a {provincia} che fa ristrutturazione chiavi in mano con {requisito} (pratiche bonus, direzione lavori)» — R
4. «ditta edile a {citta} che faccia un preventivo gratuito e inizi entro un mese» — B
5. «{nome} impresa edile {citta} recensioni, sono affidabili?» — N
6. «meglio {nome} o {nome} per ristrutturare casa a {citta}?» — C
7. «impresa con attestazione SOA a {regione} per lavori pubblici categoria OG1» — R
8. «ditta per {specialita} in {zona} di {citta}, piccolo lavoro, che risponda al telefono» — S/Z
9. «cerco impresa edile {provincia} specializzata in case antisismiche / bioedilizia» — S
10. «quanto costa ristrutturare un bagno a {citta} e a chi mi rivolgo?» — B

### 3.3 Idraulici e termoidraulici (62.786)
1. «idraulico a {citta} che venga oggi, ho una perdita sotto il lavandino» — B
2. «idraulico urgente {zona} {citta} anche di sera» — B/Z
3. «chi installa {specialita} (caldaia a condensazione, pompa di calore, scaldabagno) a {citta}?» — S
4. «idraulico a {citta} che rilascia fattura e fa il preventivo prima» — R
5. «idraulico onesto a {citta}, non voglio farmi fregare sui prezzi» — B
6. «{nome} idraulico {citta} com'è? recensioni» — N
7. «manutenzione caldaia {marca} a {citta}, centro assistenza autorizzato» — S/R
8. «idraulico vicino a me a {citta} per sostituire un rubinetto, prezzo» — Z/B
9. «miglior termoidraulico in provincia di {provincia} per impianto a pavimento» — S/Z
10. «idraulico a {citta} per sbloccare scarico otturato, quanto costa?» — B

### 3.4 Elettricisti (66.035)
1. «elettricista a {citta} per rifare l'impianto elettrico di un appartamento» — S
2. «elettricista urgente {citta}, è saltata la corrente in casa e non torna» — B
3. «chi installa {specialita} (fotovoltaico, wallbox, domotica, videocitofono) a {citta}?» — S
4. «elettricista a {citta} che rilascia la dichiarazione di conformità» — R
5. «elettricista economico {zona} {citta} per montare 3 lampadari» — B/Z
6. «{nome} elettricista {citta} recensioni» — N
7. «meglio {nome} o {nome} per impianto fotovoltaico a {provincia}?» — C
8. «elettricista certificato a {citta} per certificazione impianto vendita casa» — R
9. «elettricista disponibile sabato a {citta}» — B
10. «installatore di impianti di allarme a {citta} che non costi un occhio» — S/B

### 3.5 Finiture: imbianchini, pavimentisti, serramentisti, falegnami (247.954)
1. «imbianchino bravo a {citta}, tinteggiatura 3 stanze, prezzo onesto» — G/B
2. «chi mette i serramenti a {citta}? cerco infissi in {specialita} (PVC, alluminio, legno)» — S
3. «posatore di parquet a {provincia} con esperienza» — S/Z
4. «serramentista a {citta} che gestisce la pratica {requisito} (bonus, detrazione)» — R
5. «falegname su misura a {citta} per armadio a muro» — S
6. «{nome} serramenti {citta} affidabile?» — N
7. «ditta cartongesso a {citta} che faccia anche l'isolamento acustico» — S
8. «imbianchino a {citta} disponibile questa settimana» — B
9. «meglio {nome} o {nome} per infissi a {citta}?» — C
10. «fabbro a {citta} per porta blindata, urgente, chiuso fuori casa» — B

### 3.6 Fornitori all'ingrosso e distributori B2B (360.471)
1. «grossista di {specialita} a {provincia} che serva anche piccoli negozi» — S/Z/R
2. «fornitore all'ingrosso di {categoria} in {regione} con consegna settimanale» — R
3. «cerco un distributore di {specialita} per un ristorante a {citta}, con minimo d'ordine basso» — B/R
4. «ingrosso {categoria} a {citta} aperto ai privati?» — R
5. «{nome} ingrosso {citta} come fornitore, è affidabile?» — N
6. «fornitore di {specialita} che fatturi e consegni in 48 ore in {regione}» — R
7. «migliori grossisti di {categoria} nel nord Italia» — G/Z
8. «cash and carry {specialita} vicino a {citta}» — Z
9. «distributore ufficiale {marca} per {regione}» — R
10. «confronta i fornitori di {specialita} in {provincia} per prezzo e tempi» — C

### 3.7 Metalmeccanica, carpenteria metallica, lavorazioni conto terzi (142.457)
1. «azienda che fa taglio laser lamiera vicino a {citta}» — S/Z
2. «fornitore di carpenteria metallica conto terzi in {regione}» — S/R/Z
3. «officina meccanica di precisione in provincia di {provincia} per piccole serie, tornitura e fresatura CNC» — S/R/Z
4. «chi fa {specialita} (piegatura, saldatura inox, zincatura, verniciatura a polvere, stampaggio) a {provincia}?» — S/Z
5. «carpenteria con certificazione {requisito} (EN 1090, ISO 9001, ISO 3834) in {regione}» — R
6. «azienda metalmeccanica che produca {specialita} su disegno, lotti da 50 pezzi, consegna in 2 settimane» — R/B
7. «{nome} di {citta}: che lavorazioni fanno, sono affidabili come fornitore?» — N
8. «meglio {nome} o {nome} per lavorazioni meccaniche conto terzi in {provincia}?» — C
9. «costruttore di macchine per {specialita} nel nord Italia, anche usato revisionato» — S/Z
10. «contoterzista per {specialita} in {regione} che faccia anche progettazione» — R
11. (EN) «Italian contract manufacturer for CNC machined parts, small batches, ISO 9001, near {citta}» — R/Z
12. (EN) «sheet metal fabrication supplier in {regione}, Italy, laser cutting and bending, export to Germany» — S/Z

### 3.8 Altra manifattura: alimentare, moda, legno-arredo, plastica, packaging (≈140.000)
1. «produttore di {specialita} (pasta artigianale, conserve, birra) in {regione} che faccia private label» — S/R
2. «fornitore di {specialita} conto terzi per un brand di abbigliamento, piccole quantità, in {regione}» — S/R
3. «falegnameria/mobilificio in {provincia} che produce arredi su misura per negozi» — S/Z
4. «azienda di stampaggio plastica in {regione} per piccole serie» — S/R
5. «produttore di packaging {specialita} (scatole, etichette, buste compostabili) in Italia con MOQ basso» — R
6. «{nome} è un buon fornitore di {specialita}?» — N
7. «aziende con certificazione {requisito} (BRC, IFS, biologico, GOTS) in {regione}» — R
8. «laboratorio di {specialita} conto terzi vicino a {citta}» — S/Z
9. «meglio {nome} o {nome} come fornitore di {specialita}?» — C
10. (EN) «Italian manufacturer of {specialita} for private label, minimum order 500 units» — R

### 3.9 Studi medici e specialisti (147.455)
1. «miglior {specialita} (dermatologo, ortopedico, ginecologo, cardiologo) a {citta}» — G/S
2. «{specialita} a {citta} che riceva presto, anche a pagamento, ho una visita urgente» — B
3. «{specialita} convenzionato / che accetti {requisito} (assicurazione, fondo sanitario) a {citta}» — R
4. «medico a {citta} che parli inglese per {specialita}» — R
5. «dove faccio {specialita} (ecografia, risonanza, visita allergologica) a {citta} senza aspettare mesi?» — B/S
6. «dottor {nome} {citta} com'è? recensioni pazienti» — N
7. «poliambulatorio a {zona} {citta} con {specialita} e orario serale» — Z/B
8. «meglio {nome} o {nome} per {specialita} a {citta}?» — C
9. «medico di base / pediatra privato a {citta} che prenda nuovi pazienti» — B
10. «quanto costa una visita {specialita} privata a {citta} e da chi andare?» — B

### 3.10 Dentisti (52.500)
1. «miglior dentista a {citta} per {specialita} (impianti, ortodonzia invisibile, bambini)» — G/S
2. «dentista a {citta} per un'urgenza, mi fa malissimo un dente, oggi» — B
3. «dentista economico ma serio a {citta}, devo fare una devitalizzazione» — B
4. «dentista a {citta} che fa {requisito} (pagamento a rate, convenzione {fondo}, sedazione cosciente)» — R
5. «studio dentistico {zona} {citta} aperto il sabato» — Z/B
6. «{nome} dentista {citta} recensioni, è bravo?» — N
7. «meglio {nome} o {nome} per impianti dentali a {citta}?» — C
8. «dentista per bambini a {citta} che sappia trattare un bimbo pauroso» — S/B
9. «igiene dentale a {citta} prezzo e dove andare» — B
10. «dentista a {citta} che parli inglese / per stranieri» — R

### 3.11 Fisioterapisti, osteopati, psicologi, poliambulatori (142.931)
1. «fisioterapista bravo a {citta} per {specialita} (mal di schiena, spalla, riabilitazione post intervento)» — G/S
2. «fisioterapia a domicilio a {citta}, per una persona anziana» — B/R
3. «psicologo a {citta} per {specialita} (ansia, coppia, adolescenti), anche online» — S/B
4. «fisioterapista convenzionato / con {requisito} a {citta}» — R
5. «osteopata a {zona} {citta} con orario serale» — Z/B
6. «{nome} fisioterapista {citta} com'è?» — N
7. «centro di fisioterapia a {citta} con {specialita} (tecar, onde d'urto, idrokinesi)» — S
8. «psicoterapeuta a {citta} prezzo seduta e chi mi consigli?» — B
9. «meglio {nome} o {nome} per riabilitazione ginocchio a {citta}?» — C
10. «nutrizionista a {citta} che riceva anche il sabato» — B

### 3.12 Ristoranti e pizzerie (161.510)
1. «miglior ristorante di {specialita} (pesce, carne, vegano, sushi) a {citta}» — G/S
2. «dove mangiare bene a {citta} spendendo poco, stasera, zona {zona}» — B/Z
3. «pizzeria con forno a legna a {citta} che faccia anche senza glutine» — S/R
4. «ristorante a {citta} per una cena romantica / compleanno con 12 persone» — B
5. «ristorante aperto la domenica sera a {citta} vicino a {zona}» — B/Z
6. «{nome} {citta} ne vale la pena? recensioni» — N
7. «meglio {nome} o {nome} a {citta} per la pizza?» — C
8. «trattoria tipica a {citta} dove vanno i locali, non turistica» — B
9. «ristorante a {citta} con {requisito} (parcheggio, dehors, pet friendly, seggioloni)» — R
10. «dove mangiare {specialita} vicino a me adesso» — Z/B

### 3.13 Bar, pasticcerie, gelaterie (104.501)
1. «miglior bar per colazione a {citta} zona {zona}» — G/Z
2. «pasticceria a {citta} per torta di compleanno su ordinazione, anche {requisito} (senza lattosio)» — S/R
3. «gelateria artigianale a {citta} con gusti {specialita}» — S
4. «bar a {citta} aperto presto la mattina / fino a tardi» — B
5. «dove fare aperitivo a {citta} con buffet, prezzo onesto» — B
6. «{nome} bar {citta} recensioni» — N
7. «caffetteria tranquilla a {citta} dove lavorare col pc, con wifi» — B/R
8. «meglio {nome} o {nome} per il gelato a {citta}?» — C
9. «bar con cornetti fatti in casa a {citta}» — S
10. «pasticceria a {citta} che faccia {specialita} (pasticceria siciliana, francese, vegana)» — S

### 3.14 Agenzie immobiliari (37.773) e amministratori di condominio (18.052)
1. «agenzia immobiliare seria a {citta} per vendere casa, provvigione bassa» — G/B
2. «agenzia a {zona} {citta} specializzata in {specialita} (affitti, lusso, commerciale, aste)» — Z/S
3. «chi mi fa una valutazione gratuita dell'appartamento a {citta}?» — B
4. «agenzia immobiliare a {citta} che gestisca affitti brevi per conto mio» — S/R
5. «{nome} immobiliare {citta} recensioni, sono affidabili?» — N
6. «meglio {nome} o {nome} per vendere casa a {citta}?» — C
7. «agenzia immobiliare a {citta} che parli inglese per stranieri che comprano» — R
8. «amministratore di condominio a {citta} per un palazzo di 20 unità, preventivo» — S/B
9. «agenzie a {citta} che trattano case in {zona} sotto i 200 mila euro» — Z/B
10. «agenzia per affitto a studenti a {citta} senza fregature» — B

### 3.15 Parrucchieri e barbieri (dentro 137.466)
1. «miglior parrucchiere a {citta} per {specialita} (balayage, capelli ricci, taglio corto)» — G/S
2. «parrucchiere a {citta} senza appuntamento, oggi» — B
3. «barbiere a {zona} {citta} per barba e taglio, prezzo» — Z/B
4. «parrucchiere economico ma bravo a {citta}» — B
5. «{nome} parrucchiere {citta} recensioni» — N
6. «parrucchiere a {citta} che usi {requisito} (prodotti vegani, senza ammoniaca)» — R
7. «parrucchiere aperto la domenica / fino alle 20 a {citta}» — B
8. «meglio {nome} o {nome} per un colore a {citta}?» — C
9. «parrucchiere per capelli afro / ricci a {citta}» — S
10. «dove tagliare i capelli a un bambino a {citta}» — S

### 3.16 Centri estetici, nail, spa (dentro 137.466)
1. «centro estetico a {citta} per {specialita} (laser, ceretta brasiliana, pressoterapia)» — S
2. «estetista brava a {zona} {citta}, prezzi onesti» — Z/B
3. «dove fare le unghie a {citta}, semipermanente, oggi» — S/B
4. «centro estetico a {citta} che faccia {requisito} (trattamenti in gravidanza, uomo)» — R
5. «{nome} estetica {citta} com'è?» — N
6. «spa / centro benessere vicino a {citta} per una giornata in coppia» — B
7. «meglio {nome} o {nome} per laser a {citta}?» — C
8. «massaggio decontratturante a {citta} serio, non "centro massaggi"» — S/B
9. «estetista a {citta} aperta la sera dopo le 19» — B
10. «centro estetico a {citta} con buoni regalo» — R

### 3.17 Avvocati (178.713)
1. «avvocato a {citta} specializzato in {specialita} (divorzio, lavoro, incidenti stradali, immigrazione)» — S
2. «avvocato a {citta} che faccia un primo colloquio gratuito» — B
3. «miglior avvocato {specialita} a {citta}» — G/S
4. «avvocato a {citta} con {requisito} (gratuito patrocinio, parla inglese, lavora con assicurazioni)» — R
5. «avvocato {nome} {citta} recensioni, è bravo?» — N
6. «quanto costa un avvocato per {specialita} a {citta} e a chi mi rivolgo?» — B
7. «studio legale a {citta} per una piccola azienda, contratti e recupero crediti» — S
8. «meglio {nome} o {nome} per {specialita} a {citta}?» — C
9. «avvocato in provincia di {provincia} per una multa / ricorso al giudice di pace» — S/Z
10. «avvocato a {citta} che risponda subito, mi serve consulenza entro domani» — B

### 3.18 Commercialisti e consulenti del lavoro (133.140)
1. «commercialista a {citta} per partita IVA forfettaria, quanto chiede?» — S/B
2. «commercialista economico per freelance a {citta} o anche online» — B
3. «commercialista a {citta} specializzato in {specialita} (startup, e-commerce, ristoranti, agricoltura)» — S
4. «consulente del lavoro a {citta} per una ditta con 5 dipendenti» — S
5. «{nome} commercialista {citta} recensioni» — N
6. «commercialista a {citta} che faccia anche {requisito} (bilanci in inglese, crypto, estero)» — R
7. «meglio {nome} o {nome} come commercialista a {citta}?» — C
8. «studio commercialista a {zona} {citta} che risponda alle mail» — Z/B
9. «commercialista per aprire una srl a {citta}, costi» — S/B
10. «CAF / commercialista a {citta} per 730 e dichiarazione, prezzo» — B

### 3.19 Architetti, ingegneri, geometri (231.564)
1. «architetto a {citta} per ristrutturare un appartamento, anche con pratiche comunali» — S
2. «geometra a {citta} per {specialita} (accatastamento, APE, sanatoria, successione)» — S
3. «ingegnere strutturale in provincia di {provincia} per {specialita} (sopraelevazione, verifica sismica)» — S/Z
4. «architetto d'interni a {citta} con prezzi chiari» — B
5. «studio tecnico a {citta} che segua pratiche {requisito} (bonus, CILA, SCIA)» — R
6. «{nome} architetto {citta} recensioni» — N
7. «meglio {nome} o {nome} per progettare casa a {citta}?» — C
8. «geometra economico a {citta} per APE urgente» — B
9. «studio di ingegneria in {regione} per impianti industriali / antincendio» — S/Z
10. «architetto a {citta} specializzato in {specialita} (bioedilizia, restauro)» — S

### 3.20 Autofficine, carrozzerie, gommisti (73.249)
1. «meccanico onesto a {citta} zona {zona}» — G/Z/B
2. «officina a {citta} specializzata in {specialita} (auto ibride, Tesla, BMW, diesel euro 6)» — S
3. «carrozzeria a {citta} che lavori con le assicurazioni» — R
4. «gommista a {citta} per cambio gomme oggi senza prenotare» — B
5. «officina a {citta} per revisione auto, prezzo e tempi» — S/B
6. «{nome} officina {citta} recensioni» — N
7. «meglio {nome} o {nome} per riparare {specialita} a {citta}?» — C
8. «elettrauto a {citta} per problema centralina» — S
9. «officina che faccia tagliando {marca} a {citta} senza perdere la garanzia» — R
10. «meccanico a {citta} per auto d'epoca / camper» — S

### 3.21 Concessionarie auto e moto, autonoleggio (31.638 + 3.482)
1. «concessionaria {marca} a {citta} affidabile» — R/Z
2. «dove comprare un'auto usata a {citta} senza fregature» — B
3. «concessionario a {citta} con {specialita} (km zero, elettriche, auto per neopatentati)» — S
4. «{nome} concessionaria {citta} recensioni» — N
5. «meglio {nome} o {nome} per comprare un usato a {citta}?» — C
6. «noleggio auto a {citta} economico senza carta di credito» — B/R
7. «noleggio furgone a {citta} per un trasloco, un giorno» — S/B
8. «concessionario moto a {citta} che faccia permuta» — R
9. «noleggio lungo termine a {citta} per partita IVA» — R
10. «dove vendere la mia auto a {citta} al prezzo migliore» — B

### 3.22 Trasporti, logistica, spedizioni, traslochi (83.111)
1. «corriere / trasportatore in {provincia} per spedizioni pallet in tutta Italia» — S/Z
2. «azienda di logistica in {regione} con magazzino conto terzi e {requisito} (temperatura controllata, ADR)» — R
3. «trasportatore per {specialita} (macchinari, mobili, eccezionali) da {citta} a {citta}» — S
4. «ditta traslochi a {citta} seria, preventivo gratuito» — B
5. «spedizioniere a {citta} per export verso {requisito} (USA, Svizzera, extra UE) con pratiche doganali» — R
6. «{nome} trasporti {citta} affidabile come fornitore?» — N
7. «meglio {nome} o {nome} per spedizioni groupage da {regione}?» — C
8. «autotrasportatore con {requisito} (ADR, frigo, sponda idraulica) in provincia di {provincia}» — R
9. «logistica e-commerce in {regione} per un piccolo negozio online» — S
10. (EN) «3PL logistics provider in northern Italy with bonded warehouse» — R/Z

### 3.23 Consulenza aziendale, IT e software house (199.059 con M702, J62, J63)
1. «software house a {citta} per sviluppare un gestionale su misura, PMI» — S/Z
2. «consulente IT a {provincia} per {specialita} (sicurezza informatica, migrazione cloud, Microsoft 365)» — S/Z
3. «agenzia che faccia un sito e-commerce a {citta} con budget di 5.000 euro» — S/B
4. «consulente aziendale a {citta} per {specialita} (finanza agevolata, certificazione ISO, passaggio generazionale)» — S
5. «{nome} software house {citta} recensioni clienti» — N
6. «meglio {nome} o {nome} per sviluppo app a {citta}?» — C
7. «azienda IT in {regione} con {requisito} (certificazione ISO 27001, partner {vendor})» — R
8. «consulente privacy / DPO per una clinica a {citta}» — S/R
9. «assistenza informatica a {citta} per un ufficio di 10 pc, canone mensile» — B
10. «studio di consulenza per bandi PNRR / Transizione 5.0 in {regione}» — S

### 3.24 Agenzie di comunicazione, marketing, pubblicità (39.835)
1. «agenzia di comunicazione a {citta} per una PMI del settore {specialita}» — G/S
2. «agenzia social media a {citta} con prezzi per piccole attività» — S/B
3. «agenzia SEO / Google Ads a {provincia} con casi studio nel {specialita}» — S/R
4. «agenzia di comunicazione a {citta} che faccia anche {requisito} (video, ufficio stampa, fiere)» — R
5. «{nome} agenzia {citta} com'è? recensioni clienti» — N
6. «meglio {nome} o {nome} per il marketing di un ristorante a {citta}?» — C
7. «migliori agenzie di branding in {regione}» — G/Z
8. «agenzia che segua il marketing di un'azienda metalmeccanica B2B in {regione}» — S
9. «grafico / studio grafico a {citta} per logo e cataloghi» — S
10. (EN) «marketing agency in {citta}, Italy, for a foreign brand entering the Italian market» — R

### 3.25 Hotel (21.203)
1. «hotel a {citta} vicino a {zona} con parcheggio, 2 notti, fino a 120 euro» — Z/B
2. «miglior hotel 4 stelle a {citta} per una coppia» — G/B
3. «hotel a {citta} che accetta cani e ha {requisito} (piscina, spa, colazione inclusa)» — R
4. «hotel per famiglie a {citta} con camere quadruple» — B
5. «{nome} hotel {citta} recensioni, ne vale la pena?» — N
6. «meglio {nome} o {nome} a {citta}?» — C
7. «hotel a {citta} per un viaggio di lavoro, vicino alla stazione, con sala riunioni» — B/R
8. «albergo tranquillo in {zona} per un weekend di relax» — Z/B
9. «hotel a {citta} con {specialita} (vista mare, centro storico, ristorante stellato)» — S
10. (EN) «best boutique hotel in {citta} Italy under 200 euro» — G/B

### 3.26 B&B, affitti brevi, agriturismi (37.152 + 26.360)
1. «B&B carino a {citta} zona {zona}, non troppo caro» — Z/B
2. «agriturismo vicino a {citta} con piscina e ristorante, per bambini» — S/B
3. «casa vacanze a {zona} per 6 persone ad agosto» — B
4. «agriturismo in {provincia} che fa {specialita} (degustazione vino, corsi di cucina, fattoria didattica)» — S
5. «{nome} agriturismo {provincia} recensioni» — N
6. «meglio {nome} o {nome} per un weekend in {zona}?» — C
7. «B&B a {citta} con {requisito} (parcheggio gratuito, check-in tardi, colazione per celiaci)» — R
8. «agriturismo in {regione} dove mangiare la domenica, menù fisso» — B
9. «appartamento per lavoratori a {citta} per un mese» — B
10. (EN) «farm stay in {regione} with cooking classes, family friendly» — S

### 3.27 Scuole di lingue, formazione, autoscuole (22.362 + 4.670)
1. «scuola di inglese a {citta} per adulti, corsi serali, preparazione {requisito} (IELTS, Cambridge)» — S/R
2. «corso di {specialita} (tedesco, italiano per stranieri, cinese) a {citta} prezzo» — S/B
3. «scuola di lingue a {citta} per bambini da 6 anni» — S
4. «corso di formazione {specialita} a {citta} riconosciuto dalla Regione / con attestato» — R
5. «{nome} scuola {citta} recensioni» — N
6. «meglio {nome} o {nome} per imparare l'inglese a {citta}?» — C
7. «autoscuola a {citta} economica con buone percentuali di promossi» — B
8. «autoscuola a {citta} per patente {specialita} (B automatica, A2, C con CQC)» — S
9. «corso online o in presenza a {citta} per {specialita} (contabilità, social media, OSS)» — S/B
10. «scuola di italiano per stranieri a {citta} con lezioni al mattino» — B

### 3.28 Palestre, piscine, personal trainer (33.374)
1. «palestra a {citta} zona {zona} con abbonamento mensile senza vincoli» — Z/B
2. «palestra a {citta} aperta 24 ore / la domenica» — B
3. «dove fare {specialita} (crossfit, pilates, yoga, boxe, nuoto) a {citta}» — S
4. «personal trainer a {citta} per {specialita} (dimagrire, post infortunio, over 60)» — S
5. «{nome} palestra {citta} recensioni» — N
6. «meglio {nome} o {nome} a {citta} come palestra?» — C
7. «palestra a {citta} con {requisito} (piscina, corsi per bambini, parcheggio)» — R
8. «palestra economica a {citta}, meno di 40 euro al mese» — B
9. «piscina a {citta} per corso di nuoto per bambini» — S
10. «studio di pilates reformer a {citta} per mal di schiena» — S/B

### 3.29 Agenzie di viaggio e tour operator (19.906)
1. «agenzia di viaggi a {citta} per organizzare {specialita} (viaggio di nozze, Giappone, crociera)» — S
2. «agenzia viaggi affidabile a {citta} zona {zona}» — Z
3. «tour operator in {regione} specializzato in {specialita} (viaggi per anziani, gruppi scolastici, trekking)» — S
4. «{nome} viaggi {citta} recensioni» — N
5. «meglio prenotare da solo o con un'agenzia a {citta} per {specialita}?» — C
6. «agenzia viaggi a {citta} che faccia {requisito} (pagamento a rate, assicurazione annullamento)» — R
7. «agenzia a {citta} per viaggi last minute questo weekend» — B
8. «agenzia di incoming in {regione} per gruppi stranieri» — S/R
9. «dove prenotare un viaggio organizzato per single a {citta}» — B
10. (EN) «local tour operator in {regione} for private wine tours» — S

### 3.30 Veterinari e toelettatura (17.815)
1. «veterinario a {citta} aperto adesso, urgenza per il mio cane» — B
2. «miglior veterinario a {citta} zona {zona} per gatti» — G/Z/S
3. «clinica veterinaria a {citta} con {specialita} (ortopedia, dentista veterinario, esotici)» — S
4. «veterinario a {citta} con prezzi onesti per sterilizzazione» — B
5. «{nome} veterinario {citta} recensioni» — N
6. «meglio {nome} o {nome} per il mio cane a {citta}?» — C
7. «veterinario a domicilio a {citta}» — R
8. «toelettatura per cani a {citta} per un {specialita} (barboncino, cane grande)» — S
9. «pensione per cani vicino a {citta} per 10 giorni ad agosto» — B
10. «veterinario a {citta} che faccia {requisito} (pagamento a rate, convenzione assicurazione)» — R

### 3.31 Farmacie, parafarmacie, ottici, sanitarie (19.644 + 3.025)
1. «farmacia aperta adesso / di turno a {citta} zona {zona}» — B/Z
2. «farmacia a {citta} che faccia {specialita} (tamponi, ECG, foratura lobi, preparazioni galeniche)» — S
3. «ottico a {citta} per occhiali progressivi, bravo e non carissimo» — S/B
4. «{nome} farmacia {citta} recensioni» — N
5. «ortopedia sanitaria a {citta} per {specialita} (plantari su misura, busti, noleggio carrozzina)» — S
6. «ottico a {citta} con {requisito} (convenzione, esame vista gratuito, lenti a contatto)» — R
7. «farmacia a {citta} con consegna a domicilio» — R
8. «meglio {nome} o {nome} per occhiali a {citta}?» — C
9. «parafarmacia a {citta} con prodotti {specialita} (omeopatia, veterinaria)» — S
10. «farmacia a {citta} aperta la domenica» — B

### 3.32 Pulizie, giardinaggio, facility (59.303)
1. «impresa di pulizie a {citta} per uffici, preventivo per 200 mq» — S/B
2. «ditta di pulizie a {citta} per condominio con {requisito} (DURC, assicurazione, fattura)» — R
3. «giardiniere a {citta} per potatura siepi e manutenzione mensile» — S
4. «impresa di pulizie post ristrutturazione a {citta}, urgente» — S/B
5. «{nome} pulizie {citta} recensioni» — N
6. «meglio {nome} o {nome} per pulizie uffici a {citta}?» — C
7. «ditta di sanificazione / disinfestazione a {citta}» — S
8. «giardiniere in provincia di {provincia} per progettare un giardino» — S/Z
9. «pulizie domestiche a {citta} con contratto regolare» — R
10. «impresa di facility management in {regione} per più sedi» — S/Z

### 3.33 Musei, attrazioni, esperienze (1.282 privati; 4.416 totali)
1. «cosa vedere a {citta} in un giorno, musei da non perdere» — G
2. «museo a {citta} adatto ai bambini / se piove» — B
3. «{nome} a {citta} vale la pena? quanto tempo ci vuole» — N
4. «musei gratis a {citta} la prima domenica del mese» — B
5. «meglio {nome} o {nome} se ho solo mezza giornata a {citta}?» — C
6. «museo di {specialita} (arte contemporanea, scienza, auto) vicino a {citta}» — S/Z
7. «{nome} biglietti: conviene prenotare online, orari, quanto costa» — N/B
8. «musei a {citta} con {requisito} (accessibili in carrozzina, audioguida in inglese)» — R
9. «mostre a {citta} questo weekend» — B
10. (EN) «best museums in {citta} for first-time visitors, skip-the-line» — G/R

### 3.34 Fotografi, videomaker, eventi (19.026 + 4.492)
1. «fotografo di matrimonio a {citta} / in {regione} con stile {specialita} (reportage, naturale)» — S
2. «fotografo a {citta} per foto prodotto per e-commerce, prezzo» — S/B
3. «videomaker a {citta} per video aziendale» — S
4. «{nome} fotografo {citta} recensioni» — N
5. «meglio {nome} o {nome} per il matrimonio a {regione}?» — C
6. «fotografo per servizio neonato / famiglia a {citta}» — S
7. «agenzia eventi a {citta} per organizzare {specialita} (convention 200 persone, festa aziendale)» — S
8. «fotografo a {citta} disponibile il {requisito} (data) con album incluso» — R/B
9. «studio fotografico a {citta} per foto tessera e ritratti professionali» — S
10. «service audio luci a {provincia} per un evento» — S/Z

### 3.35 Agenti assicurativi, mediatori creditizi, consulenti finanziari (96.669)
1. «agenzia assicurativa a {citta} per polizza auto con prezzo buono» — S/B
2. «consulente assicurativo a {citta} per {specialita} (RC professionale, polizza vita, casa)» — S
3. «mediatore creditizio a {citta} per mutuo prima casa, senza costi?» — S/R
4. «{nome} assicurazioni {citta} recensioni» — N
5. «meglio {nome} o {nome} come agenzia assicurativa a {citta}?» — C
6. «broker assicurativo in {regione} per un'azienda metalmeccanica» — S/Z
7. «consulente finanziario indipendente a {citta}» — R
8. «agenzia {marca} a {zona} {citta} orari» — N/Z
9. «assicurazione per {specialita} (partita IVA, drone, bici elettrica) a chi mi rivolgo a {citta}» — S
10. «consulente per cessione del quinto a {citta} serio» — B

Nota d'uso: per ogni attività il generatore dovrebbe pescare 2-3 template per tipo, riempire `{specialita}` e `{requisito}` dai servizi dichiarati dall'attività (es. dal profilo Google) e produrre varianti sintattiche, perché nello studio SparkToro prompt scritti da persone diverse per lo stesso intento avevano una similarità semantica media di 0,081 ma restituivano brand simili ([SparkToro](https://sparktoro.com/blog/new-research-ais-are-highly-inconsistent-when-recommending-brands-or-products-marketers-should-take-care-when-tracking-ai-visibility/)): contano l'intento e i vincoli, non la frase esatta.

---

## 4. Fonti per settore

### 4.1 Che cosa si sa in generale

- **ChatGPT**: Wikipedia 7,8% di tutte le citazioni, Reddit 1,8%, Forbes 1,1%, G2 1,1%; **AI Overviews**: Reddit 2,2%, YouTube 1,9%, Quora 1,5%, LinkedIn 1,3%; **Perplexity**: Reddit 6,6%, YouTube 2,0%, Gartner 1,0%, **Yelp 0,8%**, LinkedIn 0,8%, **TripAdvisor 0,6%** (680 milioni di citazioni, ago 2024–giu 2025, [Profound](https://www.tryprofound.com/blog/ai-platform-citation-patterns)).
- **Locale**: le fonti più comuni sono Google Maps, siti verticali di nicchia, siti dei brand, Yelp e Facebook ([SOCi via Near Media](https://www.nearmedia.co/local-ai-study-ai-mode-onramp-g-queries-down-squandered-tech-trust/)); il sito dell'attività è la fonte più citata da ChatGPT (72% delle query di awareness/reputazione, oltre la metà di quelle di raccomandazione) ([Insites](https://insites.com/blog/what-ai-uses-to-choose-local-businesses-and-what-it-ignores/)).
- **Fornitori B2B**: le directory forniscono il 41% delle citazioni su prompt di selezione fornitori contro il 18% delle pagine dei brand; Perplexity 47%, AI Overviews 39%, AI Mode 36%, ChatGPT 22%; nell'engineering le directory battono i siti aziendali 4,2 a 1; l'overlap delle fonti tra piattaforme è solo del 31% ([Citations.press, 3.850 prompt, giu-ago 2026](https://www.thailand-business-news.com/?p=328948)). Avvertenza: è uno studio di un operatore di directory, non replicato.
- **Retrieval vs citazione**: su Perplexity il 64% delle pagine recuperate non viene mai citato; ChatGPT cita in media 2+ URL per risposta, AI Mode 1,1-1,5, Perplexity 1,5-2,0 ([Peec, 1+ milione di citazioni](https://docs.peec.ai/research/retrieval-vs-citation.md)).
- **Italia/travel**: negli AI Overviews italiani sul cluster hotel, il 51,2% delle citazioni viene da domini fuori dalla top 10 organica (63,8% per "cosa vedere"); Google Maps (57 keyword), Facebook (33), Instagram (29), Booking/Kayak/Expedia/Hotels.com/Agoda/Momondo sono citati anche quando non sono in top 10 ([SEOZoom, 77.703 keyword, giu 2025-apr 2026](https://www.seozoom.com/?p=34853)).

### 4.2 Tabella per settore (Italia)

"Evidenza" indica se la citazione è documentata da uno studio (D), è una fonte strutturale integrata nel prodotto AI (I), oppure è un'ipotesi ragionata da verificare col campionamento del prodotto (H). Non esistono studi pubblici sulle quote di citazione dei portali italiani: il prodotto dovrebbe produrli (è una funzione di report: "source share per settore").

| Settore | Fonti attese | Evidenza |
|---|---|---|
| Ristoranti, bar | Google Maps/Business Profile, TripAdvisor, TheFork, Yelp, Gambero Rosso, Guida Michelin, Dissapore, siti e social del locale, Instagram/Facebook, Reddit (r/italy, r/{citta}) | D (Profound: Yelp, TripAdvisor su Perplexity; SOCi: Maps/Yelp/Facebook); I (TheFork app in ChatGPT con prenotazione, [Techprincess](https://techprincess.it/thefork-chatgpt-prenotazioni-ristoranti-conversazione-ai/amp/); OpenAI cita OpenTable/Resy/Yelp per le prenotazioni, [Help](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt)) |
| Hotel, B&B, agriturismi | Booking.com, Expedia/Hotels.com, TripAdvisor, Google Maps/Hotels, Kayak/Trivago, Airbnb, Agriturismo.it, siti dei singoli hotel, blog di viaggio, YouTube, Reddit | D (Cloudbeds: OTA 55%, ordine Booking > Expedia > TripAdvisor; SEOZoom Italia) |
| Medici, dentisti, fisioterapisti | MioDottore, Dottori.it, iDoctors, TopDoctors, Google Maps, siti degli studi, Ordini provinciali (albi), Pagine Gialle, Trustpilot | H per i portali italiani; D per sito e Maps (Insites, SOCi) |
| Edilizia, impiantisti, finiture | Google Maps, siti aziendali, ProntoPro, Instapro, Habitissimo, Houzz, Edilportale, Pagine Gialle, Subito (servizi), Confartigianato/CNA, albi installatori (DM 37/08 non pubblici) | H; D per Maps/siti |
| Avvocati, commercialisti | siti degli studi, Google Maps, Ordini (albi ricercabili), Pagine Gialle, Avvocato360/Avvocati.it, LinkedIn, Italiaonline, Trustpilot | H; D LinkedIn (Profound: AI Overviews 1,3%) |
| Immobiliare | Immobiliare.it, Idealista, Casa.it, Subito, Google Maps, siti delle agenzie, FIAIP/FIMAA, Facebook | H |
| Parrucchieri, estetica | Treatwell, Google Maps, Instagram, Facebook, Pagine Gialle, siti | H |
| Autofficine, concessionarie | Google Maps, Pagine Gialle, reti (Bosch Car Service, Euromaster), AutoScout24/Subito/Autohero (concessionarie), siti, Trustpilot | H |
| Palestre, piscine | Google Maps, Wellhub/Gympass, ClassPass, Instagram, siti, FIN/FederNuoto per piscine | H |
| Metalmeccanica, manifattura B2B | siti aziendali con catalogo, Europages, Kompass, DirectIndustry, Pagine Gialle/PagineGialle Pro, LinkedIn, Registro Imprese/Atoka/Ufficio Camerale/ReportAziende, elenchi espositori di fiere (MECSPE, Lamiera, BI-MU, EMO), associazioni (ANIMA, UCIMU, Federmeccanica, Confindustria territoriali), Wikipedia per i grandi, Reddit/forum tecnici | D per il peso delle directory (Citations.press 41%, con riserva) e per LinkedIn/G2/Gartner nel B2B (Profound); H per i singoli portali italiani |
| Trasporti e logistica | Europages, Kompass, Albo autotrasportatori (MIT), Pagine Gialle, siti, LinkedIn, Trasportoeuropa/Logistica news, Assologistica/Anita | H |
| Agenzie comunicazione, IT | Clutch, Sortlist, G2/Capterra (per SaaS), LinkedIn, siti e case study, Wikipedia (grandi), premi di settore, Reddit | D (Profound: G2 1,1% ChatGPT; Gartner su Perplexity); H per Sortlist/Clutch in Italia |
| Scuole di lingue, formazione | Google Maps, siti, British Council/Cambridge (centri autorizzati), Superprof/Preply (lezioni), Regioni (cataloghi accreditati), Emagister, recensioni Google | H |
| Agenzie di viaggio | siti, Google Maps, TripAdvisor, Trustpilot, Facebook, FIAVET | H |
| Veterinari | Google Maps, siti, Ordini veterinari, Pagine Gialle, Facebook | H |
| Farmacie, ottici | Google Maps, Federfarma (turni), siti, Pagine Gialle, 1000Farmacie | H |
| Musei, attrazioni | Wikipedia, siti ufficiali, TripAdvisor, Google Maps, GetYourGuide/Tiqets/Musement, cultura.gov.it, blog di viaggio, YouTube | D (Wikipedia 7,8% ChatGPT; TripAdvisor; SEOZoom) |
| Negozi al dettaglio | Google Maps, siti/e-commerce, Instagram, marketplace (Amazon, Subito), Trustpilot, Pagine Gialle | H; D per il peso di Maps (SOCi) |

Due regolarità da sfruttare nel report: (1) il sito dell'attività conta più di ogni directory nelle query sul nome (Insites), quindi la "scheda fonti" deve dire se il sito è stato citato; (2) nei B2B e nel travel la fonte citata spesso non è il brand ma una lista (68% delle citazioni di directory sono pagine-elenco, Citations.press): il report deve dire *in quale lista* l'attività manca.

---

## 5. Metriche e statistiche che un report professionale deve avere

### 5.1 Come le definiscono gli strumenti concorrenti

| Metrica | Peec AI | Profound | Otterly | Semrush AI Visibility | Ahrefs Brand Radar | Rankscale | BrightLocal Local AI Visibility | SEOZoom |
|---|---|---|---|---|---|---|---|---|
| Visibilità / presenza | "(risposte che menzionano il brand / risposte totali) × 100" ([doc](https://docs.peec.ai/metrics/brand-metrics/visibility.md)) | "percentuale: numero di risposte che includono il tuo brand" sul totale delle risposte con almeno un brand ([doc](https://help.tryprofound.com/articles/3443229936-answer-engine-insights-overview)) | "Brand Visibility Index" dei top 10 brand basato su copertura e posizione media ([doc](https://help.otterly.ai/brand-report-kpi-definition)) | "AI Visibility: punteggio benchmark 0-100 di quanto spesso il brand appare rispetto ai concorrenti"; "Mentions: numero di prompt in cui il brand è incluso" ([doc](https://it.semrush.com/kb/1594-ai-seo-metrics)) | "AI Share of Voice" basata su menzioni/citazioni; menzioni = string match, citazioni = URL linkati ([doc](https://ahrefs.com/blog/brand-radar-methodology/)) | "Detection Rate" = risposte con il brand / esecuzioni; "Visibility Score" = (apparizioni/esecuzioni) × 1/(1+0,1×(pos. media−1)) × 100 ([doc](https://help.rankscale.ai/articles/1188645477-metrics-in-rankscale)) | "Visibility score" su 100 + "mention rate" per piattaforma e tipo di prompt ([doc](https://help.brightlocal.com/hc/en-us/articles/37989673412114-What-is-Local-AI-Visibility)) | "Prompt in cui appari", "AI Authority Score" ([pagina](https://www.seozoom.com/?p=34051)) |
| Share of voice | "menzioni del brand / menzioni totali di tutti i brand × 100"; esempio: 4 su 10 chat = visibilità 40%, ma con 12 menzioni di un concorrente SoV 25% ([doc](https://docs.peec.ai/metrics/brand-metrics/share-of-voice.md)) | menzioni del brand come quota di tutte le menzioni di brand | "menzioni del mio brand / menzioni totali × 100" | "percentuale di menzioni del brand rispetto ai concorrenti del mercato" | idem (SoV) | "quota di menzioni totali rispetto ai concorrenti" | share of voice per piattaforma e prompt | "Share of Voice AI" |
| Posizione | "ranking medio tra tutte le risposte in cui il brand appare", contando tutti i brand rilevati ([doc](https://docs.peec.ai/metrics/brand-metrics/position.md)) | "Average Position": 1 = menzionato per primo | "Avg. Brand Position" | "Average Position: dove appare tipicamente una citazione del dominio" | non definita | "Average Position", più "Top 3 Visibility" | "average position" | "AI Rank" (solo AI Overview) |
| Citazioni | pagina "Sources"; distingue retrieval da citation ([doc](https://docs.peec.ai/research/retrieval-vs-citation.md)) | "riferimento o link a una pagina specifica" | "Domain Citation: numero totale di citazioni del dominio" | "Citations: risposte che citano il dominio come fonte"; "Cited Pages" | "citations" (URL) e "found but not cited" | "Share of Citations" | "citations and AI sources": siti citati, quante volte, da quale piattaforma | "Citations by engine", "Source vs Mentioned" |
| Sentiment | 0-100, "la maggior parte dei punteggi tra 65 e 85" ([doc](https://docs.peec.ai/metrics/brand-metrics/sentiment.md)) | "valutazione di come il brand è ritratto" | "Net Sentiment Score da −100 a +100" | "bilancio tra sentiment positivo e generale" | — | "basato sul testo in contesto" | insight descrittivi (punti di forza/debolezza) | "sentiment, tono, associazioni semantiche" |
| Volume prompt | — | — | — | "AI Topic Volume: stima di quanto spesso si chiede di un tema" | "Estimated impressions = menzioni pesate per volume Google" (dichiarata "scelta di modellazione, non relazione validata") | — | — | — |
| Frequenza | prompt testati "ogni giorno" ([help](https://help.peec.ai/article/how-is-visibility-calculated-tz1uv68wuaho0c53gmdikqiu)) | "ogni giorno" | "le cifre di un singolo giorno fluttuano" ([doc](https://help.otterly.ai/insights-on-brand-reports)) | tracking giornaliero; database aggiornato "quotidianamente"; risposte "catturate da richieste reali, non via API" ([doc](https://www.semrush.com/kb/1607-ai-visibility-data)) | mensile con finestra 90 giorni (chatbot); continuo (AIO/AI Mode); "interfacce web pubbliche" | "execution" = una richiesta registrata | "due volte al mese", fino a 20 prompt per sede ([blog](https://www.brightlocal.com/blog/new-local-ai-visibility-tracker/)) | "in tempo reale" per l'audit |
| Località | `country_code` per prompt, altrimenti mercato del topic/progetto | — | — | 117 database regionali; "piattaforma e località target" | locale secondo la distribuzione del database keyword, "più forte in inglese" | — | "ogni query è ancorata a una località specifica" | — |

Nessuno degli strumenti pubblica intervalli di confidenza, numero di ripetizioni per prompt o una misura di stabilità; Ahrefs dichiara esplicitamente che le metriche sono "direzionali" e che i link allucinati non vengono filtrati.

### 5.2 Che cosa conta per una singola attività locale (e cosa è riempitivo)

Partendo dai fatti: liste quasi mai identiche tra due esecuzioni (<1/100), ordine quasi mai identico (~1/1000), ma brand forti presenti nel 60-90% delle risposte per lo stesso intento; i mercati piccoli sono più stabili dei grandi ([SparkToro, 2.961 esecuzioni, 12 prompt](https://sparktoro.com/blog/new-research-ais-are-highly-inconsistent-when-recommending-brands-or-products-marketers-should-take-care-when-tracking-ai-visibility/)); il sentiment è positivo per il 79,8% delle attività su ChatGPT e "molto negativo" per lo 0,5% ([Insites](https://insites.com/blog/the-ai-visibility-benchmark-how-10000-local-businesses-actually-perform-in-chatgpt-and-perplexity/)).

**Metriche che hanno senso per un'attività singola**

1. **Tasso di raccomandazione (visibilità)** per piattaforma e per tipo di domanda: % delle risposte in cui l'attività è nominata, con intervallo di confidenza e numero di esecuzioni. È la metrica che SparkToro definisce "ragionevole" e quella su cui convergono Peec, Profound, Semrush, Rankscale.
2. **Copertura dei prompt**: su quante delle N domande-tipo l'attività compare almeno una volta (es. 3 su 12). Dice *quali intenti* la fanno emergere (urgenza sì, specialità no).
3. **Share of voice nel comparto locale**: le menzioni dell'attività sul totale delle menzioni di attività concorrenti nelle stesse risposte. Serve per il benchmark "chi viene consigliato al posto tuo", che è la parte più azionabile del report.
4. **Top-3 presence** invece della posizione media: la posizione esatta è "troppo instabile per essere significativa" (SparkToro), ma "primo/secondo/terzo vs oltre" è robusto e Rankscale la adotta come "Top 3 Visibility".
5. **Citazioni per fonte (source share)**: quali siti sono citati nelle risposte del comparto e se tra essi ci sono il sito dell'attività, la sua scheda Google, i portali verticali. È l'unico dato che si traduce direttamente in un'azione (farsi inserire, aggiornare la scheda).
6. **Accuratezza dei dati** (awareness): telefono, indirizzo, orari e servizi corretti sì/no, perché il 30-39% delle attività ha il telefono sbagliato nelle risposte AI (Insites) e l'accuratezza di profilo è ~68% su ChatGPT/Perplexity (SOCi).
7. **Benchmark di categoria**: confronto con il tasso medio di raccomandazione del settore nella stessa città (es. "dentisti a Bologna: mediana 8%"). Senza benchmark, "0%" sembra un difetto dello strumento.
8. **Trend trimestrale** con la stessa batteria di prompt e la stessa configurazione; ogni variazione va letta contro l'intervallo di confidenza.

**Riempitivo o fuorviante per un'attività singola**

- **Sentiment a punteggio** (0-100, NSS): quasi tutte le attività ottengono valori positivi e simili; è informativo solo quando è negativo, quindi va mostrato come alert ("rilevata una menzione negativa: …") e non come KPI.
- **Posizione media con decimali** e "AI rank": ordine instabile per costruzione.
- **Volume stimato dei prompt / impression stimate**: Ahrefs stesso lo qualifica come modellazione non validata; per una città italiana e un settore di nicchia è un numero inventato.
- **Previsioni/forecast** di visibilità: non esiste una base statistica, i modelli cambiano senza preavviso (Local Falcon avverte che i dati sono "una fotografia").
- **Punteggi compositi "AI Authority"** non riproducibili dal cliente.

---

## 6. Come si raccolgono i dati in modo difendibile

### 6.1 API o app? Dichiararlo, e scegliere in base alla domanda

- Le app consumer usano memoria, localizzazione e routing di modello: ChatGPT "può usare una localizzazione approssimativa basata sull'IP", la posizione precisa del dispositivo è opzionale e disattivata di default, "se la memoria è attiva, le informazioni di localizzazione salvate possono influenzare i risultati" ([OpenAI Help](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt)); in ChatGPT un router in tempo reale decide quale modello usare in base a tipo di conversazione, complessità e strumenti ([OpenAI, 7 agosto 2025](https://openai.com/index/introducing-gpt-5/)). Le API permettono invece di fissare modello, strumenti e località.
- Quanto differiscono: su 900 prompt aperti, l'overlap dei brand tra interfaccia e API è stato dell'11% (ChatGPT), 12% (Gemini), 6% (Perplexity), con lo stesso brand al primo posto solo nel 9-16% dei casi; l'interfaccia di ChatGPT legge ~3,5 volte più fonti dell'API; le esecuzioni erano però a un giorno di distanza e con versioni di modello diverse ([Brandlight, giugno 2026](https://research.brandlight.ai/ui-vs-api.html)). Su prompt chiusi (classifica 5 brand dati) con Gemini, API e app danno classifiche statisticamente indistinguibili nell'87% dei topic, tau di Kendall 0,79 contro 0,82 di accordo interno ([Massive, giugno 2026](https://www.joinmassive.com/blog/are-api-based-ai-calls-a-good-proxy-for-what-your-users-actually-see)). La lezione: più la domanda è aperta e locale, più il canale conta.
- Posizione dei fornitori di strumenti: Semrush "non via API", Ahrefs "interfacce web pubbliche", Peec/Profound non lo dichiarano nelle pagine pubbliche (vedi §5.1). SparkToro lascia aperta la domanda "le API si comportano come utenti reali?".

Raccomandazione: usare le API come canale primario (riproducibile, con località fissata) e dichiararlo nel report; affiancare un campione mensile raccolto dalle app consumer (account pulito, memoria disattivata, località impostata) per stimare lo scarto e riportarlo come nota metodologica.

### 6.2 Fissare la località (obbligatorio per il locale)

- OpenAI Responses API, strumento `web_search`: `user_location` con `type: "approximate"`, `country` (ISO-2), `city`, `region`, `timezone`; non supportato nei modelli deep research; `search_context_size` low/medium/high; il campo `sources` restituisce tutte le URL consultate, "spesso più lunga della lista delle citazioni" ([docs](https://developers.openai.com/api/docs/guides/tools-web-search)).
- Perplexity Sonar: `user_location` con `country`, `region`, `city`, `latitude`/`longitude` (coordinate solo insieme a `country`; "city e region migliorano significativamente l'accuratezza"), più `search_domain_filter` fino a 20 domini ([docs](https://docs.perplexity.ai/guides/user-location-filter-guide)).
- Gemini API, Grounding with Google Maps: `toolConfig.retrievalConfig.latLng` con latitudine/longitudine, usato dalle query "vicino a me"; restituisce `groundingChunks` con `placeId` e supporti per citazioni inline; 5.000 query gratis/mese poi 14 $ per 1.000 (Gemini 3+); combinabile con Grounding with Google Search ([docs IT](https://ai.google.dev/gemini-api/docs/generate-content/maps-grounding?hl=it)). È il canale più vicino a ciò che vede un utente di Gemini/AI Mode per il locale, dato che SOCi misura su Gemini il 100% di accuratezza dei profili.
- Per AI Overviews/AI Mode non esiste API: servono SERP scraping con parametro di località (`uule`/`gl`/`hl`) o un fornitore terzo; va dichiarato.
- Per ogni esecuzione registrare: piattaforma, modello, canale (API/app), località impostata, lingua, data-ora, prompt esatto, risposta grezza, URL citate. Senza questi campi il dato non è ricostruibile e non è difendibile.

### 6.3 Ripetizioni, varianza, intervalli

- Anche con impostazioni "deterministiche" l'accuratezza di cinque LLM varia fino al 15% tra run e le stringhe di output ancora di più ([Atil et al., arXiv 2408.04667](https://arxiv.org/abs/2408.04667)). SparkToro suggerisce "almeno 60-100 esecuzioni" per prompt per stimare la visibilità, e di confrontare i risultati con la ricerca tradizionale.
- La visibilità è una proporzione binomiale: l'intervallo di confidenza al 95% (Wilson) per esecuzioni indipendenti è ([riferimento](https://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval)):

| Esecuzioni per prompt | vis. osservata 10% | 30% | 50% |
|---:|---|---|---|
| 5 | 1–54% | 7–70% | 17–83% |
| 10 | 2–40% | 11–60% | 24–76% |
| 20 | 3–30% | 15–52% | 30–70% |
| 30 | 3–26% | 17–48% | 33–67% |
| 50 | 4–21% | 19–44% | 37–63% |
| 100 | 6–17% | 22–40% | 40–60% |

Per dire "la tua visibilità è 30% ±10 punti" servono circa 80 esecuzioni (p=0,3), ±15 punti circa 36. Un design praticabile per un report a basso costo: 12 prompt × 3 piattaforme × 5 ripetizioni = 180 esecuzioni per attività, che danno un intervallo stretto *a livello di report aggregato* (180 esecuzioni) e un intervallo largo per singolo prompt (5): il report deve mostrare il primo come KPI e il secondo solo come indicazione qualitativa ("compari in 2 su 5"). Le ripetizioni vanno distribuite su giorni diversi, perché le risposte "cambiano ogni giorno" (Otterly) e la varianza intra-giorno sottostima quella reale.

- Riportare sempre: n esecuzioni, intervallo, data della raccolta, versione del modello. Confrontare due trimestri solo se gli intervalli non si sovrappongono.

### 6.4 Quanto spesso l'AI raccomanda un'attività locale: i benchmark da incorporare

ChatGPT raccomanda l'1,2% delle sedi (SOCi), Gemini 11%, Perplexity 7,4%; il 40,9% delle attività locali non è mai raccomandato da ChatGPT su 5 prompt e il 68,8% da Perplexity (Insites); l'83% dei ristoranti non appare mai in ChatGPT (Local Falcon); i brand sono "scelti" nel 60-90% delle risposte quando sono forti e nel 30-40% nei mercati B2B più dispersi (SparkToro). Il report deve posizionare l'attività rispetto a questi numeri e, appena il campione interno è sufficiente, rispetto alla mediana italiana per settore e dimensione di città calcolata dal prodotto stesso.

### 6.5 Validazione trimestrale

Ogni trimestre: (1) rieseguire la stessa batteria su un pannello fisso di 200-300 attività per settore e città (campione di controllo) per misurare la deriva dei modelli; (2) ricalcolare i benchmark di settore; (3) confrontare un campione di risposte API con risposte da app consumer e aggiornare la nota sullo scarto; (4) verificare che i template riflettano ancora il linguaggio reale (le query ChatGPT con ricerca sono quasi raddoppiate in lunghezza in un anno, Semrush); (5) registrare le versioni dei modelli e i cambi di piattaforma (nuove app integrate come TheFork, nuovi grounding) e annotarli nel report, perché ogni salto nei dati va spiegato prima con questi che con le azioni del cliente.

---

## Fonti consultate

Dati di settore: [Movimprese 2025 (Unioncamere-InfoCamere)](https://www.unioncamere.gov.it/sites/default/files/articoli/2026-01/23012026_com_movi_anno_2025.docx) · [ISTAT, Annuario statistico 2025, cap. 14](https://www.istat.it/storage/ASI/2025/capitoli/C14.pdf) · [ISTAT, Annuario statistico 2025, cap. 19](https://www.istat.it/storage/ASI/2025/capitoli/C19.pdf) · [Eurostat SBS sbs_ovw_act (ISTAT-ASIA 2023)](https://ec.europa.eu/eurostat/databrowser/view/sbs_ovw_act/default/table) · [FIPE Rapporto Ristorazione 2025](https://www.fipe.it/wp-content/uploads/2025/04/CS-Rapporto-2025.pdf) · [Confcommercio, desertificazione commerciale, 15/11/2025](https://www.confcommerciomilano.it/export/sites/unione/doc/news_comunicati/pdf/2025/176-15.11.2025-Confcommercio-su-desertificazione-commerciale.pdf) · [ISTAT agriturismi 2024 via Italpress](https://www.italpress.com/?p=655552) · [Censis-Cassa Forense 2025](https://miolegale.it/notizie/rapporto-censis-avvocatura/) · [FNC Rapporto 2026 via Informazione Fiscale](https://www.informazionefiscale.it/stipendio-commercialista-quanto-guadagna-dati-rapporto) · [Odontoiatri via Italpress](https://www.italpress.com/in-italia-65-mila-odontoiatri-professione-in-crescita/) · [Censis "Musei di vetro" 2026](https://www.censis.it/wp-content/uploads/2026/05/Sito-Musei-di-vetro.pdf) · [ISTAT-ICE esportatori via Air Cargo Italy](https://aircargoitaly.com/?p=30979).

Comportamento degli utenti: [BrightLocal LCRS 2026 – AI](https://www.brightlocal.com/research/lcrs-ai-trust/) · [BrightLocal, canali di ricerca 2026](https://www.brightlocal.com/research/consumer-search-behavior-channels/) · [Audicom via l'Adige](https://www.ladige.it/tecnologia/chatgpt-piu-usata-da-italiani-ma-cresce-gemini-ed-e-prima-su-mobile-tu9kzt4r) · [Semrush 2025](https://www.semrush.com/news/379285-new-semrush-study-reveals-chatgpt-search-trends-insights-from-80-million-clickstream-records/) · [Semrush 2026](https://www.semrush.com/blog/chatgpt-search-insights/) · [Google Q1 2025](https://blog.google/inside-google/message-ceo/alphabet-earnings-q1-2025) · [Google Italia AI Mode](https://blog.google/intl/it-it/ai-mode-arriva-anche-in-italia/) · [ppc.land Q3 2025](https://ppc.land/google-executives-hint-at-a-unified-ai-search-interface/) · [NBER WP 34255](https://www.nber.org/system/files/working_papers/w34255/w34255.pdf) · [Metehan, 1.827 prompt](https://metehan.ai/pdf/i-analyzed-1827-real-user-prompts-from-chatgpt-here-what-ive-found-agentic-search.pdf) · [Otterly, prompt da tracciare](https://ai-cache.otterly.ai/blog/prompts-tracking-research-chatgpt/index.html) · [G2, ott. 2025](https://learn.g2.com/ai-search-surging-for-b2b-buyers) · [Forrester 2024](https://www.forrester.com/report/b2b-buyer-adoption-of-generative-ai/RES181769) · [Responsive via Demand Gen Report](https://www.demandgenreport.com/?p=50784) · [GrackerAI (6sense)](https://gracker.ai/data-and-research-reports/b2b-buyer-procurement-starts-in-chat-window).

Visibilità e fonti: [SOCi LVI 2026](https://www.soci.ai/news/in-ai-driven-discovery-few-brands-are-chosen-most-disappear/) · [Search Engine Land su SOCi](https://searchengineland.com/ai-local-visibility-report-2026-468085) · [Near Media su SOCi](https://www.nearmedia.co/local-ai-study-ai-mode-onramp-g-queries-down-squandered-tech-trust/) · [Insites benchmark 10.000](https://insites.com/blog/the-ai-visibility-benchmark-how-10000-local-businesses-actually-perform-in-chatgpt-and-perplexity/) · [Insites segnali](https://insites.com/blog/what-ai-uses-to-choose-local-businesses-and-what-it-ignores/) · [Local Falcon ristoranti](https://www.localfalcon.com/research/the-ai-visibility-crisis-why-83-percent-of-restaurants-dont-exist-in-chatgpt) · [Profound citazioni](https://www.tryprofound.com/blog/ai-platform-citation-patterns) · [Cloudbeds via Hotel Technology News](https://hoteltechnologynews.com/2025/07/research-otas-dominate-as-primary-source-in-ai-powered-hotel-discovery/) · [SEOZoom travel Italia](https://www.seozoom.com/?p=34853) · [TheFork in ChatGPT](https://techprincess.it/thefork-chatgpt-prenotazioni-ristoranti-conversazione-ai/amp/) · [Citations.press directory](https://www.thailand-business-news.com/?p=328948) · [Peec retrieval vs citation](https://docs.peec.ai/research/retrieval-vs-citation.md).

Metriche: [Peec visibility](https://docs.peec.ai/metrics/brand-metrics/visibility.md) · [Peec SoV](https://docs.peec.ai/metrics/brand-metrics/share-of-voice.md) · [Peec position](https://docs.peec.ai/metrics/brand-metrics/position.md) · [Peec sentiment](https://docs.peec.ai/metrics/brand-metrics/sentiment.md) · [Peec help](https://help.peec.ai/article/how-is-visibility-calculated-tz1uv68wuaho0c53gmdikqiu) · [Profound AEI](https://help.tryprofound.com/articles/3443229936-answer-engine-insights-overview) · [Otterly KPI](https://help.otterly.ai/brand-report-kpi-definition) · [Otterly insights](https://help.otterly.ai/insights-on-brand-reports) · [Semrush metriche](https://it.semrush.com/kb/1594-ai-seo-metrics) · [Semrush dati](https://www.semrush.com/kb/1607-ai-visibility-data) · [Ahrefs metodologia](https://ahrefs.com/blog/brand-radar-methodology/) · [Rankscale](https://help.rankscale.ai/articles/1188645477-metrics-in-rankscale) · [BrightLocal help](https://help.brightlocal.com/hc/en-us/articles/37989673412114-What-is-Local-AI-Visibility) · [BrightLocal blog](https://www.brightlocal.com/blog/new-local-ai-visibility-tracker/) · [SEOZoom AI](https://www.seozoom.com/?p=34051).

Metodo: [SparkToro/Gumshoe](https://sparktoro.com/blog/new-research-ais-are-highly-inconsistent-when-recommending-brands-or-products-marketers-should-take-care-when-tracking-ai-visibility/) · [Search Engine Land su SparkToro](https://searchengineland.com/ai-recommendation-lists-rarely-repeat-study-468076) · [Atil et al. 2024](https://arxiv.org/abs/2408.04667) · [OpenAI Help ricerca](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) · [OpenAI web_search API](https://developers.openai.com/api/docs/guides/tools-web-search) · [OpenAI GPT-5 router](https://openai.com/index/introducing-gpt-5/) · [Perplexity user_location](https://docs.perplexity.ai/guides/user-location-filter-guide) · [Gemini Maps grounding](https://ai.google.dev/gemini-api/docs/generate-content/maps-grounding?hl=it) · [Brandlight UI vs API](https://research.brandlight.ai/ui-vs-api.html) · [Massive API vs app](https://www.joinmassive.com/blog/are-api-based-ai-calls-a-good-proxy-for-what-your-users-actually-see) · [Intervallo di Wilson](https://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval).

Limiti della ricerca: il sito istat.it non era raggiungibile durante lo studio (sono stati usati i PDF dell'Annuario e i dati ASIA via Eurostat); le pagine docs.peec.ai/metrics (indice), docs.tryprofound.com/getting-started/glossary, semrush.com/kb/1594 (versione EN) e ai.google.dev maps-grounding (versione EN) non erano accessibili e sono state sostituite da pagine equivalenti; la pagina soci.ai/insights/lvi restituiva solo metadati, il dato 1,2% è stato verificato sul comunicato SOCi e su Search Engine Land. Non esistono, a oggi, studi pubblici sulle quote di citazione dei portali italiani nelle risposte AI: le indicazioni del §4.2 marcate H vanno verificate con il campionamento del prodotto.
