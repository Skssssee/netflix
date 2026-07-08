'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2, Loader2, Radio, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminChannels() {
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [channelId, setChannelId] = useState('');
  const [name, setName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [recatMsg, setRecatMsg] = useState('');
  const [recatLoading, setRecatLoading] = useState(false);

  useEffect(() => { fetchChannels(); }, []);

  const fetchChannels = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await axios.get('http://localhost:5001/api/admin/channels', config);
      setChannels(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setChannelId('');
    setName('');
    setEditId(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      if (editId) {
        await axios.put(`http://localhost:5001/api/admin/channels/${editId}`, { channelId, name }, config);
      } else {
        await axios.post('http://localhost:5001/api/admin/channels', { channelId, name }, config);
      }
      resetForm();
      fetchChannels();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (ch: any) => {
    setEditId(ch._id);
    setChannelId(ch.channelId);
    setName(ch.name);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this channel?')) return;
    const token = localStorage.getItem('adminToken');
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    await axios.delete(`http://localhost:5001/api/admin/channels/${id}`, config);
    fetchChannels();
  };

  const toggleActive = async (ch: any) => {
    const token = localStorage.getItem('adminToken');
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    await axios.put(`http://localhost:5001/api/admin/channels/${ch._id}`, { active: !ch.active }, config);
    fetchChannels();
  };

  const handleRecategorize = async () => {
    if (!confirm('This will re-assign categories for all movies based on their source channel ID. Continue?')) return;
    setRecatLoading(true);
    setRecatMsg('');
    try {
      const token = localStorage.getItem('adminToken');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await axios.post('http://localhost:5001/api/admin/recategorize', {}, config);
      setRecatMsg(`✅ ${res.data.message}`);
    } catch (e: any) {
      setRecatMsg('❌ ' + (e.response?.data?.error || e.message));
    } finally {
      setRecatLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Form */}
      <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Radio className="text-red-500 w-6 h-6" />
          {editId ? 'Edit Channel' : 'Add Telegram Channel'}
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Add any Telegram channel the bot should listen to. Videos forwarded or uploaded to these channels will be automatically saved under the given category name.
        </p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-400 mb-2 text-sm font-medium">
              Channel ID <span className="text-red-400">*</span>
            </label>
            <input
              required
              value={channelId}
              onChange={e => setChannelId(e.target.value)}
              type="text"
              placeholder="-1004368459674"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-red-500 outline-none font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Copy from the bot message: <code className="bg-gray-900 px-1 rounded">The ID of File 2 is: -1004...</code>
            </p>
          </div>

          <div>
            <label className="block text-gray-400 mb-2 text-sm font-medium">
              Category / Display Name <span className="text-red-400">*</span>
            </label>
            <input
              required
              value={name}
              onChange={e => setName(e.target.value)}
              type="text"
              placeholder="e.g. Action Movies, New Channel, Kids"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-red-500 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Videos from this channel will be saved under this category name.
            </p>
          </div>

          {error && (
            <div className="md:col-span-2 bg-red-900/30 border border-red-700 text-red-400 rounded-lg px-4 py-3 text-sm">
              ⚠️ {error}
            </div>
          )}

          <div className="md:col-span-2 flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-bold transition flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {editId ? 'Update Channel' : 'Add Channel'}
            </button>
            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-bold transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Info box */}
      <div className="bg-blue-900/20 border border-blue-700/40 rounded-xl p-5 text-sm text-blue-300">
        <p className="font-semibold mb-2">⚡ How to get your Channel ID</p>
        <ol className="list-decimal list-inside space-y-1 text-blue-400">
          <li>Add the bot as an admin to your Telegram channel.</li>
          <li>Forward any file from your channel to <strong>@getmyid_bot</strong> or use the ID shown in the bot auto-save message.</li>
          <li>The ID looks like <code className="bg-blue-950 px-1 rounded">-1004368459674</code>. Paste it above.</li>
          <li>Restart the backend server after adding a new channel.</li>
        </ol>
      </div>

      {/* Channels Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-700 flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-bold text-lg">Registered Channels ({channels.length})</h3>
          <div className="flex items-center gap-3 flex-wrap">
            {recatMsg && <span className="text-sm">{recatMsg}</span>}
            <button
              onClick={handleRecategorize}
              disabled={recatLoading || channels.length === 0}
              className="bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition"
            >
              {recatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '🔄'}
              Re-categorize Existing Videos
            </button>
            <span className="text-xs text-gray-500">Restart backend after adding channels</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-7 h-7 animate-spin text-red-500" />
          </div>
        ) : channels.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            No channels registered yet. Add one above.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-900/50 text-gray-400 text-sm">
                <th className="p-4">Status</th>
                <th className="p-4">Channel ID</th>
                <th className="p-4">Category Name</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((ch: any) => (
                <tr key={ch._id} className="border-t border-gray-700/50 hover:bg-gray-700/30 transition">
                  <td className="p-4">
                    <button
                      onClick={() => toggleActive(ch)}
                      title={ch.active ? 'Active – click to disable' : 'Disabled – click to enable'}
                      className="flex items-center gap-1.5"
                    >
                      {ch.active
                        ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                        : <XCircle className="w-5 h-5 text-gray-500" />}
                      <span className={`text-xs font-medium ${ch.active ? 'text-green-400' : 'text-gray-500'}`}>
                        {ch.active ? 'Active' : 'Off'}
                      </span>
                    </button>
                  </td>
                  <td className="p-4 font-mono text-sm text-gray-300">{ch.channelId}</td>
                  <td className="p-4 font-semibold text-white">{ch.name}</td>
                  <td className="p-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(ch)}
                      className="p-2 rounded hover:bg-blue-500/20 text-blue-400 transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ch._id)}
                      className="p-2 rounded hover:bg-red-500/20 text-red-500 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
