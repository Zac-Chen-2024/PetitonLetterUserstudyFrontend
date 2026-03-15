import { useTranslation } from 'react-i18next';
import { useStudy } from '../../context/StudyContext.tsx';
import { STUDY_STEPS } from '../../types/index.ts';

export default function StudyHeader() {
  const { i18n } = useTranslation();
  const { state } = useStudy();

  const currentIndex = STUDY_STEPS.indexOf(state.currentStep);
  const stepLabel = `${currentIndex + 1}/${STUDY_STEPS.length}`;

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(next);
    localStorage.setItem('userstudy_language', next);
  };

  return (
    <header className="h-12 bg-white border-b border-slate-200 flex items-center px-5 gap-4 shrink-0">
      <span className="text-sm font-semibold text-slate-700">
        Phase <span className="text-blue-600 tabular-nums">{stepLabel}</span>
      </span>

      <div className="flex-1" />

      {state.participantId && (
        <span className="text-xs text-slate-500">
          ID: <span className="font-medium text-slate-700">{state.participantId}</span>
        </span>
      )}

      <button
        onClick={toggleLang}
        className="text-xs px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
      >
        {i18n.language === 'en' ? '中文' : 'EN'}
      </button>
    </header>
  );
}
