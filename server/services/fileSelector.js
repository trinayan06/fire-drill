import { isSensitiveFile } from './redactor.js';

/**
 * Smart file selector and prioritzation engine.
 * Picks the most architecturally significant files for static and AI analysis
 * while strictly ignoring binaries, dependencies, lockfiles, and secrets.
 */

const IGNORED_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp',
  '.pdf', '.zip', '.tar', '.gz', '.woff', '.woff2', '.ttf', '.eot',
  '.mp4', '.mp3', '.lock', '.map', '.min.js', '.min.css'
]);

const IGNORED_PATHS = [
  'node_modules/',
  'vendor/',
  '.git/',
  'dist/',
  'build/',
  '.next/',
  '.nuxt/',
  'coverage/',
  'out/',
  'public/assets/',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'Cargo.lock',
  'poetry.lock'
];

/**
 * Calculates priority weight for a file path (higher = higher priority)
 */
function scoreFilePath(path) {
  const lower = path.toLowerCase();

  // Tier 1: Manifests & configs
  if (lower === 'package.json' || lower.endsWith('/package.json')) return 100;
  if (lower === 'requirements.txt' || lower === 'cargo.toml' || lower === 'go.mod') return 95;
  if (lower === 'docker-compose.yml' || lower === 'docker-compose.yaml') return 90;
  if (lower === 'tsconfig.json' || lower.includes('config.')) return 85;

  // Tier 2: Core entrypoints
  if (lower.match(/\b(index|server|app|main)\.(js|ts|jsx|tsx|py|go|rs)$/)) return 80;

  // Tier 3: Critical business flows & endpoints
  if (lower.includes('checkout') || lower.includes('order') || lower.includes('payment') || lower.includes('cart')) return 75;
  if (lower.includes('auth') || lower.includes('login') || lower.includes('signup') || lower.includes('token')) return 72;
  if (lower.includes('routes/') || lower.includes('controllers/') || lower.includes('api/')) return 70;
  if (lower.includes('services/') || lower.includes('services.')) return 65;
  if (lower.includes('models/') || lower.includes('db/') || lower.includes('database/')) return 60;
  
  // Tier 4: Contexts & stores
  if (lower.includes('context') || lower.includes('store') || lower.includes('redux') || lower.includes('zustand')) return 55;

  // Tier 5: Tests and workflows
  if (lower.includes('.github/workflows')) return 50;
  if (lower.includes('.test.') || lower.includes('.spec.') || lower.includes('/tests/') || lower.includes('/test/')) return 45;

  // Tier 6: General source files
  if (lower.startsWith('src/') || lower.startsWith('lib/') || lower.startsWith('app/')) return 30;

  return 10;
}

/**
 * Filter and sort files by architectural importance
 */
export function prioritizeFiles(tree, maxFiles = 15) {
  if (!Array.isArray(tree)) return [];

  const eligibleFiles = tree.filter(item => {
    // Only analyze blob/file items
    if (item.type !== 'blob' && item.type !== 'file') return false;

    const path = item.path || '';
    if (!path) return false;

    // Reject sensitive secrets
    if (isSensitiveFile(path)) return false;

    // Reject ignored paths and folders
    if (IGNORED_PATHS.some(ignored => path.includes(ignored))) return false;

    // Reject binary/asset extensions
    const extMatch = path.match(/\.[a-zA-Z0-9]+$/);
    if (extMatch && IGNORED_EXTENSIONS.has(extMatch[0].toLowerCase())) return false;

    // Reject overly massive files (> 200KB)
    if (item.size && item.size > 200 * 1024) return false;

    return true;
  });

  // Sort descending by priority score
  eligibleFiles.sort((a, b) => scoreFilePath(b.path) - scoreFilePath(a.path));

  return eligibleFiles.slice(0, maxFiles);
}
