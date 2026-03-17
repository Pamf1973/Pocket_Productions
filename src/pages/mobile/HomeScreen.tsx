import { useState } from 'react';
import BottomNav from '../../components/BottomNav';

type AssetType = 'all' | 'script' | 'footage' | 'audio';

const ASSETS = [
  { id: 1, type: 'script' as const, title: 'Neon_Nights_EP01.pdf', meta: 'Updated 2h ago · 2.4 MB', icon: 'description', color: '#f59e0b' },
  { id: 2, type: 'footage' as const, title: 'Street_Chase_04.mp4', meta: '4K · 12s · 142 MB', icon: 'movie', color: '#3b82f6' },
  { id: 3, type: 'audio' as const, title: 'Synthwave_OST.wav', meta: 'Stereo · 3:45 · 48 MB', icon: 'graphic_eq', color: '#10b981' },
  { id: 4, type: 'footage' as const, title: 'Title_Card_FX.mov', meta: 'ProRes · 5s · 210 MB', icon: 'movie', color: '#3b82f6' },
  { id: 5, type: 'script' as const, title: 'Character_Bios.doc', meta: 'Updated Yesterday · 1.2 MB', icon: 'description', color: '#f59e0b' },
  { id: 6, type: 'audio' as const, title: 'Voice_Over_02.mp3', meta: 'Mono · 1:12 · 8 MB', icon: 'mic', color: '#10b981' },
  { id: 7, type: 'script' as const, title: 'Shot_List_EP01.pdf', meta: 'Updated 3d ago · 0.8 MB', icon: 'format_list_numbered', color: '#f59e0b' },
  { id: 8, type: 'footage' as const, title: 'B-Roll_Warehouse.mp4', meta: '4K · 2m 14s · 890 MB', icon: 'movie', color: '#3b82f6' },
];

const FILTERS: { id: AssetType; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: 'grid_view' },
  { id: 'script', label: 'Scripts', icon: 'description' },
  { id: 'footage', label: 'Footage', icon: 'movie' },
  { id: 'audio', label: 'Audio', icon: 'graphic_eq' },
];

const TYPE_LABEL: Record<string, string> = { script: 'Script', footage: 'Footage', audio: 'Audio' };

export default function HomeScreen() {
  const [filter, setFilter] = useState<AssetType>('all');
  const [search, setSearch] = useState('');

  const filtered = ASSETS.filter((a) => {
    const matchesType = filter === 'all' || a.type === filter;
    const matchesSearch = search === '' || a.title.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div
      className="flex flex-col min-h-screen max-w-md mx-auto"
      style={{ background: '#0a0f1a', fontFamily: "'Public Sans', sans-serif" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-20 px-5 pt-12 pb-4"
        style={{
          background: 'rgba(10,15,26,0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Production
            </p>
            <h1 className="text-xl font-black text-white leading-tight">Assets</h1>
          </div>
          <button
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #ec5b13, #c0410a)' }}
          >
            <span className="material-symbols-outlined text-[16px]">upload</span>
            Upload
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search scripts, footage, audio..."
            className="w-full rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-28 pt-4 space-y-4">
        {/* Filter chips */}
        <div className="px-5 flex gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all"
              style={{
                background: filter === f.id ? '#ec5b13' : 'rgba(255,255,255,0.06)',
                color: filter === f.id ? '#fff' : 'rgba(255,255,255,0.4)',
                border: filter === f.id ? 'none' : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <span className="material-symbols-outlined text-[14px]">{f.icon}</span>
              {f.label}
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div className="px-5">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Scripts', value: ASSETS.filter(a => a.type === 'script').length, color: '#f59e0b' },
              { label: 'Footage', value: ASSETS.filter(a => a.type === 'footage').length, color: '#3b82f6' },
              { label: 'Audio', value: ASSETS.filter(a => a.type === 'audio').length, color: '#10b981' },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl p-3 text-center"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Asset list */}
        <section className="px-5 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {filtered.length} asset{filtered.length !== 1 ? 's' : ''}
          </p>

          {filtered.map((asset) => (
            <div
              key={asset.id}
              className="flex items-center gap-4 rounded-2xl p-4 active:scale-[0.98] transition-transform"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {/* Icon */}
              <div
                className="size-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: asset.color + '18', border: `1px solid ${asset.color}30` }}
              >
                <span className="material-symbols-outlined text-[22px]" style={{ color: asset.color }}>
                  {asset.icon}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{asset.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{asset.meta}</p>
              </div>

              {/* Type badge + action */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span
                  className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ background: asset.color + '18', color: asset.color }}
                >
                  {TYPE_LABEL[asset.type]}
                </span>
                <button
                  className="material-symbols-outlined text-[18px]"
                  style={{ color: 'rgba(255,255,255,0.2)' }}
                >
                  more_vert
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-10">
              <span className="material-symbols-outlined text-[40px] text-slate-700">folder_off</span>
              <p className="text-slate-600 text-sm mt-2">No assets found</p>
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
