'use client';

import axios from 'axios';

// Configure global Axios request interceptor to dynamically rewrite localhost:5001 URL to Vercel's NEXT_PUBLIC_API_URL
if (typeof window !== 'undefined') {
  axios.interceptors.request.use((config) => {
    if (config.url && config.url.startsWith('http://localhost:5001')) {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      config.url = config.url.replace('http://localhost:5001', apiBase.replace(/\/$/, ''));
    }
    return config;
  });
}

export default function ApiBootstrap() {
  return null;
}
