import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabaseClient';
import Auth from './components/Auth';
import DiaryApp from './DiaryApp';
import { CryptoProvider } from './contexts/CryptoContext';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <CryptoProvider>
      <div className="min-h-screen bg-slate-50 font-sans">
        {!session ? <Auth /> : <DiaryApp key={session.user.id} session={session} />}
      </div>
    </CryptoProvider>
  );
};

export default App;