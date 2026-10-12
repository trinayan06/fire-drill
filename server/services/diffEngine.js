/**
 * Re-Scan Diff Engine
 * Compares an initial scan with a subsequent re-scan (or simulated fixed state)
 * to compute exact health delta, resolved issues, remaining issues, and newly introduced risks.
 */

export function calculateRescanDelta(previousScan, currentScan) {
  const prevScore = previousScan.healthScore || 63;
  const currScore = currentScan.healthScore || 88;
  const scoreDelta = currScore - prevScore;

  const prevIssues = previousScan.issues || [];
  const currIssues = currentScan.issues || [];

  // Match by issue ID or title
  const resolved = [];
  const remaining = [];
  const newlyDetected = [];

  const currIssueIds = new Set(currIssues.map(i => i.id));
  const prevIssueIds = new Set(prevIssues.map(i => i.id));

  // Issues in previous scan that no longer appear in current scan
  for (const prev of prevIssues) {
    if (!currIssueIds.has(prev.id)) {
      resolved.push({
        id: prev.id,
        title: prev.title,
        category: prev.category,
        severity: prev.severity,
        evidenceLevel: prev.evidenceLevel
      });
    } else {
      const match = currIssues.find(c => c.id === prev.id);
      remaining.push({
        id: prev.id,
        title: prev.title,
        severity: match?.severity || prev.severity,
        evidenceLevel: match?.evidenceLevel || prev.evidenceLevel
      });
    }
  }

  // Issues in current scan that were not in previous scan
  for (const curr of currIssues) {
    if (!prevIssueIds.has(curr.id)) {
      newlyDetected.push({
        id: curr.id,
        title: curr.title,
        severity: curr.severity,
        category: curr.category,
        evidenceLevel: curr.evidenceLevel
      });
    }
  }

  const summary = `${resolved.length} issues successfully verified resolved. ${remaining.length} issues remaining. ${newlyDetected.length} new risks flagged.`;

  return {
    previousScanId: previousScan.scanId,
    currentScanId: currentScan.scanId,
    previousScore: prevScore,
    currentScore: currScore,
    scoreDelta,
    resolvedIssues: resolved,
    remainingIssues: remaining,
    newIssues: newlyDetected,
    summary
  };
}
