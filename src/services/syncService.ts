import { supabase } from './supabase';

// 1. Seznam všeho, co umí náš Skladník zpracovat
export type SyncActionType = 
  | 'CREATE_SERVICE_LOG'
  | 'CREATE_CUSTOMER'
  | 'UPDATE_CUSTOMER'
  | 'CREATE_MACHINE'
  | 'UPDATE_MACHINE';

// 2. Definice offline balíčku
export type SyncAction = {
  id: string;
  type: SyncActionType;
  payload: Record<string, unknown>;
  targetId?: string; // DŮLEŽITÉ: ID pro úpravy (např. ID stroje, který upravujeme)
  timestamp: number;
};

const QUEUE_KEY = 'netto_offline_queue';

// 3. Ukládání do fronty
export function addToOfflineQueue(type: SyncActionType, payload: Record<string, unknown>, targetId?: string) {
  const currentQueueStr = localStorage.getItem(QUEUE_KEY);
  const queue: SyncAction[] = currentQueueStr ? JSON.parse(currentQueueStr) : [];

  const newAction: SyncAction = {
    id: crypto.randomUUID(),
    type,
    payload,
    targetId,
    timestamp: Date.now(),
  };

  queue.push(newAction);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  
  console.log('Uloženo do offline fronty:', newAction);
}

// 4. Odesílání po připojení k síti
export async function processOfflineQueue() {
  const currentQueueStr = localStorage.getItem(QUEUE_KEY);
  if (!currentQueueStr) return;

  let queue: SyncAction[] = JSON.parse(currentQueueStr);
  if (queue.length === 0) return;

  console.log(`Zahajuji synchronizaci ${queue.length} položek z offline fronty...`);

  for (const action of queue) {
    let error = null;

    try {
      // Skladník se podívá na štítek a podle toho pošle balíček do správné tabulky
      switch (action.type) {
        case 'CREATE_SERVICE_LOG':
          const resLog = await supabase.from('service_logs').insert([action.payload]);
          error = resLog.error;
          break;
          
        case 'CREATE_CUSTOMER':
          const resCustNew = await supabase.from('customers').insert([action.payload]);
          error = resCustNew.error;
          break;
          
        case 'UPDATE_CUSTOMER':
          if (!action.targetId) throw new Error("Chybí ID zákazníka pro úpravu");
          const resCustUpd = await supabase.from('customers').update(action.payload).eq('id', action.targetId);
          error = resCustUpd.error;
          break;
          
        case 'CREATE_MACHINE':
          const resMachNew = await supabase.from('machines').insert([action.payload]);
          error = resMachNew.error;
          break;
          
        case 'UPDATE_MACHINE':
          if (!action.targetId) throw new Error("Chybí ID stroje pro úpravu");
          const resMachUpd = await supabase.from('machines').update(action.payload).eq('id', action.targetId);
          error = resMachUpd.error;
          break;
      }

      if (!error) {
        queue = queue.filter(q => q.id !== action.id);
        localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
        console.log(`Úspěšně synchronizováno: ${action.type}`);
      } else {
        console.error(`Chyba při synchronizaci ${action.type}:`, error);
        break; // Přerušíme cyklus, zkusíme to příště
      }
      
    } catch (err) {
      console.error("Kritická chyba při synchronizaci:", err);
      break;
    }
  }
}