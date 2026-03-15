/* tslint:disable */
/* eslint-disable */

/**
 * WASM-exposed HNSW index
 * This is the class the TypeScript SDK instantiates
 */
export class WasmHNSWIndex {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Check if a vector ID exists
     */
    contains(id: string): boolean;
    /**
     * Create with default parameters (M=16, ef=200, cosine)
     */
    static defaultCosine(): WasmHNSWIndex;
    /**
     * Delete a vector by ID
     */
    delete(id: string): void;
    /**
     * Deserialize an index from JSON string
     */
    static fromJson(json: string): WasmHNSWIndex;
    /**
     * Insert a vector
     * values_ptr: Float32Array passed from TypeScript
     * metadata_json: JSON string of metadata object
     */
    insert(id: string, values: Float32Array, metadata_json: string): void;
    /**
     * Whether the index is empty
     */
    isEmpty(): boolean;
    /**
     * Number of vectors in the index
     */
    len(): number;
    /**
     * Create a new HNSW index
     * metric: 0 = cosine, 1 = euclidean, 2 = dot_product
     */
    constructor(m: number, ef_construction: number, metric: number);
    /**
     * Query for nearest neighbors
     * Returns JSON string: Array<{ id: string, score: number, metadata: object }>
     */
    query(values: Float32Array, top_k: number): string;
    /**
     * Set ef_search parameter (controls recall vs speed tradeoff)
     * Higher ef_search = better recall, slower queries
     */
    setEfSearch(ef: number): void;
    /**
     * Get index statistics as JSON string
     */
    stats(): string;
    /**
     * Serialize the entire index to JSON string (for persistence)
     */
    toJson(): string;
}

/**
 * Compute Merkle root from a list of vector IDs
 * This ensures the WASM and on-chain roots always match
 * ids_json: JSON array of string IDs
 */
export function computeMerkleRoot(ids_json: string): string;

export function init_panic_hook(): void;

/**
 * Verify a Merkle proof
 * proof_json: JSON of MerkleProof struct
 * expected_root_hex: hex string of expected root
 */
export function verifyMerkleProof(proof_json: string, expected_root_hex: string): boolean;
