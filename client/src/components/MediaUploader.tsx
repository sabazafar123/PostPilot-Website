import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";

interface MediaUploaderProps {
  onUploadComplete: (url: string) => void;
  isUploading: boolean;
  onUploadStart: () => void;
}

export function MediaUploader({ onUploadComplete, isUploading, onUploadStart }: MediaUploaderProps) {
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
      const data = await response.json();

      // Upload file to storage
      await fetch(data.uploadURL, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      // Set ACL to public
      const uploadedUrl = data.uploadURL.split("?")[0];
      const aclResponse = await fetch("/api/post-images", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ imageURL: uploadedUrl }),
      });

      const aclData = await aclResponse.json();
      
      // Notify parent with the uploaded URL
      onUploadComplete(aclData.objectPath);

      // Reset input for next upload
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload failed:", error);
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
