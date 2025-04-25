// src/server.ts
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config';
import apiRouter from './routes'; // We'll create this next
import { errorMiddleware } from './middleware/error.middleware';
// Import pool to ensure connection is attempted at startup
import { db as pool } from './db';

const app: Express = express();
const port = config.port;

// Middleware
app.use(cors({
  origin: config.clientUrl, // Allow requests from frontend
  credentials: true, // If you need cookies/authorization headers
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.send('Dashboard Backend is Running!');
});

// API Routes
app.use('/api', apiRouter);

// Error Handling Middleware (Should be last)
app.use(errorMiddleware);

// Start Server
app.listen(port, () => {
  console.log(`⚡️[server]: Backend server is running at http://localhost:${port}`);
  // Log pool status after server starts (optional)
  // console.log(` Slonik Pool status: `, pool.getPoolState());
});

// Graceful shutdown (optional but good practice)
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server and DB pool')
    // await server.close() // if you store the server instance
    await pool?.end()
    console.log('Resources closed.')
    process.exit(0)
})

process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing HTTP server and DB pool')
    // await server.close()
    await pool?.end()
    console.log('Resources closed.')
    process.exit(0)
})