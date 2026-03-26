export { InspectorPanel } from './InspectorPanel';
export type { InspectorData } from './InspectorPanel';

import { InspectorPanel } from './InspectorPanel';

if (typeof window !== 'undefined' && !customElements.get('veclabs-inspector')) {
  customElements.define('veclabs-inspector', InspectorPanel);
}
