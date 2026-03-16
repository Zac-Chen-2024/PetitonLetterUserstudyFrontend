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

// Left = warm red/rose, Right = cool teal/blue
const LEFT_COLOR = { bg: 'rgb(244, 63, 94)', border: 'rgb(225, 29, 72)' };   // rose-500 / rose-600
const RIGHT_COLOR = { bg: 'rgb(20, 184, 166)', border: 'rgb(13, 148, 136)' }; // teal-500 / teal-600
const NEUTRAL_COLOR = { bg: 'rgb(148, 163, 184)', border: 'rgb(100, 116, 139)' }; // slate-400 / slate-500

function getColor(index: number) {
  if (index < 3) return LEFT_COLOR;
  if (index > 3) return RIGHT_COLOR;
  return NEUTRAL_COLOR;
}

function getIdleColor(index: number) {
  if (index < 3) return 'border-rose-300 hover:border-rose-400';
  if (index > 3) return 'border-teal-300 hover:border-teal-400';
  return 'border-slate-300 hover:border-slate-400';
}

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

      {/* Scale legend bar */}
      <div className="rounded-lg border border-slate-200/80 bg-slate-50 px-6 py-4 mb-6">
        <div className="flex items-end justify-center gap-3">
          {SCALE_LABELS.map((label, i) => {
            const size = CIRCLE_SIZES[i];
            const color = getColor(i);
            return (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div
                  className="rounded-full opacity-60"
                  style={{
                    width: size,
                    height: size,
                    backgroundColor: color.bg,
                  }}
                />
                <span className="text-[10px] text-slate-400 leading-tight text-center w-16">{label}</span>
              </div>
            );
          })}
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
                <span className="text-xs font-medium text-rose-400 w-20 text-right pr-3 shrink-0 leading-snug">
                  Strongly<br />Disagree
                </span>

                <div className="flex items-center gap-2.5 flex-1 justify-center">
                  {SCALE_LABELS.map((label, i) => {
                    const value = i + 1;
                    const isSelected = selected === value;
                    const size = CIRCLE_SIZES[i];
                    const color = getColor(i);

                    return (
                      <button
                        key={value}
                        onClick={() => handleSelect(q.id, value)}
                        title={label}
                        className={`
                          rounded-full border-2 flex items-center justify-center cursor-pointer
                          transition-all duration-200 ease-out active:scale-90
                          ${isSelected ? '' : `${getIdleColor(i)} bg-white hover:scale-110`}
                        `}
                        style={{
                          width: size,
                          height: size,
                          ...(isSelected ? {
                            backgroundColor: color.bg,
                            borderColor: color.border,
                            color: 'white',
                            boxShadow: `0 2px 8px ${color.bg}40`,
                            transform: 'scale(1.1)',
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

                <span className="text-xs font-medium text-teal-400 w-20 pl-3 shrink-0 leading-snug">
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
