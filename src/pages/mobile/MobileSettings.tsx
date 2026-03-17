import { useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { clearDeviceMemory, getDeviceMemory } from '../../hooks/useDeviceMemory';
import BottomNav from '../../components/BottomNav';

interface SettingRow {
  icon: string;
  label: string;
  sublabel?: string;
  action?: () => void;
  color?: string;
  rightEl?: React.ReactNode;
}

function Section({ title, rows }: { title: string; rows: SettingRow[] }) {
  return (
    <section className="px-5 space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">{title}</p>
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        {rows.map((row, i) => (
          <button
            key={row.label}
            onClick={row.action}
            className="w-full flex items-center gap-4 px-4 py-4 text-left transition-colors active:bg-white/5"
            style={{
              background: 'rgba(255,255,255,0.04)',
              borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            }}
          >
            <div
              className="size-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: (row.color ?? '#ec5b13') + '18' }}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ color: row.color ?? '#ec5b13' }}
              >
                {row.icon}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">{row.label}</p>
              {row.sublabel && <p className="text-xs text-slate-500 mt-0.5">{row.sublabel}</p>}
            </div>
            {row.rightEl ?? (
              <span className="material-symbols-outlined text-[18px] text-slate-600">chevron_right</span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

export default function MobileSettings() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();

  const name = user?.fullName ?? user?.firstName ?? 'Producer';
  const email = user?.primaryEmailAddress?.emailAddress ?? '';
  const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  const deviceTrusted = !!getDeviceMemory();

  const handleSignOut = () => signOut(() => navigate('/login'));

  const handleForgetDevice = () => {
    clearDeviceMemory();
    navigate('/login');
  };

  const accountRows: SettingRow[] = [
    {
      icon: 'person',
      label: 'Profile',
      sublabel: email,
      color: '#3b82f6',
      action: () => {},
    },
    {
      icon: 'notifications',
      label: 'Notifications',
      sublabel: 'Push alerts for crew & schedule',
      color: '#f59e0b',
      action: () => {},
    },
    {
      icon: 'lock',
      label: 'Security',
      sublabel: 'Password & two-factor auth',
      color: '#10b981',
      action: () => {},
    },
  ];

  const deviceRows: SettingRow[] = [
    {
      icon: 'smartphone',
      label: 'This Device',
      sublabel: deviceTrusted ? 'Trusted · Remembered for 1 year' : 'Not remembered',
      color: deviceTrusted ? '#10b981' : '#64748b',
      rightEl: deviceTrusted ? (
        <span
          className="text-[10px] font-black px-2 py-1 rounded-full"
          style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}
        >
          Trusted
        </span>
      ) : undefined,
      action: () => {},
    },
    ...(deviceTrusted
      ? [{
          icon: 'phonelink_erase',
          label: 'Forget This Device',
          sublabel: 'You will need to sign in again',
          color: '#ef4444',
          action: handleForgetDevice,
        } as SettingRow]
      : []),
  ];

  const appRows: SettingRow[] = [
    {
      icon: 'info',
      label: 'About',
      sublabel: 'Pocket Productions v1.0.4',
      color: '#64748b',
      action: () => {},
    },
    {
      icon: 'install_mobile',
      label: 'Install App',
      sublabel: 'Add to your home screen',
      color: '#3b82f6',
      action: () => navigate('/install'),
    },
  ];

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
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="size-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <span className="material-symbols-outlined text-white text-[20px]">arrow_back</span>
          </button>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Account</p>
            <h1 className="text-xl font-black text-white leading-tight">Settings</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-28 pt-6 space-y-6">
        {/* Profile card */}
        <div className="px-5">
          <div
            className="flex items-center gap-4 rounded-2xl p-5"
            style={{
              background: 'linear-gradient(135deg, rgba(236,91,19,0.12), rgba(37,123,244,0.08))',
              border: '1px solid rgba(236,91,19,0.2)',
            }}
          >
            <div
              className="size-16 rounded-2xl flex items-center justify-center text-white text-xl font-black shrink-0"
              style={{ background: 'linear-gradient(135deg, #ec5b13, #c0410a)' }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-black text-base truncate">{name}</p>
              <p className="text-slate-400 text-sm truncate">{email}</p>
              <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400">
                Executive Producer
              </span>
            </div>
          </div>
        </div>

        <Section title="Account" rows={accountRows} />
        <Section title="This Device" rows={deviceRows} />
        <Section title="App" rows={appRows} />

        {/* Sign out */}
        <div className="px-5">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98]"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#ef4444',
            }}
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Sign Out
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
