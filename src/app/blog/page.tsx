'use client';
import { useState, useEffect, useMemo } from 'react';
import api from '../../../services/api';
import { FiTrash2, FiPlus, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../hook/useAuth';
import Link from 'next/link';

export interface PostAuthor {
  id: number;
  username: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  status: 'draft' | 'published';
  author?: PostAuthor;
  createdAt?: string;
}

function formatDate(date?: string) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function BlogPage() {
  const { user, logout, isAdmin } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  const visiblePosts = useMemo(() => {
    if (!user) return posts.filter(p => p.status === 'published');
    return posts.filter(p => p.status === 'published' || p.author?.id === user.id);
  }, [posts, user]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/posts');
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/posts', { title, content, status });
      setTitle('');
      setContent('');
      setStatus('draft');
      setModalOpen(false);
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/posts/${id}`);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Міні Блог</h1>
          <p className="text-gray-500 mt-1">Думки, нотатки та короткі історії.</p>
        </div>
        {user && (
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
              >
                Адмінка
              </Link>
            )}
            <button
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
              onClick={logout}
            >
              <FiLogOut />
              Вийти
            </button>
            <button
              className="hidden sm:inline-flex items-center gap-2 bg-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-md shadow-lg hover:opacity-90 active:opacity-100 transition border border-blue-700"
              onClick={() => setModalOpen(true)}
            >
              <FiPlus />
              Новий пост
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-100 p-4 animate-pulse">
              <div className="h-4 w-28 bg-gray-200 rounded mb-3" />
              <div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-full bg-gray-200 rounded mb-1" />
              <div className="h-4 w-2/3 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : visiblePosts.length === 0 ? (
        <div className="text-center text-gray-500 py-16">Поки що немає постів.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {visiblePosts.map(post => {
            const isOwner = user && post.author?.id === user.id;
            const badgeStyles = post.status === 'published'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
              : 'bg-amber-50 text-amber-700 border-amber-100';

            return (
              <article
                key={post.id}
                className="group relative rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition bg-white"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs px-2 py-1 rounded-full border ${badgeStyles}`}>
                    {post.status === 'published' ? 'Опубліковано' : 'Чернетка'}
                  </span>
                  <span className="text-xs text-gray-400">{formatDate(post.createdAt)}</span>
                </div>
                <Link href={`/blog/${post.id}`} className="block focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md">
                  <h2 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:underline">{post.title}</h2>
                  <p className="text-gray-600 text-sm leading-6 line-clamp-3">{post.content}</p>
                </Link>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                      {post.author?.username?.slice(0, 2)?.toUpperCase() || 'AN'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {post.author?.username || 'Анонім'}
                    </div>
                  </div>
                  {isOwner && (
                    <button
                      className="text-red-500 hover:text-red-600 inline-flex items-center gap-1 text-sm p-2 -mr-2"
                      onClick={() => handleDelete(post.id)}
                      title="Видалити"
                    >
                      <FiTrash2 />
                      Видалити
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {user && (
        <>
          <button
            aria-label="Створити пост"
            className="sm:hidden fixed bottom-5 right-5 inline-flex items-center justify-center h-12 w-12 rounded-full shadow-xl text-white bg-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-700 active:scale-95 transition"
            onClick={() => setModalOpen(true)}
          >
            <FiPlus />
          </button>
          {isAdmin && (
            <Link
              href="/admin"
              aria-label="Адмінка"
              className="sm:hidden fixed bottom-5 right-20 inline-flex items-center justify-center h-12 px-4 rounded-full shadow-xl text-gray-700 bg-white border border-gray-200 active:scale-95 transition"
            >
              Адмінка
            </Link>
          )}
          <button
            aria-label="Вийти"
            className="sm:hidden fixed bottom-5 left-5 inline-flex items-center justify-center h-12 w-12 rounded-full shadow-xl text-gray-700 bg-white border border-gray-200 active:scale-95 transition"
            onClick={logout}
          >
            <FiLogOut />
          </button>
        </>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Створити пост</h2>
            <form className="flex flex-col gap-3" onSubmit={handleCreatePost}>
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
                className="border border-gray-200 p-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[120px]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
              <select
                className="border border-gray-200 p-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={status}
                onChange={(e) => setStatus(e.target.value as Post['status'])}
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
                  Створити
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
