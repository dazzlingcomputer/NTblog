import React, { useState, useEffect } from 'react';
import { BlogProvider, useBlog } from './contexts/BlogContext';
import { Header } from './components/Header';
import { ArticleList } from './components/ArticleList';
import { ArticleDetail } from './components/ArticleDetail';
import { Footer } from './components/Footer';
import { Login } from './components/Login';
import { AdminPanel } from './components/AdminPanel';
import { MusicPlayer } from './components/MusicPlayer';
import { Article } from './types';
import { Settings, LogIn, UserPlus } from 'lucide-react';

function BlogApp() {
  const { state, dispatch } = useBlog();
  const { 
    currentTheme, 
    siteSettings, 
    isAuthenticated, 
    isAdminMode, 
    currentUser,
    musicTracks,
    currentTrack,
    isPlaying
  } = state;
  
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  // 页面切换动画状态
  const [pageTransition, setPageTransition] = useState(false);
  const [articleTransition, setArticleTransition] = useState(false);

  // 自动播放音乐
  useEffect(() => {
    const { musicSettings } = siteSettings;
    if (musicSettings.isEnabled && musicSettings.autoPlay && musicTracks.length > 0) {
      if (musicSettings.autoPlayConditions.includes('onPageLoad') && !currentTrack) {
        dispatch({ type: 'SET_CURRENT_TRACK', payload: musicTracks[0] });
        dispatch({ type: 'SET_PLAYING', payload: true });
      }
    }
  }, [musicTracks, siteSettings.musicSettings]);

  // 处理文章选择的动画
  const handleSelectArticle = (article: Article) => {
    setArticleTransition(true);
    setTimeout(() => {
      setSelectedArticle(article);
      setArticleTransition(false);
      
      // 文章页面音乐播放
      const { musicSettings } = siteSettings;
      if (musicSettings.isEnabled && musicSettings.autoPlay && musicTracks.length > 0) {
        if (musicSettings.autoPlayConditions.includes('onArticleOpen') && !isPlaying) {
          if (!currentTrack) {
            dispatch({ type: 'SET_CURRENT_TRACK', payload: musicTracks[0] });
          }
          dispatch({ type: 'SET_PLAYING', payload: true });
        }
      }
    }, 150);
  };

  // 处理返回文章列表的动画
  const handleBackToList = () => {
    setArticleTransition(true);
    setTimeout(() => {
      setSelectedArticle(null);
      setArticleTransition(false);
    }, 150);
  };

  // 处理站长登录
  const handleAdminLogin = () => {
    if (isAdminMode) {
      setShowAdmin(true);
    } else {
      setShowAdminLogin(true);
    }
  };

  // 处理用户登录/注册
  const handleUserAuth = () => {
    setShowUserLogin(true);
  };

  // 处理登出
  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <div 
      className={`min-h-screen transition-all duration-500 ${
        currentTheme === 'dark' ? 'dark' : ''
      }`}
      style={{
        backgroundImage: `url(${siteSettings.currentBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* 背景遮罩 */}
      <div className={`fixed inset-0 transition-colors duration-500 ${
        currentTheme === 'dark' 
          ? 'bg-black/60' 
          : 'bg-white/70'
      }`} style={{ zIndex: -1 }} />

      {/* 站长模式指示器 */}
      {isAdminMode && (
        <div className={`fixed top-0 left-0 right-0 z-30 px-4 py-2 ${
          currentTheme === 'dark' ? 'bg-blue-900/90' : 'bg-blue-500/90'
        } backdrop-blur-sm`}>
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-2 text-white">
              <Settings size={16} />
              <span className="text-sm font-medium">当前处于站长模式</span>
            </div>
            <button
              onClick={() => setShowAdmin(true)}
              className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/20 hover:bg-white/30 text-white text-sm transition-colors"
            >
              <Settings size={14} />
              打开设置
            </button>
          </div>
        </div>
      )}

      {/* 用户认证按钮 */}
      <div className={`fixed top-4 right-4 z-30 flex items-center gap-2 ${
        isAdminMode ? 'mt-12' : ''
      }`}>
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <div className={`px-3 py-2 rounded-lg backdrop-blur-sm ${
              currentTheme === 'dark' 
                ? 'bg-gray-800/90 text-gray-200' 
                : 'bg-white/90 text-gray-800'
            }`}>
              <span className="text-sm">欢迎，{currentUser?.displayName}</span>
            </div>
            <button
              onClick={handleLogout}
              className={`px-3 py-2 rounded-lg backdrop-blur-sm transition-all hover:scale-105 ${
                currentTheme === 'dark'
                  ? 'bg-red-600/90 hover:bg-red-500/90 text-white'
                  : 'bg-red-500/90 hover:bg-red-600/90 text-white'
              }`}
            >
              登出
            </button>
          </div>
        ) : (
          <button
            onClick={handleUserAuth}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-sm transition-all hover:scale-105 ${
              currentTheme === 'dark'
                ? 'bg-blue-600/90 hover:bg-blue-500/90 text-white'
                : 'bg-blue-500/90 hover:bg-blue-600/90 text-white'
            }`}
          >
            <LogIn size={16} />
            <span className="text-sm font-medium">登录/注册</span>
          </button>
        )}
      </div>

      {/* 主要内容 */}
      <div className={`relative z-10 transition-all duration-300 ${
        pageTransition ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      } ${isAdminMode ? 'pt-12' : ''}`}>
        <Header />
        
        <main className={`transition-all duration-300 ${
          articleTransition ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        }`}>
          {selectedArticle ? (
            <ArticleDetail 
              article={selectedArticle} 
              onBack={handleBackToList}
              onOpenLogin={() => setShowUserLogin(true)}
            />
          ) : (
            <ArticleList onSelectArticle={handleSelectArticle} />
          )}
        </main>

        <Footer onOpenAdmin={handleAdminLogin} />
      </div>

      {/* 音乐播放器 */}
      <MusicPlayer />

      {/* 模态框 */}
      <Login 
        isOpen={showUserLogin} 
        onClose={() => setShowUserLogin(false)}
        mode="user"
      />

      <Login 
        isOpen={showAdminLogin} 
        onClose={() => {
          setShowAdminLogin(false);
          if (isAdminMode) {
            setShowAdmin(true);
          }
        }}
        mode="admin"
      />
      
      <AdminPanel 
        isOpen={showAdmin} 
        onClose={() => setShowAdmin(false)} 
      />
    </div>
  );
}

function App() {
  return (
    <BlogProvider>
      <BlogApp />
    </BlogProvider>
  );
}

export default App;
