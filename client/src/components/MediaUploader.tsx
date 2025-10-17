import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";

interface MediaUploaderProps {
  onUploadComplete: (url: string) => void;
  onUploadError: (error: string) => void;
  isUploading: boolean;
  onUploadStart: () => void;
  onUploadEnd: () => void;
}

export function MediaUploader({ 
  onUploadComplete, 
  onUploadError,
  isUploading, 
  onUploadStart,
  onUploadEnd 
}: MediaUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      onUploadStart();

      // Get presigned upload URL
      const response = await fetch("/api/objects/upload", {
        method: "POST",
        credentials: "include",
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Please log in to upload media");
        }
        throw new Error(`Failed to get upload URL: ${response.status}`);
      }
      
      const data = await response.json();

      // Upload file to storage
      const uploadResponse = await fetch(data.uploadURL, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }

      // Set ACL to public
      const uploadedUrl = data.uploadURL.split("?")[0];
      const aclResponse = await fetch("/api/post-images", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ imageURL: uploadedUrl }),
      });

      if (!aclResponse.ok) {
        throw new Error(`Failed to set permissions: ${aclResponse.status}`);
      }

      const aclData = await aclResponse.json();
      
      // Notify parent with the uploaded URL
      onUploadComplete(aclData.objectPath);

      // Reset input for next upload
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Upload failed. Please try again.";
      onUploadError(errorMessage);
      
      // Reset input for retry
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      // Always reset uploading state
      onUploadEnd();
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
        className="hidden"
        data-testid="input-file-upload"
      />
      <Button
        onClick={handleButtonClick}
        disabled={isUploading}
        data-testid="button-upload-media"
        className="bg-gradient-to-r from-purple-600 via-sky-600 to-pink-600 hover:from-purple-700 hover:via-sky-700 hover:to-pink-700 text-white"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Upload Media
          </>
        )}
      </Button>
    </div>
  );
}
