import './styles/demo.css';
import { AgentLoop, SimpleMemory } from './agent/AgentLoop';
import { SimpleHNSW } from './demo/SimpleHNSW';

// Inline the InspectorPanel web component (no external package dep needed)
import { InspectorPanel, InspectorData } from './InspectorPanel';

if (!customElements.get('veclabs-inspector')) {
  customElements.define('veclabs-inspector', InspectorPanel);
}

const store = new SimpleHNSW();
const inspectorEl = document.querySelector('veclabs-inspector') as InspectorPanel;
const feedEl = document.getElementById('feed')!;
const queryResultsEl = document.getElementById('query-results')!;
let tamperTargetId: string | null = null;
let queryOpen = false;

function computeMerkleRoot(ids: string[]): string {
  let hash = 0;
  const sorted = [...ids].sort();
  for (const id of sorted) {
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
    }
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

const merkleHistory: InspectorData['merkleHistory'] = [];
const writtenAtMap = new Map<string, number>();

function buildInspectorData(): InspectorData {
  const entries = store.getAllEntries();
  const ids = store.getAllIds();
  const root = computeMerkleRoot(ids);

  return {
    stats: {
      totalMemories: store.size(),
      dimensions: 64,
      currentMerkleRoot: root,
      onChainRoot: '',
      rootsMatch: !tamperTargetId,
      lastWriteAt: Math.max(0, ...Array.from(writtenAtMap.values())),
      lastChainSyncAt: 0,
      hnswLayerCount: 1,
      memoryUsageBytes: store.size() * 64 * 4,
      encrypted: false,
    },
    memories: entries.map((e) => ({
      id: e.id,
      vector: e.values,
      metadata: e.metadata,
      writtenAt: writtenAtMap.get(e.id) ?? 0,
      merkleRootAtWrite: '',
      hnswLayer: 0,
      neighborCount: 0,
    })),
    totalMatching: entries.length,
    merkleHistory,
  };
}

function refreshInspector() {
  inspectorEl.update(buildInspectorData());
}

function addFeedItem(mem: SimpleMemory, isUser = false) {
  const el = document.createElement('div');
  el.className = 'feed-item';
  el.innerHTML = `
    <div class="feed-dot ${isUser ? 'feed-dot--user' : ''}"></div>
    <div class="feed-content">
      <div class="feed-id">${mem.id}</div>
      <div class="feed-text">${mem.text}</div>
      <div class="feed-meta">${(mem.metadata.category as string) ?? ''} · ${new Date(mem.writtenAt).toLocaleTimeString()}</div>
    </div>
  `;
  feedEl.prepend(el);

  if (feedEl.children.length > 100) {
    feedEl.removeChild(feedEl.lastChild!);
  }
}

const agent = new AgentLoop(
  store,
  (mem) => {
    writtenAtMap.set(mem.id, mem.writtenAt);
    const ids = store.getAllIds();
    const root = computeMerkleRoot(ids);
    merkleHistory.push({
      root,
      timestamp: Date.now(),
      memoryCountAtTime: store.size(),
      trigger: 'write',
    });
    addFeedItem(mem);
  },
  refreshInspector,
);

// ── Controls ──
document.getElementById('btn-pause')!.addEventListener('click', () => {
  const btn = document.getElementById('btn-pause')!;
  if (agent.isRunning()) {
    agent.pause();
    btn.textContent = 'Resume';
    btn.classList.add('demo-btn--active');
  } else {
    agent.start();
    btn.textContent = 'Pause';
    btn.classList.remove('demo-btn--active');
  }
});

document.getElementById('btn-tamper')!.addEventListener('click', () => {
  const ids = store.getAllIds();
  if (!ids.length) return;
  tamperTargetId = ids[ids.length - 1];
  agent.tamperMemory(tamperTargetId);
  document.getElementById('btn-restore')!.style.display = '';
});

document.getElementById('btn-restore')!.addEventListener('click', () => {
  if (tamperTargetId) {
    agent.restoreMemory(tamperTargetId);
    tamperTargetId = null;
    document.getElementById('btn-restore')!.style.display = 'none';
  }
});

document.getElementById('btn-query')!.addEventListener('click', () => {
  queryOpen = !queryOpen;
  queryResultsEl.classList.toggle('query-results--open', queryOpen);
});

document.getElementById('btn-export')!.addEventListener('click', () => {
  const data = buildInspectorData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `veclabs-demo-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

// ── User input ──
const inputEl = document.getElementById('user-input') as HTMLInputElement;
const sendBtn = document.getElementById('btn-send')!;

async function handleSend() {
  const text = inputEl.value.trim();
  if (!text) return;
  inputEl.value = '';

  if (queryOpen) {
    const results = agent.queryMemories(text, 5);
    queryResultsEl.innerHTML = results
      .map(
        (r) =>
          `<div class="query-result-item"><span class="query-result-text">${r.text}</span><span class="query-result-score">${r.score.toFixed(4)}</span></div>`,
      )
      .join('');
    return;
  }

  const mem = await agent.addCustomMemory(text);
  addFeedItem(mem, true);
}

sendBtn.addEventListener('click', handleSend);
inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSend();
});

// ── Inspector events ──
inspectorEl.addEventListener('inspector-refresh', refreshInspector);

// ── Auto-start ──
agent.start();
refreshInspector();
