import { Button } from "@/components/ui/button";
import { GradientBackground } from "@/components/GradientBackground";
import { Rocket } from "lucide-react";

export default function Login() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <GradientBackground />
      
      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo and Brand */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 via-sky-500 to-pink-500 flex items-center justify-center shadow-xl">
              <Rocket className="w-10 h-10 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-sky-600 to-pink-600 bg-clip-text text-transparent" 
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              PostPilot
            </h1>
            <p className="text-xl text-muted-foreground mt-2">Simplify Your Socials</p>
          </div>
        </div>

        {/* Hero Text */}
        <div className="text-center space-y-4 py-8">
          <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Plan Once. Post Everywhere.
          </h2>
          <p className="text-lg text-muted-foreground max-w-sm mx-auto">
            Manage and schedule your social media content from one powerful platform
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-card/80 backdrop-blur-xl border border-card-border rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="space-y-4">
            <Button
              onClick={handleLogin}
              data-testid="button-login"
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 via-sky-600 to-pink-600 hover:from-purple-700 hover:via-sky-700 hover:to-pink-700 text-white border-0 shadow-lg transition-all duration-300"
            >
              Sign in with Replit
            </Button>
            
            <p className="text-sm text-center text-muted-foreground">
              Supports Google, GitHub, and email authentication
            </p>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600">5+</div>
                <div className="text-xs text-muted-foreground">Platforms</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-sky-600">AI</div>
                <div className="text-xs text-muted-foreground">SEO Tools</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-pink-600">∞</div>
                <div className="text-xs text-muted-foreground">Posts</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          Start scheduling smarter today
        </p>
      </div>
    </div>
  );
}
