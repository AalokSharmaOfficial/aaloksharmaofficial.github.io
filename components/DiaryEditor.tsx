import React, { useState, useEffect } from 'react';
import { DiaryEntry } from '../types';
import ReactQuill from 'react-quill';

interface DiaryEditorProps {
  entry?: DiaryEntry;
  onSave: (entryData: Omit<DiaryEntry, 'id' | 'owner_id' | 'created_at'>, id?: string) => void;
  onCancel: () => void;
}

const moods = ['😊', '😢', '😠', '😎', '🤔'];

const DiaryEditor: React.FC<DiaryEditorProps> = ({ entry, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<string | undefined>(undefined);
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setContent(entry.content);
      setMood(entry.mood);
      setTags(entry.tags?.join(', ') || '');
    }
  }, [entry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isContentEmpty = !content || content.replace(/<(.|\n)*?>/g, '').trim().length === 0;

    if (title.trim() === '' || isContentEmpty) {
      alert('Please fill out both title and content.');
      return;
    }

    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    onSave({ title, content, mood, tags: tagsArray }, entry?.id);
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 animate-fade-in">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6 border-b dark:border-slate-700 pb-4">
        {entry ? 'Edit Entry' : 'New Entry'}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
            placeholder="A beautiful day"
            required
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Content
          </label>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            className="bg-white dark:bg-slate-700 dark:text-slate-100"
            placeholder="Write about your day..."
            modules={{
              toolbar: [
                ['bold', 'italic', 'underline'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }]
              ],
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Mood
            </label>
            <div className="flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-700/50 p-2">
              {moods.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m === mood ? undefined : m)}
                  className={`flex-1 text-3xl p-2 rounded-md transition-all duration-200 ${mood === m ? 'bg-indigo-200 dark:bg-indigo-500/50 scale-110' : 'hover:bg-slate-200 dark:hover:bg-slate-600/50'}`}
                  aria-pressed={mood === m}
                  aria-label={`Set mood to ${m}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tags
            </label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
              placeholder="work, personal, ideas"
            />
             <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Separate tags with a comma.</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-700">
          <button
            type="button"
            onClick={onCancel}
            className="bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Save Entry
          </button>
        </div>
      </form>
    </div>
  );
};

export default DiaryEditor;