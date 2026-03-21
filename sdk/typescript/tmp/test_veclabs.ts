const { SolVec } = require('./dist/index.js');

async function main() {
  console.log('Starting...');

  const sv = new SolVec({
    network: 'devnet',
    walletPath: '/Users/dhirkatre/.config/solana/id.json'
  });

  const col = sv.collection('test', { dimensions: 3, metric: 'cosine' });

  console.log('\n=== 1. UPSERT ===');
  await col.upsert([
    { id: 'apple',      values: [1, 0, 0],       metadata: { content: 'apple is a fruit' } },
    { id: 'banana',     values: [0.9, 0.1, 0],   metadata: { content: 'banana is yellow' } },
    { id: 'car',        values: [0, 0, 1],        metadata: { content: 'car is a vehicle' } },
    { id: 'truck',      values: [0.1, 0, 0.9],   metadata: { content: 'truck is a big vehicle' } },
    { id: 'watermelon', values: [0.8, 0.2, 0],   metadata: { content: 'watermelon is a big fruit' } },
  ]);
  console.log('Upserted 5 vectors');

  console.log('\n=== 2. QUERY - fruits ===');
  const r1 = await col.query({ vector: [1, 0, 0], topK: 3 });
  r1.matches.forEach(m => {
    console.log('  ' + m.id + ' - score: ' + m.score.toFixed(4) + ' - ' + m.metadata.content);
  });

  console.log('\n=== 3. QUERY - vehicles ===');
  const r2 = await col.query({ vector: [0, 0, 1], topK: 3 });
  r2.matches.forEach(m => {
    console.log('  ' + m.id + ' - score: ' + m.score.toFixed(4) + ' - ' + m.metadata.content);
  });

  console.log('\n=== 4. UPDATE - overwrite apple ===');
  await col.upsert([
    { id: 'apple', values: [0.95, 0.05, 0], metadata: { content: 'apple is a red fruit' } }
  ]);
  const r3 = await col.query({ vector: [1, 0, 0], topK: 1 });
  console.log('  apple after update: ' + r3.matches[0].metadata.content);

  console.log('\n=== 5. STATS ===');
  const stats = await col.describeIndexStats();
  console.log('  ' + JSON.stringify(stats));

  console.log('\n=== 6. DELETE - remove car and truck ===');
  await col.delete(['car', 'truck']);
  const r4 = await col.query({ vector: [0, 0, 1], topK: 3 });
  console.log('  Results after delete: ' + r4.matches.length + ' matches');
  r4.matches.forEach(m => {
    console.log('  ' + m.id + ' - score: ' + m.score.toFixed(4));
  });

  console.log('\n=== 7. VERIFY ===');
  const proof = await col.verify();
  console.log('  match: ' + proof.match);
  console.log('  local root:    ' + proof.localRoot);
  console.log('  on-chain root: ' + proof.onChainRoot);

  console.log('\nDone.');
}

main().catch(err => {
  console.error('ERROR:', err.message || err);
  process.exit(1);
});