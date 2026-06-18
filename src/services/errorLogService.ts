import { supabase } from './supabase';

export async function logErrorToDB(error: Error, errorInfo: React.ErrorInfo | string, userEmail: string = 'Neznámý') {
  try {
    const { error: dbError } = await supabase
      .from('error_logs')
      .insert([
        {
          error_message: error.message,
          error_stack: error.stack || 'Žádný stack trace',
          component_stack: typeof errorInfo === 'string' ? errorInfo : (errorInfo.componentStack || 'Neznámý komponentový stack'),
          user_email: userEmail,
          url: window.location.href,
        }
      ]);

    if (dbError) {
      console.error('Nepodařilo se zalogovat chybu do DB:', dbError);
    }
  } catch (err) {
    console.error('Kritická chyba v errorLogService:', err);
  }
}
