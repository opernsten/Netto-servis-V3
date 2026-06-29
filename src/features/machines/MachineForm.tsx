import { useState } from 'react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { MACHINE_STATUSES } from '../../utils/statusConfig';
import { useMachineForm } from './hooks/useMachineForm';

export function MachineForm({ machineId }: { machineId?: string }) {
  const { formData, handleChange, handleSubmit, customers, formStatus, navigate } = useMachineForm(machineId);
  const [isCustomModel, setIsCustomModel] = useState(() => {
    // Pokud editujeme a model není ze základní nabídky, rovnou zobrazíme custom input
    return formData.model && !['HC-M', 'HC-A', 'EC-E', 'TQS-HC-A', 'X-Ray'].includes(formData.model);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. Identifikace a Vlastnictví */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Základní identifikace</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Provozovatel (Zákazník) *</label>
            <select 
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block p-3.5 outline-none transition-all"
              value={formData.customerId}
              onChange={(e) => handleChange('customerId', e.target.value)}
              required
            >
              <option value="" disabled>-- Vyber zákazníka ze seznamu --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Aktuální stav zařízení</label>
            <select 
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block p-3.5 outline-none transition-all"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              {MACHINE_STATUSES.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Model stroje *</label>
            <div className="space-y-3">
              <select 
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block p-3.5 outline-none transition-all"
                value={isCustomModel ? 'Jiný...' : (formData.model || '')}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'Jiný...') {
                    setIsCustomModel(true);
                    handleChange('model', '');
                  } else {
                    setIsCustomModel(false);
                    handleChange('model', val);
                  }
                }}
                required={!isCustomModel}
              >
                <option value="" disabled>-- Vyberte model --</option>
                <option value="HC-M">HC-M</option>
                <option value="HC-A">HC-A</option>
                <option value="EC-E">EC-E</option>
                <option value="TQS-HC-A">TQS-HC-A</option>
                <option value="X-Ray">X-Ray</option>
                <option value="Jiný...">Jiný model...</option>
              </select>

              {isCustomModel && (
                <div className="animate-fadeIn">
                  <Input 
                    placeholder="Zadejte název jiného modelu (např. ComScale 400)" 
                    value={formData.model} 
                    onChange={(e) => handleChange('model', e.target.value)} 
                    required 
                    autoFocus
                  />
                </div>
              )}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sériové číslo (S/N) *</label>
            <Input 
              placeholder="Zadejte S/N ze štítku (max 7 číslic)" 
              value={formData.serialNumber} 
              onChange={(e) => {
                const val = e.target.value;
                // Povolí pouze prázdný řetězec nebo jen čísla o maximální délce 7 znaků
                if (val === '' || (/^\d+$/.test(val) && val.length <= 7)) {
                  handleChange('serialNumber', val);
                }
              }} 
              required 
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Dodavatel zařízení *</label>
            <Input placeholder="např. Netto Electronics" value={formData.supplier} onChange={(e) => handleChange('supplier', e.target.value)} required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Rok výroby *</label>
            <Input type="number" placeholder="RRRR" value={formData.productionYear} onChange={(e) => handleChange('productionYear', e.target.value)} min="1990" max="2050" required />
          </div>
        </div>
      </div>

      {/* 2. Umístění, technické parametry a termíny */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Umístění a provozní parametry</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Přesné umístění v provozu (Linka, hala, sekce)</label>
            <Input placeholder="např. Balicí linka č. 3 - Expedice sladkostí" value={formData.placementLine} onChange={(e) => handleChange('placementLine', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Datum instalace</label>
            <Input type="date" value={formData.installationDate} onChange={(e) => handleChange('installationDate', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Záruka do</label>
            <Input type="date" value={formData.warrantyUntil} onChange={(e) => handleChange('warrantyUntil', e.target.value)} />
          </div>
          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Verze softwaru (SW)</label>
             <Input placeholder="např. v3.1.8 Build 45" value={formData.softwareVersion} onChange={(e) => handleChange('softwareVersion', e.target.value)} />
          </div>
        </div>
      </div>

      {/* 3. Metrologie a Speciální konfigurace */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Metrologie a náhradní díly</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-4">
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                checked={formData.isMid}
                onChange={(e) => handleChange('isMid', e.target.checked)}
              />
              <span className="ml-3 font-bold text-[#0f2c59] text-sm">
                Zařízení podléhá úřednímu ověření (MID stroj)
              </span>
            </label>

            {formData.isMid && (
              <div className="pt-2 animate-fadeIn">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Datum prvotního úředního ověření</label>
                <Input type="date" value={formData.midInitialVerificationDate} onChange={(e) => handleChange('midInitialVerificationDate', e.target.value)} />
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex items-center">
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                checked={formData.hasSparePartsPackage}
                onChange={(e) => handleChange('hasSparePartsPackage', e.target.checked)}
              />
              <span className="ml-3 font-bold text-[#0f2c59] text-sm">
                Zákazník má na provozovně balíček doporučených náhradních dílů (Spack)
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* 4. Doplňující informace */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Doplňující specifikace a poznámky</h3>
        <textarea
          placeholder="Poznámky k váze, specifika kalibrace, přístupová hesla do servisního menu..."
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={4}
          className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block p-3.5 outline-none transition-all resize-none"
        />
      </div>
      
      <div className="pt-4 flex gap-4">
        <Button type="submit" className="md:w-auto px-12">
          {machineId ? 'Uložit změny zařízení' : 'Uložit stroj do evidence'}
        </Button>
        <button 
          type="button" 
          onClick={() => navigate(machineId ? `/stroje/detail/${machineId}` : '/stroje')}
          className="px-6 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold transition-colors"
        >
          Zrušit
        </button>
      </div>

      {formStatus && (
        <p className={`mt-4 text-sm font-semibold p-3 rounded-lg ${formStatus.includes('Chyba') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {formStatus}
        </p>
      )}
    </form>
  );
}