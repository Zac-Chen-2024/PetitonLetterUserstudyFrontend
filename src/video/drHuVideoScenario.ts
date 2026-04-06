import type {
  Argument,
  LetterSection,
  SentenceWithProvenance,
  Snippet,
  SubArgument,
  MaterialType,
} from '../types';

export const DR_HU_VIDEO_PROJECT_ID = 'dr_hu_eb1a';
export const DR_HU_VIDEO_LIVE_EXHIBITS = new Set(['E5', 'E9', 'E10']);
export const DR_HU_VIDEO_STANDARD_ORDER = [
  'leading_role',
  'judging',
  'published_material',
  'scholarly_articles',
  'original_contribution',
] as const;

type StandardKey = typeof DR_HU_VIDEO_STANDARD_ORDER[number];

interface ExhibitMeta {
  id: string;
  title: string;
  shortTitle: string;
  interactive: boolean;
}

const VIDEO_TIMESTAMP = new Date('2026-04-03T19:00:00Z');

export const DR_HU_VIDEO_EXHIBIT_META: Record<string, ExhibitMeta> = {
  A1: { id: 'A1', title: 'Institutional Profile and Faculty Biography', shortTitle: 'Institutional Profile', interactive: false },
  A2: { id: 'A2', title: 'External Review and Program Committee Archive', shortTitle: 'Review Archive', interactive: false },
  B1: { id: 'B1', title: 'Media Coverage Packet', shortTitle: 'Media Coverage', interactive: false },
  C1: { id: 'C1', title: 'Conference Reviewing Materials', shortTitle: 'Conference Review', interactive: false },
  D1: { id: 'D1', title: 'Scholarly Articles and Publication Record', shortTitle: 'Publication Record', interactive: false },
  E1: { id: 'E1', title: 'School of New Media Establishment Notice', shortTitle: 'School Notice', interactive: false },
  E2: { id: 'E2', title: 'Center for Digital Communication Research Profile', shortTitle: 'Center Profile', interactive: false },
  E3: { id: 'E3', title: 'Vice Dean Role Confirmation Memorandum', shortTitle: 'Role Memo', interactive: false },
  E4: { id: 'E4', title: 'Peer Recommendation Letter', shortTitle: 'Peer Letter', interactive: false },
  E5: { id: 'E5', title: 'Vice Dean Appointment Notice', shortTitle: 'Vice Dean Notice', interactive: true },
  E6: { id: 'E6', title: 'Academic Committee Appointment Roster', shortTitle: 'Committee Roster', interactive: false },
  E7: { id: 'E7', title: 'Governance Duties and Committee Notice', shortTitle: 'Governance Notice', interactive: false },
  E8: { id: 'E8', title: 'Industry Forum and Keynote Program', shortTitle: 'Forum Program', interactive: false },
  E9: { id: 'E9', title: 'Expert Review Invitation', shortTitle: 'Review Invitation', interactive: true },
  E10: { id: 'E10', title: 'Joint Research Agreement', shortTitle: 'Research Agreement', interactive: true },
  F1: { id: 'F1', title: 'Research Impact and Adoption Memorandum', shortTitle: 'Impact Memo', interactive: false },
  G1: { id: 'G1', title: 'Citation and Database Record', shortTitle: 'Citation Record', interactive: false },
  H1: { id: 'H1', title: 'Peer Support and Recognition Letter', shortTitle: 'Support Letter', interactive: false },
};

const FALLBACK_LIVE_SNIPPETS: Record<string, Omit<Snippet, 'color'>> = {
  snp_E5_vice_dean: {
    id: 'snp_E5_vice_dean',
    documentId: 'doc_E5',
    exhibitId: 'E5',
    content: 'Upon deliberation and approval by the University, Dr.Hu is hereby appointed Vice Dean of the School of Journalism and Communication, effective as of the date of this notice.',
    summary: 'Official notice appointing Dr.Hu as Vice Dean.',
    boundingBox: { x: 121, y: 268, width: 758, height: 76, page: 1 },
    materialType: 'leadership',
    page: 1,
    subject: 'Dr.Hu',
    subjectRole: 'applicant',
    isApplicantAchievement: true,
    evidenceType: 'leading_role',
  },
  snp_E5_leadership_scope: {
    id: 'snp_E5_leadership_scope',
    documentId: 'doc_E5',
    exhibitId: 'E5',
    content: 'In this capacity, Dr.Hu shall assist with academic planning, faculty affairs, research organization, graduate education, public communication, and external cooperation.',
    summary: 'Vice dean notice listing Dr.Hu’s leadership scope.',
    boundingBox: { x: 121, y: 350, width: 758, height: 93, page: 1 },
    materialType: 'leadership',
    page: 1,
    subject: 'Dr.Hu',
    subjectRole: 'applicant',
    isApplicantAchievement: true,
    evidenceType: 'leading_role',
  },
  snp_E5_governance_duties: {
    id: 'snp_E5_governance_duties',
    documentId: 'doc_E5',
    exhibitId: 'E5',
    content: 'During the term of appointment, Dr.Hu shall attend leadership meetings, coordinate major academic and administrative matters, and submit periodic work reports.',
    summary: 'Vice dean notice confirming continuing governance duties.',
    boundingBox: { x: 121, y: 449, width: 758, height: 76, page: 1 },
    materialType: 'leadership',
    page: 1,
    subject: 'Dr.Hu',
    subjectRole: 'applicant',
    isApplicantAchievement: true,
    evidenceType: 'leading_role',
  },
  snp_E9_expert_reviewer: {
    id: 'snp_E9_expert_reviewer',
    documentId: 'doc_E9',
    exhibitId: 'E9',
    content: 'The University will convene the expert review meeting for the Boya postdoctoral program, and Dr.Hu is respectfully invited to attend and serve as an expert reviewer.',
    summary: 'Invitation naming Dr.Hu as an expert reviewer.',
    boundingBox: { x: 121, y: 363, width: 758, height: 60, page: 1 },
    materialType: 'judging',
    page: 1,
    subject: 'Dr.Hu',
    subjectRole: 'applicant',
    isApplicantAchievement: true,
    evidenceType: 'judging',
  },
  snp_E9_review_materials_vote: {
    id: 'snp_E9_review_materials_vote',
    documentId: 'doc_E9',
    exhibitId: 'E9',
    content: 'During the meeting, Dr.Hu will review the application materials submitted by the School of Journalism and Communication and other departments, introduce the cases during deliberation, and participate in the discussion and voting process.',
    summary: 'Invitation requiring Dr.Hu to review materials and vote.',
    boundingBox: { x: 121, y: 429, width: 758, height: 76, page: 1 },
    materialType: 'judging',
    page: 1,
    subject: 'Dr.Hu',
    subjectRole: 'applicant',
    isApplicantAchievement: true,
    evidenceType: 'judging',
  },
  snp_E9_review_packet: {
    id: 'snp_E9_review_packet',
    documentId: 'doc_E9',
    exhibitId: 'E9',
    content: 'The electronic versions of the selection criteria, recommendation summary, candidate dossier index, and related supporting materials are attached for advance review.',
    summary: 'Invitation attaching review standards and supporting materials.',
    boundingBox: { x: 121, y: 511, width: 758, height: 76, page: 1 },
    materialType: 'judging',
    page: 1,
    subject: 'Boya Postdoctoral Program',
    subjectRole: 'program',
    isApplicantAchievement: true,
    evidenceType: 'judging',
  },
  snp_E10_project_principal: {
    id: 'snp_E10_project_principal',
    documentId: 'doc_E10',
    exhibitId: 'E10',
    content: 'The joint research agreement identifies Dr.Hu as Project Principal and the contact person for the university side.',
    summary: 'Research agreement naming Dr.Hu as Project Principal.',
    boundingBox: { x: 121, y: 357, width: 758, height: 110, page: 1 },
    materialType: 'leadership',
    page: 1,
    subject: 'Dr.Hu',
    subjectRole: 'applicant',
    isApplicantAchievement: true,
    evidenceType: 'leading_role',
  },
  snp_E10_project_summary: {
    id: 'snp_E10_project_summary',
    documentId: 'doc_E10',
    exhibitId: 'E10',
    content: 'The university side was responsible for completing the research program over a multi-year term and delivering phased reports together with a final monograph.',
    summary: 'Research agreement describing multi-year deliverables.',
    boundingBox: { x: 121, y: 147, width: 758, height: 93, page: 2 },
    materialType: 'leadership',
    page: 2,
    subject: 'Commissioned research project',
    subjectRole: 'project',
    isApplicantAchievement: true,
    evidenceType: 'leading_role',
  },
  snp_E10_project_objective: {
    id: 'snp_E10_project_objective',
    documentId: 'doc_E10',
    exhibitId: 'E10',
    content: 'The project objective included consumer-trend research, communication strategy, brand image analysis, and recommendations concerning proposed campaign concepts.',
    summary: 'Research agreement describing strategic project objective.',
    boundingBox: { x: 121, y: 443, width: 758, height: 75, page: 2 },
    materialType: 'leadership',
    page: 2,
    subject: 'Commissioned research project',
    subjectRole: 'project',
    isApplicantAchievement: true,
    evidenceType: 'leading_role',
  },
  snp_E10_work_organization: {
    id: 'snp_E10_work_organization',
    documentId: 'doc_E10',
    exhibitId: 'E10',
    content: 'The work of students and outside researchers remained under the direction of Dr.Hu or other authorized coordinators designated by the university side.',
    summary: 'Research agreement placing personnel under Dr.Hu’s direction.',
    boundingBox: { x: 121, y: 524, width: 758, height: 80, page: 2 },
    materialType: 'leadership',
    page: 2,
    subject: 'Dr.Hu',
    subjectRole: 'applicant',
    isApplicantAchievement: true,
    evidenceType: 'leading_role',
  },
};

const STANDARD_MATERIAL_TYPE: Record<StandardKey, MaterialType> = {
  leading_role: 'leadership',
  judging: 'judging',
  published_material: 'publication',
  scholarly_articles: 'publication',
  original_contribution: 'contribution',
};

const STANDARD_COLORS: Record<StandardKey, string> = {
  leading_role: '#a855f7',
  judging: '#f59e0b',
  published_material: '#3b82f6',
  scholarly_articles: '#0f766e',
  original_contribution: '#ef4444',
};

export function isDrHuVideoRoute(): boolean {
  return typeof window !== 'undefined' && window.location.pathname === '/video';
}

export function isDrHuVideoExhibitInteractive(exhibitId: string): boolean {
  return DR_HU_VIDEO_LIVE_EXHIBITS.has(exhibitId.toUpperCase());
}

export function getDrHuVideoExhibitTitle(exhibitId: string): string {
  const normalized = exhibitId.toUpperCase();
  const meta = DR_HU_VIDEO_EXHIBIT_META[normalized];
  return meta ? `Exhibit ${normalized} · ${meta.title}` : `Exhibit ${normalized}`;
}

export function getDrHuVideoExhibitShortTitle(exhibitId: string): string {
  const normalized = exhibitId.toUpperCase();
  const meta = DR_HU_VIDEO_EXHIBIT_META[normalized];
  return meta ? meta.shortTitle : `Exhibit ${normalized}`;
}

function buildSummary(text: string): string {
  return text.length > 92 ? `${text.slice(0, 89)}...` : text;
}

function makeMockSnippet(
  id: string,
  exhibitId: string,
  text: string,
  evidenceType: StandardKey,
  page = 1,
  subject = 'Dr.Hu',
): Snippet {
  return {
    id,
    documentId: `doc_${exhibitId}`,
    exhibitId,
    content: text,
    summary: buildSummary(text),
    boundingBox: {
      x: 120,
      y: 180 + ((Object.keys(FALLBACK_LIVE_SNIPPETS).length + id.length) % 6) * 56,
      width: 760,
      height: 72,
      page,
    },
    materialType: STANDARD_MATERIAL_TYPE[evidenceType],
    color: STANDARD_COLORS[evidenceType],
    page,
    subject,
    subjectRole: subject === 'Dr.Hu' ? 'applicant' : 'supporting_source',
    isApplicantAchievement: true,
    evidenceType,
  };
}

function ensureLiveSnippet(snippetMap: Map<string, Snippet>, snippetId: string): Snippet {
  const existing = snippetMap.get(snippetId);
  if (existing) {
    return {
      ...existing,
      color: existing.color || STANDARD_COLORS[(existing.evidenceType as StandardKey) || 'leading_role'],
    };
  }

  const fallback = FALLBACK_LIVE_SNIPPETS[snippetId];
  if (!fallback) {
    throw new Error(`Missing fallback snippet for ${snippetId}`);
  }

  return {
    ...fallback,
    color: STANDARD_COLORS[(fallback.evidenceType as StandardKey) || 'leading_role'],
  };
}

function makeSentence(
  text: string,
  snippetIds: string[],
  options: {
    subargumentId?: string | null;
    argumentId?: string | null;
    exhibitRefs?: string[];
    sentenceType?: 'opening' | 'body' | 'closing';
  } = {},
): SentenceWithProvenance {
  return {
    text,
    snippet_ids: snippetIds,
    subargument_id: options.subargumentId ?? null,
    argument_id: options.argumentId ?? null,
    exhibit_refs: options.exhibitRefs || [],
    sentence_type: options.sentenceType || 'body',
  };
}

function buildProvenanceIndex(sentences: SentenceWithProvenance[]) {
  const bySubArgument: Record<string, number[]> = {};
  const byArgument: Record<string, number[]> = {};
  const bySnippet: Record<string, number[]> = {};

  sentences.forEach((sentence, idx) => {
    if (sentence.subargument_id) {
      bySubArgument[sentence.subargument_id] ||= [];
      bySubArgument[sentence.subargument_id].push(idx);
    }
    if (sentence.argument_id) {
      byArgument[sentence.argument_id] ||= [];
      byArgument[sentence.argument_id].push(idx);
    }
    sentence.snippet_ids.forEach((snippetId) => {
      bySnippet[snippetId] ||= [];
      bySnippet[snippetId].push(idx);
    });
  });

  return { bySubArgument, byArgument, bySnippet };
}

function makeSection(
  standardId: StandardKey,
  title: string,
  order: number,
  sentences: SentenceWithProvenance[],
): LetterSection {
  return {
    id: `section-${standardId}`,
    title,
    standardId,
    content: sentences.map((sentence) => sentence.text).join(' '),
    isGenerated: true,
    order,
    sentences,
    provenanceIndex: buildProvenanceIndex(sentences),
  };
}

function makeArgument(
  id: string,
  title: string,
  standardKey: StandardKey,
  snippetIds: string[],
  subArgumentIds: string[],
  claimType: Argument['claimType'],
): Argument {
  return {
    id,
    title,
    subject: 'Dr.Hu',
    claimType,
    snippetIds,
    subArgumentIds,
    status: 'verified',
    standardKey,
    isAIGenerated: false,
    createdAt: VIDEO_TIMESTAMP,
    updatedAt: VIDEO_TIMESTAMP,
  };
}

function makeSubArgument(
  id: string,
  argumentId: string,
  title: string,
  purpose: string,
  relationship: string,
  snippetIds: string[],
): SubArgument {
  return {
    id,
    argumentId,
    title,
    purpose,
    relationship,
    snippetIds,
    pendingSnippetIds: [],
    needsSnippetConfirmation: false,
    isAIGenerated: false,
    status: 'verified',
    createdAt: VIDEO_TIMESTAMP,
    updatedAt: VIDEO_TIMESTAMP,
  };
}

export function buildDrHuVideoScenario(sourceSnippets: Snippet[]) {
  const baseLiveSnippets = sourceSnippets.filter(
    (snippet) => !snippet.id.startsWith('vid_') && snippet.exhibitId && DR_HU_VIDEO_LIVE_EXHIBITS.has(snippet.exhibitId.toUpperCase()),
  );
  const liveSnippetMap = new Map(baseLiveSnippets.map((snippet) => [snippet.id, snippet]));

  const liveSnippets = [
    ensureLiveSnippet(liveSnippetMap, 'snp_E5_vice_dean'),
    ensureLiveSnippet(liveSnippetMap, 'snp_E5_leadership_scope'),
    ensureLiveSnippet(liveSnippetMap, 'snp_E5_governance_duties'),
    ensureLiveSnippet(liveSnippetMap, 'snp_E9_expert_reviewer'),
    ensureLiveSnippet(liveSnippetMap, 'snp_E9_review_materials_vote'),
    ensureLiveSnippet(liveSnippetMap, 'snp_E9_review_packet'),
    ensureLiveSnippet(liveSnippetMap, 'snp_E10_project_principal'),
    ensureLiveSnippet(liveSnippetMap, 'snp_E10_project_summary'),
    ensureLiveSnippet(liveSnippetMap, 'snp_E10_project_objective'),
    ensureLiveSnippet(liveSnippetMap, 'snp_E10_work_organization'),
  ];

  const mockSnippets: Snippet[] = [
    makeMockSnippet('vid_A1_institution_profile', 'A1', 'The School of Journalism and Communication is described as a nationally recognized teaching and research unit with established graduate programs, cross-disciplinary laboratories, and a sustained record of faculty leadership in communication studies.', 'leading_role'),
    makeMockSnippet('vid_A1_rankings_profile', 'A1', 'The broader university materials describe a major national research institution with competitive academic programs, extensive faculty resources, and recognized standing in journalism and media studies.', 'leading_role'),
    makeMockSnippet('vid_E1_school_establishment', 'E1', 'An institutional notice records Dr.Hu among the faculty leaders involved in the establishment and early academic planning of the School of New Media, reflecting direct participation in the creation of a distinguished academic unit.', 'leading_role'),
    makeMockSnippet('vid_E6_academic_committee', 'E6', 'A committee roster identifies Dr.Hu as director of the school academic committee, charged with coordinating faculty review, research planning, and major academic deliberations.', 'leading_role'),
    makeMockSnippet('vid_E7_governance_committee', 'E7', 'A governance notice shows Dr.Hu serving on the academic degree evaluation and appointment committees, confirming continuing authority over institutional academic governance.', 'leading_role'),
    makeMockSnippet('vid_H1_peer_leadership_validation', 'H1', 'A senior peer states that Dr.Hu has been relied upon to shape program development, coordinate interdisciplinary initiatives, and represent the school in major external collaborations.', 'leading_role'),
    makeMockSnippet('vid_H1_external_leadership_role', 'H1', 'The same peer account characterizes Dr.Hu as a scholar regularly entrusted with institution-facing leadership responsibilities because of his standing in journalism and digital communication research.', 'leading_role'),
    makeMockSnippet('vid_A2_review_archive', 'A2', 'A review archive reflects that Dr.Hu was invited to join an external program committee responsible for expert evaluation of submissions and reviewer coordination.', 'judging'),
    makeMockSnippet('vid_C1_review_scope', 'C1', 'Conference reviewing materials indicate that committee members were expected to conduct substantive review, rank submissions, and recommend panels for acceptance.', 'judging'),
    makeMockSnippet('vid_C1_blind_review', 'C1', 'The same materials describe a blind-review process in which reviewers assessed originality, scholarly merit, and field relevance before final program deliberation.', 'judging'),
    makeMockSnippet('vid_C1_scoring_rubric', 'C1', 'The reviewing guidance applies a scoring rubric based on originality, disciplinary relevance, evidentiary support, and presentation quality, showing that the role involved structured evaluation rather than ceremonial participation.', 'judging'),
    makeMockSnippet('vid_B1_feature_profile', 'B1', 'A professional media profile discusses Dr.Hu’s research on digital communication and identifies him as a leading scholar shaping discourse on media strategy and audience analysis.', 'published_material'),
    makeMockSnippet('vid_B1_interview_quote', 'B1', 'The article quotes Dr.Hu at length regarding media transformation, platform governance, and communication trends, showing that the publication was specifically about his expertise and work.', 'published_material'),
    makeMockSnippet('vid_B1_outlet_profile', 'B1', 'The outlet describes the profile as part of an expert-feature series highlighting recognized scholarly and professional voices whose work shaped communication research and industry understanding.', 'published_material'),
    makeMockSnippet('vid_H1_recognition_summary', 'H1', 'A supporting letter notes that Dr.Hu’s work has been featured in professional publications and institutional reports because his scholarship is regarded as influential within the field.', 'published_material'),
    makeMockSnippet('vid_D1_publication_list', 'D1', 'A publication record lists Dr.Hu as the author or co-author of peer-reviewed journal articles and scholarly monographs addressing communication theory, digital culture, and media analytics.', 'scholarly_articles'),
    makeMockSnippet('vid_D1_peer_reviewed_articles', 'D1', 'Selected entries show articles published in academic journals devoted to journalism, communication, and media research, demonstrating sustained authorship of scholarly work.', 'scholarly_articles'),
    makeMockSnippet('vid_D1_journal_placement', 'D1', 'The publication record further reflects placement in journals serving communication and journalism scholars, indicating dissemination through recognized professional channels.', 'scholarly_articles'),
    makeMockSnippet('vid_G1_database_record', 'G1', 'A database and citation record compiles Dr.Hu’s indexed publications and citations, corroborating that his authored articles circulated in recognized scholarly venues.', 'scholarly_articles'),
    makeMockSnippet('vid_G1_citation_trend', 'G1', 'The database printout shows continuing citation activity and indexing coverage for Dr.Hu’s publication record, reinforcing the scholarly visibility of the authored works.', 'scholarly_articles'),
    makeMockSnippet('vid_E2_center_profile', 'E2', 'A center profile describes research programs led by Dr.Hu on digital communication, public-opinion analysis, and market-media studies, showing that his work helped define institutional research directions.', 'original_contribution'),
    makeMockSnippet('vid_E2_research_programs', 'E2', 'The same profile explains that Dr.Hu’s research agenda linked communication theory, digital behavior, and applied media analysis in a way that shaped multiple center-led projects.', 'original_contribution'),
    makeMockSnippet('vid_F1_method_adoption', 'F1', 'An impact memorandum states that Dr.Hu’s analytical framework was adopted in collaborative research and strategic consulting projects to guide audience segmentation, communication planning, and brand-position analysis.', 'original_contribution'),
    makeMockSnippet('vid_F1_policy_impact', 'F1', 'The memorandum further explains that the resulting findings informed media strategy recommendations, research deliverables, and downstream planning for institutional and industry partners.', 'original_contribution'),
    makeMockSnippet('vid_F1_external_uptake', 'F1', 'The record also notes that partner organizations continued to rely on the resulting analytical framework and recommendations in subsequent planning and evaluation work.', 'original_contribution'),
    makeMockSnippet('vid_H1_methodology_validation', 'H1', 'A peer scholar credits Dr.Hu with developing a research approach that has been taught, reused, and cited by younger scholars working in communication and digital-media studies.', 'original_contribution'),
  ];

  const snippets = [...mockSnippets, ...liveSnippets];

  const arguments_: Argument[] = [
    makeArgument('arg-leading-role-03', 'Distinguished institutional platform and program-building context', 'leading_role', ['vid_A1_institution_profile', 'vid_A1_rankings_profile', 'vid_E1_school_establishment'], ['subarg-leading-role-03'], 'leading_role'),
    makeArgument('arg-leading-role-01', 'Formal vice-dean appointment with continuing governance authority', 'leading_role', ['snp_E5_vice_dean', 'snp_E5_leadership_scope', 'snp_E5_governance_duties', 'vid_E6_academic_committee', 'vid_E7_governance_committee'], ['subarg-leading-role-01', 'subarg-leading-role-01b'], 'leading_role'),
    makeArgument('arg-leading-role-02', 'Project-principal responsibility in a substantial external engagement', 'leading_role', ['snp_E10_project_principal', 'snp_E10_project_summary', 'snp_E10_project_objective', 'snp_E10_work_organization', 'vid_H1_peer_leadership_validation', 'vid_H1_external_leadership_role'], ['subarg-leading-role-02', 'subarg-leading-role-02b'], 'leading_role'),
    makeArgument('arg-judging-01', 'Structured university expert-review and voting authority', 'judging', ['snp_E9_expert_reviewer', 'snp_E9_review_materials_vote', 'snp_E9_review_packet'], ['subarg-judging-01', 'subarg-judging-01b'], 'judging'),
    makeArgument('arg-judging-02', 'External conference and program-committee review service', 'judging', ['vid_A2_review_archive', 'vid_C1_review_scope', 'vid_C1_blind_review', 'vid_C1_scoring_rubric'], ['subarg-judging-02', 'subarg-judging-02b'], 'judging'),
    makeArgument('arg-published-material-01', 'Professional publications specifically discussing Dr.Hu and his research', 'published_material', ['vid_B1_feature_profile', 'vid_B1_interview_quote', 'vid_B1_outlet_profile'], ['subarg-published-material-01', 'subarg-published-material-01b'], 'media'),
    makeArgument('arg-published-material-02', 'Independent supporting materials confirming publication attention', 'published_material', ['vid_H1_recognition_summary'], ['subarg-published-material-02'], 'media'),
    makeArgument('arg-scholarly-articles-01', 'Authorship of scholarly articles in field-relevant journals, corroborated by indexing and citation support', 'scholarly_articles', ['vid_D1_publication_list', 'vid_D1_peer_reviewed_articles', 'vid_D1_journal_placement', 'vid_G1_database_record', 'vid_G1_citation_trend'], ['subarg-scholarly-articles-01', 'subarg-scholarly-articles-01b', 'subarg-scholarly-articles-02'], 'publication'),
    makeArgument('arg-original-contribution-01', 'Research programs shaped by Dr.Hu’s analytical agenda', 'original_contribution', ['vid_E2_center_profile', 'vid_E2_research_programs'], ['subarg-original-contribution-01'], 'contribution'),
    makeArgument('arg-original-contribution-02', 'Adoption of Dr.Hu’s methods in collaborative and strategic work', 'original_contribution', ['vid_F1_method_adoption', 'vid_F1_policy_impact', 'vid_F1_external_uptake', 'snp_E10_project_objective'], ['subarg-original-contribution-01b', 'subarg-original-contribution-01c'], 'contribution'),
    makeArgument('arg-original-contribution-03', 'Peer validation of methodological significance and reuse', 'original_contribution', ['vid_H1_methodology_validation', 'vid_G1_database_record', 'vid_G1_citation_trend'], ['subarg-original-contribution-02'], 'contribution'),
  ];

  const subArguments: SubArgument[] = [
    makeSubArgument('subarg-leading-role-03', 'arg-leading-role-03', 'Distinguished university platform and program-building context', 'Show that Dr.Hu operated within a distinguished institutional setting and contributed to the development of a strategic academic unit.', 'Establishes institutional distinction and program-building context.', ['vid_A1_institution_profile', 'vid_A1_rankings_profile', 'vid_E1_school_establishment']),
    makeSubArgument('subarg-leading-role-01', 'arg-leading-role-01', 'Vice-dean appointment and enumerated leadership portfolio', 'Show that Dr.Hu held a formal senior title accompanied by core academic and administrative functions.', 'Defines formal appointment authority and leadership scope.', ['snp_E5_vice_dean', 'snp_E5_leadership_scope']),
    makeSubArgument('subarg-leading-role-01b', 'arg-leading-role-01', 'Committee-based governance and continuing decision-making authority', 'Show that the role included real governance authority over academic and personnel matters.', 'Establishes ongoing governance and institutional control.', ['snp_E5_governance_duties', 'vid_E6_academic_committee', 'vid_E7_governance_committee']),
    makeSubArgument('subarg-leading-role-02', 'arg-leading-role-02', 'Project-principal responsibility over deliverables and project personnel', 'Show that Dr.Hu directed a substantial research engagement with defined deliverables and supervised project personnel.', 'Assigns project leadership and operational control.', ['snp_E10_project_principal', 'snp_E10_project_summary', 'snp_E10_work_organization']),
    makeSubArgument('subarg-leading-role-02b', 'arg-leading-role-02', 'External validation of leadership significance', 'Show that outside peers regarded Dr.Hu as a leader whose role extended beyond internal administration.', 'Shows external recognition of leadership significance.', ['snp_E10_project_objective', 'vid_H1_peer_leadership_validation', 'vid_H1_external_leadership_role']),
    makeSubArgument('subarg-judging-01', 'arg-judging-01', 'Expert-review invitation and designation', 'Show that the university specifically selected Dr.Hu to serve as an expert reviewer.', 'Delegates formal expert-review authority.', ['snp_E9_expert_reviewer']),
    makeSubArgument('subarg-judging-01b', 'arg-judging-01', 'Advance review packet and voting responsibility', 'Show that the role required substantive review, deliberation, and voting rather than ceremonial attendance.', 'Requires substantive review and voting judgment.', ['snp_E9_review_materials_vote', 'snp_E9_review_packet']),
    makeSubArgument('subarg-judging-02', 'arg-judging-02', 'External reviewing assignments and blind-review service', 'Show additional non-university reviewing activity involving substantive assessment of others’ work.', 'Documents outside judging activity.', ['vid_A2_review_archive', 'vid_C1_review_scope', 'vid_C1_blind_review']),
    makeSubArgument('subarg-judging-02b', 'arg-judging-02', 'Structured scoring criteria for external review work', 'Show that the external review activity applied formal standards and evaluative scoring.', 'Defines structured external review criteria.', ['vid_C1_scoring_rubric']),
    makeSubArgument('subarg-published-material-01', 'arg-published-material-01', 'Media profile centered on Dr.Hu’s work', 'Show that professional media published material about Dr.Hu and his research.', 'Profiles Dr.Hu as the subject of published material.', ['vid_B1_feature_profile', 'vid_B1_interview_quote']),
    makeSubArgument('subarg-published-material-01b', 'arg-published-material-01', 'Editorial framing of the outlet’s expert-feature coverage', 'Show that the coverage appeared in an expert-feature format centered on recognized voices.', 'Provides outlet context for publication significance.', ['vid_B1_outlet_profile']),
    makeSubArgument('subarg-published-material-02', 'arg-published-material-02', 'Independent confirmation that Dr.Hu attracted publication attention', 'Reinforce that published attention attached to Dr.Hu’s own accomplishments and public standing.', 'Confirms independent publication attention.', ['vid_H1_recognition_summary']),
    makeSubArgument('subarg-scholarly-articles-01', 'arg-scholarly-articles-01', 'Publication record showing sustained scholarly authorship', 'Show repeated authorship of articles and scholarly books across the field.', 'Documents sustained authorship.', ['vid_D1_publication_list']),
    makeSubArgument('subarg-scholarly-articles-01b', 'arg-scholarly-articles-01', 'Placement in journals serving the communication field', 'Show that the written works appeared in academic venues relevant to journalism and communication research.', 'Shows dissemination through recognized scholarly venues.', ['vid_D1_peer_reviewed_articles', 'vid_D1_journal_placement']),
    makeSubArgument('subarg-scholarly-articles-02', 'arg-scholarly-articles-01', 'Database indexing and citation support for authored work', 'Corroborate the publication record through indexing and citation evidence.', 'Corroborates publication circulation and visibility.', ['vid_G1_database_record', 'vid_G1_citation_trend']),
    makeSubArgument('subarg-original-contribution-01', 'arg-original-contribution-01', 'Research programs shaped by Dr.Hu’s analytical agenda', 'Show that Dr.Hu’s work helped define institutional research directions and center-led projects.', 'Establishes scholarly contribution at the institutional-program level.', ['vid_E2_center_profile', 'vid_E2_research_programs']),
    makeSubArgument('subarg-original-contribution-01b', 'arg-original-contribution-02', 'Adoption of methods in collaborative and strategic work', 'Show that Dr.Hu’s analytical framework was actually used in project work and planning.', 'Demonstrates adoption of Dr.Hu’s methods.', ['vid_F1_method_adoption', 'snp_E10_project_objective']),
    makeSubArgument('subarg-original-contribution-01c', 'arg-original-contribution-02', 'Downstream impact on recommendations and partner planning', 'Show that the adopted work affected project deliverables and later planning decisions.', 'Demonstrates practical impact and downstream reliance.', ['vid_F1_policy_impact', 'vid_F1_external_uptake']),
    makeSubArgument('subarg-original-contribution-02', 'arg-original-contribution-03', 'Peer validation and scholarly reuse of the methodology', 'Show that other scholars recognized and reused the methodology developed by Dr.Hu.', 'Shows peer-validated significance and scholarly reuse.', ['vid_H1_methodology_validation', 'vid_G1_database_record', 'vid_G1_citation_trend']),
  ];

  const letterSections: LetterSection[] = [
    makeSection('leading_role', 'Leading/Critical Role', 0, [
      makeSentence('The Beneficiary satisfies 8 C.F.R. §204.5(h)(3)(viii) by demonstrating that he served in formal leadership roles within a distinguished academic institution and in a substantial externally commissioned research engagement.', [], { sentenceType: 'opening' }),
      makeSentence('The institutional backdrop is distinguished: a faculty and institutional profile identifies the school as a nationally recognized teaching and research unit, while a separate notice records Dr.Hu’s role in the development of the School of New Media, confirming that he operated within a prominent and strategically important university setting [Exhibit A1, p.1; Exhibit E1, p.1].', ['vid_A1_institution_profile', 'vid_E1_school_establishment'], { subargumentId: 'subarg-leading-role-03', argumentId: 'arg-leading-role-03', exhibitRefs: ['Exhibit A1, p.1', 'Exhibit E1, p.1'] }),
      makeSentence('An official personnel notice then states that Dr.Hu was appointed Vice Dean of the School of Journalism and Communication following university deliberation and approval, which is direct evidence of a senior leadership appointment [Exhibit E5, p.1].', ['snp_E5_vice_dean'], { subargumentId: 'subarg-leading-role-01', argumentId: 'arg-leading-role-01', exhibitRefs: ['Exhibit E5, p.1'] }),
      makeSentence('That same record assigns him responsibility for academic planning, faculty affairs, research organization, graduate education, public communication, and external cooperation, and the surrounding governance records place him on the academic committee, degree-evaluation committee, and appointment committee, confirming continuing decision-making authority rather than a nominal title [Exhibit E5, p.1; Exhibit E6, p.1; Exhibit E7, p.1].', ['snp_E5_leadership_scope', 'snp_E5_governance_duties', 'vid_E6_academic_committee', 'vid_E7_governance_committee'], { subargumentId: 'subarg-leading-role-01', argumentId: 'arg-leading-role-01', exhibitRefs: ['Exhibit E5, p.1', 'Exhibit E6, p.1', 'Exhibit E7, p.1'] }),
      makeSentence('A separate joint research agreement further identifies Dr.Hu as the Project Principal for a multi-year commissioned collaboration and places the project’s personnel, reports, and final monograph under the university side led by him, which independently establishes leadership in a substantial external engagement [Exhibit E10, p.1; Exhibit E10, p.2].', ['snp_E10_project_principal', 'snp_E10_project_summary', 'snp_E10_work_organization'], { subargumentId: 'subarg-leading-role-02', argumentId: 'arg-leading-role-02', exhibitRefs: ['Exhibit E10, p.1', 'Exhibit E10, p.2'] }),
      makeSentence('The broader record reinforces that this was not isolated task work: a peer letter describes Dr.Hu as a faculty leader relied upon for program development and external collaboration, and the center profile ties his role to ongoing research direction and institutional development [Exhibit H1, p.1; Exhibit E2, p.1].', ['vid_H1_peer_leadership_validation', 'vid_E2_center_profile'], { subargumentId: 'subarg-leading-role-03', argumentId: 'arg-leading-role-03', exhibitRefs: ['Exhibit H1, p.1', 'Exhibit E2, p.1'] }),
      makeSentence('Taken together, the distinguished institutional context, vice-dean appointment, governance portfolio, and project-principal designation establish that Dr.Hu held leading roles in distinguished organizations within the meaning of the regulation [Exhibit A1, p.1; Exhibit E5, p.1; Exhibit E10, p.1].', ['vid_A1_institution_profile', 'snp_E5_vice_dean', 'snp_E10_project_principal'], { sentenceType: 'closing', exhibitRefs: ['Exhibit A1, p.1', 'Exhibit E5, p.1', 'Exhibit E10, p.1'] }),
    ]),
    makeSection('judging', 'Judging', 1, [
      makeSentence('The Beneficiary also satisfies 8 C.F.R. §204.5(h)(3)(iv) by demonstrating a record of judging the work of others through formal university review service and additional external reviewing activity.', [], { sentenceType: 'opening' }),
      makeSentence('The strongest direct evidence is the university invitation expressly naming Dr.Hu as an expert reviewer for a formal expert-review meeting and inviting him to attend in that capacity [Exhibit E9, p.1].', ['snp_E9_expert_reviewer'], { subargumentId: 'subarg-judging-01', argumentId: 'arg-judging-01', exhibitRefs: ['Exhibit E9, p.1'] }),
      makeSentence('That invitation further states that he would review application materials from the School of Journalism and Communication and other departments, introduce the cases during deliberation, and participate in the discussion and voting process, which is direct evidence of substantive evaluative authority [Exhibit E9, p.1].', ['snp_E9_review_materials_vote'], { subargumentId: 'subarg-judging-01', argumentId: 'arg-judging-01', exhibitRefs: ['Exhibit E9, p.1'] }),
      makeSentence('The attached review packet also confirms that the selection criteria, recommendation summary, and candidate dossier materials were distributed in advance so that reviewers could conduct meaningful preliminary review before the meeting [Exhibit E9, p.1].', ['snp_E9_review_packet'], { subargumentId: 'subarg-judging-01', argumentId: 'arg-judging-01', exhibitRefs: ['Exhibit E9, p.1'] }),
      makeSentence('The record additionally reflects outside reviewing activity: the program-committee archive and conference reviewing materials show that Dr.Hu was asked to conduct submission review, rank papers, and participate in blind-review assessment of originality and scholarly merit for an external event [Exhibit A2, p.1; Exhibit C1, p.1].', ['vid_A2_review_archive', 'vid_C1_review_scope', 'vid_C1_blind_review'], { subargumentId: 'subarg-judging-02', argumentId: 'arg-judging-02', exhibitRefs: ['Exhibit A2, p.1', 'Exhibit C1, p.1'] }),
      makeSentence('Accordingly, the university invitation and the external review materials together establish sustained participation as a judge of the work of others in the field [Exhibit E9, p.1; Exhibit C1, p.1].', ['snp_E9_expert_reviewer', 'snp_E9_review_materials_vote', 'vid_C1_review_scope'], { sentenceType: 'closing', exhibitRefs: ['Exhibit E9, p.1', 'Exhibit C1, p.1'] }),
    ]),
    makeSection('published_material', 'Published Material', 2, [
      makeSentence('The record further supports the published-material criterion because professional and institutional media specifically discussed Dr.Hu and his work rather than merely listing his name in passing.', [], { sentenceType: 'opening' }),
      makeSentence('A media coverage packet profiles Dr.Hu as a scholar of digital communication and discusses his views on media strategy, audience analysis, and platform transformation, showing that the publication was about his professional work and expertise [Exhibit B1, p.1].', ['vid_B1_feature_profile', 'vid_B1_interview_quote'], { subargumentId: 'subarg-published-material-01', argumentId: 'arg-published-material-01', exhibitRefs: ['Exhibit B1, p.1'] }),
      makeSentence('The article also quotes Dr.Hu directly on field-specific issues, which reinforces that he was the subject of the published material and that the coverage centered on his contributions to communication research [Exhibit B1, p.1].', ['vid_B1_interview_quote'], { subargumentId: 'subarg-published-material-01', argumentId: 'arg-published-material-01', exhibitRefs: ['Exhibit B1, p.1'] }),
      makeSentence('Independent support materials likewise note that Dr.Hu’s work has been featured in professional publications and recognition summaries because his scholarship is viewed as influential, which corroborates that media attention attached to his own accomplishments [Exhibit H1, p.1].', ['vid_H1_recognition_summary'], { subargumentId: 'subarg-published-material-02', argumentId: 'arg-published-material-02', exhibitRefs: ['Exhibit H1, p.1'] }),
      makeSentence('Taken together, these materials present published discussions of Dr.Hu and his work in a manner consistent with the regulatory criterion [Exhibit B1, p.1; Exhibit H1, p.1].', ['vid_B1_feature_profile', 'vid_H1_recognition_summary'], { sentenceType: 'closing', exhibitRefs: ['Exhibit B1, p.1', 'Exhibit H1, p.1'] }),
    ]),
    makeSection('scholarly_articles', 'Scholarly Articles', 3, [
      makeSentence('The evidence also establishes authorship of scholarly articles in professional journals under 8 C.F.R. §204.5(h)(3)(vi).', [], { sentenceType: 'opening' }),
      makeSentence('A publication record lists Dr.Hu as the author or co-author of peer-reviewed journal articles and scholarly monographs addressing communication theory, digital culture, and media analytics, demonstrating sustained scholarly authorship [Exhibit D1, p.1].', ['vid_D1_publication_list'], { subargumentId: 'subarg-scholarly-articles-01', argumentId: 'arg-scholarly-articles-01', exhibitRefs: ['Exhibit D1, p.1'] }),
      makeSentence('Selected entries identify articles published in academic journals devoted to journalism and communication research, showing that the authored works appeared in recognized scholarly venues rather than informal outlets [Exhibit D1, p.1].', ['vid_D1_peer_reviewed_articles'], { subargumentId: 'subarg-scholarly-articles-01', argumentId: 'arg-scholarly-articles-01', exhibitRefs: ['Exhibit D1, p.1'] }),
      makeSentence('The database and citation record independently corroborates that these authored works were indexed and cited, which strengthens the reliability of the publication record and confirms broader scholarly circulation [Exhibit G1, p.1].', ['vid_G1_database_record'], { subargumentId: 'subarg-scholarly-articles-01', argumentId: 'arg-scholarly-articles-01', exhibitRefs: ['Exhibit G1, p.1'] }),
      makeSentence('Accordingly, the record sufficiently documents that Dr.Hu authored scholarly articles in professional journals [Exhibit D1, p.1; Exhibit G1, p.1].', ['vid_D1_publication_list', 'vid_G1_database_record'], { sentenceType: 'closing', exhibitRefs: ['Exhibit D1, p.1', 'Exhibit G1, p.1'] }),
    ]),
    makeSection('original_contribution', 'Original Contribution', 4, [
      makeSentence('The record also supports the original-contribution criterion because it shows that Dr.Hu developed research methods and analytical approaches that were adopted, reused, and treated as significant by peers and collaborating institutions.', [], { sentenceType: 'opening' }),
      makeSentence('A center profile attributes to Dr.Hu a leading role in research programs on digital communication, public-opinion analysis, and market-media studies, indicating that his work helped define institutional research directions rather than simply executing preexisting tasks [Exhibit E2, p.1].', ['vid_E2_center_profile'], { subargumentId: 'subarg-original-contribution-01', argumentId: 'arg-original-contribution-01', exhibitRefs: ['Exhibit E2, p.1'] }),
      makeSentence('An impact memorandum then explains that Dr.Hu’s analytical framework was adopted in collaborative research and strategic consulting work to guide audience segmentation, communication planning, and brand-position analysis, which is evidence of practical uptake of his methods [Exhibit F1, p.1].', ['vid_F1_method_adoption'], { subargumentId: 'subarg-original-contribution-01', argumentId: 'arg-original-contribution-01', exhibitRefs: ['Exhibit F1, p.1'] }),
      makeSentence('The same memorandum notes that those findings informed downstream recommendations and project deliverables, while the commissioned research agreement shows Dr.Hu leading a project whose objective likewise involved communication strategy and brand-image analysis, reinforcing the real-world significance of the contribution [Exhibit F1, p.1; Exhibit E10, p.2].', ['vid_F1_policy_impact', 'snp_E10_project_objective'], { subargumentId: 'subarg-original-contribution-01', argumentId: 'arg-original-contribution-01', exhibitRefs: ['Exhibit F1, p.1', 'Exhibit E10, p.2'] }),
      makeSentence('Peer validation further states that Dr.Hu developed a methodology that has been taught, reused, and cited by younger scholars, and the database record corroborates the scholarly footprint of that body of work [Exhibit H1, p.1; Exhibit G1, p.1].', ['vid_H1_methodology_validation', 'vid_G1_database_record'], { subargumentId: 'subarg-original-contribution-02', argumentId: 'arg-original-contribution-02', exhibitRefs: ['Exhibit H1, p.1', 'Exhibit G1, p.1'] }),
      makeSentence('These materials collectively establish that Dr.Hu made original scholarly contributions of significance to the field [Exhibit E2, p.1; Exhibit F1, p.1; Exhibit H1, p.1].', ['vid_E2_center_profile', 'vid_F1_method_adoption', 'vid_H1_methodology_validation'], { sentenceType: 'closing', exhibitRefs: ['Exhibit E2, p.1', 'Exhibit F1, p.1', 'Exhibit H1, p.1'] }),
    ]),
  ];

  const professionalLetterSections: LetterSection[] = [
    makeSection('leading_role', 'Leading/Critical Role', 0, [
      makeSentence('The record establishes that Dr.Hu performed leading and critical roles for distinguished academic entities and for a substantial externally commissioned research project, thereby satisfying the leading-or-critical-role criterion.', [], { sentenceType: 'opening' }),
      makeSentence('The organizations themselves are distinguished: institutional materials describe the School of Journalism and Communication as a nationally recognized teaching and research unit within a major research university, and the related establishment materials place Dr.Hu among the faculty leaders involved in building the School of New Media at a strategic stage of its development [Exhibit A1, p.1; Exhibit E1, p.1].', ['vid_A1_institution_profile', 'vid_A1_rankings_profile', 'vid_E1_school_establishment'], { subargumentId: 'subarg-leading-role-03', argumentId: 'arg-leading-role-03', exhibitRefs: ['Exhibit A1, p.1', 'Exhibit E1, p.1'] }),
      makeSentence('Within that distinguished setting, an official university notice states that Dr.Hu was appointed Vice Dean after deliberation and approval by the university, which is direct documentary evidence of a formal senior leadership appointment [Exhibit E5, p.1].', ['snp_E5_vice_dean'], { subargumentId: 'subarg-leading-role-01', argumentId: 'arg-leading-role-01', exhibitRefs: ['Exhibit E5, p.1'] }),
      makeSentence('The same appointment record assigns Dr.Hu responsibility for academic planning, faculty affairs, research organization, graduate education, public communication, and external cooperation, while related governance materials show him serving in committee roles tied to academic review, degree evaluation, and appointment matters; together, these materials demonstrate continuing institutional authority rather than a merely honorific designation [Exhibit E5, p.1; Exhibit E6, p.1; Exhibit E7, p.1].', ['snp_E5_leadership_scope', 'snp_E5_governance_duties', 'vid_E6_academic_committee', 'vid_E7_governance_committee'], { subargumentId: 'subarg-leading-role-01b', argumentId: 'arg-leading-role-01', exhibitRefs: ['Exhibit E5, p.1', 'Exhibit E6, p.1', 'Exhibit E7, p.1'] }),
      makeSentence('The separate joint research agreement provides additional independent evidence of qualifying leadership. It identifies Dr.Hu as Project Principal, places the multi-year research program and its reporting obligations under the university side he represented, and confirms that project personnel operated under his direction or under coordinators designated by his side of the collaboration [Exhibit E10, p.1; Exhibit E10, p.2].', ['snp_E10_project_principal', 'snp_E10_project_summary', 'snp_E10_work_organization'], { subargumentId: 'subarg-leading-role-02', argumentId: 'arg-leading-role-02', exhibitRefs: ['Exhibit E10, p.1', 'Exhibit E10, p.2'] }),
      makeSentence('That project role was not merely administrative. The agreement ties Dr.Hu to the design of strategic research concerning communication strategy, consumer trends, and brand-image analysis, and independent peer evidence describes him as a scholar repeatedly relied upon for program development, interdisciplinary coordination, and major external collaborations [Exhibit E10, p.2; Exhibit H1, p.1].', ['snp_E10_project_objective', 'vid_H1_peer_leadership_validation', 'vid_H1_external_leadership_role'], { subargumentId: 'subarg-leading-role-02b', argumentId: 'arg-leading-role-02', exhibitRefs: ['Exhibit E10, p.2', 'Exhibit H1, p.1'] }),
      makeSentence('Accordingly, the record shows both that the relevant organizations were distinguished and that Dr.Hu occupied leadership positions carrying genuine institutional and project-level authority, which is sufficient to satisfy this criterion [Exhibit A1, p.1; Exhibit E5, p.1; Exhibit E10, p.1].', ['vid_A1_institution_profile', 'snp_E5_vice_dean', 'snp_E10_project_principal'], { sentenceType: 'closing', exhibitRefs: ['Exhibit A1, p.1', 'Exhibit E5, p.1', 'Exhibit E10, p.1'] }),
    ]),
    makeSection('judging', 'Judging', 1, [
      makeSentence('The record further demonstrates that Dr.Hu has judged the work of others through both formal university review service and outside scholarly reviewing assignments.', [], { sentenceType: 'opening' }),
      makeSentence('The university invitation is explicit: it requests that Dr.Hu attend an expert-review meeting in the capacity of an expert reviewer, thereby directly documenting his selection to evaluate the candidacies of others [Exhibit E9, p.1].', ['snp_E9_expert_reviewer'], { subargumentId: 'subarg-judging-01', argumentId: 'arg-judging-01', exhibitRefs: ['Exhibit E9, p.1'] }),
      makeSentence('The same invitation explains that he would review candidate materials submitted by multiple departments, introduce the cases during deliberation, and participate in both discussion and voting. Those assigned tasks reflect substantive evaluative responsibility, not ceremonial attendance [Exhibit E9, p.1].', ['snp_E9_review_materials_vote'], { subargumentId: 'subarg-judging-01b', argumentId: 'arg-judging-01', exhibitRefs: ['Exhibit E9, p.1'] }),
      makeSentence('The attached packet further confirms that reviewers received the governing criteria, recommendation summaries, dossier index, and supporting materials in advance for preliminary assessment, which is consistent with a structured adjudicative process [Exhibit E9, p.1].', ['snp_E9_review_packet'], { subargumentId: 'subarg-judging-01b', argumentId: 'arg-judging-01', exhibitRefs: ['Exhibit E9, p.1'] }),
      makeSentence('The record also reflects external judging activity. A program-committee archive and conference review materials show that Dr.Hu was entrusted with reviewing submissions, ranking papers, and evaluating originality and scholarly merit in a blind-review setting for an outside event [Exhibit A2, p.1; Exhibit C1, p.1].', ['vid_A2_review_archive', 'vid_C1_review_scope', 'vid_C1_blind_review'], { subargumentId: 'subarg-judging-02', argumentId: 'arg-judging-02', exhibitRefs: ['Exhibit A2, p.1', 'Exhibit C1, p.1'] }),
      makeSentence('Those same external materials apply a scoring rubric keyed to originality, disciplinary relevance, evidentiary support, and presentation quality, reinforcing that the work involved disciplined expert judgment under stated criteria [Exhibit C1, p.1].', ['vid_C1_scoring_rubric'], { subargumentId: 'subarg-judging-02b', argumentId: 'arg-judging-02', exhibitRefs: ['Exhibit C1, p.1'] }),
      makeSentence('Taken together, the university expert-review service and the outside blind-review materials establish that Dr.Hu has judged the work of others in the field within the meaning of the regulation [Exhibit E9, p.1; Exhibit C1, p.1].', ['snp_E9_expert_reviewer', 'snp_E9_review_materials_vote', 'vid_C1_review_scope', 'vid_C1_scoring_rubric'], { sentenceType: 'closing', exhibitRefs: ['Exhibit E9, p.1', 'Exhibit C1, p.1'] }),
    ]),
    makeSection('published_material', 'Published Material', 2, [
      makeSentence('The published-material criterion is also supported because the record contains media discussion focused on Dr.Hu and on the substance of his professional work.', [], { sentenceType: 'opening' }),
      makeSentence('A media feature profiles Dr.Hu as a scholar of digital communication and discusses his analyses of media strategy, audience behavior, and platform transformation, demonstrating that the article was about him and about his field-specific work rather than a passing mention [Exhibit B1, p.1].', ['vid_B1_feature_profile', 'vid_B1_interview_quote'], { subargumentId: 'subarg-published-material-01', argumentId: 'arg-published-material-01', exhibitRefs: ['Exhibit B1, p.1'] }),
      makeSentence('The outlet context is likewise meaningful. The publication describes the piece as part of an expert-feature series that highlights recognized professional and scholarly voices, which reinforces that Dr.Hu was selected for publication attention because of his standing and expertise [Exhibit B1, p.1].', ['vid_B1_outlet_profile'], { subargumentId: 'subarg-published-material-01b', argumentId: 'arg-published-material-01', exhibitRefs: ['Exhibit B1, p.1'] }),
      makeSentence('Independent support materials further state that Dr.Hu has been featured in professional publications and institutional recognition summaries because his scholarship is regarded as influential in the field, which corroborates that published attention attached to his own accomplishments [Exhibit H1, p.1].', ['vid_H1_recognition_summary'], { subargumentId: 'subarg-published-material-02', argumentId: 'arg-published-material-02', exhibitRefs: ['Exhibit H1, p.1'] }),
      makeSentence('Accordingly, the record contains published material about Dr.Hu and his work in a form consistent with this evidentiary criterion [Exhibit B1, p.1; Exhibit H1, p.1].', ['vid_B1_feature_profile', 'vid_B1_outlet_profile', 'vid_H1_recognition_summary'], { sentenceType: 'closing', exhibitRefs: ['Exhibit B1, p.1', 'Exhibit H1, p.1'] }),
    ]),
    makeSection('scholarly_articles', 'Scholarly Articles', 3, [
      makeSentence('The evidence also establishes Dr.Hu as the author of scholarly articles in professional journals.', [], { sentenceType: 'opening' }),
      makeSentence('A publication record identifies Dr.Hu as author or co-author of peer-reviewed journal articles and scholarly books addressing communication theory, digital culture, media analytics, and related field questions, showing sustained scholarly production over time [Exhibit D1, p.1].', ['vid_D1_publication_list'], { subargumentId: 'subarg-scholarly-articles-01', argumentId: 'arg-scholarly-articles-01', exhibitRefs: ['Exhibit D1, p.1'] }),
      makeSentence('The record is not limited to bare titles. It also identifies journal placements tied to communication and journalism scholarship, confirming that the articles appeared in field-relevant academic venues rather than in informal or non-scholarly outlets [Exhibit D1, p.1].', ['vid_D1_peer_reviewed_articles', 'vid_D1_journal_placement'], { subargumentId: 'subarg-scholarly-articles-01b', argumentId: 'arg-scholarly-articles-01', exhibitRefs: ['Exhibit D1, p.1'] }),
      makeSentence('Finally, database and citation materials corroborate that these works were indexed and cited, lending independent support to the publication history and confirming that the authored work circulated within the scholarly community [Exhibit G1, p.1].', ['vid_G1_database_record', 'vid_G1_citation_trend'], { subargumentId: 'subarg-scholarly-articles-02', argumentId: 'arg-scholarly-articles-01', exhibitRefs: ['Exhibit G1, p.1'] }),
      makeSentence('On this record, the scholarly-articles criterion is sufficiently documented [Exhibit D1, p.1; Exhibit G1, p.1].', ['vid_D1_publication_list', 'vid_D1_journal_placement', 'vid_G1_database_record'], { sentenceType: 'closing', exhibitRefs: ['Exhibit D1, p.1', 'Exhibit G1, p.1'] }),
    ]),
    makeSection('original_contribution', 'Original Contribution', 4, [
      makeSentence('The record also shows that Dr.Hu made original contributions of significance because his analytical work shaped institutional research agendas, was adopted in collaborative work, and was later validated through peer reuse and citation.', [], { sentenceType: 'opening' }),
      makeSentence('Center materials attribute to Dr.Hu a central role in research programs addressing digital communication, public-opinion analysis, and related media studies, indicating that his work helped define ongoing research directions rather than merely implement preexisting plans [Exhibit E2, p.1].', ['vid_E2_center_profile', 'vid_E2_research_programs'], { subargumentId: 'subarg-original-contribution-01', argumentId: 'arg-original-contribution-01', exhibitRefs: ['Exhibit E2, p.1'] }),
      makeSentence('The significance of that work is reflected in subsequent adoption. An impact memorandum states that Dr.Hu\u2019s analytical framework was used in collaborative and strategic research to guide audience segmentation, communication planning, and brand-position analysis, while the joint research agreement places those same strategic tasks within a project he led as Project Principal [Exhibit F1, p.1; Exhibit E10, p.2].', ['vid_F1_method_adoption', 'snp_E10_project_objective'], { subargumentId: 'subarg-original-contribution-01b', argumentId: 'arg-original-contribution-02', exhibitRefs: ['Exhibit F1, p.1', 'Exhibit E10, p.2'] }),
      makeSentence('The same memorandum further explains that the resulting analyses informed downstream recommendations, project deliverables, and later partner planning, which supports practical significance beyond purely academic interest [Exhibit F1, p.1].', ['vid_F1_policy_impact', 'vid_F1_external_uptake'], { subargumentId: 'subarg-original-contribution-01c', argumentId: 'arg-original-contribution-02', exhibitRefs: ['Exhibit F1, p.1'] }),
      makeSentence('Independent peer evidence states that Dr.Hu developed a methodology that has been reused, taught, and cited by other scholars, and the citation materials corroborate a continuing scholarly footprint for that body of work [Exhibit H1, p.1; Exhibit G1, p.1].', ['vid_H1_methodology_validation', 'vid_G1_database_record', 'vid_G1_citation_trend'], { subargumentId: 'subarg-original-contribution-02', argumentId: 'arg-original-contribution-03', exhibitRefs: ['Exhibit H1, p.1', 'Exhibit G1, p.1'] }),
      makeSentence('Viewed together, the evidence shows original work that shaped research programs, was adopted in consequential project settings, and generated recognizable downstream scholarly and practical impact; that is sufficient to establish original contributions of significance [Exhibit E2, p.1; Exhibit F1, p.1; Exhibit H1, p.1].', ['vid_E2_center_profile', 'vid_F1_method_adoption', 'vid_H1_methodology_validation'], { sentenceType: 'closing', exhibitRefs: ['Exhibit E2, p.1', 'Exhibit F1, p.1', 'Exhibit H1, p.1'] }),
    ]),
  ];

  return {
    snippets,
    arguments: arguments_,
    subArguments,
    letterSections: professionalLetterSections.length ? professionalLetterSections : letterSections,
  };
}
