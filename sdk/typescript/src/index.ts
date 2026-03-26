export { SolVec } from "./client";
export { SolVecCollection } from "./collection";
export { HNSWManager } from "./hnsw";
export { loadWasm, getWasm } from "./wasm";
export * from "./types";
export { MemoryInspector } from "./inspector";
export type {
  MemoryRecord,
  InspectorCollectionStats,
  InspectorQuery,
  InspectionResult,
  MerkleHistoryEntry,
} from "./inspector";

export { SolVec as default } from "./client";
