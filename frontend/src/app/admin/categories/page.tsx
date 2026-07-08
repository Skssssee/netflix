'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Loader2 } from 'lucide-react';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const [catsRes, moviesRes] = await Promise.all([
        axios.get('http://localhost:5001/api/admin/categories', config),
        axios.get('http://localhost:5001/api/admin/movies', config)
      ]);
      setCategories(catsRes.data);
      setMovies(moviesRes.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (cat: any) => {
    setEditId(cat._id);
    setName(cat.name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const token = localStorage.getItem('adminToken');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      if (editId) {
        await axios.put(`http://localhost:5001/api/admin/categories/${editId}`, { name, slug }, config);
        setEditId(null);
      } else {
        await axios.post('http://localhost:5001/api/admin/categories', { name, slug }, config);
      }
      
      setName('');
      fetchCategories();
    } catch (error: any) {
      alert("Failed to save category: " + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.delete(`http://localhost:5001/api/admin/categories/${id}`, config);
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category", error);
    }
  };

  if (loading) return <div><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="space-y-12 max-w-4xl">
      <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Plus className="text-red-500" /> {editId ? 'Edit Category' : 'Add New Category'}
        </h2>
        <form onSubmit={handleSubmit} className="flex gap-4">
          <div className="flex-1">
            <input 
              required 
              placeholder="e.g. Action Movies"
              value={name} 
              onChange={e=>setName(e.target.value)} 
              type="text" 
              className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-red-500 outline-none" 
            />
          </div>
          <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded font-bold transition whitespace-nowrap">
            {editId ? 'Update Category' : 'Add Category'}
          </button>
          {editId && (
            <button type="button" onClick={() => { setEditId(null); setName(''); }} className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded font-bold transition whitespace-nowrap">
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-900/50">
              <th className="p-4 border-b border-gray-700 text-gray-400 font-medium w-1/2">Name</th>
              <th className="p-4 border-b border-gray-700 text-gray-400 font-medium">Slug</th>
              <th className="p-4 border-b border-gray-700 text-gray-400 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat: any) => (
              <React.Fragment key={cat._id}>
                <tr className="hover:bg-gray-700/50 transition border-b border-gray-700/50">
                  <td className="p-4 font-medium">{cat.name}</td>
                  <td className="p-4 text-gray-400">{cat.slug}</td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => setExpandedCategoryId(expandedCategoryId === cat._id ? null : cat._id)} 
                      className="p-2 hover:bg-green-500/20 text-green-400 rounded transition inline-flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      <span className="text-sm font-medium">Show</span>
                    </button>
                    <button onClick={() => handleEditClick(cat)} className="p-2 hover:bg-blue-500/20 text-blue-400 rounded transition inline-block">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button onClick={() => handleDelete(cat._id)} className="p-2 hover:bg-red-500/20 text-red-500 rounded transition inline-block">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
                {expandedCategoryId === cat._id && (
                  <tr className="bg-gray-800/80 border-b border-gray-700/50">
                    <td colSpan={3} className="p-6">
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Videos in {cat.name}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {movies.filter((m: any) => (m.category?._id || m.category) === cat._id).length > 0 ? (
                          movies.filter((m: any) => (m.category?._id || m.category) === cat._id).map((movie: any) => (
                            <div key={movie._id} className="flex flex-col bg-gray-900 rounded border border-gray-700 overflow-hidden relative group">
                              <img src={movie.thumbnailUrl} alt={movie.title} className="w-full h-24 object-cover" />
                              <div className="p-2 text-sm truncate">{movie.title}</div>
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                <a href={`/admin/movies?edit=${movie._id}`} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-bold shadow-lg flex items-center gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                  Edit Full Details
                                </a>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500 italic">No videos yet.</div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500">No categories found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
