import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';

const NAV = [
  { label: 'Dashboard', icon: 'grid_view', route: '/dashboard' },
  { label: 'Projects', icon: 'folder_special', route: '/projects-desktop' },
  { label: 'Budgets', icon: 'payments', route: '/budgets' },
  { label: 'Calendar', icon: 'calendar_month', route: '/calendar-desktop' },
  { label: 'Locations', icon: 'location_on', route: '/locations-desktop' },
  { label: 'Storyboard', icon: 'movie_filter', route: '/storyboard-desktop' },
  { label: 'Team', icon: 'group', route: '/team-desktop' },
  { label: 'Assets', icon: 'layers', route: '/assets' },
];

function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  return now;
}

interface Props {
  children: React.ReactNode;
  headerCenter?: React.ReactNode;
  headerRight?: React.ReactNode;
}

export default function DesktopLayout({ children, headerCenter, headerRight }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  const now = useLiveClock();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const name = user?.fullName ?? user?.firstName ?? 'Producer';
  const email = user?.primaryEmailAddress?.emailAddress ?? '';
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const photoUrl = user?.imageUrl;

  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const activeRoute = location.pathname;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-display overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-56 shrink-0 flex flex-col bg-slate-900 border-r border-white/5">
        {/* Logo */}
        <div className="p-4 flex items-center gap-3 border-b border-white/5">
          <div className="size-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl">movie_filter</span>
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">Pocket</p>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Productions</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => {
            const isActive = activeRoute === item.route ||
              (item.route === '/dashboard' && activeRoute === '/dashboard');
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.route)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-white/5 space-y-1">
          <button
            onClick={() => navigate('/install-desktop')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">install_mobile</span>
            Install App
          </button>
          <button
            onClick={() => navigate('/settings-desktop')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeRoute === '/settings-desktop'
                ? 'bg-blue-600/20 text-blue-400'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
            Settings
          </button>
        </div>

        {/* User card at bottom */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            {photoUrl ? (
              <img src={photoUrl} alt={name} className="size-8 rounded-full object-cover" />
            ) : (
              <div className="size-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-xs">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{name}</p>
              <p className="text-[10px] text-slate-500 truncate">{email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-white/5 bg-slate-900/50">
          {/* Search */}
          <div className="relative w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search productions, scripts..."
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-slate-300 placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Center — live date/time or custom */}
          {headerCenter ?? (
            <div className="text-center">
              <p className="text-xs font-bold text-white uppercase tracking-widest">{dateStr}</p>
              <p className="text-xs text-blue-400 font-bold">{timeStr}</p>
            </div>
          )}

          {/* Right — New Project + notifications + profile dropdown */}
          <div className="flex items-center gap-3">
            {headerRight ?? (
              <button
                onClick={() => navigate('/new-project-desktop')}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                New Project
              </button>
            )}

            <button className="size-9 flex items-center justify-center rounded-full bg-white/5 text-slate-400 relative hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
            </button>

            {/* Profile dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2 hover:bg-white/5 rounded-xl px-2 py-1 transition-colors"
              >
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{name}</p>
                  <p className="text-[10px] text-slate-400">Executive Producer</p>
                </div>
                {photoUrl ? (
                  <img src={photoUrl} alt={name} className="size-9 rounded-full object-cover border-2 border-white/10" />
                ) : (
                  <div className="size-9 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm border-2 border-white/10">
                    {initials}
                  </div>
                )}
                <span className="material-symbols-outlined text-[16px] text-slate-500">
                  {dropdownOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-56 rounded-2xl shadow-2xl z-50 overflow-hidden"
                  style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-sm font-bold text-white">{name}</p>
                    <p className="text-xs text-slate-400 truncate">{email}</p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => { setDropdownOpen(false); navigate('/settings-desktop'); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px] text-slate-400">settings</span>
                      Settings
                    </button>
                    <button
                      onClick={() => { setDropdownOpen(false); navigate('/install-desktop'); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px] text-slate-400">install_mobile</span>
                      Install App
                    </button>
                    <div className="my-1 border-t border-white/5" />
                    <button
                      onClick={() => signOut(() => navigate('/login'))}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
