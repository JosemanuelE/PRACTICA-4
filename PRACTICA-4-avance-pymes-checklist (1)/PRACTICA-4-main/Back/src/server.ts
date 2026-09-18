import express from 'express'; //ESM Ecmascript Modules
import cors from 'cors';
import path from 'path';
import 'dotenv/config';
import router from './router';
import connectDB from './config/db';

const app = express();
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());
app.use(
    '/uploads',
    express.static(path.join(process.cwd(), 'uploads'))
);
connectDB();
app.use('/',router);

export default app;