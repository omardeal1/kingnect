export interface ProcessImageOptions {
  file: File;
  width?: number;
  height?: number;
}

export interface ProcessImageResult {
  dataUrl: string;
  size: number;
  success: boolean;
}

export async function processImage({
  file,
  width = 800,
  height = 600,
}: ProcessImageOptions): Promise<ProcessImageResult> {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("width", width.toString());
  formData.append("height", height.toString());

  const response = await fetch("/api/process-image", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Image processing failed: ${response.statusText}`);
  }

  return response.json();
}
