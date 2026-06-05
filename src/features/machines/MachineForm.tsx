import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom'; // PŘIDÁNO: import pro přesměrování
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { getCustomers } from '../../services/machineService';
import { createMachine, getMachineById, updateMachine } from '../../services/machineService';
import { MACHINE_STATUSES } from '../../utils/statusConfig';

export function MachineForm({ machineId }: { machineId?: string }) {
  const navigate = useNavigate(); // PŘIDÁNO: inicializace navigace
  
  const [customerId, setCustomerId] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [status, setStatus] = useState('OK');
  const [installationDate, setInstallationDate] = useState('');
  const [warrantyUntil, setWarrantyUntil] = useState('');
  const [softwareVersion, setSoftwareVersion] = useState('');
  const [notes, setNotes] = useState('');

  const [supplier, setSupplier] = useState('');
  const [isMid, setIsMid] = useState(false);
  const [midInitialVerificationDate, setMidInitialVerificationDate] = useState('');
  const [hasSparePartsPackage, setHasSparePartsPackage] = useState(false);
  const [placementLine, setPlacementLine] = useState('');
  const [productionYear, setProductionYear] = useState('');

  const [customers, setCustomers] = useState<{ id: string, name: string }[]>([]);
  const [formStatus, setFormStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadCustomers() {
      const { data } = await getCustomers();
      if (data) setCustomers(data);
    }
    loadCustomers();
  }, []);

  useEffect(() => {
    async function loadMachineData() {
      if (machineId) {
        const { data } = await getMachineById(machineId);
        if (data) {
          setCustomerId(data.customer_id || '');
          setModel(data.model || '');
          setSerialNumber(data.serial_number || '');
          setStatus(data.status || 'OK');
          setInstallationDate(data.installation_date || '');
          setWarrantyUntil(data.warranty_until || '');
          setSoftwareVersion(data.software_version || '');
          setNotes(data.notes || '');
          setSupplier(data.supplier || '');
          setIsMid(data.is_mid || false);
          setMidInitialVerificationDate(data.mid_initial_verification_date || '');
          setHasSparePartsPackage(data.has_spare_parts_package || false);
          setPlacementLine(data.placement_line || '');
          setProductionYear(data.production_year ? data.production_year.toString() : '');
        }
      }
    }
    loadMachineData();
  }, [machineId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setFormStatus('Musíš vybrat zákazníka!');
      return;
    }

    setFormStatus(machineId ? 'Aktualizuji data stroje...' : 'Ukládám nový stroj...');

    const parsedYear = productionYear ? parseInt(productionYear, 10) : null;

    const result = machineId
      ? await updateMachine(machineId, customerId, model, serialNumber, status, installationDate, warrantyUntil, softwareVersion, notes, supplier, isMid, midInitialVerificationDate, hasSparePartsPackage, placementLine, parsedYear)
      : await createMachine(customerId, model, serialNumber, status, installationDate, warrantyUntil, softwareVersion, notes, supplier, isMid, midInitialVerificationDate, hasSparePartsPackage, placementLine, parsedYear);

    if (result.error) {
      setFormStatus('Chyba: ' + result.error.message);
    } else {
      setFormStatus(machineId ? 'Stroj úspěšně aktualizován!' : 'Stroj úspěšně přidán do systému!');
      
      // ZMĚNA: Přesměrování po krátké pauze (aby uživatel viděl zelenou hlášku)
      setTimeout(() => {
        if (machineId) {
          navigate(`/stroje/detail/${machineId}`);
        } else {
          navigate('/stroje');
        }
      }, 1000);
    }
  };

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
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
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
              value={status}
              onChange={(e) => setStatus(e.target.value)}
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
            <Input placeholder="např. Wipotec HC-M" value={model} onChange={(e) => setModel(e.target.value)} required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sériové číslo (S/N) *</label>
            <Input placeholder="Zadejte S/N ze štítku" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Dodavatel zařízení</label>
            <Input placeholder="např. Netto Electronics" value={supplier} onChange={(e) => setSupplier(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Rok výroby</label>
            <Input type="number" placeholder="RRRR" value={productionYear} onChange={(e) => setProductionYear(e.target.value)} min="1990" max="2050" />
          </div>
        </div>
      </div>

      {/* 2. Umístění, technické parametry a termíny */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Umístění a provozní parametry</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Přesné umístění v provozu (Linka, hala, sekce)</label>
            <Input placeholder="např. Balicí linka č. 3 - Expedice sladkostí" value={placementLine} onChange={(e) => setPlacementLine(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Datum instalace</label>
            <Input type="date" value={installationDate} onChange={(e) => setInstallationDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Záruka do</label>
            <Input type="date" value={warrantyUntil} onChange={(e) => setWarrantyUntil(e.target.value)} />
          </div>
          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Verze softwaru (SW)</label>
             <Input placeholder="např. v3.1.8 Build 45" value={softwareVersion} onChange={(e) => setSoftwareVersion(e.target.value)} />
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
                checked={isMid}
                onChange={(e) => setIsMid(e.target.checked)}
              />
              <span className="ml-3 font-bold text-[#0f2c59] text-sm">
                Zařízení podléhá úřednímu ověření (MID stroj)
              </span>
            </label>

            {isMid && (
              <div className="pt-2 animate-fadeIn">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Datum prvotního úředního ověření</label>
                <Input type="date" value={midInitialVerificationDate} onChange={(e) => setMidInitialVerificationDate(e.target.value)} />
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex items-center">
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                checked={hasSparePartsPackage}
                onChange={(e) => setHasSparePartsPackage(e.target.checked)}
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
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block p-3.5 outline-none transition-all resize-none"
        />
      </div>
      
      {/* PŘIDÁNO: Zrušit tlačítko vedle odesílacího */}
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