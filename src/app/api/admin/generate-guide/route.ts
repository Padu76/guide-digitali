// E:\guide-digitali\src\app\api\admin\generate-guide\route.ts
// Genera guida completa con OpenAI GPT-4o (testo) + DALL-E 3 (immagini capitolo)

import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

const CATEGORY_CONTEXT: Record<string, string> = {
  fitness: 'Fitness, allenamento, esercizio fisico, corpo libero, palestra, nutrizione sportiva',
  business: 'Business, AI, automazione, produttivita aziendale, freelancing, strumenti digitali',
  mindset: 'Mindset, produttivita personale, abitudini, deep work, crescita personale, gestione del tempo',
  biohacking: 'Benessere, performance, biohacking, longevita, sonno, energia, routine salutari',
};

// Step 1: Genera struttura capitoli
async function generateStructure(title: string, category: string, prompt: string, chapters: number): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: `Sei un autore esperto di guide digitali in italiano. Crei contenuti pratici, actionable, di alta qualita. Il tuo stile e diretto, professionale ma accessibile. Mai filler, mai contenuto generico. Ogni capitolo deve avere valore reale per il lettore.

Categoria: ${CATEGORY_CONTEXT[category] || category}

REGOLE:
- Scrivi TUTTO in italiano
- Usa markdown: # per titolo, ## per capitoli, ### per sottosezioni
- Ogni capitolo deve avere 800-1200 parole
- Includi: box pratici (con >), liste numerate per step-by-step, liste puntate per elenchi
- Includi almeno 1 checklist o tabella per capitolo
- Usa **grassetto** per concetti chiave
- Alla fine di ogni capitolo aggiungi un box "Da fare subito" con 2-3 azioni concrete
- NON usare emoji
- Il tono e autorevole ma motivante`
        },
        {
          role: 'user',
          content: `Genera una guida completa di ${chapters} capitoli.

Titolo: "${title}"
${prompt ? `Indicazioni aggiuntive: ${prompt}` : ''}

Genera la guida COMPLETA in markdown con:
1. Introduzione (perche leggere questa guida, cosa otterrai)
2. ${chapters} capitoli completi (800-1200 parole ciascuno)
3. Ogni capitolo con sottosezioni, esempi pratici, box azione
4. Conclusione con riepilogo e prossimi passi

Scrivi TUTTO il contenuto, non abbreviare. Ogni capitolo deve essere completo e approfondito.`
        }
      ],
      max_tokens: 16000,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`OpenAI errore: ${res.status} - ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  return data.choices[0]?.message?.content || '';
}

// Step 2: Genera immagine per capitolo con DALL-E 3
async function generateImage(chapterTitle: string, category: string): Promise<string> {
  const styleMap: Record<string, string> = {
    fitness: 'clean modern fitness illustration, cyan and teal color palette, minimalist, professional, no text',
    business: 'futuristic tech illustration, purple and violet color palette, digital, professional, no text',
    mindset: 'zen productivity illustration, amber and gold color palette, calm, focused, professional, no text',
    biohacking: 'wellness biohacking illustration, rose and pink color palette, scientific, modern, no text',
  };

  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: `${styleMap[category] || 'professional illustration'}, concept art for a chapter about: ${chapterTitle}. Abstract, elegant, suitable for a digital guide book. No faces, no text, no words.`,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    }),
  });

  if (!res.ok) {
    console.error(`DALL-E errore per "${chapterTitle}": ${res.status}`);
    return '';
  }

  const data = await res.json();
  return data.data?.[0]?.url || '';
}

export async function POST(request: NextRequest) {
  try {
    // Verifica auth
    const authCookie = request.cookies.get('guide_admin_auth');
    if (authCookie?.value !== 'authenticated') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OPENAI_API_KEY non configurata' }, { status: 500 });
    }

    const body = await request.json();
    const { title, category, prompt, chapters = 8, generateImages = true } = body;

    if (!title || !category) {
      return NextResponse.json({ error: 'Titolo e categoria sono obbligatori' }, { status: 400 });
    }

    // Step 1: Genera testo completo
    const markdown = await generateStructure(title, category, prompt || '', chapters);

    if (!markdown || markdown.length < 500) {
      return NextResponse.json({ error: 'Contenuto generato troppo corto. Riprova.' }, { status: 500 });
    }

    // Step 2: Genera immagini per ogni capitolo (opzionale)
    let images: Array<{ chapter: string; url: string }> = [];

    if (generateImages) {
      // Estrai titoli capitoli dal markdown
      const chapterTitles = markdown
        .split('\n')
        .filter(line => line.startsWith('## '))
        .map(line => line.replace('## ', '').trim())
        .slice(0, chapters);

      // Genera immagini in parallelo (max 4 alla volta per rate limit)
      const batchSize = 4;
      for (let i = 0; i < chapterTitles.length; i += batchSize) {
        const batch = chapterTitles.slice(i, i + batchSize);
        const results = await Promise.allSettled(
          batch.map(ct => generateImage(ct, category))
        );

        for (let j = 0; j < batch.length; j++) {
          const result = results[j];
          if (result.status === 'fulfilled' && result.value) {
            images.push({ chapter: batch[j], url: result.value });
          }
        }
      }
    }

    // Calcola stats
    const wordCount = markdown.split(/\s+/).length;
    const estimatedPages = Math.ceil(wordCount / 300); // ~300 parole per pagina PDF

    return NextResponse.json({
      success: true,
      markdown,
      images,
      stats: {
        wordCount,
        estimatedPages,
        chapters: markdown.split('\n').filter(l => l.startsWith('## ')).length,
        imagesGenerated: images.length,
      },
    });
  } catch (error: unknown) {
    console.error('Errore generazione guida:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Errore interno' },
      { status: 500 }
    );
  }
}
