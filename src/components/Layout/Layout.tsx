import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Users, Server, Settings, LogOut } from 'lucide-react';
import { supabase } from '../../services/supabase';

export function Layout() {
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Pomocná funkce pro zjištění, zda je odkaz zrovna aktivní
  const isActive = (path: string) => location.pathname === path;

  // Společný styl pro položky menu
  const linkStyle = (path: string) => `
    flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors
    ${isActive(path) 
      ? 'bg-blue-600 text-white shadow-md' 
      : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
  `;

  return (
    <div className="flex h-screen bg-gray-50">
      
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
        </nav>

        {/* Spodní část s nastavením a odhlášením */}
        <div className="p-4 border-t border-gray-700 space-y-2">
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

      {/* HLAVNÍ OBSAHOVÁ ČÁST (Zde se budou střídat stránky) */}
      <div className="flex-1 overflow-auto">
        <Outlet /> {/* <-- Tohle je magické místo, kam React Router vloží danou stránku */}
      </div>

    </div>
  );
}