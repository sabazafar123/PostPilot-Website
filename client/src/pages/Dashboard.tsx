import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { Calendar, Facebook, Instagram, Youtube, Linkedin, Twitter as XIcon, Upload, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { SiTiktok } from "react-icons/si";
import type { Post, ConnectedAccount } from "@shared/schema";
import { MediaUploader } from "@/components/MediaUploader";
import { MediaGallery } from "@/components/MediaGallery";

const PLATFORMS = [
  { id: "facebook", name: "Facebook", icon: Facebook, color: "text-blue-600" },
  { id: "instagram", name: "Instagram", icon: Instagram, color: "text-pink-600" },
  { id: "youtube", name: "YouTube", icon: Youtube, color: "text-red-600" },
  { id: "tiktok", name: "TikTok", icon: SiTiktok, color: "text-black dark:text-white" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "text-blue-700" },
  { id: "twitter", name: "X (Twitter)", icon: XIcon, color: "text-black dark:text-white" },
];

export default function Dashboard() {
  const { toast } = useToast();
  const [location] = useLocation();
  const [postContent, setPostContent] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  // Handle OAuth callback success/error messages
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    const error = params.get("error");

    if (connected) {
      toast({
        title: "Account Connected!",
        description: `Successfully connected ${connected}`,
      });
      // Clear URL params
      window.history.replaceState({}, '', '/dashboard');
    } else if (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect account",
        variant: "destructive",
      });
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [toast]);

  const { data: connectedAccounts } = useQuery<ConnectedAccount[]>({
    queryKey: ["/api/connected-accounts"],
  });

  const { data: posts, isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  const connectMutation = useMutation({
    mutationFn: async (platform: string) => {
      const response = await fetch(`/api/social/connect/${platform}`, {
        credentials: "include",
      });
      return response.json();
    },
    onSuccess: (data: { url: string; isMock: boolean }) => {
      // Redirect to OAuth URL (or mock OAuth flow)
      if (data.isMock) {
        toast({
          title: "Mock OAuth Mode",
          description: "Connecting in simulation mode...",
        });
      }
      window.location.href = data.url;
    },
    onError: () => {
      toast({
        title: "Connection Failed",
        description: "Unable to initiate OAuth flow",
        variant: "destructive",
      });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: (accountId: string) =>
      apiRequest("DELETE", `/api/connected-accounts/${accountId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/connected-accounts"] });
      toast({
        title: "Account Disconnected",
        description: "Account has been removed successfully",
      });
    },
  });

  const createPostMutation = useMutation({
    mutationFn: (data: { content: string; imageUrl?: string; platforms: string[]; scheduledFor: string }) =>
      apiRequest("POST", "/api/posts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setPostContent("");
      setMediaUrls([]);
      setScheduledDate("");
      setSelectedPlatforms([]);
      toast({
        title: "Post Scheduled!",
        description: "Your post has been scheduled successfully.",
      });
    },
  });

  const publishPostMutation = useMutation({
    mutationFn: (postId: string) =>
      apiRequest("POST", `/api/posts/${postId}/publish`, {}),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      const { summary } = data;
      toast({
        title: "Post Published!",
        description: `Successfully published to ${summary.successful}/${summary.total} platforms`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Publication Failed",
        description: error.message || "Failed to publish post",
        variant: "destructive",
      });
    },
  });

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleSchedulePost = () => {
    if (!postContent || !scheduledDate || selectedPlatforms.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate({
      content: postContent,
      imageUrl: mediaUrls[0] || undefined, // Use first media URL for now
      platforms: selectedPlatforms,
      scheduledFor: scheduledDate,
    });
  };

  const handleUploadComplete = (url: string) => {
    setMediaUrls(prev => [...prev, url]);
    setIsUploading(false);
    toast({
      title: "Media Uploaded",
      description: "Your media has been uploaded successfully",
    });
  };

  const handleRemoveMedia = (url: string) => {
    setMediaUrls(prev => prev.filter(u => u !== url));
  };

  const scheduledPosts = posts?.filter((p) => p.status === "scheduled") || [];
  const pastPosts = posts?.filter((p) => p.status === "published") || [];

  const getConnectedAccount = (platformId: string) => {
    return connectedAccounts?.find((acc) => acc.platform === platformId && acc.isConnected);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Connect Accounts Section */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Connect Social Accounts
            </CardTitle>
            <CardDescription>Link your social media platforms via OAuth (currently in simulation mode)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {PLATFORMS.map((platform) => {
                const Icon = platform.icon;
                const account = getConnectedAccount(platform.id);
                return (
                  <div key={platform.id} className="relative">
                    <Button
                      variant={account ? "default" : "outline"}
                      onClick={() => !account && connectMutation.mutate(platform.id)}
                      disabled={connectMutation.isPending || !!account}
                      data-testid={`button-connect-${platform.id}`}
                      className="w-full h-24 flex-col gap-2 hover-elevate active-elevate-2"
                    >
                      <Icon className={`w-8 h-8 ${account ? "text-white" : platform.color}`} />
                      <span className="text-xs font-medium">{platform.name}</span>
                      {account && <Badge className="text-xs px-1 py-0">{account.accountName || "Connected"}</Badge>}
                    </Button>
                    {account && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => disconnectMutation.mutate(account.id)}
                        disabled={disconnectMutation.isPending}
                        data-testid={`button-disconnect-${platform.id}`}
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Create Post Section */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Create Post
            </CardTitle>
            <CardDescription>Schedule content across multiple platforms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Post Content</label>
              <Textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="What's on your mind?"
                className="min-h-32 resize-none"
                data-testid="input-post-content"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Media Gallery</label>
                <MediaUploader
                  onUploadComplete={handleUploadComplete}
                  isUploading={isUploading}
                  onUploadStart={() => setIsUploading(true)}
                />
              </div>
              
              <MediaGallery 
                mediaUrls={mediaUrls} 
                onRemove={handleRemoveMedia}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Schedule Date & Time</label>
              <Input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                data-testid="input-schedule-date"
                className="max-w-md"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Platforms</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((platform) => {
                  const Icon = platform.icon;
                  return (
                    <Badge
                      key={platform.id}
                      variant={selectedPlatforms.includes(platform.id) ? "default" : "outline"}
                      onClick={() => handlePlatformToggle(platform.id)}
                      className="cursor-pointer px-3 py-2 hover-elevate active-elevate-2"
                      data-testid={`badge-platform-${platform.id}`}
                    >
                      <Icon className="w-4 h-4 mr-1" />
                      {platform.name}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <Button
              onClick={handleSchedulePost}
              disabled={createPostMutation.isPending}
              data-testid="button-schedule-post"
              className="w-full md:w-auto bg-gradient-to-r from-purple-600 via-sky-600 to-pink-600 hover:from-purple-700 hover:via-sky-700 hover:to-pink-700 text-white"
            >
              {createPostMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Post
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Posts Tables */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Scheduled Posts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-600" />
                Scheduled Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {postsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : scheduledPosts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No scheduled posts</div>
              ) : (
                <div className="space-y-4">
                  {scheduledPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-4 border border-border rounded-lg space-y-3 hover-elevate"
                      data-testid={`scheduled-post-${post.id}`}
                    >
                      <p className="text-sm font-medium line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(post.scheduledFor), "PPp")}
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {post.platforms?.map((p) => (
                          <Badge key={p} variant="secondary" className="text-xs">
                            {p}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => publishPostMutation.mutate(post.id)}
                        disabled={publishPostMutation.isPending}
                        data-testid={`button-publish-${post.id}`}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      >
                        {publishPostMutation.isPending ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                            Publishing...
                          </>
                        ) : (
                          <>
                            <Upload className="w-3 h-3 mr-2" />
                            Publish Now
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Past Posts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Past Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {postsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : pastPosts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No published posts yet</div>
              ) : (
                <div className="space-y-4">
                  {pastPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-4 border border-border rounded-lg space-y-2 hover-elevate"
                      data-testid={`past-post-${post.id}`}
                    >
                      <p className="text-sm font-medium line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                        {post.publishedAt ? format(new Date(post.publishedAt), "PPp") : "Published"}
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {post.platforms?.map((p) => (
                          <Badge key={p} variant="secondary" className="text-xs">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
