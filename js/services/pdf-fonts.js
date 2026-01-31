/**
 * PDF Font Service
 * Handles loading and embedding Vietnamese fonts for jsPDF
 */

/**
 * Vietnamese character mapping for normalization
 * Converts accented characters to non-accented equivalents
 */
const VIETNAMESE_MAP = {
  'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
  'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
  'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
  'đ': 'd',
  'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
  'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
  'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
  'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
  'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
  'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
  'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
  'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
  'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
  // Uppercase
  'À': 'A', 'Á': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
  'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
  'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
  'Đ': 'D',
  'È': 'E', 'É': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
  'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
  'Ì': 'I', 'Í': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
  'Ò': 'O', 'Ó': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
  'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
  'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
  'Ù': 'U', 'Ú': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
  'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
  'Ỳ': 'Y', 'Ý': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y'
};

/**
 * Convert Vietnamese text to non-accented ASCII
 * This ensures compatibility with standard PDF fonts
 */
export function normalizeVietnameseText(text) {
  if (!text) return '';
  
  let normalized = String(text);
  
  // Replace accented characters
  for (const [accented, plain] of Object.entries(VIETNAMESE_MAP)) {
    normalized = normalized.split(accented).join(plain);
  }
  
  return normalized;
}

/**
 * Check if text contains Vietnamese characters
 */
export function containsVietnamese(text) {
  if (!text) return false;
  const vietnameseChars = Object.keys(VIETNAMESE_MAP);
  return vietnameseChars.some(char => text.includes(char));
}

/**
 * Smart text normalization - preserves Vietnamese if possible, falls back to ASCII
 */
export function smartNormalize(text, useAscii = true) {
  if (!text) return '';
  if (!useAscii) return String(text);
  return normalizeVietnameseText(text);
}

/**
 * Font configuration for jsPDF
 * Uses Helvetica as base font with Vietnamese normalization
 */
export const FONT_CONFIG = {
  defaultFont: 'helvetica',
  defaultStyle: 'normal',
  fallbackFont: 'courier'
};

/**
 * Setup PDF with proper font handling
 */
export function setupPDFFonts(pdf) {
  // Set default font to Helvetica (best ASCII support)
  pdf.setFont(FONT_CONFIG.defaultFont, FONT_CONFIG.defaultStyle);
  
  // Add font metadata
  pdf.setProperties({
    fonts: ['Helvetica', 'Helvetica-Bold']
  });
  
  return {
    normalize: normalizeVietnameseText,
    containsVietnamese: containsVietnamese
  };
}

/**
 * Process text array for PDF output
 * Normalizes all strings in an object/array
 */
export function normalizeObject(obj) {
  if (typeof obj === 'string') {
    return normalizeVietnameseText(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(item => normalizeObject(item));
  }
  if (typeof obj === 'object' && obj !== null) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = normalizeObject(value);
    }
    return result;
  }
  return obj;
}

export default {
  normalizeVietnameseText,
  containsVietnamese,
  smartNormalize,
  setupPDFFonts,
  normalizeObject,
  FONT_CONFIG
};
