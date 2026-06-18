import { Input } from '../../../components/Input';
import { Trash2 } from 'lucide-react';

interface SparePart {
  article: string;
  quantity: number;
}

interface SparePartsManagerProps {
  usedParts: boolean;
  setUsedParts: (val: boolean) => void;
  spareParts: SparePart[];
  updatePart: (index: number, field: 'article' | 'quantity', value: string | number) => void;
  removePartRow: (index: number) => void;
  addPartRow: () => void;
}

export function SparePartsManager({
  usedParts, setUsedParts, spareParts, updatePart, removePartRow, addPartRow
}: SparePartsManagerProps) {
  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
      <label className="flex items-center cursor-pointer mb-2">
        <input 
          type="checkbox" 
          className="w-6 h-6 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
          checked={usedParts}
          onChange={(e) => setUsedParts(e.target.checked)}
        />
        <span className="ml-3 font-extrabold text-[#0f2c59] text-lg">
          Při servisu byly použity náhradní díly
        </span>
      </label>

      {usedParts && (
        <div className="mt-6 space-y-3 animate-fadeIn">
          <div className="grid grid-cols-12 gap-4 text-xs font-bold text-gray-500 uppercase tracking-wider px-2">
            <div className="col-span-8">Artikl / Název dílu</div>
            <div className="col-span-3">Počet kusů</div>
          </div>
          
          {spareParts.map((part, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-8">
                <Input 
                  placeholder="např. Senzor T1, Pás 500mm..." 
                  value={part.article} 
                  onChange={(e) => updatePart(index, 'article', e.target.value)} 
                />
              </div>
              <div className="col-span-3">
                <Input 
                  type="number" 
                  min="1"
                  value={part.quantity} 
                  onChange={(e) => updatePart(index, 'quantity', parseInt(e.target.value))} 
                />
              </div>
              <div className="col-span-1 flex justify-center">
                <button 
                  type="button"
                  onClick={() => removePartRow(index)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  disabled={spareParts.length === 1}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}

          <button 
            type="button" 
            onClick={addPartRow}
            className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
          >
            + Přidat další díl
          </button>
        </div>
      )}
    </div>
  );
}
