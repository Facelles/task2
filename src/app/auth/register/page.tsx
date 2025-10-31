'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../hook/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const { user, register } = useAuth();
  const router = useRouter();

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) router.replace('/tasks');
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const username = usernameRef.current?.value || '';
    const password = passwordRef.current?.value || '';

    try {
      await register(username, password);
      setSuccess('Account created! You can now login.');
      if (usernameRef.current) usernameRef.current.value = '';
      if (passwordRef.current) passwordRef.current.value = '';
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error registering');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            ref={usernameRef}
            className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Username"
            required
          />
          <input
            ref={passwordRef}
            className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Password"
            type="password"
            required
          />
          <button
            type="submit"
            className="bg-green-500 text-white p-3 rounded hover:bg-green-600 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        {error && <p className="text-red-500 mt-3 text-center">{error}</p>}
        {success && (
          <p className="text-green-500 mt-3 text-center">
            {success}{' '}
            <Link className="text-blue-500 hover:underline" href="/auth/login">
              Login
            </Link>
          </p>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link className="text-blue-500 hover:underline" href="/auth/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
