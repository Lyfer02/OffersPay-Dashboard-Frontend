// utils/imageUtils.js

/**
 * Get the full URL for an image path
 * @param {string} imagePath - The image path from the API
 * @param {string} baseUrl - Optional base URL, defaults to VITE_API_URL
 * @returns {string} - The full image URL
 */
export const getImageUrl = (imagePath, baseUrl = null) => {
   if (!imagePath || imagePath.trim() === '') {
    return '/img/noimage.jpg'; // Assumes the image is in your `public/images` folder
  }
  
  // Use provided baseUrl or fallback to environment variable
  const BASE_IMAGE_URL = baseUrl || `${import.meta.env.VITE_API_URL}/`;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a blob URL (for newly uploaded files), return as is
  if (imagePath.startsWith('blob:')) {
    return imagePath;
  }
  
  // Convert file path to URL
  // Remove 'public/' or 'public\' prefix if present
  const normalizedPath = imagePath.replace(/^public[\\/]/, '').replace(/\\/g, '/');
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = normalizedPath.startsWith('/') ? normalizedPath.slice(1) : normalizedPath;
  
  return `${BASE_IMAGE_URL}${cleanPath}`;
};

/**
 * Get a placeholder image URL for broken images
 * @param {number} width - Image width (default: 200)
 * @param {number} height - Image height (default: 200)
 * @param {string} text - Text to display (default: "Image not found")
 * @returns {string} - Data URL for placeholder image
 */
export const getPlaceholderImage = (width = 200, height = 200, text = "Image not found") => {
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#ddd"/>
      <text x="50%" y="50%" font-family="Arial" font-size="14" fill="#999" text-anchor="middle" dy=".3em">
        ${text}
      </text>
    </svg>
  `)}`;
};

/**
 * Validate image file
 * @param {File} file - The file to validate
 * @param {Object} options - Validation options
 * @param {number} options.maxSize - Maximum file size in bytes (default: 5MB)
 * @param {string[]} options.allowedTypes - Allowed MIME types (default: all image types)
 * @returns {Object} - Validation result { isValid: boolean, error: string }
 */
export const validateImageFile = (file, options = {}) => {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = [] } = options;
  
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }
  
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Please select a valid image file' };
  }
  
  // Check specific allowed types if provided
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { isValid: false, error: `Allowed types: ${allowedTypes.join(', ')}` };
  }
  
  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    return { isValid: false, error: `Image size should be less than ${maxSizeMB}MB` };
  }
  
  return { isValid: true, error: null };
};

/**
 * Create a blob URL for a file and track it for cleanup
 * @param {File} file - The file to create blob URL for
 * @returns {string} - The blob URL
 */
export const createBlobUrl = (file) => {
  if (!file) return '';
  return URL.createObjectURL(file);
};

/**
 * Cleanup blob URL
 * @param {string} blobUrl - The blob URL to cleanup
 */
export const cleanupBlobUrl = (blobUrl) => {
  if (blobUrl && blobUrl.startsWith('blob:')) {
    URL.revokeObjectURL(blobUrl);
  }
};

/**
 * Get image dimensions from a file
 * @param {File} file - The image file
 * @returns {Promise<{width: number, height: number}>} - Image dimensions
 */
export const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};

/**
 * Convert image file to base64
 * @param {File} file - The image file
 * @returns {Promise<string>} - Base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

/**
 * Compress image file
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @param {number} options.quality - Compression quality (0-1, default: 0.8)
 * @param {number} options.maxWidth - Maximum width (default: 1920)
 * @param {number} options.maxHeight - Maximum height (default: 1080)
 * @returns {Promise<File>} - Compressed image file
 */
export const compressImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const { quality = 0.8, maxWidth = 1920, maxHeight = 1080 } = options;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          resolve(compressedFile);
        },
        file.type,
        quality
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};