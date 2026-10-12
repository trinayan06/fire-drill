import axios from 'axios';
import { config } from '../config.js';
import { prioritizeFiles } from './fileSelector.js';
import { redactSecrets } from './redactor.js';

/**
 * Extracts owner and repo from a GitHub URL string
 */
export function parseGitHubUrl(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('Please enter a GitHub repository URL.');
  }

  const cleaned = url.trim().replace(/\.git$/, '').replace(/\/$/, '');
  const match = cleaned.match(/github\.com\/([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)/i);

  if (!match) {
    throw new Error('Invalid GitHub URL. Expected format: https://github.com/owner/repository');
  }

  return {
    owner: match[1],
    repo: match[2]
  };
}

/**
 * Helper to build axios config with optional GitHub token and proper headers
 */
function getAxiosConfig() {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'FireDrill-Reliability-Simulator'
  };

  if (config.githubToken && config.githubToken.trim()) {
    const token = config.githubToken.trim();
    headers['Authorization'] = token.startsWith('ghp_') ? `token ${token}` : `Bearer ${token}`;
  }

  return { headers, timeout: 15000 };
}

/**
 * Ingests repository metadata, recursive file tree, and critical file contents
 */
export async function ingestGitHubRepository(repoUrl) {
  const { owner, repo } = parseGitHubUrl(repoUrl);
  const axiosConfig = getAxiosConfig();

  let repoMetadata;
  try {
    const metaRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, axiosConfig);
    repoMetadata = metaRes.data;
  } catch (err) {
    if (err.response?.status === 404) {
      throw new Error(`Repository "${owner}/${repo}" was not found or is private. Make sure it is public.`);
    }
    if (err.response?.status === 403) {
      const resetTime = err.response.headers['x-ratelimit-reset'];
      const minutesRemaining = resetTime ? Math.max(1, Math.round((resetTime * 1000 - Date.now()) / 60000)) : 60;
      throw new Error(`GitHub API rate limit reached. Limit resets in ~${minutesRemaining} minutes. Use a demo preset or supply GITHUB_TOKEN.`);
    }
    throw new Error(`GitHub request failed: ${err.message}`);
  }

  const defaultBranch = repoMetadata.default_branch || 'main';

  // 1-call recursive git tree fetch
  let treeItems = [];
  try {
    const treeRes = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
      axiosConfig
    );
    treeItems = treeRes.data?.tree || [];
  } catch (err) {
    // If branch tree fetch fails, fall back to master
    if (defaultBranch !== 'master') {
      try {
        const fallbackRes = await axios.get(
          `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`,
          axiosConfig
        );
        treeItems = fallbackRes.data?.tree || [];
      } catch (e) {
        throw new Error(`Failed to fetch file tree for ${owner}/${repo}: ${e.message}`);
      }
    } else {
      throw new Error(`Failed to fetch file tree for ${owner}/${repo}: ${err.message}`);
    }
  }

  if (treeItems.length === 0) {
    throw new Error(`Repository "${owner}/${repo}" appears to be empty.`);
  }

  // Calculate file/folder topology metrics
  const filesList = treeItems.filter(item => item.type === 'blob');
  const foldersList = treeItems.filter(item => item.type === 'tree');

  // Check for presence of tests
  const hasTests = treeItems.some(item => {
    const p = item.path.toLowerCase();
    return p.includes('test') || p.includes('spec') || p.includes('__tests__');
  });

  // Prioritize critical files to inspect
  const prioritized = prioritizeFiles(filesList, config.maxFilesToAnalyze);

  // Ingest raw contents concurrently with size cap
  const fetchedFiles = await Promise.all(
    prioritized.map(async (file) => {
      try {
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${file.path}`;
        const contentRes = await axios.get(rawUrl, {
          timeout: 8000,
          responseType: 'text',
          transformResponse: [data => data] // preserve exact text
        });

        const rawContent = typeof contentRes.data === 'string' ? contentRes.data : JSON.stringify(contentRes.data);
        
        // Truncate overly long files to preserve token and memory budget
        const truncated = rawContent.slice(0, config.maxFileSizeKb * 1024);
        
        // Strictly redact secrets before returning
        const sanitizedContent = redactSecrets(truncated);

        return {
          path: file.path,
          size: file.size || sanitizedContent.length,
          content: sanitizedContent
        };
      } catch (fetchErr) {
        return {
          path: file.path,
          size: file.size || 0,
          content: null,
          error: fetchErr.message
        };
      }
    })
  );

  const successfulFiles = fetchedFiles.filter(f => f.content !== null);

  // Approximate lines of code
  const estimatedLoc = successfulFiles.reduce((acc, f) => {
    return acc + (f.content.split('\n').length || 0);
  }, 0) * Math.max(1, Math.round(filesList.length / Math.max(1, successfulFiles.length)));

  return {
    owner,
    repo: repoMetadata.name,
    fullName: repoMetadata.full_name,
    description: repoMetadata.description || 'No description provided.',
    url: repoMetadata.html_url,
    defaultBranch,
    isPrivate: repoMetadata.private,
    stars: repoMetadata.stargazers_count,
    language: repoMetadata.language || 'Multi-language',
    tree: treeItems.map(item => ({ path: item.path, type: item.type, size: item.size })),
    stats: {
      foldersCount: foldersList.length,
      filesCount: filesList.length,
      linesOfCodeEstimate: estimatedLoc,
      dependenciesCount: 0, // calculated later from manifests
      hasTests
    },
    ingestedFiles: successfulFiles
  };
}
