# Profili per categoria

Un file per categoria. Ogni profilo decide:

- **domande**: template per tipo (generica, bisogno, specialità, nome). Segnaposto: `{categoria}`, `{citta}`, `{zona}`, `{specialita}`, `{nome}`, `{requisito}`, `{regione}`.
- **fonti**: i portali dove controlliamo se l'attività è presente.
- **metriche**: cosa misura il report per questa categoria.
- **azioni**: le azioni che Claude può consigliare, con la condizione che le fa scattare. Il prompt non può inventarne altre.

Si aggiornano senza rilascio: in produzione vengono caricati nel database. `altro.json` è il profilo di partenza per i mestieri non previsti.
