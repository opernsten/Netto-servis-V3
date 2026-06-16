import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { createCustomer, getCustomerById, updateCustomer } from '../../services/customerService';
import { addToOfflineQueue } from '../../services/syncService';

export function CustomerForm({ customerId }: { customerId?: string }) {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [ico, setIco] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('Česká republika');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [hasServiceContract, setHasServiceContract] = useState(false);
  const [hasComscale, setHasComscale] = useState(false);
  const [hasVpn, setHasVpn] = useState(false);
  const [contactPerson, setContactPerson] = useState('');
  const [coach, setCoach] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (customerId) {
        const { data } = await getCustomerById(customerId);
        if (data) {
          setName(data.name || '');
          setIco(data.ico || '');
          setStreet(data.street || '');
          setCity(data.city || '');
          setZip(data.zip || '');
          setCountry(data.country || 'Česká republika');
          setEmail(data.email || '');
          setPhone(data.phone || '');
          setHasServiceContract(data.has_service_contract || false);
          setHasComscale(data.has_comscale || false);
          setHasVpn(data.has_vpn || false);
          // Načtení osob
          setContactPerson(data.contact_person || '');
          setCoach(data.coach || '');
        }
      }
    }
    loadData();
  }, [customerId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus(customerId ? 'Aktualizuji data...' : 'Ukládám do databáze...');

    // Zabalíme všetky dáta z formulára do jedného čistého objektu.
    // Kľúče (názvy vľavo) MUSIA presne zodpovedať nášmu novému slovníku v database.ts
    const customerData = {
      name: name,
      ico: ico,
      street: street,
      city: city,
      zip: zip,
      country: country,
      email: email,
      phone: phone,
      has_service_contract: hasServiceContract,
      has_comscale: hasComscale,
      has_vpn: hasVpn,
      contact_person: contactPerson,
      coach: coach
    };

    // ==========================================
    // 🚀 ZÁCHRANNÁ OFFLINE SÍŤ
    // ==========================================
    if (!navigator.onLine) {
      setStatus('Jsi offline. Ukládám zákazníka do zařízení...');
      
      if (customerId) {
        // Úprava existujícího
        addToOfflineQueue('UPDATE_CUSTOMER', customerData, customerId);
      } else {
        // Vytvoření nového
        addToOfflineQueue('CREATE_CUSTOMER', customerData);
      }

      setTimeout(() => {
        navigate(customerId ? `/zakaznici/detail/${customerId}` : '/zakaznici');
      }, 1500);
      return; // Zabrání odeslání online!
    }
    // ==========================================

    // Namiesto 14 parametrov teraz posielame len náš jeden balíček
    const result = customerId 
      ? await updateCustomer(customerId, customerData)
      : await createCustomer(customerData);

    if (result.error) {
      setStatus('Chyba pri ukladaní: ' + result.error.message);
    } else {
      setStatus(customerId ? 'Firma bola úspešne aktualizovaná!' : 'Firma bola úspešne pridaná!');
      setTimeout(() => {
        if (customerId) {
          navigate(`/zakaznici/detail/${customerId}`);
        } else {
          navigate('/zakaznici');
        }
      }, 1000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. Základní údaje a Kouč */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Základní údaje a správa</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2">
            <Input placeholder="Název firmy *" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <Input placeholder="IČO" value={ico} onChange={(e) => setIco(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input placeholder="Kouč zákazníka (Netto Account Manager)" value={coach} onChange={(e) => setCoach(e.target.value)} />
        </div>
      </div>

      {/* 2. Adresa */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Sídlo / Adresa</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input placeholder="Ulice a č.p." value={street} onChange={(e) => setStreet(e.target.value)} />
          <Input placeholder="Město" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input placeholder="PSČ" value={zip} onChange={(e) => setZip(e.target.value)} />
          <Input placeholder="Stát" value={country} onChange={(e) => setCountry(e.target.value)} />
        </div>
      </div>

      {/* 3. Kontaktní údaje s osobou */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Kontaktní osoba a spojení</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input placeholder="Jméno kontaktní osoby" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
          <Input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="tel" placeholder="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>

      {/* 4. Smlouvy a IT */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Smlouvy a IT Konektivita</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center">
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                checked={hasServiceContract}
                onChange={(e) => setHasServiceContract(e.target.checked)}
              />
              <span className="ml-3 font-semibold text-[#0f2c59] text-sm">
                Aktivní servisní smlouva (SLA)
              </span>
            </label>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center">
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                checked={hasComscale}
                onChange={(e) => setHasComscale(e.target.checked)}
              />
              <span className="ml-3 font-semibold text-gray-700 text-sm">
                Využívá software ComScale
              </span>
            </label>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center">
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                checked={hasVpn}
                onChange={(e) => setHasVpn(e.target.checked)}
              />
              <span className="ml-3 font-semibold text-gray-700 text-sm">
                Možnost VPN připojení
              </span>
            </label>
          </div>
        </div>
      </div>
      
      {/* Odesílací tlačítka */}
      <div className="pt-4 flex gap-4">
        <Button type="submit" className="md:w-auto px-12">
          {customerId ? 'Uložit změny' : 'Uložit nového zákazníka'}
        </Button>
        <button 
          type="button" 
          onClick={() => navigate(customerId ? `/zakaznici/detail/${customerId}` : '/zakaznici')}
          className="px-6 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold transition-colors"
        >
          Zrušit
        </button>
      </div>

      {status && (
        <p className={`mt-4 text-sm font-semibold p-3 rounded-lg ${
          status.includes('Chyba') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {status}
        </p>
      )}
    </form>
  );
}