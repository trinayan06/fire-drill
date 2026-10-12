import axios from 'axios';
import { config } from '../config.js';
import { analyzeStaticRepository } from './staticAnalyzer.js';
import { generateMasterFixPrompt } from './promptGenerator.js';

/**
 * Calculates a balanced 0-100 project health score based on issues
 */
export function calculateHealthScore(issues = []) {
  let score = 100;
  for (const issue of issues) {
    if (issue.severity === 'critical') score -= 15;
    else if (issue.severity === 'high') score -= 10;
    else if (issue.severity === 'medium') score -= 5;
    else if (issue.severity === 'low') score -= 2;
  }
  return Math.max(20, Math.min(98, score));
}

/**
 * AI-assisted repository reliability analysis.
 * Uses Gemini if configured, otherwise falls back smoothly to static heuristics.
 */
export async function analyzeRepository(repoData) {
  // 1. Run static heuristics first (always reliable and zero-latency)
  const staticResults = analyzeStaticRepository(repoData);

  let combinedIssues = [...staticResults.issues];
  let aiEnhanced = false;

  // 2. If Gemini API key is configured, perform deep contextual reasoning
  if (config.geminiApiKey) {
    try {
      const fileSummaries = (repoData.ingestedFiles || []).map(f => ({
        path: f.path,
        content: f.content?.slice(0, 3000) // snippet
      }));

      const systemPrompt = `You are a Principal Software Reliability Architect at Fire Drill.
Analyze the following code files from GitHub repository "${repoData.fullName}".
Focus on:
1. Concurrency/race conditions (e.g., button double clicks, missing request locks)
2. Security risks (e.g., sensitive keys, missing auth guards)
3. Performance bottlenecks (e.g., unthrottled search, memory leaks)
4. Missing test suites or failure edge cases

CRITICAL EVIDENCE TAXONOMY:
For each issue, classify evidenceLevel as one of:
- "confirmed_evidence": directly proven by code line snippets
- "likely_issue": high probability based on logic flow
- "potential_risk": requires live confirmation
- "recommendation": best practice advice

Return a clean, strictly valid JSON array of issues. Do not wrap in markdown quotes if possible, or use standard json block.
JSON Schema per issue:
{
  "id": "BUG-001",
  "category": "bug" | "security" | "performance" | "testing" | "architecture" | "reliability",
  "title": string,
  "severity": "critical" | "high" | "medium" | "low",
  "evidenceLevel": "confirmed_evidence" | "likely_issue" | "potential_risk" | "recommendation",
  "confidence": number between 0.5 and 0.99,
  "file": string (exact file path),
  "functionOrScope": string,
  "evidence": {
    "lineNumbers": string,
    "snippet": string,
    "explanation": string
  },
  "problem": string,
  "impact": string,
  "recommendation": string,
  "testCases": string[] (3-4 explicit test scenarios)
}`;

      const userMessage = `Repository: ${repoData.fullName}
Language: ${repoData.language}
Files:
${JSON.stringify(fileSummaries, null, 2)}

Provide up to 5 highest-priority reliability findings in JSON.`;

      const apiKey = config.geminiApiKey.trim();
      const headers = {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      };
      
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\n${userMessage}` }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json'
        }
      };

      let responseData = null;
      const modelsToTry = [
        'gemini-2.5-flash',
        'gemini-flash-latest',
        'gemini-3.5-flash',
        'gemini-3-flash-preview',
        'gemini-2.5-pro'
      ];
      let lastError = null;

      for (const model of modelsToTry) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
          const fetchRes = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(25000)
          });
          
          if (fetchRes.ok) {
            responseData = await fetchRes.json();
            if (responseData?.candidates?.[0]?.content?.parts?.[0]?.text) {
              break; // Succeeded
            }
          } else {
            const errBody = await fetchRes.json().catch(() => ({}));
            lastError = new Error(errBody?.error?.message || `HTTP ${fetchRes.status}`);
            if (fetchRes.status !== 404) {
              break;
            }
          }
        } catch (callErr) {
          lastError = callErr;
          break;
        }
      }

      if (!responseData && lastError) {
        throw lastError;
      }

      const rawText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const cleanedJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanedJson);
        const aiIssues = Array.isArray(parsed) ? parsed : (parsed.issues || []);

        if (aiIssues.length > 0) {
          // Merge AI issues with static issues, avoiding duplicate file/titles
          for (const aiIssue of aiIssues) {
            if (!combinedIssues.some(existing => existing.file === aiIssue.file && existing.title === aiIssue.title)) {
              combinedIssues.push({
                ...aiIssue,
                id: aiIssue.id || `AI-${String(combinedIssues.length + 1).padStart(3, '0')}`
              });
            }
          }
          aiEnhanced = true;
        }
      }
    } catch (err) {
      const apiErrMsg = err.response?.data?.error?.message || err.message;
      console.warn('⚠️ [Fire Drill] Gemini AI call error:', apiErrMsg);
      // Seamlessly continues with static heuristics without crashing
    }
  }

  // Calculate overall health score
  const healthScore = calculateHealthScore(combinedIssues);

  // Group summary metrics
  const summary = {
    criticalCount: combinedIssues.filter(i => i.severity === 'critical').length,
    highCount: combinedIssues.filter(i => i.severity === 'high').length,
    mediumCount: combinedIssues.filter(i => i.severity === 'medium').length,
    suggestionsCount: combinedIssues.filter(i => i.severity === 'low' || i.evidenceLevel === 'recommendation').length,
    securityCount: combinedIssues.filter(i => i.category === 'security').length,
    missingTestsCount: combinedIssues.filter(i => i.category === 'testing').length
  };

  const scanId = `scan_${Date.now()}`;

  const scanResult = {
    scanId,
    timestamp: new Date().toISOString(),
    aiEnhanced,
    repo: {
      url: repoData.url,
      owner: repoData.owner,
      name: repoData.repo,
      description: repoData.description,
      defaultBranch: repoData.defaultBranch,
      isPrivate: repoData.isPrivate,
      stars: repoData.stars,
      language: repoData.language,
      framework: staticResults.framework,
      stack: staticResults.stack,
      stats: {
        ...repoData.stats,
        dependenciesCount: staticResults.dependencyCount
      }
    },
    healthScore,
    summary,
    architecture: staticResults.architecture,
    issues: combinedIssues,
    masterFixPrompt: ''
  };

  // Synthesize default Master Fix Prompt
  scanResult.masterFixPrompt = generateMasterFixPrompt(scanResult, 'antigravity');

  return scanResult;
}

/**
 * Conversational AI Assistant
 * Interactively answers questions about the scan results, issues, evidence,
 * and fixes without ever hallucinating non-existent issues.
 */
export async function chatWithAssistant(scanData, userMessage, conversationHistory = []) {
  if (!scanData || !scanData.issues) {
    throw new Error('No active scan session provided.');
  }

  const { repo, healthScore, summary, issues = [] } = scanData;
  const repoName = repo?.name || 'this repository';
  const highestIssue = issues.find(i => i.severity === 'critical') || issues.find(i => i.severity === 'high') || issues[0];

  // Check if Gemini key is available
  if (config.geminiApiKey) {
    try {
      const apiKey = config.geminiApiKey.trim();
      const headers = {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      };

      const scanContext = {
        repository: repoName,
        framework: repo?.framework,
        stack: repo?.stack,
        healthScore,
        summary,
        issues: issues.map(i => ({
          id: i.id,
          category: i.category,
          title: i.title,
          severity: i.severity,
          evidenceLevel: i.evidenceLevel,
          confidence: i.confidence,
          file: i.file,
          functionOrScope: i.functionOrScope,
          evidence: i.evidence,
          problem: i.problem,
          impact: i.impact,
          recommendation: i.recommendation,
          testCases: i.testCases
        }))
      };

      const systemInstruction = `You are Fire Drill AI, an elite principal software reliability engineer and interactive forensic assistant.
The user is inspecting an autonomous pre-flight reliability scan of repository "${repoName}".

CURRENT CONFIRMED SCAN DATA:
${JSON.stringify(scanContext, null, 2)}

CRITICAL GROUNDING RULES:
1. STRICT ZERO-HALLUCINATION: Base your response ENTIRELY on the scan data provided above. Do NOT invent new issues, files, or fake bugs.
2. CITATIONS: Whenever discussing an issue, always cite its exact ID (e.g. BUG-001), exact file path (e.g. \`src/pages/Checkout.jsx\`), and severity.
3. FORENSIC EVIDENCE: If the user asks about evidence or root cause, reference the exact code snippet or reasoning from the scan.
5. ROADMAP & FUTURE VISION (P1, P2, P3):
If the user asks about the future, what's coming next, P3, predicting bugs, verifying AI fixes, or what Fire Drill will become, accurately explain our multi-phase roadmap and distinguish:
- CURRENT (P0 - Operational): Public repo scan, static AST + AI reliability analysis, evidence-backed Bug Hunt, deterministic health scoring, Fire Drill AI assistant, Master Fix Prompt, Re-Scan & Delta.
- NEXT (P1 - Coming Soon): Disaster Drill (production failure & chaos simulation), Architecture Map (interactive dependency topology & SPOF highlights).
- UPCOMING (P2 - In Design): AI Fix Audit (verifying code diffs from Antigravity/Cursor/Claude Code), Scan History & Reliability Timeline, GitHub PR Reliability Bot, Advanced Drill Suite (Security, Performance, Testing, Dependency drills).
- FUTURE / EXPLORING (P3 - Research Horizon):
  * Reliability Memory: Long-term repository profile, recurring defect memory.
  * Predictive Bug Detection: Forecasting high-risk files and regression-prone areas before failure.
  * Pre-Deployment Reliability Gate: Automated pass/warning/block release policies.
  * Production Observability Intelligence: Correlating APM logs/telemetry with AST source code.
  * Autonomous Fix Verification: Independent verification that AI-generated fixes remediate root causes without regressions (evolution of AI Fix Audit).
  * Autonomous Chaos Engine: Active resilience and fault injection.
  * Repository Digital Twin: Living architecture & failure propagation simulation.
  * Team Reliability Intelligence: Cross-repo health and defect containment metrics.
CRITICAL: Never claim P1, P2, or P3 features are currently implemented. They are planned future concepts.
When asked "What is Fire Drill ultimately trying to become?" or about its long-term vision, declare:
"Fire Drill is evolving from an AI code scanner into an autonomous reliability engineer — one that can understand a codebase, find risks, simulate failures, verify AI-generated fixes, predict regressions, and eventually continuously protect software reliability."
6. FORMATTING: Use clean, structured GitHub Markdown with bold titles, bullet points, and code blocks.`;

      // Build turn contents
      const contents = [];
      
      // Add previous conversation turns if provided
      for (const turn of conversationHistory.slice(-4)) {
        if (turn.role === 'user' || turn.role === 'assistant') {
          contents.push({
            role: turn.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: turn.content }]
          });
        }
      }

      // Add current message with system instructions
      contents.push({
        role: 'user',
        parts: [{ text: `${systemInstruction}\n\nUser Question: ${userMessage}` }]
      });

      const payload = {
        contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1200
        }
      };

      const modelsToTry = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-3.5-flash'];
      for (const model of modelsToTry) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
          const res = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(20000)
          });

          if (res.ok) {
            const data = await res.json();
            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (reply) {
              // Find issue IDs mentioned in the reply
              const referencedIssues = issues.filter(i => reply.includes(i.id)).map(i => i.id);
              return {
                reply,
                referencedIssueIds: referencedIssues.length > 0 ? referencedIssues : (highestIssue ? [highestIssue.id] : []),
                aiEnhanced: true
              };
            }
          }
        } catch {
          // Fall through to next model or fallback
        }
      }
    } catch (err) {
      console.warn('⚠️ [Fire Drill Assistant] Gemini chat fallback:', err.message);
    }
  }

  // Deterministic Intelligent Fallback
  return generateDeterministicAssistantResponse(scanData, userMessage);
}

/**
 * Intelligent deterministic assistant responder based strictly on scan data
 */
function generateDeterministicAssistantResponse(scanData, userMessage) {
  const { repo, healthScore, summary, issues = [] } = scanData;
  const lowerMsg = userMessage.toLowerCase();
  const repoName = repo?.name || 'this repository';

  const criticalIssues = issues.filter(i => i.severity === 'critical');
  const highIssues = issues.filter(i => i.severity === 'high');
  const topIssue = criticalIssues[0] || highIssues[0] || issues[0];

  // Intent 0A: What is Fire Drill ultimately trying to become / long-term vision
  if (lowerMsg.includes('ultimately trying to become') || lowerMsg.includes('eventually become') || lowerMsg.includes('what will fire drill become') || lowerMsg.includes('future of fire drill') || lowerMsg.includes('long-term vision') || lowerMsg.includes('vision manifesto')) {
    return {
      reply: `🌟 **Fire Drill Vision Manifesto**\n\n> "Fire Drill's long-term vision is not just to find bugs. It is to continuously understand, predict, test, and verify software reliability."\n\n**What Fire Drill is ultimately trying to become:**\n\n**Fire Drill is evolving from an AI code scanner into an autonomous reliability engineer** — one that can understand a codebase, find risks, simulate failures, verify AI-generated fixes, predict regressions, and eventually continuously protect software reliability.\n\n### Strategic Evolution\n- **NOW (P0)**: AI Reliability Scanner (Live & Operational)\n- **NEXT (P1)**: Reliability Simulation (Disaster Drill & Architecture Map)\n- **UPCOMING (P2)**: Engineering Workflow Integration (AI Fix Audit & PR Bot)\n- **FUTURE / EXPLORING (P3)**: Predictive & Autonomous Reliability Intelligence\n- **HORIZON**: Autonomous Reliability Engineer\n\n💡 *Explore our full strategic plan in the **Product Roadmap** tab in the sidebar!*`,
      referencedIssueIds: [],
      aiEnhanced: false
    };
  }

  // Intent 0B: P3 Advanced Reliability Intelligence / Specific P3 queries
  if (lowerMsg.includes('p3') || lowerMsg.includes('advanced features') || lowerMsg.includes('predict bugs') || lowerMsg.includes('predictive') || lowerMsg.includes('verify ai') || lowerMsg.includes('autonomous fix') || lowerMsg.includes('reliability memory') || lowerMsg.includes('digital twin') || lowerMsg.includes('chaos engine')) {
    let focusNote = '';
    if (lowerMsg.includes('predict')) {
      focusNote = `\n\n🔮 **Can Fire Drill predict bugs?**\nYes! Under **P3: Predictive Bug Detection** (Status: FUTURE), Fire Drill will analyze structural entropy, code churn, and past incident histories to forecast high-risk files and regression hotspots *before* code is deployed. *(Note: This capability is in active research and not yet live in P0).*`;
    } else if (lowerMsg.includes('verify')) {
      focusNote = `\n\n🤖 **Can Fire Drill verify AI-generated fixes?**\nYes! Under **P2: AI Fix Audit** and **P3: Autonomous Fix Verification** (Status: FUTURE), Fire Drill evaluates code diffs produced by AI agents (Antigravity, Cursor, Claude Code) to ensure root causes are truly remediated rather than masked with superficial try/catch blocks. *(Note: AI Fix Verification is planned for P2/P3).*`;
    }

    return {
      reply: `🧠 **P3 — Advanced Reliability Intelligence (Status: FUTURE / EXPLORING)**\n\nP3 represents Fire Drill's research horizon for autonomous reliability engineering:${focusNote}\n\n1. 🧠 **Reliability Memory** (FUTURE)\n   - Learns from previous scans, fixes, and regressions to build a persistent repository reliability profile.\n2. 🔮 **Predictive Bug Detection** (FUTURE)\n   - Forecasts high-risk files and regression-prone areas before failure occurs.\n3. 🛡️ **Pre-Deployment Reliability Gate** (PLANNED)\n   - Automated release evaluations with Pass / Warning / Block decisions (e.g. *Score: 91 | Status: PASS*).\n4. 🌐 **Production Observability Intelligence** (EXPLORING)\n   - Correlates live APM logs, stacktraces, and incident alerts directly with AST source code.\n5. 🤖 **Autonomous Fix Verification** (FUTURE)\n   - Independent verification that AI-generated fixes remediate root causes without new regressions (evolution of AI Fix Audit).\n6. 🧪 **Autonomous Chaos Engine** (EXPLORING)\n   - Active resilience injection: Database outages, API timeouts, and network failure simulations.\n7. 🕸️ **Repository Digital Twin** (FUTURE)\n   - Living graph of architecture, service dependencies, data flows, and failure propagation paths.\n8. 👥 **Team Reliability Intelligence** (FUTURE)\n   - Team-wide velocity metrics, sprint reliability trends, and repeated failure anti-patterns.\n\n⚠️ *Important: All P3 features are planned research concepts and are not currently active in production.*`,
      referencedIssueIds: [],
      aiEnhanced: false
    };
  }

  // Intent 0C: General Roadmap & Upcoming features
  if (lowerMsg.includes('coming next') || lowerMsg.includes('roadmap') || lowerMsg.includes('upcoming') || lowerMsg.includes('next features') || lowerMsg.includes("what's next")) {
    return {
      reply: `🚀 **Fire Drill Product Roadmap & Strategic Evolution**\n\nHere is how Fire Drill is expanding across development phases:\n\n### **CURRENT (P0 — Operational Now)**\n- Public GitHub ingestion & AST stack detection\n- Evidence-backed Bug Hunt with zero hallucination\n- Deterministic 0-100 Health Scoring Engine\n- Hero Master Fix Prompt generator\n- Fire Drill AI Copilot & Re-Scan verification\n\n### **NEXT (P1 — In Design / Q2)**\n1. **Disaster Drill**: Production failure simulation & blast-radius analysis\n2. **Architecture Map**: Interactive topology (Frontend → API → Database → Services)\n\n### **UPCOMING (P2 — Planned / Q3-Q4)**\n3. **AI Fix Audit**: Forensic evaluation of diffs from Antigravity/Cursor/Claude Code\n4. **Scan History & Reliability Timeline**: Historical score progression & defect trends\n5. **GitHub PR Reliability Bot**: Automated pre-merge PR review & status checks\n6. **Advanced Drill Suite**: Deep-dive Security, Performance, Testing & Dependency drills\n\n### **FUTURE / EXPLORING (P3 — Research Horizon)**\n7. **Reliability Memory & Predictive Bug Detection**: Forecasting failures before they happen\n8. **Pre-Deployment Gate & Autonomous Fix Verification**: Active verification & release gating\n9. **Autonomous Chaos Engine & Repository Digital Twin**: Living architecture & active resilience\n\n💡 *View the full interactive breakdown in the **Product Roadmap** tab in your sidebar!*`,
      referencedIssueIds: [],
      aiEnhanced: false
    };
  }

  // Intent A: What should I fix first? / recommended priority
  if (lowerMsg.includes('fix first') || lowerMsg.includes('priority') || lowerMsg.includes('where to start')) {
    if (!topIssue) {
      return {
        reply: `🔥 **Fire Drill Analysis Summary**\n\nNo critical reliability blockers were identified in **${repoName}**. Your current health score is **${healthScore}/100**.`,
        referencedIssueIds: [],
        aiEnhanced: false
      };
    }

    const priorityList = [...criticalIssues, ...highIssues].slice(0, 3);
    const listMarkdown = priorityList.map((iss, idx) => 
      `${idx + 1}. **[${iss.id}] ${iss.title}** (${iss.severity.toUpperCase()})\n   - File: \`${iss.file}\`\n   - Problem: ${iss.problem}\n   - Classification: \`${iss.evidenceLevel}\``
    ).join('\n\n');

    return {
      reply: `🔥 **Priority Remediation Order for ${repoName}**\n\nBased on static evidence and architectural blast radius, here is your prescribed priority:\n\n${listMarkdown}\n\n💡 **Recommendation**: Start by locking down **[${topIssue.id}]** in \`${topIssue.file}\`. Click **[Inspect Issue]** below to review its forensic line evidence, or **[Generate Master Fix Prompt]** to have your AI coding agent repair it immediately.`,
      referencedIssueIds: priorityList.map(i => i.id),
      aiEnhanced: false
    };
  }

  // Intent B: Explain this issue / specific issue lookup
  const issueMatch = issues.find(i => lowerMsg.includes(i.id.toLowerCase()));
  if (issueMatch || lowerMsg.includes('explain') || lowerMsg.includes('what is the issue')) {
    const target = issueMatch || topIssue;
    return {
      reply: `🔍 **Forensic Breakdown: [${target.id}] ${target.title}**\n\n- **Target File**: \`${target.file}\` (${target.functionOrScope || 'Module'})\n- **Severity**: ${target.severity.toUpperCase()} | Confidence: ${Math.round((target.confidence || 0.8) * 100)}%\n- **Classification**: \`${target.evidenceLevel}\`\n\n### Root Cause\n${target.problem}\n\n### Potential Impact\n${target.impact}\n\n### Prescribed Engineering Fix\n${target.recommendation}\n\n\`\`\`javascript\n${target.evidence?.snippet || '// Code evidence in ' + target.file}\n\`\`\`\n\n*Reasoning: ${target.evidence?.explanation || 'Directly identified in static repository analysis.'}*`,
      referencedIssueIds: [target.id],
      aiEnhanced: false
    };
  }

  // Intent C: Show evidence / line numbers
  if (lowerMsg.includes('evidence') || lowerMsg.includes('show the code') || lowerMsg.includes('lines')) {
    const target = topIssue;
    return {
      reply: `📋 **Forensic Repository Evidence for [${target.id}]**\n\n- **File**: \`${target.file}\`\n- **Lines**: ${target.evidence?.lineNumbers || 'Handler Scope'}\n\n\`\`\`javascript\n${target.evidence?.snippet || '// Evidence snippet'}\n\`\`\`\n\n**Forensic Explanation**:\n${target.evidence?.explanation}\n\nClick **[View Evidence]** below to jump directly to the code viewer in Bug Hunt.`,
      referencedIssueIds: [target.id],
      aiEnhanced: false
    };
  }

  // Intent D: Why is my score low?
  if (lowerMsg.includes('score') || lowerMsg.includes('low') || lowerMsg.includes('why')) {
    return {
      reply: `📊 **Health Score Audit (${healthScore}/100)**\n\nYour score is calculated directly from confirmed architectural and reliability risks in **${repoName}**:\n\n- **Critical Issues** (${summary.criticalCount}): -15 pts each (e.g. security bypasses, exposed admin keys)\n- **High Issues** (${summary.highCount}): -10 pts each (e.g. duplicate order race conditions)\n- **Medium Issues** (${summary.mediumCount}): -5 pts each (e.g. unbounded polling intervals, search debounce)\n- **Missing Test Suites** (${summary.missingTestsCount}): regression vulnerabilities\n\nTo raise your score to **85+**, resolve **[${topIssue?.id || 'BUG-001'}]** and apply the Master Fix Prompt.`,
      referencedIssueIds: topIssue ? [topIssue.id] : [],
      aiEnhanced: false
    };
  }

  // Intent E: Security issues
  if (lowerMsg.includes('security') || lowerMsg.includes('vulnerab') || lowerMsg.includes('auth')) {
    const secIssues = issues.filter(i => i.category === 'security');
    if (secIssues.length === 0) {
      return {
        reply: `🛡️ **Security Audit Clean**\n\nNo critical security vulnerabilities were discovered in **${repoName}**. The remaining issues are primarily reliability, concurrency, or test coverage items.`,
        referencedIssueIds: [],
        aiEnhanced: false
      };
    }
    const secList = secIssues.map(s => `- **[${s.id}] ${s.title}** in \`${s.file}\` (${s.severity.toUpperCase()}): ${s.problem}`).join('\n\n');
    return {
      reply: `🛡️ **Security Concerns in ${repoName}**\n\nFound **${secIssues.length}** security-sensitive findings:\n\n${secList}\n\n⚠️ Ensure administrative secret keys and token comparison utilities are hardened.`,
      referencedIssueIds: secIssues.map(s => s.id),
      aiEnhanced: false
    };
  }

  // Intent F: Missing tests
  if (lowerMsg.includes('test') || lowerMsg.includes('coverage') || lowerMsg.includes('missing')) {
    const testIssues = issues.filter(i => i.category === 'testing');
    const firstTest = testIssues[0] || topIssue;
    return {
      reply: `🧪 **Test Coverage Assessment**\n\nFire Drill detected **${testIssues.length}** test-related risks in **${repoName}**.\n\nKey finding: **[${firstTest.id}] ${firstTest.title}**\n- File: \`${firstTest.file}\`\n- Impact: ${firstTest.impact}\n\n💡 Automated tests for double-click requests, network dropouts, and payment failure paths are missing.`,
      referencedIssueIds: testIssues.map(i => i.id),
      aiEnhanced: false
    };
  }

  // Default General Summary
  return {
    reply: `🔥 **Fire Drill Reliability Assistant**\n\nI have analyzed **${repoName}**.\n- **Health Score**: ${healthScore}/100\n- **Total Discovered Issues**: ${issues.length} (${summary.criticalCount} Critical, ${summary.highCount} High, ${summary.mediumCount} Medium)\n- **Highest Risk**: **[${topIssue?.id}] ${topIssue?.title}** in \`${topIssue?.file}\`\n\nWhat would you like to inspect next? Use the quick actions below to view forensic evidence, explain an issue, or generate the Master Fix Prompt.`,
    referencedIssueIds: topIssue ? [topIssue.id] : [],
    aiEnhanced: false
  };
}

