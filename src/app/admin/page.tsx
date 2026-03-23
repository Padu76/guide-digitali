// E:\guide-digitali\src\app\admin\page.tsx
// Dashboard admin ordini GuideDigitali — protetta da password

'use client';

import { useState, useEffect } from 'react';
import { GuideOrder, AdminStats } from '@/lib/guide-types';
import { formatPrice, formatDate } from '@/lib/guide-utils';

export default function GuideAdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<GuideOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    // Controlla se gia autenticato via cookie
    if (document.cookie.includes('guide_admin_auth=authenticated')) {
      setAuthed(true);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) {
      fetchStats();
      fetchOrders();
    }
  }, [authed, page, statusFilter]);

  async function handleLogin() {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAuthed(true);
        setLoginError('');
      } else {
        setLoginError('Password non corretta');
      }
    } catch {
      setLoginError('Errore di connessione');
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.status === 401) { setAuthed(false); return; }
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Errore stats:', err);
    }
  }

  async function fetchOrders() {
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/admin/orders?${params}`);
      if (res.status === 401) { setAuthed(false); return; }
      const data = await res.json();
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Errore ordini:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    window.open('/api/admin/export', '_blank');
  }

  // Login form
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="w-full max-w-sm p-6 rounded-xl border border-white/5 bg-[#0a0a1a]">
          <h1 className="text-xl font-bold text-white mb-6 text-center">Admin GuideDigitali</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Password"
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:border-cyan-500/30 focus:outline-none transition-colors mb-3"
          />
          {loginError && <p className="text-xs text-red-400 mb-3">{loginError}</p>}
          <button
            onClick={handleLogin}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Accedi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050510]">
      <div className="border-b border-white/5 bg-[#050510]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">GuideDigitali Admin</h1>
            <p className="text-xs text-gray-500">Dashboard ordini e statistiche</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-all"
            >
              Export CSV
            </button>
            <a
              href="/"
              className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Torna allo store
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="p-5 rounded-xl border border-white/5 bg-[#0a0a1a]">
              <p className="text-xs text-gray-500 mb-1">Revenue totale</p>
              <p className="text-2xl font-bold text-green-400">{formatPrice(stats.total_revenue)}</p>
            </div>
            <div className="p-5 rounded-xl border border-white/5 bg-[#0a0a1a]">
              <p className="text-xs text-gray-500 mb-1">Ordini completati</p>
              <p className="text-2xl font-bold text-white">{stats.total_orders}</p>
            </div>
            <div className="p-5 rounded-xl border border-white/5 bg-[#0a0a1a]">
              <p className="text-xs text-gray-500 mb-1">Download effettuati</p>
              <p className="text-2xl font-bold text-cyan-400">{stats.total_downloads}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm text-gray-500">Filtra:</span>
          {['', 'completed', 'pending', 'failed', 'refunded'].map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1 rounded-md text-xs transition-all ${
                statusFilter === s
                  ? 'bg-white/10 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {s === '' ? 'Tutti' : s === 'completed' ? 'Completati' : s === 'pending' ? 'In attesa' : s === 'failed' ? 'Falliti' : 'Rimborsati'}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-white/5 bg-[#0a0a1a] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-3 text-xs text-gray-500 font-medium">Data</th>
                  <th className="text-left p-3 text-xs text-gray-500 font-medium">Email</th>
                  <th className="text-left p-3 text-xs text-gray-500 font-medium">Guide</th>
                  <th className="text-right p-3 text-xs text-gray-500 font-medium">Importo</th>
                  <th className="text-center p-3 text-xs text-gray-500 font-medium">Stato</th>
                  <th className="text-center p-3 text-xs text-gray-500 font-medium">Download</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-600">Caricamento...</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-600">Nessun ordine trovato</td></tr>
                ) : (
                  orders.map(order => {
                    const items = order.items as { title: string }[];
                    return (
                      <tr key={order.id} className="border-b border-white/[0.02] hover:bg-white/[0.02]">
                        <td className="p-3 text-gray-400 text-xs">{formatDate(order.created_at)}</td>
                        <td className="p-3 text-gray-300">{order.email}</td>
                        <td className="p-3 text-gray-400 text-xs">{items.map(i => i.title).join(', ')}</td>
                        <td className="p-3 text-right text-white font-medium">{formatPrice(order.amount)}</td>
                        <td className="p-3 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium ${
                            order.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                            order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                            order.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                            'bg-gray-500/10 text-gray-400'
                          }`}>
                            {order.status === 'completed' ? 'Completato' :
                             order.status === 'pending' ? 'In attesa' :
                             order.status === 'failed' ? 'Fallito' : 'Rimborsato'}
                          </span>
                        </td>
                        <td className="p-3 text-center text-xs">
                          {order.download_used
                            ? <span className="text-green-400">Scaricato</span>
                            : <span className="text-gray-600">--</span>
                          }
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {total > 20 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-gray-500">{total} ordini totali</p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 rounded-md bg-white/5 text-xs text-gray-400 disabled:opacity-30"
              >
                Precedente
              </button>
              <span className="px-3 py-1 text-xs text-gray-500">Pagina {page}</span>
              <button
                disabled={page * 20 >= total}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 rounded-md bg-white/5 text-xs text-gray-400 disabled:opacity-30"
              >
                Successiva
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
