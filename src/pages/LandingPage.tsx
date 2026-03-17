import { useNavigate } from 'react-router-dom';
import { usePWAInstall } from '../hooks/usePWAInstall';

const FEATURES = [
  {
    icon: 'summarize',
    title: 'Budget Intelligence',
    desc: 'SAG-AFTRA compliant line-item budgeting with AI anomaly detection and real-time spend tracking.',
  },
  {
    icon: 'calendar_month',
    title: 'Production Calendar',
    desc: 'Multi-unit scheduling with Gantt views, cast call sheets, and live day-of coordination.',
  },
  {
    icon: 'movie_filter',
    title: 'AI Storyboard Studio',
    desc: 'Generate shot lists and storyboard frames from your script using AI, then refine per scene.',
  },
  {
    icon: 'location_on',
    title: 'ScoutNoir Locations',
    desc: 'Discover, compare, and book filming locations with permit status and map preview built in.',
  },
  {
    icon: 'group',
    title: 'Crew Ops',
    desc: 'Full crew roster management — active personnel, standby status, and role-based access.',
  },
  {
    icon: 'layers',
    title: 'Digital Asset Management',
    desc: 'Centralised storage for scripts, footage, audio, and legal docs across all your productions.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { deviceType, installPrompt, triggerInstall } = usePWAInstall();
  const isMobile = deviceType === 'ios' || deviceType === 'android';

  const handleInstallClick = async () => {
    if (deviceType === 'android' && installPrompt) {
      await triggerInstall();
    } else {
      navigate('/install');
    }
  };

  return (
    <div
      className="min-h-screen text-white overflow-x-hidden"
      style={{ background: '#080c14', fontFamily: "'Public Sans', sans-serif" }}
    >
      {/* ── NAV ── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b"
        style={{ background: 'rgba(8,12,20,0.85)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #257bf4, #1a4ed8)' }}
          >
            <span className="material-symbols-outlined text-white text-[18px]">movie_filter</span>
          </div>
          <div>
            <span className="text-sm font-black text-white tracking-tight leading-none block">Pocket</span>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 leading-none block">Productions</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400 font-medium">
          {['Features', 'Mobile', 'Desktop'].map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-white transition-colors">{l}</a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isMobile && (
            <button
              onClick={handleInstallClick}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition-colors"
              style={{ borderColor: 'rgba(37,123,244,0.4)', color: '#257bf4', background: 'rgba(37,123,244,0.1)' }}
            >
              <span className="material-symbols-outlined text-[16px]">install_mobile</span>
              Install App
            </button>
          )}
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-lg text-sm font-bold text-slate-300 border transition-colors hover:text-white"
            style={{ borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)' }}
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="px-4 py-2 rounded-lg text-sm font-black text-white transition-colors hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #257bf4, #1a4ed8)' }}
          >
            Get Started
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative flex flex-col items-center text-center px-6 pt-24 pb-20 overflow-hidden">
        {/* glow blobs */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #257bf4 0%, transparent 70%)' }}
        />

        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-6 border"
          style={{ color: '#257bf4', borderColor: 'rgba(37,123,244,0.3)', background: 'rgba(37,123,244,0.1)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          PWA — Install on Any Device
        </span>

        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-6 max-w-3xl">
          Your entire
          <span style={{ color: '#257bf4' }}> production</span>
          <br />in your pocket.
        </h1>

        <p className="text-slate-400 text-lg max-w-xl leading-relaxed mb-10">
          Pocket Productions is a full-stack film production management PWA — budget tracking, crew ops,
          AI storyboarding, and location scouting, on any device, even offline.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-black text-black transition-all hover:scale-105"
            style={{ background: 'linear-gradient(to right, #00B2FF, #257bf4)', boxShadow: '0 10px 30px rgba(0,178,255,0.3)' }}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isMobile ? 'install_mobile' : 'smartphone'}
            </span>
            {isMobile ? 'Add to Home Screen' : 'Install on Phone'}
          </button>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white border transition-all hover:bg-white/5"
            style={{ borderColor: 'rgba(255,255,255,0.15)' }}
          >
            <span className="material-symbols-outlined text-[20px]">monitor</span>
            Open Desktop App
          </button>
        </div>

        {/* hero mock — desktop preview */}
        <div
          className="mt-16 w-full max-w-5xl rounded-2xl overflow-hidden border shadow-2xl"
          style={{ borderColor: 'rgba(255,255,255,0.07)', background: '#0f172a', boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }}
        >
          {/* window chrome */}
          <div
            className="flex items-center gap-2 px-4 py-3 border-b"
            style={{ background: '#1e293b', borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
            <div
              className="ml-4 flex-1 max-w-xs rounded-md px-3 py-1 text-xs text-center"
              style={{ background: 'rgba(0,0,0,0.3)', color: '#64748b' }}
            >
              pocket-productions.vercel.app/dashboard
            </div>
          </div>

          {/* app layout preview */}
          <div className="flex h-72" style={{ background: '#0f172a' }}>
            {/* sidebar */}
            <div className="w-44 shrink-0 border-r flex flex-col p-3 gap-1" style={{ background: '#1e293b', borderColor: 'rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#257bf4' }}>
                  <span className="material-symbols-outlined text-white text-[14px]">movie_filter</span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-white">Pocket</p>
                  <p className="text-[8px] text-slate-500 uppercase tracking-widest">Productions</p>
                </div>
              </div>
              {['grid_view', 'folder_special', 'calendar_month', 'location_on', 'movie_filter', 'group', 'layers'].map((icon, i) => {
                const labels = ['Dashboard', 'Projects', 'Calendar', 'Locations', 'Storyboard', 'Team', 'Assets'];
                return (
                  <div
                    key={icon}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] font-medium"
                    style={i === 0 ? { background: 'rgba(37,123,244,0.2)', color: '#60a5fa' } : { color: '#64748b' }}
                  >
                    <span className="material-symbols-outlined text-[14px]">{icon}</span>
                    {labels[i]}
                  </div>
                );
              })}
            </div>

            {/* content */}
            <div className="flex-1 p-4 overflow-hidden">
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[['Total Budget', '$12.5M', 'text-white'], ['Spent to Date', '$8.2M', 'text-blue-400'], ['Remaining', '$4.3M', 'text-green-400'], ['Contingency', '$1.2M', 'text-orange-400']].map(([label, val, cls]) => (
                  <div key={label} className="rounded-lg p-2.5" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="text-[8px] text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                    <p className={`text-sm font-black ${cls}`}>{val}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg overflow-hidden relative" style={{ height: 140 }}>
                <div className="absolute inset-0 flex items-end justify-start p-4" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
                  <div>
                    <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-bold uppercase mb-1" style={{ background: 'rgba(37,123,244,0.2)', color: '#60a5fa', border: '1px solid rgba(37,123,244,0.3)' }}>
                      Feature Film • Filming
                    </div>
                    <p className="text-base font-black text-white">The Long Goodbye</p>
                    <p className="text-[9px] text-slate-400">Day 42 of 60 • Principal photography ongoing in Los Angeles</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#257bf4' }}>Everything on set</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">Built for the full production lifecycle</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl p-5 border transition-colors hover:border-blue-500/30"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(37,123,244,0.15)' }}
              >
                <span className="material-symbols-outlined text-[20px]" style={{ color: '#257bf4' }}>{f.icon}</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-2">{f.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── MOBILE SCREENS ── */}
      <section id="mobile" className="px-6 py-20" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#ec5b13' }}>Mobile PWA</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">The whole studio on your phone</h2>
            <p className="text-slate-400 mt-3 max-w-lg mx-auto">Install directly to your home screen. Works offline on set — no signal required.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'NexusOps', subtitle: 'Night Shoot Command', icon: 'videocam', badge: 'LIVE RECORDING', badgeColor: '#ec5b13', items: ['$4.2M Total Budget', 'Daily Gantt Summary', 'Live Stream Access', 'Scene 82 • Take 12'] },
              { title: 'StoryboardStudio', subtitle: 'AI Shot Generation', icon: 'movie_filter', badge: 'AI POWERED', badgeColor: '#8b5cf6', items: ['Upload or blank canvas', 'AI Generate from script', 'Shot metadata per frame', 'Export PDF ready'] },
              { title: 'ScoutNoir', subtitle: 'Location Discovery', icon: 'location_on', badge: 'NEAR ME', badgeColor: '#10b981', items: ['Permit status live', 'Map & distance view', '$85–$450/hr listings', 'Secure spot instantly'] },
            ].map((screen) => (
              <div
                key={screen.title}
                className="rounded-2xl overflow-hidden border"
                style={{ background: '#0f172a', borderColor: 'rgba(255,255,255,0.07)' }}
              >
                {/* phone header */}
                <div
                  className="px-4 py-3 flex items-center justify-between border-b"
                  style={{ background: '#1e293b', borderColor: 'rgba(255,255,255,0.06)' }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: screen.badgeColor }}>
                      <span className="material-symbols-outlined text-white text-[14px]">{screen.icon}</span>
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-white">{screen.title}</p>
                      <p className="text-[9px] text-slate-500">{screen.subtitle}</p>
                    </div>
                  </div>
                  <span
                    className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ background: `${screen.badgeColor}22`, color: screen.badgeColor, border: `1px solid ${screen.badgeColor}44` }}
                  >
                    {screen.badge}
                  </span>
                </div>

                {/* content */}
                <div className="p-4 space-y-2">
                  {screen.items.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs text-slate-300"
                      style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: screen.badgeColor }} />
                      {item}
                    </div>
                  ))}
                </div>

                {/* bottom nav mock */}
                <div
                  className="flex justify-around py-3 px-4 border-t"
                  style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#1e293b' }}
                >
                  {['directions_boat', 'group', 'add_circle', 'gps_fixed', 'terminal'].map((ico, i) => (
                    <span
                      key={ico}
                      className="material-symbols-outlined text-[20px]"
                      style={{ color: i === 2 ? screen.badgeColor : i === 1 ? screen.badgeColor : '#475569' }}
                    >{ico}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DESKTOP ── */}
      <section id="desktop" className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#257bf4' }}>Desktop App</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">Command centre for producers</h2>
          <p className="text-slate-400 mt-3 max-w-lg mx-auto">Full widescreen layouts with sidebar navigation, data tables, and Gantt timelines.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: 'grid_view', label: 'Dashboard', desc: 'Budget overview, active productions hero, and daily Gantt timeline.', route: '/dashboard' },
            { icon: 'folder_special', label: 'Projects', desc: 'All productions at a glance — budget progress, status, crew count, and phase.', route: '/projects-desktop' },
            { icon: 'movie_filter', label: 'Storyboard', desc: 'Script editor side-by-side with AI-generated shot board and scene analysis.', route: '/storyboard-desktop' },
            { icon: 'summarize', label: 'Budgets', desc: 'Upload screenplay → auto line items. SAG-AFTRA toggle, AI anomaly flags, compliance score.', route: '/budgets' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.route)}
              className="flex items-start gap-4 p-5 rounded-xl border text-left transition-all hover:border-blue-500/30 hover:bg-blue-500/5"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}
            >
              <div
                className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center"
                style={{ background: 'rgba(37,123,244,0.15)' }}
              >
                <span className="material-symbols-outlined text-[22px]" style={{ color: '#257bf4' }}>{item.icon}</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">{item.label}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
              <span className="material-symbols-outlined text-slate-600 text-[18px] ml-auto shrink-0 mt-0.5">arrow_forward</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-24 text-center">
        <div
          className="max-w-2xl mx-auto rounded-2xl p-10 border"
          style={{ background: 'rgba(37,123,244,0.06)', borderColor: 'rgba(37,123,244,0.2)' }}
        >
          {/* floating app icon */}
          <div
            className="w-20 h-20 mx-auto rounded-[1.75rem] flex items-center justify-center mb-6 shadow-xl"
            style={{
              background: 'linear-gradient(135deg, #00B2FF, #1a4ed8)',
              boxShadow: '0 12px 40px rgba(0,178,255,0.3)',
            }}
          >
            <span className="material-symbols-outlined text-white text-[36px]">movie_filter</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">Ready to roll?</h2>
          <p className="text-slate-400 mb-8 max-w-sm mx-auto">
            Install Pocket Productions as a native app on iOS or Android — or open the desktop version right now.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/install')}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-black text-sm text-black transition-all hover:scale-105"
              style={{ background: 'linear-gradient(to right, #00B2FF, #257bf4)', boxShadow: '0 10px 30px rgba(0,178,255,0.3)' }}
            >
              <span className="material-symbols-outlined text-[20px]">install_mobile</span>
              Add to Home Screen
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-sm text-white border transition-all hover:bg-white/5"
              style={{ borderColor: 'rgba(255,255,255,0.15)' }}
            >
              <span className="material-symbols-outlined text-[20px]">monitor</span>
              Open Desktop App
            </button>
          </div>

          <p className="mt-6 text-[11px] text-slate-600 uppercase tracking-widest font-bold">
            On iPhone: Tap <span className="text-slate-400">Share</span> → <span className="text-slate-400">"Add to Home Screen"</span>
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="px-6 py-8 border-t text-center text-xs text-slate-600"
        style={{ borderColor: 'rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center"
            style={{ background: '#257bf4' }}
          >
            <span className="material-symbols-outlined text-white text-[11px]">movie_filter</span>
          </div>
          <span className="font-bold text-slate-400">Pocket Productions</span>
        </div>
        <p>Production management for independent filmmakers.</p>
      </footer>
    </div>
  );
}
