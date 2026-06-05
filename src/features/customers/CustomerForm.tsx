import { useState, useEffect, type FormEvent } from 'react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { createCustomer, getCustomerById, updateCustomer } from '../../services/customerService';

// Přidali jsme (props), které říkají, že formulář může přijmout ID
export function CustomerForm({ customerId }: { customerId?: string }) {
  const [name, setName] = useState('');
  const [ico, setIco] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('Česká republika');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [hasServiceContract, setHasServiceContract] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // ZBRUSU NOVÉ: Pokud přijde ID, stáhneme data a předvyplníme políčka
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
        }
      }
    }
    loadData();
  }, [customerId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus(customerId ? 'Aktualizuji data...' : 'Ukládám do databáze...');

    // ROZHODNUTÍ: Zda updatujeme nebo tvoříme nového
    const result = customerId 
      ? await updateCustomer(customerId, name, ico, street, city, zip, country, email, phone, hasServiceContract)
      : await createCustomer(name, ico, street, city, zip, country, email, phone, hasServiceContract);

    if (result.error) {
      setStatus('Chyba při ukládání: ' + result.error.message);
    } else {
      setStatus(customerId ? 'Firma byla úspěšně aktualizována!' : 'Firma byla úspěšně přidána!');
      
      // Vyčistíme jen pokud přidáváme nového (při updatu chceme nechat data zobrazená)
      if (!customerId) {
        setName(''); setIco(''); setStreet(''); setCity(''); setZip(''); 
        setCountry('Česká republika'); setEmail(''); setPhone(''); setHasServiceContract(false);
      }
      
      setTimeout(() => setStatus(null), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      
      {/* 1. Základní údaje */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Základní údaje</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input placeholder="Název firmy *" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input placeholder="IČO" value={ico} onChange={(e) => setIco(e.target.value)} />
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

      {/* 3. Kontaktní údaje */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Kontakt</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="tel" placeholder="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>

      {/* 4. Smlouvy a nastavení */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <label className="flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
            checked={hasServiceContract}
            onChange={(e) => setHasServiceContract(e.target.checked)}
          />
          <span className="ml-3 font-semibold text-[#0f2c59]">
            Zákazník má uzavřenou aktivní servisní smlouvu (SLA)
          </span>
        </label>
      </div>
      
      {/* Odesílací tlačítko */}
      <div className="pt-4">
        <Button type="submit" className="md:w-auto px-12">
          Uložit nového zákazníka
        </Button>
      </div>

      {/* Zobrazení hlášky o výsledku */}
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