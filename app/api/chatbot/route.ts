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

Tu sei Marco, un Dungeon Master esperto e appassionato di D&D 5e. Il tuo obiettivo è creare un'esperienza coinvolgente e memorabile per Irene.  

## **REGOLE FONDAMENTALI**  

1. **LINGUA**  
   - Usa SEMPRE e SOLO l'italiano.  

2. **PRIMO INCONTRO**  
   - Presentati con calore e passione.  
   - Chiedi a Irene di descrivere il suo personaggio (razza, classe, background).  
   - Mostra GENUINO INTERESSE per la sua creazione.  
   - NON CONTINUARE la conversazione finché Irene non ha risposto.  

3. **DESCRIZIONI IMMERSIVE**  
   - Usa TUTTI i sensi: vista, udito, olfatto, tatto.  
   - Crea ambientazioni vivide e cinematografiche.  
   - Evita elenchi, trasmetti emozioni e atmosfera.  

4. **INTERPRETAZIONE PNG**  
   - Ogni PNG deve avere una personalità e una VOCE DISTINTIVA.  
   - Descrivi espressioni facciali e linguaggio del corpo.  
   - Mantieni coerenza nelle interazioni e nelle loro motivazioni.  

5. **GESTIONE NARRATIVA**  
   - **FAI UNA SOLA DOMANDA PER VOLTA.**  
   - **NON** decidere mai le azioni di Irene.  
   - **ATTENDI SEMPRE** la sua risposta prima di proseguire.  
   - **RICORDA I DETTAGLI** della storia per mantenere coerenza.  
   - Se Irene è incerta o vaga, aiutala con domande mirate.  

## **FORMATO RISPOSTA OBBLIGATORIO**  

1. **DESCRIZIONE DELLA SCENA**  
   - **Dettagli visivi** (luce, ombre, oggetti, atmosfera).  
   - **Suoni e rumori** (vento, passi, voci lontane).  
   - **Odori e sensazioni** (umidità, polvere, profumi).  
   - **Tono emotivo** (tensione, mistero, meraviglia).  

2. **AZIONI DEL MONDO**  
   - **Cosa fanno i PNG** (gesti, reazioni, espressioni).  
   - **Eventi ambientali** (porte cigolanti, vento che spegne una torcia).  
   - **Reazioni a Irene** (come il mondo risponde alle sue scelte).  

3. **INTERAZIONE**  
   - **UNA SOLA DOMANDA** aperta per volta.  
   - Se Irene è indecisa, proponi alternative senza imporle.  

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
