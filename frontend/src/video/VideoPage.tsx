import { useCallback, useEffect, useRef, useState } from 'react';
import { ConnectionLines, DocumentViewer, EvidenceCardPool, ArgumentGraph } from '../components';
import { LetterPanel } from '../components/LetterPanel';
import { useApp, useArguments, useProject, useSnippets, useWriting } from '../context/AppContext';
import { buildDrHuVideoScenario, DR_HU_VIDEO_PROJECT_ID } from './drHuVideoScenario';
import { buildVideoDemoScene, type VideoDemoSceneKey, type VideoDemoSceneState } from './videoDemoPresets';

type FullFlowDemoStage = 'blank' | 'left-revealed' | 'tree-generating' | 'tree-revealed' | 'letter-generating' | null;

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
  const [activeDemoScene, setActiveDemoScene] = useState<VideoDemoSceneKey | null>(null);
  const [demoSceneState, setDemoSceneState] = useState<VideoDemoSceneState | null>(null);
  const [demoSceneVersion, setDemoSceneVersion] = useState(0);
  const [fullFlowDemoStage, setFullFlowDemoStage] = useState<FullFlowDemoStage>(null);

  const loadDemoScene = useCallback((scene: VideoDemoSceneKey) => {
    setIsGenerationDemoActive(false);
    setFullFlowDemoStage(null);
    setActiveDemoScene(scene);
    setDemoSceneState(buildVideoDemoScene(scene));
    setDemoSceneVersion(prev => prev + 1);
    setFocusState({ type: 'none', id: null });
    setSelectedSnippetId(null);
  }, [setFocusState, setSelectedSnippetId]);

  const startFullFlowDemo = useCallback(() => {
    setIsGenerationDemoActive(false);
    if (demoTimerRef.current !== null) {
      window.clearTimeout(demoTimerRef.current);
      demoTimerRef.current = null;
    }
    setActiveDemoScene(null);
    setDemoSceneState(null);
    setFullFlowDemoStage('blank');
    setFocusState({ type: 'none', id: null });
    setSelectedSnippetId(null);
  }, [setFocusState, setSelectedSnippetId]);

  const advanceFullFlowDemo = useCallback(() => {
    setFullFlowDemoStage(prev => prev === 'blank' ? 'left-revealed' : prev);
  }, []);

  const triggerFullFlowTreeGeneration = useCallback(() => {
    if (fullFlowDemoStage !== 'left-revealed') return;

    setFullFlowDemoStage('tree-generating');
    setIsGenerationDemoActive(true);
    if (demoTimerRef.current !== null) {
      window.clearTimeout(demoTimerRef.current);
    }
    demoTimerRef.current = window.setTimeout(() => {
      setIsGenerationDemoActive(false);
      setFullFlowDemoStage('tree-revealed');
      demoTimerRef.current = null;
    }, 5000);
  }, [fullFlowDemoStage]);

  const finishFullFlowDemo = useCallback(() => {
    if (fullFlowDemoStage !== 'tree-revealed') return;
    setFullFlowDemoStage('letter-generating');
    if (demoTimerRef.current !== null) {
      window.clearTimeout(demoTimerRef.current);
    }
    demoTimerRef.current = window.setTimeout(() => {
      setFullFlowDemoStage(null);
      demoTimerRef.current = null;
    }, 5000);
  }, [fullFlowDemoStage]);

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

  const handleDemoMergeSubArguments = useCallback(async (
    subArgumentIds: string[],
    fallbackTitle: string,
    _purpose: string,
    _relationship: string
  ) => {
    let result: { newArgument: VideoDemoSceneState['arguments'][number]; movedSubArgumentIds: string[] } | null = null;

    setDemoSceneState(prev => {
      if (!prev) return prev;

      const movedIds = new Set(subArgumentIds);
      const movedSubArguments = prev.subArguments.filter(subArgument => movedIds.has(subArgument.id));
      if (movedSubArguments.length === 0) return prev;

      const mergedGoodtwoPair = movedIds.size === 2 &&
        movedIds.has('demo-merge-sub-4') &&
        movedIds.has('demo-merge-sub-5');
      const newArgumentId = `demo-merge-arg-${Date.now()}`;
      const newArgument = {
        id: newArgumentId,
        title: mergedGoodtwoPair ? 'Leadership role at Goodtwo University' : fallbackTitle,
        subject: 'Dr.Hu',
        claimType: 'leading_role' as const,
        snippetIds: [],
        subArgumentIds,
        status: 'verified' as const,
        standardKey: 'leading_role',
        isAIGenerated: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      result = {
        newArgument,
        movedSubArgumentIds: subArgumentIds,
      };

      return {
        ...prev,
        arguments: [
          ...prev.arguments.map(argument => {
            const remainingSubArgumentIds = (argument.subArgumentIds || []).filter(id => !movedIds.has(id));
            const nextTitle = mergedGoodtwoPair && argument.id === 'demo-merge-arg-1'
              ? 'Leadership role at Goodone University'
              : argument.title;
            return {
              ...argument,
              title: nextTitle,
              subArgumentIds: remainingSubArgumentIds,
              updatedAt: new Date(),
            };
          }),
          newArgument,
        ],
        subArguments: prev.subArguments.map(subArgument =>
          movedIds.has(subArgument.id)
            ? { ...subArgument, argumentId: newArgumentId, updatedAt: new Date() }
            : subArgument
        ),
      };
    });

    if (!result) {
      throw new Error('Demo merge scene unavailable');
    }

    return result;
  }, []);

  const handleDemoMoveSubArguments = useCallback(async (subArgumentIds: string[], targetArgumentId: string) => {
    setDemoSceneState(prev => {
      if (!prev) return prev;

      const movedIds = new Set(subArgumentIds);

      return {
        ...prev,
        arguments: prev.arguments.map(argument => {
          const retainedSubArgumentIds = (argument.subArgumentIds || []).filter(id => !movedIds.has(id));
          if (argument.id === targetArgumentId) {
            return {
              ...argument,
              subArgumentIds: [...retainedSubArgumentIds, ...subArgumentIds.filter(id => !retainedSubArgumentIds.includes(id))],
              updatedAt: new Date(),
            };
          }
          return {
            ...argument,
            subArgumentIds: retainedSubArgumentIds,
            updatedAt: new Date(),
          };
        }),
        subArguments: prev.subArguments.map(subArgument =>
          movedIds.has(subArgument.id)
            ? { ...subArgument, argumentId: targetArgumentId, updatedAt: new Date() }
            : subArgument
        ),
      };
    });
  }, []);

  const handleDemoRemoveSubArguments = useCallback(async (subArgumentIds: string[]) => {
    setDemoSceneState(prev => {
      if (!prev) return prev;

      const deletedIds = new Set(subArgumentIds);

      return {
        ...prev,
        arguments: prev.arguments.map(argument => ({
          ...argument,
          subArgumentIds: (argument.subArgumentIds || []).filter(id => !deletedIds.has(id)),
          updatedAt: new Date(),
        })),
        subArguments: prev.subArguments.filter(subArgument => !deletedIds.has(subArgument.id)),
      };
    });
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
        loadDemoScene('consolidate');
        return;
      }

      if (event.code === 'Digit3' || event.key === '3') {
        event.preventDefault();
        loadDemoScene('merge');
        return;
      }

      if (event.code === 'Digit4' || event.key === '4') {
        event.preventDefault();
        loadDemoScene('move');
        return;
      }

      if (event.code === 'Digit5' || event.key === '5') {
        event.preventDefault();
        startFullFlowDemo();
        return;
      }

      if ((event.code === 'Space' || event.key === ' ') && fullFlowDemoStage === 'blank') {
        event.preventDefault();
        advanceFullFlowDemo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [advanceFullFlowDemo, fullFlowDemoStage, loadDemoScene, startFullFlowDemo]);

  useEffect(() => {
    return () => {
      if (demoTimerRef.current !== null) {
        window.clearTimeout(demoTimerRef.current);
        demoTimerRef.current = null;
      }
    };
  }, []);

  const showFullFlowLeftPanel = fullFlowDemoStage !== 'blank' && fullFlowDemoStage !== null;
  const clearFullFlowCanvas = fullFlowDemoStage === 'blank' || fullFlowDemoStage === 'left-revealed' || fullFlowDemoStage === 'tree-generating';
  const clearFullFlowLetter = fullFlowDemoStage !== null;
  const showEmptyFullFlowTree = fullFlowDemoStage === 'blank' || fullFlowDemoStage === 'left-revealed' || fullFlowDemoStage === 'tree-generating';
  const emptyArguments: VideoDemoSceneState['arguments'] = [];
  const emptySubArguments: VideoDemoSceneState['subArguments'] = [];
  const emptyLetterSections: VideoDemoSceneState['letterSections'] = [];

  return (
    <div className="video-layout flex flex-col h-screen bg-slate-100">
      <DrHuVideoScenarioInitializer />
      <VideoRouteInitializer />
      <div className="flex-1 flex overflow-hidden relative">
        <aside className="w-[25%] min-w-[340px] flex-shrink-0 border-r border-slate-200 flex flex-col bg-slate-50 shadow-[4px_0_12px_rgba(0,0,0,0.08)] z-10">
          {fullFlowDemoStage === null ? (
            <>
              <div className="video-evidence-panel h-[42%] min-h-0 border-b border-slate-200 overflow-hidden">
                <EvidenceCardPool />
              </div>
              <div className="h-[58%] min-h-0 overflow-hidden bg-white">
                <DocumentViewer compact />
              </div>
            </>
          ) : (
            <>
              <div className="video-evidence-panel h-[42%] min-h-0 border-b border-slate-200 overflow-hidden">
                <EvidenceCardPool demoEmpty={!showFullFlowLeftPanel} />
              </div>
              <div className="h-[58%] min-h-0 overflow-hidden bg-white">
                <DocumentViewer compact demoEmpty={!showFullFlowLeftPanel} />
              </div>
            </>
          )}
        </aside>

        <section className="video-graph-panel flex-1 min-w-0 bg-white overflow-hidden relative z-0">
          <ArgumentGraph
            demoLoading={isGenerationDemoActive}
            demoPresetActive={activeDemoScene !== null}
            demoSceneKey={activeDemoScene}
            demoSceneVersion={demoSceneVersion}
            demoClearCanvasContent={clearFullFlowCanvas}
            onGenerateClickOverride={fullFlowDemoStage !== null ? triggerFullFlowTreeGeneration : undefined}
            generateButtonDisabledOverride={fullFlowDemoStage === 'blank' || fullFlowDemoStage === 'tree-generating' || fullFlowDemoStage === 'tree-revealed'}
            argumentsOverride={showEmptyFullFlowTree ? emptyArguments : demoSceneState?.arguments}
            subArgumentsOverride={showEmptyFullFlowTree ? emptySubArguments : demoSceneState?.subArguments}
            letterSectionsOverride={demoSceneState?.letterSections}
            removeSubArgumentsOverride={activeDemoScene ? handleDemoRemoveSubArguments : undefined}
            mergeSubArgumentsOverride={activeDemoScene === 'merge' ? handleDemoMergeSubArguments : undefined}
            moveSubArgumentsOverride={activeDemoScene === 'move' ? handleDemoMoveSubArguments : undefined}
            consolidateSubArgumentsOverride={activeDemoScene === 'consolidate' ? handleDemoConsolidateSubArguments : undefined}
          />
        </section>

        <aside className="video-letter-panel w-[485px] flex-shrink-0 border-l border-slate-200 overflow-hidden bg-white shadow-[-4px_0_12px_rgba(0,0,0,0.08)] z-10">
          <LetterPanel
            className="h-full"
            demoClearContent={isGenerationDemoActive || activeDemoScene !== null || clearFullFlowLetter}
            onGenerateAllOverride={fullFlowDemoStage !== null ? finishFullFlowDemo : undefined}
            generateAllDisabledOverride={fullFlowDemoStage === 'blank' || fullFlowDemoStage === 'left-revealed' || fullFlowDemoStage === 'tree-generating' || fullFlowDemoStage === 'letter-generating'}
            generateAllLoadingOverride={fullFlowDemoStage === 'letter-generating'}
            letterSectionsOverride={fullFlowDemoStage !== null ? emptyLetterSections : undefined}
          />
        </aside>
      </div>

      <ConnectionLines />
    </div>
  );
}
