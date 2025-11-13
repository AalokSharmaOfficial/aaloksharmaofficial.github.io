import React from 'react';
import { DiaryEntry, Profile } from '../types';
import OnThisDay from './OnThisDay';
import { formatTimestamp } from '../lib/dateUtils';

interface DiaryListProps {
  entries: DiaryEntry[];
  onSelectEntry: (id: string) => void;
  onThisDayEntries: DiaryEntry[];
  profile: Profile | null;
}

const DiaryList: React.FC<DiaryListProps> = ({ entries, onSelectEntry, onThisDayEntries, profile }) => {
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-20 flex flex-col items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-20 w-20 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m-9-5.747h18" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h2 className="mt-6 text-3xl font-bold text-slate-700 dark:text-slate-200">
          Welcome to Diary, {profile?.full_name || 'friend'}!
        </h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400">This is your private, encrypted space to reflect and record.</p>
        <p className="mt-4 text-slate-500 dark:text-slate-400">Click "New Entry" to write your first post.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OnThisDay entries={onThisDayEntries} onSelectEntry={onSelectEntry} />
      
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Welcome back, {profile?.full_name || 'friend'}!</h2>
      <div className="space-y-4">
        {entries.map(entry => (
          <div
            key={entry.id}
            onClick={() => onSelectEntry(entry.id)}
            className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600"
          >
            <div className="flex justify-between items-start gap-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{entry.title}</h2>
              <div className="text-right">
                <span 
                  className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap"
                  title={new Date(entry.created_at).toLocaleString()}
                >
                  {formatTimestamp(entry.created_at)}
                </span>
                {entry.mood && <span className="text-lg block mt-1" aria-label={`Mood: ${entry.mood}`}>{entry.mood}</span>}
              </div>
            </div>
            {entry.tags && entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {entry.tags.map(tag => (
                  <span key={tag} className="text-xs font-medium bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full dark:bg-indigo-900/50 dark:text-indigo-300">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <p className="text-slate-600 dark:text-slate-300 line-clamp-2 mt-3">
              {stripHtml(entry.content)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiaryList;