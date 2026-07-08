'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Loader2 } from 'lucide-react';

export default function AdminSliders() {
  const [sliders, setSliders] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [movieId, setMovieId] = useState('');
  const [order, setOrder] = useState('1');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const [slidersRes, moviesRes] = await Promise.all([
        axios.get('http://localhost:5001/api/admin/sliders', config),
        axios.get('http://localhost:5001/api/admin/movies', config)
      ]);
      setSliders(slidersRes.data);
      setMovies(moviesRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sliders.length >= 5) {
      alert("Maximum 5 sliders allowed!");
      return;
    }
    try {
      const token = localStorage.getItem('adminToken');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.post('http://localhost:5001/api/admin/sliders', {
        title, description, imageUrl, movieId, order: Number(order)
      }, config);
      fetchData();
    } catch (error: any) {
      alert("Failed to save slider: " + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this slider?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.delete(`http://localhost:5001/api/admin/sliders/${id}`, config);
      fetchData();
    } catch (error) {
      console.error("Error deleting", error);
    }
  };

  if (loading) return <div><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="space-y-12">
      <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Plus className="text-red-500" /> Add Hero Slider
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-400 mb-2">Title</label>
            <input required value={title} onChange={e=>setTitle(e.target.value)} type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-red-500 outline-none" />
          </div>
          <div>
            <label className="block text-gray-400 mb-2">Background Image URL</label>
            <input required value={imageUrl} onChange={e=>setImageUrl(e.target.value)} type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-red-500 outline-none" />
          </div>
          <div>
            <label className="block text-gray-400 mb-2">Linked Movie</label>
            <select required value={movieId} onChange={e=>setMovieId(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-red-500 outline-none">
              <option value="">Select a movie to play...</option>
              {movies.map((m: any) => <option key={m._id} value={m._id}>{m.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 mb-2">Order (1-5)</label>
            <input required value={order} onChange={e=>setOrder(e.target.value)} type="number" min="1" max="5" className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-red-500 outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-400 mb-2">Description</label>
            <textarea required value={description} onChange={e=>setDescription(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-red-500 outline-none h-24" />
          </div>
          <div className="md:col-span-2 mt-4">
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded font-bold transition">
              Add Slider ({sliders.length}/5)
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sliders.map((slider: any) => (
          <div key={slider._id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
            <img src={slider.imageUrl} alt={slider.title} className="w-full h-40 object-cover" />
            <div className="p-4 relative">
              <span className="absolute -top-4 right-4 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold border-4 border-gray-800">
                {slider.order}
              </span>
              <h3 className="font-bold text-lg mb-1">{slider.title}</h3>
              <p className="text-gray-400 text-sm line-clamp-2 mb-4">{slider.description}</p>
              <button onClick={() => handleDelete(slider._id)} className="w-full py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded font-medium transition">
                Remove Slider
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
