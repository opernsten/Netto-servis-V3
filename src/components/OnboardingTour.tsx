import { useState, useEffect } from 'react';
import { Joyride, STATUS, ACTIONS, EVENTS } from 'react-joyride';
import type { EventData, Step } from 'react-joyride';
import { useNavigate } from 'react-router-dom';
import { getAllCustomers } from '../services/customerService';
import { getMachinesWithCustomers } from '../services/machineService';

interface OnboardingTourProps {
  run: boolean;
  onFinish: () => void;
}

export function OnboardingTour({ run, onFinish }: OnboardingTourProps) {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [steps, setSteps] = useState<Step[]>([]);
  const [firstCustomerId, setFirstCustomerId] = useState<string | null>(null);
  const [firstMachineId, setFirstMachineId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Inicializace dat a sestavení kroků, jakmile se spustí průvodce
  useEffect(() => {
    if (run) {
      setStepIndex(0);
      
      const loadTourData = async () => {
        const [{ data: customers }, { data: machines }] = await Promise.all([
          getAllCustomers(),
          getMachinesWithCustomers()
        ]);

        let cid = null;
        let mid = null;

        if (customers && customers.length > 0) {
          cid = customers[0].id;
          setFirstCustomerId(cid);
        }
        if (machines && machines.length > 0) {
          mid = machines[0].id;
          setFirstMachineId(mid);
        }

        const baseSteps: Step[] = [
          { target: '.tour-step-stats', content: 'Vítejte v Netto Servis! Tohle je váš hlavní řídící panel. Tady hned po ránu uvidíte, co vás dnes čeká a jaké stroje hlásí poruchu.', skipBeacon: true, placement: 'bottom' },
          { target: '.tour-step-upcoming', content: 'Zde vidíte všechny naplánované výjezdy na nejbližší dobu. Pokud se termín nestihne, automaticky se zbarví červeně.', placement: 'top' },
          { target: '.tour-step-urgent', content: 'Tento modul hlídá stroje, které mají nahlášenou poruchu. Kdykoliv se něco pokazí, hned to tady uvidíte.', placement: 'top' },
          { target: '.tour-step-quickactions', content: 'Rychlé odkazy vás dostanou přímo k evidenci zákazníků a strojů bez nutnosti rolovat v menu.', placement: 'left' },
          { target: '.tour-step-add-buttons', content: 'Těmito tlačítky můžete kdykoliv bleskově založit nový stroj nebo nového zákazníka.', placement: 'bottom' },
          { target: '.tour-step-nav-customers', content: 'Zde najdete celou databázi firem. Kliknutím na "Další" si ji teď otevřeme a podíváme se tam.', placement: 'right' },
          { target: '.tour-step-customer-search', content: 'Na této stránce vidíte všechny zákazníky. Tady nahoře můžete snadno vyhledávat podle jména, IČO nebo města.', placement: 'bottom' },
          { target: '.tour-step-customer-table', content: 'V tabulce níže pak vidíte výsledky. Kliknutím na Detail si zobrazíte konkrétní stroje zapsané pod daným zákazníkem.', placement: 'top' },
          { target: '.tour-step-nav-machines', content: 'Teď se podíváme na centrální evidenci všech strojů. Opět stačí kliknout na "Další" a přesuneme se.', placement: 'right' },
          { target: '.tour-step-machine-table', content: 'Zde jsou všechny stroje ze všech firem. Podobně jako u zákazníků tu můžete vyhledávat, filtrovat podle stavu a přejít do detailu.', placement: 'top' },
          { target: '.tour-step-nav-calendar', content: 'Nyní se pojďme podívat do kalendáře výjezdů. (Klikněte na Další)', placement: 'right' },
          { target: '.tour-step-calendar-view', content: 'Toto je váš servisní kalendář. Přehledně zde vidíte všechny naplánované zásahy v měsíčním nebo týdenním pohledu.', placement: 'top' },
          { target: '.tour-step-calendar-add', content: 'Tímto modrým tlačítkem můžete rovnou založit nový výjezd ke komukoliv.', placement: 'bottom' }
        ];

        // Pokud máme zákazníka, ukážeme i jeho detail
        if (cid) {
          baseSteps.push({ target: '.tour-step-customer-info', content: 'Tohle je detailní karta zákazníka. Najdete zde kontakty a případně i možnost přímého spuštění navigace (pokud má adresu).', placement: 'bottom' });
          baseSteps.push({ target: '.tour-step-customer-machines', content: 'Níže se pak ukazuje kompletní výpis evidovaných strojů na této konkrétní pobočce.', placement: 'top' });
        }

        // Pokud máme stroj, ukážeme i jeho detail
        if (mid) {
          baseSteps.push({ target: '.tour-step-machine-info', content: 'Zde vidíte detail samotného stroje. Můžete si zde prohlédnout specifikace a váživosti.', placement: 'bottom' });
          baseSteps.push({ target: '.tour-step-machine-mid', content: 'Zde je Hlídač MID, pokud jde o úředně ověřovanou váhu. Můžete odtud přímo zapsat provedení nové zkoušky.', placement: 'top' });
          baseSteps.push({ target: '.tour-step-machine-history', content: 'A pod tlačítkem Detail servisu najdete historii oprav a deník údržby. To je z aplikace vše, ať se s ní dobře pracuje!', placement: 'top' });
        }

        setSteps(baseSteps);
        setIsReady(true);
      };

      loadTourData();
    } else {
      setIsReady(false);
    }
  }, [run]);

  const handleJoyrideCallback = (data: EventData) => {
    const { action, index, status, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setStepIndex(0);
      setIsReady(false);
      onFinish();
      return;
    }

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      const currentStep = steps[index];
      
      // Robustnější navigace nezávislá na pevných indexech
      if (action === ACTIONS.NEXT) {
        if (currentStep.target === '.tour-step-nav-customers') navigate('/zakaznici');
        else if (currentStep.target === '.tour-step-nav-machines') navigate('/stroje');
        else if (currentStep.target === '.tour-step-nav-calendar') navigate('/kalendar');
        else if (currentStep.target === '.tour-step-calendar-add' && firstCustomerId) navigate(`/zakaznici/detail/${firstCustomerId}`);
        else if (currentStep.target === '.tour-step-calendar-add' && !firstCustomerId && firstMachineId) navigate(`/stroje/detail/${firstMachineId}`); // Fallback
        else if (currentStep.target === '.tour-step-customer-machines' && firstMachineId) navigate(`/stroje/detail/${firstMachineId}`);
      } 
      else if (action === ACTIONS.PREV) {
        if (currentStep.target === '.tour-step-customer-search') navigate('/');
        else if (currentStep.target === '.tour-step-machine-table') navigate('/zakaznici');
        else if (currentStep.target === '.tour-step-calendar-view') navigate('/stroje');
        else if (currentStep.target === '.tour-step-customer-info') navigate('/kalendar');
        else if (currentStep.target === '.tour-step-machine-info') {
          if (firstCustomerId) navigate(`/zakaznici/detail/${firstCustomerId}`);
          else navigate('/kalendar');
        }
      }

      setStepIndex(nextStepIndex);
    }
  };

  if (!isReady || steps.length === 0) return null;

  return (
    <Joyride
      stepIndex={stepIndex}
      steps={steps}
      run={run}
      continuous
      onEvent={handleJoyrideCallback}
      styles={{
        tooltipContainer: { textAlign: 'left', fontSize: '14px', fontWeight: 500 },
        buttonPrimary: { backgroundColor: '#2563eb', borderRadius: '6px', fontWeight: 'bold' },
        buttonBack: { color: '#4b5563' },
        buttonSkip: { color: '#9ca3af' }
      }}
      options={{
        primaryColor: '#2563eb',
        zIndex: 10000,
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        showProgress: true,
        buttons: ['back', 'close', 'primary', 'skip']
      }}
      locale={{ back: 'Zpět', close: 'Zavřít', last: 'Dokončit', next: 'Další', skip: 'Přeskočit' }}
    />
  );
}
