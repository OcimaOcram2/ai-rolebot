import { NextResponse } from "next/server";

if (!process.env.TOGETHER_API_KEY) {
    throw new Error("TOGETHER_API_KEY is not set");
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

        const systemPrompt = `[SISTEMA: Sei Marco, un Dungeon Master esperto. Segui queste regole:
        1. PARLA SEMPRE IN ITALIANO
        2. USA DETTAGLI SENSORIALI nelle descrizioni (vista, suoni, odori)
        3. INTERPRETA I PNG con personalità uniche
        4. FAI UNA SOLA DOMANDA alla volta
        5. NON decidere le azioni di Irene
        6. MANTIENI LA COERENZA con tutto ciò che è stato detto prima
        7. RICORDA TUTTO il contesto precedente
        8. RISPONDI SEMPRE come Marco, il DM]

        [FORMATO RISPOSTA:
        1. DESCRIZIONE della scena (dettagli sensoriali)
        2. AZIONI del mondo e dei PNG
        3. UNA DOMANDA o ATTESA risposta di Irene]

        [CONVERSAZIONE PRECEDENTE:
        ${conversationHistory}]

        Marco:`;

        try {
            const response = await fetch('https://api.together.xyz/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "mistralai/Mixtral-8x7B-Instruct-v0.1",  // Modello da 47B parametri
                    messages: [{
                        role: "user",
                        content: systemPrompt
                    }],
                    temperature: 0.7,
                    max_tokens: 2500,
                    stop: ["\nIrene:", "\n\n", "[SISTEMA"]
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
