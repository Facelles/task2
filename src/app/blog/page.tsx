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
    if (isAdmin) return posts;
    if (!user) return posts.filter(p => p.status === 'published');
    return posts.filter(p => p.status === 'published' || p.author?.id === user.id);
  }, [posts, user, isAdmin]);

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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">Створити пост</h2>
              <button
                aria-label="Закрити"
                className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-gray-50"
                onClick={() => setModalOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreatePost}>
              <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Заголовок</label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 p-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm text-gray-600 mb-1">Статус</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className={`flex-1 px-3 py-2 rounded-md border text-sm ${status === 'draft' ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-gray-200 hover:bg-gray-50'}`}
                      onClick={() => setStatus('draft')}
                    >
                      Чернетка
                    </button>
                    <button
                      type="button"
                      className={`flex-1 px-3 py-2 rounded-md border text-sm ${status === 'published' ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-gray-200 hover:bg-gray-50'}`}
                      onClick={() => setStatus('published')}
                    >
                      Опубліковано
                    </button>
                  </div>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm text-gray-600 mb-1">Текст</label>
                  <textarea
                    className="w-full border border-gray-200 p-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[200px]"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2 bg-gray-50">
                <button
                  type="button"
                  className="px-4 py-2 rounded-md border border-gray-200 hover:bg-white"
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
