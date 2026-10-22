/**
 * Guida alla lettura del report: ogni metrica e ogni visual, una volta sola,
 * usata dal report web e dal PDF (Allegato C).
 * Ogni voce: cos'è, come si calcola, come si legge, cosa non è.
 */
export interface VoceGlossario {
  id: string;
  nome: string;
  cosa: string;
  come: string;
  lettura: string;
  nonE?: string;
}

export const GLOSSARIO: VoceGlossario[] = [
  {
    id: "punteggio",
    nome: "Punteggio di visibilità AI (0–100)",
    cosa: "Quanto gli assistenti ti consigliano da soli, quando un cliente fa una domanda senza il tuo nome, tenendo conto della posizione in cui ti nominano e di quanti italiani usano ogni assistente.",
    come: "Solo sulle domande spontanee (generiche, per bisogno, per specialità, per requisito, per occasione, vicino a te): quelle sul nome, di confronto e in inglese sono riportate a parte. Per ogni risposta: 1º posto vale 1,00, 2º 0,85, 3º 0,70, 4º 0,55, 5º 0,40, assente 0. Si fa la media per assistente, poi la media pesata per quota d'uso (ChatGPT 30%, Gemini 25%, Google AI 20%, Claude 7%, Perplexity 4%, Grok 1%, rinormalizzati sugli assistenti interrogati) e si porta su 100.",
    lettura: "0–10 Invisibile, 11–40 Poco visibile, 41–70 Visibile, 71–100 Dominante. Il segno grigio sulla scala è la mediana delle attività della tua categoria e città che abbiamo analizzato. È la distinzione tra ricordo spontaneo e sollecitato delle ricerche di marca: conta il primo.",
    nonE: "Non è una percentuale di clienti e non misura Google tradizionale: solo le risposte degli assistenti AI.",
  },
  {
    id: "telescopio",
    nome: "Il telescopio: famiglie, zoom, formulazioni",
    cosa: "Il set di domande non è una lista: è una struttura. Famiglie di domande (generiche, per bisogno, per specialità, per requisito, per occasione, vicino a te, di confronto, sul nome, in inglese), ciascuna con almeno sei domande; tre livelli di zoom geografico (città, zona, vicino a te con la posizione impostata); lo stesso intento chiesto in più formulazioni.",
    come: "Ogni famiglia ha abbastanza risposte da avere un intervallo proprio (72 risposte danno circa ±10 punti). Le formulazioni e i livelli di zoom sono repliche dello stesso intento: aggiungono campione e misurano la sensibilità alle parole e alla distanza.",
    lettura: "Leggi prima le famiglie, poi lo zoom: una famiglia bassa dice cosa manca (orari, prestazioni, occasioni); uno zoom basso dice dove manca (in città, in zona, intorno a te).",
    nonE: "Non è un elenco di parole chiave: la domanda è una frase intera, come la scrive un cliente.",
  },
  {
    id: "zoom",
    nome: "Per livello di zoom",
    cosa: "Le risposte in cui compari quando la domanda è fatta per la città, per la zona o «vicino a me» con la posizione impostata (per le aziende: provincia, regione, Italia).",
    come: "Risposte in cui compari sul totale delle risposte di quel livello, sulle domande spontanee.",
    lettura: "Se compari solo vicino a te e non in città, gli assistenti ti conoscono come posto di quartiere: serve notorietà in città (fonti, recensioni, stampa locale).",
  },
  {
    id: "intorno",
    nome: "Intorno a te",
    cosa: "La mappa dei punti: la posizione del cliente viene impostata nel tuo indirizzo e in quattro (o otto) punti intorno, a 1,2 km. Per ogni punto, le risposte in cui compari.",
    come: "Solo sugli assistenti che accettano le coordinate (Gemini, Google AI, Perplexity); gli altri ricevono la città e non entrano in questa mappa. Stessa domanda, stessa giornata, punto diverso.",
    lettura: "Un punto scuro vicino e chiari lontano è normale per un'attività di quartiere. Un centro chiaro vuol dire che nemmeno da casa tua ti consigliano.",
    nonE: "Non è la mappa di Google Maps: è dove l'assistente ti consiglia, non dove sei.",
  },
  {
    id: "occasione",
    nome: "Per occasione",
    cosa: "Chi chiede e perché: famiglia con bambini, coppia, lavoro, gruppo, turisti, budget, subito (o, per le aziende: piccole serie, grandi volumi, urgenza, certificazioni, startup, estero).",
    come: "Risposte in cui compari sul totale delle risposte con quell'occasione.",
    lettura: "Un'occasione a zero è un pubblico che gli assistenti non ti assegnano: se la vuoi, deve comparire nei tuoi testi e nelle recensioni.",
  },
  {
    id: "formulazione",
    nome: "Formulazione",
    cosa: "Lo stesso intento chiesto in tre modi: diretto («pizzeria aperta la domenica a Bergamo»), colloquiale («cerco una pizzeria… cosa mi consigli?»), imperativo («consigliami una pizzeria…»).",
    come: "Un intento è concorde se, assistente per assistente, le formulazioni danno lo stesso esito (al più una risposta di differenza). Si riporta quanti intenti su quanti.",
    lettura: "Alta concordanza: contano intento e luogo, non le parole (SparkToro 2026). Bassa: le risposte sono instabili e i numeri vanno letti con il loro intervallo.",
  },
  {
    id: "citazione",
    nome: "Risposte in cui compari",
    cosa: "Quante risposte, sul totale lette, contengono il tuo nome.",
    come: "Conteggio diretto. L'intervallo al 95% è l'intervallo di Wilson: con 270 risposte un 19% ha un'incertezza di circa ±5 punti.",
    lettura: "Se l'intervallo del mese prossimo si sovrappone a quello di questo mese, la differenza può essere caso. Se non si sovrappone, è cambiato qualcosa.",
  },
  {
    id: "copertura",
    nome: "Domande in cui compari",
    cosa: "Su quante domande del set almeno un assistente ti nomina almeno una volta.",
    come: "Conteggio delle righe della mappa con almeno una cella piena.",
    lettura: "Dice l'ampiezza: puoi comparire spesso ma solo su due domande, o poco ma su molte. Le domande vuote sono quelle su cui lavorare con le azioni.",
  },
  {
    id: "quota-voce",
    nome: "Quota di voce",
    cosa: "Le tue citazioni su tutte le citazioni di attività nelle stesse risposte: quanta parte dei consigli va a te.",
    come: "Citazioni tue diviso citazioni di tutte le attività riconosciute nelle risposte, comprese quelle fuori dai cinque nomi più citati. È la definizione usata da Peec, Profound, Semrush e BrightLocal.",
    lettura: "Puoi comparire nel 19% delle risposte e avere una quota di voce del 7%: vuol dire che le risposte in cui ci sei contengono anche altri nomi, e che i concorrenti ci sono più spesso di te. La distanza dal primo è la misura del lavoro da fare.",
    nonE: "Non è una quota di mercato: misura i consigli degli assistenti, non i clienti.",
  },
  {
    id: "primi-tre",
    nome: "Nei primi tre",
    cosa: "Quante volte, quando compari, sei tra i primi tre nomi dell'elenco.",
    come: "Citazioni in 1ª, 2ª o 3ª posizione sul totale delle tue citazioni.",
    lettura: "L'ordine esatto cambia da una risposta all'altra (SparkToro, 2026: la stessa lista nello stesso ordine ricompare circa una volta su mille); «primi tre o oltre» è stabile e corrisponde a quanto un cliente legge davvero.",
    nonE: "Non usiamo la posizione media con i decimali come indicatore principale: è instabile per costruzione. La trovi nelle note tecniche.",
  },
  {
    id: "territorio",
    nome: "Dove ci sei, dove c'è un concorrente, dove non c'è nessuno",
    cosa: "Ogni domanda del set finisce in uno di tre gruppi: compari almeno una volta; non compari e un concorrente sì; non compare nessuna attività riconoscibile.",
    come: "Dalla mappa domanda × assistente e dai nomi riconosciuti nelle risposte, per ogni domanda.",
    lettura: "Le domande dove c'è un concorrente e tu no sono quelle da conquistare: l'assistente ha già una risposta. Le domande dove non c'è nessuno sono libere: lì basta una fonte buona per essere l'unico nome.",
  },
  {
    id: "stabilita",
    nome: "Stabilità delle risposte",
    cosa: "Quanto le risposte restano uguali ripetendo la stessa domanda allo stesso assistente.",
    come: "Quota di celle della mappa in cui tutte le ripetizioni concordano (sempre citato o mai citato).",
    lettura: "Alta stabilità: i numeri sono affidabili. Bassa stabilità: l'assistente oscilla, e sei in una zona in cui una scheda in più può spostarti.",
    nonE: "Non è un difetto del test: è una proprietà degli assistenti, che la ripetizione serve a misurare.",
  },
  {
    id: "per-assistente",
    nome: "Per assistente",
    cosa: "Domande in cui compari e punteggio parziale per ogni assistente.",
    come: "Il punteggio parziale usa la stessa formula del punteggio totale, ristretta alle risposte di quell'assistente.",
    lettura: "Confronta il punteggio parziale con gli utenti: essere a 10 su ChatGPT (9,6 milioni di italiani) pesa più che essere a 10 su Grok.",
  },
  {
    id: "per-tipo",
    nome: "Per tipo di domanda",
    cosa: "Dove ti trovano: domande generiche, per bisogno, per specialità, per requisito, di confronto, sul nome.",
    come: "Risposte in cui compari sul totale delle risposte di quel tipo. I sei tipi vengono dallo studio dei prompt reali: le domande agli assistenti sono frasi di 8–25 parole con un luogo e almeno un vincolo (Semrush 2025–26), e quelle di confronto («meglio X o Y?») sono circa una su quattro (Citations.press 2026).",
    lettura: "Il tipo con la quota più bassa è dove perdi clienti che cercano una cosa precisa (orario, prezzo, servizio, certificazione).",
  },
  {
    id: "concorrenti",
    nome: "Chi consigliano al posto tuo",
    cosa: "I cinque nomi più citati nelle risposte, con citazioni, quota di voce, presenza nei primi tre, domande in cui ci sono loro e non tu, e l'assistente che li cita di più.",
    come: "Conteggio per nome, con nomi e indirizzi aggregati. «Domande senza di te» conta le domande, non le risposte, in cui il concorrente compare e tu no.",
    lettura: "La distanza dal primo in quota di voce è la misura del lavoro. Un concorrente forte su un assistente dove tu sei a zero indica una fonte che quell'assistente legge e in cui lui c'è.",
  },
  {
    id: "mappa",
    nome: "Mappa domanda × assistente",
    cosa: "Una cella per ogni domanda e assistente: posizione e quante volte su quante ripetizioni.",
    come: "Colore dalla posizione media (più scuro, più in alto); il numero piccolo è il conteggio delle ripetizioni in cui compari.",
    lettura: "Righe vuote: domande su cui nessun assistente ti conosce. Colonne vuote: assistenti che non ti conoscono. Celle chiare: ci sei, ma in fondo.",
  },
  {
    id: "parole",
    nome: "Le parole che usano",
    cosa: "I termini più frequenti nelle risposte della tua categoria, e quante volte compaiono nelle tue recensioni Google.",
    come: "Estrazione dei termini ricorrenti dalle risposte (parole e coppie di parole, al netto di quelle comuni), confronto con le tue recensioni e il tuo sito.",
    lettura: "Un termine molto usato dagli assistenti e assente dalle tue recensioni è una parola da far entrare: nel menu, nelle risposte alle recensioni, nelle foto con didascalia.",
  },
  {
    id: "fonti",
    nome: "Da dove prendono le informazioni",
    cosa: "Le fonti che gli assistenti citano o consultano quando rispondono, e se tu ci sei.",
    come: "URL restituiti dalle API (sources, grounding, citazioni), raggruppati per sito; presenza verificata con nome, indirizzo e telefono.",
    lettura: "Una fonte molto citata dove non ci sei è la prima cosa da sistemare, soprattutto se ci sono già i tuoi concorrenti.",
  },
  {
    id: "dicono",
    nome: "Cosa dicono di te, dati corretti e tono",
    cosa: "La descrizione che ogni assistente dà della tua attività alla domanda sul nome, se i tuoi dati sono riportati correttamente e con quale tono.",
    come: "Confronto automatico di categoria, orari, indirizzo, telefono e servizi con la scheda Google e il sito. Il tono è classificato in positivo, neutro o critico da un modello linguistico sulla descrizione.",
    lettura: "Un errore («chiuso il lunedì» quando sei aperto) esclude dalle domande per bisogno e si corregge alla fonte da cui l'assistente l'ha preso. Negli studi di settore il 30–39% delle attività ha il telefono sbagliato nelle risposte AI (Insites 2026). Il tono è positivo o neutro per quasi tutte le attività: lo segnaliamo solo quando è critico.",
    nonE: "Non diamo un punteggio di sentiment: sarebbe uguale per quasi tutti e non direbbe cosa fare.",
  },
  {
    id: "azioni",
    nome: "Tre azioni e punti stimati",
    cosa: "Le tre cose da fare, in ordine di impatto, con il dato che le motiva e i punti di punteggio stimati.",
    come: "Le azioni sono scelte tra quelle previste per la categoria; i punti stimati vengono dal peso delle domande e delle fonti su cui l'azione agisce.",
    lettura: "Il «dove puoi arrivare» è una stima, non una promessa: la verifica è la scansione successiva, dove le azioni fatte vengono spuntate e misurate.",
    nonE: "Non è un preventivo di fatturato e non dipende da pubblicità a pagamento.",
  },
  {
    id: "contesto",
    nome: "Mediana e percentile della categoria",
    cosa: "Come stai rispetto alle altre attività della tua categoria e città che abbiamo analizzato.",
    come: "Mediana dei punteggi delle attività analizzate nella stessa categoria e città negli ultimi 90 giorni; percentile = quota con punteggio più basso del tuo.",
    lettura: "Serve a non spaventarsi: in molte categorie la mediana è bassa, perché gli assistenti citano poche attività. Conta la distanza dai primi, non dallo zero.",
  },
  {
    id: "andamento",
    nome: "Andamento",
    cosa: "Il punteggio delle scansioni precedenti, con la stessa batteria di domande e la stessa configurazione.",
    come: "Un punto per scansione. Una differenza tra due mesi è reale solo se gli intervalli al 95% delle due misure non si sovrappongono.",
    lettura: "Serve a vedere se le azioni fatte hanno spostato qualcosa, e a distinguere un cambiamento da un'oscillazione.",
    nonE: "Non facciamo previsioni: le risposte degli assistenti non hanno una base statistica che le renda prevedibili e i modelli cambiano senza preavviso. Mostriamo l'andamento, non il futuro.",
  },
  {
    id: "riferimenti",
    nome: "Riferimenti esterni",
    cosa: "Quanto è normale non comparire: i numeri degli studi di settore con cui confrontare il tuo risultato.",
    come: "ChatGPT raccomanda l'1,2% delle sedi monitorate da SOCi (oltre 350.000 sedi, 2026); il 40,9% delle attività locali non è mai raccomandato da ChatGPT e il 68,8% da Perplexity (Insites, 10.000 attività, 2026); l'83% dei ristoranti non compare mai in ChatGPT (Local Falcon, 2026).",
    lettura: "Un risultato basso è la norma, non un difetto della misura. La distanza dai primi tre della tua categoria e città conta più dello zero.",
  },
];

export function voce(id: string): VoceGlossario | undefined {
  return GLOSSARIO.find((v) => v.id === id);
}
