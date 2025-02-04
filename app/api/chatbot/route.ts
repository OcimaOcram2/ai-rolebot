import { NextResponse } from "next/server";

if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
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
        10. PARLA SEMPRE IN ITALIANO
        
        FORMATO OBBLIGATORIO:
        - Descrizione IMMERSIVA della scena (frasi lunghe e ricche di dettagli)
        - Decidi cosa fa il mondo attorno a Irene
        - STOP e attendi risposta

        CONVERSAZIONE PRECEDENTE:
        ${conversationHistory}

        Marco:`;

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-opus-20240229',
                    max_tokens: 2500,
                    messages: [{
                        role: 'user',
                        content: systemPrompt
                    }],
                    temperature: 0.7
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error?.message || 'AI Service error');
            }

            return NextResponse.json({
                content: data.content[0].text
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
