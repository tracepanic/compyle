"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { authenticateFileServer, deleteFile } from "@/server/imagekit";
import { ImageData } from "@/types";
import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/react";
import { Maximize2, Trash2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ImageUploaderProps {
  onImageDataChange: (imageData: ImageData | null) => void;
  initialImageData?: ImageData | null;
  type?: "app" | "profile";
}

export function ImageUploader({
  onImageDataChange,
  initialImageData = null,
  type = "app",
}: ImageUploaderProps) {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [imageData, setImageData] = useState<ImageData | null>(
    initialImageData
  );
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    setImageData(initialImageData ?? null);
  }, [initialImageData]);

  const updateImageData = (newImageData: ImageData | null) => {
    setImageData(newImageData);
    onImageDataChange(newImageData);
  };

  const authenticator = async () => {
    try {
      const data = await authenticateFileServer();
      return data;
    } catch {
      toast.error("Failed to authenticate upload server");
    }
  };

  const handleFileSelect = () => {
    if (isUploading || isProcessingRef.current) return;
    fileInputRef.current?.click();
  };

  const handleCancelUpload = () => {
    if (abortControllerRef.current && isUploading) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsUploading(false);
      setProgress(0);
      toast.info("Upload cancelled");
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast.error("No file selected");
      return;
    }

    if (isProcessingRef.current || isUploading) {
      toast.error("Please wait for the current operation to complete");
      return;
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Please select a valid image");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      event.target.value = "";
      return;
    }

    isProcessingRef.current = true;

    // Store reference to old image for cleanup
    const oldImageData = imageData;

    setIsUploading(true);
    setProgress(0);

    abortControllerRef.current = new AbortController();

    try {
      const authParams = await authenticator();

      if (!authParams) {
        setIsUploading(false);
        setProgress(0);
        abortControllerRef.current = null;
        isProcessingRef.current = false;
        event.target.value = "";
        return;
      }

      const toastId = toast.loading("Uploading image...");

      const uploadResponse = await upload({
        ...authParams,
        file,
        folder: type === "app" ? "/compyle/apps" : "/compyle/profile",
        fileName: file.name,
        onProgress: (event) => {
          setProgress(Math.round((event.loaded / event.total) * 100));
        },
        abortSignal: abortControllerRef.current.signal,
      });

      toast.dismiss(toastId);

      if (
        !uploadResponse.url ||
        !uploadResponse.fileId ||
        !uploadResponse.thumbnailUrl
      ) {
        toast.error("Failed to upload image");
        return;
      }

      // Update with new image
      updateImageData({
        image: uploadResponse.url,
        imageProviderFileId: uploadResponse.fileId,
        imageSource: "imagekit",
      });

      // Clean up old ImageKit image if it exists
      if (
        oldImageData?.imageSource === "imagekit" &&
        oldImageData.imageProviderFileId
      ) {
        try {
          await deleteFile({ fileId: oldImageData.imageProviderFileId });
        } catch {
          // Silent fail - new image is already uploaded
          console.error("Failed to delete old image");
        }
      }

      toast.success("Image uploaded successfully");
    } catch (error) {
      if (error instanceof ImageKitAbortError) {
        toast.info("Upload cancelled");
      } else if (error instanceof ImageKitInvalidRequestError) {
        toast.error("Invalid image upload request");
      } else if (error instanceof ImageKitUploadNetworkError) {
        toast.error("Network error during upload");
      } else if (error instanceof ImageKitServerError) {
        toast.error("Upload server error");
      } else {
        toast.error("Failed to upload image");
      }
    } finally {
      setIsUploading(false);
      setProgress(0);
      abortControllerRef.current = null;
      isProcessingRef.current = false;
      event.target.value = "";
    }
  };

  const handleRemoveImage = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!imageData || isProcessingRef.current || isUploading) {
      if (isUploading) {
        toast.error("Please wait for upload to complete");
      } else {
        toast.error("Image does not exist");
      }
      return;
    }

    // Show confirmation dialog
    setShowDeleteAlert(true);
  };

  const confirmDeleteImage = async () => {
    if (!imageData) return;

    isProcessingRef.current = true;

    // Skip ImageKit deletion for non-ImageKit images
    if (imageData.imageSource !== "imagekit") {
      updateImageData(null);
      toast.success("Image removed successfully");
      isProcessingRef.current = false;
      return;
    }

    // Only delete from ImageKit if it's an ImageKit image
    const toastId = toast.loading("Deleting image...");

    try {
      if (imageData.imageProviderFileId) {
        await deleteFile({ fileId: imageData.imageProviderFileId });
      }
      toast.dismiss(toastId);
      toast.success("Image deleted successfully");
      updateImageData(null);
    } catch {
      toast.dismiss(toastId);
      toast.error("Failed to delete image");
    } finally {
      isProcessingRef.current = false;
    }
  };

  const handleFullScreen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowFullScreen(true);
  };

  return (
    <Card className="p-2 -mt-3">
      <CardContent className="p-2">
        {!imageData?.image && !isUploading && (
          <div
            onClick={handleFileSelect}
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Click to upload an image
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, JPEG up to 5MB
            </p>
          </div>
        )}

        {isUploading && (
          <div>
            <div className="flex flex-row gap-4 justify-between">
              <div className="shrink-0">
                <div className="w-24 h-24 rounded-lg bg-linear-to-br from-primary/30 via-secondary/20 to-accent/30" />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="icon-sm"
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={handleCancelUpload}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3">
              <Progress value={progress} className="flex-1" />
              <span className="text-sm font-medium min-w-12 text-right">
                {progress}%
              </span>
            </div>
          </div>
        )}

        {imageData?.image && !isUploading && (
          <>
            <div className="flex flex-row gap-4 justify-between">
              <div className="shrink-0">
                <Image
                  src={imageData.image}
                  width={120}
                  height={120}
                  alt="App image"
                  className="w-24 h-24 rounded-lg border object-cover hover:opacity-90 transition-opacity cursor-pointer"
                  onClick={handleFullScreen}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="icon-sm"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={handleFullScreen}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={handleFileSelect}
                >
                  <Upload className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={handleRemoveImage}
                  disabled={isUploading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Dialog open={showFullScreen} onOpenChange={setShowFullScreen}>
              <DialogContent className="p-2 max-w-[98vw]! w-[98vw]! h-[98vh]">
                <DialogTitle className="sr-only">Full Screen Image</DialogTitle>
                <div className="relative w-full h-full flex items-center justify-center p-4">
                  <Image
                    src={imageData.image}
                    fill
                    priority
                    sizes="95vw 95vh"
                    alt="App image fullscreen"
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                </div>
              </DialogContent>
            </Dialog>

            <AlertDialog
              open={showDeleteAlert}
              onOpenChange={setShowDeleteAlert}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Image</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this image? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="cursor-pointer">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={confirmDeleteImage}
                    className="w-40 cursor-pointer"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}

        <Input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          className="hidden"
          disabled={isUploading}
          onChange={handleFileChange}
        />
      </CardContent>
    </Card>
  );
}
