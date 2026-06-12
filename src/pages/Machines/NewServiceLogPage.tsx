import { useState, type FormEvent, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { ArrowLeft, Wrench, Plus, Trash2, Upload } from 'lucide-react';
import { createServiceLog, uploadAttachment } from '../../services/serviceLogService';
import { getActiveTechnicians } from '../../services/technicianService';

// TADY MI PAK MŮŽEŠ NAPSAT SVŮJ SEZNAM A JÁ TI HO TAM DOPLNÍM:


const WORK_TYPES = [
  'Profylaxe / Údržba',
  'Oprava / Porucha',
  'Instalace / Uvedení do provozu',
  'MID Ověření / Kalibrace',
  'Školení obsluhy'
];

export function NewServiceLogPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);

  const [techniciansList, setTechniciansList] = useState<string[]>([]);
  useEffect(() => {
    async function loadTechnicians() {
      const { data } = await getActiveTechnicians();
      if (data) {
        setTechniciansList(data.map(t => t.name));
      }
    }
    loadTechnicians();
  }, []);
  
  // Místo jednoho textu ukládáme pole (abychom mohli vybrat vícero)
  const [selectedTechnicians, setSelectedTechnicians] = useState<string[]>(['O.ERNSTEN']); 
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<string[]>(['Profylaxe / Údržba']);
  
  const [description, setDescription] = useState('');
  const [timeSpent, setTimeSpent] = useState('');
  
  // Stavy pro náhradní díly
  const [usedParts, setUsedParts] = useState(false);
  const [spareParts, setSpareParts] = useState<{ article: string, quantity: number }[]>([
    { article: '', quantity: 1 }
  ]);

  const [status, setStatus] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null); // NOVÉ: Stav pro vybraný soubor

  // Funkce pro práci s polem techniků a prací
  const toggleSelection = (item: string, currentList: string[], setList: (val: string[]) => void) => {
    if (currentList.includes(item)) {
      setList(currentList.filter(i => i !== item));
    } else {
      setList([...currentList, item]);
    }
  };

  // Funkce pro přidání/odebrání/úpravu řádku náhradního dílu
  const addPartRow = () => setSpareParts([...spareParts, { article: '', quantity: 1 }]);
  
  const removePartRow = (index: number) => {
    const newParts = [...spareParts];
    newParts.splice(index, 1);
    setSpareParts(newParts);
  };
  
  const updatePart = (index: number, field: 'article' | 'quantity', value: any) => {
    const newParts = [...spareParts];
    newParts[index] = { ...newParts[index], [field]: value };
    setSpareParts(newParts);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (selectedTechnicians.length === 0) {
      setStatus('Musíš vybrat alespoň jednoho technika.');
      return;
    }
    if (selectedWorkTypes.length === 0) {
      setStatus('Musíš vybrat alespoň jeden druh práce.');
      return;
    }
    
    setStatus('Nahrávám data (to může chvíli trvat, pokud je připojena fotka)...');
    
    let finalAttachmentUrl = null;

    // Pokud uživatel vybral soubor, nejdřív ho nahrajeme
    if (file) {
      const { url, error: uploadError } = await uploadAttachment(file);
      if (uploadError) {
        setStatus('Chyba při nahrávání souboru: ' + uploadError.message);
        return;
      }
      finalAttachmentUrl = url;
    }

    const techString = selectedTechnicians.join(', ');
    const workString = selectedWorkTypes.join(', ');
    const finalParts = usedParts ? spareParts.filter(p => p.article.trim() !== '') : [];

    // Odeslání do databáze včetně URL přílohy
    const { error } = await createServiceLog(id, logDate, techString, workString, description, timeSpent, finalParts, finalAttachmentUrl);
    
    if (error) {
      setStatus('Chyba: ' + error.message);
    } else {
      navigate(`/stroje/${id}/servis`);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      
      <div className="mb-6">
        <Link to={`/stroje/detail/${id}`} className="text-gray-500 hover:text-[#0f2c59] transition-colors flex items-center gap-2 font-semibold">
          <ArrowLeft size={20} />
          Zpět na kartu stroje
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#0f2c59] p-6 text-white flex items-center gap-4">
          <Wrench size={32} className="text-blue-400" />
          <div>
            <h1 className="text-2xl font-extrabold">Nový servisní záznam</h1>
            <p className="text-blue-200 text-sm mt-1">Vyplňte detaily o provedeném zásahu a použitých dílech.</p>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. KDO A KDY */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Základní údaje</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Datum zásahu</label>
                  <Input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Čas strávený na místě (v hodinách)</label>
                  <Input type="number" step="0.5" placeholder="např. 1.5" value={timeSpent} onChange={(e) => setTimeSpent(e.target.value)} />
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Zasahující technici (možno vybrat více)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {techniciansList.map((tech) => (
                    <label key={tech} className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedTechnicians.includes(tech) ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}>
                      <input 
                        className="hidden"
                        checked={selectedTechnicians.includes(tech)}
                        onChange={() => toggleSelection(tech, selectedTechnicians, setSelectedTechnicians)}
                      />
                      {tech}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. CO SE DĚLALO */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Povaha práce</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {WORK_TYPES.map((type) => (
                  <label key={type} className="flex items-center p-3 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:bg-blue-50 transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                      checked={selectedWorkTypes.includes(type)}
                      onChange={() => toggleSelection(type, selectedWorkTypes, setSelectedWorkTypes)}
                    />
                    <span className="ml-3 font-medium text-gray-800 text-sm">{type}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Kompletní popis práce *</label>
                <textarea
                  required
                  placeholder="Popište detailně, co se na zařízení dělalo, závady, opravy..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block p-3.5 outline-none transition-all resize-none"
                />
              </div>
            </div>

            {/* 3. NÁHRADNÍ DÍLY */}
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
                          disabled={spareParts.length === 1} // Nenecháme smazat poslední řádek
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    type="button" 
                    onClick={addPartRow}
                    className="mt-4 flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors px-2"
                  >
                    <Plus size={16} /> Přidat další díl
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center gap-4">
              <Button type="submit" className="w-full sm:w-auto px-12 py-3">Uložit servisní záznam</Button>
              {status && (
                <span className="text-sm font-semibold text-red-600">
                  {status}
                </span>
              )}
            </div>

            {/* 4. PŘÍLOHA / FOTOGRAFIE */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                <Upload size={18} className="text-blue-600" />
                Fotodokumentace / Příloha
              </h3>
              <div className="bg-gray-50 border border-gray-200 border-dashed rounded-xl p-6 text-center">
                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                <p className="text-xs text-gray-400 mt-2">Podporované formáty: JPG, PNG, PDF. Max velikost doporučena do 5 MB.</p>
              </div>
            </div>

          </form>
        </div>
      </div>

    </div>
  );
}