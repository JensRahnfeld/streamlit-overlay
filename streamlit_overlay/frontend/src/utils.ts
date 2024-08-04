// TODO: allow arbitrary number of bytes counting number of current frames' bytes
export function decompressImages(compression: Uint8Array): HTMLImageElement[] {
  const images: HTMLImageElement[] = [];
  let offset = 0;
  while (offset < compression.length) {
    const numBytes =
      (compression[offset] << 24) +
      (compression[offset + 1] << 16) +
      (compression[offset + 2] << 8) +
      compression[offset + 3];
    offset += 4;
    const imageData = compression.slice(offset, offset + numBytes);
    const blob = new Blob([imageData], { type: "image/jpeg" });
    const imageUrl = URL.createObjectURL(blob);
    const image = new Image();
    image.src = imageUrl;
    images.push(image);
    offset += numBytes;
  }

  return images;
}
