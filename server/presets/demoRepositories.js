/**
 * Curated High-Fidelity Demo Repositories & Fallbacks
 * Ensures the 2-3 minute hackathon demonstration works 100% reliably
 * even with offline network, GitHub rate limits, or missing API keys.
 */

export const DEMO_PRESETS = {
  'quickbite-food-app': {
    id: 'quickbite-food-app',
    url: 'https://github.com/acme-corp/quickbite-app',
    owner: 'acme-corp',
    name: 'quickbite-app',
    description: 'On-demand food delivery ordering platform built with React & Express',
    defaultBranch: 'main',
    isPrivate: false,
    stars: 142,
    language: 'JavaScript',
    framework: 'React (Vite)',
    stack: ['React', 'Node.js', 'Express', 'Supabase', 'Tailwind CSS', 'Vite'],
    stats: {
      foldersCount: 24,
      filesCount: 183,
      linesOfCodeEstimate: 12400,
      dependenciesCount: 18,
      hasTests: false,
      contributorsCount: 3
    },
    architecture: {
      components: [
        { id: 'fe', name: 'React Client (Vite)', type: 'frontend', technologies: ['React 18', 'Tailwind', 'Context API'], files: ['src/App.jsx', 'src/pages/Checkout.jsx'], status: 'warning' },
        { id: 'api', name: 'Express API Server', type: 'api', technologies: ['Express 4', 'Node.js'], files: ['server.js', 'src/api/orders.js'], status: 'warning' },
        { id: 'auth', name: 'Supabase Auth', type: 'auth', technologies: ['Supabase Client SDK'], files: ['src/context/AuthContext.jsx'], status: 'critical' },
        { id: 'db', name: 'PostgreSQL Database', type: 'database', technologies: ['Supabase / Postgres'], files: ['src/services/orderPoller.js'], status: 'healthy' }
      ],
      connections: [
        { from: 'fe', to: 'api', label: 'REST /orders' },
        { from: 'fe', to: 'auth', label: 'OAuth & Session' },
        { from: 'api', to: 'db', label: 'SQL queries' }
      ]
    },
    healthScore: 63,
    summary: {
      criticalCount: 2,
      highCount: 2,
      mediumCount: 2,
      suggestionsCount: 3,
      securityCount: 2,
      missingTestsCount: 1
    },
    issues: [
      {
        id: 'BUG-001',
        category: 'bug',
        title: 'Duplicate Order Submission Race Condition',
        severity: 'high',
        evidenceLevel: 'confirmed_evidence',
        confidence: 0.94,
        file: 'src/pages/Checkout.jsx',
        functionOrScope: 'handlePlaceOrder()',
        evidence: {
          lineNumbers: '42-58',
          snippet: `const handlePlaceOrder = async () => {\n  // BUG: No isSubmitting / disabled state check\n  const response = await api.post('/api/orders', { cart, deliveryAddress });\n  if (response.status === 201) {\n    navigate('/order-confirmed');\n  }\n};`,
          explanation: 'The order request button can be clicked multiple times consecutively before the first network promise settles. No request-lock or UI disable guard is active.'
        },
        problem: 'Users clicking the "Place Order" button rapidly on slow networks generate duplicate order entries and multiple credit card authorization attempts.',
        impact: 'Duplicate orders placed in the database, double customer billing, and inventory allocation mismatches.',
        recommendation: 'Add frontend request-state lock (isSubmitting flag) and disable the button immediately on trigger. Also recommend backend idempotency-key handling.',
        testCases: [
          'Successful single-click order placement transitions to confirmation screen',
          'Double-click rapid trigger sends exactly one HTTP request and disables the submit button',
          'Network failure re-enables the button and displays clear retry feedback',
          'API 500 error gracefully preserves cart state without submitting duplicates'
        ]
      },
      {
        id: 'SEC-002',
        category: 'security',
        title: 'Supabase Service Role Secret Key Leakage in Client Context',
        severity: 'critical',
        evidenceLevel: 'confirmed_evidence',
        confidence: 0.96,
        file: 'src/context/AuthContext.jsx',
        functionOrScope: 'initSupabase()',
        evidence: {
          lineNumbers: '14-22',
          snippet: `// Client-side initialization using service role key instead of anon key\nconst supabaseKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbG...';\nexport const supabase = createClient(supabaseUrl, supabaseKey);`,
          explanation: 'The application uses the admin Service Role key on the client side, bypassing Row-Level Security (RLS) policies completely.'
        },
        problem: 'Anyone inspecting client network bundles can extract the service role key and read or wipe all database tables directly.',
        impact: 'Full database compromise, unauthenticated data exfiltration, and privilege escalation.',
        recommendation: 'Replace VITE_SUPABASE_SERVICE_ROLE_KEY on the client with the public anon key. Restrict the service role key strictly to backend server code.',
        testCases: [
          'Client bundle contains only VITE_SUPABASE_ANON_KEY',
          'Unauthorized client requests cannot bypass RLS policy rules',
          'Admin actions route through authenticated backend API endpoints'
        ]
      },
      {
        id: 'TEST-003',
        category: 'testing',
        title: 'Zero Integration Tests for Payment & Order Processing',
        severity: 'high',
        evidenceLevel: 'confirmed_evidence',
        confidence: 0.98,
        file: 'tests/',
        functionOrScope: 'Repository Test Suite',
        evidence: {
          lineNumbers: 'N/A',
          snippet: `// No test directory or test configuration found in repository\n// "scripts": { "test": "echo \\"Error: no test specified\\" && exit 1" }`,
          explanation: 'package.json test script is an unconfigured placeholder. Zero unit or end-to-end tests exist for mission-critical order placement logic.'
        },
        problem: 'AI coding agents or human contributors modifying checkout logic have zero regression safety net.',
        impact: 'Undetected breakages in payment workflows reaching production.',
        recommendation: 'Install Vitest + React Testing Library. Add integration test suites for Checkout.jsx and orders API handler.',
        testCases: [
          'Run npm test passes and executes checkout flow assertions',
          'Simulated payment rejection displays user-friendly error'
        ]
      },
      {
        id: 'PERF-004',
        category: 'performance',
        title: 'Missing Debounce on Menu Search with Unbounded Queries',
        severity: 'medium',
        evidenceLevel: 'likely_issue',
        confidence: 0.82,
        file: 'src/components/MenuSearch.jsx',
        functionOrScope: 'onSearchChange()',
        evidence: {
          lineNumbers: '28-35',
          snippet: `const onSearchChange = (e) => {\n  setQuery(e.target.value);\n  // Direct API call on every keystroke with no debounce\n  api.get(\`/api/menu/search?q=\${e.target.value}\`).then(res => setResults(res.data));\n};`,
          explanation: 'Fires an unthrottled HTTP request to the backend for every single character typed.'
        },
        problem: 'Rapid typing floods the backend server and Supabase database with unneeded queries, causing race condition response overwrites.',
        impact: 'High database latency, rate-limiting triggers, and jittery UI search rendering.',
        recommendation: 'Wrap search input handler in a 300ms debounce hook (e.g. useDebounce) and cancel prior in-flight requests.',
        testCases: [
          'Fast typing triggers only one network request after 300ms inactivity',
          'Stale response from earlier keystroke does not overwrite newer search results'
        ]
      },
      {
        id: 'ARCH-005',
        category: 'architecture',
        title: 'Unhandled Database Disconnect in Order Status Poller',
        severity: 'medium',
        evidenceLevel: 'likely_issue',
        confidence: 0.79,
        file: 'src/services/orderPoller.js',
        functionOrScope: 'startPolling()',
        evidence: {
          lineNumbers: '61-72',
          snippet: `setInterval(async () => {\n  const pending = await db.query('SELECT * FROM orders WHERE status = $1', ['pending']);\n  // Missing try/catch around polling loop\n  processOrders(pending);\n}, 5000);`,
          explanation: 'Unhandled promise rejection inside a setInterval timer will crash Node.js process if database connection drops momentarily.'
        },
        problem: 'Transient database network blip causes unhandled exception terminating the backend service.',
        impact: 'Service crash requiring external container restart.',
        recommendation: 'Enclose polling iteration in try/catch block with exponential backoff on consecutive connection errors.',
        testCases: [
          'Simulated database timeout logs warning and retries gracefully without process crash'
        ]
      },
      {
        id: 'RELIAB-006',
        category: 'reliability',
        title: 'Missing Idempotency-Key Header on Order Creation API',
        severity: 'medium',
        evidenceLevel: 'potential_risk',
        confidence: 0.74,
        file: 'src/api/orders.js',
        functionOrScope: 'router.post("/")',
        evidence: {
          lineNumbers: '18-29',
          snippet: `router.post('/', async (req, res) => {\n  const { cart, deliveryAddress } = req.body;\n  // No Idempotency-Key validation or deduplication check\n  const order = await createOrderRecord(req.user.id, cart, deliveryAddress);\n  res.status(201).json(order);\n});`,
          explanation: 'Backend endpoint creates a new database order row unconditionally without checking for an idempotency token.'
        },
        problem: 'If network drops after order creation but before HTTP response reaches the client, client retry creates a second identical order.',
        impact: 'Duplicate order fulfillment even if frontend button is disabled.',
        recommendation: 'Accept and store Idempotency-Key in Redis/Postgres with 5-minute TTL to return existing order on duplicate requests.',
        testCases: [
          'Duplicate POST request with same Idempotency-Key returns cached 201 response'
        ]
      },
      {
        id: 'DEP-007',
        category: 'dependency',
        title: 'Outdated JWT Validation Library with Known Verification Bypass',
        severity: 'low',
        evidenceLevel: 'recommendation',
        confidence: 0.88,
        file: 'package.json',
        functionOrScope: 'dependencies',
        evidence: {
          lineNumbers: '22',
          snippet: `"jsonwebtoken": "^8.5.1"`,
          explanation: 'jsonwebtoken v8.5.1 has known CVE advisory regarding algorithm confusion in certain verification edge cases.'
        },
        problem: 'Older JWT package versions contain subtle signature verification flaws.',
        impact: 'Potential token forgery under specific configuration mistakes.',
        recommendation: 'Upgrade jsonwebtoken to ^9.0.2 or migrate to jose.',
        testCases: [
          'Verify JWT token parsing still succeeds after package upgrade'
        ]
      }
    ],
    // The Re-Scan Delta Result after fixes are applied by Antigravity / Cursor
    rescanState: {
      healthScore: 88,
      scoreDelta: 25,
      resolvedIssues: [
        { id: 'BUG-001', title: 'Duplicate Order Submission Race Condition', category: 'bug' },
        { id: 'SEC-002', title: 'Supabase Service Role Secret Key Leakage in Client Context', category: 'security' },
        { id: 'TEST-003', title: 'Zero Integration Tests for Payment & Order Processing', category: 'testing' },
        { id: 'PERF-004', title: 'Missing Debounce on Menu Search with Unbounded Queries', category: 'performance' },
        { id: 'ARCH-005', title: 'Unhandled Database Disconnect in Order Status Poller', category: 'architecture' },
        { id: 'RELIAB-006', title: 'Missing Idempotency-Key Header on Order Creation API', category: 'reliability' },
        { id: 'DEP-007', title: 'Outdated JWT Validation Library with Known Verification Bypass', category: 'dependency' }
      ],
      remainingIssues: [
        { id: 'ARCH-008', title: 'Consider Adding Response Compression Middleware', severity: 'low', evidenceLevel: 'recommendation' },
        { id: 'PERF-009', title: 'Consider Static Image Optimization via Cloudflare/CDN', severity: 'low', evidenceLevel: 'recommendation' }
      ],
      newIssues: [
        { id: 'PERF-010', title: 'Client Request Cache Invalidation TTL (5m) May Delay Real-time Price Updates', severity: 'low', evidenceLevel: 'potential_risk' }
      ],
      summary: '7 issues verified resolved! Added request-lock guard, removed service role key from client, introduced Vitest suite with 100% checkout coverage.'
    }
  },

  'cloudvault-auth-service': {
    id: 'cloudvault-auth-service',
    url: 'https://github.com/cloudvault-security/auth-engine',
    owner: 'cloudvault-security',
    name: 'auth-engine',
    description: 'Enterprise OAuth2 and multi-tenant authentication microservice in Node.js',
    defaultBranch: 'main',
    isPrivate: false,
    stars: 389,
    language: 'TypeScript',
    framework: 'Node.js (Express / TypeScript)',
    stack: ['TypeScript', 'Express', 'Redis', 'PostgreSQL', 'Docker'],
    stats: {
      foldersCount: 18,
      filesCount: 94,
      linesOfCodeEstimate: 8900,
      dependenciesCount: 22,
      hasTests: true,
      contributorsCount: 5
    },
    architecture: {
      components: [
        { id: 'auth-gw', name: 'Auth Gateway', type: 'api', technologies: ['TypeScript', 'Express'], files: ['src/server.ts', 'src/routes/auth.ts'], status: 'warning' },
        { id: 'redis-cache', name: 'Session Token Cache', type: 'queue', technologies: ['Redis 7'], files: ['src/lib/redis.ts'], status: 'healthy' },
        { id: 'pg-users', name: 'User Store', type: 'database', technologies: ['PostgreSQL'], files: ['src/db/users.ts'], status: 'healthy' }
      ],
      connections: [
        { from: 'auth-gw', to: 'redis-cache', label: 'Revocation list' },
        { from: 'auth-gw', to: 'pg-users', label: 'Bcrypt credentials' }
      ]
    },
    healthScore: 71,
    summary: {
      criticalCount: 1,
      highCount: 2,
      mediumCount: 3,
      suggestionsCount: 2,
      securityCount: 3,
      missingTestsCount: 1
    },
    issues: [
      {
        id: 'SEC-101',
        category: 'security',
        title: 'Timing Attack Vulnerability in Password Hash Comparison',
        severity: 'critical',
        evidenceLevel: 'confirmed_evidence',
        confidence: 0.95,
        file: 'src/services/authService.ts',
        functionOrScope: 'verifyToken()',
        evidence: {
          lineNumbers: '88-94',
          snippet: `if (submittedToken === user.storedTokenHash) {\n  // Using standard string equality instead of crypto.timingSafeEqual\n  return grantSession(user);\n}`,
          explanation: 'Direct string equality comparison terminates early on first mismatched byte, leaking token byte length and structure via timing variance.'
        },
        problem: 'Attackers can exploit string comparison latency differences to brute force valid authentication tokens.',
        impact: 'Session hijacking and unauthorized token forging.',
        recommendation: 'Use crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b)) for all cryptographic token verifications.',
        testCases: [
          'Verify tokens with identical length but mismatched bytes evaluate in constant time',
          'Valid token grants session while invalid token rejects with 401'
        ]
      },
      {
        id: 'BUG-102',
        category: 'bug',
        title: 'Unbounded Refresh Token Array Growth on Active User Sessions',
        severity: 'high',
        evidenceLevel: 'likely_issue',
        confidence: 0.89,
        file: 'src/models/userSession.ts',
        functionOrScope: 'appendRefreshToken()',
        evidence: {
          lineNumbers: '45-52',
          snippet: `user.refreshTokens.push(newToken);\n// No maximum limit or eviction of expired tokens\nawait user.save();`,
          explanation: 'Every refresh token issuance appends to an array without pruning expired tokens or enforcing a per-user session cap.'
        },
        problem: 'Long-lived active users accumulate thousands of stale tokens, causing document size bloat and slow serialization.',
        impact: 'Database document size limits exceeded and degrading login performance.',
        recommendation: 'Enforce a maximum limit of 5 concurrent sessions per user and automatically purge expired tokens before pushing new ones.',
        testCases: [
          'Issuing 6th session token evicts the oldest session',
          'Expired tokens are filtered during session renewal'
        ]
      }
    ],
    rescanState: {
      healthScore: 92,
      scoreDelta: 21,
      resolvedIssues: [
        { id: 'SEC-101', title: 'Timing Attack Vulnerability in Password Hash Comparison', category: 'security' },
        { id: 'BUG-102', title: 'Unbounded Refresh Token Array Growth on Active User Sessions', category: 'bug' }
      ],
      remainingIssues: [
        { id: 'REC-103', title: 'Add Prometheus metrics exporter endpoint', severity: 'low', evidenceLevel: 'recommendation' }
      ],
      newIssues: [],
      summary: 'Timing safe equality implemented across all auth endpoints. Session cap enforced at 5 active tokens.'
    }
  }
};
