import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStudy } from '../context/StudyContext.tsx';
import type { SurveyResponse } from '../types/index.ts';

export default function Phase3Page() {
  const { t } = useTranslation();
  const { dispatch } = useStudy();
  const navigate = useNavigate();

  const [responses, setResponses] = useState<SurveyResponse>({
    openFeedback: '',
  });

  const canSubmit = (responses.openFeedback as string).trim().length > 0;

  const handleSubmit = () => {
    dispatch({ type: 'SET_PHASE3_SURVEY', data: responses });
    dispatch({ type: 'SET_STEP', step: 'thank-you' });
    navigate('/thank-you');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header — same style as Phase 1 & 2 */}
      <div className="px-6 py-3 border-b border-slate-200 shrink-0">
        <h1 className="text-lg font-semibold text-slate-800">Phase 3/3: Subjective Feedback</h1>
        <p className="text-sm text-slate-600 mt-1">Share your thoughts about the system.</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full px-16 py-10">
          <h2 className="text-[28px] font-bold text-slate-900 mb-3">Open Feedback</h2>
          <p className="text-[18px] text-slate-500 mb-5">Please share any additional thoughts, and comments about your experience.</p>
          <textarea
            value={responses.openFeedback as string}
            onChange={(e) => setResponses({ openFeedback: e.target.value })}
            placeholder="Your thoughts..."
            rows={10}
            className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl text-[18px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`
              w-full mt-8 py-5 rounded-2xl text-[22px] font-bold transition-all duration-300
              ${canSubmit
                ? 'bg-slate-800 text-white hover:bg-slate-900 shadow-lg'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            {t('common.submit')}
          </button>
        </div>
      </div>
    </div>
  );
}
