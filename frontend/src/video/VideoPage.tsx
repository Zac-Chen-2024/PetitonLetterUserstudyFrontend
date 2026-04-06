import { useEffect, useRef, useState } from 'react';
import { ConnectionLines, DocumentViewer, EvidenceCardPool, ArgumentGraph } from '../components';
import { LetterPanel } from '../components/LetterPanel';
import { useApp, useArguments, useProject, useSnippets, useWriting } from '../context/AppContext';
import { buildDrHuVideoScenario, DR_HU_VIDEO_PROJECT_ID } from './drHuVideoScenario';

function VideoRouteInitializer() {
  const { setWorkMode, setSelectedDocumentId, setSelectedSnippetId, setFocusState } = useApp();

  useEffect(() => {
    setWorkMode('write');
    setSelectedDocumentId('doc_E9');
    setFocusState({ type: 'subargument', id: 'subarg-judging-01' });
    setSelectedSnippetId('snp_E9_review_materials_vote');
  }, [setFocusState, setSelectedDocumentId, setSelectedSnippetId, setWorkMode]);

  return null;
}

function DrHuVideoScenarioInitializer() {
  const { projectId, isLoading, setPipelineState } = useProject();
  const { allSnippets, setSnippets } = useSnippets();
  const { setArguments, setSubArguments } = useArguments();
  const { setLetterSections } = useWriting();
  const appliedRef = useRef(false);

  useEffect(() => {
    if (projectId !== DR_HU_VIDEO_PROJECT_ID) {
      appliedRef.current = false;
      return;
    }
    if (isLoading || appliedRef.current) {
      return;
    }

    const scenario = buildDrHuVideoScenario(allSnippets);
    setSnippets(scenario.snippets);
    setArguments(scenario.arguments);
    setSubArguments(scenario.subArguments);
    setLetterSections(scenario.letterSections);
    setPipelineState((prev) => ({ ...prev, stage: 'petition_ready' }));
    appliedRef.current = true;
  }, [
    allSnippets,
    isLoading,
    projectId,
    setArguments,
    setLetterSections,
    setPipelineState,
    setSnippets,
    setSubArguments,
  ]);

  return null;
}

export default function VideoPage() {
  const [isGenerationDemoActive, setIsGenerationDemoActive] = useState(false);
  const demoTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const isEditableTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tagName = target.tagName.toLowerCase();
      return target.isContentEditable || tagName === 'input' || tagName === 'textarea' || tagName === 'select';
    };

    const triggerGenerationDemo = () => {
      setIsGenerationDemoActive(true);
      if (demoTimerRef.current !== null) {
        window.clearTimeout(demoTimerRef.current);
      }
      demoTimerRef.current = window.setTimeout(() => {
        setIsGenerationDemoActive(false);
        demoTimerRef.current = null;
      }, 3000);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      if (isEditableTarget(event.target)) return;
      if (event.code !== 'Digit1' && event.key !== '1') return;

      event.preventDefault();
      triggerGenerationDemo();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (demoTimerRef.current !== null) {
        window.clearTimeout(demoTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="video-layout flex flex-col h-screen bg-slate-100">
      <DrHuVideoScenarioInitializer />
      <VideoRouteInitializer />
      <div className="flex-1 flex overflow-hidden relative">
        <aside className="w-[25%] min-w-[340px] flex-shrink-0 border-r border-slate-200 flex flex-col bg-slate-50 shadow-[4px_0_12px_rgba(0,0,0,0.08)] z-10">
          <div className="video-evidence-panel h-[42%] min-h-0 border-b border-slate-200 overflow-hidden">
            <EvidenceCardPool />
          </div>
          <div className="h-[58%] min-h-0 overflow-hidden bg-white">
            <DocumentViewer compact />
          </div>
        </aside>

        <section className="video-graph-panel flex-1 min-w-0 bg-white overflow-hidden relative z-0">
          <ArgumentGraph demoLoading={isGenerationDemoActive} />
        </section>

        <aside className="video-letter-panel w-[485px] flex-shrink-0 border-l border-slate-200 overflow-hidden bg-white shadow-[-4px_0_12px_rgba(0,0,0,0.08)] z-10">
          <LetterPanel className="h-full" demoClearContent={isGenerationDemoActive} />
        </aside>
      </div>

      <ConnectionLines />
    </div>
  );
}
