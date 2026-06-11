// src/components/ProfileModal.tsx
import { useState, useEffect, type FormEvent } from 'react';
import { X, User, Mail, Shield, Save } from 'lucide-react';
import { supabase } from '../services/supabase';
import { Input } from './Input';
import { Button } from './Button';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (newName: string) => void;
}

export function ProfileModal({ isOpen, onClose, onUpdate }: ProfileModalProps) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      async function loadUserData() {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setEmail(user.email || '');
          setFullName(user.user_metadata?.name || '');
        }
      }
      loadUserData();
      setStatus(null);
    }
  }, [isOpen]);

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const { data, error } = await supabase.auth.updateUser({
      data: { name: fullName }
    });

    setLoading(false);

    if (error) {
      setStatus({ type: 'error', message: 'Chyba při ukládání: ' + error.message });
    } else {
      setStatus({ type: 'success', message: 'Profil byl úspěšně aktualizován!' });
      
      const updatedName = fullName || data.user?.email?.split('@')[0] || 'Operátor';
      onUpdate(updatedName);
      
      // VYŠLEME SIGNÁL DO CELÉ APLIKACE, ŽE SE ZMĚNIL PROFIL (pro Dashboard)
      window.dispatchEvent(new Event('profile-updated'));

      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden flex flex-col">
        <div className="bg-[#0f2c59] p-4 flex items-center justify-between text-white">
          <h3 className="font-bold flex items-center gap-2">
            <User size={20} className="text-blue-400" />
            Můj servisní profil
          </h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Mail size={12} /> Přihlašovací e-mail (Systémový)
            </label>
            <div className="w-full bg-gray-100 border border-gray-200 text-gray-500 text-sm rounded-lg p-3.5 font-medium cursor-not-allowed">
              {email}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Zobrazované jméno / Jmenovka *
            </label>
            <Input 
              type="text" 
              required 
              placeholder="např. O.ERNSTEN" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Toto jméno se bude propisovat na Dashboard a do servisních modulů.
            </p>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
            <Shield size={18} className="text-blue-600 mt-0.5 shrink-0" />
            <div className="text-xs text-blue-800 leading-relaxed">
              <strong>Oprávnění:</strong> Servisní technik / Správce aplikací. Profil je synchronizován s cloudovým šifrovaným úložištěm Netto.
            </div>
          </div>

          {status && (
            <div className={`p-3 text-xs font-bold rounded-lg text-center ${
              status.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
            }`}>
              {status.message}
            </div>
          )}

          <div className="pt-2 flex gap-3 border-t border-gray-100">
            <Button type="submit" className="flex-1 flex items-center justify-center gap-2" disabled={loading}>
              <Save size={16} />
              {loading ? 'Uklám...' : 'Uložit profil'}
            </Button>
            <button type="button" onClick={onClose} className="px-5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold rounded-lg text-sm transition-colors">
              Zavřít
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}