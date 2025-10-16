import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { insertConnectedAccountSchema, insertPostSchema } from "@shared/schema";
import Stripe from "stripe";
import OpenAI from "openai";
import { platformManager } from "./platforms/PlatformManager";
import type { PlatformName } from "./platforms/types";

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-09-30.clover",
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get("/api/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/logout", isAuthenticated, (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  // Connected Accounts
  app.get("/api/connected-accounts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const accounts = await storage.getConnectedAccountsByUser(userId);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching connected accounts:", error);
      res.status(500).json({ message: "Failed to fetch connected accounts" });
    }
  });

  app.post("/api/connected-accounts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertConnectedAccountSchema.parse({
        ...req.body,
        userId,
        isConnected: true,
      });
      const account = await storage.createConnectedAccount(data);
      res.json(account);
    } catch (error) {
      console.error("Error creating connected account:", error);
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Social Media OAuth
  app.get("/api/social/connect/:platform", isAuthenticated, async (req: any, res) => {
    try {
      const platform = req.params.platform as PlatformName;
      const userId = req.user.claims.sub;
      const redirectUri = `${req.protocol}://${req.get('host')}/api/social/callback/${platform}`;
      
      const provider = platformManager.getProvider(platform);
      const authUrl = provider.getAuthUrl(userId, redirectUri);
      
      res.json({ url: authUrl, isMock: platformManager.isMockMode() });
    } catch (error) {
      console.error("Error initiating OAuth:", error);
      res.status(500).json({ message: "Failed to initiate OAuth" });
    }
  });

  app.get("/api/social/callback/:platform", async (req: any, res) => {
    try {
      const platform = req.params.platform as PlatformName;
      const { code, state } = req.query;
      
      if (!code || !state) {
        return res.status(400).send("Missing OAuth parameters");
      }

      const provider = platformManager.getProvider(platform);
      const tokens = await provider.handleCallback(code as string, state as string);
      const accountInfo = await provider.getAccountInfo(tokens.accessToken);
      
      // Parse state to get userId
      const stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
      const userId = stateData.userId;
      
      // Store the connection
      const expiresAt = tokens.expiresIn ? new Date(Date.now() + tokens.expiresIn * 1000) : null;
      await storage.createConnectedAccount({
        userId,
        platform,
        accountName: accountInfo.displayName || accountInfo.username,
        accountId: accountInfo.id,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: expiresAt,
        isConnected: true,
      });

      // Redirect back to dashboard
      res.redirect('/dashboard?connected=' + platform);
    } catch (error) {
      console.error("Error handling OAuth callback:", error);
      res.redirect('/dashboard?error=oauth_failed');
    }
  });

  app.get("/api/social/mock-callback", isAuthenticated, async (req: any, res) => {
    // This endpoint is used in mock mode to simulate OAuth callback
    const { code, state } = req.query;
    
    // Extract the platform from the state parameter
    try {
      const stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
      const platform = stateData.platform || 'twitter'; // fallback to twitter if missing
      res.redirect(`/api/social/callback/${platform}?code=${code}&state=${state}`);
    } catch (error) {
      console.error("Error parsing state in mock callback:", error);
      res.redirect('/dashboard?error=oauth_failed');
    }
  });

  app.delete("/api/connected-accounts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const accountId = req.params.id;
      
      // Verify ownership before deleting
      const account = await storage.getConnectedAccountById(accountId);
      if (!account || account.userId !== userId) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      await storage.deleteConnectedAccount(accountId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting connected account:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Posts
  app.get("/api/posts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const posts = await storage.getPostsByUser(userId);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.post("/api/posts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertPostSchema.parse({
        ...req.body,
        userId,
        status: "scheduled",
      });
      const post = await storage.createPost(data);
      res.json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // SEO Generation with OpenAI
  app.post("/api/seo-generate", isAuthenticated, async (req, res) => {
    try {
      const { topic } = req.body;
      
      if (!topic) {
        return res.status(400).json({ message: "Topic is required" });
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an SEO expert. Generate SEO-optimized content for social media posts. Return JSON with: title (engaging, 60 chars max), description (compelling, 160 chars max), hashtags (array of 10-15 relevant hashtags with #), and suggestedTime (best time to post, like 'Tuesday 2-3 PM EST')."
          },
          {
            role: "user",
            content: `Generate SEO content for: ${topic}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(completion.choices[0].message.content || "{}");
      res.json(result);
    } catch (error) {
      console.error("Error generating SEO content:", error);
      res.status(500).json({ message: "Failed to generate SEO content" });
    }
  });

  // Stripe Checkout
  app.post("/api/create-checkout", isAuthenticated, async (req, res) => {
    try {
      const { planId } = req.body;
      
      const prices: Record<string, number> = {
        pro: 999, // $9.99
        agency: 2499, // $24.99
      };

      if (!prices[planId]) {
        return res.status(400).json({ message: "Invalid plan" });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: planId === "pro" ? "Pro Plan" : "Agency Plan",
                description: planId === "pro" 
                  ? "Everything you need to grow faster and smarter"
                  : "Built for agencies, power users & professionals",
              },
              recurring: {
                interval: "month",
              },
              unit_amount: prices[planId],
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${req.protocol}://${req.hostname}/pricing?success=true`,
        cancel_url: `${req.protocol}://${req.hostname}/pricing?canceled=true`,
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  // Object Storage - Upload endpoint
  app.post("/api/objects/upload", isAuthenticated, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  });

  // Object Storage - Serve private objects with ACL check
  app.get("/objects/:objectPath(*)", isAuthenticated, async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Object Storage - Update post image ACL after upload
  app.put("/api/post-images", isAuthenticated, async (req: any, res) => {
    if (!req.body.imageURL) {
      return res.status(400).json({ error: "imageURL is required" });
    }

    const userId = req.user?.claims?.sub;

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.imageURL,
        {
          owner: userId,
          visibility: "public", // Posts images are public
        },
      );

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting post image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
