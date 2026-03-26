# Python SDK Parity Audit — Cursor Prompt
## Check Python SDK completeness against TypeScript SDK

---

## INSTRUCTIONS

Read every single file listed below before writing anything.
Do NOT modify any files. This is a read-only audit.
Report back with a structured comparison table and verdict for each item.

---

## FILES TO READ

### TypeScript SDK (source of truth)
```
sdk/typescript/src/index.ts
sdk/typescript/src/store.ts
sdk/typescript/src/collection.ts
sdk/typescript/src/inspector.ts
sdk/typescript/src/shadow-drive.ts
sdk/typescript/tests/
```

### Python SDK (audit target)
```
sdk/python/src/solvec/__init__.py
sdk/python/src/solvec/client.py
sdk/python/src/solvec/collection.py
sdk/python/src/solvec/inspector.py
sdk/python/src/solvec/encryption.py
sdk/python/src/solvec/merkle.py
sdk/python/src/solvec/shadow_drive.py
sdk/python/src/solvec/types.py
sdk/python/tests/test_collection.py
sdk/python/tests/test_encryption.py
sdk/python/tests/test_merkle.py
sdk/python/tests/test_inspector.py
sdk/python/tests/test_shadow_drive.py
```

### Rust core (for contract verification)
```
crates/solvec-core/src/hnsw.rs
crates/solvec-core/src/inspector.rs
crates/solvec-core/src/merkle.rs
crates/solvec-core/src/lib.rs
```

---

## AUDIT CHECKLIST

For each item below, report one of:
- ✅ MATCH — exists in Python, same behavior as TypeScript
- ⚠️ PARTIAL — exists but missing fields, wrong types, or different behavior
- ❌ MISSING — does not exist in Python SDK at all
- 🔒 N/A — intentionally not applicable to Python (e.g. WASM-only features)

---

### SECTION 1 — Package / Version

| Item | TypeScript | Python | Status | Notes |
|---|---|---|---|---|
| Package name | @veclabs/solvec | solvec | |
| Version | check package.json | check pyproject.toml | |
| Both versions match each other | | | |
| License field | MIT | MIT | |
| Repository URL correct | | | |
| All public exports declared in index | | | |

---

### SECTION 2 — Core Client Class

| Item | TypeScript (VecStore / SolVec) | Python (SolVec) | Status | Notes |
|---|---|---|---|---|
| Constructor accepts encryption config | | | |
| Constructor accepts Solana config | | | |
| Constructor accepts shadow drive config | | | |
| `collection(name, dimensions, metric?)` method | | | |
| `list_collections()` / `listCollections()` method | | | |
| `drop_collection(name)` / equivalent | | | |

---

### SECTION 3 — Collection Class

| Method | TypeScript signature | Python signature | Status | Notes |
|---|---|---|---|---|
| `upsert(records)` | `UpsertRecord[]` → `UpsertResponse` | | |
| `query(vector, topK, filter?, includeValues?)` | `QueryResponse` | | |
| `delete(ids)` | `DeleteResponse` | | |
| `fetch(ids)` | `FetchResponse` | | |
| `describe_index_stats()` | `CollectionStats` | | |
| `verify()` | `VerificationResult` | | |
| `inspector()` | `MemoryInspector` | | |
| Returns merkle_root in UpsertResponse | | | |
| Returns merkle_root in DeleteResponse | | | |
| Records `written_at` timestamp per vector | | | |
| Records `merkle_root_at_write` per vector | | | |
| Appends to `_merkle_history` on every write | | | |
| Appends to `_merkle_history` on every delete | | | |
| `_write_count` increments on upsert | | | |
| Shadow Drive snapshot triggered every N writes | | | |
| Solana post triggered on every write | | | |
| Dimension mismatch raises error on upsert | | | |
| Dimension mismatch raises error on query | | | |
| `edge_types` reserved field on collection | | | |
| `_serialize_snapshot()` returns bytes | | | |

---

### SECTION 4 — Encryption (Phase 4)

| Item | TypeScript | Python | Status | Notes |
|---|---|---|---|---|
| AES-256-GCM algorithm used | | | |
| PBKDF2-HMAC-SHA256 key derivation | | | |
| 600,000 PBKDF2 iterations | | | |
| Random 96-bit nonce per ciphertext | | | |
| Salt generated once per collection | | | |
| Nonce prepended to ciphertext | | | |
| `encrypt(data, key)` → bytes | | | |
| `decrypt(data, key)` → bytes | | | |
| `encrypt_json(obj, key)` → bytes | | | |
| `decrypt_json(data, key)` → obj | | | |
| Tampered ciphertext raises error | | | |
| Encryption is opt-in (disabled by default) | | | |
| `EncryptionConfig` dataclass/type exported | | | |

---

### SECTION 5 — Merkle / Solana (Phase 2)

| Item | TypeScript | Python | Status | Notes |
|---|---|---|---|---|
| `compute_merkle_root(ids[])` → hex string | | | |
| IDs sorted deterministically before hashing | | | |
| Empty ID list returns empty string | | | |
| Same IDs always produce same root | | | |
| SHA-256 leaf nodes | | | |
| Odd node count: last node duplicated | | | |
| Async Solana post (fire-and-forget) | | | |
| Solana post never blocks write operations | | | |
| Solana failures never crash write operations | | | |
| Solana is opt-in (disabled by default) | | | |
| Supports devnet / mainnet-beta / localnet | | | |
| Keypair loaded from JSON array OR base58 | | | |
| `SolanaConfig` dataclass/type exported | | | |
| `_on_chain_root` tracked on collection | | | |
| `_last_chain_sync_at` tracked on collection | | | |

---

### SECTION 6 — Shadow Drive (Phase 5)

| Item | TypeScript | Python | Status | Notes |
|---|---|---|---|---|
| Headless wallet adapter (auto-signs) | | | |
| Fire-and-forget upload (non-blocking) | | | |
| Shadow Drive failures never crash writes | | | |
| `snapshot_interval` configurable (default 10) | | | |
| Delta-only snapshots supported | | | |
| Storage account created on first use | | | |
| Shadow Drive is opt-in (disabled by default) | | | |
| `ShadowDriveConfig` dataclass/type exported | | | |
| Optional import guard (no crash if not installed) | | | |

---

### SECTION 7 — Memory Inspector (Phase 6)

| Item | TypeScript | Python | Status | Notes |
|---|---|---|---|---|
| `MemoryInspector` class exported | | | |
| `inspector.stats()` → `CollectionStats` | | | |
| `stats()` is O(1) — no vector iteration | | | |
| `inspector.inspect(query?)` → `InspectionResult` | | | |
| `inspect()` supports `writtenAfter` filter | | | |
| `inspect()` supports `writtenBefore` filter | | | |
| `inspect()` supports `metadataFilter` filter | | | |
| `inspect()` supports `hnswLayer` filter | | | |
| `inspect()` supports `limit` pagination | | | |
| `inspect()` supports `offset` pagination | | | |
| `inspect()` returns `total_matching` count | | | |
| `inspector.get(id)` → `MemoryRecord \| null` | | | |
| `inspector.searchWithRecords(vec, k)` | | | |
| `searchWithRecords()` returns scores + records | | | |
| `searchWithRecords()` sorted by score desc | | | |
| `inspector.merkleHistory()` → array | | | |
| `merkleHistory()` grows on every write | | | |
| `merkleHistory()` grows on every delete | | | |
| `MerkleHistoryEntry.trigger` is "write" on upsert | | | |
| `MerkleHistoryEntry.trigger` is "delete" on delete | | | |
| `MerkleHistoryEntry.trigger` is "bulk_write" on batch | | | |
| `inspector.verify()` returns match/roots | | | |
| `inspector()` on collection returns cached instance | | | |
| `MemoryRecord.edge_types` reserved field | | | |

---

### SECTION 8 — Types Exported

| Type | TypeScript | Python | Status |
|---|---|---|---|
| `DistanceMetric` enum | COSINE, EUCLIDEAN, DOT | | |
| `UpsertRecord` | id, values, metadata | | |
| `QueryMatch` | id, score, metadata, values? | | |
| `QueryResponse` | matches, namespace | | |
| `UpsertResponse` | upserted_count, merkle_root | | |
| `DeleteResponse` | deleted_count, merkle_root | | |
| `FetchResponse` | vectors dict | | |
| `CollectionStats` | vector_count, dimension, metric, name, merkle_root, encrypted | | |
| `VerificationResult` | verified, match, local_root, on_chain_root, vector_count | | |
| `EncryptionConfig` | enabled, passphrase, salt | | |
| `SolanaConfig` | enabled, network, program_id, keypair, async_post | | |
| `ShadowDriveConfig` | enabled, keypair, storage_account, snapshot_interval, delta_only | | |
| `MemoryRecord` | id, vector, metadata, written_at, merkle_root_at_write, hnsw_layer, neighbor_count, edge_types | | |
| `InspectorCollectionStats` | total_memories, dimensions, current_merkle_root, on_chain_root, roots_match, last_write_at, last_chain_sync_at, hnsw_layer_count, memory_usage_bytes, encrypted | | |
| `InspectorQuery` | metadata_filter, written_after, written_before, hnsw_layer, limit, offset | | |
| `InspectionResult` | stats, memories, total_matching | | |
| `MerkleHistoryEntry` | root, timestamp, memory_count_at_time, trigger | | |

---

### SECTION 9 — Tests

| Test Category | TypeScript count | Python count | Status | Notes |
|---|---|---|---|---|
| Collection tests (upsert/query/delete/fetch) | | | |
| Encryption tests | | | |
| Merkle tests | | | |
| Inspector tests | | | |
| Shadow Drive tests | | | |
| Total tests | | | |
| All tests passing | | | |
| Zero regressions from existing tests | | | |

---

### SECTION 10 — Error Handling

| Scenario | TypeScript behavior | Python behavior | Status |
|---|---|---|---|
| Dimension mismatch on upsert | throws ValueError | | |
| Dimension mismatch on query | throws ValueError | | |
| Solana post fails | silently continues | | |
| Shadow Drive upload fails | silently continues | | |
| Decryption of tampered data | throws | | |
| Empty collection query | returns empty matches | | |
| Fetch non-existent ID | omits from result | | |
| Inspector.get() non-existent ID | returns null/None | | |

---

### SECTION 11 — README / Documentation

| Item | TypeScript | Python | Status |
|---|---|---|---|
| Quick start example in README | | | |
| Encryption example in README | | | |
| Solana verification example in README | | | |
| Inspector usage example in README | | | |
| All public classes documented with docstrings | | | |
| All public methods have parameter docs | | | |

---

## VERDICT FORMAT

After completing the audit above, provide:

### Summary Table
```
Total items audited: X
✅ MATCH:   X
⚠️ PARTIAL: X
❌ MISSING: X
🔒 N/A:     X
```

### Critical Gaps (❌ MISSING items only)
List every missing item with:
- What it is
- Where it exists in TypeScript
- Estimated effort to add (small / medium / large)

### Partial Gaps (⚠️ PARTIAL items only)
List every partial item with:
- What's different
- What needs to change

### Verdict
One of:
- ✅ FULL PARITY — Python SDK matches TypeScript SDK completely
- ⚠️ NEAR PARITY — Minor gaps, ship Python SDK then patch
- ❌ NOT READY — Significant gaps, do not publish until fixed

---

## DO NOT

- Do not modify any files
- Do not write any code
- Do not run any tests
- Do not commit anything
- Just read and report
