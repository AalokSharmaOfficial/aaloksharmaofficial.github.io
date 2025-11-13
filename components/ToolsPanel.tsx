import React from 'react';
import { DiaryEntry } from '../types';

interface ToolsPanelProps {
  entry: DiaryEntry | 'new';
  onUpdateEntry: (updates: Partial<Pick<DiaryEntry, 'mood' | 'tags'>>) => void;
}

const moods = ['😊', '😢', '😠', '😎', '🤔', '😍', '😴', '🥳'];

const ToolsPanel: React.FC<ToolsPanelProps> = ({ entry, onUpdateEntry }) => {
    const currentMood = typeof entry === 'object' ? entry.mood : undefined;
    const currentTags = typeof entry === 'object' ? (entry.tags || []) : [];

    // Placeholder for image upload handler
    const handleImageInsert = () => {
        alert("Image insertion feature coming soon!");
    }

    const handleTagUpdate = (newTags: string[]) => {
        onUpdateEntry({ tags: newTags });
    }
    
    const handleMoodUpdate = (newMood: string) => {
        onUpdateEntry({ mood: newMood === currentMood ? undefined : newMood });
    }

    return (
        <aside className="w-64 bg-white/80 dark:bg-slate-900/50 border-l border-[#EAE1D6] dark:border-slate-800 p-4 space-y-6 flex-shrink-0 transition-transform duration-300 ease-in-out transform translate-x-0">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tools</h2>
            <div className="space-y-2">
                <button onClick={handleImageInsert} className="w-full flex items-center gap-3 p-2 rounded-md text-left text-sm text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                    <span>Insert Image</span>
                </button>
                 <button className="w-full flex items-center gap-3 p-2 rounded-md text-left text-sm text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h.01a1 1 0 100-2H10zm3 0a1 1 0 000 2h.01a1 1 0 100-2H13z" clipRule="evenodd" /></svg>
                    <span>Font Options</span>
                </button>
            </div>

            <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Mood</h3>
                <div className="grid grid-cols-4 gap-2">
                     {moods.map(m => (
                        <button key={m} type="button" onClick={() => handleMoodUpdate(m)} className={`text-2xl p-2 rounded-md transition-all ${currentMood === m ? 'bg-indigo-100 dark:bg-indigo-500/50 scale-110' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}>{m}</button>
                    ))}
                </div>
            </div>
             <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Tags</h3>
                {/* A simplified tag editor. A more advanced one could be a component itself. */}
                <textarea 
                    value={currentTags.join(', ')}
                    onChange={(e) => handleTagUpdate(e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                    placeholder="travel, work..."
                    className="w-full h-20 p-2 text-sm rounded-md bg-slate-100 dark:bg-slate-800 border-transparent focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
            </div>
        </aside>
    );
};

export default ToolsPanel;