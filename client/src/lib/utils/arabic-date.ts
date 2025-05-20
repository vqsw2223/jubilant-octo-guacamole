/**
 * Formats the current date in Arabic 
 * Fallback to standard format if Intl.DateTimeFormat doesn't support islamic calendar
 */
export function getCurrentArabicDate(): string {
  const today = new Date();
  
  try {
    // Try to use Islamic calendar
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      calendar: 'islamic'
    };
    
    return today.toLocaleDateString('ar-SA', options);
  } catch (e) {
    // Fallback if Islamic calendar not supported
    return today.toLocaleDateString('ar-SA');
  }
}

/**
 * Format a date for display in Arabic
 */
export function formatArabicDate(date: Date): string {
  return date.toLocaleDateString('ar-SA');
}
