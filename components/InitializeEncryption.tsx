import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { generateSalt, deriveKey, encrypt, KEY_CHECK_STRING } from '../lib/crypto';
import { Session } from '@supabase/supabase-js';


interface InitializeEncryptionProps {
  onSuccess: (key: CryptoKey) => void;
  session: Session;
}

const InitializeEncryption: React.FC<InitializeEncryptionProps> = ({ onSuccess, session }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }
    setLoading(true);
    setError(null);

    try {
        const user = session.user;
        if (!user) throw new Error("User not available.");
        
        const salt = generateSalt();
        const key = await deriveKey(password, salt);
        const { iv: key_check_iv, data: key_check_value } = await encrypt(key, KEY_CHECK_STRING);

        // Extract full_name and avatar_url from user metadata if available (e.g., from Google sign-in)
        const fullName = user.user_metadata?.full_name;
        const avatarUrl = user.user_metadata?.avatar_url;

        // Instead of updating, we now insert the new profile directly.
        // The RLS policy ensures a user can only insert a profile for themselves.
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ 
            id: user.id, 
            salt, 
            key_check_value, 
            key_check_iv,
            full_name: fullName,
            avatar_url: avatarUrl,
          });
        
        if (insertError) throw insertError;
        
        onSuccess(key);

    } catch (err: any) {
        setError(err.error_description || err.message || "An unknown error occurred during setup.");
        console.error("Encryption initialization failed:", err);
    } finally {
        setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Final Security Step</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">To complete your secure setup, please create your password.</p>
            </div>

            <p className="text-xs text-center text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-md border dark:border-slate-700">
                This is required to create your unique encryption key. Your password is never stored, and this one-time step ensures your diary remains private and end-to-end encrypted.
            </p>

            {error && <p className="text-center text-red-500 bg-red-50 p-3 rounded-md">{error}</p>}

            <form className="space-y-6" onSubmit={handleSubmit}>
            <input
                type="password"
                placeholder="Your password"
                value={password}
                required
                minLength={6}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
            />
            <button type="submit" disabled={loading} className="w-full px-4 py-2 font-semibold text-white bg-indigo-500 rounded-md hover:bg-indigo-600 disabled:bg-indigo-300">
                {loading ? 'Securing...' : 'Initialize Diary'}
            </button>
            </form>
        </div>
    </div>
  );
};

export default InitializeEncryption;