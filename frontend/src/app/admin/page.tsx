'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Layers, Film, Image as ImageIcon, Share2, Users } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.get('http://localhost:5001/api/admin/stats', config);
        setStats(res.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  const statItems = [
    { title: 'Categories',  value: stats?.categories ?? 0, icon: Layers,    color: 'text-blue-500' },
    { title: 'Movies',      value: stats?.movies ?? 0,     icon: Film,      color: 'text-red-500' },
    { title: 'Hero Sliders',value: stats?.sliders ?? 0,    icon: ImageIcon, color: 'text-green-500' },
    { title: 'Social Links',value: stats?.socials ?? 0,    icon: Share2,    color: 'text-purple-500' },
    { title: 'Total Users', value: stats?.users ?? 0,      icon: Users,     color: 'text-yellow-500' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome to the Admin Dashboard</h1>
      <p className="text-gray-400 text-lg">
        Select an option from the sidebar to manage your Netflix clone content.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mt-8">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-gray-400 font-medium text-sm">{item.title}</h3>
                <p className="text-4xl font-bold mt-2 text-white">{item.value}</p>
              </div>
              <div className={`p-4 bg-gray-900/60 rounded-full border border-gray-700/50 ${item.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
