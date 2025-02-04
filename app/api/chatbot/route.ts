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

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.ANTHROPIC_API_KEY,
                    'anthropic-version': '2024-02-15'
                },
                body: JSON.stringify({
                    model: 'claude-3-sonnet-20240229',  // Cambiato a sonnet che è più economico
                    messages: [{
                        role: 'user',
                        content: `Sei Marco, un Dungeon Master che gioca con Irene. Parla in italiano. 
                                Ecco la conversazione:
                                ${conversationHistory}
                                
                                Rispondi come Marco, mantenendo il contesto della conversazione.`
                    }]
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
                content: data.content[0].text
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
