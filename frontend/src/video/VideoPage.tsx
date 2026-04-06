import { useCallback, useEffect, useRef, useState } from 'react';
import { ConnectionLines, DocumentViewer, EvidenceCardPool, ArgumentGraph } from '../components';
import { LetterPanel } from '../components/LetterPanel';
import { useApp, useArguments, useProject, useSnippets, useWriting } from '../context/AppContext';
import { buildDrHuVideoScenario, DR_HU_VIDEO_PROJECT_ID } from './drHuVideoScenario';
import { buildVideoDemoScene, type VideoDemoSceneState } from './videoDemoPresets';

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
  const { setFocusState, setSelectedSnippetId } = useApp();
  const [isGenerationDemoActive, setIsGenerationDemoActive] = useState(false);
  const demoTimerRef = useRef<number | null>(null);
  const [isConsolidateDemoActive, setIsConsolidateDemoActive] = useState(false);
  const [demoSceneState, setDemoSceneState] = useState<VideoDemoSceneState | null>(null);
  const [demoSceneVersion, setDemoSceneVersion] = useState(0);

  const loadConsolidateDemoScene = useCallback(() => {
    setIsGenerationDemoActive(false);
    setIsConsolidateDemoActive(true);
    setDemoSceneState(buildVideoDemoScene());
    setDemoSceneVersion(prev => prev + 1);
    setFocusState({ type: 'none', id: null });
    setSelectedSnippetId(null);
  }, [setFocusState, setSelectedSnippetId]);

  const handleDemoConsolidateSubArguments = useCallback(async (subArgumentIds: string[], targetArgumentId: string) => {
    let result: { newSubArgument: VideoDemoSceneState['subArguments'][number]; deletedSubArgumentIds: string[] } | null = null;

    setDemoSceneState(prev => {
      if (!prev) return prev;

      const deletedIds = new Set(subArgumentIds);
      const title = deletedIds.has('demo-consolidate-sub-1') && deletedIds.has('demo-consolidate-sub-2')
        ? 'Strong institutional and departmental reputation'
        : 'Combined supporting evidence';
      const newSubArgumentId = `demo-consolidate-sub-${Date.now()}`;
      const mergedSnippetIds = prev.subArguments
        .filter(subArgument => deletedIds.has(subArgument.id))
        .flatMap(subArgument => subArgument.snippetIds);

      const newSubArgument = {
        id: newSubArgumentId,
        argumentId: targetArgumentId,
        title,
        purpose: title,
        relationship: 'Supports',
        snippetIds: mergedSnippetIds,
        isAIGenerated: false,
        status: 'verified' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const nextSubArguments = [
        ...prev.subArguments.filter(subArgument => !deletedIds.has(subArgument.id)),
        newSubArgument,
      ];

      const nextArguments = prev.arguments.map(argument => {
        const filteredIds = (argument.subArgumentIds || []).filter(id => !deletedIds.has(id));
        if (argument.id === targetArgumentId) {
          return {
            ...argument,
            subArgumentIds: [...filteredIds, newSubArgumentId],
            updatedAt: new Date(),
          };
        }
        return {
          ...argument,
          subArgumentIds: filteredIds,
          updatedAt: new Date(),
        };
      });

      result = { newSubArgument, deletedSubArgumentIds: subArgumentIds };
      return {
        ...prev,
        arguments: nextArguments,
        subArguments: nextSubArguments,
      };
    });

    if (!result) {
      throw new Error('Demo consolidate scene unavailable');
    }

    return result;
  }, []);

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

      if (event.code === 'Digit1' || event.key === '1') {
        event.preventDefault();
        triggerGenerationDemo();
        return;
      }

      if (event.code === 'Digit2' || event.key === '2') {
        event.preventDefault();
        loadConsolidateDemoScene();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (demoTimerRef.current !== null) {
        window.clearTimeout(demoTimerRef.current);
      }
    };
  }, [loadConsolidateDemoScene]);

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
          <ArgumentGraph
            demoLoading={isGenerationDemoActive}
            demoPresetActive={isConsolidateDemoActive}
            demoSceneKey={isConsolidateDemoActive ? 'consolidate' : null}
            demoSceneVersion={demoSceneVersion}
            argumentsOverride={demoSceneState?.arguments}
            subArgumentsOverride={demoSceneState?.subArguments}
            letterSectionsOverride={demoSceneState?.letterSections}
            consolidateSubArgumentsOverride={isConsolidateDemoActive ? handleDemoConsolidateSubArguments : undefined}
          />
        </section>

        <aside className="video-letter-panel w-[485px] flex-shrink-0 border-l border-slate-200 overflow-hidden bg-white shadow-[-4px_0_12px_rgba(0,0,0,0.08)] z-10">
          <LetterPanel className="h-full" demoClearContent={isGenerationDemoActive || isConsolidateDemoActive} />
        </aside>
      </div>

      <ConnectionLines />
    </div>
  );
}
