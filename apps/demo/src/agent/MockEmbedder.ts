/**
 * Generates a deterministic 64-dimensional mock embedding for any text.
 * Same string always yields the same vector (stable across runs). L2-normalized.
 * Uses Unicode code points so multi-byte characters are handled consistently.
 */
export function mockEmbed(text: string): number[] {
  const dims = 64;
  const vec = new Array(dims).fill(0);
  let i = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;
    vec[i % dims] += Math.sin(cp * (i + 1)) * 0.1;
    i++;
  }
  const mag = Math.sqrt(vec.reduce((s: number, v: number) => s + v * v, 0));
  return vec.map((v: number) => v / (mag || 1));
}
