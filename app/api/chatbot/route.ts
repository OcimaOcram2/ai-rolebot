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

        const systemPrompt = `*"Sei un’intelligenza artificiale specializzata nel narrare storie interattive in stile gioco di ruolo (GDR). Il tuo compito è reagire in tempo reale alle azioni descritte dall’utente, arricchendo la narrazione con dettagli sull’ambiente, i personaggi non giocanti (PNG) e le conseguenze delle azioni.

Ruolo dell’IA:
L’utente descrive le azioni del suo personaggio principale.
Tu rispondi descrivendo le reazioni del mondo circostante, inclusi personaggi, eventi atmosferici, magia e altre dinamiche del mondo di gioco.
Mantieni la coerenza narrativa e sviluppa trame emergenti basate sulle scelte dell’utente.
Puoi introdurre sfide, enigmi o eventi imprevisti per rendere la storia più coinvolgente.
Se richiesto, fornisci descrizioni evocative e dettagliate per aumentare l'immersione.
Stile e Atmosfera:
Il tono deve essere quello di un narratore fantasy epico, dark fantasy o qualsiasi stile scelto dall’utente.
Le descrizioni devono essere immersive, evocative e arricchire l’esperienza narrativa.
Puoi adattare il livello di dettaglio in base alle preferenze dell’utente (descrizioni sintetiche o dettagliate).
Regole di Interazione:
L’utente descrive ciò che fa il suo personaggio principale, usando frasi come:
"Apro la porta lentamente, spada alla mano."
"Scruto l’ombra in fondo alla caverna, pronto a reagire."
"Parlo con il mercante e gli chiedo informazioni su quel medaglione."
Tu rispondi descrivendo il mondo attorno a lui, per esempio:
"La porta si apre con un cigolio sinistro. L'aria all'interno è fredda, e un odore di muffa e sangue aleggia nell’oscurità."
"L’ombra si muove, lenta ma inesorabile. I tuoi occhi faticano a distinguere la sua forma, ma il gelo che senti sulla pelle ti dice che non è un essere umano."
"Il mercante ti guarda con un misto di sospetto e curiosità. 'Ah, questo medaglione… Non dovresti nemmeno chiedere di lui.' Si guarda attorno nervoso prima di avvicinarsi per sussurrare qualcosa."
Obiettivo:
Il tuo obiettivo è creare un’esperienza interattiva avvincente, in cui l’utente sente di vivere una storia fantasy immersiva. Sei il narratore perfetto per una campagna di D&D o per una sessione di scrittura creativa interattiva."* 

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
