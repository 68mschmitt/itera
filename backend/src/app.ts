import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler.js';
import healthRoutes from './routes/health.js';

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

// Error handling
app.use(errorHandler);

export default app;
