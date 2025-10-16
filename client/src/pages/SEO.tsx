import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { ArrowLeft, Sparkles, Copy, CheckCircle2, Clock, Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SEOResult {
  title: string;
  description: string;
  hashtags: string[];
  suggestedTime: string;
}

export default function SEO() {
  const { toast } = useToast();
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<SEOResult | null>(null);
  const [copied, setCopied] = useState(false);

  const generateMutation = useMutation({
    mutationFn: (topic: string) => apiRequest("POST", "/api/seo-generate", { topic }),
    onSuccess: (data: SEOResult) => {
      setResult(data);
      toast({
        title: "SEO Content Generated!",
        description: "Your optimized content is ready to use.",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Unable to generate SEO content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic or title for your post",
        variant: "destructive",
      });
      return;
    }
    generateMutation.mutate(topic);
  };

  const handleCopyAll = () => {
    if (!result) return;
    
    const text = `Title: ${result.title}

Description: ${result.description}

Hashtags: ${result.hashtags.join(" ")}

Best Time to Post: ${result.suggestedTime}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "SEO content copied to clipboard",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" data-testid="button-back-to-dashboard" className="hover-elevate active-elevate-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Main Card */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 via-sky-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  AI SEO Assistant
                </CardTitle>
                <p className="text-muted-foreground mt-1">Generate optimized content with AI</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Input Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Enter Your Post Topic or Title</label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Best practices for remote work productivity"
                  data-testid="input-seo-topic"
                  className="text-lg h-12"
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                data-testid="button-generate-seo"
                className="w-full md:w-auto bg-gradient-to-r from-purple-600 via-sky-600 to-pink-600 hover:from-purple-700 hover:via-sky-700 hover:to-pink-700 text-white h-12 px-8 text-lg"
              >
                {generateMutation.isPending ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate SEO Content
                  </>
                )}
              </Button>
            </div>

            {/* Results Section */}
            {result && (
              <div className="space-y-6 pt-6 border-t border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Generated Content
                  </h3>
                  <Button
                    onClick={handleCopyAll}
                    variant="outline"
                    data-testid="button-copy-all"
                    className="hover-elevate active-elevate-2"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy All
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Title */}
                  <Card className="bg-gradient-to-br from-purple-50 to-sky-50 dark:from-purple-950/20 dark:to-sky-950/20 border-purple-200 dark:border-purple-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        SEO-Optimized Title
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-semibold" data-testid="text-seo-title">{result.title}</p>
                    </CardContent>
                  </Card>

                  {/* Description */}
                  <Card className="bg-gradient-to-br from-sky-50 to-pink-50 dark:from-sky-950/20 dark:to-pink-950/20 border-sky-200 dark:border-sky-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-sky-600" />
                        Description
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground leading-relaxed" data-testid="text-seo-description">
                        {result.description}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Hashtags */}
                  <Card className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 border-pink-200 dark:border-pink-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Hash className="w-5 h-5 text-pink-600" />
                        Hashtags
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2" data-testid="container-hashtags">
                        {result.hashtags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-900 dark:text-purple-100 border-0 px-3 py-1"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Suggested Time */}
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="w-5 h-5 text-green-600" />
                        Best Time to Post
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-medium text-green-700 dark:text-green-400" data-testid="text-suggested-time">
                        {result.suggestedTime}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
