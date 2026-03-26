/**
 * Generates a deterministic 64-dimensional mock embedding for any text.
 * Same text always produces the same vector. L2-normalized.
 */
export function mockEmbed(text: string): number[] {
  const dims = 64;
  const vec = new Array(dims).fill(0);
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    vec[i % dims] += Math.sin(charCode * (i + 1)) * 0.1;
  }
  const mag = Math.sqrt(vec.reduce((s: number, v: number) => s + v * v, 0));
  return vec.map((v: number) => v / (mag || 1));
}
