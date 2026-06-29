import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomers, createMachine, getMachineById, updateMachine } from '../../../services/machineService';
import { addToOfflineQueue } from '../../../services/syncService';

export function useMachineForm(machineId?: string) {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    customerId: '',
    model: '',
    serialNumber: '',
    status: 'OK',
    installationDate: '',
    warrantyUntil: '',
    softwareVersion: '',
    notes: '',
    supplier: '',
    isMid: false,
    midInitialVerificationDate: '',
    hasSparePartsPackage: false,
    placementLine: '',
    productionYear: '',
    weightMax: '',
    weightMin: '',
    weightE: '',
    weightD: ''
  });

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
          setFormData({
            customerId: data.customer_id || '',
            model: data.model || '',
            serialNumber: data.serial_number || '',
            status: data.status || 'OK',
            installationDate: data.installation_date || '',
            warrantyUntil: data.warranty_until || '',
            softwareVersion: data.software_version || '',
            notes: data.notes || '',
            supplier: data.supplier || '',
            isMid: data.is_mid || false,
            midInitialVerificationDate: data.mid_initial_verification_date || '',
            hasSparePartsPackage: data.has_spare_parts_package || false,
            placementLine: data.placement_line || '',
            productionYear: data.production_year ? data.production_year.toString() : '',
            weightMax: data.weight_max || '',
            weightMin: data.weight_min || '',
            weightE: data.weight_e || '',
            weightD: data.weight_d || ''
          });
        }
      }
    }
    loadMachineData();
  }, [machineId]);

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.customerId) {
      setFormStatus('Musíš vybrat zákazníka!');
      return;
    }

    setFormStatus(machineId ? 'Aktualizuji data stroje...' : 'Ukládám nový stroj...');

    const parsedYear = formData.productionYear ? parseInt(formData.productionYear, 10) : undefined;

    const machineData = {
      customer_id: formData.customerId,
      model: formData.model,
      serial_number: formData.serialNumber,
      status: formData.status,
      installation_date: formData.installationDate || undefined,
      warranty_until: formData.warrantyUntil || undefined,
      software_version: formData.softwareVersion,
      notes: formData.notes,
      supplier: formData.supplier,
      is_mid: formData.isMid,
      mid_initial_verification_date: formData.midInitialVerificationDate || undefined,
      has_spare_parts_package: formData.hasSparePartsPackage,
      placement_line: formData.placementLine,
      production_year: parsedYear,
      weight_max: formData.weightMax,
      weight_min: formData.weightMin,
      weight_e: formData.weightE,
      weight_d: formData.weightD
    };

    if (!navigator.onLine) {
      setFormStatus('Jsi offline. Ukládám stroj do zařízení...');
      
      if (machineId) {
        addToOfflineQueue('UPDATE_MACHINE', machineData, machineId);
      } else {
        addToOfflineQueue('CREATE_MACHINE', machineData);
      }

      setTimeout(() => {
        navigate(machineId ? `/stroje/detail/${machineId}` : '/stroje');
      }, 1500);
      return;
    }

    const result = machineId
      ? await updateMachine(machineId, machineData)
      : await createMachine(machineData);

    if (result.error) {
      setFormStatus('Chyba: ' + result.error.message);
    } else {
      setFormStatus(machineId ? 'Stroj úspěšně aktualizován!' : 'Stroj úspěšně přidán do systému!');
      
      setTimeout(() => {
        if (machineId) {
          navigate(`/stroje/detail/${machineId}`);
        } else {
          navigate('/stroje');
        }
      }, 1000);
    }
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    customers,
    formStatus,
    navigate
  };
}
