import type { Argument, ArgumentClaimType, ArgumentStatus, LetterSection, SubArgument } from '../types';

export type VideoDemoSceneKey = 'consolidate' | 'merge';

export interface VideoDemoSceneState {
  arguments: Argument[];
  subArguments: SubArgument[];
  letterSections: LetterSection[];
}

const DEMO_TIMESTAMP = new Date('2026-04-06T21:30:00Z');

function makeArgument(
  id: string,
  title: string,
  standardKey: string,
  subArgumentIds: string[],
  claimType: ArgumentClaimType
): Argument {
  return {
    id,
    title,
    subject: 'Dr.Hu',
    claimType,
    snippetIds: [],
    subArgumentIds,
    status: 'verified' as ArgumentStatus,
    standardKey,
    isAIGenerated: false,
    createdAt: DEMO_TIMESTAMP,
    updatedAt: DEMO_TIMESTAMP,
  };
}

function makeSubArgument(
  id: string,
  argumentId: string,
  title: string,
  relationship = 'Supports',
  snippetCount = 2
): SubArgument {
  return {
    id,
    argumentId,
    title,
    purpose: title,
    relationship,
    snippetIds: Array.from({ length: snippetCount }, (_, idx) => `${id}-snippet-${idx + 1}`),
    isAIGenerated: false,
    status: 'verified',
    createdAt: DEMO_TIMESTAMP,
    updatedAt: DEMO_TIMESTAMP,
  };
}

function makeSection(id: string, title: string, order: number): LetterSection {
  return {
    id: `demo-section-${id}`,
    title,
    standardId: id,
    content: '',
    isGenerated: true,
    order,
    sentences: [],
    provenanceIndex: {
      bySubArgument: {},
      byArgument: {},
      bySnippet: {},
    },
  };
}

export function buildVideoDemoScene(scene: VideoDemoSceneKey): VideoDemoSceneState {
  if (scene === 'merge') {
    const subArguments = [
      makeSubArgument('demo-merge-sub-1', 'demo-merge-arg-1', 'Goodone institutional reputation'),
      makeSubArgument('demo-merge-sub-2', 'demo-merge-arg-1', 'Goodone CS department reputation'),
      makeSubArgument('demo-merge-sub-3', 'demo-merge-arg-1', "Applicant's role at Goodone"),
      makeSubArgument('demo-merge-sub-4', 'demo-merge-arg-1', 'Goodtwo institutional reputation'),
      makeSubArgument('demo-merge-sub-5', 'demo-merge-arg-1', "Applicant's role at Goodtwo"),
    ];

    return {
      arguments: [
        makeArgument(
          'demo-merge-arg-1',
          'Leadership roles across multiple universities',
          'leading_role',
          subArguments.map(subArg => subArg.id),
          'leading_role'
        ),
      ],
      subArguments,
      letterSections: [makeSection('leading_role', 'Leading Role', 0)],
    };
  }

  const subArguments = [
    makeSubArgument('demo-consolidate-sub-1', 'demo-consolidate-arg-1', 'Strong institutional reputation'),
    makeSubArgument('demo-consolidate-sub-2', 'demo-consolidate-arg-1', 'Strong CS department reputation'),
    makeSubArgument('demo-consolidate-sub-3', 'demo-consolidate-arg-1', "Applicant's leadership role"),
  ];

  return {
    arguments: [
      makeArgument(
        'demo-consolidate-arg-1',
        'Leadership role at Goodone University',
        'leading_role',
        subArguments.map(subArg => subArg.id),
        'leading_role'
      ),
    ],
    subArguments,
    letterSections: [makeSection('leading_role', 'Leading Role', 0)],
  };
}
