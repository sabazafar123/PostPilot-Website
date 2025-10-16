import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Rocket, Zap, Crown } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const PLANS = [
  {
    id: "free",
    name: "Takeoff",
    price: "$0",
    period: "forever",
    icon: Rocket,
    tagline: "Perfect for beginners testing their wings",
    gradient: "from-slate-500 to-slate-600",
    features: [
      "Schedule up to 5 posts/month",
      "Manage 1 social account",
      "Access to basic dashboard",
      "Limited AI SEO tools",
      "View past posts",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    id: "pro",
    name: "Cruise Mode",
    price: "$9.99",
    period: "/month",
    yearlyPrice: "$99/year",
    icon: Zap,
    tagline: "Everything you need to grow faster and smarter",
    gradient: "from-purple-600 via-sky-600 to-pink-600",
    features: [
      "Unlimited scheduling",
      "Up to 5 social accounts",
      "Full AI SEO tools (titles, hashtags, descriptions)",
      "Smart posting time suggestions",
      "Basic analytics dashboard",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    popular: true,
  },
  {
    id: "agency",
    name: "Full Control",
    price: "$24.99",
    period: "/month",
    yearlyPrice: "$249/year",
    icon: Crown,
    tagline: "Built for agencies, power users & professionals",
    gradient: "from-amber-500 to-orange-600",
    features: [
      "Unlimited posts & uploads",
      "Manage up to 20 accounts",
      "Team collaboration (multi-user access)",
      "Advanced analytics + performance reports",
      "Custom branding & white-label option",
      "Dedicated support + onboarding help",
    ],
    cta: "Go Agency 🚀",
    popular: false,
  },
];

export default function Pricing() {
  const { toast } = useToast();

  const checkoutMutation = useMutation({
    mutationFn: (planId: string) => apiRequest("POST", "/api/create-checkout", { planId }),
    onSuccess: (data: { url: string }) => {
      window.location.href = data.url;
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Unable to start checkout. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSelectPlan = (planId: string) => {
    if (planId === "free") {
      toast({
        title: "Free Plan Active",
        description: "You're already on the free plan!",
      });
      return;
    }
    checkoutMutation.mutate(planId);
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-sky-600 to-pink-600 bg-clip-text text-transparent"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade as you grow. All plans include our core features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.popular
                    ? "border-4 border-purple-500 shadow-2xl scale-105"
                    : "border-2"
                }`}
                data-testid={`card-plan-${plan.id}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 text-sm font-semibold">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="space-y-4 pb-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <div>
                    <CardTitle className="text-2xl mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {plan.tagline}
                    </CardDescription>
                  </div>

                  <div className="pt-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    {plan.yearlyPrice && (
                      <p className="text-sm text-muted-foreground mt-2">or {plan.yearlyPrice}</p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-6">
                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={checkoutMutation.isPending}
                    data-testid={`button-select-${plan.id}`}
                    className={`w-full h-12 text-lg font-semibold ${
                      plan.popular
                        ? `bg-gradient-to-r ${plan.gradient} text-white border-0 hover:opacity-90`
                        : ""
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Feature Comparison Footer */}
        <div className="text-center pt-12 border-t border-border">
          <p className="text-muted-foreground">
            All plans include secure authentication, scheduled posting, and platform integrations.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Upgrade or downgrade anytime. No long-term contracts.
          </p>
        </div>
      </div>
    </div>
  );
}
