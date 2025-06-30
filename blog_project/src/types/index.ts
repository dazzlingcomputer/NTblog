export interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  published: boolean;
  coverImage?: string;
}

export interface Comment {
  id: string;
  articleId: string;
  author: string;
  email: string;
  content: string;
  createdAt: string;
  avatar?: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  displayName: string;
  email: string;
  bio: string;
  avatar?: string;
  role: 'admin' | 'user';
  createdAt: string;
  isActive: boolean;
}

export interface RegisterUser {
  username: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  email: string;
  captcha: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  captcha: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: number;
  uploadedAt: string;
}

export interface MusicSettings {
  isEnabled: boolean;
  autoPlay: boolean;
  autoPlayConditions: ('onPageLoad' | 'onArticleOpen')[];
  playMode: 'sequence' | 'loop' | 'random';
  volume: number;
}

export interface CustomBackground {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteAuthor: string;
  backgroundImages: string[];
  customBackgrounds: CustomBackground[];
  currentBackground: string;
  theme: 'light' | 'dark' | 'auto';
  socialLinks: {
    github?: string;
    twitter?: string;
    weibo?: string;
    email?: string;
    bilibili?: string;
    wechat?: string;
    qq?: string;
  };
  socialLinksEnabled: {
    github: boolean;
    twitter: boolean;
    weibo: boolean;
    email: boolean;
    bilibili: boolean;
    wechat: boolean;
    qq: boolean;
  };
  articlesPerPage: number;
  musicSettings: MusicSettings;
  enableComments: boolean;
  requireLoginForComments: boolean;
}

export interface GitHubConfig {
  owner: string;
  repo: string;
  token: string;
  branch: string;
}

export interface CaptchaChallenge {
  id: string;
  question: string;
  answer: string;
}

export interface BlogState {
  articles: Article[];
  comments: Comment[];
  users: User[];
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdminMode: boolean;
  siteSettings: SiteSettings;
  currentTheme: 'light' | 'dark';
  musicTracks: MusicTrack[];
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  gitHubConfig: GitHubConfig | null;
  lastSyncTime: string | null;
}