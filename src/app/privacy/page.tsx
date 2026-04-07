import GuideFooter from '@/components/GuideFooter';

export const metadata = {
  title: 'Privacy Policy — GuideDigitali',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#050510]">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <a href="/" className="text-cyan-400 text-sm hover:underline">&larr; Torna allo store</a>

        <h1 className="text-3xl font-bold text-white mt-6 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Ultimo aggiornamento: Aprile 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-white">1. Titolare del trattamento</h2>
            <p>
              Il titolare del trattamento dei dati personali e Andrea Padoan.<br />
              Email: <a href="mailto:andrea.padoan@gmail.com" className="text-cyan-400">andrea.padoan@gmail.com</a><br />
              WhatsApp: <a href="https://wa.me/393478881515" className="text-cyan-400">+39 347 888 1515</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">2. Dati raccolti</h2>
            <p>Raccogliamo i seguenti dati personali:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Email</strong> — fornita al momento dell&apos;acquisto o della richiesta promo, utilizzata per inviare il link di download e comunicazioni relative all&apos;ordine.</li>
              <li><strong>Indirizzo IP</strong> — registrato a fini di sicurezza e prevenzione abusi nel sistema promozionale.</li>
              <li><strong>Dati di pagamento</strong> — elaborati direttamente da PayPal. Non memorizziamo dati di carte di credito.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">3. Finalita del trattamento</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Evasione dell&apos;ordine e invio del prodotto digitale acquistato</li>
              <li>Invio email transazionali (conferma ordine, link download)</li>
              <li>Invio comunicazioni su nuove guide (solo a clienti che hanno acquistato)</li>
              <li>Prevenzione frodi e abusi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">4. Base giuridica</h2>
            <p>
              Il trattamento dei dati e basato sull&apos;esecuzione del contratto di vendita (art. 6.1.b GDPR)
              e sul legittimo interesse del titolare per la prevenzione frodi (art. 6.1.f GDPR).
              Le comunicazioni promozionali si basano sul legittimo interesse (soft spam) ai sensi dell&apos;art. 130 comma 4 del Codice Privacy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">5. Conservazione dei dati</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Dati ordine: conservati per 10 anni per obblighi fiscali</li>
              <li>Email cliente: conservata fino a richiesta di cancellazione</li>
              <li>Token di download: scadono automaticamente dopo 48 ore</li>
              <li>Indirizzi IP promo: conservati per 30 giorni</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">6. Servizi di terze parti</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Supabase</strong> (hosting database) — server UE</li>
              <li><strong>Vercel</strong> (hosting sito) — CDN globale</li>
              <li><strong>PayPal</strong> (pagamenti) — <a href="https://www.paypal.com/privacy" className="text-cyan-400" target="_blank" rel="noopener noreferrer">Privacy PayPal</a></li>
              <li><strong>Resend</strong> (invio email) — <a href="https://resend.com/privacy" className="text-cyan-400" target="_blank" rel="noopener noreferrer">Privacy Resend</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">7. Diritti dell&apos;interessato</h2>
            <p>In conformita al GDPR (artt. 15-22), hai diritto di:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Accedere ai tuoi dati personali</li>
              <li>Richiedere la rettifica o la cancellazione</li>
              <li>Opporti al trattamento</li>
              <li>Richiedere la portabilita dei dati</li>
              <li>Revocare il consenso in qualsiasi momento</li>
              <li>Proporre reclamo al Garante per la Protezione dei Dati Personali</li>
            </ul>
            <p className="mt-3">
              Per esercitare i tuoi diritti, scrivi a{' '}
              <a href="mailto:andrea.padoan@gmail.com" className="text-cyan-400">andrea.padoan@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">8. Trasferimento dati extra-UE</h2>
            <p>
              Alcuni servizi (Vercel, PayPal) possono trasferire dati al di fuori dell&apos;UE.
              In tali casi il trasferimento avviene sulla base delle Clausole Contrattuali Standard (SCC)
              o del Data Privacy Framework UE-USA.
            </p>
          </section>

        </div>
      </div>
      <GuideFooter />
    </div>
  );
}
