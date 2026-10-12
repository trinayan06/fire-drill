import express from 'express';
import cors from 'cors';
import { config, validateEnvironment } from './config.js';
import scanRoutes from './routes/scanRoutes.js';

const app = express();

// Allowed Origins for Production and Development
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL
].filter(Boolean);

// CORS Policy: permits localhost, explicit frontend URLs, and Netlify deployments
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests with no origin (curl, server-to-server, health checkers)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.netlify.app') ||
      /^https:\/\/.*\.netlify\.app$/.test(origin)
    ) {
      return callback(null, true);
    }
    // Fallback permissive for deployment previews
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '2mb' }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${req.method} ${req.url}`);
  next();
});

// Root route for cloud deployment verification
app.get('/', (req, res) => {
  res.json({
    service: 'Fire Drill Reliability API',
    status: 'online',
    version: '1.0.0',
    documentation: '/api/health'
  });
});

// API Routes
app.use('/api', scanRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Fire Drill Server',
    version: '1.0.0',
    geminiConfigured: !!config.geminiApiKey,
    githubTokenConfigured: !!config.githubToken
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]:', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Bind to 0.0.0.0 for cloud container hosting (Render, Railway, etc.)
const host = '0.0.0.0';
app.listen(config.port, host, () => {
  console.log(`🔥 FIRE DRILL API Server running at http://${host}:${config.port}`);
  validateEnvironment();
});
