import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { hasInstalledApp } from '../../hooks/useDeviceMemory';

const APP_URL = window.location.origin;
const INSTALL_URL = `${APP_URL}/install`;

function AppQRCode() {
  return (
    <div className="mx-auto flex flex-col items-center gap-3">
      <div
        className="rounded-2xl p-4"
        style={{ background: '#ffffff', boxShadow: '0 0 40px rgba(0,178,255,0.25)' }}
      >
        <QRCode
          value={INSTALL_URL}
          size={160}
          bgColor="#ffffff"
          fgColor="#0a0a14"
          level="M"
        />
      </div>
      <p className="text-[10px] text-center font-mono break-all" style={{ color: 'rgba(255,255,255,0.4)' }}>
        {INSTALL_URL}
      </p>
    </div>
  );
}

export default function PWAInstallScreen() {
  const navigate = useNavigate();
  const { deviceType, installPrompt, isInstalled, triggerInstall } = usePWAInstall();

  const handleInstall = async () => {
    if (deviceType === 'android' && installPrompt) {
      await triggerInstall();
    }
  };

  const alreadyInstalled = isInstalled || hasInstalledApp();

  // ── Already installed ──────────────────────────────────────────────────────
  if (alreadyInstalled) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6"
        style={{ background: '#0A0A0A' }}>
        <div className="w-24 h-24 rounded-[2rem] flex items-center justify-center mb-6 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #00B2FF, #1a4ed8)', boxShadow: '0 8px 25px rgba(0,178,255,0.3)' }}>
          <span className="material-symbols-outlined text-white text-5xl">check_circle</span>
        </div>
        <h2 className="text-2xl font-black text-white mb-2">App Installed!</h2>
        <p className="text-sm mb-8" style={{ color: '#8E8E93' }}>
          Pocket Productions is saved to your home screen.
        </p>
        <button
          onClick={() => navigate('/home')}
          className="w-full max-w-xs font-black text-sm tracking-widest py-4 rounded-2xl"
          style={{ background: 'linear-gradient(to right, #00B2FF, #2563eb)', color: '#000' }}
        >
          OPEN APP
        </button>
      </div>
    );
  }

  // ── Desktop — redirect to phone ───────────────────────────────────────────
  if (deviceType === 'desktop') {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-16"
        style={{ background: '#080c14', fontFamily: "'Public Sans', sans-serif" }}
      >
        <div
          className="max-w-md w-full rounded-3xl p-10 flex flex-col items-center gap-6"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="w-20 h-20 rounded-[1.5rem] flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00B2FF, #1a4ed8)', boxShadow: '0 8px 25px rgba(0,178,255,0.2)' }}>
            <span className="material-symbols-outlined text-white text-4xl">smartphone</span>
          </div>

          <div>
            <h2 className="text-2xl font-black text-white mb-2">Phone only</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#8E8E93' }}>
              The Pocket Productions PWA is designed for your phone.
              Scan the code below on your mobile device to install it directly to your home screen.
            </p>
          </div>

          <AppQRCode />

          <p className="text-xs font-mono" style={{ color: '#8E8E93' }}>{INSTALL_URL}</p>

          <div className="w-full h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />

          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-xl transition-colors"
            style={{ background: 'rgba(37,123,244,0.15)', color: '#60a5fa', border: '1px solid rgba(37,123,244,0.3)' }}
          >
            <span className="material-symbols-outlined text-[18px]">monitor</span>
            Use Desktop App instead
          </button>
        </div>
      </div>
    );
  }

  // ── iOS — manual install instructions ────────────────────────────────────
  if (deviceType === 'ios') {
    return (
      <div
        className="relative min-h-screen w-full flex flex-col max-w-md mx-auto overflow-hidden"
        style={{ background: '#0A0A0A' }}
      >
        {/* Browser chrome */}
        <header className="shrink-0 border-b border-white/5 p-4 flex items-center justify-between"
          style={{ background: 'rgba(22,22,22,0.9)' }}>
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
          </div>
          <div className="rounded-lg px-4 py-1 text-xs flex items-center space-x-2 w-2/3 justify-center"
            style={{ background: 'rgba(0,0,0,0.4)', color: '#8E8E93' }}>
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path clipRule="evenodd" fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" />
            </svg>
            <span className="truncate">{APP_URL.replace('https://', '')}</span>
          </div>
          <div className="w-8" />
        </header>

        <div className="flex-1 flex items-end justify-center pb-6 relative">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <div
            className="relative w-full mx-4 rounded-[2.5rem] p-8 pb-10"
            style={{
              background: 'rgba(10,10,10,0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0,178,255,0.2)',
              boxShadow: '0 20px 50px rgba(0,178,255,0.15)',
            }}
          >
            <div className="absolute -top-12 left-1/2 -translate-x-1/2">
              <div className="w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-lg border-4"
                style={{
                  background: 'linear-gradient(135deg, #00B2FF, #1a4ed8)',
                  borderColor: '#0A0A0A',
                  boxShadow: '0 8px 25px rgba(0,178,255,0.2)',
                }}>
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
            </div>

            <div className="mt-10 text-center space-y-3">
              <h2 className="text-2xl font-black tracking-tighter text-white">Pocket Productions</h2>
              <p className="text-sm leading-relaxed" style={{ color: '#8E8E93' }}>
                Add to your iPhone home screen for instant, offline-ready access.
              </p>
            </div>

            {/* Step-by-step iOS instructions */}
            <div className="mt-6 space-y-3">
              {[
                {
                  step: '1',
                  text: 'Tap the Share button in Safari\'s toolbar',
                  icon: (
                    <span
                      className="inline-flex items-center justify-center rounded-sm shrink-0"
                      style={{ width: 22, height: 22, border: '1.5px solid #00B2FF' }}
                    >
                      <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                        <path d="M6 9V1M6 1L3 4M6 1L9 4" stroke="#00B2FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <rect x="1" y="6" width="10" height="7" rx="1" stroke="#00B2FF" strokeWidth="1.5" fill="none" />
                      </svg>
                    </span>
                  ),
                },
                {
                  step: '2',
                  text: 'Scroll down and tap "Add to Home Screen"',
                  icon: <span className="material-symbols-outlined text-[20px] shrink-0" style={{ color: '#00B2FF' }}>add_box</span>,
                },
                {
                  step: '3',
                  text: 'Tap "Add" — the app icon will appear on your home screen',
                  icon: <span className="material-symbols-outlined text-[20px] shrink-0" style={{ color: '#00B2FF' }}>check_circle</span>,
                },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-3 p-3 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                    style={{ background: '#00B2FF', color: '#000' }}>
                    {item.step}
                  </span>
                  {item.icon}
                  <p className="text-xs text-white leading-snug">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col items-center gap-2 text-[10px] uppercase tracking-widest"
              style={{ color: '#8E8E93' }}>
              <p className="flex items-center gap-1 font-bold">
                Safari only — Chrome on iOS does not support PWA install
              </p>
            </div>
          </div>
        </div>

        {/* Browser footer */}
        <footer className="shrink-0 border-t border-white/5 p-4 flex justify-between items-center"
          style={{ background: 'rgba(22,22,22,0.9)' }}>
          {['chevron_back', 'chevron_forward', 'crop_square', 'bookmark', 'grid_view'].map((icon, i) => (
            <span key={i} className="material-symbols-outlined text-[18px]" style={{ color: '#00B2FF' }}>{icon}</span>
          ))}
        </footer>
      </div>
    );
  }

  // ── Android — native install prompt ──────────────────────────────────────
  return (
    <div
      className="relative min-h-screen w-full flex flex-col max-w-md mx-auto overflow-hidden"
      style={{ background: '#0A0A0A' }}
    >
      <div className="flex-1 flex items-center justify-center p-6">
        <div
          className="w-full rounded-[2.5rem] p-8 pb-10 shadow-2xl"
          style={{
            background: 'rgba(10,10,10,0.9)',
            border: '1px solid rgba(0,178,255,0.2)',
            boxShadow: '0 20px 50px rgba(0,178,255,0.15)',
          }}
        >
          {/* App icon */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #00B2FF, #1a4ed8)',
                boxShadow: '0 8px 25px rgba(0,178,255,0.3)',
                animation: 'float 4s ease-in-out infinite',
              }}>
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
          </div>

          <div className="text-center space-y-3 mb-8">
            <h2 className="text-3xl font-black tracking-tighter text-white">Pocket Productions</h2>
            <p className="text-sm leading-relaxed px-4" style={{ color: '#8E8E93' }}>
              Deploy your production workflow as a native experience. Zero-latency access, even when the set goes offline.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-8">
            {[
              { icon: 'bolt', title: 'Instant Loading', desc: 'Launch directly from your home screen' },
              { icon: 'cloud_off', title: 'Offline Access', desc: 'Access scripts and call sheets without signal' },
              { icon: 'notifications', title: 'Push Notifications', desc: 'Get call sheet and schedule alerts' },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-4 p-3 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(0,178,255,0.2)', color: '#00B2FF' }}>
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{item.title}</p>
                  <p className="text-xs" style={{ color: '#8E8E93' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {installPrompt ? (
            <button
              onClick={handleInstall}
              className="w-full font-black text-sm tracking-widest py-5 rounded-2xl transition-all active:scale-[0.97]"
              style={{
                background: 'linear-gradient(to right, #00B2FF, #2563eb)',
                boxShadow: '0 10px 25px rgba(0,178,255,0.4)',
                color: '#000',
              }}
            >
              ADD TO HOME SCREEN
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-center text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#8E8E93' }}>
                Manual Install — Chrome
              </p>
              {[
                { step: '1', icon: 'more_vert', text: 'Tap the ⋮ menu in the top-right corner of Chrome' },
                { step: '2', icon: 'add_to_home_screen', text: 'Tap "Add to Home screen"' },
                { step: '3', icon: 'check_circle', text: 'Tap "Add" — the icon will appear on your home screen' },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-3 p-3 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                    style={{ background: '#00B2FF', color: '#000' }}>
                    {item.step}
                  </span>
                  <span className="material-symbols-outlined text-[20px] shrink-0" style={{ color: '#00B2FF' }}>{item.icon}</span>
                  <p className="text-xs text-white leading-snug">{item.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}
