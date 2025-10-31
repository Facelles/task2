import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import sequelize from './config/db';
import authRoutes from './routes/authRoutes'; 


const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoutes);

const PORT = 5050;

sequelize.sync({ force: false }).then(() => {
    console.log('DB connected');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
