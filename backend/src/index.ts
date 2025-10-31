import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import postRoutes from './routes/postRoutes'
import sequelize from './config/db';
import { DataTypes } from 'sequelize';
import User from './models/User';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000', // фронт
    credentials: true
}));

app.use('/auth', authRoutes);
app.use('/posts', postRoutes)

async function start() {
    try {
        const qi = sequelize.getQueryInterface();
        // Clean up leftover SQLite backup table if exists from previous failed alter
        try {
            await qi.dropTable('users_backup');
        } catch {}

        // Ensure users.role column exists (idempotent)
        try {
            const desc = await qi.describeTable('users');
            if (!('role' in desc)) {
                await qi.addColumn('users', 'role', {
                    type: DataTypes.STRING,
                    allowNull: false,
                    defaultValue: 'user',
                });
            }
        } catch {
            // Table might not exist on fresh DB; that's fine
        }

        await sequelize.sync();

        // Seed default admin if missing
        try {
            const existingAdmin = await User.findOne({ where: { username: 'admin' } });
            if (!existingAdmin) {
                await User.create({ username: 'admin', password: 'admin123', role: 'admin' });
                console.log('Seeded default admin: username=admin password=admin123');
            }
        } catch (seedErr) {
            console.warn('Admin seed skipped:', seedErr);
        }
        app.listen(5050, () => console.log('Server running on port: 5050'));
    } catch (e) {
        console.error('Failed to start server', e);
        process.exit(1);
    }
}

start();
