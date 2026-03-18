import QRCode from 'react-qr-code';
import DesktopLayout from '../../components/DesktopLayout';

const APP_URL = window.location.origin;

export default function DesktopInstall() {
  return (
    <DesktopLayout>
      <section className="flex-1 flex items-center justify-center p-8 relative overflow-hidden min-h-full">
        {/* Background glow blobs */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'rgba(37,123,244,0.06)', filter: 'blur(120px)', transform: 'translate(40%, -40%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'rgba(37,123,244,0.06)', filter: 'blur(100px)', transform: 'translate(-40%, 40%)' }}
        />

        {/* Main panel */}
        <div
          className="max-w-lg w-full rounded-2xl p-12 flex flex-col items-center relative z-10 shadow-2xl"
          style={{
            background: 'rgba(26,34,46,0.7)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          {/* Branding */}
          <div className="mb-8 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(37,123,244,0.12)' }}>
              <span className="material-symbols-outlined text-blue-400" style={{ fontSize: 36 }}>movie_filter</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Pocket Productions</h2>
            <p className="text-slate-400 text-sm mt-1">Mobile Production Suite</p>
          </div>

          {/* QR Code */}
          <div
            className="rounded-xl p-6 mb-10 transition-transform duration-500 hover:scale-[1.02]"
            style={{ background: '#ffffff', boxShadow: '0 0 40px rgba(37,123,244,0.2)' }}
          >
            <div className="relative w-64 h-64 flex items-center justify-center">
              <QRCode
                value={APP_URL}
                size={256}
                bgColor="#ffffff"
                fgColor="#080c14"
                level="M"
              />
              {/* Center logo overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white rounded-lg p-1.5 shadow-sm">
                  <span className="material-symbols-outlined text-blue-500" style={{ fontSize: 22 }}>movie_filter</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-2 uppercase tracking-wider">Scan to Install PWA</h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-[280px]">
              Open your camera or QR scanner to download the desktop and mobile application directly.
            </p>
          </div>

          {/* Platform badges */}
          <div className="mt-8 flex gap-6 text-slate-500">
            {[
              { icon: 'phone_iphone', label: 'iOS' },
              { icon: 'android', label: 'Android' },
              { icon: 'laptop_mac', label: 'Desktop' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">{icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-slate-600">
          <span className="h-px w-8 bg-slate-800 inline-block" />
          <span className="text-[10px] uppercase tracking-[0.3em]">Secure Production Encrypted</span>
          <span className="h-px w-8 bg-slate-800 inline-block" />
        </div>
      </section>
    </DesktopLayout>
  );
}
