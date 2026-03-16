import { useState } from 'react';

const API_BASE = 'https://plus.drziangchen.uk/api';

interface WelcomeModalProps {
  onComplete: (isVolunteer: boolean, participantId: string) => void;
}

export default function WelcomeModal({ onComplete }: WelcomeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleYes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/study/register`, { method: 'POST' });
      if (!res.ok) throw new Error('Registration failed');
      const data = await res.json();
      onComplete(true, data.participantId);
    } catch {
      setError('Failed to connect to server. Please try again.');
      setLoading(false);
    }
  };

  const handleNo = () => {
    const guestId = `guest_${Date.now().toString(36)}`;
    onComplete(false, guestId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 tracking-tight">Welcome to the User Study</h2>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Evidence-First Authoring System Evaluation
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-5 mb-6">
          <p className="text-sm font-medium text-slate-700 text-center mb-1">
            Are you a formal volunteer?
          </p>
          <p className="text-xs text-slate-400 text-center">
            Volunteers will be assigned an ID and their responses will be recorded for research purposes.
          </p>
        </div>

        {error && (
          <p className="text-xs text-red-500 text-center mb-4">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleNo}
            disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all duration-200"
          >
            No, just browsing
          </button>
          <button
            onClick={handleYes}
            disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 shadow-sm disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Registering...
              </span>
            ) : 'Yes, I am'}
          </button>
        </div>
      </div>
    </div>
  );
}
