import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { connectDatabase } from './config/db.js';
import apiRouter from './routes/index.js';
import { loggerMiddleware } from './middleware/loggerMiddleware.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

const parseCorsOrigin = (originStr) => {
  if (!originStr) return 'http://localhost:5173';
  if (originStr === '*') return '*';
  if (typeof originStr === 'string') return originStr.split(',').map(o => o.trim());
  return originStr;
};

// Middlewares
const corsOptions = {
  origin: parseCorsOrigin(config.corsOrigin),
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight for all routes

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(loggerMiddleware);



// Initialize DB
await connectDatabase();

// API Routes
app.use('/api', apiRouter);

// Global Error Handling Middleware
app.use(errorHandler);

// Start Server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 AttenTrack Backend API Server running on port ${PORT} [${config.nodeEnv}]`);
  console.log(`👉 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
