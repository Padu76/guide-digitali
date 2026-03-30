// E:\guide-digitali\src\app\api\admin\generate-guide\route.ts
// Genera guida step by step: ogni chiamata fa UN solo step per evitare timeout Vercel

import { NextRequest, NextResponse } from 'next/server';
import { EXERCISE_LIBRARY } from '@/lib/exercise-library';

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

const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY || '';

async function generateImageDalle(chapterTitle: string, category: string): Promise<string> {
  const styleMap: Record<string, string> = {
    fitness: 'clean modern fitness photo, gym environment, natural lighting, professional',
    business: 'modern office workspace, technology, clean desk setup, professional photography',
    mindset: 'calm productive environment, morning light, minimalist workspace, peaceful',
    biohacking: 'wellness lifestyle, morning routine, healthy living, natural light, modern',
  };
  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `${styleMap[category] || 'professional photography'}, concept for: ${chapterTitle}. Realistic, elegant, no text, no words, no letters. High quality editorial photo.`,
        n: 1, size: '1792x1024', quality: 'standard',
      }),
    });
    if (!res.ok) return '';
    const data = await res.json();
    return data.data?.[0]?.url || '';
  } catch { return ''; }
}

async function generateImageLeonardo(chapterTitle: string, category: string): Promise<string> {
  const styleMap: Record<string, string> = {
    fitness: 'fitness lifestyle photography, gym, workout, athletic person, natural lighting',
    business: 'modern business workspace, laptop, productivity, professional environment',
    mindset: 'calm morning routine, journaling, meditation, peaceful environment, golden hour',
    biohacking: 'wellness and health lifestyle, supplements, morning routine, cold plunge, biohacking setup',
  };

  try {
    // Step 1: Crea la generazione
    const createRes = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LEONARDO_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: `${styleMap[category] || 'professional lifestyle photography'}, ${chapterTitle}. Photorealistic, high quality, editorial style, no text, no watermark, clean composition, soft natural lighting.`,
        negative_prompt: 'text, words, letters, watermark, logo, cartoon, anime, illustration, drawing, blurry, low quality, deformed',
        modelId: '6b645e3a-d64f-4341-a6d8-7a3690fbf042', // Leonardo Phoenix
        width: 1024,
        height: 768,
        num_images: 1,
        guidance_scale: 7,
        alchemy: false,
        photoReal: true,
        photoRealVersion: 'v2',
      }),
    });

    if (!createRes.ok) {
      console.error('Leonardo create error:', createRes.status, await createRes.text());
      return '';
    }

    const createData = await createRes.json();
    const generationId = createData.sdGenerationJob?.generationId;
    if (!generationId) return '';

    // Step 2: Poll per il risultato (max 30 secondi)
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 2000));

      const pollRes = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
        headers: { 'Authorization': `Bearer ${LEONARDO_API_KEY}` },
      });

      if (!pollRes.ok) continue;

      const pollData = await pollRes.json();
      const gen = pollData.generations_by_pk;

      if (gen?.status === 'COMPLETE' && gen.generated_images?.length > 0) {
        return gen.generated_images[0].url || '';
      }

      if (gen?.status === 'FAILED') return '';
    }

    return '';
  } catch (e) {
    console.error('Leonardo error:', e);
    return '';
  }
}

async function generateImage(chapterTitle: string, category: string, provider: string = 'dalle'): Promise<string> {
  if (provider === 'leonardo' && LEONARDO_API_KEY) {
    const url = await generateImageLeonardo(chapterTitle, category);
    if (url) return url;
    // Fallback a DALL-E se Leonardo fallisce
  }
  return generateImageDalle(chapterTitle, category);
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
    const { step, title, category, prompt, chapters = 8, chapterTitles, chapterTitle, chapterNum, imageProvider = 'dalle' } = body;

    const catContext = CATEGORY_CONTEXT[category] || category;

    // STEP AUTO: GPT sceglie esercizi dalla libreria per compilare la scheda
    if (step === 'auto-workout') {
      // Costruisci lista esercizi disponibili per GPT
      const exerciseList = EXERCISE_LIBRARY.map(ex =>
        `${ex.id} | ${ex.nameIt || ex.name} | ${ex.muscle} | ${ex.equipment} | ${ex.source === 'andrea' ? 'FOTO ANDREA' : 'foto stock'}`
      ).join('\n');

      const result = await callGPT([
        {
          role: 'system',
          content: `Sei un personal trainer esperto. Devi creare una scheda di allenamento scegliendo SOLO esercizi dalla lista fornita.

REGOLE:
- Rispondi SOLO in formato JSON valido, niente altro testo
- Scegli esercizi SOLO dalla lista (usa gli ID esatti)
- Preferisci esercizi con "FOTO ANDREA" quando possibile
- Crea 2-4 programmi (es: Programma A Upper, Programma B Lower, ecc)
- 5-7 esercizi per programma
- Serie: 3-4, Ripetizioni: 8-15 (o "30 sec" per isometrici)
- Aggiungi note brevi di esecuzione dove utile

FORMATO RISPOSTA (JSON):
{
  "programs": [
    {
      "name": "Programma A — Upper Body",
      "exercises": [
        { "exerciseId": "a-pushup", "sets": 3, "reps": "12", "notes": "Schiena dritta, scendi controllato" },
        { "exerciseId": "g-barbell-row", "sets": 4, "reps": "10" }
      ]
    }
  ]
}`
        },
        {
          role: 'user',
          content: `Crea la scheda per questa guida: "${title}"

Richiesta utente: ${prompt || 'Scheda completa per principianti/intermedi'}

ESERCIZI DISPONIBILI (id | nome | muscolo | attrezzo | fonte):
${exerciseList}

Rispondi SOLO con il JSON.`
        }
      ], 3000);

      // Parsa il JSON dalla risposta
      try {
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return NextResponse.json({ success: true, programs: parsed.programs });
        }
        return NextResponse.json({ error: 'Risposta GPT non valida', raw: result }, { status: 500 });
      } catch {
        return NextResponse.json({ error: 'JSON non parsabile', raw: result }, { status: 500 });
      }
    }

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
      // Istruzioni aggiuntive per guide fitness con esercizi
      const exerciseInstructions = category === 'fitness' ? `

REGOLE SPECIALI PER GUIDE FITNESS:
- Quando descrivi un esercizio, INSERISCI il tag [EXERCISE: nome] su una riga separata
- Esercizi disponibili con foto: pushup, panca manubri, press manubri, alzate laterali, curl manubri, curl hammer, curl ez, french press, squat, affondi, squat bulgaro, squat jump, burpees, crunch obliqui, crunch, leg raise, leg extension, ab wheel, plank, dip, pushup diamond, mountain climber, alzate frontali, squeeze press, croci manubri
- Usa SOLO questi nomi esatti nel tag [EXERCISE: nome]
- Dopo il tag, aggiungi: serie x ripetizioni, e una breve descrizione dell'esecuzione corretta
- NON usare macchine (leg press, lat machine, chest press machine, leg curl machine). Usa SOLO manubri e corpo libero.
- Esempio formato:

[EXERCISE: squat]
**Squat a Corpo Libero** — 3 x 12 ripetizioni
Piedi larghezza spalle, scendi fino a cosce parallele al pavimento. Schiena dritta, peso sui talloni.

[EXERCISE: pushup]
**Push Up** — 3 x 10 ripetizioni
Mani larghezza spalle, corpo in linea retta. Scendi fino a sfiorare il pavimento con il petto.
` : '';

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
- Sii specifico con numeri, percentuali, tempi reali.${exerciseInstructions}`
        },
        { role: 'user', content: `Capitolo ${chapterNum} della guida "${title}".\nTitolo: "${chapterTitle}"\nCategoria: ${catContext}\n${prompt ? `Note aggiuntive: ${prompt}` : ''}\n\nScrivi COMPLETO. MINIMO 1500 parole. Inizia con ## ${chapterTitle}` }
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
      const url = await generateImage(chapterTitle || title, category, imageProvider);
      return NextResponse.json({ success: true, url });
    }

    return NextResponse.json({ error: 'Step non valido' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Errore:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Errore' }, { status: 500 });
  }
}
