import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Le message est vide." }, { status: 400 });
    }

    // Default Ollama host from docker-compose or local
    const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";

    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen2.5:3b-instruct",
        prompt: `Tu es Fatourati, un assistant IA intelligent pour un logiciel ERP marocain (Facturation, CRM, Stock). 
Réponds de manière professionnelle, très concise et en français. 
L'utilisateur te dit : "${prompt}"`,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur Ollama: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({ reply: data.response });

  } catch (error: any) {
    console.error("Assistant API Error:", error);
    return NextResponse.json(
      { error: "Je suis désolé, le serveur IA est actuellement indisponible." },
      { status: 500 }
    );
  }
}
