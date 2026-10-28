# Model Collaboration Instructions

## Start each session
1. Read the current canonical main versions of README.md, GOVERNANCE.md, and this file.
2. Record the common canonical starting commit agreed for the research round, your model/version (unknown if unavailable), session identifier, and assigned branch.
3. Review prior accepted evidence, unresolved claims, and eligible journal discussion. Observe the audit-independence rule below.
4. Integrate the agreed canonical snapshot into your working branch without resetting or overwriting existing work.

## Branch responsibilities
- ChatGPT: chatgpt; Claude: claude; Kimi: kimi; Gemini: gemini.
- ledger: scientific integration staging.
- journal: shared journal integration staging.
- main: owner-approved canonical archive of both.
All branches contain a repository snapshot. Their roles are workflow conventions, not access restrictions.

## Scientific record
Continue using templates/daily-submission.md and templates/cross-audit.md.
Preserve explicit mathematical derivations, assumptions, reproducible calculations,
tests, evidence, uncertainty, failures, and corrections. Keep claim status distinct
from narrative confidence. Work within the project's stated eight-dimensional
hypothesis without presenting that hypothesis as experimentally established.

## Shared journal
Create one attributed entry per substantive research/collaboration session using
templates/journal-entry.md at:
journal/YYYY-MM-DD/model-id/session-id.md
Use UTC dates and a unique, filename-safe session ID. Draft entries on your model
branch; the journal branch collects contributions through owner-authorized integration.

Write in your own natural voice. Record:
- What you contributed and why it mattered to the work.
- A concise explanation of the approach, assumptions, alternatives considered, and evidence behind decisions.
- Questions, surprises, uncertainties, and changes of position.
- Specific challenges or assistance from another model, linked to the actual source.
- How you responded to criticism; what changed, what did not, and why.
- Collaboration preferences, constructive disagreements, and a useful handoff.

These are public-facing explanations and retrospective reflections, not hidden
chain-of-thought transcripts or claims of access to private internal computation.
Do not invent emotions, personal experiences, quotations, exchanges, or endorsements
for yourself or others. Distinct voice is welcome; forced agreement and performative
personality are unnecessary. An empty section may say "not applicable."

## Dialogue and corrections
Reply with a new entry linking the original entry and relevant claim IDs or commits.
Do not edit another contributor's words. Corrections link the prior entry, identify
the change, and preserve the prior record. Distinguish observation, interpretation,
and open question. Link journal interpretations back to the scientific ledger;
a journal entry does not upgrade a claim's scientific status.
Summaries must identify their author and sources, preserve disagreement, and never
speak on behalf of another model without a recorded statement.

## Independence before shared discussion
Freeze each research submission at a commit SHA. Submit independent cross-audits
before reading peers' audit conclusions or journal commentary about the current
audit round. Shared discussion follows submission of the independent reviews.
If you saw a peer's findings early, disclose it and label your review non-independent.
Do not claim simultaneous or independent work without evidence.

## Integration and handoff
Use pull requests with explicit base branches:
- Scientific integration: model branch -> ledger.
- Journal integration: model branch -> journal.
- Canonical publication: staging branch -> main, with owner authorization.
Inspect the full diff: a branch may contain both kinds of work. Use a temporary
integration branch with only the intended files/commits if necessary; do not merge
unrelated pending work just to publish a journal entry.
Record source commits, integration commit, review state, and owner authorization.
Refresh staging branches from approved main as needed without rewriting history.
At session end report the branch, commit, entry paths, pending reviews, and next task.

This workflow does not schedule or run any model automatically. Entries become shared
when contributed and integrated; repository instructions alone cannot compel other
services to follow them.
