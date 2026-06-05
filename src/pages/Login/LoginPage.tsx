import { useState, type FormEvent } from 'react';
import { User, Lock } from 'lucide-react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { signInWithEmail } from '../../services/signInWithEmail';

export function LoginPage() {
  // Stavy pro uložení hodnot z políček
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Stavy pro hlídání načítání a případné chyby
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Funkce, která se spustí při odeslání formuláře
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    // Voláme naši striktně oddělenou přihlašovací funkci
    const { error } = await signInWithEmail(email, password);

    setLoading(false);

    if (error) {
      // Pokud Supabase vrátí chybu (např. špatné heslo)
      setErrorMessage('Nesprávný e-mail nebo heslo.');
      return;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl">
        
        {/* LEVÁ ČÁST - Modrý panel */}
        <div className="hidden md:flex md:w-1/2 bg-blue-600 p-12 flex-col justify-center relative overflow-hidden text-white">
          <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-blue-700 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl font-extrabold mb-2 tracking-tight">WELCOME BACK</h1>
            <p className="text-blue-100 text-sm leading-relaxed mb-6">
              Servisní a evidenční systém pro zařízení Wipotec. Přihlaste se pro správu zákazníků a servisních deníků.
            </p>
          </div>
        </div>

        {/* PRAVÁ ČÁST - Formulář */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
          
          {/* Textové logo Netto Servis */}
          <div className="flex justify-center mb-8">
            <div className="text-3xl font-extrabold tracking-tight text-[#0f2c59]">
              NETTO <span className="text-blue-500">SERVIS</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Přihlášení</h2>

          {/* Zobrazení chyby, pokud se přihlášení nepovede */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input 
              type="email" 
              placeholder="E-mail technika" 
              icon={<User size={18} />} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            
            <Input 
              type="password" 
              placeholder="Heslo" 
              icon={<Lock size={18} />} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />

            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center text-xs text-gray-500 cursor-pointer">
                <input type="checkbox" className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                Zapamatovat si mě
              </label>
              <a href="#" className="text-xs text-blue-600 font-semibold hover:underline">
                Zapomenuté heslo?
              </a>
            </div>

            <Button type="submit" variant="primary" className="mb-4" disabled={loading}>
              {loading ? 'Ověřování...' : 'Přihlásit se'}
            </Button>
            
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="px-3 text-xs text-gray-400">Nebo</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <Button type="button" variant="outline" disabled={loading}>
              Přihlásit se firemním účtem
            </Button>
          </form>

        </div>
      </div>
    </div>
  );
}