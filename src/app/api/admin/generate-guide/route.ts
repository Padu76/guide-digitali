// E:\guide-digitali\src\app\api\admin\generate-guide\route.ts
// Genera guida completa: GPT-4o (testo capitolo per capitolo) + DALL-E 3 (immagini)

import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

const CATEGORY_CONTEXT: Record<string, string> = {
  fitness: 'Fitness, allenamento, esercizio fisico, corpo libero, palestra, nutrizione sportiva',
  business: 'Business, AI, automazione, produttivita aziendale, freelancing, strumenti digitali',
  mindset: 'Mindset, produttivita personale, abitudini, deep work, crescita personale, gestione del tempo',
  biohacking: 'Benessere, performance, biohacking, longevita, sonno, energia, routine salutari',
};

async function callGPT(messages: Array<{ role: string; content: string }>, maxTokens = 4000): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({ model: 'gpt-4o', temperature: 0.7, messages, max_tokens: maxTokens }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`OpenAI errore: ${res.status} - ${JSON.stringify(err)}`);
  }
  const data = await res.json();
  return data.choices[0]?.message?.content || '';
}

// Step 1: Genera outline dei capitoli
async function generateOutline(title: string, category: string, prompt: string, chapters: number): Promise<string[]> {
  const result = await callGPT([
    {
      role: 'system',
      content: `Sei un autore di guide digitali premium in italiano. Genera SOLO la lista dei titoli dei capitoli, uno per riga, senza numerazione. Massimo ${chapters} capitoli. Ogni titolo deve essere specifico e pratico, non generico.`
    },
    {
      role: 'user',
      content: `Guida: "${title}"\nCategoria: ${CATEGORY_CONTEXT[category] || category}\n${prompt ? `Note: ${prompt}` : ''}\n\nGenera ${chapters} titoli di capitolo, uno per riga. Solo i titoli, niente altro.`
    }
  ], 500);

  return result.split('\n').map(l => l.replace(/^\d+[\.\)]\s*/, '').replace(/^[-*]\s*/, '').trim()).filter(l => l.length > 3).slice(0, chapters);
}

// Step 2: Genera un singolo capitolo completo e dettagliato
async function generateChapter(title: string, chapterTitle: string, chapterNum: number, totalChapters: number, category: string): Promise<string> {
  const result = await callGPT([
    {
      role: 'system',
      content: `Sei un autore esperto che scrive guide digitali premium in italiano. Scrivi capitoli LUNGHI, DETTAGLIATI e PRATICI.

REGOLE OBBLIGATORIE:
- Il capitolo DEVE avere MINIMO 1500 parole. NON fermarti prima di 1500 parole. Conta mentalmente.
- Usa markdown: ## per titolo capitolo, ### per sottosezioni
- Usa **grassetto** per concetti chiave (IMPORTANTE: scrivi **parola** con asterischi)
- Includi ALMENO 3 sottosezioni (###)
- Includi ALMENO 1 esempio pratico reale con nome e situazione
- Includi ALMENO 1 lista numerata (step-by-step)
- Includi ALMENO 1 lista puntata
- Includi ALMENO 1 box pratico con > (citazione markdown)
- Alla fine del capitolo aggiungi SEMPRE un box:
  > **Da fare subito:**
  > 1. Prima azione concreta
  > 2. Seconda azione concreta
  > 3. Terza azione concreta
- NON usare emoji
- Scrivi in modo autorevole, pratico, con esempi concreti
- NON essere generico. Ogni frase deve aggiungere valore.
- Scrivi come se ogni parola costasse denaro al lettore.`
    },
    {
      role: 'user',
      content: `Scrivi il CAPITOLO ${chapterNum} di ${totalChapters} per la guida "${title}".

Titolo capitolo: "${chapterTitle}"
Categoria: ${CATEGORY_CONTEXT[category] || category}

Scrivi il capitolo COMPLETO e MOLTO LUNGO. MINIMO 1500 parole, ideale 2000. NON abbreviare. NON riassumere. Ogni sottosezione deve avere almeno 3 paragrafi. Includi esempi concreti con nomi e numeri. Inizia con ## ${chapterTitle}`
    }
  ], 4000);

  return result;
}

// Step 3: Genera introduzione
async function generateIntro(title: string, chapterTitles: string[], category: string): Promise<string> {
  const chapList = chapterTitles.map((t, i) => `${i + 1}. ${t}`).join('\n');
  const result = await callGPT([
    {
      role: 'system',
      content: `Sei un autore di guide digitali premium in italiano. Scrivi un'introduzione CONVINCENTE e LUNGA (minimo 500 parole) che spieghi perche questa guida vale il prezzo. Usa markdown.`
    },
    {
      role: 'user',
      content: `Scrivi l'introduzione per la guida "${title}".

Capitoli della guida:
${chapList}

Includi:
- ## Introduzione (come titolo)
- ### Perche questa guida (3-4 paragrafi convincenti)
- ### Cosa otterrai (lista di 6-8 benefici concreti con -)
- ### Come usare questa guida (istruzioni pratiche)
- ### A chi e rivolta (profilo ideale del lettore)

Scrivi in modo che il lettore capisca subito il valore. Minimo 500 parole.`
    }
  ], 2000);

  return result;
}

// Step 4: Genera conclusione
async function generateConclusion(title: string, category: string): Promise<string> {
  const result = await callGPT([
    {
      role: 'system',
      content: 'Sei un autore di guide digitali premium in italiano. Scrivi una conclusione motivante e pratica. Minimo 400 parole. Usa markdown.'
    },
    {
      role: 'user',
      content: `Scrivi la conclusione per la guida "${title}".

Includi:
- ## Conclusioni e Prossimi Passi
- ### Riepilogo (cosa hai imparato)
- ### I tuoi prossimi 7 giorni (piano azione concreto giorno per giorno)
- ### Risorse consigliate (3-5 strumenti/libri/siti utili)
- Un messaggio motivante finale
- CTA: "Scopri tutte le guide su guidedigitali.vercel.app"

Minimo 400 parole.`
    }
  ], 1500);

  return result;
}

// Step 5: Genera immagine capitolo
async function generateImage(chapterTitle: string, category: string): Promise<string> {
  const styleMap: Record<string, string> = {
    fitness: 'clean modern fitness illustration, cyan and teal accents, white background, minimalist, professional',
    business: 'futuristic tech business illustration, purple and violet accents, white background, digital, clean',
    mindset: 'zen productivity illustration, amber and gold accents, white background, calm, focused',
    biohacking: 'wellness biohacking illustration, rose and pink accents, white background, scientific, modern',
  };

  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `${styleMap[category] || 'professional illustration, white background'}, concept for: ${chapterTitle}. Abstract, elegant, no faces, no text, no words, no letters. Clean vector style.`,
        n: 1,
        size: '1792x1024',
        quality: 'standard',
      }),
    });
    if (!res.ok) return '';
    const data = await res.json();
    return data.data?.[0]?.url || '';
  } catch {
    return '';
  }
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
    const { title, category, prompt, chapters = 8, generateImages = true } = body;

    if (!title || !category) {
      return NextResponse.json({ error: 'Titolo e categoria obbligatori' }, { status: 400 });
    }

    // 1. Genera outline
    const chapterTitles = await generateOutline(title, category, prompt || '', chapters);
    if (chapterTitles.length === 0) throw new Error('Nessun capitolo generato');

    // 2. Genera introduzione
    const intro = await generateIntro(title, chapterTitles, category);

    // 3. Genera ogni capitolo (sequenziale per evitare rate limit)
    const chapterTexts: string[] = [];
    for (let i = 0; i < chapterTitles.length; i++) {
      const text = await generateChapter(title, chapterTitles[i], i + 1, chapterTitles.length, category);
      // Se capitolo troppo corto, rigenera con prompt piu aggressivo
      if (text.split(/\s+/).length < 800) {
        const retry = await generateChapter(title, chapterTitles[i], i + 1, chapterTitles.length, category);
        chapterTexts.push(retry.split(/\s+/).length > text.split(/\s+/).length ? retry : text);
        continue;
      }
      chapterTexts.push(text);
    }

    // 4. Genera conclusione
    const conclusion = await generateConclusion(title, category);

    // 5. Assembla markdown completo
    const fullMarkdown = [
      `# ${title}`,
      '',
      intro,
      '',
      ...chapterTexts.map(t => t + '\n'),
      conclusion,
    ].join('\n\n');

    // 6. Genera immagini (parallelo, batch di 3)
    let images: Array<{ chapter: string; url: string }> = [];
    if (generateImages) {
      const batchSize = 3;
      for (let i = 0; i < chapterTitles.length; i += batchSize) {
        const batch = chapterTitles.slice(i, i + batchSize);
        const results = await Promise.allSettled(
          batch.map(ct => generateImage(ct, category))
        );
        for (let j = 0; j < batch.length; j++) {
          const r = results[j];
          if (r.status === 'fulfilled' && r.value) {
            images.push({ chapter: batch[j], url: r.value });
          }
        }
      }
    }

    const wordCount = fullMarkdown.split(/\s+/).length;
    const estimatedPages = Math.max(25, Math.ceil(wordCount / 250));

    return NextResponse.json({
      success: true,
      markdown: fullMarkdown,
      images,
      stats: {
        wordCount,
        estimatedPages,
        chapters: chapterTitles.length,
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
