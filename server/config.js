import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from server/ directory, then fallback to root
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

export const config = {
  port: process.env.PORT || 3001,
  githubToken: process.env.GITHUB_TOKEN || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  nodeEnv: process.env.NODE_ENV || 'development',
  maxFilesToAnalyze: 15,
  maxFileSizeKb: 40,
  maxTotalContentKb: 200,
};

/**
 * Safe startup environment validator
 * Validates presence of keys without ever printing or leaking secret values.
 */
export function validateEnvironment() {
  const status = {
    hasGithubToken: Boolean(config.githubToken && config.githubToken.trim()),
    hasGeminiKey: Boolean(config.geminiApiKey && config.geminiApiKey.trim()),
  };

  if (!status.hasGithubToken) {
    console.warn('⚠️  [WARNING] GITHUB_TOKEN is not configured in .env. Public repository analysis will proceed under unauthenticated rate limits (60 req/hr).');
  } else {
    console.log('✅ [GITHUB] GITHUB_TOKEN configured. Authenticated GitHub API access active.');
  }

  if (!status.hasGeminiKey) {
    console.error('❌ [ERROR] GEMINI_API_KEY is not configured in .env. AI reasoning will not operate; Fire Drill will utilize static heuristics.');
  } else {
    console.log('✅ [GEMINI] GEMINI_API_KEY configured. AI reasoning pipeline initialized.');
  }

  return status;
}
