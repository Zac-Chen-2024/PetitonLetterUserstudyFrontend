import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SurveyResponse } from '../../types/index.ts';

interface PostTaskSurveyProps {
  onSubmit: (responses: SurveyResponse) => void;
}

const QUESTIONS = [
  {
    id: 'sourceTraceability',
    label: 'Source Traceability',
    desc: 'I felt like I could trace each claim in the generated text back to a specific source document and page number.',
  },
  {
    id: 'citationAccuracy',
    label: 'Citation Accuracy',
    desc: 'I felt confident that the exhibit citations (e.g., [Exhibit C2, p.2]) in the generated text accurately pointed to the correct source location.',
  },
  {
    id: 'factualGrounding',
    label: 'Factual Grounding',
    desc: 'I felt confident that the generated text only contained facts from the provided source materials, without hallucinated or fabricated information.',
  },
  {
    id: 'argumentOrganization',
    label: 'Argument Organization',
    desc: 'I felt like the tool helped me organize evidence into a coherent legal argument structure.',
  },
  {
    id: 'legalReasoningQuality',
    label: 'Legal Reasoning Quality',
    desc: 'I felt like the generated text demonstrated sound legal reasoning — not just summarizing facts, but arguing why evidence satisfies the regulatory standard.',
  },
  {
    id: 'processTransparency',
    label: 'Process Transparency',
    desc: 'I felt like I understood what the tool was doing at each stage of the writing process and could anticipate what the output would look like.',
  },
  {
    id: 'efficiency',
    label: 'Efficiency',
    desc: 'I felt like using this tool saved me significant time compared to writing the same section from scratch.',
  },
  {
    id: 'trust',
    label: 'Trust',
    desc: 'I would trust the generated text enough to include it in an actual petition filing after a brief review.',
  },
  {
    id: 'learnability',
    label: 'Learnability',
    desc: 'I felt like I could quickly understand how to use the system\'s features without extensive training.',
  },
] as const;

const SCALE_LABELS = [
  'Strongly Disagree',
  'Disagree',
  'Somewhat Disagree',
  'Neutral',
  'Somewhat Agree',
  'Agree',
  'Strongly Agree',
];

// MBTI-style circle sizes: large on edges, small in the middle
const CIRCLE_SIZES = [44, 38, 32, 28, 32, 38, 44];

// Darker colors — border matches background
const COLORS = [
  'rgb(159, 18, 57)',   // rose-900
  'rgb(190, 18, 60)',   // rose-700
  'rgb(225, 29, 72)',   // rose-600
  'rgb(100, 116, 139)', // slate-500
  'rgb(13, 148, 136)',  // teal-600
  'rgb(15, 118, 110)',  // teal-700
  'rgb(19, 78, 74)',    // teal-900
];

const IDLE_BORDER_COLORS = [
  'border-rose-800 hover:border-rose-700',
  'border-rose-600 hover:border-rose-500',
  'border-rose-500 hover:border-rose-400',
  'border-slate-400 hover:border-slate-500',
  'border-teal-500 hover:border-teal-400',
  'border-teal-600 hover:border-teal-500',
  'border-teal-800 hover:border-teal-700',
];

export default function PostTaskSurvey({ onSubmit }: PostTaskSurveyProps) {
  const { t } = useTranslation();
  const [responses, setResponses] = useState<SurveyResponse>({});

  const allAnswered = QUESTIONS.every(q => responses[q.id] !== undefined);

  const handleSelect = (questionId: string, value: number) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  return (
    <div className="w-full px-8 py-8 overflow-y-auto h-full custom-scrollbar">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-900 mb-2 tracking-tight">{t('postTask.title')}</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          Please rate your agreement with each statement on a 7-point scale.
        </p>
      </div>

      {/* Scale legend bar — circles vertically centered */}
      <div className="rounded-lg border border-slate-200/80 bg-slate-50 px-6 py-4 mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          {SCALE_LABELS.map((_, i) => {
            const size = CIRCLE_SIZES[i];
            return (
              <div key={i} className="flex items-center justify-center" style={{ width: 48 }}>
                <div
                  className="rounded-full opacity-50"
                  style={{
                    width: size,
                    height: size,
                    backgroundColor: COLORS[i],
                  }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex items-start justify-center gap-3">
          {SCALE_LABELS.map((label, i) => (
            <div key={i} className="flex justify-center" style={{ width: 48 }}>
              <span className="text-[10px] text-slate-400 leading-tight text-center">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {QUESTIONS.map((q, qIdx) => {
          const selected = responses[q.id] as number | undefined;
          return (
            <div
              key={q.id}
              className={`rounded-xl border p-5 transition-all duration-200 ease-out ${
                selected !== undefined
                  ? 'border-slate-200 bg-slate-50/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                  : 'border-slate-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)]'
              }`}
            >
              {/* Question text */}
              <div className="flex gap-4 mb-5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-all duration-200 ease-out ${
                  selected !== undefined
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-600 text-white'
                }`}>
                  {qIdx + 1}
                </div>
                <div className="pt-0.5">
                  <h3 className="text-base font-semibold text-slate-900 tracking-tight">{q.label}</h3>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">{q.desc}</p>
                </div>
              </div>

              {/* MBTI-style 7-point Likert scale */}
              <div className="flex items-center px-2">
                <span className="text-xs font-medium text-rose-700 w-20 text-right pr-3 shrink-0 leading-snug">
                  Strongly<br />Disagree
                </span>

                <div className="flex items-center gap-2.5 flex-1 justify-center">
                  {SCALE_LABELS.map((label, i) => {
                    const value = i + 1;
                    const isSelected = selected === value;
                    const size = CIRCLE_SIZES[i];
                    const c = COLORS[i];

                    return (
                      <button
                        key={value}
                        onClick={() => handleSelect(q.id, value)}
                        title={label}
                        className={`
                          rounded-full border-2 flex items-center justify-center cursor-pointer
                          transition-all duration-200 ease-out active:scale-90
                          ${isSelected ? '' : `${IDLE_BORDER_COLORS[i]} bg-white hover:scale-110`}
                        `}
                        style={{
                          width: size,
                          height: size,
                          ...(isSelected ? {
                            backgroundColor: c,
                            borderColor: c,
                            boxShadow: `0 2px 10px ${c}50`,
                            transform: 'scale(1.15)',
                          } : {}),
                        }}
                      >
                        <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                          {value}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <span className="text-xs font-medium text-teal-700 w-20 pl-3 shrink-0 leading-snug">
                  Strongly<br />Agree
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit */}
      <div className="mt-8 pb-8">
        <button
          onClick={() => onSubmit(responses)}
          disabled={!allAnswered}
          className={`
            w-full py-3 rounded-lg text-sm font-semibold transition-all duration-200 ease-out
            ${allAnswered
              ? 'bg-slate-800 text-white hover:bg-slate-900 active:scale-[0.99] shadow-sm hover:shadow-md'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }
          `}
        >
          {allAnswered
            ? t('common.submit')
            : `Please answer all questions (${Object.keys(responses).length}/${QUESTIONS.length})`
          }
        </button>
      </div>
    </div>
  );
}
