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
const btnQuery = document.getElementById('btn-query')!;
const btnSend = document.getElementById('btn-send')!;
const inputEl = document.getElementById('user-input') as HTMLInputElement;
let tamperTargetId: string | null = null;
let queryOpen = false;

function escapeHtml(s: string): string {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function renderQueryResults(items: Array<{ text: string; score: number }>, emptyMessage?: string) {
  if (!items.length) {
    const msg = emptyMessage ?? 'No similar memories found';
    queryResultsEl.innerHTML = `<div class="query-result-empty">${escapeHtml(msg)}</div>`;
    return;
  }
  queryResultsEl.innerHTML = items
    .map(
      (r) =>
        `<div class="query-result-item"><span class="query-result-text">${escapeHtml(r.text)}</span><span class="query-result-score">${r.score.toFixed(4)}</span></div>`,
    )
    .join('');
}

function setQueryMode(open: boolean) {
  queryOpen = open;
  queryResultsEl.classList.toggle('query-results--open', open);
  btnQuery.textContent = open ? 'Done' : 'Query';
  btnQuery.classList.toggle('demo-btn--active', open);
  btnSend.textContent = open ? 'Search' : 'Send';
  inputEl.placeholder = open
    ? 'Type similar text, then Enter or Search…'
    : 'Type a memory or query…';
  if (open && store.size() === 0) {
    queryResultsEl.innerHTML = '<div class="query-result-empty">No memories stored yet</div>';
  } else if (open && !queryResultsEl.querySelector('.query-result-item')) {
    queryResultsEl.innerHTML =
      '<div class="query-result-hint">Top 5 matches by cosine similarity (no minimum score).</div>';
  }
}

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
const merkleRootAtWriteMap = new Map<string, string>();

function buildInspectorData(): InspectorData {
  const entries = store.getAllEntries();
  const allIds = store.getAllIds();
  const totalCount = allIds.length;
  const topLayerCutoff = Math.max(1, Math.floor(totalCount * 0.1));
  const root = computeMerkleRoot(allIds);

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
    memories: entries.map((e) => {
      const neighbors = store
        .query(e.values, 6)
        .filter((r) => r.id !== e.id && r.score > 0.3);
      const insertionIndex = allIds.indexOf(e.id);
      const hnswLayer = insertionIndex < topLayerCutoff ? 1 : 0;
      return {
        id: e.id,
        vector: e.values,
        metadata: e.metadata,
        writtenAt: writtenAtMap.get(e.id) ?? 0,
        merkleRootAtWrite: merkleRootAtWriteMap.get(e.id) ?? '',
        hnswLayer,
        neighborCount: neighbors.length,
      };
    }),
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
    merkleRootAtWriteMap.set(mem.id, root);
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

btnQuery.addEventListener('click', () => {
  setQueryMode(!queryOpen);
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
async function handleSend() {
  const text = inputEl.value.trim();
  if (!text) return;

  if (queryOpen) {
    if (store.size() === 0) {
      renderQueryResults([], 'No memories stored yet');
      return;
    }
    const results = agent.queryMemories(text, 5);
    renderQueryResults(results, 'No similar memories found');
    return;
  }

  inputEl.value = '';
  const mem = await agent.addCustomMemory(text);
  addFeedItem(mem, true);
}

btnSend.addEventListener('click', handleSend);
inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') void handleSend();
});

// ── Inspector events ──
inspectorEl.addEventListener('inspector-refresh', refreshInspector);

inspectorEl.addEventListener('inspector-find-similar', ((e: CustomEvent<{ id: string }>) => {
  setQueryMode(true);
  if (store.size() === 0) {
    queryResultsEl.innerHTML = '<div class="query-result-empty">No memories stored yet</div>';
    return;
  }
  const results = agent.querySimilarToMemory(e.detail.id, 5);
  renderQueryResults(results, 'No similar memories found');
}) as EventListener);

// ── Auto-start ──
agent.start();
refreshInspector();
