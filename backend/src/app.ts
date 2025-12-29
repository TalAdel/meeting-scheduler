import express, { Request, Response } from "express";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import errorHandler from "./middlewares/error-handler";
import { CustomError } from "./lib/custom-error";
import meetingRoutes from "./routes/meetings.routes";
// import cors from "cors";

const app = express();

// app.use(cors({
//     origin: process.env.FRONTEND_URL,
//     credentials: true,
// }));


app.use(express.json());

console.log('=== APP.TS DEBUG ===');
console.log('authRoutes type:', typeof authRoutes);
console.log('authRoutes value:', authRoutes);
console.log('Is authRoutes a function?', typeof authRoutes === 'function');
console.log('====================');

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