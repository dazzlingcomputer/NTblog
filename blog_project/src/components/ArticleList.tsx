import React, { useState, useMemo } from 'react';
import { Calendar, Eye, Heart, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBlog } from '../contexts/BlogContext';
import { Article } from '../types';

interface ArticleListProps {
  onSelectArticle: (article: Article) => void;
}

export function ArticleList({ onSelectArticle }: ArticleListProps) {
  const { state } = useBlog();
  const { articles, siteSettings, currentTheme } = state;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // 过滤已发布的文章
  const publishedArticles = articles.filter(article => article.published);

  // 标签过滤
  const filteredArticles = selectedTag
    ? publishedArticles.filter(article => article.tags.includes(selectedTag))
    : publishedArticles;

  // 分页
  const articlesPerPage = siteSettings.articlesPerPage;
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage;
  const currentArticles = filteredArticles.slice(startIndex, startIndex + articlesPerPage);

  // 获取所有标签
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    publishedArticles.forEach(article => {
      article.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [publishedArticles]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleTagFilter = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
    setCurrentPage(1);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
    }`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 标签过滤器 */}
        {allTags.length > 0 && (
          <div className="mb-8">
            <h3 className={`text-lg font-semibold mb-4 ${
              currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              标签筛选
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleTagFilter('')}
                className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                  !selectedTag
                    ? currentTheme === 'dark'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : currentTheme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                全部
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagFilter(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                    selectedTag === tag
                      ? currentTheme === 'dark'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : currentTheme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 文章列表 */}
        {currentArticles.length === 0 ? (
          <div className={`text-center py-16 ${
            currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <p className="text-xl">暂无文章</p>
            <p className="mt-2">敬请期待更多内容～</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {currentArticles.map(article => (
              <article
                key={article.id}
                className={`group cursor-pointer rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  currentTheme === 'dark'
                    ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700'
                    : 'bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg'
                }`}
                onClick={() => onSelectArticle(article)}
              >
                {/* 封面图片 */}
                {article.coverImage && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                )}

                <div className="p-6">
                  {/* 标题 */}
                  <h2 className={`text-xl font-bold mb-3 line-clamp-2 group-hover:text-blue-500 transition-colors ${
                    currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    {article.title}
                  </h2>

                  {/* 摘要 */}
                  <p className={`text-sm mb-4 line-clamp-3 ${
                    currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {article.summary}
                  </p>

                  {/* 标签 */}
                  {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags.map(tag => (
                        <span
                          key={tag}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            currentTheme === 'dark'
                              ? 'bg-gray-700 text-gray-300'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <Tag size={12} className="mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 元信息 */}
                  <div className={`flex items-center justify-between text-xs ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Calendar size={12} className="mr-1" />
                        {formatDate(article.createdAt)}
                      </span>
                      <span className="flex items-center">
                        <Eye size={12} className="mr-1" />
                        {article.views}
                      </span>
                      <span className="flex items-center">
                        <Heart size={12} className="mr-1" />
                        {article.likes}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-12">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 ${
                currentPage === 1
                  ? currentTheme === 'dark'
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 cursor-not-allowed'
                  : currentTheme === 'dark'
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft size={20} className="mr-1" />
              上一页
            </button>

            <div className="flex space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg transition-all duration-300 ${
                    currentPage === page
                      ? currentTheme === 'dark'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : currentTheme === 'dark'
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 ${
                currentPage === totalPages
                  ? currentTheme === 'dark'
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 cursor-not-allowed'
                  : currentTheme === 'dark'
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              下一页
              <ChevronRight size={20} className="ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
