import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { BlogState, Article, Comment, SiteSettings, User, MusicTrack, RegisterUser, LoginCredentials, CaptchaChallenge } from '../types';
import { hashPassword } from '../lib/crypto';

// 初始状态
const initialState: BlogState = {
  articles: [],
  comments: [],
  users: [],
  currentUser: null,
  isAuthenticated: false,
  isAdminMode: false,
  siteSettings: {
    siteName: 'xdazzl 的个人博客',
    siteDescription: '分享技术，记录生活',
    siteAuthor: 'xdazzl',
    backgroundImages: [
      '/images/anime_bg_1.jpeg',
      '/images/anime_bg_2.jpg',
      '/images/anime_bg_3.jpg'
    ],
    customBackgrounds: [],
    currentBackground: '/images/anime_bg_1.jpeg',
    theme: 'auto',
    socialLinks: {
      github: 'https://github.com/xdazzl',
      twitter: 'https://twitter.com/xdazzl',
      weibo: 'https://weibo.com/xdazzl',
      email: 'xdazzl@example.com',
      bilibili: '',
      wechat: '',
      qq: ''
    },
    socialLinksEnabled: {
      github: true,
      twitter: true,
      weibo: true,
      email: true,
      bilibili: false,
      wechat: false,
      qq: false
    },
    articlesPerPage: 6,
    musicSettings: {
      isEnabled: false,
      autoPlay: false,
      autoPlayConditions: [],
      playMode: 'sequence',
      volume: 0.7
    },
    enableComments: true,
    requireLoginForComments: true
  },
  currentTheme: 'light',
  musicTracks: [],
  currentTrack: null,
  isPlaying: false,
  gitHubConfig: null,
  lastSyncTime: null
};

// Action 类型
type BlogAction =
  | { type: 'SET_ARTICLES'; payload: Article[] }
  | { type: 'ADD_ARTICLE'; payload: Article }
  | { type: 'UPDATE_ARTICLE'; payload: Article }
  | { type: 'DELETE_ARTICLE'; payload: string }
  | { type: 'ADD_COMMENT'; payload: Comment }
  | { type: 'SET_COMMENTS'; payload: Comment[] }
  | { type: 'DELETE_COMMENT'; payload: string }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER_USER'; payload: User }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'SET_ADMIN_MODE'; payload: boolean }
  | { type: 'UPDATE_SITE_SETTINGS'; payload: Partial<SiteSettings> }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_MUSIC_TRACKS'; payload: MusicTrack[] }
  | { type: 'ADD_MUSIC_TRACK'; payload: MusicTrack }
  | { type: 'DELETE_MUSIC_TRACK'; payload: string }
  | { type: 'SET_CURRENT_TRACK'; payload: MusicTrack | null }
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_GITHUB_CONFIG'; payload: any }
  | { type: 'SET_LAST_SYNC_TIME'; payload: string }
  | { type: 'LOAD_DATA'; payload: Partial<BlogState> };

// Reducer
function blogReducer(state: BlogState, action: BlogAction): BlogState {
  switch (action.type) {
    case 'SET_ARTICLES':
      return { ...state, articles: action.payload };
    
    case 'ADD_ARTICLE':
      const newArticles = [action.payload, ...state.articles];
      return { ...state, articles: newArticles };
    
    case 'UPDATE_ARTICLE':
      return {
        ...state,
        articles: state.articles.map(article =>
          article.id === action.payload.id ? action.payload : article
        )
      };
    
    case 'DELETE_ARTICLE':
      return {
        ...state,
        articles: state.articles.filter(article => article.id !== action.payload)
      };
    
    case 'ADD_COMMENT':
      return { ...state, comments: [...state.comments, action.payload] };
    
    case 'SET_COMMENTS':
      return { ...state, comments: action.payload };
    
    case 'LOGIN':
      return { 
        ...state, 
        currentUser: action.payload, 
        isAuthenticated: true,
        isAdminMode: action.payload.role === 'admin'
      };
    
    case 'LOGOUT':
      return { 
        ...state, 
        currentUser: null, 
        isAuthenticated: false,
        isAdminMode: false
      };

    case 'REGISTER_USER':
      return { 
        ...state, 
        users: [...state.users, action.payload]
      };

    case 'SET_USERS':
      return { ...state, users: action.payload };

    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? action.payload : user
        ),
        currentUser: state.currentUser?.id === action.payload.id ? action.payload : state.currentUser
      };

    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload)
      };

    case 'SET_ADMIN_MODE':
      return { ...state, isAdminMode: action.payload };

    case 'DELETE_COMMENT':
      return {
        ...state,
        comments: state.comments.filter(comment => comment.id !== action.payload)
      };
    
    case 'UPDATE_SITE_SETTINGS':
      return {
        ...state,
        siteSettings: { ...state.siteSettings, ...action.payload }
      };
    
    case 'SET_THEME':
      return { ...state, currentTheme: action.payload };
    
    case 'TOGGLE_THEME':
      return {
        ...state,
        currentTheme: state.currentTheme === 'light' ? 'dark' : 'light'
      };
    
    case 'SET_MUSIC_TRACKS':
      return { ...state, musicTracks: action.payload };

    case 'ADD_MUSIC_TRACK':
      return { ...state, musicTracks: [...state.musicTracks, action.payload] };

    case 'DELETE_MUSIC_TRACK':
      return {
        ...state,
        musicTracks: state.musicTracks.filter(track => track.id !== action.payload),
        currentTrack: state.currentTrack?.id === action.payload ? null : state.currentTrack
      };

    case 'SET_CURRENT_TRACK':
      return { ...state, currentTrack: action.payload };

    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };

    case 'SET_GITHUB_CONFIG':
      return { ...state, gitHubConfig: action.payload };

    case 'SET_LAST_SYNC_TIME':
      return { ...state, lastSyncTime: action.payload };

    case 'LOAD_DATA':
      return { ...state, ...action.payload };
    
    default:
      return state;
  }
}

// Context
const BlogContext = createContext<{
  state: BlogState;
  dispatch: React.Dispatch<BlogAction>;
}>({
  state: initialState,
  dispatch: () => null
});

// Provider
export function BlogProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(blogReducer, initialState);

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = localStorage.getItem('blog-data');
        if (savedData) {
          const data = JSON.parse(savedData);
          
          // 迁移明文密码到哈希密码
          if (data.users) {
            const migratedUsers = await Promise.all(
              data.users.map(async (user: User) => {
                // 检查密码是否已经是哈希格式（哈希长度为64字符）
                if (user.password.length !== 64) {
                  const hashedPassword = await hashPassword(user.password);
                  return { ...user, password: hashedPassword };
                }
                return user;
              })
            );
            data.users = migratedUsers;
          }
          
          dispatch({ type: 'LOAD_DATA', payload: data });
        } else {
          // 初始化示例数据
          const defaultPassword = await hashPassword('czl737476534?!');
          const initialUsers: User[] = [
            {
              id: 'admin-1',
              username: 'xdazzl',
              password: defaultPassword,
              displayName: 'xdazzl',
              email: 'xdazzl@example.com',
              bio: '一个热爱技术的博主',
              role: 'admin',
              createdAt: '2025-06-28T08:00:00.000Z',
              isActive: true
            }
          ];

          const initialArticles: Article[] = [
            {
              id: '1',
              title: '欢迎来到我的博客',
              content: `# 欢迎来到我的个人博客

这是我的第一篇博客文章。在这里，我将分享我的技术学习心得、生活感悟和一些有趣的发现。

## 关于这个博客

这个博客使用现代前端技术构建，具有以下特色：

- 🎨 **美观的界面设计** - 采用二次元风格背景，支持亮色/暗色主题切换
- 📝 **富文本编辑器** - 支持 Markdown 语法，代码高亮
- 💬 **评论系统** - 可以与访客互动交流
- 📱 **响应式设计** - 完美适配移动端和桌面端
- ⚡ **性能优化** - 图片懒加载，流畅的动画效果
- 🎵 **音乐播放** - 支持背景音乐播放

## 技术栈

- React 18 + TypeScript
- Tailwind CSS
- Markdown 编辑器
- GitHub 数据同步

欢迎大家在评论区与我交流！`,
              summary: '欢迎来到我的个人博客！这里将分享技术心得和生活感悟。',
              tags: ['欢迎', '博客', '介绍'],
              createdAt: '2025-06-28T08:57:13.000Z',
              updatedAt: '2025-06-28T08:57:13.000Z',
              views: 0,
              likes: 0,
              published: true,
              coverImage: '/images/anime_bg_1.jpeg'
            }
          ];
          
          const initialComments: Comment[] = [
            {
              id: '1',
              articleId: '1',
              author: '访客',
              email: 'visitor@example.com',
              content: '欢迎开通博客！界面很漂亮呢～',
              createdAt: '2025-06-28T09:00:00.000Z'
            }
          ];

          dispatch({ type: 'SET_USERS', payload: initialUsers });
          dispatch({ type: 'SET_ARTICLES', payload: initialArticles });
          dispatch({ type: 'SET_COMMENTS', payload: initialComments });
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, []);

  // 自动保存数据
  useEffect(() => {
    const saveData = () => {
      try {
        const dataToSave = {
          articles: state.articles,
          comments: state.comments,
          users: state.users,
          siteSettings: state.siteSettings,
          musicTracks: state.musicTracks,
          gitHubConfig: state.gitHubConfig,
          lastSyncTime: state.lastSyncTime
        };
        localStorage.setItem('blog-data', JSON.stringify(dataToSave));
      } catch (error) {
        console.error('Failed to save data:', error);
      }
    };

    saveData();
  }, [state.articles, state.comments, state.users, state.siteSettings, state.musicTracks, state.gitHubConfig, state.lastSyncTime]);

  // 主题检测
  useEffect(() => {
    const detectTheme = () => {
      if (state.siteSettings.theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        dispatch({ type: 'SET_THEME', payload: prefersDark ? 'dark' : 'light' });
      } else {
        dispatch({ type: 'SET_THEME', payload: state.siteSettings.theme });
      }
    };

    detectTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', detectTheme);

    return () => mediaQuery.removeEventListener('change', detectTheme);
  }, [state.siteSettings.theme]);

  return (
    <BlogContext.Provider value={{ state, dispatch }}>
      {children}
    </BlogContext.Provider>
  );
}

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};
