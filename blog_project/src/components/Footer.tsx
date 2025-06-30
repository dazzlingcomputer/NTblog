import React from 'react';
import { Settings, Heart } from 'lucide-react';
import { useBlog } from '../contexts/BlogContext';

interface FooterProps {
  onOpenAdmin: () => void;
}

export function Footer({ onOpenAdmin }: FooterProps) {
  const { state } = useBlog();
  const { siteSettings, currentTheme } = state;

  return (
    <footer className={`border-t mt-16 transition-colors duration-300 ${
      currentTheme === 'dark'
        ? 'bg-gray-900/50 border-gray-700'
        : 'bg-gray-50/80 border-gray-200'
    }`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* 网站信息 */}
          <div className="text-center md:text-left">
            <h3 className={`text-lg font-semibold mb-2 ${
              currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              {siteSettings.siteName}
            </h3>
            <p className={`text-sm ${
              currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {siteSettings.siteDescription}
            </p>
          </div>

          {/* 版权信息 */}
          <div className={`text-center ${
            currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <p className="text-sm flex items-center justify-center">
              Made with <Heart size={16} className="mx-1 text-red-500" /> by {siteSettings.siteAuthor}
            </p>
            <p className="text-xs mt-1">
              © 2025 {siteSettings.siteName}. All rights reserved.
            </p>
          </div>

          {/* 站长设置按钮 */}
          <button
            onClick={onOpenAdmin}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-all duration-300 hover:scale-105 ${
              currentTheme === 'dark'
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
            title="站长设置"
          >
            <Settings size={16} />
            <span>站长设置</span>
          </button>
        </div>

        {/* 技术栈信息 */}
        <div className={`mt-6 pt-6 border-t text-center text-xs ${
          currentTheme === 'dark'
            ? 'border-gray-700 text-gray-500'
            : 'border-gray-300 text-gray-500'
        }`}>
          <p>
            Powered by React + TypeScript + Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}
