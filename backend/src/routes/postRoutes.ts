import { Router, type Request, type Response, type NextFunction } from 'express';
import Post from '../models/Post';
import authMiddleware from './authRoutes';

const router = Router();

router.post("/", authMiddleware, async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { title, content, status, userId } = req.body;
    try {
        const post = await Post.create({ title, content, status, userId: user.id });
        res.status(201).json(post);
    } catch (e) {
        res.status(500).json({ message: 'Error creating post', error: e });
    }
});

router.get('/', async (req: Request, res: Response) => {
    try {
        const posts = await Post.findAll({ include: ['author'] });
        res.json(posts)
    } catch (e) {
        res.status(500).json({ message: 'Error fetching posts', error: e });

    }
});

router.get("/:id", async (req: Request, res: Response) => {
    try {
        const post = await Post.findByPk(req.params.id, { include: ['author'] });
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.json(post);
    } catch (e) {
        res.status(500).json({ message: 'Error fetching post', error: e });
    }
});

router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
    const { title, content, status } = req.body;
    const user = (req as any).user;
    try {
        const post = await Post.findByPk(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.userId !== user.id) return res.status(403).json({ message: 'Not authorized' });

        await post.update({ title, content, status });
        res.json(post)
    } catch (e) {
        res.status(500).json({ message: 'Error updating post', error: e });
    }
});

router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
    const user = (req as any).user;
    try {
        const post = await Post.findByPk(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.userId !== user.id) return res.status(403).json({ message: 'Not authorized' });

        await post.destroy();
        res.json({ message: 'Post deleted' })
    } catch (e) {
        res.status(500).json({ message: 'Error deleting post', error: e });
    }
});