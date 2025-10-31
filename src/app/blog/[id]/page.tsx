'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../../services/api';
import { useAuth } from '../../../hook/useAuth';
import { FiTrash2, FiEdit2, FiArrowLeft, FiX } from 'react-icons/fi';

interface PostAuthor {
  id: number;
  username: string;
}

interface Post {
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

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  const isOwner = !!user && (isAdmin || post?.author?.id === user.id);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/posts/${id}`);
        setPost(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const openEdit = () => {
    if (!post) return;
    setTitle(post.title);
    setContent(post.content);
    setStatus(post.status);
    setEditOpen(true);
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;
    await api.put(`/posts/${post.id}`, { title, content, status });
    const res = await api.get(`/posts/${post.id}`);
    setPost(res.data);
    setEditOpen(false);
  };

  const handleDelete = async () => {
    if (!post) return;
    await api.delete(`/posts/${post.id}`);
    router.replace('/blog');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-10"
      >
        <FiArrowLeft /> Назад
      </button>

      {loading ? (
        <div className="space-y-3">
          <div className="h-7 w-2/3 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
          <div className="h-40 w-full bg-gray-200 rounded animate-pulse" />
        </div>
      ) : !post ? (
        <div className="text-gray-500">Пост не знайдено.</div>
      ) : (
        <article>
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold">{post.title}</h1>
            {isOwner && (
              <div className="flex items-center gap-2">
                <button
                  onClick={openEdit}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50"
                >
                  <FiEdit2 /> Редагувати
                </button>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-red-600 border border-red-100 hover:bg-red-50"
                >
                  <FiTrash2 /> Видалити
                </button>
              </div>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-500">
            <span>{post.author?.username || 'Анонім'}</span> • <span>{formatDate(post.createdAt)}</span> •
            <span className={`ml-1 px-2 py-0.5 rounded-full border text-xs ${post.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
              {post.status === 'published' ? 'Опубліковано' : 'Чернетка'}
            </span>
          </div>
          <div className="prose prose-sm md:prose-base max-w-none mt-6 text-gray-800 whitespace-pre-wrap">
            {post.content}
          </div>
        </article>
      )}

      {editOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">Редагувати пост</h2>
              <button
                onClick={() => setEditOpen(false)}
                className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-gray-50"
                aria-label="Закрити"
              >
                <FiX />
              </button>
            </div>
            <form onSubmit={saveEdit}>
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
                  onClick={() => setEditOpen(false)}
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90"
                >
                  Зберегти
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


