// E:\guide-digitali\src\app\api\admin\generate-guide\route.ts
// Genera guida step by step: ogni chiamata fa UN solo step per evitare timeout Vercel

import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

const CATEGORY_CONTEXT: Record<string, string> = {
  fitness: 'Fitness, allenamento, esercizio fisico, corpo libero, palestra, nutrizione sportiva',
  business: 'Business, AI, automazione, produttivita aziendale, freelancing, strumenti digitali',
  mindset: 'Mindset, produttivita personale, abitudini, deep work, crescita personale, gestione del tempo',
  biohacking: 'Benessere, performance, biohacking, longevita, sonno, energia, routine salutari',
};

async function callGPT(messages: Array<{ role: string; content: string }>, maxTokens = 4096): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({ model: 'gpt-4o', temperature: 0.7, messages, max_tokens: maxTokens }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`OpenAI: ${res.status} - ${JSON.stringify(err)}`);
  }
  const data = await res.json();
  return data.choices[0]?.message?.content || '';
}

async function generateImage(chapterTitle: string, category: string): Promise<string> {
  const styleMap: Record<string, string> = {
    fitness: 'clean modern fitness illustration, cyan and teal accents, white background, minimalist',
    business: 'futuristic tech business illustration, purple and violet accents, white background, digital',
    mindset: 'zen productivity illustration, amber and gold accents, white background, calm',
    biohacking: 'wellness biohacking illustration, rose and pink accents, white background, scientific',
  };
  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `${styleMap[category] || 'professional illustration'}, concept for: ${chapterTitle}. Abstract, elegant, no faces, no text. Clean style.`,
        n: 1, size: '1792x1024', quality: 'standard',
      }),
    });
    if (!res.ok) return '';
    const data = await res.json();
    return data.data?.[0]?.url || '';
  } catch { return ''; }
}

export async function POST(request: NextRequest) {
  try {
    const authCookie = request.cookies.get('guide_admin_auth');
    if (authCookie?.value !== 'authenticated') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }
    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OPENAI_API_KEY non configurata' }, { status: 500 });
    }

    const body = await request.json();
    const { step, title, category, prompt, chapters = 8, chapterTitles, chapterTitle, chapterNum } = body;

    const catContext = CATEGORY_CONTEXT[category] || category;

    // STEP 1: Genera outline
    if (step === 'outline') {
      const result = await callGPT([
        { role: 'system', content: `Genera SOLO la lista dei titoli dei capitoli per una guida in italiano. Uno per riga, senza numerazione. Massimo ${chapters} capitoli. Titoli specifici e pratici.` },
        { role: 'user', content: `Guida: "${title}"\nCategoria: ${catContext}\n${prompt ? `Note: ${prompt}` : ''}\n\nGenera ${chapters} titoli, uno per riga.` }
      ], 500);
      const titles = result.split('\n').map((l: string) => l.replace(/^\d+[\.\)]\s*/, '').replace(/^[-*]\s*/, '').trim()).filter((l: string) => l.length > 3).slice(0, chapters);
      return NextResponse.json({ success: true, chapterTitles: titles });
    }

    // STEP 2: Genera introduzione
    if (step === 'intro') {
      const chapList = (chapterTitles || []).map((t: string, i: number) => `${i + 1}. ${t}`).join('\n');
      const result = await callGPT([
        { role: 'system', content: 'Sei un autore di guide digitali premium in italiano. Scrivi un\'introduzione CONVINCENTE e LUNGA (minimo 600 parole). Usa markdown.' },
        { role: 'user', content: `Introduzione per la guida "${title}".\n\nCapitoli:\n${chapList}\n\nIncludi:\n- ## Introduzione\n- ### Perche questa guida (3-4 paragrafi)\n- ### Cosa otterrai (6-8 benefici con -)\n- ### Come usare questa guida\n- ### A chi e rivolta\n\nMinimo 600 parole. Scrivi in modo che il lettore capisca il valore.` }
      ], 2500);
      return NextResponse.json({ success: true, content: result });
    }

    // STEP 3: Genera singolo capitolo
    if (step === 'chapter') {
      const result = await callGPT([
        {
          role: 'system',
          content: `Sei un autore esperto di guide digitali premium in italiano. Scrivi capitoli LUNGHI e DETTAGLIATI.

REGOLE:
- MINIMO 1500 parole per capitolo. NON fermarti prima.
- Usa ## per titolo capitolo, ### per sottosezioni
- Usa **grassetto** per concetti chiave
- ALMENO 4 sottosezioni (###)
- ALMENO 1 esempio pratico con nome e numeri
- ALMENO 1 lista numerata step-by-step
- ALMENO 1 lista puntata
- ALMENO 1 box con > (citazione/nota)
- Fine capitolo: box > **Da fare subito:** con 3 azioni concrete
- NO emoji. Tono autorevole e pratico.
- Ogni frase deve aggiungere valore. ZERO filler.
- Quando menzioni strumenti AI, varia: cita ChatGPT, Claude, Gemini, Perplexity, strumenti specifici di settore. NON focalizzarti su un solo tool.
- Sii specifico con numeri, percentuali, tempi reali.`
        },
        { role: 'user', content: `Capitolo ${chapterNum} della guida "${title}".\nTitolo: "${chapterTitle}"\nCategoria: ${catContext}\n\nScrivi COMPLETO. MINIMO 1500 parole. Inizia con ## ${chapterTitle}` }
      ], 4096);
      return NextResponse.json({ success: true, content: result });
    }

    // STEP 4: Genera conclusione
    if (step === 'conclusion') {
      const result = await callGPT([
        { role: 'system', content: 'Autore guide premium in italiano. Conclusione motivante e pratica. Minimo 500 parole. Markdown.' },
        { role: 'user', content: `Conclusione per "${title}".\n\nIncludi:\n- ## Conclusioni e Prossimi Passi\n- ### Riepilogo\n- ### I tuoi prossimi 7 giorni (piano concreto)\n- ### Risorse consigliate (5 strumenti/libri)\n- Messaggio motivante\n- CTA: "Scopri tutte le guide su guidedigitali.vercel.app"\n\nMinimo 500 parole.` }
      ], 2000);
      return NextResponse.json({ success: true, content: result });
    }

    // STEP 5: Genera immagine
    if (step === 'image') {
      const url = await generateImage(chapterTitle || title, category);
      return NextResponse.json({ success: true, url });
    }

    return NextResponse.json({ error: 'Step non valido' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Errore:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Errore' }, { status: 500 });
  }
}
