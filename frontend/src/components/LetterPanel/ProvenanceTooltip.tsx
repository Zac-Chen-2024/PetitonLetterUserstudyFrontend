import { useEffect, useRef } from 'react';
import type { SentenceWithProvenance } from '../../types';

interface ProvenanceTooltipProps {
  sentence: SentenceWithProvenance;
  position: { x: number; y: number };
  onClose: () => void;
}

export function ProvenanceTooltip({ sentence, position, onClose }: ProvenanceTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const sentenceTypeLabel = {
    'opening': 'Opening Statement',
    'body': 'Supporting Evidence',
    'closing': 'Conclusion'
  }[sentence.sentence_type || 'body'];

  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-slate-200 p-3 max-w-sm"
      style={{
        left: Math.min(position.x, window.innerWidth - 320),
        top: position.y + 10,
      }}
    >
      <div className="text-xs space-y-2">
        {/* Sentence Type */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Type:</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
            sentence.sentence_type === 'opening' ? 'bg-purple-100 text-purple-700' :
            sentence.sentence_type === 'closing' ? 'bg-green-100 text-green-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {sentenceTypeLabel}
          </span>
        </div>

        {/* SubArgument */}
        {sentence.subargument_id && (
          <div className="flex items-center gap-2">
            <span className="text-slate-500">SubArgument:</span>
            <span className="text-slate-700 font-mono text-[10px]">
              {sentence.subargument_id}
            </span>
          </div>
        )}

        {/* Argument */}
        {sentence.argument_id && (
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Argument:</span>
            <span className="text-slate-700 font-mono text-[10px]">
              {sentence.argument_id}
            </span>
          </div>
        )}

        {/* Exhibit References */}
        {sentence.exhibit_refs && sentence.exhibit_refs.length > 0 && (
          <div className="flex items-start gap-2">
            <span className="text-slate-500">Exhibits:</span>
            <div className="flex flex-wrap gap-1">
              {sentence.exhibit_refs.map((ref, idx) => (
                <span key={idx} className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px]">
                  {ref}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Snippet Count */}
        {sentence.snippet_ids && sentence.snippet_ids.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Sources:</span>
            <span className="text-slate-700">
              {sentence.snippet_ids.length} snippet{sentence.snippet_ids.length > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Edit Status */}
        {sentence.isEdited && (
          <div className="flex items-center gap-2 text-orange-600">
            <span>✏️ Edited</span>
          </div>
        )}
      </div>
    </div>
  );
}
