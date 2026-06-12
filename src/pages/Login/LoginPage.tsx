import { useState } from 'react';
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck, AlertTriangle } from 'lucide-react';
import { signInWithEmail } from '../../services/signInWithEmail';
import packageInfo from '../../../package.json';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: loginError } = await signInWithEmail(email, password);
    
    if (loginError) {
      setError('Nesprávné přihlašovací údaje nebo chyba připojení.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* LEVÁ STRANA: Firemní branding */}
      <div className="hidden lg:flex flex-1 bg-[#0f2c59] flex-col justify-center px-12 text-white">
        <div className="max-w-md">
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">Netto<br />Servisní modul</h1>
          <p className="text-blue-200 text-lg mb-10">Profesionální správa a diagnostika váhových systémů Wipotec přímo ve vašich rukou.</p>
          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
            <ShieldCheck size={32} className="text-blue-400" />
            <div>
              <p className="font-bold">Zabezpečený přístup</p>
              <p className="text-xs text-blue-200">Data jsou šifrována a uložena v cloudu.</p>
            </div>
          </div>
        </div>
      </div>

      {/* PRAVÁ STRANA: Formulář */}
      <div className="flex-1 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Vítejte zpět</h2>
            <p className="text-gray-500">Zadejte své údaje pro přístup do systému</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                  placeholder="technik@vahynetto.cz"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Heslo</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-lg border border-red-100 flex items-center gap-2 animate-shake">
                <AlertTriangle size={16} /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0f2c59] hover:bg-[#1a3a6e] text-white py-3.5 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Přihlásit se'}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-400 uppercase tracking-widest">
            Netto Servis {packageInfo.version}
          </p>
        </div>
      </div>
    </div>
  );
}