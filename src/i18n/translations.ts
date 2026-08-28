/**
 * Translation strings for Dad Coach Web.
 *
 * Supports English (en) and Hebrew (he).
 * Use the `useTranslations` hook to access these strings.
 *
 * @see LanguageProvider for language context
 */

import type { SupportedLanguage } from '@/src/types/workspace';

/**
 * All translatable string keys.
 * Organized by feature/section for maintainability.
 */
export interface TranslationStrings {
  // Navigation
  'nav.home': string;
  'nav.growth': string;
  'nav.family': string;
  'nav.coaching': string;
  'nav.profile': string;
  'nav.aria.home': string;
  'nav.aria.growth': string;
  'nav.aria.family': string;
  'nav.aria.coaching': string;
  'nav.aria.profile': string;
  'nav.brand': string;

  // Dashboard - Empty State
  'dashboard.empty.title': string;
  'dashboard.empty.description': string;
  'dashboard.empty.cta': string;
  'dashboard.empty.howItWorks': string;
  'dashboard.empty.aria.welcome': string;
  'dashboard.empty.aria.cta': string;

  // Dashboard - Weekly Goal
  'dashboard.weeklyGoal.title': string;
  'dashboard.weeklyGoal.setGoal': string;
  'dashboard.weeklyGoal.startJourney': string;
  'dashboard.weeklyGoal.talkToCoach': string;
  'dashboard.weeklyGoal.hours': string;
  'dashboard.weeklyGoal.hoursTarget': string;
  'dashboard.weeklyGoal.activitiesCompleted': string;
  'dashboard.weeklyGoal.activitiesScheduled': string;
  'dashboard.weeklyGoal.weeksToBlackBelt': string;
  'dashboard.weeklyGoal.congratsBlackBelt': string;
  'dashboard.weeklyGoal.showHistory': string;
  'dashboard.weeklyGoal.hideHistory': string;
  'dashboard.weeklyGoal.noHistory': string;
  'dashboard.weeklyGoal.firstWeek.title': string;
  'dashboard.weeklyGoal.firstWeek.description': string;

  // Dashboard - Weekly Goal History
  'dashboard.weeklyGoal.history.week': string;
  'dashboard.weeklyGoal.history.target': string;
  'dashboard.weeklyGoal.history.actual': string;
  'dashboard.weeklyGoal.history.status': string;
  'dashboard.weeklyGoal.history.belt': string;
  'dashboard.weeklyGoal.history.completed': string;
  'dashboard.weeklyGoal.history.notCompleted': string;
  'dashboard.weeklyGoal.history.cancelled': string;

  // Dashboard - Motivational Messages
  'dashboard.motivation.goalMet': string;
  'dashboard.motivation.almost': string;
  'dashboard.motivation.onTrack': string;
  'dashboard.motivation.goodStart': string;
  'dashboard.motivation.firstStep': string;
  'dashboard.motivation.timeToStart': string;
  'dashboard.motivation.masterDad': string;

  // Belts
  'belt.white': string;
  'belt.yellow': string;
  'belt.orange': string;
  'belt.green': string;
  'belt.blue': string;
  'belt.purple': string;
  'belt.brown': string;
  'belt.black': string;

  // Common Actions
  'common.save': string;
  'common.cancel': string;
  'common.edit': string;
  'common.delete': string;
  'common.confirm': string;
  'common.back': string;
  'common.next': string;
  'common.skip': string;
  'common.skipForNow': string;
  'common.continue': string;
  'common.loading': string;
  'common.error': string;
  'common.success': string;
  'common.retry': string;

  // Time Units
  'time.hours': string;
  'time.hour': string;
  'time.minutes': string;
  'time.minute': string;
  'time.days': string;
  'time.day': string;
  'time.weeks': string;
  'time.week': string;
  'time.year': string;
  'time.years': string;

  // Calendar Connect
  'calendar.connect.title': string;
  'calendar.connect.description': string;
  'calendar.connect.benefit1.title': string;
  'calendar.connect.benefit1.description': string;
  'calendar.connect.benefit2.title': string;
  'calendar.connect.benefit2.description': string;
  'calendar.connect.benefit3.title': string;
  'calendar.connect.benefit3.description': string;
  'calendar.connect.button': string;
  'calendar.connect.connecting': string;
  'calendar.connect.privacy': string;
  'calendar.connected.title': string;
  'calendar.connected.nextStep': string;

  // Profile
  'profile.title': string;
  'profile.name': string;
  'profile.phone': string;
  'profile.timezone': string;
  'profile.email': string;
  'profile.language': string;
  'profile.noData': string;

  // Preferences
  'preferences.title': string;
  'preferences.coachingStyle': string;
  'preferences.coachingTime': string;
  'preferences.notificationFrequency': string;
  'preferences.quietHours': string;
  'preferences.quietHours.from': string;
  'preferences.quietHours.to': string;

  // Coaching Styles
  'coachingStyle.gentle': string;
  'coachingStyle.gentle.description': string;
  'coachingStyle.balanced': string;
  'coachingStyle.balanced.description': string;
  'coachingStyle.direct': string;
  'coachingStyle.direct.description': string;
  'coachingStyle.motivational': string;
  'coachingStyle.motivational.description': string;

  // Notification Frequency
  'notificationFrequency.daily': string;
  'notificationFrequency.everyOtherDay': string;
  'notificationFrequency.twiceWeekly': string;

  // Children/Family
  'family.title': string;
  'family.children': string;
  'family.noChildren': string;
  'family.addChild': string;
  'family.childAge': string;

  // Growth
  'growth.title': string;
  'growth.achievements': string;
  'growth.streak': string;
  'growth.streakDays': string;
  'growth.beltLevel': string;

  // Onboarding
  'onboarding.step': string;
  'onboarding.stepOf': string;
  'onboarding.invitationRevoked.title': string;
  'onboarding.invitationRevoked.description': string;

  // Onboarding - Welcome Screen
  'onboarding.welcome.title': string;
  'onboarding.welcome.tagline': string;
  'onboarding.welcome.invitedBy': string;
  'onboarding.welcome.startButton': string;
  'onboarding.welcome.starting': string;
  'onboarding.welcome.feature.relationships': string;
  'onboarding.welcome.feature.growth': string;
  'onboarding.welcome.feature.achievements': string;
  'onboarding.welcome.feature.memories': string;

  // Onboarding - Profile Form
  'onboarding.profile.title': string;
  'onboarding.profile.subtitle': string;
  'onboarding.profile.displayName': string;
  'onboarding.profile.displayNamePlaceholder': string;
  'onboarding.profile.whatsappNumber': string;
  'onboarding.profile.phonePlaceholder': string;
  'onboarding.profile.emailOptional': string;
  'onboarding.profile.emailPlaceholder': string;
  'onboarding.profile.timezone': string;
  'onboarding.profile.selectTimezone': string;
  'onboarding.profile.duplicatePhone': string;
  'onboarding.profile.loginInstead': string;

  // Onboarding - Navigation
  'onboarding.nav.saving': string;

  // Review Summary
  'review.profile': string;
  'review.children': string;
  'review.goals': string;
  'review.preferences': string;

  // Error States
  'error.generic': string;
  'error.network': string;
  'error.notFound': string;
  'error.unauthorized': string;

  // WhatsApp
  'whatsapp.open': string;
  'whatsapp.chat': string;
}

/**
 * English translations.
 */
export const en: TranslationStrings = {
  // Navigation
  'nav.home': 'Home',
  'nav.growth': 'Growth',
  'nav.family': 'Family',
  'nav.coaching': 'Coaching',
  'nav.profile': 'Profile',
  'nav.aria.home': 'Go to dashboard home',
  'nav.aria.growth': 'View growth and achievements',
  'nav.aria.family': 'View family and children',
  'nav.aria.coaching': 'View coaching history',
  'nav.aria.profile': 'View and edit profile',
  'nav.brand': 'Dad Coach',

  // Dashboard - Empty State
  'dashboard.empty.title': 'Your journey begins on WhatsApp',
  'dashboard.empty.description': 'This dashboard will come alive as you grow. For now, head to WhatsApp to start your coaching sessions.',
  'dashboard.empty.cta': 'Open WhatsApp',
  'dashboard.empty.howItWorks': 'Learn how it works',
  'dashboard.empty.aria.welcome': 'Welcome to your dashboard',
  'dashboard.empty.aria.cta': 'Open WhatsApp to start your coaching journey',

  // Dashboard - Weekly Goal
  'dashboard.weeklyGoal.title': 'Weekly Goal',
  'dashboard.weeklyGoal.setGoal': 'Set Weekly Goal',
  'dashboard.weeklyGoal.startJourney': 'Start your 7-week journey to Black Belt!',
  'dashboard.weeklyGoal.talkToCoach': 'Talk to your Dad Coach on WhatsApp to set your weekly goal',
  'dashboard.weeklyGoal.hours': 'hours',
  'dashboard.weeklyGoal.hoursTarget': 'hours quality time',
  'dashboard.weeklyGoal.activitiesCompleted': 'Activities completed',
  'dashboard.weeklyGoal.activitiesScheduled': 'Activities scheduled',
  'dashboard.weeklyGoal.weeksToBlackBelt': 'weeks to Black Belt!',
  'dashboard.weeklyGoal.congratsBlackBelt': 'Congratulations! You reached Black Belt!',
  'dashboard.weeklyGoal.showHistory': 'Show goal history',
  'dashboard.weeklyGoal.hideHistory': 'Hide history',
  'dashboard.weeklyGoal.noHistory': 'No history yet',
  'dashboard.weeklyGoal.firstWeek.title': 'Welcome to your first week!',
  'dashboard.weeklyGoal.firstWeek.description': 'This is the start of your 7-week journey to Black Belt',

  // Dashboard - Weekly Goal History
  'dashboard.weeklyGoal.history.week': 'Week',
  'dashboard.weeklyGoal.history.target': 'Target',
  'dashboard.weeklyGoal.history.actual': 'Actual',
  'dashboard.weeklyGoal.history.status': 'Status',
  'dashboard.weeklyGoal.history.belt': 'Belt',
  'dashboard.weeklyGoal.history.completed': 'Completed',
  'dashboard.weeklyGoal.history.notCompleted': 'Not completed',
  'dashboard.weeklyGoal.history.cancelled': 'Cancelled',

  // Dashboard - Motivational Messages
  'dashboard.motivation.goalMet': 'Great job! 🎉 You achieved your weekly goal!',
  'dashboard.motivation.almost': 'Excellent! Almost there! 💪',
  'dashboard.motivation.onTrack': 'You\'re on the right track! Keep going! 🌟',
  'dashboard.motivation.goodStart': 'Good start! Every moment with the kids counts! 👨‍👧',
  'dashboard.motivation.firstStep': 'The first step is the most important! ✨',
  'dashboard.motivation.timeToStart': 'Time to start! The kids are waiting! 🚀',
  'dashboard.motivation.masterDad': 'You reached the highest level! 🏆 You\'re a master dad!',

  // Belts
  'belt.white': 'White Belt',
  'belt.yellow': 'Yellow Belt',
  'belt.orange': 'Orange Belt',
  'belt.green': 'Green Belt',
  'belt.blue': 'Blue Belt',
  'belt.purple': 'Purple Belt',
  'belt.brown': 'Brown Belt',
  'belt.black': 'Black Belt',

  // Common Actions
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.edit': 'Edit',
  'common.delete': 'Delete',
  'common.confirm': 'Confirm',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.skip': 'Skip',
  'common.skipForNow': 'Skip for now',
  'common.continue': 'Continue',
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.success': 'Success',
  'common.retry': 'Retry',

  // Time Units
  'time.hours': 'hours',
  'time.hour': 'hour',
  'time.minutes': 'minutes',
  'time.minute': 'minute',
  'time.days': 'days',
  'time.day': 'day',
  'time.weeks': 'weeks',
  'time.week': 'week',
  'time.year': 'year',
  'time.years': 'years',

  // Calendar Connect
  'calendar.connect.title': 'Connect Your Calendar',
  'calendar.connect.description': 'Connecting your calendar helps us find available times for quality time with the kids and schedule automatically.',
  'calendar.connect.benefit1.title': 'Find available times',
  'calendar.connect.benefit1.description': 'We\'ll see when you have free time in your calendar',
  'calendar.connect.benefit2.title': 'Automatic scheduling',
  'calendar.connect.benefit2.description': 'Quality time will be automatically added to your calendar',
  'calendar.connect.benefit3.title': 'Reminders',
  'calendar.connect.benefit3.description': 'You\'ll get a reminder before quality time',
  'calendar.connect.button': 'Connect with Google',
  'calendar.connect.connecting': 'Connecting...',
  'calendar.connect.privacy': 'We only access your calendar events. We won\'t share or modify any other data.',
  'calendar.connected.title': '✅ Calendar Connected!',
  'calendar.connected.nextStep': 'Moving to the next step...',

  // Profile
  'profile.title': 'Profile',
  'profile.name': 'Name',
  'profile.phone': 'Phone',
  'profile.timezone': 'Timezone',
  'profile.email': 'Email',
  'profile.language': 'Language',
  'profile.noData': 'No profile data',

  // Preferences
  'preferences.title': 'Preferences',
  'preferences.coachingStyle': 'Coaching style',
  'preferences.coachingTime': 'Preferred coaching time',
  'preferences.notificationFrequency': 'Notification frequency',
  'preferences.quietHours': 'Quiet hours',
  'preferences.quietHours.from': 'From',
  'preferences.quietHours.to': 'To',

  // Coaching Styles
  'coachingStyle.gentle': 'Gentle',
  'coachingStyle.gentle.description': 'Soft, supportive guidance',
  'coachingStyle.balanced': 'Balanced',
  'coachingStyle.balanced.description': 'Mix of support and challenge',
  'coachingStyle.direct': 'Direct',
  'coachingStyle.direct.description': 'Straightforward feedback',
  'coachingStyle.motivational': 'Motivational',
  'coachingStyle.motivational.description': 'High energy encouragement',

  // Notification Frequency
  'notificationFrequency.daily': 'Daily',
  'notificationFrequency.everyOtherDay': 'Every other day',
  'notificationFrequency.twiceWeekly': 'Twice weekly',

  // Children/Family
  'family.title': 'Family',
  'family.children': 'Children',
  'family.noChildren': 'No children added',
  'family.addChild': 'Add child',
  'family.childAge': 'years old',

  // Growth
  'growth.title': 'Growth',
  'growth.achievements': 'Achievements',
  'growth.streak': 'Streak',
  'growth.streakDays': 'day streak',
  'growth.beltLevel': 'Belt Level',

  // Onboarding
  'onboarding.step': 'Step',
  'onboarding.stepOf': 'of',
  'onboarding.invitationRevoked.title': 'Invitation No Longer Available',
  'onboarding.invitationRevoked.description': 'This invitation is no longer available. Please contact the person who shared it with you.',

  // Onboarding - Welcome Screen
  'onboarding.welcome.title': 'Become the Father You Want to Be',
  'onboarding.welcome.tagline': 'Small daily actions. Big lifelong impact.',
  'onboarding.welcome.invitedBy': 'Invited by',
  'onboarding.welcome.startButton': 'Start Your Journey →',
  'onboarding.welcome.starting': 'Starting…',
  'onboarding.welcome.feature.relationships': 'Relationships',
  'onboarding.welcome.feature.growth': 'Growth',
  'onboarding.welcome.feature.achievements': 'Achievements',
  'onboarding.welcome.feature.memories': 'Memories',

  // Onboarding - Profile Form
  'onboarding.profile.title': "Let's start your journey",
  'onboarding.profile.subtitle': 'Just a few quick questions',
  'onboarding.profile.displayName': 'Display Name',
  'onboarding.profile.displayNamePlaceholder': 'Your name',
  'onboarding.profile.whatsappNumber': 'WhatsApp Number',
  'onboarding.profile.phonePlaceholder': '50-123-4567',
  'onboarding.profile.emailOptional': 'Email (optional)',
  'onboarding.profile.emailPlaceholder': 'you@example.com',
  'onboarding.profile.timezone': 'Timezone',
  'onboarding.profile.selectTimezone': 'Select timezone',
  'onboarding.profile.duplicatePhone': 'This number is already registered.',
  'onboarding.profile.loginInstead': 'Would you like to log in instead?',

  // Onboarding - Navigation
  'onboarding.nav.saving': 'Saving...',

  // Review Summary
  'review.profile': 'Profile',
  'review.children': 'Children',
  'review.goals': 'Goals',
  'review.preferences': 'Preferences',

  // Error States
  'error.generic': 'Something went wrong. Please try again.',
  'error.network': 'Network error. Please check your connection.',
  'error.notFound': 'Not found',
  'error.unauthorized': 'You are not authorized to view this page.',

  // WhatsApp
  'whatsapp.open': 'Open WhatsApp',
  'whatsapp.chat': 'Chat on WhatsApp',
};

/**
 * Hebrew translations.
 */
export const he: TranslationStrings = {
  // Navigation
  'nav.home': 'בית',
  'nav.growth': 'צמיחה',
  'nav.family': 'משפחה',
  'nav.coaching': 'אימון',
  'nav.profile': 'פרופיל',
  'nav.aria.home': 'עבור לדף הבית',
  'nav.aria.growth': 'צפה בצמיחה והישגים',
  'nav.aria.family': 'צפה במשפחה וילדים',
  'nav.aria.coaching': 'צפה בהיסטוריית אימון',
  'nav.aria.profile': 'צפה וערוך פרופיל',
  'nav.brand': 'מאמן אבות',

  // Dashboard - Empty State
  'dashboard.empty.title': 'המסע שלך מתחיל בוואטסאפ',
  'dashboard.empty.description': 'לוח המחוונים הזה יתעורר לחיים ככל שתתקדם. לעת עתה, עבור לוואטסאפ כדי להתחיל את מפגשי האימון.',
  'dashboard.empty.cta': 'פתח וואטסאפ',
  'dashboard.empty.howItWorks': 'למד איך זה עובד',
  'dashboard.empty.aria.welcome': 'ברוכים הבאים ללוח המחוונים שלך',
  'dashboard.empty.aria.cta': 'פתח וואטסאפ כדי להתחיל את מסע האימון שלך',

  // Dashboard - Weekly Goal
  'dashboard.weeklyGoal.title': 'יעד השבוע',
  'dashboard.weeklyGoal.setGoal': 'קבע יעד שבועי',
  'dashboard.weeklyGoal.startJourney': 'התחל את מסע 7 השבועות שלך לחגורה שחורה!',
  'dashboard.weeklyGoal.talkToCoach': 'דבר עם מאמן האבות בוואטסאפ כדי לקבוע את היעד השבועי שלך',
  'dashboard.weeklyGoal.hours': 'שעות',
  'dashboard.weeklyGoal.hoursTarget': 'שעות זמן איכות',
  'dashboard.weeklyGoal.activitiesCompleted': 'פעילויות שהושלמו',
  'dashboard.weeklyGoal.activitiesScheduled': 'פעילויות מתוכננות',
  'dashboard.weeklyGoal.weeksToBlackBelt': 'שבועות לחגורה שחורה!',
  'dashboard.weeklyGoal.congratsBlackBelt': 'מזל טוב! הגעת לחגורה שחורה!',
  'dashboard.weeklyGoal.showHistory': 'הצג היסטוריית יעדים',
  'dashboard.weeklyGoal.hideHistory': 'הסתר היסטוריה',
  'dashboard.weeklyGoal.noHistory': 'אין היסטוריה עדיין',
  'dashboard.weeklyGoal.firstWeek.title': 'ברוך הבא לשבוע הראשון!',
  'dashboard.weeklyGoal.firstWeek.description': 'זו תחילת המסע שלך ל-7 שבועות לחגורה שחורה',

  // Dashboard - Weekly Goal History
  'dashboard.weeklyGoal.history.week': 'שבוע',
  'dashboard.weeklyGoal.history.target': 'יעד',
  'dashboard.weeklyGoal.history.actual': 'בוצע',
  'dashboard.weeklyGoal.history.status': 'סטטוס',
  'dashboard.weeklyGoal.history.belt': 'חגורה',
  'dashboard.weeklyGoal.history.completed': 'הושלם',
  'dashboard.weeklyGoal.history.notCompleted': 'לא הושלם',
  'dashboard.weeklyGoal.history.cancelled': 'בוטל',

  // Dashboard - Motivational Messages
  'dashboard.motivation.goalMet': 'כל הכבוד! 🎉 השגת את היעד השבועי!',
  'dashboard.motivation.almost': 'מעולה! קצת עוד ואתה שם! 💪',
  'dashboard.motivation.onTrack': 'אתה בדרך הנכונה! המשך כך! 🌟',
  'dashboard.motivation.goodStart': 'התחלה טובה! כל רגע עם הילדים נחשב! 👨‍👧',
  'dashboard.motivation.firstStep': 'הצעד הראשון הוא הכי חשוב! ✨',
  'dashboard.motivation.timeToStart': 'הגיע הזמן להתחיל! הילדים מחכים! 🚀',
  'dashboard.motivation.masterDad': 'הגעת לדרגה הגבוהה ביותר! 🏆 אתה אבא מאסטר!',

  // Belts
  'belt.white': 'חגורה לבנה',
  'belt.yellow': 'חגורה צהובה',
  'belt.orange': 'חגורה כתומה',
  'belt.green': 'חגורה ירוקה',
  'belt.blue': 'חגורה כחולה',
  'belt.purple': 'חגורה סגולה',
  'belt.brown': 'חגורה חומה',
  'belt.black': 'חגורה שחורה',

  // Common Actions
  'common.save': 'שמור',
  'common.cancel': 'ביטול',
  'common.edit': 'עריכה',
  'common.delete': 'מחק',
  'common.confirm': 'אישור',
  'common.back': 'חזור',
  'common.next': 'הבא',
  'common.skip': 'דלג',
  'common.skipForNow': 'דלג לעכשיו',
  'common.continue': 'המשך',
  'common.loading': 'טוען...',
  'common.error': 'שגיאה',
  'common.success': 'הצלחה',
  'common.retry': 'נסה שוב',

  // Time Units
  'time.hours': 'שעות',
  'time.hour': 'שעה',
  'time.minutes': 'דקות',
  'time.minute': 'דקה',
  'time.days': 'ימים',
  'time.day': 'יום',
  'time.weeks': 'שבועות',
  'time.week': 'שבוע',
  'time.year': 'שנה',
  'time.years': 'שנים',

  // Calendar Connect
  'calendar.connect.title': 'חבר את לוח השנה',
  'calendar.connect.description': 'חיבור לוח השנה שלך יעזור לנו למצוא זמנים פנויים לזמן איכות עם הילדים ולתאם אוטומטית.',
  'calendar.connect.benefit1.title': 'מציאת זמנים פנויים',
  'calendar.connect.benefit1.description': 'נראה מתי יש לך זמן פנוי בלוח',
  'calendar.connect.benefit2.title': 'תזמון אוטומטי',
  'calendar.connect.benefit2.description': 'זמן האיכות יתווסף אוטומטית ללוח שלך',
  'calendar.connect.benefit3.title': 'תזכורות',
  'calendar.connect.benefit3.description': 'תקבל תזכורת לפני זמן האיכות',
  'calendar.connect.button': 'התחבר עם גוגל',
  'calendar.connect.connecting': 'מתחבר...',
  'calendar.connect.privacy': 'אנחנו ניגש רק לאירועים בלוח השנה שלך. לא נשתף או נשנה שום מידע אחר.',
  'calendar.connected.title': '✅ לוח השנה מחובר!',
  'calendar.connected.nextStep': 'עוברים לשלב הבא...',

  // Profile
  'profile.title': 'פרופיל',
  'profile.name': 'שם',
  'profile.phone': 'טלפון',
  'profile.timezone': 'אזור זמן',
  'profile.email': 'אימייל',
  'profile.language': 'שפה',
  'profile.noData': 'אין נתוני פרופיל',

  // Preferences
  'preferences.title': 'העדפות',
  'preferences.coachingStyle': 'סגנון אימון',
  'preferences.coachingTime': 'זמן מועדף לאימון',
  'preferences.notificationFrequency': 'תדירות התראות',
  'preferences.quietHours': 'שעות שקטות',
  'preferences.quietHours.from': 'מ',
  'preferences.quietHours.to': 'עד',

  // Coaching Styles
  'coachingStyle.gentle': 'עדין',
  'coachingStyle.gentle.description': 'הנחיה רכה ותומכת',
  'coachingStyle.balanced': 'מאוזן',
  'coachingStyle.balanced.description': 'שילוב של תמיכה ואתגר',
  'coachingStyle.direct': 'ישיר',
  'coachingStyle.direct.description': 'משוב ישיר וברור',
  'coachingStyle.motivational': 'מוטיבציוני',
  'coachingStyle.motivational.description': 'עידוד באנרגיה גבוהה',

  // Notification Frequency
  'notificationFrequency.daily': 'יומי',
  'notificationFrequency.everyOtherDay': 'כל יומיים',
  'notificationFrequency.twiceWeekly': 'פעמיים בשבוע',

  // Children/Family
  'family.title': 'משפחה',
  'family.children': 'ילדים',
  'family.noChildren': 'לא נוספו ילדים',
  'family.addChild': 'הוסף ילד',
  'family.childAge': 'שנים',

  // Growth
  'growth.title': 'צמיחה',
  'growth.achievements': 'הישגים',
  'growth.streak': 'רצף',
  'growth.streakDays': 'ימים ברצף',
  'growth.beltLevel': 'דרגת חגורה',

  // Onboarding
  'onboarding.step': 'שלב',
  'onboarding.stepOf': 'מתוך',
  'onboarding.invitationRevoked.title': 'ההזמנה לא זמינה יותר',
  'onboarding.invitationRevoked.description': 'ההזמנה הזו כבר לא זמינה. אנא פנה לאדם ששיתף אותה איתך.',

  // Onboarding - Welcome Screen
  'onboarding.welcome.title': 'להפוך לאבא שתמיד רצית להיות',
  'onboarding.welcome.tagline': 'פעולות קטנות יומיומיות. השפעה גדולה לכל החיים.',
  'onboarding.welcome.invitedBy': 'הוזמנת על ידי',
  'onboarding.welcome.startButton': 'בוא נתחיל ←',
  'onboarding.welcome.starting': 'מתחיל…',
  'onboarding.welcome.feature.relationships': 'יחסים',
  'onboarding.welcome.feature.growth': 'צמיחה',
  'onboarding.welcome.feature.achievements': 'הישגים',
  'onboarding.welcome.feature.memories': 'זכרונות',

  // Onboarding - Profile Form
  'onboarding.profile.title': 'בוא נתחיל את המסע שלך',
  'onboarding.profile.subtitle': 'רק כמה שאלות קצרות',
  'onboarding.profile.displayName': 'שם תצוגה',
  'onboarding.profile.displayNamePlaceholder': 'השם שלך',
  'onboarding.profile.whatsappNumber': 'מספר וואטסאפ',
  'onboarding.profile.phonePlaceholder': '50-123-4567',
  'onboarding.profile.emailOptional': 'אימייל (אופציונלי)',
  'onboarding.profile.emailPlaceholder': 'you@example.com',
  'onboarding.profile.timezone': 'אזור זמן',
  'onboarding.profile.selectTimezone': 'בחר אזור זמן',
  'onboarding.profile.duplicatePhone': 'המספר הזה כבר רשום.',
  'onboarding.profile.loginInstead': 'האם תרצה להתחבר במקום?',

  // Onboarding - Navigation
  'onboarding.nav.saving': 'שומר...',

  // Review Summary
  'review.profile': 'פרופיל',
  'review.children': 'ילדים',
  'review.goals': 'מטרות',
  'review.preferences': 'העדפות',

  // Error States
  'error.generic': 'משהו השתבש. אנא נסה שוב.',
  'error.network': 'שגיאת רשת. אנא בדוק את החיבור שלך.',
  'error.notFound': 'לא נמצא',
  'error.unauthorized': 'אין לך הרשאה לצפות בדף זה.',

  // WhatsApp
  'whatsapp.open': 'פתח וואטסאפ',
  'whatsapp.chat': 'שוחח בוואטסאפ',
};

/**
 * All translations mapped by language code.
 */
export const translations: Record<SupportedLanguage, TranslationStrings> = {
  en,
  he,
};

/**
 * Get translations for a specific language.
 */
export function getTranslations(language: SupportedLanguage): TranslationStrings {
  return translations[language] || translations.en;
}

/**
 * Type-safe translation key.
 */
export type TranslationKey = keyof TranslationStrings;
