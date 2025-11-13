import React, { useState, useEffect, ChangeEvent } from 'react';
import { Session } from '@supabase/supabase-js';
import { Profile, DiaryEntry } from '../types';

interface ProfilePanelProps {
  session: Session;
  profile: Profile | null;
  entries: DiaryEntry[];
  onClose: () => void;
  onSignOut: () => void;
  onUpdateProfile: (updates: { full_name?: string }) => Promise<void>;
  onAvatarUpload: (file: File) => Promise<void>;
  theme: string;
  onToggleTheme: () => void;
}

const ProfilePanel: React.FC<ProfilePanelProps> = ({
  session,
  profile,
  entries,
  onClose,
  onSignOut,
  onUpdateProfile,
  onAvatarUpload,
  theme,
  onToggleTheme,
}) => {
  const [name, setName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');


  useEffect(() => {
    setName(profile?.full_name || '');
  }, [profile?.full_name]);

  const handleNameSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() !== profile?.full_name) {
      await onUpdateProfile({ full_name: name.trim() });
    }
    setIsEditingName(false);
  };
  
  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      await onAvatarUpload(e.target.files[0]);
      setIsUploading(false);
    }
  };
  
  const handleOpenExportModal = () => {
    if(entries.length === 0) {
      alert("You have no entries to export.");
      return;
    }
    setExportStartDate('');
    setExportEndDate('');
    setIsExportModalOpen(true);
  };

  const handleConfirmExport = () => {
     const entriesToExport = entries.filter(entry => {
      const entryDate = new Date(entry.created_at);
      entryDate.setHours(0, 0, 0, 0);

      let inRange = true;
      if (exportStartDate) {
        // By appending T00:00:00, we ensure the date is parsed in the user's local timezone,
        // avoiding inconsistencies with UTC-based parsing of date-only strings.
        const start = new Date(exportStartDate + 'T00:00:00');
        if (entryDate < start) inRange = false;
      }
      if (exportEndDate) {
        const end = new Date(exportEndDate + 'T00:00:00');
        if (entryDate > end) inRange = false;
      }
      return inRange;
    });
    
    if (entriesToExport.length === 0) {
      alert("No entries found in the selected date range.");
      return;
    }

    if (window.confirm('Warning: This exported file will not be encrypted. Please keep it safe on your computer.')) {
        const fileContent = entriesToExport
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) // sort oldest to newest
            .map(entry => {
                const date = new Date(entry.created_at).toLocaleString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                  hour: 'numeric', minute: '2-digit', hour12: true
                });
                const mood = entry.mood ? `[Mood: ${entry.mood}]` : '';
                const tags = entry.tags?.length ? `[Tags: ${entry.tags.join(', ')}]` : '';
                const metadata = [mood, tags].filter(Boolean).join(' | ');

                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = entry.content;
                const textContent = tempDiv.textContent || tempDiv.innerText || '';

                return `Date: ${date}\nTitle: ${entry.title}\n${metadata ? `${metadata}\n` : ''}\n---\n${textContent}\n`;
            })
            .join('\n============================================================\n\n');

        const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `diary_export_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    setIsExportModalOpen(false);
  };

  return (
    <>
      <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-30 animate-fade-in-down">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="User avatar" className="w-full h-full object-cover" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-500 dark:text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <input type="file" id="avatar-upload" className="hidden" onChange={handleAvatarChange} accept="image/*" disabled={isUploading} />
              <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-600 rounded-full p-1 cursor-pointer shadow-md hover:bg-slate-100 dark:hover:bg-slate-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-600 dark:text-slate-200" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0l-1.5-1.5a.5.5 0 01.707-.707l1.5 1.5a1 1 0 001.414 0l3-3z" />
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
                </svg>
              </label>
            </div>
            <div className="flex-1">
              {isEditingName ? (
                <form onSubmit={handleNameSave}>
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600"
                    autoFocus
                    onBlur={handleNameSave}
                  />
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{profile?.full_name || 'Your Name'}</p>
                  <button onClick={() => setIsEditingName(true)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0l-1.5-1.5a.5.5 0 01.707-.707l1.5 1.5a1 1 0 001.414 0l3-3z" />
                    </svg>
                  </button>
                </div>
              )}
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{session.user.email}</p>
            </div>
          </div>
        </div>
        
        <div className="p-2 space-y-1">
          <button 
            onClick={handleOpenExportModal}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export Data
          </button>

          <div className="w-full flex items-center justify-between gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 rounded-md">
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
                Dark Mode
              </div>
              <button onClick={onToggleTheme} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${theme === 'dark' ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
          </div>
        </div>

        <div className="p-2 border-t border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => { onSignOut(); onClose(); }} 
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
      
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 flex items-center justify-center p-4 animate-fade-in">
          <div 
            className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-700"
            onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the modal
          >
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Export Entries</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">Select a date range. Leave blank to export all entries.</p>
            <div className="space-y-4">
              <div>
                <label htmlFor="start-date" className="text-sm font-medium text-slate-600 dark:text-slate-300">Start Date</label>
                <input 
                  id="start-date" 
                  type="date" 
                  value={exportStartDate} 
                  onChange={e => setExportStartDate(e.target.value)} 
                  className="w-full mt-1 border border-slate-300 rounded-md p-1.5 text-sm dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 dark:[color-scheme:dark]" 
                />
              </div>
              <div>
                <label htmlFor="end-date" className="text-sm font-medium text-slate-600 dark:text-slate-300">End Date</label>
                <input 
                  id="end-date" 
                  type="date" 
                  value={exportEndDate} 
                  onChange={e => setExportEndDate(e.target.value)} 
                  className="w-full mt-1 border border-slate-300 rounded-md p-1.5 text-sm dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 dark:[color-scheme:dark]" 
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsExportModalOpen(false)} className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors">Cancel</button>
              <button onClick={handleConfirmExport} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">Confirm Export</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePanel;