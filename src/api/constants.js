// API Configuration
export const API_BASE = 'https://sapis.gocobalt.io/api/v1';
export const WORKFLOW_ID = '69cb8e2cdd1d9c12a6e03b99';
export const API_KEY = 'tk42aa441c-7f2a-4f76-a08f-3a1f99fc4df0';
export const LINKED_ACCOUNT_ID = 'cobalt_test_user';
export const SLUG = 'Coba-6128';

export const TRIGGER_URL = `${API_BASE}/workflow/${WORKFLOW_ID}/execute`;
export const POLL_URL = (executionId) => `${API_BASE}/execution/${executionId}/response`;

export const COMMON_HEADERS = {
  'X-API-Key': API_KEY,
  'linked_account_id': LINKED_ACCOUNT_ID,
};

export const TRIGGER_HEADERS = {
  ...COMMON_HEADERS,
  'Content-Type': 'application/json',
  'slug': SLUG,
};

// Polling config
export const INITIAL_POLL_DELAY = 2000;
export const POLL_INTERVAL = 3000;
export const MAX_POLL_DURATION = 120000;
export const EXTENDED_POLL_DURATION = 60000;
export const MAX_RETRIES = 3;
export const RETRY_DELAY = 2000;

// Status messages that cycle during loading
export const STATUS_MESSAGES = [
  { text: 'Connecting to SAP S/4HANA...', minTime: 0 },
  { text: 'Fetching material master data...', minTime: 3000 },
  { text: 'Harmonizing to Kinaxis schema...', minTime: 10000 },
  { text: 'Mapping source tables...', minTime: 20000 },
  { text: 'Finalizing records...', minTime: 30000 },
];

// Material type badge colors
export const TYPE_COLORS = {
  FERT: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  HALB: { bg: 'bg-blue-100', text: 'text-blue-800' },
  ROH:  { bg: 'bg-amber-100', text: 'text-amber-800' },
  HAWA: { bg: 'bg-purple-100', text: 'text-purple-800' },
  VERP: { bg: 'bg-rose-100', text: 'text-rose-800' },
  DIEN: { bg: 'bg-cyan-100', text: 'text-cyan-800' },
  NLAG: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  UNBW: { bg: 'bg-slate-100', text: 'text-slate-800' },
};

// Source pill colors
export const SOURCE_COLORS = {
  A_Product:          { bg: 'bg-blue-500', label: 'Product' },
  A_ProductPlant:     { bg: 'bg-emerald-500', label: 'Plant' },
  A_ProductStorage:   { bg: 'bg-amber-500', label: 'Storage' },
};

// Type labels
export const TYPE_LABELS = {
  FERT: 'Finished Good',
  HALB: 'Semi-Finished',
  ROH:  'Raw Material',
  HAWA: 'Trading Good',
  VERP: 'Packaging',
  DIEN: 'Service',
  NLAG: 'Non-Stock',
  UNBW: 'Non-Valuated',
};
