import express from 'express';
import { ingestGitHubRepository, parseGitHubUrl } from '../services/githubService.js';
import { analyzeRepository, chatWithAssistant } from '../services/aiService.js';
import { generateMasterFixPrompt } from '../services/promptGenerator.js';
import { calculateRescanDelta } from '../services/diffEngine.js';
import { saveScan, getScanById, getScanByUrl } from '../services/storageService.js';
import { DEMO_PRESETS } from '../presets/demoRepositories.js';

const router = express.Router();

/**
 * POST /api/chat
 * Conversational AI Assistant route grounded in the current repository scan
 */
router.post('/chat', async (req, res) => {
  try {
    const { scanId, message, history = [], scan: clientScan } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Please provide a message for the assistant.' });
    }

    let scan = getScanById(scanId);
    if (!scan && clientScan) {
      scan = clientScan;
    }

    if (!scan) {
      return res.status(404).json({ error: 'Scan session not found. Please scan a repository first.' });
    }

    const assistantResult = await chatWithAssistant(scan, message.trim(), history);
    return res.json({
      success: true,
      reply: assistantResult.reply,
      referencedIssueIds: assistantResult.referencedIssueIds || [],
      aiEnhanced: assistantResult.aiEnhanced
    });
  } catch (err) {
    console.error('[Assistant Chat Error]:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/presets
 * Returns available demo repositories for instant 1-click test flow
 */
router.get('/presets', (req, res) => {
  const presetsList = Object.entries(DEMO_PRESETS).map(([key, data]) => ({
    id: key,
    name: data.name,
    owner: data.owner,
    url: data.url,
    description: data.description,
    framework: data.framework,
    stars: data.stars,
    initialHealthScore: data.healthScore,
    resolvedHealthScore: data.rescanState.healthScore
  }));
  res.json({ presets: presetsList });
});

/**
 * POST /api/scan
 * Ingests and analyzes a GitHub repository
 */
router.post('/scan', async (req, res) => {
  try {
    const { repoUrl, presetId } = req.body;

    // 1. Direct preset shortcut
    if (presetId && DEMO_PRESETS[presetId]) {
      const presetData = DEMO_PRESETS[presetId];
      const cached = getScanByUrl(presetData.url);
      if (cached) {
        return res.json({ success: true, scan: cached, isPreset: true });
      }
    }

    // 2. Check if entered URL matches a known demo preset
    if (repoUrl) {
      const normalizedUrl = repoUrl.trim().toLowerCase();
      for (const [key, preset] of Object.entries(DEMO_PRESETS)) {
        if (normalizedUrl.includes(preset.name.toLowerCase()) || normalizedUrl === preset.url.toLowerCase()) {
          const cached = getScanByUrl(preset.url);
          if (cached) {
            return res.json({ success: true, scan: cached, isPreset: true });
          }
        }
      }
    }

    if (!repoUrl) {
      return res.status(400).json({ error: 'Please provide a valid GitHub repository URL.' });
    }

    // 3. Live GitHub ingestion
    const repoData = await ingestGitHubRepository(repoUrl);

    // 4. Analysis (Static + AI reasoning)
    const scanResult = await analyzeRepository(repoData);

    // Save scan to store
    saveScan(scanResult);

    return res.json({ success: true, scan: scanResult, isPreset: false });
  } catch (err) {
    console.error('[Scan Error]:', err.message);
    return res.status(400).json({
      error: err.message,
      suggestion: 'You can test immediately using one of our verified Demo Presets above.'
    });
  }
});

/**
 * POST /api/generate-prompt
 * Re-synthesizes Master Fix Prompt with target agent configuration
 */
router.post('/generate-prompt', (req, res) => {
  try {
    const { scanId, agent = 'antigravity' } = req.body;
    const scan = getScanById(scanId);

    if (!scan) {
      return res.status(404).json({ error: 'Scan session not found.' });
    }

    const masterPrompt = generateMasterFixPrompt(scan, agent);
    return res.json({ success: true, masterPrompt, agent });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/rescan
 * Re-analyzes repository state after fixes are pushed and computes Delta
 */
router.post('/rescan', async (req, res) => {
  try {
    const { previousScanId, repoUrl, presetId } = req.body;
    let previousScan = getScanById(previousScanId);

    if (!previousScan && repoUrl) {
      previousScan = getScanByUrl(repoUrl);
    }

    if (!previousScan) {
      return res.status(404).json({ error: 'Previous scan session not found for delta comparison.' });
    }

    // 1. Check if previous scan was a preset
    let currentScan;
    const matchedPreset = Object.values(DEMO_PRESETS).find(p => 
      previousScan.repo.url.toLowerCase() === p.url.toLowerCase() || p.id === presetId
    );

    if (matchedPreset && matchedPreset.rescanState) {
      // Build resolved re-scan representation
      currentScan = {
        scanId: `rescan_${Date.now()}`,
        timestamp: new Date().toISOString(),
        repo: previousScan.repo,
        healthScore: matchedPreset.rescanState.healthScore,
        summary: {
          criticalCount: 0,
          highCount: 0,
          mediumCount: 1,
          suggestionsCount: 2,
          securityCount: 0,
          missingTestsCount: 0
        },
        issues: [
          ...matchedPreset.rescanState.remainingIssues.map((rem, idx) => ({
            id: rem.id,
            category: 'architecture',
            title: rem.title,
            severity: rem.severity,
            evidenceLevel: rem.evidenceLevel,
            confidence: 0.8,
            file: 'src/server.js',
            functionOrScope: 'Middleware',
            evidence: {
              lineNumbers: '12',
              snippet: '// Non-critical recommendation',
              explanation: 'Remaining minor optimization.'
            },
            problem: 'Minor non-blocking improvement.',
            impact: 'Negligible performance overhead.',
            recommendation: 'Apply compression middleware during next release.',
            testCases: ['Ensure gzip compression header is returned']
          })),
          ...matchedPreset.rescanState.newIssues.map((ni, idx) => ({
            id: ni.id,
            category: 'performance',
            title: ni.title,
            severity: ni.severity,
            evidenceLevel: ni.evidenceLevel,
            confidence: 0.72,
            file: 'src/api/orders.js',
            functionOrScope: 'Cache-Control',
            evidence: {
              lineNumbers: '34',
              snippet: `res.setHeader('Cache-Control', 'max-age=300');`,
              explanation: 'Cache TTL set to 5 minutes may cause minor staleness.'
            },
            problem: 'Order status caching might slightly delay immediate visual update.',
            impact: 'Users might see previous status for up to 5 seconds without manual refresh.',
            recommendation: 'Lower TTL to 15 seconds.',
            testCases: ['Verify cache header matches TTL']
          }))
        ]
      };
      currentScan.masterFixPrompt = generateMasterFixPrompt(currentScan, 'antigravity');
    } else {
      // Live re-scan from GitHub
      const repoData = await ingestGitHubRepository(previousScan.repo.url);
      currentScan = await analyzeRepository(repoData);
    }

    // Compute Delta
    const delta = calculateRescanDelta(previousScan, currentScan);

    // Save new scan
    saveScan(currentScan);

    return res.json({
      success: true,
      delta,
      currentScan,
      previousScan
    });
  } catch (err) {
    console.error('[Re-scan Error]:', err.message);
    return res.status(400).json({ error: err.message });
  }
});

export default router;
