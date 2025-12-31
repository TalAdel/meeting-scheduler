import express, { Request, Response } from "express";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import errorHandler from "./middlewares/error-handler";
import { CustomError } from "./lib/custom-error";
import meetingRoutes from "./routes/meetings.routes";
import cors from "cors";

const app = express();

/**
 * CORS Configuration - Supports Multiple Origins
 * 
 * WHY? We want to support:
 * 1. Local development (http://localhost:5173)
 * 2. Production/Cloud (http://167.99.250.33:5173 or your domain)
 * 
 * The Logic:
 * - If FRONTEND_URL is a comma-separated list, split it into array
 * - Allow requests from ANY of these origins
 * - Fallback to localhost for local development
 */
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173'];

console.log('Allowed CORS origins:', allowedOrigins);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked request from: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));


app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
    res.status(200).send('OK');
});

app.get('/api/v1/test', (_req: Request, res: Response) => {
    console.log('TEST ROUTE HIT!'); // Add this
    res.json({ message: 'Test route works!' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/meetings', meetingRoutes);

app.use((req: Request, _res: Response) => {
    console.log('404 Handler hit:', req.method, req.originalUrl); // Add this
    throw new CustomError(404, `Route ${req.originalUrl} not found`);
});

app.use(errorHandler);

export default app;