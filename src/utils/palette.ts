import workPalettes from '../data/work-palettes.json';

export interface AccentResult {
  accent: string;
  glow: string;
}

const defaultResult: AccentResult = {
  accent: '#333333',
  glow: 'rgba(0, 0, 0, 0.08)',
};

/**
 * Returns the precomputed dominant accent color and glow for a work item.
 * Runs synchronously with zero runtime fs/sharp overhead.
 */
export function getWorkAccentColor(workId: string): AccentResult {
  const palette = (workPalettes as Record<string, AccentResult>)[workId];
  return palette || defaultResult;
}
