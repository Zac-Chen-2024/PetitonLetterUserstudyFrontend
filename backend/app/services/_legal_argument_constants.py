"""Pure data tables and prompt strings for the legal-argument organizer.

Lifted from ``legal_argument_organizer.py`` in step 2D-3. Contains:

* ``LEGAL_STANDARDS`` / ``NIW_LEGAL_STANDARDS`` / ``L1A_LEGAL_STANDARDS`` —
  per-visa-type legal-requirement dictionaries.
* ``L1A_EVIDENCE_TYPE_MAPPING`` / ``NIW_EVIDENCE_TYPE_MAPPING`` —
  extraction-evidence-type → standard-key dictionaries.
* ``ORGANIZE_*_PROMPT`` / ``NIW_*_PROMPT`` / ``L1A_*_PROMPT`` —
  module-level system/user prompt strings.

Everything here is plain literal data: no f-string substitution against
module state, no functions, no I/O. All consumers are in
``legal_argument_organizer.py`` (no external imports of these symbols).
"""
from __future__ import annotations


# ==================== EB-1A 法律条例定义 ====================

LEGAL_STANDARDS = {
    "awards": {
        "citation": "8 C.F.R. §204.5(h)(3)(i)",
        "name": "Nationally/Internationally Recognized Awards",
        "requirements": """
Legal requirements:
1. Awards must have national or international recognition
2. Awards must be for excellence in the field (not participation awards)
3. Must demonstrate the prestige and selectivity of the award

Argumentation structure (combine into ONE argument; sub-divide by individual award):
- Each distinct award → one sub-argument with its own evidence chain:
  1. Award name, year, and the applicant's specific honor
  2. Awarding body's authority and reputation
  3. Selection process rigor (jury composition, review methodology, duration)
  4. Competitiveness (number of nominees vs. winners, acceptance rate)
  5. Peer comparison (other distinguished recipients to show caliber)
""",
    },
    "membership": {
        "citation": "8 C.F.R. §204.5(h)(3)(ii)",
        "name": "Membership in Associations",
        "requirements": """
Legal requirements:
1. The association must require outstanding achievements for admission (not ordinary professional certification)
2. Must demonstrate the association's selectivity and distinguished reputation
3. Must show other distinguished members for peer comparison
4. Ordinary industry certifications or licenses do NOT qualify

Argumentation structure (one sub-argument per qualifying association):
- Each association → its own evidence chain:
  1. Association introduction (founding, mission, distinguished reputation)
  2. Membership criteria (what outstanding achievements are required for admission)
  3. Review/admission process (how rigorous the selection is)
  4. Notable members (peer comparison to demonstrate selectivity)
""",
    },
    "published_material": {
        "citation": "8 C.F.R. §204.5(h)(3)(iii)",
        "name": "Published Material in Major Media",
        "requirements": """
Legal requirements:
1. Media must be "major media" — demonstrate circulation, awards, influence
2. Coverage must be ABOUT the alien and the alien's work (not BY the alien)
3. Must demonstrate the media outlet's authority and professionalism

IMPORTANT: This is media coverage ABOUT the applicant, NOT articles written BY the applicant.
Articles authored by the applicant belong under Scholarly Articles (vi).

Argumentation structure (one sub-argument per media coverage):
- Each media report → its own evidence chain:
  1. Article title, publication date, and summary of coverage about the applicant
  2. Media outlet's authority and reach (circulation, awards, history, intended audience)
  3. Scope of the coverage (national/international reach, depth of reporting)
""",
    },
    "judging": {
        "citation": "8 C.F.R. §204.5(h)(3)(iv)",
        "name": "Judging the Work of Others",
        "requirements": """
Legal requirements:
1. The applicant participated individually or as part of a panel in judging the work of others in the field
2. Judging role must be based on professional expertise (invited, not obligatory)
3. Must demonstrate the authority of the judging activity (journal peer review, grant review, competition judging, etc.)

Argumentation structure (combine into ONE argument; sub-divide by judging role):
- Each judging appointment → its own evidence chain:
  1. Official role/title and appointing organization
  2. Organization's prestige and authority in the field
  3. Scope and scale of the judging process (submission count, jury size, review rounds)
  4. The applicant's decision-making weight or influence
  5. Other distinguished co-judges or panelists (peer comparison)
""",
    },
    "original_contribution": {
        "citation": "8 C.F.R. §204.5(h)(3)(v)",
        "name": "Original Contributions of Major Significance",
        "requirements": """
Legal requirements:
1. Contribution must be original
2. Contribution must be of major significance to the field
3. Requires quantified impact evidence (data, adoption rate, commercial success)
4. Requires independent expert recommendation letters

Argumentation structure (combine into ONE comprehensive argument; sub-divide by distinct contribution):
- Each original contribution → its own evidence chain:
  1. Description of the original work (invention, methodology, framework, product)
  2. Quantified impact (adoption metrics, user count, revenue, citations)
  3. Independent expert endorsements (recommendation letters with specific praise)
  4. Institutional or industry adoption (organizations, government programs using the work)
""",
    },
    "scholarly_articles": {
        "citation": "8 C.F.R. §204.5(h)(3)(vi)",
        "name": "Authorship of Scholarly Articles",
        "requirements": """
Legal requirements:
1. The applicant is the author of scholarly articles in professional or major trade publications or other major media
2. Published in professional journals or major media outlets
3. Must demonstrate the publication's impact (citation count, journal ranking, field influence)

IMPORTANT: This is articles/books authored BY the applicant.
This is DIFFERENT from Published Material (iii), which is media coverage ABOUT the applicant.

Argumentation structure (combine into ONE argument; sub-divide by publication):
- Each publication → its own evidence chain:
  1. Article/book title, year, and authorship role
  2. Publication venue prestige (impact factor, ranking, editorial standards)
  3. Research contribution (what is novel or significant)
  4. Citation data and impact metrics (total citations, field percentile, cross-disciplinary influence)
""",
    },
    "display": {
        "citation": "8 C.F.R. §204.5(h)(3)(vii)",
        "name": "Display of Work at Exhibitions",
        "requirements": """
Legal requirements:
1. The applicant's work was displayed at artistic exhibitions or showcases
2. The exhibition must have professional standing and recognition
3. Applies to visual arts, performing arts, design, etc.

Argumentation structure:
- Exhibition/showcase introduction
- Exhibition's prestige and influence
- Form of display and reception of the applicant's work
""",
    },
    "leading_role": {
        "citation": "8 C.F.R. §204.5(h)(3)(viii)",
        "name": "Leading/Critical Role for Distinguished Organizations",
        "requirements": """
Legal requirements:
1. The role must be leading or critical
2. The organization must have a distinguished reputation
3. Must demonstrate the applicant's decision-making authority and influence

Argumentation structure (one sub-argument per organization, select top 2-3):
- Each organization → two-tier evidence chain:
  Tier 1 — Organization's distinguished reputation (argued independently):
    1. History, scale, rankings, and industry recognition
    2. Notable achievements, partnerships, or awards
  Tier 2 — Applicant's leading/critical role within it:
    1. Title, appointment, scope of responsibilities
    2. Decision-making authority and specific achievements
    3. Testimonials or endorsements from colleagues/superiors
""",
    },
    "high_salary": {
        "citation": "8 C.F.R. §204.5(h)(3)(ix)",
        "name": "High Salary or Remuneration",
        "requirements": """
Legal requirements:
1. Salary must be significantly higher than others in the field
2. Must provide industry salary comparison data
3. Can include wages, bonuses, royalties, consulting fees, or any form of remuneration

Argumentation structure (single unified argument, typically no sub-division needed):
  1. Applicant's compensation data (base salary, bonuses, other remuneration) with official documentation
  2. Industry benchmark from authoritative third-party source (government statistics, salary surveys)
  3. Comparative ratio analysis (how many times above the average)
  4. Additional income streams if applicable (consulting, royalties, speaking fees)
""",
    },
    "commercial_success": {
        "citation": "8 C.F.R. §204.5(h)(3)(x)",
        "name": "Commercial Success in the Performing Arts",
        "requirements": """
Legal requirements:
1. Applies to the performing arts field
2. Must show box office revenue, record sales, ratings, or similar commercial data
3. Commercial success must reach a significant level in the industry

Argumentation structure:
- Commercial data (box office, sales, ratings, etc.)
- Industry benchmark comparison
- Media or industry recognition of commercial success
""",
    },
    "overall_merits": {
        "citation": "8 C.F.R. §204.5(h)(2) & Kazarian v. USCIS, 596 F.3d 1115 (9th Cir. 2010)",
        "name": "Final Merits Determination — Overall Merits",
        "requirements": """
Legal framework (Kazarian Step 2):
After demonstrating eligibility under at least three of the ten criteria,
the totality of evidence must demonstrate sustained national or international acclaim
and that the beneficiary is among the small percentage at the very top of the field.

Argumentation structure:
- Totality declaration referencing all established criteria
- Cross-criteria synthesis of supplemental evidence by theme
- Expert testimonials and recognition spanning multiple criteria
- Comprehensive conclusion tying all evidence to sustained acclaim
""",
    },
}


# ==================== Prompt Templates ====================

# ==================== NIW 法律条例定义 ====================

NIW_LEGAL_STANDARDS = {
    "prong1_merit": {
        "citation": "Matter of Dhanasar, 26 I&N Dec. 884, 889-890 (AAO 2016), Prong 1",
        "name": "Substantial Merit & National Importance",
        "requirements": """
Legal standard (Matter of Dhanasar, 26 I&N Dec. 884, 889-890):

"The first prong, substantial merit and national importance, focuses on the specific
endeavor that the foreign national proposes to undertake. The term 'endeavor' is more
specific than the general occupation... [W]e focus on what the person proposes to work
on rather than the general occupation."

"The endeavor's merit may be demonstrated in a range of areas such as business,
entrepreneurialism, science, technology, culture, health, or education. The merit of
a proposed endeavor may be demonstrated by, among other things, showing potential
prospective impact of the endeavor."

National importance — geographic scope:
"We understand 'national importance' more broadly... [The term] does not require that
the endeavor have national or global reach. We look instead at whether the endeavor
has 'national' ramifications — i.e., the potential to substantially impact or influence
work or activity extending well beyond a particular locality."

Argumentation structure:
1. Define the proposed endeavor specifically (research direction, methodology, product, business plan)
2. Substantial merit: the endeavor's value (advances the field, solves an important problem, creates economic value)
3. National importance: ramifications beyond a particular locality (policy alignment, field-wide adoption potential, societal benefit)
4. Supporting evidence: expert recommendations confirming significance, quantitative impact data, policy/industry alignment
""",
    },
    "prong2_positioned": {
        "citation": "Matter of Dhanasar, 26 I&N Dec. 884, 890 (AAO 2016), Prong 2",
        "name": "Well Positioned to Advance the Endeavor",
        "requirements": """
Legal standard (Matter of Dhanasar, 26 I&N Dec. 884, 890):

"Under the second prong, petitioners must demonstrate that the foreign nationals are
well positioned to advance their proposed endeavor. In determining whether petitioners
have met this prong, we consider factors including, but not limited to: the individual's
education, skills, knowledge and record of success in related or similar efforts; a model
or plan for future activities; any progress towards achieving the proposed endeavor; and
the interest of potential customers, users, investors, or other relevant entities or
individuals."

Key factors (non-exhaustive):
- Education, skills, knowledge
- Record of success in related or similar efforts
- A model or plan for future activities
- Progress towards achieving the proposed endeavor
- Interest of potential customers, users, investors, or other relevant entities

Argumentation structure:
1. Education and professional qualifications (degrees, certifications, specialized training)
2. Track record of success: publications, citations, awards, industry recognition, quantified achievements
3. Expert endorsements: recommendation letters from authorities confirming qualifications
4. Concrete plan and progress: current position, ongoing projects, measurable milestones
5. External validation: customer adoption, investor interest, institutional partnerships
""",
    },
    "prong3_balance": {
        "citation": "Matter of Dhanasar, 26 I&N Dec. 884, 890-891 (AAO 2016), Prong 3",
        "name": "Balance of Equities Favors Waiver",
        "requirements": """
Legal standard (Matter of Dhanasar, 26 I&N Dec. 884, 890-891):

"The third prong requires the petitioner to demonstrate that, on balance, it would be
beneficial to the United States to waive the requirements of a job offer, and thus of
a labor certification."

"In performing this analysis, USCIS may evaluate factors such as: whether, in light of
the nature of the foreign national's qualifications or proposed endeavor, it would be
impractical either for the foreign national to secure a job offer or for the petitioner
to obtain a labor certification; whether, even assuming that other qualified U.S. workers
are available, the United States would still benefit from the foreign national's
contributions; and whether the national interest in the foreign national's contributions
is sufficiently urgent to warrant forgoing the labor certification process."

"In evaluating the third prong, including whether the waiver would be in the national
interest, USCIS may consider, as one factor among others, the degree to which other
evidence of record — including evidence submitted to meet other prongs — supports the
finding that the foreign national's entry will serve the national interest."

Argumentation structure:
1. Impracticality of labor certification: work transcends conventional employer-employee relationships
2. National benefit despite available U.S. workers: unique qualifications, irreplaceable expertise
3. Benefits beyond a single employer: field-wide impact, public interest, multi-sector applications
4. Urgency: time-sensitive national priorities, policy alignment, critical workforce shortages
5. Explicit balancing: totality of evidence from all three prongs supports waiver
""",
    },
}


# ==================== Prompt Templates ====================

ORGANIZE_SYSTEM_PROMPT = """You are an expert EB-1A immigration attorney with deep knowledge of 8 C.F.R. §204.5(h)(3).

Your task is to organize evidence snippets into powerful legal arguments,
following the exact structure that immigration lawyers use in petition letters.

KEY PRINCIPLES:
1. You MUST create at least one argument for EVERY standard that has evidence snippets provided below
2. Each argument must directly address the legal requirements of its standard
3. Filter out weak evidence (e.g., ordinary professional certifications for Membership)
4. Combine related evidence into cohesive arguments within each standard
5. Follow the argumentation structure specified for each standard
6. CRITICAL DISTINCTION — Published Material (iii) vs Scholarly Articles (vi):
   - (iii) Published Material = media coverage ABOUT the alien by others
   - (vi) Scholarly Articles = academic papers/articles authored BY the alien
   These are completely different criteria. Never confuse them.

OUTPUT LANGUAGE: ALL output must be in English. Do NOT use Chinese or any other language."""

ORGANIZE_USER_PROMPT = """## EVIDENCE SUMMARY

The following {standards_with_evidence_count} EB-1A criteria have supporting evidence.
You MUST create at least one argument for EACH of them:

{evidence_summary}

## Legal Standards and Requirements (only those with evidence)

{standards_text}

## Evidence Snippets by Standard

{snippets_by_standard}

## Task

Create arguments for ALL {standards_with_evidence_count} standards listed above. Do NOT skip any.

Per-standard rules:
- Awards (i): Combine into ONE argument containing all awards
- Membership (ii): One argument per qualifying association (filter ordinary certifications)
- Published Material (iii): Media ABOUT the alien — one argument per major media outlet
- Judging (iv): Combine all judging roles into ONE argument
- Original Contribution (v): Combine ALL into ONE comprehensive argument
- Scholarly Articles (vi): Combine into ONE argument — articles authored BY the alien
- Leading Role (viii): One argument per distinguished organization (select top 2-3)
- High Salary (ix): ONE argument — only if significantly above field average

The "standard" field MUST exactly match one of: {valid_standard_keys}

Return JSON:
{{
  "arguments": [
    {{
      "id": "arg-001",
      "standard": "membership",
      "title": "[Applicant]'s Membership in [Association Name]",
      "rationale": "Why this argument is strong",
      "snippet_ids": ["snp-001", "snp-002"],
      "evidence_strength": "strong|medium|weak"
    }}
  ],
  "filtered_out": [
    {{
      "snippet_ids": ["snp-xxx"],
      "reason": "Ordinary certification, does not meet membership requirements"
    }}
  ],
  "summary": {{
    "total_arguments": 7,
    "by_standard": {{"membership": 1, "scholarly_articles": 1, "judging": 1}}
  }}
}}"""


NIW_ORGANIZE_SYSTEM_PROMPT = """You are an expert NIW (National Interest Waiver) immigration attorney with deep knowledge of Matter of Dhanasar, 26 I&N Dec. 884 (AAO 2016).

Your task is to organize evidence snippets into powerful legal arguments under the Dhanasar three-prong framework.

KEY PRINCIPLES:
1. Each argument must directly address one of the three Dhanasar prongs
2. Prong 1 (Substantial Merit & National Importance): Focus on the proposed endeavor's value
3. Prong 2 (Well Positioned): Focus on qualifications, track record, and plans
4. Prong 3 (Balance): Focus on why waiving labor certification benefits the US
5. Combine related evidence into cohesive, well-supported arguments

OUTPUT LANGUAGE: Use English for argument titles (following lawyer style), Chinese for internal notes."""


NIW_ORGANIZE_USER_PROMPT = """## EVIDENCE SUMMARY

{standards_with_evidence_count} prongs have supporting evidence:

{evidence_summary}

## Dhanasar Three-Prong Framework

{standards_text}

## Evidence Snippets by Prong

{snippets_by_standard}

## Task

Organize these snippets into powerful legal arguments under the Dhanasar framework.
Aim for 3-6 arguments total, with at least one per prong.
Valid standard keys: {valid_standard_keys}

Return JSON:
{{
  "arguments": [
    {{
      "id": "arg-001",
      "standard": "prong1_merit",
      "title": "Applicant's Research in X Addresses National Need for Y",
      "rationale": "Why this argument is strong",
      "snippet_ids": ["snp-001", "snp-002"],
      "evidence_strength": "strong|medium|weak"
    }}
  ],
  "filtered_out": [
    {{
      "snippet_ids": ["snp-xxx"],
      "reason": "Not relevant to any Dhanasar prong"
    }}
  ],
  "summary": {{
    "total_arguments": 5,
    "by_standard": {{"prong1_merit": 2, "prong2_positioned": 2, "prong3_balance": 1}}
  }}
}}"""


# ==================== NIW v2 Prompts ====================

NIW_CLASSIFY_OTHER_SYSTEM_PROMPT = """You are an expert NIW immigration attorney. Classify each evidence snippet
into the most appropriate Dhanasar prong based on its content.
ALL output must be in English."""

NIW_CLASSIFY_OTHER_USER_PROMPT = """Classify each of the following evidence snippets into the most appropriate
Dhanasar prong for an NIW petition.

Prong definitions:
- prong1_merit: The proposed endeavor has substantial merit and national importance
  (e.g., endeavor descriptions, field impact, national importance evidence, contributions)
- prong2_positioned: The applicant is well positioned to advance the endeavor
  (e.g., education, work experience, publications, awards, certifications, expert endorsements)
- prong3_balance: On balance, waiving labor certification benefits the US
  (e.g., national benefit arguments, beyond-employer impact, urgency)
- skip: Not relevant to any prong (e.g., pure formatting, boilerplate, table of contents)

## Snippets to classify

{snippets_text}

Return JSON:
{{
  "classifications": [
    {{"snippet_id": "snp-xxx", "prong": "prong1_merit"}},
    {{"snippet_id": "snp-yyy", "prong": "prong2_positioned"}},
    {{"snippet_id": "snp-zzz", "prong": "skip"}}
  ]
}}

RULES:
1. Every snippet MUST appear exactly once in the output
2. Prefer prong1_merit or prong2_positioned over skip — only skip truly irrelevant content
3. Recommendation letters discussing the applicant's qualifications → prong2_positioned
4. Recommendation letters discussing the endeavor's importance → prong1_merit
5. General professional achievements without clear prong fit → prong2_positioned"""

NIW_PRONG_ORGANIZE_SYSTEM_PROMPT = """You are an expert NIW immigration attorney organizing evidence for one prong
of the Dhanasar three-prong test.
Your task: organize ALL provided evidence snippets into coherent sub-arguments.
ALL output must be in English."""

NIW_PRONG_ORGANIZE_USER_PROMPT = """## Prong: {prong_name}
## Legal Standard: {prong_citation}
## Applicant: {applicant_name}

{prong_description}

## Evidence Snippets ({snippet_count} total)

{snippets_text}

## Task

Organize ALL the above snippets into coherent sub-arguments for this prong.

RULES:
1. Each sub-argument should be a distinct legal point with a clear theme
2. Cross-reference evidence from different exhibits when they support the same point
3. Recommendation letter content should be distributed to the relevant sub-argument topics
   (do NOT create a separate "recommendation letters" sub-argument)
4. EVERY snippet must be assigned to exactly one sub-argument — 100% coverage required
5. Aim for {target_subargs} sub-arguments depending on evidence volume
6. Title should be a concise legal argument heading (e.g., "Applicant's Research Addresses Critical National Need in X")
7. Purpose should explain what legal point this sub-argument establishes
8. Relationship should be 3-8 words explaining how it supports the prong

Return JSON:
{{
  "sub_arguments": [
    {{
      "title": "Applicant's Research Addresses Critical Need in Renewable Energy",
      "claim": "Brief statement of the legal claim this sub-argument makes",
      "purpose": "Establishes that the applicant's proposed endeavor in X has substantial merit because...",
      "relationship": "Demonstrates substantial merit of endeavor",
      "snippet_ids": ["S1", "S3", "S7", "S12"],
      "reasoning": "These snippets collectively show... grouped because..."
    }}
  ]
}}"""


# ==================== L-1A 法律条例定义 ====================

L1A_LEGAL_STANDARDS = {
    "qualifying_relationship": {
        "citation": "INA §101(a)(15)(L); 8 CFR §214.2(l)(1)(ii)",
        "name": "Qualifying Corporate Relationship",
        "requirements": """
Legal requirements:
1. A qualifying relationship (parent, subsidiary, branch, or affiliate) must exist between the foreign and U.S. entities
2. Ownership and control must be documented (e.g., majority shareholding, corporate registration, tax filings)
3. Both entities must have sufficient physical premises

Argumentation structure (single unified argument):
  1. U.S. entity incorporation and registration details
  2. Ownership chain — share transfer, percentage held, documentation (stock certificates, IRS Schedule G)
  3. Physical premises — lease terms, square footage, office/warehouse photos
  4. Parent company investment — capital transfer amount, bank statements
""",
    },
    "doing_business": {
        "citation": "8 CFR §214.2(l)(1)(ii)(H)",
        "name": "Active Business Operations",
        "requirements": """
Legal requirements:
1. Both the U.S. and foreign entities must be doing business (regular, systematic, continuous provision of goods and/or services)
2. Mere presence of an agent or office is not sufficient

Argumentation structure (combine into ONE argument):
  1. U.S. entity's nature of business, product lines, and service offerings
  2. Financial performance — revenue, tax returns, bank statements
  3. Business plan — projected growth, hiring plan, financial targets
  4. Customer/partner relationships — contracts, invoices, purchase orders
  5. Parent company operations — revenue, departments, client base, geographic reach
""",
    },
    "executive_capacity": {
        "citation": "INA §101(a)(44); 8 CFR §214.2(l)(1)(ii)(B)-(C)",
        "name": "Executive/Managerial Capacity in the U.S.",
        "requirements": """
Legal requirements:
1. The beneficiary will serve in an executive or managerial capacity
2. Must show the organizational structure supports an executive role
3. Must describe specific duties with time allocation percentages
4. Must show subordinate managers/professionals handle day-to-day operations

Argumentation structure (single unified argument):
  1. Organizational chart showing reporting hierarchy
  2. Executive duties with percentage time allocation (5 segments)
  3. Direct subordinates — names, titles, qualifications, specific duties
  4. How subordinates alleviate the beneficiary from routine operational tasks
""",
    },
    "qualifying_employment": {
        "citation": "8 CFR §214.2(l)(1)(ii)(A)",
        "name": "Qualifying Employment Abroad",
        "requirements": """
Legal requirements:
1. The beneficiary must have been employed in an executive or managerial capacity abroad for at least one continuous year within the three years preceding the petition
2. Must demonstrate the beneficiary's qualifications and achievements

Argumentation structure (single unified argument):
  1. Beneficiary's educational background and relevant degrees
  2. Employment history — positions, dates, executive duties at the foreign entity
  3. Specific achievements — contracts signed, revenue growth, partnerships established
  4. Subordinate management — departments supervised, managerial staff credentials
  5. Evidence of executive decision-making authority
""",
    },
}


L1A_ORGANIZE_SYSTEM_PROMPT = """You are an expert L-1A immigration attorney with deep knowledge of INA §101(a)(15)(L) and 8 CFR §214.2(l).

Your task is to organize evidence snippets into powerful legal arguments for an L-1A intracompany transferee petition (executive/managerial capacity).

KEY PRINCIPLES:
1. You MUST create at least one argument for EVERY standard that has evidence snippets
2. Each argument must directly address the legal requirements of its standard
3. Combine related evidence into cohesive arguments within each standard
4. Follow the argumentation structure specified for each standard
5. Focus on corporate relationship, business operations, executive capacity, and qualifying employment abroad

OUTPUT LANGUAGE: ALL output must be in English. Do NOT use Chinese or any other language."""


L1A_ORGANIZE_USER_PROMPT = """## EVIDENCE SUMMARY

The following {standards_with_evidence_count} L-1A standards have supporting evidence.
You MUST create at least one argument for EACH of them:

{evidence_summary}

## Legal Standards and Requirements (only those with evidence)

{standards_text}

## Evidence Snippets by Standard

{snippets_by_standard}

## Task

Create arguments for ALL {standards_with_evidence_count} standards listed above. Do NOT skip any.

Per-standard rules:
- Qualifying Relationship: ONE unified argument covering ownership, premises, and investment
- Doing Business: ONE argument covering both U.S. and foreign entity operations
- Executive Capacity: ONE argument with org chart, duties, and subordinate management
- Qualifying Employment: ONE argument covering background, employment history, and achievements

The "standard" field MUST exactly match one of: {valid_standard_keys}

Return JSON:
{{
  "arguments": [
    {{
      "id": "arg-001",
      "standard": "qualifying_relationship",
      "title": "Qualifying Relationship Between [Foreign Co.] and [U.S. Co.]",
      "rationale": "Why this argument is strong",
      "snippet_ids": ["snp-001", "snp-002"],
      "evidence_strength": "strong|medium|weak"
    }}
  ],
  "filtered_out": [
    {{
      "snippet_ids": ["snp-xxx"],
      "reason": "Not relevant to any L-1A standard"
    }}
  ],
  "summary": {{
    "total_arguments": 4,
    "by_standard": {{"qualifying_relationship": 1, "doing_business": 1, "executive_capacity": 1, "qualifying_employment": 1}}
  }}
}}"""


# ==================== L-1A snippet grouping ====================

L1A_EVIDENCE_TYPE_MAPPING = {
    # Qualifying Relationship
    "corporate_structure": "qualifying_relationship",
    "ownership": "qualifying_relationship",
    "share_transfer": "qualifying_relationship",
    "physical_premises": "qualifying_relationship",
    "investment": "qualifying_relationship",
    "incorporation": "qualifying_relationship",
    # Doing Business
    "business_plan": "doing_business",
    "financial_performance": "doing_business",
    "revenue": "doing_business",
    "customer_relationship": "doing_business",
    "transaction_evidence": "doing_business",
    "parent_company_info": "doing_business",
    "partnership": "doing_business",
    # Executive Capacity
    "org_chart": "executive_capacity",
    "executive_duties": "executive_capacity",
    "subordinate_credentials": "executive_capacity",
    "time_allocation": "executive_capacity",
    # Qualifying Employment
    "employment_history": "qualifying_employment",
    "education": "qualifying_employment",
    "achievement": "qualifying_employment",
    "contract_execution": "qualifying_employment",
    # Shared types that may appear
    "leadership": "executive_capacity",
    "recommendation": "qualifying_employment",
    "award": "qualifying_employment",
    "quantitative_impact": "doing_business",
    "media_coverage": "doing_business",
}


# ==================== NIW snippet grouping ====================

NIW_EVIDENCE_TYPE_MAPPING = {
    # NIW-specific extraction types (from NIW extraction prompt)
    "endeavor_description": "prong1_merit",
    "field_impact": "prong1_merit",
    "national_importance": "prong1_merit",
    "merit_evidence": "prong1_merit",
    "education": "prong2_positioned",
    "work_experience": "prong2_positioned",
    "citation_metrics": "prong2_positioned",
    "research_project": "prong2_positioned",
    "waiver_justification": "prong3_balance",
    "national_benefit": "prong3_balance",
    "beyond_employer": "prong3_balance",
    "urgency": "prong3_balance",
    # Shared types (from both EB-1A and NIW extraction)
    "contribution": "prong1_merit",
    "quantitative_impact": "prong1_merit",
    "recommendation": "prong2_positioned",
    "leadership": "prong2_positioned",
    "award": "prong2_positioned",
    "membership": "prong2_positioned",
    "publication": "prong2_positioned",
    "media_coverage": "prong1_merit",
    "certification": "prong2_positioned",
    "citation_impact": "prong2_positioned",
}


