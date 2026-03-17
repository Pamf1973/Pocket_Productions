import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type DeviceType = 'ios' | 'android' | 'desktop';

// Module-level singleton — survives component unmount/remount and page navigation.
// The `beforeinstallprompt` event fires at most once per session; storing it here
// ensures any component that mounts later can still access it.
let _deferredPrompt: BeforeInstallPromptEvent | null = null;
let _isInstalled = false;
const _listeners = new Set<() => void>();

function notify() {
  _listeners.forEach((fn) => fn());
}

// Register the global listener once, outside any component lifecycle.
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    _deferredPrompt = e as BeforeInstallPromptEvent;
    notify();
  });

  window.addEventListener('appinstalled', () => {
    _isInstalled = true;
    _deferredPrompt = null;
    notify();
  });
}

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(_deferredPrompt);
  const [isInstalled, setIsInstalled] = useState(_isInstalled);
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');

  useEffect(() => {
    // Detect device
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as Record<string, unknown>).MSStream;
    const isAndroid = /Android/.test(ua);
    if (isIOS) setDeviceType('ios');
    else if (isAndroid) setDeviceType('android');
    else setDeviceType('desktop');

    // Check if already running as installed PWA
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as Record<string, unknown>).standalone === true
    ) {
      setIsInstalled(true);
    }

    // Subscribe to singleton updates
    const onUpdate = () => {
      setInstallPrompt(_deferredPrompt);
      setIsInstalled(_isInstalled);
    };
    _listeners.add(onUpdate);
    return () => { _listeners.delete(onUpdate); };
  }, []);

  const triggerInstall = async () => {
    if (!_deferredPrompt) return false;
    await _deferredPrompt.prompt();
    const { outcome } = await _deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      _isInstalled = true;
      _deferredPrompt = null;
      setIsInstalled(true);
      setInstallPrompt(null);
    }
    return outcome === 'accepted';
  };

  return { installPrompt, isInstalled, deviceType, triggerInstall };
}
