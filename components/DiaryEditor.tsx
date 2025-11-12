import React, { useState, useEffect } from 'react';
import { DiaryEntry } from '../types';

interface DiaryEditorProps {
  entry?: DiaryEntry;
  onSave: (entryData: Omit<DiaryEntry, 'id' | 'date' | 'owner_id' | 'created_at'>, id?: string) => void;
  onCancel: () => void;
}

const DiaryEditor: React.FC<DiaryEditorProps> = ({ entry, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setContent(entry.content);
    }
  }, [entry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() === '' || content.trim() === '') {
      alert('Please fill out both title and content.');
      return;
    }
    onSave({ title, content }, entry?.id);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-slate-200 animate-fade-in">
      <h1 className="text-3xl font-bold text-slate-900 mb-6 border-b pb-4">
        {entry ? 'Edit Entry' : 'New Entry'}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="A beautiful day"
            required
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-1">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={15}
            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Write about your day..."
            required
          />
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
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