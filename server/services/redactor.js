/**
 * Secret and PII Redaction Engine
 * Strictly ensures no private keys, tokens, passwords, or API keys
 * are passed to the AI model, logged, or returned to the client.
 */

const REDACTION_PATTERNS = [
  // AWS Access Key ID
  { regex: /AKIA[0-9A-Z]{16}/g, replacement: '[REDACTED_AWS_KEY]' },
  
  // AWS Secret Access Key
  { regex: /(aws_secret_access_key|aws_access_key_id)\s*[:=]\s*["']?([A-Za-z0-9/+=]{40})["']?/gi, replacement: '$1: [REDACTED_AWS_SECRET]' },

  // GitHub Personal Access Token / Fine-grained token
  { regex: /ghp_[0-9a-zA-Z]{36}/g, replacement: '[REDACTED_GITHUB_TOKEN]' },
  { regex: /github_pat_[0-9a-zA-Z_]{82}/g, replacement: '[REDACTED_GITHUB_PAT]' },

  // Generic Bearer / API tokens
  { regex: /(bearer\s+)([a-zA-Z0-9_\-\.]{25,})/gi, replacement: '$1[REDACTED_BEARER_TOKEN]' },
  
  // JWT Tokens (3 base64 chunks separated by dots)
  { regex: /eyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g, replacement: '[REDACTED_JWT_TOKEN]' },

  // Database Connection Strings (Postgres, MySQL, Mongo, Redis)
  { regex: /(mongodb(?:\+srv)?|postgres(?:ql)?|mysql|redis):\/\/([^:]+):([^@]+)@/gi, replacement: '$1://$2:[REDACTED_DB_PWD]@' },

  // Private Keys (RSA, EC, OPENSSH)
  { regex: /-----BEGIN\s+([A-Z\s]+)?PRIVATE KEY-----[\s\S]*?-----END\s+([A-Z\s]+)?PRIVATE KEY-----/gi, replacement: '[REDACTED_PRIVATE_KEY]' },

  // Common Key/Password patterns in configs or code
  { regex: /(api[_-]?key|secret[_-]?key|auth[_-]?token|client[_-]?secret|password|passwd|db_password)\s*[:=]\s*["']([^"'\s]{6,})["']/gi, replacement: '$1: "[REDACTED_SECRET]"' },

  // OpenAI / Anthropic / Gemini Key formats
  { regex: /sk-[a-zA-Z0-9]{20,}/g, replacement: '[REDACTED_AI_API_KEY]' },
  { regex: /AIzaSy[0-9A-Za-z_-]{33}/g, replacement: '[REDACTED_GOOGLE_API_KEY]' },
];

/**
 * Sanitizes input code or text string
 */
export function redactSecrets(content) {
  if (typeof content !== 'string') return content;
  
  let sanitized = content;
  for (const { regex, replacement } of REDACTION_PATTERNS) {
    sanitized = sanitized.replace(regex, replacement);
  }
  return sanitized;
}

/**
 * Checks whether a file path points to a sensitive environment or secret file
 */
export function isSensitiveFile(filePath) {
  const normalized = filePath.toLowerCase();
  const sensitiveNames = [
    '.env',
    '.env.local',
    '.env.production',
    '.env.staging',
    'id_rsa',
    'id_ed25519',
    'credentials.json',
    'service-account.json',
    'secrets.yml',
    'secrets.yaml'
  ];

  const basename = normalized.split('/').pop().split('\\').pop();
  return sensitiveNames.some(name => basename === name || (basename.startsWith('.env.') && !basename.endsWith('.example')));
}
