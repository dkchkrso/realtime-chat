// Common profanity words to block
const BLOCKED_WORDS = [
  'fuck',
  'shit',
  'damn',
  'ass',
  'bitch',
  'bastard',
  'crap',
  'piss',
  'dick',
  'cock',
  'pussy',
  'slut',
  'whore',
  'fag',
  'nigger',
  'nigga',
  'retard',
  'cunt',
];

// Normalize text: lowercase, remove special chars, handle leetspeak
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/\s+/g, ' ')
    .trim();
}

export function containsProfanity(text: string): boolean {
  const normalized = normalize(text);
  
  // Check exact word matches
  return BLOCKED_WORDS.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(normalized);
  });
}

export function filterMessage(text: string): { allowed: boolean; reason?: string } {
  if (containsProfanity(text)) {
    return {
      allowed: false,
      reason: 'Message contains inappropriate language. Please revise and try again.',
    };
  }
  
  return { allowed: true };
}
