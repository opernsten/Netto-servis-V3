import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { logErrorToDB } from '../../services/errorLogService';
import { useAuth } from '../../contexts/AuthContext';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden flex flex-col">
        <div className="bg-red-600 p-6 flex flex-col items-center text-white">
          <div className="p-4 bg-white/20 rounded-full mb-4">
            <AlertTriangle size={48} className="text-white" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Jejda, něco se pokazilo</h2>
        </div>
        
        <div className="p-8 flex flex-col items-center">
          <p className="text-gray-600 mb-6 font-medium leading-relaxed">
            V aplikaci došlo k neočekávané chybě. Omlouváme se za komplikace, chyba byla automaticky zaznamenána a předána vývojářům.
          </p>
          
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 w-full text-left mb-8 overflow-hidden">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Technický popis (pro hlášení):</p>
            <code className="text-xs text-red-600 break-all font-mono">
              {error instanceof Error ? error.message : String(error)}
            </code>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button 
              onClick={resetErrorBoundary}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-sm"
            >
              <RefreshCcw size={18} />
              Zkusit obnovit
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl transition-colors"
            >
              <Home size={18} />
              Na Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GlobalErrorBoundary({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  const handleError = (error: unknown, info: React.ErrorInfo) => {
    // Zalogujeme do Supabase
    const errObj = error instanceof Error ? error : new Error(String(error));
    logErrorToDB(errObj, info, user?.email || 'Nepřihlášen');
  };

  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
}
