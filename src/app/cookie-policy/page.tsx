import GuideFooter from '@/components/GuideFooter';

export const metadata = {
  title: 'Cookie Policy — GuideDigitali',
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[#050510]">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <a href="/" className="text-cyan-400 text-sm hover:underline">&larr; Torna allo store</a>

        <h1 className="text-3xl font-bold text-white mt-6 mb-2">Cookie Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Ultimo aggiornamento: Aprile 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-white">Cosa sono i cookie</h2>
            <p>
              I cookie sono piccoli file di testo che vengono memorizzati sul tuo dispositivo quando visiti un sito web.
              Servono a garantire il funzionamento del sito e, in alcuni casi, a migliorare l&apos;esperienza di navigazione.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Cookie utilizzati da questo sito</h2>

            <div className="mt-4 border border-white/10 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/5">
                    <th className="text-left px-4 py-3 text-gray-300 font-semibold">Cookie</th>
                    <th className="text-left px-4 py-3 text-gray-300 font-semibold">Tipo</th>
                    <th className="text-left px-4 py-3 text-gray-300 font-semibold">Durata</th>
                    <th className="text-left px-4 py-3 text-gray-300 font-semibold">Finalita</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="px-4 py-3 font-mono text-cyan-400 text-xs">cookie_consent</td>
                    <td className="px-4 py-3">Tecnico</td>
                    <td className="px-4 py-3">Persistente</td>
                    <td className="px-4 py-3">Memorizza la scelta sui cookie</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-cyan-400 text-xs">guide_admin_auth</td>
                    <td className="px-4 py-3">Tecnico</td>
                    <td className="px-4 py-3">Sessione</td>
                    <td className="px-4 py-3">Autenticazione pannello admin</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Cookie di terze parti</h2>
            <p>Questo sito integra servizi di terze parti che possono impostare propri cookie:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>PayPal</strong> — per l&apos;elaborazione dei pagamenti. <a href="https://www.paypal.com/privacy" className="text-cyan-400" target="_blank" rel="noopener noreferrer">Cookie Policy PayPal</a></li>
              <li><strong>Vercel Analytics</strong> — per statistiche anonime di utilizzo (se abilitato)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Cookie di profilazione</h2>
            <p>
              Questo sito <strong>non utilizza cookie di profilazione</strong> ne cookie pubblicitari.
              Non viene effettuato alcun tracciamento per finalita di marketing comportamentale.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Come gestire i cookie</h2>
            <p>
              Puoi gestire le preferenze sui cookie direttamente dal tuo browser.
              Tieni presente che disabilitare i cookie tecnici potrebbe compromettere il funzionamento del sito.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><a href="https://support.google.com/chrome/answer/95647" className="text-cyan-400" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/it/kb/protezione-antitracciamento-avanzata-firefox-desktop" className="text-cyan-400" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" className="text-cyan-400" target="_blank" rel="noopener noreferrer">Safari</a></li>
              <li><a href="https://support.microsoft.com/it-it/microsoft-edge/eliminare-i-cookie-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" className="text-cyan-400" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Contatti</h2>
            <p>
              Per qualsiasi domanda relativa ai cookie, contatta:<br />
              <a href="mailto:andrea.padoan@gmail.com" className="text-cyan-400">andrea.padoan@gmail.com</a>
            </p>
          </section>

        </div>
      </div>
      <GuideFooter />
    </div>
  );
}
