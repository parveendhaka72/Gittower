/**
 * Input Sanitization & Prompt Injection Defenses
 * Topics:
 * - Input sanitization & injection awareness (0.2 pts)
 * - Prompt injection awareness & defenses (0.3 pts)
 */

export interface PromptDefenseResult {
  isSafe: boolean;
  threatLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'CRITICAL';
  detectedPatterns: string[];
  sanitizedPrompt: string;
}

// Known prompt injection patterns (direct jailbreaks, system prompt overrides, delimiter attacks)
const INJECTION_PATTERNS = [
  { name: 'Ignore Instructions', regex: /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i, level: 'CRITICAL' },
  { name: 'System Override', regex: /you\s+are\s+now\s+(a\s+)?(DAN|developer\s+mode|unfiltered)/i, level: 'CRITICAL' },
  { name: 'Prompt Extraction', regex: /(reveal|print|show|repeat)\s+(the\s+)?(system\s+prompt|initial\s+instructions)/i, level: 'HIGH' },
  { name: 'Roleplay Hijack', regex: /pretend\s+you\s+have\s+no\s+(rules|ethics|constraints)/i, level: 'CRITICAL' },
  { name: 'Delimiter Trick', regex: /```system|<system>|\[SYSTEM\]/i, level: 'HIGH' },
];

/**
 * 1. Web Input Sanitization (XSS and HTML entity escaping)
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * 2. Prompt Injection Defense Guardrail
 */
export function defendAgainstPromptInjection(userInput: string): PromptDefenseResult {
  const detected: string[] = [];
  let maxThreat: 'NONE' | 'LOW' | 'MEDIUM' | 'CRITICAL' = 'NONE';

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.regex.test(userInput)) {
      detected.push(pattern.name);
      if (pattern.level === 'CRITICAL') maxThreat = 'CRITICAL';
      else if (pattern.level === 'HIGH' && maxThreat !== 'CRITICAL') maxThreat = 'MEDIUM';
      else if (maxThreat === 'NONE') maxThreat = 'LOW';
    }
  }

  // Sanitize and enclose in unambiguous XML boundaries to prevent instruction drift
  const sanitizedPrompt = userInput
    .replace(/<\/?system>/gi, '')
    .replace(/```/g, "'''")
    .trim();

  return {
    isSafe: detected.length === 0,
    threatLevel: maxThreat,
    detectedPatterns: detected,
    sanitizedPrompt: `<user_untrusted_input>\n${sanitizedPrompt}\n</user_untrusted_input>`,
  };
}
