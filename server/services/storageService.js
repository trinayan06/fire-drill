import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEMO_PRESETS } from '../presets/demoRepositories.js';
import { generateMasterFixPrompt } from './promptGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_FILE = path.join(__dirname, '..', '.firedrill_store.json');

// In-memory cache
const memoryStore = new Map();

// Initialize presets into store
for (const [key, preset] of Object.entries(DEMO_PRESETS)) {
  const scanObj = {
    scanId: `preset_${key}`,
    timestamp: new Date().toISOString(),
    aiEnhanced: true,
    repo: {
      url: preset.url,
      owner: preset.owner,
      name: preset.name,
      description: preset.description,
      defaultBranch: preset.defaultBranch,
      isPrivate: preset.isPrivate,
      stars: preset.stars,
      language: preset.language,
      framework: preset.framework,
      stack: preset.stack,
      stats: preset.stats
    },
    healthScore: preset.healthScore,
    summary: preset.summary,
    architecture: preset.architecture,
    issues: preset.issues,
    masterFixPrompt: ''
  };
  scanObj.masterFixPrompt = generateMasterFixPrompt(scanObj, 'antigravity');
  memoryStore.set(preset.url.toLowerCase(), scanObj);
  memoryStore.set(scanObj.scanId, scanObj);
}

export function saveScan(scanData) {
  if (!scanData || !scanData.scanId) return;
  memoryStore.set(scanData.scanId, scanData);
  if (scanData.repo?.url) {
    memoryStore.set(scanData.repo.url.toLowerCase(), scanData);
  }
}

export function getScanById(scanId) {
  return memoryStore.get(scanId) || null;
}

export function getScanByUrl(url) {
  if (!url) return null;
  return memoryStore.get(url.toLowerCase()) || null;
}

export function getAllScans() {
  const unique = new Map();
  for (const scan of memoryStore.values()) {
    if (scan.scanId && !unique.has(scan.scanId)) {
      unique.set(scan.scanId, scan);
    }
  }
  return Array.from(unique.values());
}
