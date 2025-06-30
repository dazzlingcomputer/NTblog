import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Eye, Heart, Tag, MessageCircle, Send, Copy, Check, LogIn } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useBlog } from '../contexts/BlogContext';
import { Article, Comment } from '../types';

interface ArticleDetailProps {
  article: Article;
  onBack: () => void;
  onOpenLogin?: () => void;
}

export function ArticleDetail({ article, onBack, onOpenLogin }: ArticleDetailProps) {
  const { state, dispatch } = useBlog();
  const { 
    comments, 
    currentTheme, 
    isAuthenticated, 
    currentUser, 
    siteSettings 
  } = state;
  const [liked, setLiked] = useState(false);
  const [copiedBlocks, setCopiedBlocks] = useState<Set<string>>(new Set());
  const [newComment, setNewComment] = useState({
    author: currentUser?.displayName || '',
    email: currentUser?.email || '',
    content: ''
  });

  const articleComments = comments.filter(comment => comment.articleId === article.id);

  useEffect(() => {
    // 增加浏览量
    const updatedArticle = { ...article, views: article.views + 1 };
    dispatch({ type: 'UPDATE_ARTICLE', payload: updatedArticle });
  }, [article.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLike = () => {
    if (!liked) {
      const updatedArticle = { ...article, likes: article.likes + 1 };
      dispatch({ type: 'UPDATE_ARTICLE', payload: updatedArticle });
      setLiked(true);
    }
  };

  // 复制代码块
  const copyCodeBlock = async (code: string, blockId: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedBlocks(prev => new Set(prev).add(blockId));
      setTimeout(() => {
        setCopiedBlocks(prev => {
          const newSet = new Set(prev);
          newSet.delete(blockId);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 检查是否需要登录
    if (siteSettings.requireLoginForComments && !isAuthenticated) {
      if (onOpenLogin) {
        onOpenLogin();
      } else {
        alert('请先登录后再发表评论');
      }
      return;
    }

    if (!newComment.content.trim()) {
      alert('请输入评论内容');
      return;
    }

    // 如果未登录但不要求登录，检查昵称
    if (!isAuthenticated && !newComment.author.trim()) {
      alert('请填写昵称');
      return;
    }

    const comment: Comment = {
      id: Date.now().toString(),
      articleId: article.id,
      author: isAuthenticated ? currentUser!.displayName : newComment.author.trim(),
      email: isAuthenticated ? currentUser!.email : newComment.email.trim(),
      content: newComment.content.trim(),
      createdAt: new Date().toISOString()
    };

    dispatch({ type: 'ADD_COMMENT', payload: comment });
    setNewComment({ 
      author: isAuthenticated ? currentUser!.displayName : '', 
      email: isAuthenticated ? currentUser!.email : '', 
      content: '' 
    });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
    }`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <button
          onClick={onBack}
          className={`flex items-center space-x-2 mb-8 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
            currentTheme === 'dark'
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <ArrowLeft size={20} />
          <span>返回文章列表</span>
        </button>

        {/* 文章头部 */}
        <header className="mb-8">
          {/* 封面图片 */}
          {article.coverImage && (
            <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-6">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          )}

          {/* 标题 */}
          <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${
            currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            {article.title}
          </h1>

          {/* 元信息 */}
          <div className={`flex flex-wrap items-center gap-6 text-sm ${
            currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <span className="flex items-center">
              <Calendar size={16} className="mr-2" />
              {formatDate(article.createdAt)}
            </span>
            <span className="flex items-center">
              <Eye size={16} className="mr-2" />
              {article.views} 次阅读
            </span>
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 transition-colors ${
                liked ? 'text-red-500' : ''
              } hover:text-red-500`}
            >
              <Heart size={16} className={liked ? 'fill-current' : ''} />
              <span>{article.likes}</span>
            </button>
          </div>

          {/* 标签 */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {article.tags.map(tag => (
                <span
                  key={tag}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                    currentTheme === 'dark'
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Tag size={14} className="mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* 文章内容 */}
        <article className={`prose max-w-none mb-12 ${
          currentTheme === 'dark' ? 'prose-invert' : 'prose-gray'
        }`}>
          <ReactMarkdown
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const isInline = !className?.includes('language-');
                const code = String(children).replace(/\n$/, '');
                const blockId = `${article.id}-${code.slice(0, 20)}`;
                const isCopied = copiedBlocks.has(blockId);
                
                return !isInline && match ? (
                  <div className="relative group">
                    <div className={`absolute top-2 right-2 z-10 flex items-center gap-2 ${
                      currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <span className={`text-xs px-2 py-1 rounded ${
                        currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                      }`}>
                        {match[1]}
                      </span>
                      <button
                        onClick={() => copyCodeBlock(code, blockId)}
                        className={`p-1.5 rounded transition-all hover:scale-110 opacity-0 group-hover:opacity-100 ${
                          isCopied
                            ? 'bg-green-500 text-white'
                            : currentTheme === 'dark'
                              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                        }`}
                        title={isCopied ? '已复制!' : '复制代码'}
                      >
                        {isCopied ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <SyntaxHighlighter
                      style={currentTheme === 'dark' ? oneDark : oneLight}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {code}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {article.content}
          </ReactMarkdown>
        </article>

        {/* 评论区 */}
        <section className={`border-t pt-8 ${
          currentTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h3 className={`text-2xl font-bold mb-6 flex items-center ${
            currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            <MessageCircle size={24} className="mr-2" />
            评论 ({articleComments.length})
          </h3>

          {/* 评论表单 */}
          {siteSettings.requireLoginForComments && !isAuthenticated ? (
            <div className={`mb-8 p-6 rounded-xl text-center ${
              currentTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <LogIn size={48} className={`mx-auto mb-4 ${
                currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <h4 className={`text-lg font-semibold mb-2 ${
                currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                登录后参与讨论
              </h4>
              <p className={`mb-4 ${
                currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                请登录后发表评论，与其他读者分享你的看法
              </p>
              <button
                onClick={onOpenLogin}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                立即登录
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitComment} className={`mb-8 p-6 rounded-xl ${
              currentTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              {!isAuthenticated && (
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="昵称 *"
                    value={newComment.author}
                    onChange={(e) => setNewComment({ ...newComment, author: e.target.value })}
                    className={`px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      currentTheme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                    }`}
                    required
                  />
                  <input
                    type="email"
                    placeholder="邮箱（可选）"
                    value={newComment.email}
                    onChange={(e) => setNewComment({ ...newComment, email: e.target.value })}
                    className={`px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      currentTheme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                    }`}
                  />
                </div>
              )}
              
              {isAuthenticated && (
                <div className={`mb-4 p-3 rounded-lg ${
                  currentTheme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'
                }`}>
                  <span className={`text-sm ${
                    currentTheme === 'dark' ? 'text-gray-300' : 'text-blue-700'
                  }`}>
                    以 <strong>{currentUser?.displayName}</strong> 的身份发表评论
                  </span>
                </div>
              )}
              
              <textarea
                placeholder="写下你的评论... *"
                value={newComment.content}
                onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                rows={4}
                className={`w-full px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  currentTheme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                }`}
                required
              />
              <button
                type="submit"
                className="mt-4 flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all hover:scale-105"
              >
                <Send size={16} />
                <span>发布评论</span>
              </button>
            </form>
          )}

          {/* 评论列表 */}
          <div className="space-y-6">
            {articleComments.length === 0 ? (
              <p className={`text-center py-8 ${
                currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                暂无评论，快来抢沙发吧！
              </p>
            ) : (
              articleComments.map(comment => (
                <div
                  key={comment.id}
                  className={`p-4 rounded-xl transition-colors ${
                    currentTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-semibold ${
                      currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}>
                      {comment.author}
                    </h4>
                    <time className={`text-sm ${
                      currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {formatDate(comment.createdAt)}
                    </time>
                  </div>
                  <p className={`${
                    currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {comment.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
