'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Bell, User, Menu, X } from 'lucide-react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-black/95 backdrop-blur-md shadow-lg'
          : 'bg-gradient-to-b from-black/80 via-black/30 to-transparent'
      }`}
    >
      <div className="max-w-screen-2xl mx-auto px-4 md:px-10 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl font-outfit font-extrabold tracking-widest text-red-600 drop-shadow-lg">
            MIZOFY
          </span>
          <span className="text-2xl font-outfit font-light tracking-widest text-white">
            MOVIES
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-7 font-poppins text-sm font-medium text-gray-300">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <Link href="/#categories" className="hover:text-white transition">Categories</Link>
          <a href="#" className="hover:text-white transition">New &amp; Popular</a>
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-4 shrink-0">
          <button aria-label="Search" className="text-gray-300 hover:text-white transition p-1">
            <Search className="w-5 h-5" />
          </button>
          <button aria-label="Notifications" className="text-gray-300 hover:text-white transition p-1 hidden sm:block">
            <Bell className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-400 flex items-center justify-center shadow">
            <User className="w-4 h-4 text-white" />
          </div>
          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-gray-300 hover:text-white transition"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-gray-800 px-6 py-4 flex flex-col gap-4 font-poppins text-sm">
          <Link href="/" className="text-gray-300 hover:text-white transition" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/#categories" className="text-gray-300 hover:text-white transition" onClick={() => setMenuOpen(false)}>Categories</Link>
          <a href="#" className="text-gray-300 hover:text-white transition">New &amp; Popular</a>
        </div>
      )}
    </header>
  );
}
