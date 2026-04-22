/**
 * MainPage — Three-column Write Mode workspace backed by real project data.
 *
 * Layout (top→bottom, left→right):
 *   Header (project switcher, settings, language, mode toggle)
 *   ├── Left column (25%): EvidenceCardPool (45%) + DocumentViewer (55%)
 *   ├── Center column (flex): ArgumentGraph
 *   └── Right column (480px): LetterPanel
 *   ConnectionLines overlays all columns.
 *
 * Must be rendered inside <AppProviders> so DataLoader can fetch
 * project data from the backend when projectId changes.
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUI } from '../../context/UIContext';
import {
  EvidenceCardPool,
  ArgumentGraph,
  ConnectionLines,
  DocumentViewer,
  Header,
} from '../../components';
import { LetterPanel } from '../../components/LetterPanel';

// Force the UI into Write mode on first mount. The Header exposes a toggle
// that users can still flip; this only sets the initial state.
function InitWorkMode() {
  const { setWorkMode } = useUI();
  useEffect(() => {
    setWorkMode('write');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export default function MainPage() {
  // Paper/demo figures historically rendered in English; keep that behavior.
  const { i18n } = useTranslation();
  useEffect(() => { i18n.changeLanguage('en'); }, [i18n]);

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      <InitWorkMode />

      <Header />

      <div className="flex-1 flex overflow-hidden relative">
        <div className="w-[25%] flex-shrink-0 border-r border-slate-200 overflow-hidden flex flex-col relative z-0">
          <div className="h-[45%] border-b border-slate-200 overflow-hidden">
            <EvidenceCardPool />
          </div>
          <div className="h-[55%] overflow-hidden">
            <DocumentViewer compact />
          </div>
        </div>

        <div className="flex-1 bg-white overflow-hidden relative z-0">
          <ArgumentGraph />
        </div>

        <div className="w-[480px] flex-shrink-0 border-l border-slate-200 overflow-hidden relative z-0">
          <LetterPanel className="h-full" />
        </div>
      </div>

      <ConnectionLines />
    </div>
  );
}
