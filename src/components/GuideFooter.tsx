// E:\guide-digitali\src\components\GuideFooter.tsx
// Footer con CTA verso UtilityLab

export default function GuideFooter() {
  return (
    <footer className="border-t border-white/5 bg-[#030308]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-lg font-semibold text-white">GuideDigitali</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Guide digitali premium per professionisti che vogliono crescere.
              Contenuti pratici, azionabili e aggiornati.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Categorie</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><span className="text-cyan-400/70">Fitness & Allenamento</span></li>
              <li><span className="text-violet-400/70">Business & AI Automation</span></li>
              <li><span className="text-amber-400/70">Mindset & Produttivita</span></li>
              <li><span className="text-rose-400/70">Personal Branding</span></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Scopri di piu</h3>
            <p className="text-sm text-gray-500 mb-4">
              Cerchi strumenti digitali avanzati? Scopri la suite completa.
            </p>
            <a
              href="https://utilitylab.it"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-white/10 text-sm text-cyan-400 hover:border-cyan-500/30 transition-all"
            >
              Visita UtilityLab
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-gray-600">
            GuideDigitali -- Soddisfatti o rimborsati entro 30 giorni.
          </p>
        </div>
      </div>
    </footer>
  );
}
