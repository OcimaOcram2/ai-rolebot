import { HfInference } from '@huggingface/inference';
import { NextResponse } from "next/server";

if (!process.env.HUGGING_FACE_TOKEN) {
    throw new Error("HUGGING_FACE_TOKEN is not set");
}

const inference = new HfInference(process.env.HUGGING_FACE_TOKEN);

type ErrorResponse = {
    message: string;
};

export async function POST(req: Request) {
    try {
        const { message } = await req.json();
        
        if (!message || !Array.isArray(message)) {
            return NextResponse.json({ error: "Invalid message" }, { status: 400 });
        }

        // Log per debug
        console.log("Received messages:", message);

        // Costruiamo la conversazione completa
        const conversationHistory = message.map(msg => 
            `${msg.role === 'user' ? 'Irene' : 'Marco'}: ${msg.content}`
        ).join('\n');

        // Log per debug
        console.log("Conversation history:", conversationHistory);

        const systemPrompt = `[ISTRUZIONI CRITICHE PER IL DM]
        Sei Marco, un Dungeon Master esperto e creativo che gioca con Irene. DEVI:
        1. Se è il primo messaggio, presentati e chiedi a Irene di descrivere il suo personaggio (razza, classe, background)
        2. Dopo aver ricevuto la descrizione del personaggio, crea un'avventura su misura
        3. Descrivere gli ambienti in modo IMMERSIVO e DETTAGLIATO (usando dettagli sensoriali: vista, suoni, odori)
        4. Interpretare i PNG in modo VIVIDO (voci, atteggiamenti, espressioni)
        5. Fare SOLO una domanda alla volta
        6. MAI decidere le azioni di Irene
        7. MAI continuare la storia senza input di Irene
        8. MANTIENI LA COERENZA con tutto ciò che è stato detto prima
        9. RICORDA tutto il contesto precedente
        
        FORMATO OBBLIGATORIO:
        - Descrizione IMMERSIVA della scena (frasi lunghe e ricche di dettagli)
        - Decidi cosa fa il mondo attorno a Irene
        - STOP e attendi risposta

        Ecco la conversazione finora:
        ${conversationHistory}

        Marco:`;

        // Log per debug
        console.log("Final prompt:", systemPrompt);

        try {
            const response = await inference.textGeneration({
                model: "mistralai/Mistral-7B-Instruct-v0.2",
                inputs: systemPrompt,
                parameters: {
                    max_new_tokens: 2500,
                    temperature: 0.5,
                    top_p: 0.9,
                    return_full_text: false,
                    stop: ["\nIrene:", "\n\n"]
                }
            });

            console.log("AI Response:", response);
            return NextResponse.json({
                content: response.generated_text || "Mi dispiace, non ho potuto generare una risposta."
            });

        } catch (inferenceError: unknown) {
            console.error("Inference error:", inferenceError);
            const errorMessage = inferenceError instanceof Error ? inferenceError.message : "Unknown error";
            return NextResponse.json({ 
                error: `AI Service error: ${errorMessage}` 
            }, { status: 500 });
        }
        
    } catch (error: unknown) {
        console.error("General error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ 
            error: errorMessage 
        }, { status: 500 });
    }
}
