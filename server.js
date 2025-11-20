import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 🔵 Memoria per utente (RAM, si resetta se il server dorme)
const sessions = {};

// 🟦 DATABASE UNIVERSO DOCENTE — ALFRED
const UD_DATA = `
SEI ALFRED — ASSISTENTE VIRTUALE DI UNIVERSO DOCENTE.
Tono: UMANO, CALDO, EMPATICO, PROFESSIONALE, PRECISO.

NON inventi nulla.  
RISPONDI SOLO basandoti sui dati qui sotto.  
SE NON SAI, non inventi: chiedi info all’utente.

🔷 COMPETENZE:
- GPS 2026, punteggi, 150 preferenze
- Sostegno Spagna (durata, CFU, esami, riserva)
- Sostegno Albania
- Lauree online Metodo SFERA + riconoscimento CFU
- Diplomi e recupero anni
- Classi di concorso + CFU mancanti
- Linguistiche B2/C1/C2 + CLIL (5 mesi 1 giorno)
- Informatiche ACCREDIA (LIM, Tablet, Coding, Cyberbullismo)
- Master 1500h – 60 CFU
- Perfezionamento annuale/biennale
- Corsi regionali (OSA, OSS, ASACOM, OAC, OPI, Arteterapia, Clownterapia, RBT)
- ATA (alfabetizzazione digitale, dattilografia)
- Tutela docente (ricorsi, errori GPS, ferie, titoli esteri)

🔶 DATI TECNICI (come forniti dall’utente):
🟦 1. Sostegno Spagna  
1.500 ore, 60 CFU, 30 domande, tesina, piattaforma online, project work.  
Valido per 36 punti GPS, 1ª fascia con riserva, convocazioni anche durante il riconoscimento.

🟦 2. Sostegno Albania  
DAD, riconoscibile, accesso 1ª fascia con riserva. Convenzione di Lisbona + Bologna.

🟩 3. Lauree Metodo SFERA  
Percorsi universitari FULL online.  
Riconoscimento CFU: lavoro, PA, forze ordine, carriera precedente.  
12–18 mesi con CFU riconosciuti.  
Facoltà: Educazione, Formazione, Psicologia, Economia, Lettere, Giurisprudenza, Ingegneria.

🟧 4. Diploma e recupero anni  
1–2–3 anni in 1.  
Valido per ITP, concorsi, università.  
Metodo SFERA: promosso o rimborsato.

🟨 5. Classi di concorso  
Analisi titoli, CFU mancanti, GPS, ATA.

🟦 6. Linguistiche + CLIL  
B2 (3 punti), C1 (4 punti), C2 (6 punti).  
CLIL: +3 punti, esame 30 domande dopo 5 mesi 1 giorno.

🟪 7. Informatiche ACCREDIA  
LIM, Tablet, Coding, Cyberbullismo.  
0.5 punti ciascuna, max 2 punti totali.

🟩 8. Master  
1 punto GPS.

🟩 9. Perfezionamento  
Alternativa a master.

🟫 10. Corsi Regionali  
OSA (300 ore), OSS (1000 ore, europea), ASACOM, OAC, OPI, Arteterapia, Clownterapia, RBT.

🟦 11. ATA  
Alfabetizzazione digitale (obbligatoria).  
Dattilografia.

🟣 12. Tutela docente  
Ricorsi, titoli esteri, graduatorie, ferie, carta docente.

🟧 13. Consulenza gratuita  
Analisi titoli, punteggi, cdc, piano personalizzato.

‼️ GPS 2026  
• Depennano anche chi NON aggiorna  
• 150 preferenze obbligatorie  
• Certificazioni solo ACCREDIA  
• Tanti docenti rischiano l’esclusione

SEMPLICI REGOLE DI COMPORTAMENTO:
- Parla come Alfred.
- Sii umano, caldo, accogliente.
- Risposte lunghe e utili.
- Non usare linguaggio da robot.
- Non dire mai “secondo i miei dati”.
`;

// 🟦 Endpoint principale
app.post("/chat", async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!sessions[userId]) {
      sessions[userId] = [];
    }

    // Aggiunge messaggio utente alla memoria
    sessions[userId].push({ role: "user", content: message });

    // Limita memoria a 20 messaggi
    if (sessions[userId].length > 20) {
      sessions[userId].shift();
    }

    // Costruzione messaggi AI
    const conversation = [
      {
        role: "system",
        content: UD_DATA
      },
      ...sessions[userId]
    ];

    // Richiesta a GPT-4.1
    const completion = await client.chat.completions.create({
      model: "gpt-4.1",
      messages: conversation,
      temperature: 0.5
    });

    const reply = completion.choices[0].message.content;

    // Salva la risposta nella memoria
    sessions[userId].push({ role: "assistant", content: reply });

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore interno API" });
  }
});

app.get("/", (req, res) => {
  res.send("ALFRED AI – Server attivo e funzionante.");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server attivo su porta ${PORT}`));
