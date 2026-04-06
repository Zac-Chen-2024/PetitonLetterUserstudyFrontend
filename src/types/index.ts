// ── Study flow step tracking ──
export type StudyStep =
  | 'phase1'
  | 'phase2'
  | 'phase3'
  | 'thank-you';

export const STUDY_STEPS: StudyStep[] = [
  'phase1',
  'phase2',
  'phase3',
  'thank-you',
];

// ── Dimension config (loaded from JSON) ──
export interface DimensionDef {
  id: string;
  name_en: string;
  name_zh: string;
  description_en: string;
  description_zh: string;
  min: number;
  max: number;
}

// ── Phase 1 ──
export interface ScrollEvent {
  columnIndex: number;
  scrollPercent: number;
  timestamp: number;
}

export interface SystemRating {
  systemLabel: string;        // "System A" / "System B" / "System C"
  sourceId: string;           // actual source identifier (hidden from participant)
  scores: Record<string, number>;  // dimensionId → score
  comment: string;
}

export interface MaterialSetResult {
  materialId: string;
  columnOrder: string[];      // actual sourceId order as displayed
  readingDuration: number;    // seconds
  scrollEvents: ScrollEvent[];
  ratings: SystemRating[];
}

// ── Phase 2 ──
export interface SurveyResponse {
  [questionId: string]: string | number;
}

export interface Phase2Result {
  duration: number;            // seconds
  completed: boolean;
  likertSurvey: SurveyResponse;
}

// ── Counterbalance ──
export interface CounterbalanceConfig {
  phase1ColumnOrder: number[];    // e.g. [2, 0, 1] means source[2] goes to column A
  seed: number;
}

// ── Full study record ──
export interface StudyRecord {
  version: string;
  participant: {
    id: string;
  };
  counterbalance: CounterbalanceConfig;
  phase1: {
    materialSets: MaterialSetResult[];
  };
  phase2: Phase2Result | null;
  phase3: SurveyResponse;
  totalDuration: number;
}

// ── Stimuli data shape ──
export interface PetitionSection {
  heading: string;
  content: string;
}

export interface StimuliSource {
  sourceId: string;
  sections: PetitionSection[];
}

export interface MaterialData {
  materialId: string;
  title: string;
  sources: StimuliSource[];
}
