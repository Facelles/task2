'use client';
import { useEffect, useMemo, useState } from 'react';
import api from '../../../services/api';
import { useAuth } from '../../hook/useAuth';
import { useRouter } from 'next/navigation';
import { FiPlus, FiEdit2, FiTrash2, FiFilter } from 'react-icons/fi';

interface Post {
  id: number;
  title: string;
  content: string;
  status: 'draft' | 'published';
  author?: { id: number; username: string };
  createdAt?: string;
}

export default function AdminPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/auth/login');
      return;
    }
    if (!isAdmin) {
      router.replace('/blog');
    }
  }, [authLoading, user, isAdmin, router]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/posts');
      setPosts(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) fetchPosts();
  }, [user, isAdmin]);

  const filtered = useMemo(() => {
    return posts
      .filter(p => (statusFilter === 'all' ? true : p.status === statusFilter))
      .filter(p => p.title.toLowerCase().includes(query.toLowerCase()));
  }, [posts, query, statusFilter]);

  const openCreate = () => {
    setEditId(null);
    setTitle('');
    setContent('');
    setStatus('draft');
    setModalOpen(true);
  };

  const openEdit = (post: Post) => {
    setEditId(post.id);
    setTitle(post.title);
    setContent(post.content);
    setStatus(post.status);
    setModalOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      await api.put(`/posts/${editId}`, { title, content, status });
    } else {
      await api.post('/posts', { title, content, status });
    }
    setModalOpen(false);
    fetchPosts();
  };

  const remove = async (id: number) => {
    await api.delete(`/posts/${id}`);
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Адмін</h1>
          <p className="text-gray-500 mt-1">Керування постами: додати, редагувати, видалити.</p>
        </div>
        {user && (
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-md shadow-lg hover:opacity-90 border border-blue-700"
          >
            <FiPlus /> Новий пост
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-6">
        <div className="flex-1">
          <input
            placeholder="Пошук за заголовком..."
            className="w-full border border-gray-200 p-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-500" />
          <select
            className="border border-gray-200 p-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'draft' | 'published')}
          >
            <option value="all">Всі</option>
            <option value="published">Опубліковано</option>
            <option value="draft">Чернетки</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-100 p-4 animate-pulse">
              <div className="h-4 w-28 bg-gray-200 rounded mb-3" />
              <div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-full bg-gray-200 rounded mb-1" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-500 py-16">Нічого не знайдено.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map(p => (
            <div key={p.id} className="rounded-2xl border border-gray-100 p-5 shadow-sm bg-white">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs px-2 py-1 rounded-full border ${p.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                  {p.status === 'published' ? 'Опубліковано' : 'Чернетка'}
                </span>
                <span className="text-xs text-gray-400">{new Date(p.createdAt || '').toLocaleDateString()}</span>
              </div>
              <h3 className="font-semibold text-lg mb-1 line-clamp-1">{p.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{p.content}</p>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">{p.author?.username || 'Анонім'}</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(p)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50"
                  >
                    <FiEdit2 /> Редагувати
                  </button>
                  <button
                    onClick={() => remove(p.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-red-600 border border-red-100 hover:bg-red-50"
                  >
                    <FiTrash2 /> Видалити
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editId ? 'Редагувати пост' : 'Новий пост'}</h2>
            <form className="flex flex-col gap-3" onSubmit={submit}>
              <input
                type="text"
                placeholder="Заголовок"
                className="border border-gray-200 p-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                placeholder="Текст"
                className="border border-gray-200 p-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[160px]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
              <select
                className="border border-gray-200 p-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
              >
                <option value="draft">Чернетка</option>
                <option value="published">Опубліковано</option>
              </select>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-md border border-gray-200 hover:bg-gray-50"
                  onClick={() => setModalOpen(false)}
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90"
                >
                  {editId ? 'Зберегти' : 'Створити'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


