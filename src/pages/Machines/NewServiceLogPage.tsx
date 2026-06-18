import { useParams, Link } from 'react-router-dom';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { ArrowLeft, Wrench, Upload } from 'lucide-react';
import { useNewServiceLog, WORK_TYPES } from '../../features/machines/hooks/useNewServiceLog';
import { SparePartsManager } from '../../features/machines/components/SparePartsManager';
import { TechnicianSelector } from '../../features/machines/components/TechnicianSelector';

export function NewServiceLogPage() {
  const { id } = useParams();
  
  const {
    logDate, setLogDate,
    techniciansList,
    selectedTechnicians, setSelectedTechnicians,
    selectedWorkTypes, setSelectedWorkTypes,
    description, setDescription,
    timeSpent, setTimeSpent,
    usedParts, setUsedParts,
    spareParts,
    status,
    file, setFile,
    toggleSelection,
    addPartRow,
    removePartRow,
    updatePart,
    handleSubmit
  } = useNewServiceLog(id);

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
              
              <TechnicianSelector 
                techniciansList={techniciansList}
                selectedTechnicians={selectedTechnicians}
                setSelectedTechnicians={setSelectedTechnicians}
                toggleSelection={toggleSelection}
              />
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
            <SparePartsManager 
              usedParts={usedParts}
              setUsedParts={setUsedParts}
              spareParts={spareParts}
              updatePart={updatePart}
              removePartRow={removePartRow}
              addPartRow={addPartRow}
            />

            {/* 4. PŘÍLOHY (FOTKY / PROTOKOLY) */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Příloha (Foto, Scannovaný protokol)</h3>
              <div className="p-4 border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group">
                <label className="flex flex-col items-center justify-center cursor-pointer py-4">
                  <div className="p-3 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                    <Upload size={24} className="text-blue-500" />
                  </div>
                  <span className="mt-3 font-bold text-gray-700">Vybrat soubor k nahrání...</span>
                  <span className="text-xs text-gray-400 mt-1">JPEG, PNG, PDF (max 5MB)</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                    accept="image/*,.pdf"
                  />
                </label>
                {file && (
                  <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg text-sm text-center font-bold text-blue-700">
                    ✅ Vybrán soubor: {file.name}
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full justify-center">Uložit servisní záznam a nahrát data</Button>

            {status && (
              <p className={`mt-4 text-sm font-semibold p-3 rounded-lg ${status.includes('Chyba') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                {status}
              </p>
            )}
            
          </form>
        </div>
      </div>
    </div>
  );
}