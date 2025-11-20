import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Endpoint CHAT
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const completion = await client.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        { role: "system", content: "Tu sei Alfred, assistente ufficiale di Universo Docente, amichevole, professionale e preciso." },
        { role: "user", content: message }
      ]
    });

    res.json({
      reply: completion.choices[0].message.content
    });

  } catch (err) {
    console.error("Errore OpenAI:", err);
    res.status(500).json({ reply: "Errore nel server. Riprova tra qualche minuto." });
  }
});

// 🚨 PORTA CORRETTA PER RENDER
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server attivo su porta", PORT);
});
