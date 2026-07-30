/**
 * Onboarding i18n strings — Hebrew and English translations.
 *
 * Used by onboarding components when the language context is set.
 * All UI text should be sourced from this file after language selection.
 *
 * @see Requirement 14: Localization
 */

import type { SupportedLanguage } from '@/src/types/onboarding';

type TranslationKey =
  // Navigation
  | 'nav.back'
  | 'nav.continue'
  | 'nav.skip'
  | 'nav.confirmStart'
  // Welcome
  | 'welcome.heading'
  | 'welcome.tagline'
  | 'welcome.cta'
  | 'welcome.invitedBy'
  // Language
  | 'language.heading'
  | 'language.subtitle'
  | 'language.english'
  | 'language.hebrew'
  | 'language.continue'
  // Profile
  | 'profile.heading'
  | 'profile.subtitle'
  | 'profile.displayName'
  | 'profile.phone'
  | 'profile.email'
  | 'profile.timezone'
  | 'profile.phonePlaceholder'
  | 'profile.emailPlaceholder'
  // Children
  | 'children.heading'
  | 'children.subtitle'
  | 'children.addAnother'
  | 'children.emptyState'
  | 'children.name'
  | 'children.birthDate'
  | 'children.gender'
  | 'children.boy'
  | 'children.girl'
  | 'children.genderSkip'
  // Goals
  | 'goals.heading'
  | 'goals.subtitle'
  | 'goals.customGoal'
  // Preferences
  | 'preferences.coachingStyle'
  | 'preferences.coachingTime'
  | 'preferences.frequency'
  | 'preferences.quietHours'
  | 'preferences.from'
  | 'preferences.to'
  // Review
  | 'review.heading'
  | 'review.subtitle'
  | 'review.edit'
  | 'review.profile'
  | 'review.children'
  | 'review.goals'
  | 'review.preferences'
  // Activation
  | 'activation.heading'
  | 'activation.description'
  | 'activation.openWhatsapp'
  | 'activation.copyMessage'
  | 'activation.waiting'
  | 'activation.footer'
  | 'activation.success'
  | 'activation.successSubtitle'
  | 'activation.goToDashboard'
  | 'activation.failed'
  | 'activation.failedSubtitle'
  | 'activation.retry'
  | 'activation.giveUp'
  // Errors
  | 'error.offline'
  | 'error.sessionExpired'
  | 'error.sessionExpiredSubtitle'
  | 'error.startAgain'
  | 'error.invitationRevoked'
  | 'error.generic'
  | 'error.tryAgain'
  // Validation
  | 'validation.nameMin'
  | 'validation.nameMax'
  | 'validation.nameInvalid'
  | 'validation.phoneRequired'
  | 'validation.phoneInvalid'
  | 'validation.emailInvalid'
  | 'validation.timezoneRequired'
  | 'validation.childNameMin'
  | 'validation.childNameMax'
  | 'validation.birthDateRequired'
  | 'validation.birthDateFuture'
  | 'validation.birthDateTooOld'
  | 'validation.goalsRange';

type Translations = Record<TranslationKey, string>;

const en: Translations = {
  // Navigation
  'nav.back': 'Back',
  'nav.continue': 'Continue',
  'nav.skip': 'Skip this step',
  'nav.confirmStart': 'Confirm & Start',
  // Welcome
  'welcome.heading': 'Become the Father You Want to Be',
  'welcome.tagline': 'Small daily actions. Big lifelong impact.',
  'welcome.cta': 'Start Your Journey →',
  'welcome.invitedBy': 'Invited by {name}',
  // Language
  'language.heading': 'Choose your language',
  'language.subtitle': 'בחר את השפה שלך',
  'language.english': 'English',
  'language.hebrew': 'עברית',
  'language.continue': 'Continue',
  // Profile
  'profile.heading': "Let's start your journey",
  'profile.subtitle': 'Just a few quick questions',
  'profile.displayName': 'Display Name',
  'profile.phone': 'WhatsApp Number',
  'profile.email': 'Email (optional)',
  'profile.timezone': 'Timezone',
  'profile.phonePlaceholder': '50-123-4567',
  'profile.emailPlaceholder': 'you@example.com',
  // Children
  'children.heading': 'How many children do you have?',
  'children.subtitle': 'Tell us about your children so we can personalize your coaching',
  'children.addAnother': '+ Add another child',
  'children.emptyState': "Add your children when you're ready. You can always do this later.",
  'children.name': 'Name',
  'children.birthDate': 'Birth date',
  'children.gender': 'Gender (optional)',
  'children.boy': 'Boy',
  'children.girl': 'Girl',
  'children.genderSkip': 'Skip',
  // Goals
  'goals.heading': 'What would you like to improve as a father?',
  'goals.subtitle': '(Choose up to 5)',
  'goals.customGoal': 'Custom goal (optional)',
  // Preferences
  'preferences.coachingStyle': 'Coaching style',
  'preferences.coachingTime': 'Preferred coaching time',
  'preferences.frequency': 'Notification frequency',
  'preferences.quietHours': 'Quiet hours',
  'preferences.from': 'From',
  'preferences.to': 'To',
  // Review
  'review.heading': 'Review & Confirm',
  'review.subtitle': 'Take a moment to review your information before we set everything up.',
  'review.edit': 'Edit',
  'review.profile': 'Profile',
  'review.children': 'Children',
  'review.goals': 'Goals',
  'review.preferences': 'Preferences',
  // Activation
  'activation.heading': 'Welcome to Dad Coach!',
  'activation.description': 'Your coach is already waiting for you on WhatsApp. Let\'s do this together!',
  'activation.openWhatsapp': 'Open WhatsApp →',
  'activation.copyMessage': 'or copy this message:',
  'activation.waiting': 'Waiting for connection...',
  'activation.footer': 'The journey begins now.',
  'activation.success': "You're connected! 🎉",
  'activation.successSubtitle': 'Your coaching journey starts now.',
  'activation.goToDashboard': 'Go to Dashboard →',
  'activation.failed': "We didn't receive your message.",
  'activation.failedSubtitle': 'Tap the button to try again.',
  'activation.retry': 'Try Again',
  'activation.giveUp': "We'll send you a reminder. You can close this page.",
  // Errors
  'error.offline': "You're offline. We'll retry when connected.",
  'error.sessionExpired': 'Your session has expired',
  'error.sessionExpiredSubtitle': 'Your session has expired, but the invitation is still valid. Let\'s start fresh.',
  'error.startAgain': 'Start Again',
  'error.invitationRevoked': 'This invitation is no longer available.',
  'error.generic': 'Something went wrong. Please try again.',
  'error.tryAgain': 'Try Again',
  // Validation
  'validation.nameMin': 'Name must be at least {min} characters',
  'validation.nameMax': 'Name must be under {max} characters',
  'validation.nameInvalid': 'Name can only contain letters and spaces',
  'validation.phoneRequired': 'Phone number is required',
  'validation.phoneInvalid': 'Please enter a valid phone number',
  'validation.emailInvalid': 'Please enter a valid email',
  'validation.timezoneRequired': 'Timezone is required',
  'validation.childNameMin': 'Name must be at least {min} characters',
  'validation.childNameMax': 'Name must be under {max} characters',
  'validation.birthDateRequired': 'Birth date is required',
  'validation.birthDateFuture': 'Birth date cannot be in the future',
  'validation.birthDateTooOld': 'Child must be under {max} years old',
  'validation.goalsRange': 'Select {min}–{max} goals',
};

const he: Translations = {
  // Navigation
  'nav.back': 'חזרה',
  'nav.continue': 'המשך',
  'nav.skip': 'דלג על שלב זה',
  'nav.confirmStart': 'אישור והתחלה',
  // Welcome
  'welcome.heading': 'הפוך לאבא שאתה רוצה להיות',
  'welcome.tagline': 'פעולות יומיות קטנות. השפעה גדולה לכל החיים.',
  'welcome.cta': 'התחל את המסע →',
  'welcome.invitedBy': 'הוזמן על ידי {name}',
  // Language
  'language.heading': 'Choose your language',
  'language.subtitle': 'בחר את השפה שלך',
  'language.english': 'English',
  'language.hebrew': 'עברית',
  'language.continue': 'המשך',
  // Profile
  'profile.heading': 'בואו נתחיל את המסע',
  'profile.subtitle': 'רק כמה שאלות קצרות',
  'profile.displayName': 'שם תצוגה',
  'profile.phone': 'מספר וואטסאפ',
  'profile.email': 'אימייל (אופציונלי)',
  'profile.timezone': 'אזור זמן',
  'profile.phonePlaceholder': '50-123-4567',
  'profile.emailPlaceholder': 'you@example.com',
  // Children
  'children.heading': 'כמה ילדים יש לך?',
  'children.subtitle': 'ספר לנו על הילדים שלך כדי שנוכל להתאים את האימון',
  'children.addAnother': '+ הוסף ילד נוסף',
  'children.emptyState': 'הוסף את הילדים שלך כשאתה מוכן. תמיד אפשר לעשות את זה אחר כך.',
  'children.name': 'שם',
  'children.birthDate': 'תאריך לידה',
  'children.gender': 'מין (אופציונלי)',
  'children.boy': 'בן',
  'children.girl': 'בת',
  'children.genderSkip': 'דלג',
  // Goals
  'goals.heading': 'מה היית רוצה לשפר כאבא?',
  'goals.subtitle': '(בחר עד 5)',
  'goals.customGoal': 'מטרה מותאמת (אופציונלי)',
  // Preferences
  'preferences.coachingStyle': 'סגנון אימון',
  'preferences.coachingTime': 'זמן אימון מועדף',
  'preferences.frequency': 'תדירות הודעות',
  'preferences.quietHours': 'שעות שקט',
  'preferences.from': 'מ-',
  'preferences.to': 'עד',
  // Review
  'review.heading': 'סקירה ואישור',
  'review.subtitle': 'קח רגע לבדוק את הפרטים לפני שנסדר הכל.',
  'review.edit': 'ערוך',
  'review.profile': 'פרופיל',
  'review.children': 'ילדים',
  'review.goals': 'מטרות',
  'review.preferences': 'העדפות',
  // Activation
  'activation.heading': 'ברוך הבא ל-Dad Coach!',
  'activation.description': 'המאמן שלך כבר מחכה לך בוואטסאפ. בואו נעשה את זה יחד!',
  'activation.openWhatsapp': 'פתח וואטסאפ →',
  'activation.copyMessage': 'או העתק את ההודעה הזו:',
  'activation.waiting': 'ממתין לחיבור...',
  'activation.footer': 'המסע מתחיל עכשיו.',
  'activation.success': 'אתה מחובר! 🎉',
  'activation.successSubtitle': 'מסע האימון שלך מתחיל עכשיו.',
  'activation.goToDashboard': 'למרחב העבודה →',
  'activation.failed': 'לא קיבלנו את ההודעה שלך.',
  'activation.failedSubtitle': 'לחץ על הכפתור כדי לנסות שוב.',
  'activation.retry': 'נסה שוב',
  'activation.giveUp': 'נשלח לך תזכורת. אפשר לסגור את הדף.',
  // Errors
  'error.offline': 'אתה לא מחובר. ננסה שוב כשתתחבר.',
  'error.sessionExpired': 'תוקף הסשן פג',
  'error.sessionExpiredSubtitle': 'תוקף הסשן פג, אבל ההזמנה עדיין בתוקף. בואו נתחיל מחדש.',
  'error.startAgain': 'התחל מחדש',
  'error.invitationRevoked': 'ההזמנה הזו כבר לא זמינה.',
  'error.generic': 'משהו השתבש. אנא נסה שוב.',
  'error.tryAgain': 'נסה שוב',
  // Validation
  'validation.nameMin': 'השם חייב להכיל לפחות {min} תווים',
  'validation.nameMax': 'השם חייב להיות פחות מ-{max} תווים',
  'validation.nameInvalid': 'השם יכול להכיל רק אותיות ורווחים',
  'validation.phoneRequired': 'מספר טלפון נדרש',
  'validation.phoneInvalid': 'אנא הזן מספר טלפון תקין',
  'validation.emailInvalid': 'אנא הזן כתובת אימייל תקינה',
  'validation.timezoneRequired': 'אזור זמן נדרש',
  'validation.childNameMin': 'השם חייב להכיל לפחות {min} תווים',
  'validation.childNameMax': 'השם חייב להיות פחות מ-{max} תווים',
  'validation.birthDateRequired': 'תאריך לידה נדרש',
  'validation.birthDateFuture': 'תאריך הלידה לא יכול להיות בעתיד',
  'validation.birthDateTooOld': 'הילד חייב להיות מתחת לגיל {max}',
  'validation.goalsRange': 'בחר {min}–{max} מטרות',
};

const translations: Record<SupportedLanguage, Translations> = { en, he };

/**
 * Get a translated string for the given language and key.
 * Supports placeholder replacement with {key} syntax.
 */
export function t(lang: SupportedLanguage, key: TranslationKey, params?: Record<string, string | number>): string {
  let text = translations[lang][key] ?? translations['en'][key] ?? key;

  if (params) {
    for (const [paramKey, value] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value));
    }
  }

  return text;
}

export type { TranslationKey };
export { translations };
