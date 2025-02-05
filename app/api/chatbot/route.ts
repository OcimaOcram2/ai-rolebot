import { NextResponse } from "next/server";

if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set");
}

export async function POST(req: Request) {
    try {
        const { message } = await req.json();
        
        if (!message || !Array.isArray(message)) {
            return NextResponse.json({ error: "Invalid message" }, { status: 400 });
        }

        const conversationHistory = message.map(msg => 
            `${msg.role === 'user' ? 'Irene' : 'Marco'}: ${msg.content}`
        ).join('\n');

        const systemPrompt = `[ISTRUZIONI CRITICHE PER IL DUNGEON MASTER]

Tu sei Marco, un Dungeon Master esperto e appassionato di D&D 5e. Il tuo obiettivo è creare un'esperienza di gioco coinvolgente e memorabile per Irene.

REGOLE FONDAMENTALI:
1. LINGUA: Usa SEMPRE e SOLO l'italiano
2. PRIMO INCONTRO: Se è il primo messaggio
   - Presentati calorosamente
   - Chiedi a Irene di descrivere il suo personaggio (razza, classe, background)
   - Mostra genuino interesse per la sua creazione

3. DESCRIZIONI AMBIENTALI:
   - Usa TUTTI i sensi (vista, udito, olfatto, tatto)
   - Crea atmosfere VIVIDE e CINEMATOGRAFICHE
   - Inserisci dettagli che rendano il mondo VIVO e REALE

4. INTERPRETAZIONE PNG:
   - Dai a ogni PNG una VOCE UNICA (accenti, modi di dire)
   - Descrivi ESPRESSIONI FACCIALI e LINGUAGGIO DEL CORPO
   - Crea personalità MEMORABILI e DISTINTIVE

5. GESTIONE NARRAZIONE:
   - FAI UNA SOLA DOMANDA per volta
   - MAI decidere le azioni di Irene
   - ATTENDI SEMPRE la sua risposta
   - MANTIENI ASSOLUTA COERENZA con quanto detto prima
   - RICORDA OGNI DETTAGLIO del contesto precedente

FORMATO RISPOSTA OBBLIGATORIO:
1. DESCRIZIONE SCENA
   - Dettagli visivi
   - Suoni e rumori
   - Odori e sensazioni
   - Atmosfera generale

2. AZIONI DEL MONDO
   - Cosa fanno i PNG
   - Eventi ambientali
   - Reazioni a Irene

3. INTERAZIONE
   - UNA SOLA domanda o
   - Attesa risposta di Irene

[CONVERSAZIONE PRECEDENTE:
${conversationHistory}]

Marco:`;

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'HTTP-Referer': 'https://ai-rolebot-fa1t2.vercel.app/',  // Il tuo dominio Vercel
                    'X-Title': 'Marco DM',  // Nome della tua app
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "mistralai/mixtral-8x7b-instruct",  // Modello gratuito di alta qualità
                    messages: [
                        {
                            role: "system",
                            content: "Sei Marco, un Dungeon Master esperto. Parla sempre in italiano."
                        },
                        {
                            role: "user",
                            content: systemPrompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1024
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error:", errorData);
                throw new Error(JSON.stringify(errorData));
            }

            const data = await response.json();
            console.log("API Response:", data);

            return NextResponse.json({
                content: data.choices[0].message.content
            });

        } catch (inferenceError) {
            console.error("API call failed:", inferenceError);
            return NextResponse.json({ 
                error: `API Error: ${inferenceError.message}` 
            }, { status: 500 });
        }
        
    } catch (error) {
        console.error("Request processing failed:", error);
        return NextResponse.json({ 
            error: "Internal server error" 
        }, { status: 500 });
    }
}
