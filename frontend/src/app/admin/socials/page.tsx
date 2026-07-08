'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Loader2 } from 'lucide-react';

export default function AdminSocials() {
  const [socials, setSocials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState('');
  const [url, setUrl] = useState('');
  const [iconUrl, setIconUrl] = useState('');

  useEffect(() => {
    fetchSocials();
  }, []);

  const fetchSocials = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await axios.get('http://localhost:5001/api/admin/socials', config);
      setSocials(res.data);
    } catch (error) {
      console.error("Error fetching socials:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.post('http://localhost:5001/api/admin/socials', { platform, url, iconUrl }, config);
      fetchSocials();
    } catch (error: any) {
      alert("Failed to create social link: " + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.delete(`http://localhost:5001/api/admin/socials/${id}`, config);
      fetchSocials();
    } catch (error) {
      console.error("Error deleting", error);
    }
  };

  if (loading) return <div><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="space-y-12 max-w-4xl">
      <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Plus className="text-red-500" /> Add Social Link
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 mb-2">Platform Name</label>
            <input required value={platform} onChange={e=>setPlatform(e.target.value)} type="text" placeholder="e.g. Instagram" className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-red-500 outline-none" />
          </div>
          <div>
            <label className="block text-gray-400 mb-2">Icon URL (SVG/PNG)</label>
            <input required value={iconUrl} onChange={e=>setIconUrl(e.target.value)} type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-red-500 outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-400 mb-2">Profile URL</label>
            <input required value={url} onChange={e=>setUrl(e.target.value)} type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-red-500 outline-none" />
          </div>
          <div className="md:col-span-2 mt-2">
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded font-bold transition">
              Add Link
            </button>
          </div>
        </form>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-900/50">
              <th className="p-4 border-b border-gray-700 text-gray-400 font-medium w-16">Icon</th>
              <th className="p-4 border-b border-gray-700 text-gray-400 font-medium">Platform</th>
              <th className="p-4 border-b border-gray-700 text-gray-400 font-medium">URL</th>
              <th className="p-4 border-b border-gray-700 text-gray-400 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {socials.map((link: any) => (
              <tr key={link._id} className="hover:bg-gray-700/50 transition border-b border-gray-700/50">
                <td className="p-4"><img src={link.iconUrl} className="w-6 h-6 object-contain bg-white/10 rounded" alt="" /></td>
                <td className="p-4 font-medium">{link.platform}</td>
                <td className="p-4 text-blue-400 text-sm"><a href={link.url} target="_blank" rel="noreferrer">{link.url}</a></td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDelete(link._id)} className="p-2 hover:bg-red-500/20 text-red-500 rounded transition inline-block">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
