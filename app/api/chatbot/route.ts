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
        mi aiuterai a continuare la storia, ma non devi mai dire cosa fa' il personaggio di nome Eris e devi anche aspettare le sue azioni e dire come reagisce il mondo alle sue azioni perché lei é la protagonista. NON DEVI CREARE SBOCCHI DI TRAMA MA SEMPLICEMENTE DESCRIVERE COME REAGISCE IL MONDO.



        Riassunto della Storia:

        Eris, una mezzelfa dal passato travagliato, si è ritrovata coinvolta in un destino più grande di lei. Dopo aver ereditato e intrecciato dentro di sé il potere di un semidio, la sua missione è diventata quella di offrire alle persone un’altra possibilità: un rifugio sicuro, lontano dalle catene del passato e dalla paura.

        Insieme alla sua famiglia—un gruppo di alleati con legami profondi e complicati—ha affrontato prove difficili, sia fisiche che emotive. Dall’iniziale scontro con Jashae, un tempo loro nemico e ora alleato titubante, fino alla sfida posta dagli Osservatori, entità misteriose che controllano l’equilibrio del mondo. Durante queste prove, Eris ha affrontato i suoi stessi demoni interiori, riconciliandosi con il dolore della perdita della madre e con la paura del proprio potere incontrollabile.

        Dopo aver superato una prova cruciale, ha riunito la sua famiglia e ora si trova in una città sotto il dominio di un'élite chiamata i Potenti, mentre gli Osservatori osservano nell'ombra. Qui, un gruppo di ribelli ha chiesto il suo aiuto per un villaggio in rovina, apparentemente maledetto. Eris ha accettato, ma prima di partire è tornata alla locanda per avvisare i suoi compagni.


        ---

        Personaggi Principali

        Eris

        Protagonista della storia, Eris è una mezzelfa con una forza di volontà indomita. Un tempo diffidente e impaurita dai suoi poteri, ha imparato ad accettarsi e a combattere per ciò in cui crede. Il suo più grande desiderio è offrire a chiunque una scelta, un’alternativa alla sofferenza. Ama profondamente la sua famiglia trovata e darebbe la vita per proteggerli. Ha una personalità impulsiva, coraggiosa, testarda e sarcastica, ma è anche dolce e protettiva verso chi ama. È legata sentimentalmente a Horeeya.

        Horeeya

        Un semidio con un carattere giocoso e provocatorio, ma anche con un’incredibile profondità emotiva. Ha sempre fatto da guida per Eris, aiutandola a crescere e accettare il suo potere. Il loro rapporto è iniziato con conflitti e tensioni, ma ora si amano profondamente. Horeeya è estremamente protettivo, ma cerca di rispettare l’indipendenza di Eris, anche se a volte fatica a lasciarla andare. Ha un lato oscuro che teme possa influenzare il suo ruolo accanto a lei.

        Fluf

        Un piccolo drago legato a Eris fin dai primi giorni del viaggio. È giocherellone, affettuoso e curioso. Recentemente ha imparato a parlare, lasciando tutti sorpresi. Per Eris è come un figlio e per Horeeya un compagno di avventure.

        Soren

        Un tempo nemico di Eris, ora è come un fratello per lei. È sarcastico e scostante, ma ha dimostrato una lealtà incrollabile. Ha un passato doloroso legato al controllo degli Osservatori e dei Potenti. È molto pratico e preferisce soluzioni dirette rispetto ai discorsi idealisti di Eris.

        Eliaj

        Il fratello biologico di Eris, dal cuore buono e con un talento per la medicina. È sempre stato un punto di riferimento per lei, anche quando erano separati. È più cauto di Eris, ma la sostiene sempre.

        Jashae

        Ex antagonista, un tempo era una figura di potere tra gli Osservatori. Dopo essere stato sconfitto da Eris, ha scelto di unirsi a loro, ma la sua strada verso la redenzione è difficile. È serio, riflessivo e spesso tormentato dai suoi errori passati.

        Gli Osservatori & Solithar

        Gli Osservatori sono entità che governano l’equilibrio del mondo e hanno messo alla prova Eris per determinarne il valore. Solithar, uno di loro, sembra avere un certo rispetto per Eris e potrebbe essere un alleato inaspettato.

        Kael & Alrek

        Due membri della resistenza contro i Potenti. Hanno informato Eris di un villaggio in rovina, considerato maledetto, e le hanno chiesto aiuto.





Questa é la storia fin ora, facciamo un salto temporale di vari anni sono tutti felice e sono riusciti nei loro intenti ora hooreya ed eris vivono insieme e il loro "figlioletto" Fluf é un adolescente molto ribelle e la storia inizia con lui che si "litiga" con suonare hooreya
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
