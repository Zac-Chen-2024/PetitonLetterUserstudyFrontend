import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SurveyResponse } from '../../types/index.ts';

interface PostTaskSurveyProps {
  onSubmit: (responses: SurveyResponse) => void;
}

const QUESTIONS = [
  {
    id: 'sourceTraceability',
    desc: 'I felt like I could trace each claim in the generated text back to a specific source document and page number.',
  },
  {
    id: 'citationAccuracy',
    desc: 'I felt confident that the exhibit citations (e.g., [Exhibit C2, p.2]) in the generated text accurately pointed to the correct source location.',
  },
  {
    id: 'factualGrounding',
    desc: 'I felt confident that the generated text only contained facts from the provided source materials, without hallucinated or fabricated information.',
  },
  {
    id: 'argumentOrganization',
    desc: 'I felt like the tool helped me organize evidence into a coherent legal argument structure.',
  },
  {
    id: 'legalReasoningQuality',
    desc: 'I felt like the generated text demonstrated sound legal reasoning — not just summarizing facts, but arguing why evidence satisfies the regulatory standard.',
  },
  {
    id: 'processTransparency',
    desc: 'I felt like I understood what the tool was doing at each stage of the writing process and could anticipate what the output would look like.',
  },
  {
    id: 'efficiency',
    desc: 'I felt like using this tool saved me significant time compared to writing the same section from scratch.',
  },
  {
    id: 'trust',
    desc: 'I would trust the generated text enough to include it in an actual petition filing after a brief review.',
  },
  {
    id: 'learnability',
    desc: 'I felt like I could quickly understand how to use the system\'s features without extensive training.',
  },
] as const;

// 7 circles: large → small → large (matching 16personalities)
const CIRCLE_SIZES = [46, 40, 34, 26, 34, 40, 46];

// Green (agree) → gray (neutral) → purple (disagree)
const STROKE_COLORS = [
  '#2a9d6e', // strong green
  '#3aab7a', // green
  '#6abf9a', // light green
  '#b0b0b0', // gray
  '#a78cbf', // light purple
  '#8b5fbf', // purple
  '#7040a0', // strong purple
];

const FILL_COLORS = [
  '#2a9d6e18',
  '#3aab7a18',
  '#6abf9a18',
  '#b0b0b018',
  '#a78cbf18',
  '#8b5fbf18',
  '#7040a018',
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
              {/* Question text */}
              <p className="text-[15px] font-semibold text-slate-800 leading-relaxed mb-5">
                {q.desc}
              </p>

              {/* 7-point scale */}
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium w-16 shrink-0" style={{ color: '#2a9d6e' }}>
                  Agree
                </span>

                <div className="flex items-center gap-3 flex-1 justify-center">
                  {CIRCLE_SIZES.map((size, i) => {
                    const value = i + 1;
                    const isSelected = selected === value;

                    return (
                      <button
                        key={value}
                        onClick={() => handleSelect(q.id, value)}
                        className="transition-all duration-150 ease-out active:scale-90"
                        style={{
                          width: size,
                          height: size,
                          borderRadius: '50%',
                          border: `2.5px solid ${STROKE_COLORS[i]}`,
                          backgroundColor: isSelected ? FILL_COLORS[i] : 'transparent',
                          cursor: 'pointer',
                          transform: isSelected ? 'scale(1.08)' : undefined,
                          boxShadow: isSelected ? `0 0 0 3px ${FILL_COLORS[i]}` : undefined,
                        }}
                      />
                    );
                  })}
                </div>

                <span className="text-sm font-medium w-16 shrink-0 text-right" style={{ color: '#7040a0' }}>
                  Disagree
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
