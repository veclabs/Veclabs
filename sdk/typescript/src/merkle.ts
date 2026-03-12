import { createHash } from 'crypto';

function hashLeaf(id: string): Buffer {
  return createHash('sha256').update('leaf:').update(id).digest();
}

function hashPair(left: Buffer, right: Buffer): Buffer {
  return createHash('sha256')
    .update('node:')
    .update(left)
    .update(right)
    .digest();
}

/**
 * Compute Merkle root from a list of vector IDs
 * MUST match the Rust implementation in crates/solvec-core/src/merkle.rs exactly
 * Same domain separators: "leaf:" and "node:"
 * Does NOT sort IDs - order must match Rust (uses insertion order)
 */
export function computeMerkleRootFromIds(ids: string[]): string {
  if (ids.length === 0) return '0'.repeat(64);

  let leaves = ids.map((id) => hashLeaf(id));

  while (leaves.length > 1) {
    const next: Buffer[] = [];
    for (let i = 0; i < leaves.length; i += 2) {
      const left = leaves[i];
      const right = i + 1 < leaves.length ? leaves[i + 1] : leaves[i];
      next.push(hashPair(left, right));
    }
    leaves = next;
  }

  return leaves[0].toString('hex');
}
