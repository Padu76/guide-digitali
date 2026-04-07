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
            <ul className="space-y-2 text-sm">
              <li><a href="/?cat=fitness" className="text-cyan-400/70 hover:text-cyan-400 transition-colors">Fitness & Allenamento</a></li>
              <li><a href="/?cat=business" className="text-violet-400/70 hover:text-violet-400 transition-colors">Business & AI</a></li>
              <li><a href="/?cat=mindset" className="text-amber-400/70 hover:text-amber-400 transition-colors">Mindset & Produttivita</a></li>
              <li><a href="/?cat=biohacking" className="text-emerald-400/70 hover:text-emerald-400 transition-colors">Biohacking: Benessere & Performance</a></li>
              <li><a href="/?cat=alimentazione" className="text-green-400/70 hover:text-green-400 transition-colors">Alimentazione & Nutrizione</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Contatti & Assistenza</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="mailto:andrea.padoan@gmail.com" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  andrea.padoan@gmail.com
                </a>
              </li>
              <li>
                <a href="https://wa.me/393478881515" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} GuideDigitali — Guide digitali premium.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <a href="/privacy" className="text-gray-500 hover:text-gray-300 transition-colors">Privacy Policy</a>
            <a href="/cookie-policy" className="text-gray-500 hover:text-gray-300 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
