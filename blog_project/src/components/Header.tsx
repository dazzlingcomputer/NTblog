import React from 'react';
import { Moon, Sun, Github, Twitter, Mail, MessageSquare } from 'lucide-react';
import { useBlog } from '../contexts/BlogContext';

export function Header() {
  const { state, dispatch } = useBlog();
  const { siteSettings, currentTheme } = state;

  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' });
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    dispatch({ 
      type: 'UPDATE_SITE_SETTINGS', 
      payload: { theme: newTheme } 
    });
  };

  const socialIcons = {
    github: Github,
    twitter: Twitter,
    weibo: MessageSquare,
    email: Mail
  };

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${
      currentTheme === 'dark' 
        ? 'bg-gray-900/80 border-gray-700' 
        : 'bg-white/80 border-gray-200'
    }`}>
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <h1 className={`text-2xl font-bold transition-colors ${
              currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              {siteSettings.siteName}
            </h1>
            <p className={`hidden md:block text-sm transition-colors ${
              currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {siteSettings.siteDescription}
            </p>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Social Links */}
            <div className="flex items-center space-x-3">
              {Object.entries(siteSettings.socialLinks).map(([platform, url]) => {
                if (!url) return null;
                const Icon = socialIcons[platform as keyof typeof socialIcons];
                if (!Icon) return null;

                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                      currentTheme === 'dark'
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                    title={platform}
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                currentTheme === 'dark'
                  ? 'text-yellow-400 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="切换主题"
            >
              {currentTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
