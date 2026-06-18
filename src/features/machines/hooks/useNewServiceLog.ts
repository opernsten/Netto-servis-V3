import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createServiceLog, uploadAttachment } from '../../../services/serviceLogService';
import { getActiveTechnicians } from '../../../services/technicianService';

export const WORK_TYPES = [
  'Profylaxe / Údržba',
  'Oprava / Porucha',
  'Instalace / Uvedení do provozu',
  'MID Ověření / Kalibrace',
  'Školení obsluhy'
];

export function useNewServiceLog(id: string | undefined) {
  const navigate = useNavigate();
  
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [techniciansList, setTechniciansList] = useState<string[]>([]);
  const [selectedTechnicians, setSelectedTechnicians] = useState<string[]>(['O.ERNSTEN']); 
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<string[]>(['Profylaxe / Údržba']);
  const [description, setDescription] = useState('');
  const [timeSpent, setTimeSpent] = useState('');
  
  const [usedParts, setUsedParts] = useState(false);
  const [spareParts, setSpareParts] = useState<{ article: string, quantity: number }[]>([
    { article: '', quantity: 1 }
  ]);

  const [status, setStatus] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadTechnicians() {
      const { data } = await getActiveTechnicians();
      if (data) {
        setTechniciansList(data.map(t => t.name));
      }
    }
    loadTechnicians();
  }, []);

  const toggleSelection = (item: string, currentList: string[], setList: (val: string[]) => void) => {
    if (currentList.includes(item)) {
      setList(currentList.filter(i => i !== item));
    } else {
      setList([...currentList, item]);
    }
  };

  const addPartRow = () => setSpareParts([...spareParts, { article: '', quantity: 1 }]);
  
  const removePartRow = (index: number) => {
    const newParts = [...spareParts];
    newParts.splice(index, 1);
    setSpareParts(newParts);
  };
  
  const updatePart = (index: number, field: 'article' | 'quantity', value: string | number) => {
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

    const { error } = await createServiceLog(id, logDate, techString, workString, description, timeSpent, finalParts, finalAttachmentUrl);
    
    if (error) {
      setStatus('Chyba: ' + error.message);
    } else {
      navigate(`/stroje/${id}/servis`);
    }
  };

  return {
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
  };
}
