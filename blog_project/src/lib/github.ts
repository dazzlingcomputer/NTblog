import { GitHubConfig, Article, Comment, SiteSettings, User, MusicTrack } from '../types';

export interface GitHubData {
  articles: Article[];
  comments: Comment[];
  users: User[];
  siteSettings: SiteSettings;
  musicTracks: MusicTrack[];
  lastUpdated: string;
}

export class GitHubSync {
  private config: GitHubConfig;

  constructor(config: GitHubConfig) {
    this.config = config;
  }

  private async apiRequest(path: string, options: RequestInit = {}) {
    const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/${path}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `token ${this.config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async checkFileExists(filePath: string): Promise<boolean> {
    try {
      await this.apiRequest(`contents/${filePath}?ref=${this.config.branch}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getFile(filePath: string): Promise<any> {
    try {
      const response = await this.apiRequest(`contents/${filePath}?ref=${this.config.branch}`);
      const content = atob(response.content.replace(/\s/g, ''));
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to get file from GitHub:', error);
      return null;
    }
  }

  async saveFile(filePath: string, data: any, message: string): Promise<void> {
    const content = btoa(JSON.stringify(data, null, 2));
    
    // Check if file exists to get SHA
    let sha: string | undefined;
    try {
      const existingFile = await this.apiRequest(`contents/${filePath}?ref=${this.config.branch}`);
      sha = existingFile.sha;
    } catch (error) {
      // File doesn't exist, no SHA needed
    }

    await this.apiRequest(`contents/${filePath}`, {
      method: 'PUT',
      body: JSON.stringify({
        message,
        content,
        branch: this.config.branch,
        ...(sha && { sha }),
      }),
    });
  }

  async syncToGitHub(data: GitHubData): Promise<void> {
    const timestamp = new Date().toISOString();
    const dataWithTimestamp = {
      ...data,
      lastUpdated: timestamp,
    };

    await this.saveFile(
      'blog-data.json',
      dataWithTimestamp,
      `Update blog data - ${timestamp}`
    );
  }

  async syncFromGitHub(): Promise<GitHubData | null> {
    return await this.getFile('blog-data.json');
  }

  async uploadImage(file: File, fileName: string): Promise<string> {
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const content = reader.result as string;
          const base64Content = content.split(',')[1]; // Remove data:image/... prefix
          
          const filePath = `images/${fileName}`;
          
          await this.apiRequest(`contents/${filePath}`, {
            method: 'PUT',
            body: JSON.stringify({
              message: `Upload image: ${fileName}`,
              content: base64Content,
              branch: this.config.branch,
            }),
          });
          
          // Return the raw URL for the uploaded image
          const rawUrl = `https://raw.githubusercontent.com/${this.config.owner}/${this.config.repo}/${this.config.branch}/${filePath}`;
          resolve(rawUrl);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  async uploadAudio(file: File, fileName: string): Promise<string> {
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const content = reader.result as string;
          const base64Content = content.split(',')[1]; // Remove data:audio/... prefix
          
          const filePath = `music/${fileName}`;
          
          await this.apiRequest(`contents/${filePath}`, {
            method: 'PUT',
            body: JSON.stringify({
              message: `Upload audio: ${fileName}`,
              content: base64Content,
              branch: this.config.branch,
            }),
          });
          
          // Return the raw URL for the uploaded audio
          const rawUrl = `https://raw.githubusercontent.com/${this.config.owner}/${this.config.repo}/${this.config.branch}/${filePath}`;
          resolve(rawUrl);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }
}

// 创建单例实例
let gitHubSyncInstance: GitHubSync | null = null;

export function createGitHubSync(config: GitHubConfig): GitHubSync {
  gitHubSyncInstance = new GitHubSync(config);
  return gitHubSyncInstance;
}

export function getGitHubSync(): GitHubSync | null {
  return gitHubSyncInstance;
}
