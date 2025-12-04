// src/utils/uploadImage.ts
import imageCompression from "browser-image-compression";

/**
 * Upload an image file and return the optimized URL
 * @param file - The image file to upload
 * @param section - Target section (e.g., "novels", "blogs", "projects")
 * @returns Promise<string> - The URL of the uploaded image
 */
export async function uploadImage(
  file: File,
  section: string = "novels"
): Promise<string> {
  console.log("📤 uploadImage called with:", file.name, section);
  console.log("   File size:", (file.size / 1024).toFixed(2), "KB");
  console.log("   File type:", file.type);

  if (!file) {
    throw new Error("No file provided");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  try {
    let processedFile = file;

    // ✅ Skip compression for icons and already-compressed formats
    const skipCompression =
      file.type.includes("icon") ||
      file.type.includes("webp") ||
      file.size < 100 * 1024; // Skip if already < 100 KB

    if (!skipCompression) {
      try {
        console.log("🔄 Starting compression...");

        const options = {
          maxSizeMB: 1, // Increased from 0.5 to 1 MB
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: "image/webp",
        };

        processedFile = await imageCompression(file, options);

        console.log("✅ Compression complete!");
        console.log("   Original:", (file.size / 1024).toFixed(2), "KB");
        console.log("   Compressed:", (processedFile.size / 1024).toFixed(2), "KB");
        console.log(
          "   Savings:",
          (((file.size - processedFile.size) / file.size) * 100).toFixed(1),
          "%"
        );
      } catch (compressionError) {
        // ✅ If compression fails, use original file
        console.warn(
          "⚠️ Compression failed, using original file:",
          compressionError
        );
        processedFile = file;
      }
    } else {
      console.log(
        "⏭️ Skipping compression (file is small or already optimized)"
      );
    }

    const formData = new FormData();
    formData.append("file", processedFile);
    formData.append("section", section);

    console.log("📤 Sending POST to /dev/upload");

    const response = await fetch("/dev/upload", {
      method: "POST",
      body: formData,
    });

    console.log("📥 Response status:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("📥 Error response:", errorText);
      throw new Error(errorText || `Upload failed: ${response.status}`);
    }

    const result = await response.json();
    console.log("📥 Response JSON:", result);

    if (!result.ok || !result.url) {
      throw new Error(result.error || "No URL returned from server");
    }

    console.log("✅ Upload successful:", result.url);
    return result.url;
  } catch (error) {
    console.error("❌ Upload error:", error);
    throw error;
  }
}
