/**
 * Arabic-to-English transliteration map and credential generation utilities.
 * Used to auto-generate email and password from Arabic names.
 */

const arabicToEnglish: Record<string, string> = {
  'ا': 'a', 'أ': 'a', 'إ': 'e', 'آ': 'a',
  'ب': 'b', 'ت': 't', 'ث': 'th',
  'ج': 'j', 'ح': 'h', 'خ': 'kh',
  'د': 'd', 'ذ': 'th', 'ر': 'r', 'ز': 'z',
  'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd',
  'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh',
  'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l',
  'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w',
  'ي': 'y', 'ى': 'a', 'ة': 'a',
  'ئ': 'e', 'ؤ': 'o', 'ء': 'a',
  // Diacritics — strip
  '\u064B': '', '\u064C': '', '\u064D': '', '\u064E': '',
  '\u064F': '', '\u0650': '', '\u0651': '', '\u0652': '',
};

/**
 * Transliterate an Arabic string to a simplified English representation.
 * English input is passed through as-is (lowercased).
 */
export function transliterate(text: string): string {
  let result = '';
  for (const char of text) {
    if (arabicToEnglish[char] !== undefined) {
      result += arabicToEnglish[char];
    } else if (/[a-zA-Z0-9._-]/.test(char)) {
      result += char.toLowerCase();
    } else if (char === ' ') {
      result += '.';
    }
    // Skip any other characters
  }
  // Clean up multiple dots, leading/trailing dots
  return result.replace(/\.{2,}/g, '.').replace(/^\.+|\.+$/g, '');
}

/**
 * Generate email and password from a full name.
 * @param name - Full name (Arabic or English)
 * @param domain - Email domain (default: hulkgym.com)
 * @returns { email, password }
 *
 * Examples:
 *   "أحمد محمد" → email: "ahmed.mhmd@hulkgym.com", password: "Ahmed@123"
 *   "خالد عبد الله" → email: "khald.abd.allah@hulkgym.com", password: "Khald@123"
 */
export function generateCredentials(
  name: string,
  domain = 'hulkgym.com'
): { email: string; password: string } {
  const trimmed = name.trim();
  if (!trimmed) return { email: '', password: '' };

  const transliterated = transliterate(trimmed);

  // Email: full transliterated name with dots
  const email = `${transliterated}@${domain}`;

  // Password: capitalize first part + @123
  const firstPart = transliterated.split('.')[0] || 'user';
  const capitalized = firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
  const password = `${capitalized}@123`;

  return { email, password };
}
