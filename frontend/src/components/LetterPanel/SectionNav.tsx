import { useEffect, useRef } from 'react';
import type { LetterSection } from '../../types';

interface SectionNavProps {
  sections: LetterSection[];
  activeSection: string | null;
  onSectionClick: (sectionId: string) => void;
  generatingStandard?: string;
  rewritingStandard?: string | null;
}

export function SectionNav({ sections, activeSection, onSectionClick, generatingStandard, rewritingStandard }: SectionNavProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Auto-scroll nav to keep active tab visible
  useEffect(() => {
    if (!activeSection) return;
    const tab = tabRefs.current.get(activeSection);
    if (tab && navRef.current) {
      tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeSection]);

  // Auto-scroll to the latest stale section tab
  useEffect(() => {
    const lastStale = [...sections].reverse().find(s => s.isStale);
    if (!lastStale) return;
    const tab = tabRefs.current.get(lastStale.id);
    if (tab && navRef.current) {
      tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [sections, generatingStandard, rewritingStandard]);

  return (
    <div className="flex-shrink-0 bg-white shadow-md relative z-10">
      <div ref={navRef} className="flex overflow-x-auto scrollbar-hide">
        {sections.map((section, idx) => {
          const isActive = activeSection === section.id;
          const isStale = section.isStale && generatingStandard !== section.standardId && rewritingStandard !== section.standardId;
          return (
            <button
              key={section.id}
              ref={(el) => { if (el) tabRefs.current.set(section.id, el); }}
              onClick={() => onSectionClick(section.id)}
              className={`relative px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-all
                ${isActive
                  ? 'text-blue-600'
                  : isStale
                    ? 'text-amber-700'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            >
              <span className="flex items-center gap-1.5">
                {(generatingStandard === section.standardId || rewritingStandard === section.standardId) ? (
                  <svg className="animate-spin w-4 h-4 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold
                    ${isActive
                      ? 'bg-blue-600 text-white'
                      : isStale
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-200 text-slate-500'}`}>
                    {idx + 1}
                  </span>
                )}
                {section.title}
                {isStale && (
                  <span className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0 animate-stale-glow" title="Content out of date" />
                )}
              </span>
              {/* Active indicator line */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
