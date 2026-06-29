import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Users, Server, Settings, LogOut, User as UserIcon, CalendarDays } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { ProfileModal } from '../ProfileModal'; // <-- IMPORT NOVÉHO MODALU
import { OfflineBanner } from '../OfflineBanner';
import { useAuth } from '../../contexts/AuthContext';

export function Layout() {
  const location = useLocation();
  const { operatorName } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // Stav pro otevření okna

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const isActive = (path: string) => location.pathname === path;

  const linkStyle = (path: string) => `
    flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors
    ${isActive(path) 
      ? 'bg-blue-600 text-white shadow-md' 
      : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
  `;

  return (
    <div className="flex h-screen bg-gray-50">
      <OfflineBanner />
      {/* LEVÝ BOČNÍ PANEL (Sidebar) */}
      <div className="w-64 bg-[#0f2c59] text-white flex flex-col shadow-xl z-10 hidden md:flex">
        {/* Logo */}
        <div className="p-6 mb-4">
          <div className="text-2xl font-extrabold tracking-tight text-white">
            NETTO <span className="text-blue-400">SERVIS</span>
          </div>
        </div>

        {/* Navigace */}
        <nav className="flex-1 px-4 space-y-2">
          <Link to="/" className={linkStyle('/')}>
            <Home size={20} />
            Dashboard
          </Link>
          <Link to="/zakaznici" className={linkStyle('/zakaznici')}>
            <Users size={20} />
            Zákazníci
          </Link>
          <Link to="/stroje" className={linkStyle('/stroje')}>
            <Server size={20} />
            Stroje
          </Link>
          <Link to="/kalendar" className={linkStyle('/kalendar')}>
            <CalendarDays size={20} />
            Kalendář
          </Link>
        </nav>

        {/* Spodní část */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          
          {/* AKTUALIZOVÁNO: Klikací widget uživatele (změněno na button pro přístupnost a přidán onClick) */}
          <button 
            onClick={() => setIsProfileModalOpen(true)}
            className="w-full text-left mb-2 px-4 py-3 bg-[#0a1e3f] hover:bg-[#112d5c] border border-blue-900/50 rounded-lg flex items-center gap-3 transition-all group cursor-pointer"
            title="Kliknutím upravíte svůj profil"
          >
            <div className="bg-blue-600 group-hover:bg-blue-500 p-1.5 rounded-full text-white shrink-0 transition-colors">
              <UserIcon size={16} />
            </div>
            <div className="overflow-hidden">
              <div className="text-[10px] text-blue-300 font-bold uppercase tracking-wider group-hover:text-blue-400 transition-colors">
                Přihlášený uživatel
              </div>
              <div className="text-sm font-semibold text-white truncate" title={operatorName}>
                {operatorName}
              </div>
            </div>
          </button>

          <Link to="/nastaveni" className={linkStyle('/nastaveni')}>
            <Settings size={20} />
            Nastavení
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-gray-400 hover:bg-red-500 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            Odhlásit se
          </button>
        </div>
      </div>

      {/* HLAVNÍ OBSAHOVÁ ČÁST */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>

      {/* STRUKTURÁLNÍ MODAL OKNO */}
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />

    </div>
  );
}