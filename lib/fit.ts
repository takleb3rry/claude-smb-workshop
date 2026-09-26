import { AI_STAGES, ROLES_FIT, SIZES_IN_RANGE } from './options';
import type { FitFlags, RequestAnswers } from './types';

/**
 * Jeff's three fit checks. They only flag rows in the Requests tab; Jeff decides every request.
 */
export function fitFlags(a: Pick<RequestAnswers, 'role' | 'size' | 'ai'>): FitFlags {
  const role = ROLES_FIT.includes(a.role);
  const size = SIZES_IN_RANGE.includes(a.size);
  const ai = AI_STAGES.find((s) => s.label === a.ai)?.newToAi ?? false;
  return { role, size, ai, score: [role, size, ai].filter(Boolean).length };
}

export function sizeOutOfRange(size: string): boolean {
  return size === 'Under 5' || size === '500+';
}
