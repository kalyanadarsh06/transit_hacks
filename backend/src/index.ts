import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';

// Routes
import transitRoutes from './routes/transit';
import safetyRoutes from './routes/safety';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to SafeTransit API',
    endpoints: {
      transit: '/api/transit',
      safety: '/api/safety',
      health: '/api/health'
    }
  });
});

// Routes
app.use('/api/transit', transitRoutes);
app.use('/api/safety', safetyRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'SafeTransit API is running' });
});

// Start server
app.listen(port, () => {
  console.log(`⚡️ Server is running at http://localhost:${port}`);
  console.log('SafeTransit API is ready to serve requests');
});

export default app;
