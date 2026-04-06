# Dr.Hu EB1A Video Blueprint

This blueprint defines the video-only scenario layer for the formal `/video` route. It follows the dehuan-style petition pattern while preserving only `E5`, `E9`, and `E10` as live interactive exhibits.

## Principles

- The `/video` page should feel like a full EB-1A case record rather than a three-document demo.
- Only `E5`, `E9`, and `E10` remain live for PDF preview, provenance navigation, and document switching.
- All other materials are simulated narrative supports that enrich the Evidence Card panel, the Letter Panel, and the Writing Tree without altering `/mapping`.
- The petition structure is locked to five standards so the video has a stable story arc.

## Five Standards

1. `leading_role`
2. `judging`
3. `published_material`
4. `scholarly_articles`
5. `original_contribution`

## Live Exhibits

- `E5`: Vice Dean Appointment Notice
- `E9`: Expert Review Invitation
- `E10`: Joint Research Agreement

## Simulated Exhibit Layer

- `A1`: Institutional Profile and Faculty Biography
- `A2`: External Review and Program Committee Archive
- `B1`: Media Coverage Packet
- `C1`: Conference Reviewing Materials
- `D1`: Scholarly Articles and Publication Record
- `E1`: School of New Media Establishment Notice
- `E2`: Center for Digital Communication Research Profile
- `E3`: Vice Dean Role Confirmation Memorandum
- `E4`: Peer Recommendation Letter
- `E6`: Academic Committee Appointment Roster
- `E7`: Governance Duties and Committee Notice
- `E8`: Industry Forum and Keynote Program
- `F1`: Research Impact and Adoption Memorandum
- `G1`: Citation and Database Record
- `H1`: Peer Support and Recognition Letter

## Tree Construction

The Writing Tree should be built from the simulated petition logic, not only from the live backend payload.

- `leading_role`: three arguments
- `judging`: two arguments
- `published_material`: two arguments
- `scholarly_articles`: one argument
- `original_contribution`: two arguments

## Letter Panel Behavior

- Use five generated sections in a fixed order.
- Keep dehuan-style prose: opening sentence, evidentiary development, evaluative bridge, closing sentence.
- Mix live and simulated citations so the panel reads like a full petition record.
- Clicking live citations should navigate to `E5`, `E9`, or `E10`.
- Clicking simulated citations should do nothing in `/video`.

## Evidence Card Behavior

- Show a larger set of grouped exhibits with realistic titles.
- Allow snippet selection and highlighting, but only live exhibits may move the PDF viewer.
- Non-live exhibit groups remain visible so the case looks complete on camera.
