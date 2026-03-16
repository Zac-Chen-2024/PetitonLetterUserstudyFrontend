import { useRef, useCallback } from 'react';

interface ScoreSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export default function ScoreSlider({ value, onChange, min = 0, max = 100 }: ScoreSliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  const barRef = useRef<HTMLDivElement>(null);

  const calcValue = useCallback((clientX: number) => {
    if (!barRef.current) return value;
    const rect = barRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(min + ratio * (max - min));
  }, [min, max, value]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const el = barRef.current;
    if (!el) return;

    el.setPointerCapture(e.pointerId);
    onChange(calcValue(e.clientX));

    const onMove = (ev: PointerEvent) => onChange(calcValue(ev.clientX));
    const onUp = () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
  }, [calcValue, onChange]);

  return (
    <div
      ref={barRef}
      onPointerDown={handlePointerDown}
      className="relative w-full h-9 rounded-lg overflow-hidden cursor-pointer select-none"
      style={{ backgroundColor: '#e2e8f0' }}
    >
      {/* Filled portion */}
      <div
        className="absolute inset-y-0 left-0 rounded-lg transition-[width] duration-75 ease-out"
        style={{ width: `${pct}%`, backgroundColor: '#2a9d6e' }}
      />
      {/* Value label */}
      <div className="absolute inset-0 flex items-center justify-end pr-3">
        <span className="text-xs font-bold tabular-nums text-slate-800">
          {value}
        </span>
      </div>
    </div>
  );
}
