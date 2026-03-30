import css from './styles/inspector.css?inline';

export interface InspectorData {
  stats: {
    totalMemories: number;
    dimensions: number;
    currentMerkleRoot: string;
    onChainRoot: string;
    rootsMatch: boolean;
    lastWriteAt: number;
    lastChainSyncAt: number;
    hnswLayerCount: number;
    memoryUsageBytes: number;
    encrypted: boolean;
  };
  memories: Array<{
    id: string;
    vector: number[];
    metadata: Record<string, unknown>;
    writtenAt: number;
    merkleRootAtWrite: string;
    hnswLayer: number;
    neighborCount: number;
  }>;
  totalMatching: number;
  merkleHistory: Array<{
    root: string;
    timestamp: number;
    memoryCountAtTime: number;
    trigger: string;
  }>;
}

function relativeTime(ms: number): string {
  if (!ms) return '-';
  const diff = Date.now() - ms;
  if (diff < 1000) return 'just now';
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + '…' : s;
}

export class InspectorPanel extends HTMLElement {
  private _data: InspectorData | null = null;
  private _selectedId: string | null = null;
  private _merkleOpen = false;
  private _searchText = '';
  private _findSimilarDelegationBound = false;

  static get observedAttributes() {
    return ['collection-name'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._render();
  }

  set data(val: InspectorData) {
    this._data = val;
    this._render();
  }

  get data(): InspectorData | null {
    return this._data;
  }

  update(data: InspectorData) {
    this._data = data;
    this._render();
  }

  private _render() {
    if (!this.shadowRoot) return;
    const d = this._data;
    const name = this.getAttribute('collection-name') ?? 'Collection';

    const filtered = d
      ? d.memories.filter((m) =>
          this._searchText
            ? m.id.includes(this._searchText) ||
              JSON.stringify(m.metadata).toLowerCase().includes(this._searchText.toLowerCase())
            : true,
        )
      : [];

    const selected = d && this._selectedId
      ? d.memories.find((m) => m.id === this._selectedId) ?? null
      : null;

    this.shadowRoot.innerHTML = `
      <style>${css}</style>
      <div class="vi-panel">
        ${this._renderHeader(name, d)}
        ${d ? this._renderStats(d) : ''}
        ${this._renderSearch(filtered.length, d?.totalMatching ?? 0)}
        <div class="vi-body">
          <div class="vi-list">${this._renderList(filtered)}</div>
          <div class="vi-detail ${selected ? 'vi-detail--open' : ''}">${
            selected ? this._renderDetail(selected) : ''
          }</div>
        </div>
        ${d ? this._renderMerkle(d) : ''}
      </div>
    `;

    this._attachEvents();
  }

  private _renderHeader(name: string, d: InspectorData | null): string {
    const verified = d?.stats.rootsMatch ?? false;
    return `
      <div class="vi-header">
        <span class="vi-header-title">${name}</span>
        <div class="vi-header-actions">
          <span class="vi-badge ${verified ? 'vi-badge--verified' : 'vi-badge--unsynced'}">
            ${verified ? '✓ verified' : '! unsynced'}
          </span>
          <button class="vi-btn" data-action="refresh">Refresh</button>
          <button class="vi-btn" data-action="export">Export JSON</button>
        </div>
      </div>
    `;
  }

  private _renderStats(d: InspectorData): string {
    const s = d.stats;
    return `
      <div class="vi-stats">
        <div class="vi-stat">
          <div class="vi-stat-value">${s.totalMemories}</div>
          <div class="vi-stat-label">Memories</div>
        </div>
        <div class="vi-stat">
          <div class="vi-stat-value">${s.dimensions}</div>
          <div class="vi-stat-label">Dimensions</div>
        </div>
        <div class="vi-stat">
          <div class="vi-stat-value">${formatBytes(s.memoryUsageBytes)}</div>
          <div class="vi-stat-label">Memory</div>
        </div>
        <div class="vi-stat">
          <div class="vi-stat-value">${s.hnswLayerCount}</div>
          <div class="vi-stat-label">HNSW Layers</div>
        </div>
        <div class="vi-stat">
          <div class="vi-stat-value">${relativeTime(s.lastWriteAt)}</div>
          <div class="vi-stat-label">Last Write</div>
        </div>
        <div class="vi-stat">
          <div class="vi-stat-value">${s.encrypted ? 'yes' : 'no'}</div>
          <div class="vi-stat-label">Encrypted</div>
        </div>
      </div>
    `;
  }

  private _renderSearch(showing: number, total: number): string {
    return `
      <div class="vi-search">
        <input type="text" placeholder="Filter by ID or metadata…" value="${this._searchText}" data-action="search" />
        <span class="vi-search-count">Showing ${showing} of ${total}</span>
      </div>
    `;
  }

  private _renderList(memories: InspectorData['memories']): string {
    if (!memories.length) {
      return '<div style="padding:24px 16px;text-align:center;color:var(--text-dim);font-size:12px;">No memories found</div>';
    }
    return memories
      .map(
        (m) => `
      <div class="vi-row ${m.id === this._selectedId ? 'vi-row--selected' : ''}" data-id="${m.id}">
        <span class="vi-row-cell vi-row-id">${truncate(m.id, 24)}</span>
        <span class="vi-row-cell vi-row-time">${relativeTime(m.writtenAt)}</span>
        <span class="vi-row-cell vi-row-layer">L${m.hnswLayer}</span>
        <span class="vi-row-cell vi-row-neighbors">${m.neighborCount}n</span>
        <span class="vi-row-cell vi-row-meta">${truncate(JSON.stringify(m.metadata), 32)}</span>
      </div>
    `,
      )
      .join('');
  }

  private _renderDetail(m: InspectorData['memories'][0]): string {
    const bars = m.vector.slice(0, 8);
    const maxAbs = Math.max(0.001, ...bars.map(Math.abs));
    return `
      <div class="vi-detail-section">
        <div class="vi-detail-label">Memory ID</div>
        <div class="vi-detail-value">${m.id}</div>
      </div>
      <div class="vi-detail-section">
        <div class="vi-detail-label">Vector Preview (first 8 dims)</div>
        <div class="vi-vector-bars">
          ${bars
            .map((v) => {
              const h = Math.max(2, (Math.abs(v) / maxAbs) * 40);
              const active = Math.abs(v) / maxAbs >= 0.5 ? ' vi-vector-bar--active' : '';
              return `<div class="vi-vector-bar${active}" style="height:${h}px"></div>`;
            })
            .join('')}
        </div>
      </div>
      <div class="vi-detail-section">
        <div class="vi-detail-label">Metadata</div>
        <div class="vi-detail-json">${JSON.stringify(m.metadata, null, 2)}</div>
      </div>
      <div class="vi-detail-section">
        <div class="vi-detail-label">Written At</div>
        <div class="vi-detail-value">${new Date(m.writtenAt).toISOString()}</div>
      </div>
      <div class="vi-detail-section">
        <div class="vi-detail-label">Merkle Root at Write</div>
        <div class="vi-detail-value" style="font-size:10px;">${m.merkleRootAtWrite || '-'}</div>
      </div>
      <div class="vi-detail-section">
        <div class="vi-detail-label">HNSW Layer / Neighbors</div>
        <div class="vi-detail-value">Layer ${m.hnswLayer} · ${m.neighborCount} neighbors</div>
      </div>
      <button class="vi-btn" data-action="find-similar" data-id="${m.id}" style="width:100%;">Find Similar</button>
    `;
  }

  private _renderMerkle(d: InspectorData): string {
    const history = d.merkleHistory ?? [];
    return `
      <div class="vi-merkle">
        <div class="vi-merkle-toggle" data-action="toggle-merkle">
          Merkle Timeline (${history.length} entries) ${this._merkleOpen ? '▾' : '▸'}
        </div>
        <div class="vi-merkle-body ${this._merkleOpen ? 'vi-merkle-body--open' : ''}">
          <div class="vi-timeline">
            ${history
              .map(
                (entry, i) => `
              ${i > 0 ? '<div class="vi-tl-line"></div>' : ''}
              <div class="vi-tl-node" data-merkle-idx="${i}">
                <div class="vi-tl-tooltip">${entry.root}</div>
                <div class="vi-tl-dot"></div>
                <div class="vi-tl-root">${truncate(entry.root, 8)}</div>
                <div class="vi-tl-time">${relativeTime(entry.timestamp)}</div>
                <div class="vi-tl-badge">${entry.trigger} · ${entry.memoryCountAtTime}</div>
              </div>
            `,
              )
              .join('')}
          </div>
        </div>
      </div>
    `;
  }

  private _attachEvents() {
    if (!this.shadowRoot) return;

    this.shadowRoot.querySelectorAll('.vi-row').forEach((el) => {
      el.addEventListener('click', () => {
        this._selectedId = (el as HTMLElement).dataset.id ?? null;
        this._render();
      });
    });

    const searchInput = this.shadowRoot.querySelector('[data-action="search"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        this._searchText = searchInput.value;
        this._render();
        const newInput = this.shadowRoot?.querySelector('[data-action="search"]') as HTMLInputElement;
        if (newInput) {
          newInput.focus();
          newInput.setSelectionRange(newInput.value.length, newInput.value.length);
        }
      });
    }

    this.shadowRoot.querySelector('[data-action="toggle-merkle"]')?.addEventListener('click', () => {
      this._merkleOpen = !this._merkleOpen;
      this._render();
    });

    this.shadowRoot.querySelector('[data-action="refresh"]')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('inspector-refresh'));
    });

    this.shadowRoot.querySelector('[data-action="export"]')?.addEventListener('click', () => {
      if (!this._data) return;
      const blob = new Blob([JSON.stringify(this._data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `veclabs-inspection-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    if (!this._findSimilarDelegationBound) {
      this._findSimilarDelegationBound = true;
      this.shadowRoot.addEventListener('click', (e) => {
        const t = e.target as HTMLElement;
        const findBtn = t.closest('[data-action="find-similar"]');
        if (!findBtn || !this.shadowRoot?.contains(findBtn)) return;
        const id = findBtn.getAttribute('data-id');
        if (id) {
          this.dispatchEvent(
            new CustomEvent('inspector-find-similar', { detail: { id }, bubbles: true, composed: true }),
          );
        }
      });
    }
  }
}
