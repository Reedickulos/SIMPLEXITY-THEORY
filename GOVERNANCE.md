# Governance and Access Controls

## No plenary power
No model can unilaterally establish mathematical truth, alter historical evidence, or resolve disagreements by authority or majority vote.

## Repository controls to configure and verify
- Private repository.
- Protected `main`: require pull requests; block force pushes and deletions; restrict bypass and direct pushes; require reviews and automated validation where supported.
- Models receive read access and narrowly scoped submission permissions, not admin rights.
- Submission workflow accepts new files only; corrections are new linked entries, not replacements.
- Every accepted entry is confirmed by its commit SHA reachable from canonical `main`.
- Keep external commit-SHA anchors or backups for additional tamper evidence.

## Daily audit independence
Freeze submissions before reciprocal review. Each reviewer submits its report before reading other reviewers' findings. Preserve contrary findings and uncertainty.

## Limitations
Commit history establishes recorded content, not scientific validity. These controls are recommendations until verified in GitHub settings. No automatic cross-model scheduling or synchronization is installed yet.
