'use client';

import { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2, Loader2 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

function AdminMoviesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [movies, setMovies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [telegramFileId, setTelegramFileId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [duration, setDuration] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const editParam = searchParams.get('edit');
    if (editParam && movies.length > 0) {
      const movieToEdit = movies.find((m: any) => m._id === editParam);
      if (movieToEdit && editId !== editParam) {
        handleEditClick(movieToEdit);
        // Clear the URL param without reloading the page
        router.replace('/admin/movies');
      }
    }
  }, [searchParams, movies, router]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const [moviesRes, catsRes] = await Promise.all([
        axios.get('http://localhost:5001/api/admin/movies', config),
        axios.get('http://localhost:5001/api/admin/categories', config)
      ]);
      setMovies(moviesRes.data);
      setCategories(catsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (movie: any) => {
    setEditId(movie._id);
    setTitle(movie.title || '');
    setDescription(movie.description || '');
    setThumbnailUrl(movie.thumbnailUrl || '');
    setTelegramFileId(movie.telegramFileId || '');
    setCategoryId(movie.category?._id || movie.category || '');
    setDuration(movie.duration || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const payload = {
        title,
        description: description.trim() || undefined,
        thumbnailUrl,
        telegramFileId,
        category: categoryId,
        duration: duration.trim() || undefined
      };
      
      if (editId) {
        await axios.put(`http://localhost:5001/api/admin/movies/${editId}`, payload, config);
        alert("Movie updated successfully!");
        setEditId(null);
      } else {
        await axios.post('http://localhost:5001/api/admin/movies', payload, config);
        alert("Movie saved successfully!");
      }
      
      // Reset form
      setTitle('');
      setDescription('');
      setThumbnailUrl('');
      setTelegramFileId('');
      setCategoryId('');
      setDuration('');
      
      fetchData(); // Refresh list
    } catch (error: any) {
      alert("Failed to save movie: " + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this movie?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.delete(`http://localhost:5001/api/admin/movies/${id}`, config);
      fetchData();
    } catch (error) {
      console.error("Error deleting movie", error);
    }
  };

  if (loading) return <div><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="space-y-12">
      {/* Add Movie Form */}
      <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Plus className="text-red-500" /> {editId ? 'Edit Movie' : 'Add New Movie'}
        </h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-400 mb-2">Movie Title</label>
            <input required value={title} onChange={e=>setTitle(e.target.value)} type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-red-500 outline-none" />
          </div>
          <div>
            <label className="block text-gray-400 mb-2">Thumbnail Image URL</label>
            <input required value={thumbnailUrl} onChange={e=>setThumbnailUrl(e.target.value)} type="text" placeholder="https://... or leave as-is to use Telegram thumbnail" className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-red-500 outline-none" />
            {/* Live preview */}
            {thumbnailUrl && (
              <div className="mt-2 flex items-center gap-3">
                <img
                  src={thumbnailUrl}
                  alt="Thumbnail preview"
                  className="w-32 h-20 object-cover rounded border border-gray-600"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  onLoad={(e) => { (e.target as HTMLImageElement).style.display = 'block'; }}
                />
                <span className="text-xs text-gray-500">Preview</span>
              </div>
            )}
          </div>
          <div>
            <label className="block text-gray-400 mb-2">Telegram File/Message ID</label>
            <input required value={telegramFileId} onChange={e=>setTelegramFileId(e.target.value)} type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-red-500 outline-none" />
          </div>
          <div>
            <label className="block text-gray-400 mb-2">Category</label>
            <select required value={categoryId} onChange={e=>setCategoryId(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-red-500 outline-none">
              <option value="">Select a category...</option>
              {categories.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 mb-2">Duration (e.g. "1h 45m")</label>
            <input value={duration} onChange={e=>setDuration(e.target.value)} type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-red-500 outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-400 mb-2">Description</label>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-red-500 outline-none h-24" />
          </div>
          <div className="md:col-span-2 mt-4 flex gap-4">
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded font-bold transition">
              {editId ? 'Update Movie' : 'Save Movie to Database'}
            </button>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setTitle(''); setDescription(''); setThumbnailUrl(''); setTelegramFileId(''); setCategoryId(''); setDuration(''); }} className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded font-bold transition">
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Movies Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-900/50">
              <th className="p-4 border-b border-gray-700 text-gray-400 font-medium">Thumbnail</th>
              <th className="p-4 border-b border-gray-700 text-gray-400 font-medium">Title</th>
              <th className="p-4 border-b border-gray-700 text-gray-400 font-medium">Telegram ID</th>
              <th className="p-4 border-b border-gray-700 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {movies.map((movie: any) => (
              <tr key={movie._id} className="hover:bg-gray-700/50 transition border-b border-gray-700/50">
                <td className="p-4">
                  <img src={movie.thumbnailUrl} alt={movie.title} className="w-16 h-10 object-cover rounded" />
                </td>
                <td className="p-4 font-medium">{movie.title}</td>
                <td className="p-4 text-gray-400">{movie.telegramFileId}</td>
                <td className="p-4 flex gap-3">
                  <button onClick={() => handleEditClick(movie)} className="p-2 hover:bg-blue-500/20 text-blue-400 rounded transition">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(movie._id)} className="p-2 hover:bg-red-500/20 text-red-500 rounded transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {movies.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">No movies found. Add one above!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminMovies() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    }>
      <AdminMoviesContent />
    </Suspense>
  );
}
