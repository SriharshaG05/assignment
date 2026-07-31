/**
 * Safely parses datetime strings from the API.
 * If the string lacks a timezone offset, it assumes UTC ('Z') and appends it
 * so that browser timezone conversion (e.g. to IST) functions correctly.
 */
export const parseDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  
  // Check if string already contains timezone information
  const hasTimezone = dateStr.endsWith('Z') || dateStr.includes('+') || /-\d{2}:\d{2}$/.test(dateStr);
  const normalizedStr = hasTimezone ? dateStr : `${dateStr}Z`;
  
  return new Date(normalizedStr);
};
