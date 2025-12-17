import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler.js';
import healthRoutes from './routes/health.js';
import promptRoutes from './routes/prompts.js';
import runRoutes from './routes/runs.js';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', healthRoutes);
app.use('/', promptRoutes);
app.use('/', runRoutes);

// Error handling
app.use(errorHandler);

export default app;
