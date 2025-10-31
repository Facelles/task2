// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { useAuth } from '../../../hooks/useAuth';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';

// export default function LoginPage() {
//   const { login, user } = useAuth();
//   const router = useRouter();

//   const usernameRef = useRef<HTMLInputElement>(null);
//   const passwordRef = useRef<HTMLInputElement>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     if (user) router.replace('/tasks');
//   }, [user, router]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     const username = usernameRef.current?.value || '';
//     const password = passwordRef.current?.value || '';

//     try {
//       if (password.length < 5) {
//         setError('Password must be more than 5');
//         setLoading(false);
//         return;
//       }
//       await login(username, password);
//     } catch (err: any) {
//       setError(err?.response?.data?.message || 'Error logging in');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
//       <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
//         <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
//         <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
//           <input
//             ref={usernameRef}
//             className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
//             placeholder="Username"
//             required
//           />
//           <input
//             ref={passwordRef}
//             className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
//             placeholder="Password"
//             type="password"
//             required
//           />
//           <button
//             type="submit"
//             className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600 disabled:bg-gray-400"
//             disabled={loading}
//           >
//             {loading ? 'Logging in...' : 'Login'}
//           </button>
//         </form>
//         {error && <p className="text-red-500 mt-3 text-center">{error}</p>}
//         <p className="mt-6 text-center text-sm text-gray-600">
//           Don't have an account?{' '}
//           <Link className="text-blue-500 hover:underline" href="/auth/register">
//             Register
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }
