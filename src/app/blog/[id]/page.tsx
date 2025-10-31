'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../../services/api';
import { useAuth } from '../../../hook/useAuth';
import { FiTrash2, FiEdit2, FiArrowLeft } from 'react-icons/fi';

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
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  const isOwner = user && post?.author?.id === user.id;

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
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Редагувати пост</h2>
            <form className="flex flex-col gap-3" onSubmit={saveEdit}>
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
                onChange={(e) => setStatus(e.target.value as Post['status'])}
              >
                <option value="draft">Чернетка</option>
                <option value="published">Опубліковано</option>
              </select>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-md border border-gray-200 hover:bg-gray-50"
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


