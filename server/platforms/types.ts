// Platform provider interface for social media integrations
export interface PlatformProvider {
  platform: string;
  
  // OAuth flow
  getAuthUrl(userId: string, redirectUri: string): string;
  handleCallback(code: string, state: string): Promise<OAuthTokens>;
  refreshToken(refreshToken: string): Promise<OAuthTokens>;
  
  // Publishing
  publishPost(accessToken: string, content: PublishContent): Promise<PublishResult>;
  
  // Account info
  getAccountInfo(accessToken: string): Promise<AccountInfo>;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number; // seconds until expiration
  tokenType?: string;
}

export interface PublishContent {
  text: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface PublishResult {
  success: boolean;
  postId?: string;
  platformUrl?: string;
  error?: string;
}

export interface AccountInfo {
  id: string;
  username: string;
  displayName?: string;
  profileUrl?: string;
}

export type PlatformName = 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'youtube' | 'tiktok';
