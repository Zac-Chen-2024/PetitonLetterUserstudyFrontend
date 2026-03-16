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

// 7 circles: large → small → large
const CIRCLE_SIZES = [46, 40, 34, 26, 34, 40, 46];

// Left = Disagree (purple) → neutral (gray) → Right = Agree (green)
const STROKE_COLORS = [
  '#7040a0', // strong purple
  '#8b5fbf', // purple
  '#a78cbf', // light purple
  '#b0b0b0', // gray
  '#6abf9a', // light green
  '#3aab7a', // green
  '#2a9d6e', // strong green
];

export default function PostTaskSurvey({ onSubmit }: PostTaskSurveyProps) {
  const { t } = useTranslation();
  const [responses, setResponses] = useState<SurveyResponse>({});

  const allAnswered = QUESTIONS.every(q => responses[q.id] !== undefined);

  const handleSelect = (questionId: string, value: number) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-8 overflow-y-auto h-full custom-scrollbar">
      {/* Header */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-slate-900 mb-2 tracking-tight">{t('postTask.title')}</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          Please rate your agreement with each statement.
        </p>
      </div>

      {/* Questions */}
      <div>
        {QUESTIONS.map((q, qIdx) => {
          const selected = responses[q.id] as number | undefined;
          return (
            <div key={q.id}>
              {/* Question label + description */}
              <h3 className="text-base font-bold text-slate-900 mb-1 tracking-tight">{q.label}</h3>
              <p className="text-[14px] text-slate-600 leading-relaxed mb-5">
                {q.desc}
              </p>

              {/* 7-point scale: Disagree (left) → Agree (right) */}
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium w-16 shrink-0" style={{ color: '#7040a0' }}>
                  Disagree
                </span>

                <div className="flex items-center gap-3 flex-1 justify-center">
                  {CIRCLE_SIZES.map((size, i) => {
                    const value = i + 1;
                    const isSelected = selected === value;
                    const color = STROKE_COLORS[i];

                    return (
                      <button
                        key={value}
                        onClick={() => handleSelect(q.id, value)}
                        className="transition-all duration-150 ease-out active:scale-90"
                        style={{
                          width: size,
                          height: size,
                          borderRadius: '50%',
                          border: `2.5px solid ${color}`,
                          backgroundColor: isSelected ? color : 'transparent',
                          cursor: 'pointer',
                          transform: isSelected ? 'scale(1.08)' : undefined,
                        }}
                      />
                    );
                  })}
                </div>

                <span className="text-sm font-medium w-16 shrink-0 text-right" style={{ color: '#2a9d6e' }}>
                  Agree
                </span>
              </div>

              {/* Divider */}
              {qIdx < QUESTIONS.length - 1 && (
                <div className="border-b border-slate-100 my-8" />
              )}
            </div>
          );
        })}
      </div>

      {/* Submit */}
      <div className="mt-10 pb-8">
        <button
          onClick={() => onSubmit(responses)}
          disabled={!allAnswered}
          className={`
            w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ease-out
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
