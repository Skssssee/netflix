'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, Share2, AtSign, Play } from 'lucide-react';

export default function Footer({ socials }: { socials?: any[] }) {
  const year = new Date().getFullYear();

  const footerLinks = [
    {
      heading: 'Explore',
      links: [
        { label: 'Home', href: '/' },
        { label: 'Categories', href: '/#categories' },
        { label: 'New & Popular', href: '#' },
      ],
    },
    {
      heading: 'Company',
      links: [
        { label: 'About Us', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Contact', href: '#' },
      ],
    },
    {
      heading: 'Legal',
      links: [
        { label: 'Terms of Service', href: '#' },
        { label: 'Privacy Policy', href: '#' },
        { label: 'Cookie Policy', href: '#' },
        { label: 'DMCA', href: '#' },
      ],
    },
  ];

  const iconMap: Record<string, React.ReactNode> = {
    youtube: <Play className="w-5 h-5" />,
    instagram: <AtSign className="w-5 h-5" />,
    twitter: <Share2 className="w-5 h-5" />,
    facebook: <Globe className="w-5 h-5" />,
    default: <Globe className="w-5 h-5" />,
  };

  return (
    <footer className="bg-[#0a0a0a] border-t border-gray-800/60 mt-24">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-16">
        {/* Logo + tagline */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl font-outfit font-extrabold tracking-widest text-red-600">MIZOFY</span>
            <span className="text-3xl font-outfit font-light tracking-widest text-white">MOVIES</span>
          </div>
          <p className="text-gray-500 font-poppins text-sm max-w-sm">
            Your ultimate destination for free online movies, series, and entertainment — powered by the Mizofy community.
          </p>

          {/* Social icons */}
          {socials && socials.length > 0 && (
            <div className="flex gap-4 mt-6">
              {socials.map((s: any) => (
                <a
                  key={s._id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.platform}
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-red-600 transition-colors flex items-center justify-center text-gray-400 hover:text-white"
                >
                  {s.iconUrl ? (
                    <img src={s.iconUrl} alt={s.platform} className="w-5 h-5 object-contain invert" />
                  ) : (
                    iconMap[s.platform?.toLowerCase()] ?? iconMap.default
                  )}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 mb-14">
          {footerLinks.map((section) => (
            <div key={section.heading}>
              <h4 className="font-outfit font-semibold text-white text-sm uppercase tracking-widest mb-5">
                {section.heading}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="font-poppins text-sm text-gray-500 hover:text-white transition"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800/60 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 font-poppins text-xs text-center md:text-left">
            © {year} Mizofy Movies. All rights reserved. | This site is not affiliated with any streaming service.
          </p>
          <div className="flex gap-6 text-xs text-gray-600 font-poppins">
            <a href="#" className="hover:text-white transition">Terms of Service</a>
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">DMCA</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
