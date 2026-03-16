import { useTranslation } from 'react-i18next';
import type { DimensionDef } from '../../types/index.ts';
import ScoreSlider from './ScoreSlider.tsx';

interface DimensionRatingProps {
  dimension: DimensionDef;
  value: number;
  onChange: (value: number) => void;
}

export default function DimensionRating({ dimension, value, onChange }: DimensionRatingProps) {
  const { i18n } = useTranslation();
  const name = i18n.language === 'zh' ? dimension.name_zh : dimension.name_en;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[11px] font-semibold text-slate-600 tracking-tight">{name}</span>
        <span className="text-[10px] text-slate-400 tabular-nums">{dimension.min}–{dimension.max}</span>
      </div>
      <ScoreSlider value={value} onChange={onChange} min={dimension.min} max={dimension.max} />
    </div>
  );
}
