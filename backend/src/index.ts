import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import postRoutes from './routes/postRoutes'

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000', // фронт
    credentials: true
}));

app.use('/auth', authRoutes);
app.use('/posts', postRoutes)

app.listen(5050, () => console.log('Server running on port: 5050'));
