import type { PlatformProvider, OAuthTokens, PublishContent, PublishResult, AccountInfo, PlatformName } from "./types";
import { nanoid } from "nanoid";

// Mock provider for testing without real API credentials
export class MockProvider implements PlatformProvider {
  constructor(public platform: PlatformName) {}

  getAuthUrl(userId: string, redirectUri: string): string {
    // Simulate OAuth URL - in mock mode this redirects back immediately with a fake code
    const state = Buffer.from(JSON.stringify({ userId, platform: this.platform })).toString('base64');
    return `/api/social/mock-callback?code=${nanoid()}&state=${state}`;
  }

  async handleCallback(code: string, state: string): Promise<OAuthTokens> {
    // Simulate successful OAuth exchange
    return {
      accessToken: `mock_access_${this.platform}_${nanoid()}`,
      refreshToken: `mock_refresh_${this.platform}_${nanoid()}`,
      expiresIn: 3600 * 24 * 60, // 60 days
      tokenType: 'Bearer',
    };
  }

  async refreshToken(refreshToken: string): Promise<OAuthTokens> {
    // Simulate token refresh
    return {
      accessToken: `mock_access_${this.platform}_${nanoid()}`,
      refreshToken,
      expiresIn: 3600 * 24 * 60,
      tokenType: 'Bearer',
    };
  }

  async publishPost(accessToken: string, content: PublishContent): Promise<PublishResult> {
    // Simulate successful post publication
    console.log(`[MOCK ${this.platform.toUpperCase()}] Publishing post:`, content.text.substring(0, 50) + '...');
    
    return {
      success: true,
      postId: `mock_post_${nanoid()}`,
      platformUrl: `https://${this.platform}.com/posts/mock_${nanoid()}`,
    };
  }

  async getAccountInfo(accessToken: string): Promise<AccountInfo> {
    // Simulate account info retrieval
    const platformNames: Record<PlatformName, string> = {
      facebook: 'Facebook',
      instagram: 'Instagram',
      linkedin: 'LinkedIn',
      twitter: 'X (Twitter)',
      youtube: 'YouTube',
      tiktok: 'TikTok',
    };

    return {
      id: `mock_user_${nanoid(8)}`,
      username: `test_${this.platform}_user`,
      displayName: `Test ${platformNames[this.platform]} Account`,
      profileUrl: `https://${this.platform}.com/test_user`,
    };
  }
}
