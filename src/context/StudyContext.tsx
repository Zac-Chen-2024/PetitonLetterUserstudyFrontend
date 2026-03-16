import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react';
import type {
  StudyStep, CounterbalanceConfig,
  MaterialSetResult, Phase2Result, SurveyResponse, StudyRecord,
} from '../types/index.ts';

const API_BASE = 'https://plus.drziangchen.uk/api';

// ── State shape ──
interface StudyState {
  participantId: string;
  isVolunteer: boolean;
  currentStep: StudyStep;
  counterbalance: CounterbalanceConfig | null;
  phase1Results: MaterialSetResult[];
  phase2Result: Phase2Result | null;
  phase3Survey: SurveyResponse;
  totalElapsed: number;
  startedAt: string;
}

const initialState: StudyState = {
  participantId: '',
  isVolunteer: false,
  currentStep: 'phase1',
  counterbalance: null,
  phase1Results: [],
  phase2Result: null,
  phase3Survey: {},
  totalElapsed: 0,
  startedAt: '',
};

// ── Actions ──
type Action =
  | { type: 'SET_PARTICIPANT'; id: string; isVolunteer: boolean }
  | { type: 'SET_STEP'; step: StudyStep }
  | { type: 'SET_COUNTERBALANCE'; config: CounterbalanceConfig }
  | { type: 'ADD_PHASE1_RESULT'; result: MaterialSetResult }
  | { type: 'SET_PHASE1_RESULTS'; results: MaterialSetResult[] }
  | { type: 'SET_PHASE2_RESULT'; result: Phase2Result }
  | { type: 'SET_PHASE3_SURVEY'; data: SurveyResponse }
  | { type: 'SET_TOTAL_ELAPSED'; seconds: number }
  | { type: 'RESTORE'; state: StudyState };

function reducer(state: StudyState, action: Action): StudyState {
  switch (action.type) {
    case 'SET_PARTICIPANT':
      return { ...state, participantId: action.id, isVolunteer: action.isVolunteer, startedAt: new Date().toISOString() };
    case 'SET_STEP':
      return { ...state, currentStep: action.step };
    case 'SET_COUNTERBALANCE':
      return { ...state, counterbalance: action.config };
    case 'ADD_PHASE1_RESULT':
      return { ...state, phase1Results: [...state.phase1Results, action.result] };
    case 'SET_PHASE1_RESULTS':
      return { ...state, phase1Results: action.results };
    case 'SET_PHASE2_RESULT':
      return { ...state, phase2Result: action.result };
    case 'SET_PHASE3_SURVEY':
      return { ...state, phase3Survey: action.data };
    case 'SET_TOTAL_ELAPSED':
      return { ...state, totalElapsed: action.seconds };
    case 'RESTORE':
      return action.state;
    default:
      return state;
  }
}

// ── Context ──
interface StudyContextValue {
  state: StudyState;
  dispatch: React.Dispatch<Action>;
  exportRecord: () => StudyRecord;
  submitToBackend: () => Promise<boolean>;
  hasExistingSession: (id: string) => boolean;
  restoreSession: (id: string) => boolean;
}

const StudyContext = createContext<StudyContextValue | null>(null);

function storageKey(id: string) {
  return `userstudy_${id}`;
}

export function StudyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Persist to localStorage on every state change
  useEffect(() => {
    if (state.participantId) {
      localStorage.setItem(storageKey(state.participantId), JSON.stringify(state));
    }
  }, [state]);

  const hasExistingSession = useCallback((id: string) => {
    return localStorage.getItem(storageKey(id)) !== null;
  }, []);

  const restoreSession = useCallback((id: string) => {
    const raw = localStorage.getItem(storageKey(id));
    if (raw) {
      try {
        const saved = JSON.parse(raw) as StudyState;
        dispatch({ type: 'RESTORE', state: saved });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }, []);

  const exportRecord = useCallback((): StudyRecord => {
    return {
      version: '1.0',
      participant: {
        id: state.participantId,
      },
      counterbalance: state.counterbalance ?? {
        phase1ColumnOrder: [0, 1, 2],
        seed: 0,
      },
      phase1: { materialSets: state.phase1Results },
      phase2: state.phase2Result,
      phase3: state.phase3Survey,
      totalDuration: state.totalElapsed,
    };
  }, [state]);

  const submitToBackend = useCallback(async (override?: Partial<StudyRecord>): Promise<boolean> => {
    if (!state.isVolunteer) return false;
    try {
      const record = { ...exportRecord(), ...override };
      const res = await fetch(`${API_BASE}/study/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: state.participantId,
          data: record,
        }),
      });
      return res.ok;
    } catch (e) {
      console.error('Failed to submit study results:', e);
      return false;
    }
  }, [state, exportRecord]);

  return (
    <StudyContext.Provider value={{ state, dispatch, exportRecord, submitToBackend, hasExistingSession, restoreSession }}>
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error('useStudy must be used within StudyProvider');
  return ctx;
}
