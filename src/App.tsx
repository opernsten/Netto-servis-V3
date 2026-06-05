import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { supabase } from './services/supabase';

// Importy komponent
import { LoginPage } from './pages/Login/LoginPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { LoadingScreen } from './components/LoadingScreen';
import { Layout } from './components/Layout/Layout';
import { CustomersPage } from './pages/Customers/CustomersPage';
import { NewCustomerPage } from './pages/Customers/NewCustomerPage';
import { EditCustomerPage } from './pages/Customers/EditCustomerPage';
import { CustomerDetailPage } from './pages/Customers/CustomerDetailPage';
import { MachinesPage } from './pages/Machines/MachinesPage';
import { NewMachinePage } from './pages/Machines/NewMachinePage';
import { EditMachinePage } from './pages/Machines/EditMachinePage';
import { MachineDetailPage } from './pages/Machines/MachineDetailPage';
import { ServiceHistoryPage } from './pages/Machines/ServiceHistoryPage';
import { NewServiceLogPage } from './pages/Machines/NewServiceLogPage';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setTimeout(() => setIsLoading(false), 800);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) return <LoadingScreen />;

  // Pokud uživatel NENÍ přihlášený, vidí jen přihlašovací okno
  if (!user) {
    return <LoginPage />;
  }

  // Pokud JE přihlášený, načteme Router s postranním panelem
  return (
    <BrowserRouter>
      <Routes>
        {/* Všechny tyto stránky budou zabalené v našem Layoutu (s menu na boku) */}
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          
          {/* Zatím sem dáme jen zástupné texty, než si pro ně vytvoříme reálné stránky */}
          <Route path="/zakaznici" element={<CustomersPage />} />
          <Route path="/zakaznici/novy" element={<NewCustomerPage />} />
          <Route path="/zakaznici/upravit/:id" element={<EditCustomerPage />} />
          <Route path="/zakaznici/detail/:id" element={<CustomerDetailPage />} />
          <Route path="/stroje/upravit/:id" element={<EditMachinePage />} />
          <Route path="/stroje/detail/:id" element={<MachineDetailPage />} />
          <Route path="/stroje" element={<MachinesPage />} />
          <Route path="/stroje/novy" element={<NewMachinePage />} />
          <Route path="/stroje/:id/servis" element={<ServiceHistoryPage />} />
          <Route path="/stroje/:id/servis/novy" element={<NewServiceLogPage />} />
          <Route path="/nastaveni" element={<div className="p-8">Nastavení profilu...</div>} />
        </Route>
        
        {/* Záchytná síť: Když zadáš nesmyslnou URL, hodí tě to na Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}