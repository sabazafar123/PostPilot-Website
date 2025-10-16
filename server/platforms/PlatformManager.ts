import type { PlatformProvider, PlatformName } from "./types";
import { MockProvider } from "./MockProvider";

// Central registry for all platform providers
class PlatformManager {
  private providers: Map<PlatformName, PlatformProvider> = new Map();
  private mockMode: boolean;

  constructor() {
    // Check if we're in mock mode (default: true until real credentials are added)
    this.mockMode = process.env.SOCIAL_MOCK_MODE !== 'false';
    this.initializeProviders();
  }

  private initializeProviders() {
    const platforms: PlatformName[] = ['facebook', 'instagram', 'linkedin', 'twitter', 'youtube', 'tiktok'];
    
    if (this.mockMode) {
      // Use mock providers for all platforms
      console.log('[Platform Manager] Running in MOCK MODE - using simulated OAuth and publishing');
      platforms.forEach(platform => {
        this.providers.set(platform, new MockProvider(platform));
      });
    } else {
      // TODO: Initialize real providers when credentials are available
      // Example:
      // this.providers.set('twitter', new TwitterProvider({
      //   clientId: process.env.TWITTER_CLIENT_ID,
      //   clientSecret: process.env.TWITTER_CLIENT_SECRET,
      // }));
      
      console.log('[Platform Manager] Real mode enabled but no providers configured');
      // Fallback to mock for unconfigured platforms
      platforms.forEach(platform => {
        if (!this.providers.has(platform)) {
          this.providers.set(platform, new MockProvider(platform));
        }
      });
    }
  }

  getProvider(platform: PlatformName): PlatformProvider {
    const provider = this.providers.get(platform);
    if (!provider) {
      throw new Error(`No provider found for platform: ${platform}`);
    }
    return provider;
  }

  isMockMode(): boolean {
    return this.mockMode;
  }

  getSupportedPlatforms(): PlatformName[] {
    return Array.from(this.providers.keys());
  }
}

// Singleton instance
export const platformManager = new PlatformManager();
