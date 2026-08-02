/**
 * WhatsApp configuration.
 *
 * Phone number for the Dad Coach WhatsApp connection.
 * Reads from NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER env var.
 *
 * Format: International format without '+' (e.g., '14155551234')
 */

export const WHATSAPP_PHONE_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER ?? '';

/**
 * Default pre-filled message when opening WhatsApp.
 * Can be overridden via the component prop.
 */
export const WHATSAPP_DEFAULT_MESSAGE =
  process.env.NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE ?? '';

/**
 * Generates a WhatsApp deep link URL.
 *
 * @param phoneNumber - Phone number in international format without '+'
 * @param message - Optional pre-filled message (URL encoded automatically)
 * @returns WhatsApp deep link URL
 */
export function getWhatsAppDeepLink(
  phoneNumber: string,
  message?: string
): string {
  const baseUrl = `https://wa.me/${phoneNumber}`;
  
  if (message) {
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  }
  
  return baseUrl;
}
