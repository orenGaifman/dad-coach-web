/**
 * Phone number utility functions for E.164 formatting,
 * validation, extraction, and masking.
 *
 * All functions are pure (no side effects) and fully typed.
 * No external dependencies required.
 *
 * @see WEB-SPEC-007 Requirement 4 (Father Profile)
 */

/** E.164 format regex: +{1-9}{1-14 digits} */
const E164_REGEX = /^\+[1-9]\d{1,14}$/;

/**
 * Removes all non-digit characters from input, preserving a leading '+'.
 *
 * @example
 * stripNonDigits("+972 50-123-4567") // "+972501234567"
 * stripNonDigits("050-123-4567")     // "0501234567"
 */
export function stripNonDigits(input: string): string {
  if (input.startsWith('+')) {
    return '+' + input.slice(1).replace(/\D/g, '');
  }
  return input.replace(/\D/g, '');
}

/**
 * Combines a country code and local number into E.164 format.
 * Strips spaces, dashes, and leading zeros from the local number.
 *
 * @param countryCode - Country dialing code including '+' (e.g., "+972")
 * @param localNumber - Local phone number (may include spaces, dashes, leading zeros)
 * @returns E.164 formatted phone string (e.g., "+972501234567")
 *
 * @example
 * formatE164("+972", "050-123-4567") // "+972501234567"
 * formatE164("+1", "555 867 5309")   // "+15558675309"
 */
export function formatE164(countryCode: string, localNumber: string): string {
  const cleanCode = stripNonDigits(countryCode);
  const cleanLocal = stripNonDigits(localNumber).replace(/^0+/, '');
  return cleanCode + cleanLocal;
}

/**
 * Validates whether a phone string matches E.164 format.
 *
 * E.164 format: + followed by 1-15 digits, first digit 1-9.
 *
 * @param phone - Phone string to validate
 * @returns true if valid E.164 format
 *
 * @example
 * isValidE164("+972501234567") // true
 * isValidE164("972501234567")  // false (missing +)
 * isValidE164("+0501234567")   // false (starts with 0)
 */
export function isValidE164(phone: string): boolean {
  return E164_REGEX.test(phone);
}

/**
 * Splits an E.164 phone number into country code and local number.
 *
 * Uses heuristic matching for common country code lengths (1-3 digits).
 * Falls back to assuming 1-digit country code for unknown patterns.
 *
 * @param e164Phone - Valid E.164 formatted phone number
 * @returns Object with countryCode (including '+') and localNumber
 *
 * @example
 * extractCountryCode("+972501234567")
 * // { countryCode: "+972", localNumber: "501234567" }
 *
 * extractCountryCode("+15558675309")
 * // { countryCode: "+1", localNumber: "5558675309" }
 */
export function extractCountryCode(e164Phone: string): {
  countryCode: string;
  localNumber: string;
} {
  // Remove the leading '+'
  const digits = e164Phone.slice(1);

  // Country codes are 1-3 digits. Use known patterns to determine length.
  // Single-digit: 1 (North America), 7 (Russia/Kazakhstan)
  // Two-digit: 20-69 range (many countries)
  // Three-digit: everything else (most of the world)

  const firstDigit = digits[0];

  let codeLength: number;

  if (firstDigit === '1' || firstDigit === '7') {
    codeLength = 1;
  } else {
    const twoDigit = parseInt(digits.slice(0, 2), 10);
    if (twoDigit >= 20 && twoDigit <= 69) {
      // Exception: some 2-digit prefixes are actually 3-digit codes
      // For known 3-digit codes starting in 20-69 range:
      // 210-219, 220-229, etc. — handle common ones
      const threeDigitPrefixes = [
        210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223,
        224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237,
        238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251,
        252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265,
        266, 267, 268, 269, 290, 291, 292, 293, 294, 295, 296, 297, 298, 299,
        350, 351, 352, 353, 354, 355, 356, 357, 358, 359, 370, 371, 372, 373,
        374, 375, 376, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386, 387,
        388, 389, 420, 421, 423, 500, 501, 502, 503, 504, 505, 506, 507, 508,
        509, 590, 591, 592, 593, 594, 595, 596, 597, 598, 599, 670, 671, 672,
        673, 674, 675, 676, 677, 678, 679, 680, 681, 682, 683, 684, 685, 686,
        687, 688, 689, 690, 691, 692, 850, 852, 853, 855, 856, 880, 886, 960,
        961, 962, 963, 964, 965, 966, 967, 968, 970, 971, 972, 973, 974, 975,
        976, 977, 992, 993, 994, 995, 996, 997, 998,
      ];
      const threeDigit = parseInt(digits.slice(0, 3), 10);
      if (threeDigitPrefixes.includes(threeDigit)) {
        codeLength = 3;
      } else {
        codeLength = 2;
      }
    } else {
      codeLength = 3;
    }
  }

  return {
    countryCode: '+' + digits.slice(0, codeLength),
    localNumber: digits.slice(codeLength),
  };
}

/**
 * Masks a phone number showing only the last 4 digits.
 * All other characters are replaced with asterisks.
 *
 * @param phone - Phone number to mask (any format)
 * @returns Masked phone string (e.g., "****4567")
 *
 * @example
 * maskPhone("+972501234567") // "****4567"
 * maskPhone("0501234567")   // "****4567"
 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  if (digits.length <= 4) {
    return digits;
  }

  const lastFour = digits.slice(-4);
  return '****' + lastFour;
}
