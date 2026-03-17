import { useEffect, useState } from 'react';

export default function UpdateBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'SW_UPDATED') {
        setShow(true);
      }
    };

    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl"
      style={{
        background: 'rgba(15,20,30,0.95)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(236,91,19,0.3)',
        maxWidth: 'calc(100vw - 2rem)',
      }}
    >
      <span className="material-symbols-outlined text-[20px]" style={{ color: '#ec5b13' }}>
        system_update
      </span>
      <p className="text-sm font-bold text-white">New version available</p>
      <button
        onClick={() => window.location.reload()}
        className="px-3 py-1.5 rounded-xl text-xs font-black text-white ml-1"
        style={{ background: 'linear-gradient(135deg, #ec5b13, #c0410a)' }}
      >
        Update
      </button>
      <button
        onClick={() => setShow(false)}
        className="material-symbols-outlined text-[18px]"
        style={{ color: 'rgba(255,255,255,0.3)' }}
      >
        close
      </button>
    </div>
  );
}
