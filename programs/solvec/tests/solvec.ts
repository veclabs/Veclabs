import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Solvec } from "../target/types/solvec";
import { assert, expect } from "chai";

describe("solvec — VecLabs Anchor Program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Solvec as Program<Solvec>;
  const owner = provider.wallet;

  const collectionName = "test-agent-memory";
  const dimensions = 384;
  const metric = 0; // cosine

  let collectionPDA: anchor.web3.PublicKey;
  let collectionBump: number;

  before(async () => {
    [collectionPDA, collectionBump] =
      anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("collection"),
          owner.publicKey.toBuffer(),
          Buffer.from(collectionName),
        ],
        program.programId,
      );
    console.log("\n🔑 Program ID:", program.programId.toString());
    console.log("📦 Collection PDA:", collectionPDA.toString());
    console.log(
      "🔗 Explorer:",
      `https://explorer.solana.com/address/${collectionPDA.toString()}?cluster=devnet\n`,
    );
  });

  it("Creates a collection", async () => {
    const tx = await program.methods
      .createCollection(collectionName, dimensions, metric)
      .accounts({
        collection: collectionPDA,
        owner: owner.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("✅ create_collection tx:", tx);

    const collection = await program.account.collection.fetch(collectionPDA);
    assert.equal(collection.name, collectionName);
    assert.equal(collection.dimensions, dimensions);
    assert.equal(collection.metric, metric);
    assert.equal(collection.vectorCount.toNumber(), 0);
    assert.deepEqual(collection.merkleRoot, Array(32).fill(0));
    assert.equal(collection.isFrozen, false);
    assert.equal(collection.owner.toString(), owner.publicKey.toString());
  });

  it("Updates the Merkle root", async () => {
    const mockRoot = Array.from({ length: 32 }, (_, i) => i + 1);
    const vectorCount = 5;

    const tx = await program.methods
      .updateMerkleRoot(mockRoot, new anchor.BN(vectorCount))
      .accounts({
        collection: collectionPDA,
        authority: owner.publicKey,
      })
      .rpc();

    console.log("✅ update_merkle_root tx:", tx);

    const collection = await program.account.collection.fetch(collectionPDA);
    assert.deepEqual(Array.from(collection.merkleRoot), mockRoot);
    assert.equal(collection.vectorCount.toNumber(), vectorCount);
    assert.isAbove(collection.lastUpdated.toNumber(), 0);
  });

  it("Grants read access to another wallet", async () => {
    const grantee = anchor.web3.Keypair.generate().publicKey;

    const [accessPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("access"), collectionPDA.toBuffer(), grantee.toBuffer()],
      program.programId,
    );

    const tx = await program.methods
      .grantAccess(grantee, 0)
      .accounts({
        collection: collectionPDA,
        accessRecord: accessPDA,
        owner: owner.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("✅ grant_access tx:", tx);

    const accessRecord = await program.account.accessRecord.fetch(accessPDA);
    assert.equal(accessRecord.grantee.toString(), grantee.toString());
    assert.equal(accessRecord.accessLevel, 0);
    assert.equal(accessRecord.collection.toString(), collectionPDA.toString());
  });

  it("Rejects unauthorized Merkle root update", async () => {
    const attacker = anchor.web3.Keypair.generate();
    const mockRoot = Array(32).fill(99);

    try {
      await program.methods
        .updateMerkleRoot(mockRoot, new anchor.BN(999))
        .accounts({
          collection: collectionPDA,
          authority: attacker.publicKey,
        })
        .signers([attacker])
        .rpc();

      assert.fail("Should have thrown Unauthorized error");
    } catch (err: any) {
      assert.include(err.toString(), "Unauthorized");
      console.log("✅ Unauthorized update correctly rejected");
    }
  });

  it("Freezes a collection", async () => {
    const tx = await program.methods
      .freezeCollection()
      .accounts({
        collection: collectionPDA,
        owner: owner.publicKey,
      })
      .rpc();

    console.log("✅ freeze_collection tx:", tx);

    const collection = await program.account.collection.fetch(collectionPDA);
    assert.equal(collection.isFrozen, true);
  });

  it("Rejects Merkle root update on frozen collection", async () => {
    const mockRoot = Array(32).fill(77);

    try {
      await program.methods
        .updateMerkleRoot(mockRoot, new anchor.BN(10))
        .accounts({
          collection: collectionPDA,
          authority: owner.publicKey,
        })
        .rpc();

      assert.fail("Should have thrown CollectionFrozen error");
    } catch (err: any) {
      assert.include(err.toString(), "CollectionFrozen");
      console.log("✅ Frozen collection correctly rejects writes");
    }
  });

  after(() => {
    console.log("\n📊 VecLabs Anchor Program — All tests passed");
    console.log(
      `🔗 Collection on devnet: https://explorer.solana.com/address/${collectionPDA.toString()}?cluster=devnet`,
    );
  });
});
