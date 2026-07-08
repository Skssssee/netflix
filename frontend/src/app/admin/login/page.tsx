'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5001/api/admin/login', { username, password });
      localStorage.setItem('adminToken', res.data.token);
      router.push('/admin');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-red-600 tracking-widest font-outfit">MIZOFY</h1>
          <p className="text-gray-400 mt-2 font-poppins">Admin Panel</p>
        </div>

        <form onSubmit={handleLogin} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-5 shadow-2xl">
          <h2 className="text-xl font-bold text-white font-outfit">Sign In</h2>

          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-400 rounded-lg px-4 py-3 text-sm">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="block text-gray-400 text-sm mb-2 font-poppins">Username</label>
            <input
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              type="text"
              placeholder="Enter username"
              autoComplete="username"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-red-500 transition font-poppins"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2 font-poppins">Password</label>
            <input
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              type="password"
              placeholder="Enter password"
              autoComplete="current-password"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-red-500 transition font-poppins"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white py-3 rounded-lg font-bold font-poppins transition flex items-center justify-center gap-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
