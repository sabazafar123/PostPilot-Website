import { useState, useEffect } from "react";
import { X, Image as ImageIcon, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaGalleryProps {
  mediaUrls: string[];
  onRemove?: (url: string) => void;
}

export function MediaGallery({ mediaUrls, onRemove }: MediaGalleryProps) {
  const [loadedMedia, setLoadedMedia] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Trigger fade-in for new media items
    const newUrls = mediaUrls.filter(url => !loadedMedia.has(url));
    if (newUrls.length > 0) {
      setTimeout(() => {
        setLoadedMedia(prev => new Set([...Array.from(prev), ...newUrls]));
      }, 50);
    }
  }, [mediaUrls, loadedMedia]);

  const isVideo = (url: string) => {
    return url.match(/\.(mp4|webm|ogg|mov)$/i);
  };

  if (mediaUrls.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">Uploaded Media ({mediaUrls.length})</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {mediaUrls.map((url, index) => {
          const isLoaded = loadedMedia.has(url);
          return (
            <div
              key={url}
              data-testid={`media-item-${index}`}
              className={`relative group rounded-lg overflow-hidden border-2 border-border bg-muted/30 aspect-square transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}
              style={{
                transitionDelay: isLoaded ? `${index * 50}ms` : '0ms'
              }}
            >
              {isVideo(url) ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                  <Video className="w-12 h-12 text-purple-600" />
                  <video
                    src={url}
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                    muted
                  />
                </div>
              ) : (
                <img
                  src={url}
                  alt={`Media ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback icon if image fails to load
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLElement).parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-muted"><svg class="w-12 h-12 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>';
                    }
                  }}
                />
              )}
              
              {/* Hover overlay with remove button */}
              {onRemove && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => onRemove(url)}
                    data-testid={`button-remove-media-${index}`}
                    className="h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              
              {/* Media type indicator */}
              <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full p-1.5">
                {isVideo(url) ? (
                  <Video className="w-3 h-3 text-white" />
                ) : (
                  <ImageIcon className="w-3 h-3 text-white" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
