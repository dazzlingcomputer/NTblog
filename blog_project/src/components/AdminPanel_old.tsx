import React, { useState } from 'react';
import { X, Plus, Edit, Trash2, Eye, EyeOff, Settings, Save, Upload, LogOut } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import { useBlog } from '../contexts/BlogContext';
import { Article } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const { state, dispatch } = useBlog();
  const { articles, siteSettings, currentTheme, isAuthenticated } = state;
  const [activeTab, setActiveTab] = useState<'articles' | 'settings'>('articles');
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newPassword, setNewPassword] = useState('');

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
    email: siteSettings.socialLinks.email || ''
  });

  if (!isOpen || !isAuthenticated) return null;

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

  const handleSaveSettings = () => {
    const socialLinks = {
      github: settingsForm.github.trim() || undefined,
      twitter: settingsForm.twitter.trim() || undefined,
      weibo: settingsForm.weibo.trim() || undefined,
      email: settingsForm.email.trim() || undefined
    };

    dispatch({
      type: 'UPDATE_SITE_SETTINGS',
      payload: {
        siteName: settingsForm.siteName.trim(),
        siteDescription: settingsForm.siteDescription.trim(),
        siteAuthor: settingsForm.siteAuthor.trim(),
        currentBackground: settingsForm.currentBackground,
        socialLinks
      }
    });

    alert('设置已保存！');
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
        } border-r ${currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
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
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'articles'
                  ? 'bg-blue-500 text-white'
                  : currentTheme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              文章管理
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'settings'
                  ? 'bg-blue-500 text-white'
                  : currentTheme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              网站设置
            </button>
          </nav>

          <button
            onClick={handleLogout}
            className={`w-full mt-8 flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
              currentTheme === 'dark'
                ? 'text-red-400 hover:bg-gray-700'
                : 'text-red-600 hover:bg-gray-100'
            }`}
          >
            <LogOut size={16} />
            <span>退出登录</span>
          </button>
        </div>

        {/* 主内容区 */}
        <div className="flex-1 overflow-auto">
          {activeTab === 'articles' && (
            <div className="p-6">
              {/* 文章管理头部 */}
              {!isCreating && !editingArticle && (
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold">文章管理</h3>
                  <button
                    onClick={handleCreateArticle}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Plus size={16} />
                    <span>新建文章</span>
                  </button>
                </div>
              )}

              {/* 文章列表 */}
              {!isCreating && !editingArticle && (
                <div className="space-y-4">
                  {articles.map(article => (
                    <div
                      key={article.id}
                      className={`p-4 rounded-lg border ${
                        currentTheme === 'dark'
                          ? 'bg-gray-800 border-gray-700'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className={`text-lg font-semibold mb-2 ${
                            currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
                          }`}>
                            {article.title}
                          </h4>
                          <p className={`text-sm mb-2 ${
                            currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {article.summary}
                          </p>
                          <div className="flex items-center space-x-4 text-xs">
                            <span className={`flex items-center ${
                              article.published ? 'text-green-500' : 'text-yellow-500'
                            }`}>
                              {article.published ? <Eye size={12} /> : <EyeOff size={12} />}
                              <span className="ml-1">
                                {article.published ? '已发布' : '草稿'}
                              </span>
                            </span>
                            <span className={currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                              {new Date(article.createdAt).toLocaleDateString('zh-CN')}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
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
                </div>
              )}

              {/* 文章编辑器 */}
              {(isCreating || editingArticle) && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">
                      {isCreating ? '新建文章' : '编辑文章'}
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveArticle}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <Save size={16} />
                        <span>保存</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsCreating(false);
                          setEditingArticle(null);
                        }}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          currentTheme === 'dark'
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        取消
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* 基本信息 */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          文章标题 *
                        </label>
                        <input
                          type="text"
                          value={articleForm.title}
                          onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            currentTheme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-800'
                          }`}
                          placeholder="请输入文章标题"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          标签（用逗号分隔）
                        </label>
                        <input
                          type="text"
                          value={articleForm.tags}
                          onChange={(e) => setArticleForm({ ...articleForm, tags: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            currentTheme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-800'
                          }`}
                          placeholder="技术, 生活, 随笔"
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        文章摘要
                      </label>
                      <textarea
                        value={articleForm.summary}
                        onChange={(e) => setArticleForm({ ...articleForm, summary: e.target.value })}
                        rows={3}
                        className={`w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                          currentTheme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-800'
                        }`}
                        placeholder="请输入文章摘要（留空将自动生成）"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        封面图片 URL
                      </label>
                      <input
                        type="url"
                        value={articleForm.coverImage}
                        onChange={(e) => setArticleForm({ ...articleForm, coverImage: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          currentTheme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-800'
                        }`}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="published"
                        checked={articleForm.published}
                        onChange={(e) => setArticleForm({ ...articleForm, published: e.target.checked })}
                        className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="published" className={`text-sm ${
                        currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        立即发布
                      </label>
                    </div>

                    {/* Markdown 编辑器 */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        文章内容 *
                      </label>
                      <div data-color-mode={currentTheme}>
                        <MDEditor
                          value={articleForm.content}
                          onChange={(val) => setArticleForm({ ...articleForm, content: val || '' })}
                          height={500}
                          preview="edit"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-6 max-w-2xl">
              <h3 className="text-2xl font-bold mb-6">网站设置</h3>

              <div className="space-y-6">
                {/* 基本信息 */}
                <div>
                  <h4 className={`text-lg font-semibold mb-4 ${
                    currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    基本信息
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        网站名称
                      </label>
                      <input
                        type="text"
                        value={settingsForm.siteName}
                        onChange={(e) => setSettingsForm({ ...settingsForm, siteName: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          currentTheme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-800'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        网站描述
                      </label>
                      <input
                        type="text"
                        value={settingsForm.siteDescription}
                        onChange={(e) => setSettingsForm({ ...settingsForm, siteDescription: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          currentTheme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-800'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        站长昵称
                      </label>
                      <input
                        type="text"
                        value={settingsForm.siteAuthor}
                        onChange={(e) => setSettingsForm({ ...settingsForm, siteAuthor: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          currentTheme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-800'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* 背景设置 */}
                <div>
                  <h4 className={`text-lg font-semibold mb-4 ${
                    currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    背景设置
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {siteSettings.backgroundImages.map((image, index) => (
                      <div
                        key={index}
                        className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-colors ${
                          settingsForm.currentBackground === image
                            ? 'border-blue-500'
                            : currentTheme === 'dark'
                              ? 'border-gray-600'
                              : 'border-gray-300'
                        }`}
                        onClick={() => setSettingsForm({ ...settingsForm, currentBackground: image })}
                      >
                        <img
                          src={image}
                          alt={`背景 ${index + 1}`}
                          className="w-full h-24 object-cover"
                        />
                        {settingsForm.currentBackground === image && (
                          <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                            <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                              当前使用
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 社交链接 */}
                <div>
                  <h4 className={`text-lg font-semibold mb-4 ${
                    currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    社交链接
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        GitHub
                      </label>
                      <input
                        type="url"
                        value={settingsForm.github}
                        onChange={(e) => setSettingsForm({ ...settingsForm, github: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          currentTheme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-800'
                        }`}
                        placeholder="https://github.com/username"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Twitter
                      </label>
                      <input
                        type="url"
                        value={settingsForm.twitter}
                        onChange={(e) => setSettingsForm({ ...settingsForm, twitter: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          currentTheme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-800'
                        }`}
                        placeholder="https://twitter.com/username"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        微博
                      </label>
                      <input
                        type="url"
                        value={settingsForm.weibo}
                        onChange={(e) => setSettingsForm({ ...settingsForm, weibo: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          currentTheme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-800'
                        }`}
                        placeholder="https://weibo.com/username"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        邮箱
                      </label>
                      <input
                        type="email"
                        value={settingsForm.email}
                        onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          currentTheme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-800'
                        }`}
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                </div>

                {/* 保存按钮 */}
                <button
                  onClick={handleSaveSettings}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Save size={16} />
                  <span>保存设置</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
