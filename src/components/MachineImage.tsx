import { useState, useEffect } from 'react';
import { Server } from 'lucide-react';
import { supabase } from '../services/supabase';

interface MachineImageProps {
  model: string;
  className?: string;
  size?: number;
}

export function MachineImage({ model, className = '', size = 48 }: MachineImageProps) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!model) {
      setHasError(true);
      return;
    }

    // 1. Převedeme název modelu na formát souboru (malá písmena, mezery na pomlčky)
    // Např. "ComScale 400" -> "comscale-400.png"
    // Odstraníme speciální znaky kromě písmen, čísel a pomlček
    const formattedName = model
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-') // Vše co není písmeno/číslo/pomlčka nahradí pomlčkou
      .replace(/-+/g, '-') // Odstraní vícenásobné pomlčky
      .replace(/^-|-$/g, '') + '.jpg'; // Odstraní pomlčky na začátku/konci a přidá .jpg

    // 2. Získáme veřejnou URL z bucketu 'machine-models'
    const { data } = supabase.storage
      .from('machine-models')
      .getPublicUrl(formattedName);

    setImgUrl(data.publicUrl);
    setHasError(false);
  }, [model]);

  // Pokud došlo k chybě (obrázek neexistuje), nebo ještě není URL, zobrazíme fallback ikonu
  if (hasError || !imgUrl) {
    return (
      <div 
        className={`flex items-center justify-center bg-blue-50 border border-blue-100 rounded-xl text-blue-600 shrink-0 ${className}`}
        style={{ width: size, height: size }}
        title={`Obrázek pro ${model} nebyl nalezen`}
      >
        <Server size={size * 0.5} />
      </div>
    );
  }

  // Zkusíme načíst obrázek. Pokud prohlížeč vrátí 404, spustí se onError a přepneme na fallback
  return (
    <div 
      className={`bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={imgUrl}
        alt={`Stroj ${model}`}
        className="w-full h-full object-contain p-1 transition-transform hover:scale-110"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
