export function GradientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-purple-500/20 via-sky-500/20 to-pink-500/20 blur-3xl animate-pulse" 
           style={{ animationDuration: "8s" }} />
      <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-pink-500/20 via-purple-500/20 to-sky-500/20 blur-3xl animate-pulse" 
           style={{ animationDuration: "10s", animationDelay: "2s" }} />
    </div>
  );
}
