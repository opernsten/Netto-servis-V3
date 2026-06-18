interface TechnicianSelectorProps {
  techniciansList: string[];
  selectedTechnicians: string[];
  setSelectedTechnicians: (val: string[]) => void;
  toggleSelection: (item: string, currentList: string[], setList: (val: string[]) => void) => void;
}

export function TechnicianSelector({
  techniciansList, selectedTechnicians, setSelectedTechnicians, toggleSelection
}: TechnicianSelectorProps) {
  return (
    <div className="mt-6">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Zasahující technici (možno vybrat více)</label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {techniciansList.map((tech) => (
          <label key={tech} className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all ${
            selectedTechnicians.includes(tech) ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
          }`}>
            <input 
              type="checkbox"
              className="hidden"
              checked={selectedTechnicians.includes(tech)}
              onChange={() => toggleSelection(tech, selectedTechnicians, setSelectedTechnicians)}
            />
            {tech}
          </label>
        ))}
      </div>
    </div>
  );
}
