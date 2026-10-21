# Profili per categoria

Un file per categoria, 36 categorie più `altro`, in ordine di numerosità (imprese attive, ISTAT-ASIA 2023 via Eurostat `sbs_ovw_act`; `index.ts` conserva l'ordine). Vengono dallo studio «Visibilità AI per tutte le attività italiane: settori, domande reali, fonti, metriche e metodo» (ottobre 2026), salvato nel progetto.

Ogni profilo decide:

- **domande**: template per tipo. Sei tipi, dallo studio dei prompt reali: `generica` (categoria + luogo), `bisogno` (urgenza, orario, prezzo, situazione), `specialita` (la prestazione), `requisito` (certificazione, convenzione, servizio accessorio), `confronto` («meglio X o Y?»), `nome` (verifica dell'attività); `inglese` per chi esporta o riceve stranieri. Segnaposto: `{categoria}`, `{citta}`, `{zona}`, `{provincia}`, `{regione}`, `{specialita}`, `{requisito}`, `{nome}`, `{concorrente}`. Le frasi sono lunghe e colloquiali come i prompt veri (8–25 parole, luogo più almeno un vincolo).
- **famiglia**: `locale`, `b2b`, `professionista`, `sanita`, `ricettivo`, `cultura`. Decide la geografia delle domande (città e zona, oppure provincia e regione per il B2B) e la famiglia di azioni.
- **fonti**: i portali dove controlliamo se l'attività è presente, dal §4.2 dello studio. Per i portali italiani non esistono studi pubblici sulle quote di citazione: le quote vere le misura il prodotto.
- **metriche**: cosa conta di più nel report per questa categoria.
- **azioni**: le azioni che il report può consigliare, con la condizione che le fa scattare. Il modello non può inventarne altre.
- **imprese**: imprese attive in Italia, per ordinare la copertura e per la landing.

Si aggiornano senza rilascio: in produzione vengono caricati nel database. `altro.json` è il profilo di partenza per i mestieri non previsti; il generatore `genera-profili.mjs` (nello studio) li riscrive tutti da un'unica tabella.
