import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import DOMPurify from 'dompurify';
import { z } from 'zod';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (note: string) => void;
  currentNote?: string;
}

const noteSchema = z.string().max(1000, "Note is too long");

const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, onSubmit, currentNote = '' }) => {
  const [note, setNote] = useState(currentNote);
  const [error, setError] = useState('');

  useEffect(() => {
    setNote(currentNote);
    setError('');
  }, [currentNote, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    try {
      const validatedNote = noteSchema.parse(note);
      const sanitizedNote = DOMPurify.sanitize(validatedNote);
      onSubmit(sanitizedNote);
      onClose();
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError("Invalid note");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 m-4">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Add Admin Note</h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        <div className="p-6">
          <textarea
            value={note}
            onChange={(e) => { setNote(e.target.value); setError(''); }}
            className="w-full h-32 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none text-slate-900 dark:text-white placeholder:text-slate-400"
            placeholder="Enter note for admin..."
            autoFocus
          />
          {error && <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>}
          <div className="flex justify-end gap-3 mt-6">
            <button 
              onClick={onClose} 
              className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors flex items-center gap-2"
            >
              <Save size={16} />
              Save Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteModal;
