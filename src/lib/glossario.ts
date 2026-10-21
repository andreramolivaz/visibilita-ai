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
    cosa: "Quanto gli assistenti ti consigliano quando un cliente fa le domande del tuo set, tenendo conto della posizione in cui ti nominano e di quanti italiani usano ogni assistente.",
    come: "Per ogni risposta: 1º posto vale 1,00, 2º 0,85, 3º 0,70, 4º 0,55, 5º 0,40, assente 0. Si fa la media per assistente, poi la media pesata per quota d'uso (ChatGPT 30%, Gemini 25%, Google AI 20%, Claude 7%, Perplexity 4%, Grok 1%, rinormalizzati sugli assistenti interrogati) e si porta su 100.",
    lettura: "0–10 Invisibile, 11–40 Poco visibile, 41–70 Visibile, 71–100 Dominante. Il segno vuoto sulla scala è la mediana delle attività della tua categoria e città che abbiamo analizzato.",
    nonE: "Non è una percentuale di clienti e non misura Google tradizionale: solo le risposte degli assistenti AI.",
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
    id: "posizione",
    nome: "Posizione media quando compari",
    cosa: "In che posizione dell'elenco ti mettono, in media, quando ti nominano.",
    come: "Media delle posizioni pesata per quante volte sei comparso in quella posizione.",
    lettura: "1,0 vuol dire sempre per primo. Sopra 3 vuol dire che ti citano ma dopo altri: i clienti leggono quasi solo i primi due o tre nomi.",
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
    cosa: "Dove ti trovano: domande generiche, per bisogno, per specialità, sul nome.",
    come: "Risposte in cui compari sul totale delle risposte di quel tipo.",
    lettura: "Il tipo con la quota più bassa è dove perdi clienti che cercano una cosa precisa (orario, prezzo, servizio).",
  },
  {
    id: "concorrenti",
    nome: "Chi consigliano al posto tuo e testa a testa",
    cosa: "I cinque nomi più citati nelle risposte e, per ciascuno, in quante domande compare solo lui, entrambi, solo tu.",
    come: "Conteggio per nome, con nomi e indirizzi aggregati (Allegato A). Il testa a testa conta le domande, non le risposte.",
    lettura: "«Solo lui» alto vuol dire che per quelle domande l'assistente ha già una risposta e non sei tu: guarda su quali fonti è presente lui e tu no.",
  },
  {
    id: "cita-chi",
    nome: "Chi cita chi",
    cosa: "Per ogni attività, in quante domande ogni assistente la cita.",
    come: "Conteggio delle domande per coppia attività × assistente.",
    lettura: "Un concorrente forte su un assistente dove tu sei a zero indica una fonte che quell'assistente legge e in cui lui c'è.",
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
    nome: "Cosa dicono di te",
    cosa: "La descrizione che ogni assistente dà della tua attività alla domanda sul nome, e gli errori rispetto ai tuoi dati.",
    come: "Confronto automatico di categoria, orari, indirizzo, telefono e servizi con la scheda Google e il sito.",
    lettura: "Un errore («chiuso il lunedì» quando sei aperto) esclude dalle domande per bisogno. Si corregge alla fonte da cui l'assistente l'ha preso.",
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
    id: "proiezione",
    nome: "Andamento e proiezione",
    cosa: "Il punteggio degli ultimi mesi e, in tratteggio, dove porta la tendenza nei tre mesi successivi.",
    come: "Retta dei minimi quadrati sugli ultimi punteggi, prolungata di tre mesi.",
    lettura: "La proiezione è indicativa e cambia con ogni scansione. Serve a vedere la direzione, non a prevedere un numero.",
  },
];

export function voce(id: string): VoceGlossario | undefined {
  return GLOSSARIO.find((v) => v.id === id);
}
