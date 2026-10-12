/**
 * Master Fix Prompt Synthesizer
 * The HERO FEATURE of Fire Drill:
 * Generates an actionable, battle-tested prompt specifically tailored
 * for Antigravity, Cursor, Claude Code, or GitHub Copilot to execute without ambiguity.
 */

export function generateMasterFixPrompt(scanResult, agent = 'antigravity') {
  const { repo, issues = [], healthScore } = scanResult;
  const repoName = repo?.name || 'this repository';
  const stackSummary = repo?.stack?.join(', ') || repo?.framework || 'Modern Full-Stack';

  const agentIntros = {
    antigravity: `You are a Principal Software Reliability Engineer working in Google Antigravity.
I executed a FIRE DRILL code reliability analysis on ${repoName} (Health Score: ${healthScore}/100).
Your mission is to resolve the confirmed reliability issues and missing test paths below.`,

    cursor: `You are Cursor AI operating in Composer / Agent mode on repository "${repoName}".
Fire Drill detected ${issues.length} reliability and architecture issues (Current Health: ${healthScore}/100).
Perform a clean, defensive refactor resolving the exact issues listed below without altering unrelated files.`,

    claude: `You are Claude Code working directly inside this repository.
A Fire Drill pre-flight scan identified reliability defects and missing safety guards in ${repoName}.
Remediate the issues below, add automated test coverage, and verify backward compatibility.`,

    copilot: `You are GitHub Copilot Workspace.
Please fix the following reliability issues identified by Fire Drill for repository "${repoName}" (Stack: ${stackSummary}).`
  };

  const intro = agentIntros[agent.toLowerCase()] || agentIntros.antigravity;

  let issueBlocks = '';
  issues.forEach((issue, index) => {
    const classificationBadge = {
      confirmed_evidence: '[CONFIRMED BY STATIC EVIDENCE]',
      likely_issue: '[LIKELY ISSUE - HIGH PROBABILITY]',
      potential_risk: '[POTENTIAL RISK - REQUIRES VERIFICATION]',
      recommendation: '[RECOMMENDATION / BEST PRACTICE]'
    }[issue.evidenceLevel] || '[POTENTIAL ISSUE]';

    const testList = (issue.testCases || [])
      .map(tc => `    - [ ] Scenario: ${tc}`)
      .join('\n');

    issueBlocks += `
### [ISSUE ${issue.id}] ${issue.title}
- Classification: ${classificationBadge} (Confidence: ${Math.round((issue.confidence || 0.8) * 100)}%)
- Target File: \`${issue.file}\`
- Scope / Function: \`${issue.functionOrScope || 'Module Scope'}\`
- Severity: ${issue.severity.toUpperCase()}
- Problem:
  ${issue.problem}
- Code Evidence:
\`\`\`
${issue.evidence?.snippet || '// Evidence referenced in ' + issue.file}
\`\`\`
- Evidence Reasoning:
  ${issue.evidence?.explanation || 'Directly identified in static repository analysis.'}
- Potential Blast Radius / Impact:
  ${issue.impact}
- Prescribed Fix:
  ${issue.recommendation}
- Mandatory Test Scenarios:
${testList || '    - [ ] Verify fix behaves correctly under happy and error states'}
`;
  });

  return `${intro}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔥 FIRE DRILL RELIABILITY REMEDIATION MANIFEST
Repository: ${repoName}
Stack: ${stackSummary}
Issues Count: ${issues.length}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 1. TARGET ISSUES TO RESOLVE
${issueBlocks}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 2. STRICT EXECUTION CONSTRAINTS
1. SCOPE BOUNDARY:
   - Modify ONLY the specific files identified in the target list above.
   - Do NOT modify unrelated features, routes, or styling.
   - Do NOT perform indiscriminate code formatting on unaffected files.

2. DEFENSIVE GUARDS:
   - For race conditions (e.g., duplicate order submission): implement request-locks (\`isSubmitting\` state) and immediately disable action triggers upon click.
   - For security risks: eliminate client-side exposure of service-role / administrative secret keys.
   - For asynchronous loops: add robust try/catch blocks with graceful recovery.

3. TEST REQUIREMENTS:
   - Write automated unit or integration tests for EVERY mandatory test scenario listed above.
   - Verify that double-click / rapid-trigger flows are locked.
   - Verify that network and API error states recover gracefully.

4. COMPLETION REPORT:
   Upon completing the modifications, output a structured summary:
   - Specific files modified and exact line numbers.
   - Explanation of how each root cause was remediated.
   - Test execution results verifying each test scenario.
   - Remaining risks or follow-up recommendations for the developer.
`;
}
