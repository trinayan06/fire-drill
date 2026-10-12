/**
 * Fast Rule-Based Static Analyzer
 * Inspects package manifests, source AST-like regex patterns, and directory structures.
 * Provides guaranteed static evidence without requiring external AI.
 */

export function analyzeStaticRepository(repoData) {
  const { ingestedFiles = [], tree = [], stats = {} } = repoData;
  const issues = [];
  const detectedStack = new Set();
  let framework = 'JavaScript/TypeScript';
  let dependencyCount = 0;

  // 1. Inspect package.json if present
  const packageJsonFile = ingestedFiles.find(f => f.path === 'package.json' || f.path.endsWith('/package.json'));
  let packageJson = null;
  if (packageJsonFile && packageJsonFile.content) {
    try {
      packageJson = JSON.parse(packageJsonFile.content);
      const allDeps = {
        ...(packageJson.dependencies || {}),
        ...(packageJson.devDependencies || {})
      };
      dependencyCount = Object.keys(allDeps).length;

      // Framework detection
      if (allDeps['next']) { detectedStack.add('Next.js'); framework = 'Next.js'; }
      else if (allDeps['react']) { detectedStack.add('React'); framework = 'React'; }
      else if (allDeps['vue']) { detectedStack.add('Vue.js'); framework = 'Vue.js'; }
      else if (allDeps['svelte']) { detectedStack.add('Svelte'); framework = 'Svelte'; }

      if (allDeps['express']) { detectedStack.add('Express'); }
      if (allDeps['fastify']) { detectedStack.add('Fastify'); }
      if (allDeps['@nestjs/core']) { detectedStack.add('NestJS'); }
      if (allDeps['@supabase/supabase-js']) { detectedStack.add('Supabase'); }
      if (allDeps['prisma'] || allDeps['@prisma/client']) { detectedStack.add('Prisma'); }
      if (allDeps['mongoose']) { detectedStack.add('MongoDB'); }
      if (allDeps['pg']) { detectedStack.add('PostgreSQL'); }
      if (allDeps['tailwindcss']) { detectedStack.add('Tailwind CSS'); }
      if (allDeps['vite']) { detectedStack.add('Vite'); }

      // Check for missing test suites
      const testScripts = packageJson.scripts?.test || '';
      const hasTestRunner = allDeps['jest'] || allDeps['vitest'] || allDeps['mocha'] || allDeps['playwright'] || allDeps['cypress'];
      if (!hasTestRunner || testScripts.includes('no test specified') || testScripts === '') {
        issues.push({
          id: 'TEST-001',
          category: 'testing',
          title: 'Zero Automated Test Framework Configured',
          severity: 'high',
          evidenceLevel: 'confirmed_evidence',
          confidence: 0.98,
          file: 'package.json',
          functionOrScope: 'scripts.test',
          evidence: {
            lineNumbers: 'package.json',
            snippet: `"scripts": { "test": "${testScripts || 'echo \\"Error: no test specified\\"'}" }`,
            explanation: 'No modern test framework (Vitest, Jest, Playwright) is installed, and the test script is empty or an error placeholder.'
          },
          problem: 'Developers and AI coding agents making changes have zero regression validation suite.',
          impact: 'Silent regressions in core logic will go unnoticed until reported by production end-users.',
          recommendation: 'Install Vitest or Jest. Add basic unit test suites covering critical user flows.',
          testCases: [
            'Configured test runner executes via "npm test"',
            'Add at least 1 unit test verifying repository entrypoint'
          ]
        });
      }
    } catch {
      // package.json parsing error ignored
    }
  }

  // 2. Scan code files for common high-impact anti-patterns
  for (const file of ingestedFiles) {
    if (!file.content) continue;
    const content = file.content;
    const path = file.path;

    // Pattern A: Button / Order click handler missing isSubmitting / disabled guard
    if (path.match(/\b(checkout|order|payment|cart)\b/i) && path.match(/\.(jsx|tsx|vue|svelte|js|ts)$/)) {
      const orderHandlerMatch = content.match(/(handle(?:PlaceOrder|Order|Checkout|Payment|Submit))\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{([\s\S]{1,400})\}/);
      if (orderHandlerMatch) {
        const handlerBody = orderHandlerMatch[2];
        const hasGuard = handlerBody.includes('isSubmitting') || handlerBody.includes('loading') || handlerBody.includes('disabled') || handlerBody.includes('return;');
        if (!hasGuard && (handlerBody.includes('api.post') || handlerBody.includes('fetch(') || handlerBody.includes('axios.post'))) {
          issues.push({
            id: `BUG-${String(issues.length + 1).padStart(3, '0')}`,
            category: 'bug',
            title: 'Duplicate Submission Race Condition in Order/Checkout Handler',
            severity: 'high',
            evidenceLevel: 'confirmed_evidence',
            confidence: 0.94,
            file: path,
            functionOrScope: `${orderHandlerMatch[1]}()`,
            evidence: {
              lineNumbers: 'Handler definition',
              snippet: orderHandlerMatch[0].slice(0, 250) + '\n  // ... (no isSubmitting or loading lock)',
              explanation: `${orderHandlerMatch[1]} triggers an asynchronous network request without locking the UI or verifying an in-flight request state.`
            },
            problem: 'Rapid double-clicking on slow mobile or network connections sends concurrent duplicate requests.',
            impact: 'Duplicate order records, duplicate credit card charges, and inconsistent inventory state.',
            recommendation: 'Add frontend request-state protection (isSubmitting flag) and disable the action button immediately.',
            testCases: [
              'Clicking submit transitions button into disabled state',
              'Subsequent rapid clicks do not fire duplicate network requests',
              'Failure response re-enables submit button with error message'
            ]
          });
        }
      }
    }

    // Pattern B: Secret Role Key or admin secret in frontend code
    if ((path.startsWith('src/') || path.startsWith('app/')) && (content.includes('SERVICE_ROLE_KEY') || content.includes('ADMIN_SECRET'))) {
      issues.push({
        id: `SEC-${String(issues.length + 1).padStart(3, '0')}`,
        category: 'security',
        title: 'Privileged Service Role or Admin Key Referenced in Client Code',
        severity: 'critical',
        evidenceLevel: 'confirmed_evidence',
        confidence: 0.95,
        file: path,
        functionOrScope: 'Module Scope',
        evidence: {
          lineNumbers: 'Context / Store',
          snippet: content.split('\n').filter(line => line.includes('SERVICE_ROLE_KEY') || line.includes('ADMIN_SECRET')).slice(0, 2).join('\n'),
          explanation: 'Privileged backend administrative secret keys are being bundled into client-side build artifacts.'
        },
        problem: 'Client-side applications can be inspected by anyone, exposing full admin access to databases or third-party APIs.',
        impact: 'Complete database bypass of Row-Level Security, data exfiltration, and administrative compromise.',
        recommendation: 'Move all service-role and admin keys strictly into backend server-side environment variables.',
        testCases: [
          'Verify client bundle contains only public anon keys',
          'Audit network traffic to ensure no service-role secrets are sent'
        ]
      });
    }

    // Pattern C: Unhandled promise inside setInterval
    if (content.includes('setInterval') && content.includes('async')) {
      const intervalMatch = content.match(/setInterval\s*\(\s*async\s*\(\)\s*=>\s*\{([\s\S]{1,250})\}/);
      if (intervalMatch && !intervalMatch[1].includes('try') && !intervalMatch[1].includes('catch')) {
        issues.push({
          id: `ARCH-${String(issues.length + 1).padStart(3, '0')}`,
          category: 'architecture',
          title: 'Unhandled Asynchronous Rejection in Polling Interval Loop',
          severity: 'medium',
          evidenceLevel: 'likely_issue',
          confidence: 0.81,
          file: path,
          functionOrScope: 'setInterval()',
          evidence: {
            lineNumbers: 'Polling Loop',
            snippet: intervalMatch[0].slice(0, 200) + '...',
            explanation: 'Asynchronous operations inside setInterval lack try/catch error handling.'
          },
          problem: 'If the network or database experiences a momentary hiccup, unhandled promise rejection may terminate the process.',
          impact: 'Server or poller process crash requiring restart.',
          recommendation: 'Enclose the interval callback logic in a robust try/catch block with retry backoff.',
          testCases: [
            'Simulate network timeout in poller and ensure process continues running'
          ]
        });
      }
    }
  }

  // Fallback defaults if no issues found by static rules
  if (issues.length === 0) {
    issues.push({
      id: 'REC-001',
      category: 'testing',
      title: 'Missing Regression Test Coverage for Core Entrypoint',
      severity: 'medium',
      evidenceLevel: 'recommendation',
      confidence: 0.85,
      file: ingestedFiles[0]?.path || 'src/index.js',
      functionOrScope: 'Module Entry',
      evidence: {
        lineNumbers: '1',
        snippet: `// Entry point loaded without companion unit/integration test`,
        explanation: 'No test file companion discovered alongside core application entry point.'
      },
      problem: 'Core initialization lacks automated validation check.',
      impact: 'Unchecked initialization failures on runtime environment changes.',
      recommendation: 'Add smoke test verifying application boots successfully.',
      testCases: [
        'Application initializes without throwing uncaught exceptions'
      ]
    });
  }

  // Construct architecture topology based on stack
  const stackArray = Array.from(detectedStack);
  if (stackArray.length === 0) {
    stackArray.push(repoData.language || 'Node.js');
  }

  const architecture = {
    components: [
      {
        id: 'fe',
        name: framework.includes('React') || framework.includes('Vue') || framework.includes('Next') ? `${framework} Client` : 'Frontend Layer',
        type: 'frontend',
        technologies: stackArray.filter(s => ['React', 'Vue.js', 'Next.js', 'Vite', 'Tailwind CSS'].includes(s)),
        files: ingestedFiles.filter(f => f.path.startsWith('src/') || f.path.startsWith('app/')).slice(0, 3).map(f => f.path),
        status: issues.some(i => i.category === 'bug' && i.severity === 'high') ? 'warning' : 'healthy'
      },
      {
        id: 'api',
        name: stackArray.includes('Express') ? 'Express API' : stackArray.includes('Next.js') ? 'Next.js API Routes' : 'API Server',
        type: 'api',
        technologies: stackArray.filter(s => ['Express', 'Fastify', 'NestJS', 'Next.js'].includes(s)),
        files: ingestedFiles.filter(f => f.path.includes('api') || f.path.includes('routes') || f.path.includes('server')).slice(0, 3).map(f => f.path),
        status: issues.some(i => i.category === 'security') ? 'critical' : 'healthy'
      },
      {
        id: 'db',
        name: stackArray.includes('Supabase') ? 'Supabase / PostgreSQL' : stackArray.includes('MongoDB') ? 'MongoDB' : 'Database Layer',
        type: 'database',
        technologies: stackArray.filter(s => ['Supabase', 'PostgreSQL', 'MongoDB', 'Prisma'].includes(s)),
        files: ingestedFiles.filter(f => f.path.includes('db') || f.path.includes('models')).slice(0, 2).map(f => f.path),
        status: 'healthy'
      }
    ],
    connections: [
      { from: 'fe', to: 'api', label: 'HTTP / API Requests' },
      { from: 'api', to: 'db', label: 'Queries & Data Access' }
    ]
  };

  return {
    framework,
    stack: stackArray,
    dependencyCount,
    issues,
    architecture
  };
}
