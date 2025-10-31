'use client';
import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { FiEdit, FiTrash2 } from 'react-icons/fi';

export interface Post {
  id: number;
  title: string;
  content: string;
  status: 'draft' | 'published';
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

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

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Blog</h1>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => setModalOpen(true)}
        >
          + New Post
        </button>
      </div>

      {loading ? (
        <p>Loading posts...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {posts.map(post => (
            <div key={post.id} className="border p-4 rounded shadow flex flex-col justify-between">
              <div>
                <h2 className="font-bold text-lg mb-2">{post.title}</h2>
                <p className="text-gray-700 mb-2">{post.content}</p>
                <span className={`px-2 py-1 rounded text-sm ${post.status === 'draft' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>
                  {post.status}
                </span>
              </div>
              <div className="flex gap-2 mt-3 justify-end">
                <button className="text-yellow-600 hover:text-yellow-800">
                  <FiEdit size={20} />
                </button>
                <button className="text-red-600 hover:text-red-800">
                  <FiTrash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">New Post</h2>
            <form className="flex flex-col gap-2" onSubmit={handleCreatePost}>
              <input
                type="text"
                placeholder="Title"
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                placeholder="Content"
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
              <select
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={status}
                onChange={(e) => setStatus(e.target.value as Post['status'])}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded border hover:bg-gray-100"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
