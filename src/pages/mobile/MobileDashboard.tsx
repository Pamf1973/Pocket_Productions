import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import BottomNav from '../../components/BottomNav';

const QUICK_ACTIONS = [
  { icon: 'layers', label: 'Assets', route: '/home' },
  { icon: 'payments', label: 'Budget', route: '/budget' },
  { icon: 'calendar_month', label: 'Schedule', route: '/schedule' },
  { icon: 'group', label: 'Crew', route: '/crew' },
  { icon: 'location_on', label: 'Scout', route: '/scout' },
  { icon: 'auto_stories', label: 'Storyboard', route: '/storyboard' },
  { icon: 'folder_special', label: 'Projects', route: '/projects' },
  { icon: 'movie_filter', label: 'NexusOps', route: '/nexus' },
];

const STATS = [
  { label: 'Active Projects', value: '3', icon: 'folder_special', accent: 'text-blue-400' },
  { label: 'Shoot Days Left', value: '14', icon: 'today', accent: 'text-green-400' },
  { label: 'Budget Used', value: '68%', icon: 'payments', accent: 'text-amber-400' },
  { label: 'Crew On Call', value: '24', icon: 'group', accent: 'text-pink-400' },
];

const ACTIVITY = [
  { icon: 'description', text: 'Neon Nights EP01 script uploaded', time: '2h ago', dot: 'bg-amber-400' },
  { icon: 'location_on', text: 'Warehouse District location scouted', time: '5h ago', dot: 'bg-blue-400' },
  { icon: 'group', text: '3 crew members confirmed for shoot', time: 'Yesterday', dot: 'bg-green-400' },
  { icon: 'warning', text: 'Grip package budget overage flagged', time: 'Yesterday', dot: 'bg-red-400' },
];

export default function MobileDashboard() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [showProfile, setShowProfile] = useState(false);
  const fullName = user?.fullName ?? user?.firstName ?? 'Producer';
  const initials = fullName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleSignOut = () => {
    signOut(() => navigate('/login'));
  };

  return (
    <div
      className="relative flex flex-col min-h-screen max-w-md mx-auto overflow-hidden"
      style={{ background: '#0a0f1a', fontFamily: "'Public Sans', sans-serif" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-20 px-5 pt-12 pb-4"
        style={{ background: 'rgba(10,15,26,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Production
            </p>
            <h1 className="text-xl font-black text-white leading-tight">
              Hey, {user?.firstName ?? fullName.split(' ')[0]} 👋
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="size-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.07)' }}>
              <span className="material-symbols-outlined text-slate-300 text-[20px]">notifications</span>
            </button>
            <button
              onClick={() => setShowProfile(true)}
              className="size-9 rounded-full flex items-center justify-center text-white text-xs font-black"
              style={{ background: 'linear-gradient(135deg, #ec5b13, #c0410a)' }}
            >
              {initials}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-28 space-y-6 pt-5">
        {/* Active production hero */}
        <section className="px-5">
          <div
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(236,91,19,0.25), rgba(37,123,244,0.15))',
              border: '1px solid rgba(236,91,19,0.2)',
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, #ec5b13, transparent)', transform: 'translate(20%, -30%)' }} />
            <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-1">Now In Production</p>
            <h2 className="text-xl font-black text-white mb-1">Neon Nights EP01</h2>
            <p className="text-xs text-slate-400 mb-4">Day 28 of 42 · Sci-Fi Noir Series</p>
            <div className="mb-4">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                <span>Production Progress</span>
                <span className="text-orange-400">67%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className="h-full rounded-full w-[67%]"
                  style={{ background: 'linear-gradient(to right, #ec5b13, #f97316)' }} />
              </div>
            </div>
            <button
              onClick={() => navigate('/projects')}
              className="text-xs font-bold text-orange-400 flex items-center gap-1"
            >
              View Project <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </section>

        {/* Stats grid */}
        <section className="px-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Overview</p>
          <div className="grid grid-cols-2 gap-3">
            {STATS.map((s) => (
              <div key={s.label}
                className="rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`material-symbols-outlined text-[18px] ${s.accent}`}>{s.icon}</span>
                </div>
                <p className={`text-2xl font-black ${s.accent}`}>{s.value}</p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick actions */}
        <section className="px-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Quick Access</p>
          <div className="grid grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.route)}
                className="flex flex-col items-center gap-2 rounded-2xl py-4 transition-all active:scale-95"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <span className="material-symbols-outlined text-[22px] text-orange-400">{action.icon}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{action.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Recent activity */}
        <section className="px-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Recent Activity</p>
            <button className="text-[10px] font-bold text-orange-400">See All</button>
          </div>
          <div className="space-y-2">
            {ACTIVITY.map((item, i) => (
              <div key={i}
                className="flex items-center gap-3 rounded-xl p-3"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.dot}`} />
                <span className="material-symbols-outlined text-[18px] text-slate-500">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-200 truncate">{item.text}</p>
                </div>
                <p className="text-[10px] text-slate-600 shrink-0">{item.time}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Profile sheet */}
      {showProfile && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-30"
            onClick={() => setShowProfile(false)}
          />
          <div
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 rounded-t-3xl p-6 pb-10"
            style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-6" />
            <div className="flex items-center gap-4 mb-6">
              <div
                className="size-14 rounded-full flex items-center justify-center text-white text-lg font-black shrink-0"
                style={{ background: 'linear-gradient(135deg, #ec5b13, #c0410a)' }}
              >
                {initials}
              </div>
              <div>
                <p className="text-white font-bold text-base">{fullName}</p>
                <p className="text-slate-400 text-sm">{user?.primaryEmailAddress?.emailAddress ?? ''}</p>
                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400">
                  Executive Producer
                </span>
              </div>
            </div>
            <div className="space-y-2 mb-6">
              <button
                onClick={() => { setShowProfile(false); navigate('/settings'); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-300 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <span className="material-symbols-outlined text-[20px] text-slate-400">settings</span>
                Settings
              </button>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm text-red-400 transition-all"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Sign Out
            </button>
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
}
