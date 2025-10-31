import { Router, Request, Response, NextFunction } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = 'supersecret';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: 'No token' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        (req as any).user = decoded;
        next();
    } catch {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

router.post('/register', async (req: Request, res: Response) => {
    const { username, password } = req.body;
    try {
        const exist = await User.findOne({ where: { username } });
        if (exist) return res.status(400).json({ message: 'Username exists' });

        const totalUsers = await User.count();
        const role = totalUsers === 0 ? 'admin' : 'user';
        await User.create({ username, password, role });
        return res.status(201).json({ message: 'User created', role });
    } catch (e) {
        return res.status(500).json({ message: 'Server error', error: e });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ where: { username } });
        if (!user || !user.checkPassword(password)) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax', // якщо продакшн + HTTPS ставити 'none' і secure: true
            maxAge: 1000 * 60 * 60,
        });

        return res.json({ message: 'Logged in', role: user.role });
    } catch (e) {
        return res.status(500).json({ message: 'Server error', error: e });
    }
});

router.post('/logout', (req: Request, res: Response) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
});

router.get('/me', authMiddleware, async (req: Request, res: Response) => {
    const user = (req as any).user;
    return res.json({ user });
});

// Promote a user to admin (admin-only)
router.post('/promote', authMiddleware, async (req: Request, res: Response) => {
    const requester = (req as any).user;
    if (requester.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { username } = req.body as { username: string };
    if (!username) return res.status(400).json({ message: 'username required' });
    try {
        const target = await User.findOne({ where: { username } });
        if (!target) return res.status(404).json({ message: 'User not found' });
        if (target.role === 'admin') return res.status(200).json({ message: 'Already admin' });
        await target.update({ role: 'admin' });
        return res.json({ message: 'Promoted', username });
    } catch (e) {
        return res.status(500).json({ message: 'Server error', error: e });
    }
});

export default router;
