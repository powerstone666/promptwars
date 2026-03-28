const DEFAULT_AUDIO_MIME_TYPE = "audio/webm";

export function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const normalizedBlob =
      blob.type && blob.type !== "application/octet-stream"
        ? blob
        : new Blob([blob], { type: DEFAULT_AUDIO_MIME_TYPE });

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Failed to encode recorded audio."));
    };

    reader.onerror = () => {
      reject(new Error("Unable to read recorded audio."));
    };

    reader.readAsDataURL(normalizedBlob);
  });
}
