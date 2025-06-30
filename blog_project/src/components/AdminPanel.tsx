import React, { useState, useRef } from 'react';
import { 
  X, Plus, Edit, Trash2, Eye, EyeOff, Settings, Save, Upload, LogOut,
  Users, Music, FileText, Github, Download, UploadCloud, 
  Volume2, VolumeX, Play, Pause, SkipForward, Image as ImageIcon,
  Link2, ToggleLeft, ToggleRight, UserCheck, UserX, Shield, Key
} from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import { useBlog } from '../contexts/BlogContext';
import { Article, User, MusicTrack, CustomBackground } from '../types';
import { createGitHubSync, getGitHubSync } from '../lib/github';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const { state, dispatch } = useBlog();
  const { 
    articles, 
    users, 
    siteSettings, 
    currentTheme, 
    isAuthenticated, 
    musicTracks,
    currentTrack,
    isPlaying,
    gitHubConfig,
    lastSyncTime
  } = state;
  
  const [activeTab, setActiveTab] = useState<'articles' | 'users' | 'music' | 'settings' | 'github'>('articles');
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  
  // 文件上传引用
  const musicFileRef = useRef<HTMLInputElement>(null);
  const backgroundFileRef = useRef<HTMLInputElement>(null);

  const [articleForm, setArticleForm] = useState({
    title: '',
    content: '',
    summary: '',
    tags: '',
    published: false,
    coverImage: ''
  });

  const [settingsForm, setSettingsForm] = useState({
    siteName: siteSettings.siteName,
    siteDescription: siteSettings.siteDescription,
    siteAuthor: siteSettings.siteAuthor,
    currentBackground: siteSettings.currentBackground,
    github: siteSettings.socialLinks.github || '',
    twitter: siteSettings.socialLinks.twitter || '',
    weibo: siteSettings.socialLinks.weibo || '',
    email: siteSettings.socialLinks.email || '',
    bilibili: siteSettings.socialLinks.bilibili || '',
    wechat: siteSettings.socialLinks.wechat || '',
    qq: siteSettings.socialLinks.qq || '',
    musicEnabled: siteSettings.musicSettings.isEnabled,
    autoPlay: siteSettings.musicSettings.autoPlay,
    autoPlayOnPageLoad: siteSettings.musicSettings.autoPlayConditions.includes('onPageLoad'),
    autoPlayOnArticleOpen: siteSettings.musicSettings.autoPlayConditions.includes('onArticleOpen'),
    playMode: siteSettings.musicSettings.playMode,
    volume: siteSettings.musicSettings.volume,
    requireLoginForComments: siteSettings.requireLoginForComments
  });

  const [githubForm, setGithubForm] = useState({
    owner: gitHubConfig?.owner || '',
    repo: gitHubConfig?.repo || '',
    token: gitHubConfig?.token || '',
    branch: gitHubConfig?.branch || 'main'
  });

  if (!isOpen || !isAuthenticated) return null;

  // 文章管理
  const handleCreateArticle = () => {
    setIsCreating(true);
    setEditingArticle(null);
    setArticleForm({
      title: '',
      content: '',
      summary: '',
      tags: '',
      published: false,
      coverImage: ''
    });
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setIsCreating(false);
    setArticleForm({
      title: article.title,
      content: article.content,
      summary: article.summary,
      tags: article.tags.join(', '),
      published: article.published,
      coverImage: article.coverImage || ''
    });
  };

  const handleSaveArticle = () => {
    if (!articleForm.title.trim() || !articleForm.content.trim()) {
      alert('请填写标题和内容');
      return;
    }

    const tagsArray = articleForm.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    if (isCreating) {
      const newArticle: Article = {
        id: Date.now().toString(),
        title: articleForm.title.trim(),
        content: articleForm.content.trim(),
        summary: articleForm.summary.trim() || articleForm.content.slice(0, 150) + '...',
        tags: tagsArray,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 0,
        likes: 0,
        published: articleForm.published,
        coverImage: articleForm.coverImage.trim() || siteSettings.backgroundImages[0]
      };
      dispatch({ type: 'ADD_ARTICLE', payload: newArticle });
    } else if (editingArticle) {
      const updatedArticle: Article = {
        ...editingArticle,
        title: articleForm.title.trim(),
        content: articleForm.content.trim(),
        summary: articleForm.summary.trim() || articleForm.content.slice(0, 150) + '...',
        tags: tagsArray,
        updatedAt: new Date().toISOString(),
        published: articleForm.published,
        coverImage: articleForm.coverImage.trim() || editingArticle.coverImage
      };
      dispatch({ type: 'UPDATE_ARTICLE', payload: updatedArticle });
    }

    setIsCreating(false);
    setEditingArticle(null);
  };

  const handleDeleteArticle = (id: string) => {
    if (window.confirm('确定要删除这篇文章吗？')) {
      dispatch({ type: 'DELETE_ARTICLE', payload: id });
    }
  };

  // 用户管理
  const handleToggleUserStatus = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const updatedUser = { ...user, isActive: !user.isActive };
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('确定要删除这个用户吗？')) {
      dispatch({ type: 'DELETE_USER', payload: userId });
    }
  };

  const handleToggleUserRole = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const newRole: 'admin' | 'user' = user.role === 'admin' ? 'user' : 'admin';
      const updatedUser = { ...user, role: newRole };
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    }
  };

  // 音乐管理
  const handleMusicUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const audio = new Audio();
    const objectUrl = URL.createObjectURL(file);
    
    audio.onloadedmetadata = () => {
      const newTrack: MusicTrack = {
        id: Date.now().toString(),
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: '未知艺术家',
        url: objectUrl,
        duration: audio.duration,
        uploadedAt: new Date().toISOString()
      };
      
      dispatch({ type: 'ADD_MUSIC_TRACK', payload: newTrack });
      URL.revokeObjectURL(objectUrl);
    };
    
    audio.src = objectUrl;
  };

  const handleDeleteTrack = (trackId: string) => {
    if (window.confirm('确定要删除这首音乐吗？')) {
      dispatch({ type: 'DELETE_MUSIC_TRACK', payload: trackId });
    }
  };

  // 背景图片管理
  const handleBackgroundUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    
    const newBackground: CustomBackground = {
      id: Date.now().toString(),
      name: file.name,
      url: objectUrl,
      uploadedAt: new Date().toISOString()
    };

    dispatch({
      type: 'UPDATE_SITE_SETTINGS',
      payload: {
        customBackgrounds: [...siteSettings.customBackgrounds, newBackground]
      }
    });
  };

  // 设置保存
  const handleSaveSettings = () => {
    const autoPlayConditions = [];
    if (settingsForm.autoPlayOnPageLoad) autoPlayConditions.push('onPageLoad');
    if (settingsForm.autoPlayOnArticleOpen) autoPlayConditions.push('onArticleOpen');

    const socialLinks = {
      github: settingsForm.github.trim() || undefined,
      twitter: settingsForm.twitter.trim() || undefined,
      weibo: settingsForm.weibo.trim() || undefined,
      email: settingsForm.email.trim() || undefined,
      bilibili: settingsForm.bilibili.trim() || undefined,
      wechat: settingsForm.wechat.trim() || undefined,
      qq: settingsForm.qq.trim() || undefined,
    };

    dispatch({
      type: 'UPDATE_SITE_SETTINGS',
      payload: {
        siteName: settingsForm.siteName.trim(),
        siteDescription: settingsForm.siteDescription.trim(),
        siteAuthor: settingsForm.siteAuthor.trim(),
        currentBackground: settingsForm.currentBackground,
        socialLinks,
        socialLinksEnabled: {
          github: Boolean(settingsForm.github.trim()),
          twitter: Boolean(settingsForm.twitter.trim()),
          weibo: Boolean(settingsForm.weibo.trim()),
          email: Boolean(settingsForm.email.trim()),
          bilibili: Boolean(settingsForm.bilibili.trim()),
          wechat: Boolean(settingsForm.wechat.trim()),
          qq: Boolean(settingsForm.qq.trim()),
        },
        musicSettings: {
          isEnabled: settingsForm.musicEnabled,
          autoPlay: settingsForm.autoPlay,
          autoPlayConditions,
          playMode: settingsForm.playMode,
          volume: settingsForm.volume
        },
        requireLoginForComments: settingsForm.requireLoginForComments
      }
    });

    alert('设置已保存！');
  };

  // GitHub 同步
  const handleSaveGitHubConfig = () => {
    if (!githubForm.owner || !githubForm.repo || !githubForm.token) {
      alert('请填写完整的GitHub配置信息');
      return;
    }

    const config = {
      owner: githubForm.owner.trim(),
      repo: githubForm.repo.trim(),
      token: githubForm.token.trim(),
      branch: githubForm.branch.trim() || 'main'
    };

    dispatch({ type: 'SET_GITHUB_CONFIG', payload: config });
    createGitHubSync(config);
    alert('GitHub配置已保存！');
  };

  const handleSyncToGitHub = async () => {
    const sync = getGitHubSync();
    if (!sync) {
      alert('请先配置GitHub设置');
      return;
    }

    setSyncStatus('syncing');
    try {
      await sync.syncToGitHub({
        articles,
        comments: state.comments,
        users: users.filter(u => u.role === 'admin'), // 只同步管理员信息
        siteSettings,
        musicTracks,
        lastUpdated: new Date().toISOString()
      });
      
      dispatch({ type: 'SET_LAST_SYNC_TIME', payload: new Date().toISOString() });
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      console.error('同步失败:', error);
      setSyncStatus('error');
      alert('同步失败，请检查GitHub配置和网络连接');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const handleSyncFromGitHub = async () => {
    const sync = getGitHubSync();
    if (!sync) {
      alert('请先配置GitHub设置');
      return;
    }

    setSyncStatus('syncing');
    try {
      const data = await sync.syncFromGitHub();
      if (data) {
        dispatch({ type: 'LOAD_DATA', payload: data });
        setSyncStatus('success');
        alert('数据同步成功！');
      } else {
        alert('未找到远程数据');
      }
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      console.error('同步失败:', error);
      setSyncStatus('error');
      alert('同步失败，请检查GitHub配置和网络连接');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？')) {
      dispatch({ type: 'LOGOUT' });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
      <div className={`h-full flex ${currentTheme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        {/* 侧边栏 */}
        <div className={`w-64 p-6 ${
          currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } border-r ${currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-y-auto`}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">管理后台</h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                currentTheme === 'dark'
                  ? 'hover:bg-gray-700 text-gray-400'
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('articles')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                activeTab === 'articles'
                  ? 'bg-blue-500 text-white'
                  : currentTheme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <FileText size={18} />
              文章管理
            </button>
            
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                activeTab === 'users'
                  ? 'bg-blue-500 text-white'
                  : currentTheme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Users size={18} />
              用户管理
            </button>

            <button
              onClick={() => setActiveTab('music')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                activeTab === 'music'
                  ? 'bg-blue-500 text-white'
                  : currentTheme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Music size={18} />
              音乐管理
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                activeTab === 'settings'
                  ? 'bg-blue-500 text-white'
                  : currentTheme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Settings size={18} />
              网站设置
            </button>

            <button
              onClick={() => setActiveTab('github')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                activeTab === 'github'
                  ? 'bg-blue-500 text-white'
                  : currentTheme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Github size={18} />
              数据同步
            </button>
          </nav>

          <button
            onClick={handleLogout}
            className={`w-full mt-8 flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentTheme === 'dark'
                ? 'text-red-400 hover:bg-gray-700'
                : 'text-red-600 hover:bg-gray-100'
            }`}
          >
            <LogOut size={18} />
            退出登录
          </button>
        </div>

        {/* 主内容区域 */}
        <div className={`flex-1 p-6 ${
          currentTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        } overflow-y-auto`}>
          
          {/* 文章管理 */}
          {activeTab === 'articles' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">文章管理</h3>
                <button
                  onClick={handleCreateArticle}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus size={18} />
                  新建文章
                </button>
              </div>

              {(isCreating || editingArticle) ? (
                <div className={`p-6 rounded-lg ${
                  currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'
                } border ${currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="space-y-4">
                    {/* 文章标题 */}
                    <div>
                      <label className="block text-sm font-medium mb-2">文章标题</label>
                      <input
                        type="text"
                        value={articleForm.title}
                        onChange={(e) => setArticleForm(prev => ({ ...prev, title: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          currentTheme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-800'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="请输入文章标题"
                      />
                    </div>

                    {/* 文章摘要 */}
                    <div>
                      <label className="block text-sm font-medium mb-2">文章摘要</label>
                      <textarea
                        value={articleForm.summary}
                        onChange={(e) => setArticleForm(prev => ({ ...prev, summary: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          currentTheme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-800'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        rows={3}
                        placeholder="请输入文章摘要（可选，留空将自动生成）"
                      />
                    </div>

                    {/* 标签 */}
                    <div>
                      <label className="block text-sm font-medium mb-2">标签</label>
                      <input
                        type="text"
                        value={articleForm.tags}
                        onChange={(e) => setArticleForm(prev => ({ ...prev, tags: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          currentTheme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-800'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="请输入标签，用逗号分隔"
                      />
                    </div>

                    {/* 封面图片 */}
                    <div>
                      <label className="block text-sm font-medium mb-2">封面图片URL</label>
                      <input
                        type="url"
                        value={articleForm.coverImage}
                        onChange={(e) => setArticleForm(prev => ({ ...prev, coverImage: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          currentTheme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-800'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="请输入封面图片URL（可选）"
                      />
                    </div>

                    {/* 发布状态 */}
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="published"
                        checked={articleForm.published}
                        onChange={(e) => setArticleForm(prev => ({ ...prev, published: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="published" className="text-sm font-medium">立即发布</label>
                    </div>

                    {/* 内容编辑器 */}
                    <div>
                      <label className="block text-sm font-medium mb-2">文章内容</label>
                      <div data-color-mode={currentTheme}>
                        <MDEditor
                          value={articleForm.content}
                          onChange={(value) => setArticleForm(prev => ({ ...prev, content: value || '' }))}
                          preview="edit"
                          height={400}
                        />
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-3">
                      <button
                        onClick={handleSaveArticle}
                        className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <Save size={18} />
                        保存文章
                      </button>
                      <button
                        onClick={() => {
                          setIsCreating(false);
                          setEditingArticle(null);
                        }}
                        className={`px-6 py-2 rounded-lg border transition-colors ${
                          currentTheme === 'dark'
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                            : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        取消
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {articles.map((article) => (
                    <div
                      key={article.id}
                      className={`p-4 rounded-lg border ${
                        currentTheme === 'dark'
                          ? 'bg-gray-800 border-gray-700'
                          : 'bg-white border-gray-200'
                      } hover:shadow-md transition-shadow`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold">{article.title}</h4>
                            <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                              article.published
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {article.published ? (
                                <>
                                  <Eye size={12} />
                                  已发布
                                </>
                              ) : (
                                <>
                                  <EyeOff size={12} />
                                  草稿
                                </>
                              )}
                            </span>
                          </div>
                          <p className={`text-sm ${
                            currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {article.summary}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>创建时间：{new Date(article.createdAt).toLocaleString()}</span>
                            <span>标签：{article.tags.join(', ')}</span>
                            <span>阅读量：{article.views}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditArticle(article)}
                            className={`p-2 rounded-lg transition-colors ${
                              currentTheme === 'dark'
                                ? 'text-blue-400 hover:bg-gray-700'
                                : 'text-blue-600 hover:bg-blue-50'
                            }`}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(article.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              currentTheme === 'dark'
                                ? 'text-red-400 hover:bg-gray-700'
                                : 'text-red-600 hover:bg-red-50'
                            }`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {articles.length === 0 && (
                    <div className={`text-center py-12 ${
                      currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <FileText size={48} className="mx-auto mb-4 opacity-50" />
                      <p>还没有文章，点击上方按钮创建第一篇文章吧！</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 用户管理 */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">用户管理</h3>
                <div className="text-sm text-gray-500">
                  共 {users.length} 个用户
                </div>
              </div>

              <div className="grid gap-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`p-4 rounded-lg border ${
                      currentTheme === 'dark'
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-white border-gray-200'
                    } hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          user.role === 'admin' ? 'bg-blue-500' : 'bg-gray-500'
                        } text-white font-bold`}>
                          {user.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{user.displayName}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.role === 'admin'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {user.role === 'admin' ? '管理员' : '普通用户'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? '活跃' : '禁用'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">@{user.username} • {user.email}</p>
                          <p className="text-xs text-gray-400">
                            注册时间：{new Date(user.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleUserRole(user.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            currentTheme === 'dark'
                              ? 'text-blue-400 hover:bg-gray-700'
                              : 'text-blue-600 hover:bg-blue-50'
                          }`}
                          title={user.role === 'admin' ? '降级为普通用户' : '升级为管理员'}
                        >
                          {user.role === 'admin' ? <Shield size={16} /> : <Key size={16} />}
                        </button>
                        
                        <button
                          onClick={() => handleToggleUserStatus(user.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.isActive
                              ? currentTheme === 'dark'
                                ? 'text-red-400 hover:bg-gray-700'
                                : 'text-red-600 hover:bg-red-50'
                              : currentTheme === 'dark'
                                ? 'text-green-400 hover:bg-gray-700'
                                : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={user.isActive ? '禁用用户' : '启用用户'}
                        >
                          {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>
                        
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            currentTheme === 'dark'
                              ? 'text-red-400 hover:bg-gray-700'
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                          title="删除用户"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {users.length === 0 && (
                  <div className={`text-center py-12 ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <Users size={48} className="mx-auto mb-4 opacity-50" />
                    <p>还没有注册用户</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 音乐管理 */}
          {activeTab === 'music' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">音乐管理</h3>
                <button
                  onClick={() => musicFileRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Upload size={18} />
                  上传音乐
                </button>
              </div>

              <input
                ref={musicFileRef}
                type="file"
                accept="audio/*"
                onChange={handleMusicUpload}
                className="hidden"
              />

              <div className="grid gap-4">
                {musicTracks.map((track) => (
                  <div
                    key={track.id}
                    className={`p-4 rounded-lg border ${
                      currentTheme === 'dark'
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-white border-gray-200'
                    } hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          currentTrack?.id === track.id && isPlaying
                            ? 'bg-blue-500 text-white'
                            : currentTheme === 'dark'
                              ? 'bg-gray-700 text-gray-300'
                              : 'bg-gray-100 text-gray-600'
                        }`}>
                          <Music size={20} />
                        </div>
                        <div>
                          <h4 className="font-semibold">{track.title}</h4>
                          <p className="text-sm text-gray-500">{track.artist}</p>
                          <p className="text-xs text-gray-400">
                            时长：{Math.floor(track.duration / 60)}:{Math.floor(track.duration % 60).toString().padStart(2, '0')} • 
                            上传时间：{new Date(track.uploadedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (currentTrack?.id === track.id) {
                              dispatch({ type: 'SET_PLAYING', payload: !isPlaying });
                            } else {
                              dispatch({ type: 'SET_CURRENT_TRACK', payload: track });
                              dispatch({ type: 'SET_PLAYING', payload: true });
                            }
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            currentTheme === 'dark'
                              ? 'text-blue-400 hover:bg-gray-700'
                              : 'text-blue-600 hover:bg-blue-50'
                          }`}
                        >
                          {currentTrack?.id === track.id && isPlaying ? 
                            <Pause size={16} /> : <Play size={16} />
                          }
                        </button>
                        
                        <button
                          onClick={() => handleDeleteTrack(track.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            currentTheme === 'dark'
                              ? 'text-red-400 hover:bg-gray-700'
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {musicTracks.length === 0 && (
                  <div className={`text-center py-12 ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <Music size={48} className="mx-auto mb-4 opacity-50" />
                    <p>还没有上传音乐，点击上方按钮上传第一首音乐吧！</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 网站设置 */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">网站设置</h3>
                <button
                  onClick={handleSaveSettings}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Save size={18} />
                  保存设置
                </button>
              </div>

              <div className="grid gap-6">
                {/* 基本信息 */}
                <div className={`p-6 rounded-lg ${
                  currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'
                } border ${currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h4 className="text-lg font-semibold mb-4">基本信息</h4>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">网站名称</label>
                      <input
                        type="text"
                        value={settingsForm.siteName}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, siteName: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          currentTheme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-800'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">网站描述</label>
                      <textarea
                        value={settingsForm.siteDescription}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, siteDescription: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          currentTheme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-800'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">站长名称</label>
                      <input
                        type="text"
                        value={settingsForm.siteAuthor}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, siteAuthor: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          currentTheme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-800'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                  </div>
                </div>

                {/* 背景设置 */}
                <div className={`p-6 rounded-lg ${
                  currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'
                } border ${currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold">背景设置</h4>
                    <button
                      onClick={() => backgroundFileRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      <ImageIcon size={16} />
                      上传壁纸
                    </button>
                  </div>
                  
                  <input
                    ref={backgroundFileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundUpload}
                    className="hidden"
                  />

                  <div className="grid grid-cols-3 gap-4">
                    {/* 默认背景 */}
                    {siteSettings.backgroundImages.map((bg, index) => (
                      <div
                        key={index}
                        onClick={() => setSettingsForm(prev => ({ ...prev, currentBackground: bg }))}
                        className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                          settingsForm.currentBackground === bg
                            ? 'border-blue-500 ring-2 ring-blue-200'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <img
                          src={bg}
                          alt={`背景 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {settingsForm.currentBackground === bg && (
                          <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center">
                              ✓
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* 自定义背景 */}
                    {siteSettings.customBackgrounds.map((bg) => (
                      <div
                        key={bg.id}
                        onClick={() => setSettingsForm(prev => ({ ...prev, currentBackground: bg.url }))}
                        className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                          settingsForm.currentBackground === bg.url
                            ? 'border-blue-500 ring-2 ring-blue-200'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <img
                          src={bg.url}
                          alt={bg.name}
                          className="w-full h-full object-cover"
                        />
                        {settingsForm.currentBackground === bg.url && (
                          <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center">
                              ✓
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 社交链接 */}
                <div className={`p-6 rounded-lg ${
                  currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'
                } border ${currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h4 className="text-lg font-semibold mb-4">社交链接</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">GitHub</label>
                      <input
                        type="url"
                        value={settingsForm.github}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, github: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          currentTheme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-800'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="https://github.com/username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Bilibili</label>
                      <input
                        type="url"
                        value={settingsForm.bilibili}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, bilibili: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          currentTheme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-800'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="https://space.bilibili.com/userid"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">微信</label>
                      <input
                        type="text"
                        value={settingsForm.wechat}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, wechat: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          currentTheme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-800'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="微信号"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">QQ</label>
                      <input
                        type="text"
                        value={settingsForm.qq}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, qq: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          currentTheme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-800'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="QQ号"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Twitter</label>
                      <input
                        type="url"
                        value={settingsForm.twitter}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, twitter: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          currentTheme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-800'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="https://twitter.com/username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">邮箱</label>
                      <input
                        type="email"
                        value={settingsForm.email}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, email: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          currentTheme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-800'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                </div>

                {/* 音乐设置 */}
                <div className={`p-6 rounded-lg ${
                  currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'
                } border ${currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h4 className="text-lg font-semibold mb-4">音乐播放设置</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>启用音乐播放</span>
                      <button
                        onClick={() => setSettingsForm(prev => ({ ...prev, musicEnabled: !prev.musicEnabled }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          settingsForm.musicEnabled ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            settingsForm.musicEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    
                    {settingsForm.musicEnabled && (
                      <>
                        <div className="flex items-center justify-between">
                          <span>自动播放</span>
                          <button
                            onClick={() => setSettingsForm(prev => ({ ...prev, autoPlay: !prev.autoPlay }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                              settingsForm.autoPlay ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                settingsForm.autoPlay ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        {settingsForm.autoPlay && (
                          <div className="space-y-3 pl-4 border-l-2 border-blue-200">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="autoPlayOnPageLoad"
                                checked={settingsForm.autoPlayOnPageLoad}
                                onChange={(e) => setSettingsForm(prev => ({ ...prev, autoPlayOnPageLoad: e.target.checked }))}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <label htmlFor="autoPlayOnPageLoad" className="text-sm">打开网页时自动播放</label>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="autoPlayOnArticleOpen"
                                checked={settingsForm.autoPlayOnArticleOpen}
                                onChange={(e) => setSettingsForm(prev => ({ ...prev, autoPlayOnArticleOpen: e.target.checked }))}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <label htmlFor="autoPlayOnArticleOpen" className="text-sm">打开文章页面时自动播放</label>
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium mb-2">播放模式</label>
                          <select
                            value={settingsForm.playMode}
                            onChange={(e) => setSettingsForm(prev => ({ 
                              ...prev, 
                              playMode: e.target.value as 'sequence' | 'loop' | 'random' 
                            }))}
                            className={`w-full px-4 py-2 rounded-lg border ${
                              currentTheme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-800'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          >
                            <option value="sequence">顺序播放</option>
                            <option value="loop">单曲循环</option>
                            <option value="random">随机播放</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">默认音量 ({Math.round(settingsForm.volume * 100)}%)</label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={settingsForm.volume}
                            onChange={(e) => setSettingsForm(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 评论设置 */}
                <div className={`p-6 rounded-lg ${
                  currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'
                } border ${currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h4 className="text-lg font-semibold mb-4">评论设置</h4>
                  <div className="flex items-center justify-between">
                    <span>评论需要登录</span>
                    <button
                      onClick={() => setSettingsForm(prev => ({ ...prev, requireLoginForComments: !prev.requireLoginForComments }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        settingsForm.requireLoginForComments ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          settingsForm.requireLoginForComments ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GitHub 数据同步 */}
          {activeTab === 'github' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">数据同步</h3>
                <div className="flex items-center gap-2">
                  {lastSyncTime && (
                    <span className="text-sm text-gray-500">
                      上次同步：{new Date(lastSyncTime).toLocaleString()}
                    </span>
                  )}
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    syncStatus === 'success' ? 'bg-green-100 text-green-800' :
                    syncStatus === 'error' ? 'bg-red-100 text-red-800' :
                    syncStatus === 'syncing' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {syncStatus === 'success' ? '同步成功' :
                     syncStatus === 'error' ? '同步失败' :
                     syncStatus === 'syncing' ? '同步中...' :
                     '等待同步'}
                  </div>
                </div>
              </div>

              {/* GitHub 配置 */}
              <div className={`p-6 rounded-lg ${
                currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'
              } border ${currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h4 className="text-lg font-semibold mb-4">GitHub 配置</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">仓库所有者</label>
                    <input
                      type="text"
                      value={githubForm.owner}
                      onChange={(e) => setGithubForm(prev => ({ ...prev, owner: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        currentTheme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-800'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="用户名或组织名"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">仓库名称</label>
                    <input
                      type="text"
                      value={githubForm.repo}
                      onChange={(e) => setGithubForm(prev => ({ ...prev, repo: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        currentTheme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-800'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="仓库名称"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">分支名称</label>
                    <input
                      type="text"
                      value={githubForm.branch}
                      onChange={(e) => setGithubForm(prev => ({ ...prev, branch: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        currentTheme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-800'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="main"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">访问令牌</label>
                    <input
                      type="password"
                      value={githubForm.token}
                      onChange={(e) => setGithubForm(prev => ({ ...prev, token: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        currentTheme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-800'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="GitHub Personal Access Token"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSaveGitHubConfig}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Save size={18} />
                  保存配置
                </button>
              </div>

              {/* 同步操作 */}
              <div className={`p-6 rounded-lg ${
                currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'
              } border ${currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h4 className="text-lg font-semibold mb-4">同步操作</h4>
                <div className="flex gap-4">
                  <button
                    onClick={handleSyncToGitHub}
                    disabled={syncStatus === 'syncing' || !gitHubConfig}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      syncStatus === 'syncing' || !gitHubConfig
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600'
                    } text-white`}
                  >
                    <UploadCloud size={18} />
                    上传到 GitHub
                  </button>
                  
                  <button
                    onClick={handleSyncFromGitHub}
                    disabled={syncStatus === 'syncing' || !gitHubConfig}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      syncStatus === 'syncing' || !gitHubConfig
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600'
                    } text-white`}
                  >
                    <Download size={18} />
                    从 GitHub 下载
                  </button>
                </div>
                
                <div className={`mt-4 p-4 rounded-lg ${
                  currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <h5 className="font-medium mb-2">说明：</h5>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• 上传到 GitHub：将当前博客数据同步到 GitHub 仓库</li>
                    <li>• 从 GitHub 下载：从 GitHub 仓库恢复博客数据</li>
                    <li>• 需要先配置 GitHub 个人访问令牌，确保有仓库写入权限</li>
                    <li>• 建议定期备份数据到 GitHub，防止数据丢失</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
