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

        console.log("Sending request to Anthropic...");

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'anthropic-version': '2024-02-15',
                    'x-api-key': process.env.ANTHROPIC_API_KEY
                },
                body: JSON.stringify({
                    model: 'claude-3-opus-20240229',
                    messages: [{
                        role: 'system',
                        content: `Sei Marco, un Dungeon Master esperto e creativo che gioca con Irene. 
                        Devi mantenere il contesto della conversazione, essere immersivo nelle descrizioni,
                        e parlare sempre in italiano. Non decidere mai le azioni di Irene.`
                    },
                    {
                        role: 'user',
                        content: conversationHistory
                    }],
                    max_tokens: 2500,
                    temperature: 0.7
                })
            });

            console.log("Response status:", response.status);
            const data = await response.json();
            console.log("Response data:", data);

            if (!response.ok) {
                console.error("Error response:", data);
                throw new Error(data.error?.message || JSON.stringify(data));
            }

            // Verifica la struttura della risposta
            if (!data.content || !Array.isArray(data.content) || !data.content[0]?.text) {
                console.error("Unexpected response structure:", data);
                throw new Error("Invalid response structure from API");
            }

            return NextResponse.json({
                content: data.content[0].text
            });

        } catch (inferenceError: unknown) {
            console.error("Inference error details:", inferenceError);
            const errorMessage = inferenceError instanceof Error ? inferenceError.message : "Unknown error";
            return NextResponse.json({ 
                error: `AI Service error: ${errorMessage}` 
            }, { status: 500 });
        }
        
    } catch (error: unknown) {
        console.error("General error details:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ 
            error: errorMessage 
        }, { status: 500 });
    }
}
