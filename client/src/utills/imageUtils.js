// src/lib/imageUtils.js
export const getImageUrl = (image) => {
  if (!image) return null;
  
  // If it's already a full URL or data URL
  if (image.startsWith('http') || image.startsWith('data:')) {
    return image;
  }
  
  // For local development or relative paths
  return `${import.meta.env.VITE_SERVER_URL}/${image}?v=${Date.now()}`;
};