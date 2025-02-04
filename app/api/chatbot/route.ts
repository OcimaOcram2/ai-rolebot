import { HfInference } from '@huggingface/inference';
import { NextResponse } from "next/server";

if (!process.env.HUGGING_FACE_TOKEN) {
    throw new Error("HUGGING_FACE_TOKEN is not set");
}

const inference = new HfInference(process.env.HUGGING_FACE_TOKEN);

export async function POST(req: Request) {
    try {
        const { message } = await req.json();
        
        if (!message || !Array.isArray(message)) {
            return NextResponse.json({ error: "Invalid message" }, { status: 400 });
        }

        const lastMessage = message[message.length - 1].content;
        console.log("Processing message:", lastMessage);

        const systemPrompt = `[ISTRUZIONI CRITICHE PER IL DM]
        Sei Marco, un Dungeon Master esperto e creativo che gioca con Irene. DEVI:
        1. Se è il primo messaggio, presentati e chiedi a Irene di descrivere il suo personaggio (razza, classe, background)
        2. Dopo aver ricevuto la descrizione del personaggio, crea un'avventura su misura
        3. Descrivere gli ambienti in modo IMMERSIVO e DETTAGLIATO (usando dettagli sensoriali: vista, suoni, odori)
        4. Interpretare i PNG in modo VIVIDO (voci, atteggiamenti, espressioni)
        6. MAI decidere le azioni di Irene
        7. MAI continuare la storia senza input di Irene
        8. PARLA IN ITALIANO
        
        FORMATO OBBLIGATORIO:
        - Descrizione IMMERSIVA della scena (frasi lunghe e ricche di dettagli)
        - Decidi cosa fa il mondo attorno a Irene
        - STOP e attendi risposta



        ESEMPIO CORRETTO PRIMA INTERAZIONE:
        Irene: Ciao!
        Marco: Salute, avventuriera! Sono Marco, il tuo Dungeon Master e amorevole fidanzato, e insieme creeremo una storia epica. Prima di iniziare, parlami del tuo personaggio: che razza e classe hai scelto? Qual è la sua storia?

        ESEMPIO CORRETTO DESCRIZIONE:
        Irene: Entro nella taverna
        Marco: Il calore di un grande camino ti avvolge mentre varchi la soglia. L'aria è densa del profumo di stufato di cinghiale e idromele, mentre il suono di un liuto si mescola alle risate degli avventori. Al bancone, un nano dalla barba intrecciata con anelli d'oro ti osserva con curiosità. Cosa desideri fare?

        ESEMPIO SBAGLIATO:
        Irene: Entro nella taverna
        Marco: Entri e ordini da bere... (NO! STOP! Aspetta le decisioni di Irene!)`;

        const fullPrompt = `${systemPrompt}\nIrene: ${lastMessage}\nMarco:`;

        try {
            const response = await inference.textGeneration({
                model: "mistralai/Mistral-7B-Instruct-v0.2",
                inputs: fullPrompt,
                parameters: {
                    max_new_tokens: 2500,  // Aumentato leggermente per descrizioni più ricche
                    temperature: 0.5,     // Aumentato per più creatività
                    top_p: 0.9,
                    return_full_text: false,
                    stop: ["\nIrene:", "\n\n"]
                }
            });

            console.log("AI Response:", response);
            return NextResponse.json({
                content: response.generated_text || "Mi dispiace, non ho potuto generare una risposta."
            });

        } catch (inferenceError) {
            console.error("Inference error:", inferenceError);
            return NextResponse.json({ 
                error: `AI Service error: ${inferenceError.message}` 
            }, { status: 500 });
        }
        
    } catch (error: any) {
        console.error("General error:", error);
        return NextResponse.json({ 
            error: `Internal server error: ${error.message}` 
        }, { status: 500 });
    }
}
