import { useState, useEffect } from 'react';
import { useNetwork } from '../hooks/useNetwork';
import { processOfflineQueue } from '../services/syncService';

export function OfflineBanner() {
  const { isOnline } = useNetwork();
  const [bannerState, setBannerState] = useState<'hidden' | 'offline_expanded' | 'offline_minimized' | 'online' | 'closing'>('hidden');

  // MOZEK 1: Reaguje pouze na výpadek/naskočení sítě
  useEffect(() => {
    if (isOnline === false) {
      setBannerState('offline_expanded'); // Spadl net -> plné okno
    } else if (isOnline === true) {
      // 🚀 ZÁCHRANA DAT: Jakmile naskočí net (i při prvním spuštění aplikace), zavoláme Skladníka!
      processOfflineQueue();
      
      // Přepnutí UI okna
      setBannerState(prev => (prev !== 'hidden' ? 'online' : 'hidden'));
    }
  }, [isOnline]);


  // MOZEK 2: Stará se čistě o časování a schovávání
  useEffect(() => {
    let timer: number | ReturnType<typeof setTimeout>;

    if (bannerState === 'offline_expanded') {
      // 1. Zmenšit do rohu po 4 vteřinách
      timer = setTimeout(() => setBannerState('offline_minimized'), 4000);
    } else if (bannerState === 'online') {
      // 2. Zelená svítí 2.5 vteřiny, pak zapne animaci zavírání
      timer = setTimeout(() => setBannerState('closing'), 2500);
    } else if (bannerState === 'closing') {
      // 3. Počká 500ms na dojetí CSS animace a fyzicky okno smaže z obrazovky
      timer = setTimeout(() => setBannerState('hidden'), 500);
    }

    // Úklid starého časovače
    return () => clearTimeout(timer);
  }, [bannerState]);

  if (bannerState === 'hidden') return null;

  // VYKRESLENÍ: Minimalizovaný trojúhelník v rohu
  if (bannerState === 'offline_minimized') {
    return (
      <div 
        onClick={() => setBannerState('offline_expanded')} 
        className="fixed bottom-0 right-0 z-50 cursor-pointer animate-slide-in-up group"
        title="Jsi offline. Klikni pro detaily."
      >
        <div className="w-16 h-16 bg-red-600 shadow-2xl rounded-tl-full flex items-end justify-end p-3 transition-transform group-hover:scale-110">
          <span className="text-xl animate-pulse">⚠️</span>
        </div>
      </div>
    );
  }

  // VYKRESLENÍ: Plné varovné/úspěšné okno
  return (
    <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-lg shadow-2xl w-80 
      ${bannerState === 'closing' ? 'animate-slide-out-down' : 'animate-slide-in-up'}
      ${bannerState === 'offline_expanded' ? 'bg-red-600' : 'bg-green-600'} text-white transition-all`}>
      
      <div className="flex items-center gap-3">
        <span className="text-xl">{bannerState === 'offline_expanded' ? '⚠️' : '✅'}</span>
        
        <div className="flex-1">
          <p className="font-bold text-sm">
            {bannerState === 'offline_expanded' ? 'Offline režim' : 'Jsi zpět online!'}
          </p>
          <p className="text-xs opacity-90">
            {bannerState === 'offline_expanded' 
              ? 'Data se dočasně ukládají do zařízení.' 
              : 'Spojení úspěšně obnoveno.'}
          </p>
        </div>

        {bannerState === 'offline_expanded' && (
          <button 
            onClick={() => setBannerState('offline_minimized')}
            className="text-white opacity-60 hover:opacity-100 p-2 -mr-2 text-lg font-bold"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}