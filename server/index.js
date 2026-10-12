import express from 'express';
import cors from 'cors';
import { config, validateEnvironment } from './config.js';
import scanRoutes from './routes/scanRoutes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${req.method} ${req.url}`);
  next();
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
  console.error('[Unhandled Error]:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(config.port, () => {
  console.log(`🔥 FIRE DRILL API Server running at http://localhost:${config.port}`);
  validateEnvironment();
});

