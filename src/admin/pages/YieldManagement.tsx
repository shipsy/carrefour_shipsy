import { useState, useEffect, useRef } from 'react';
import {
  Table, Input, InputNumber, Select, Button, Switch, Tag, Space,
  Drawer, Form, Tabs, Modal, Divider, Row, Col, Popconfirm,
  message,
} from 'antd';
import {
  SearchOutlined, DeleteOutlined, EditOutlined,
  PlusOutlined, CloseOutlined, FileAddOutlined,
  UploadOutlined, DownloadOutlined, InboxOutlined, LeftOutlined, RightOutlined,
} from '@ant-design/icons';
import { Dropdown as AntDropdown } from 'antd';
import { stores as adminStores } from '../data';
import { saveYieldConfig } from '../../engine/config-store';

// ── Types ────────────────────────────────────────────────────

interface SurgeTier { capacityAbovePct: number; amount: number }
interface SegmentRow { segment: string; discountPct: number; freeAbove: number; maxFee: number }
interface PricingRule {
  priority: number; name: string; type: 'exclusive' | 'cumulative';
  condition: { type: string; value: any };
  action: { type: string; value?: any };
  active: boolean;
}
interface YieldRecord {
  configId: string; storeId: string; storeName: string;
  businessLine: string; serviceType: string; version: number; isActive: boolean;
  basePricing: { baseFee: number; floorPrice: number; currency: string };
  multipliers: {
    timeOfDay: Record<string, number>;
    dayOfWeek: Record<string, number>;
    demand: { enabled: boolean; maxFactor: number; formula: string };
  };
  surge: { enabled: boolean; tiers: SurgeTier[] };
  greenIncentive: { enabled: boolean; discountPct: number; criteria: string[] };
  segmentPricing: SegmentRow[];
  rules: PricingRule[];
  rounding: { enabled: boolean; strategy: string };
  priceLock: { enabled: boolean; durationMinutes: number };
}

// ── Constants ────────────────────────────────────────────────

const BL_OPTIONS = [
  { label: 'LAD (Home Delivery)', value: 'LAD' },
  { label: 'Drive (Click & Collect)', value: 'Drive' },
  { label: 'Fast Delivery', value: 'FastDelivery' },
];
const SERVICE_OPTIONS = [
  { label: 'Home', value: 'home' },
  { label: 'Drive', value: 'drive' },
  { label: 'Express', value: 'express' },
];
const CONDITION_TYPES = [
  { value: 'segment', label: 'Segment' }, { value: 'promo_code', label: 'Promo Code' },
  { value: 'green_slot', label: 'Green Slot' }, { value: 'capacity_above', label: 'Capacity Above' },
  { value: 'basket_above', label: 'Basket Above' }, { value: 'always', label: 'Always' },
];
const ACTION_TYPES = [
  { value: 'set_price', label: 'Set Price' }, { value: 'discount_pct', label: 'Discount %' },
  { value: 'discount_from_promo', label: 'Discount from Promo' },
  { value: 'surcharge_flat', label: 'Surcharge Flat' }, { value: 'enforce_floor', label: 'Enforce Floor' },
];
const GREEN_OPTS = [
  'Vehicle already in neighborhood', 'Off-peak window', 'Electric vehicle route',
  'Consolidation opportunity', 'Low-emission zone delivery', 'Batch delivery (3+ orders same area)',
];
const TOD_KEYS = ['morning', 'afternoon', 'evening'];
const DOW_KEYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// ── Seed Data ────────────────────────────────────────────────

// ── Realistic rate card configs per store type × business line ──
// Based on Carrefour Belgium RFQ: LAD hubs serve large zones (higher base, more surge),
// Hypermarkets do Drive + Fast (medium pricing), Markets do local Fast + C&C (lower base),
// Express stores do ultra-fast only (highest per-delivery fee, smallest capacity).

// Base pricing matrix: [storeType][serviceType]
const PRICING: Record<string, Record<string, { base: number; floor: number; greenPct: number; surgeThresh: number; surgeAmts: number[]; maxDemand: number }>> = {
  LAD_Hub: {
    home: { base: 5.99, floor: 1.99, greenPct: 25, surgeThresh: 75, surgeAmts: [1.0, 2.0, 4.0], maxDemand: 0.6 },
    fast: { base: 8.99, floor: 4.99, greenPct: 15, surgeThresh: 70, surgeAmts: [2.0, 4.0, 6.0], maxDemand: 0.8 },
    collect: { base: 2.99, floor: 0.99, greenPct: 0, surgeThresh: 85, surgeAmts: [0.5, 1.5], maxDemand: 0.3 },
  },
  Hypermarket: {
    fast: { base: 6.99, floor: 3.99, greenPct: 20, surgeThresh: 75, surgeAmts: [1.5, 3.0, 5.0], maxDemand: 0.7 },
    collect: { base: 1.99, floor: 0.00, greenPct: 0, surgeThresh: 90, surgeAmts: [0.5], maxDemand: 0.2 },
  },
  Market: {
    fast: { base: 7.49, floor: 4.49, greenPct: 15, surgeThresh: 70, surgeAmts: [2.0, 3.5], maxDemand: 0.7 },
    collect: { base: 1.49, floor: 0.00, greenPct: 0, surgeThresh: 85, surgeAmts: [0.5], maxDemand: 0.2 },
  },
  Express: {
    fast: { base: 9.99, floor: 5.99, greenPct: 10, surgeThresh: 65, surgeAmts: [2.5, 5.0, 7.0], maxDemand: 0.9 },
  },
};

// ToD weights vary by business line
const TOD_BY_BL: Record<string, Record<string, number>> = {
  home: { morning: 0.85, afternoon: 1.00, evening: 1.40 },
  fast: { morning: 1.00, afternoon: 1.10, evening: 1.50 },
  collect: { morning: 0.90, afternoon: 1.00, evening: 1.20 },
};

// DoW weights vary by business line
const DOW_BY_BL: Record<string, Record<string, number>> = {
  home: { Monday: 0.90, Tuesday: 0.85, Wednesday: 0.90, Thursday: 1.00, Friday: 1.15, Saturday: 1.30, Sunday: 0.70 },
  fast: { Monday: 1.00, Tuesday: 1.00, Wednesday: 1.00, Thursday: 1.05, Friday: 1.20, Saturday: 1.40, Sunday: 0.90 },
  collect: { Monday: 0.95, Tuesday: 0.90, Wednesday: 0.95, Thursday: 1.00, Friday: 1.10, Saturday: 1.20, Sunday: 0.80 },
};

// Segment pricing varies by store type
const SEGMENTS_BY_TYPE: Record<string, SegmentRow[]> = {
  LAD_Hub: [
    { segment: 'standard', discountPct: 0, freeAbove: 200, maxFee: 12.99 },
    { segment: 'plus', discountPct: 15, freeAbove: 150, maxFee: 9.99 },
    { segment: 'premium', discountPct: 30, freeAbove: 100, maxFee: 7.99 },
    { segment: 'vip', discountPct: 100, freeAbove: 0, maxFee: 0 },
  ],
  Hypermarket: [
    { segment: 'standard', discountPct: 0, freeAbove: 150, maxFee: 9.99 },
    { segment: 'plus', discountPct: 10, freeAbove: 100, maxFee: 7.99 },
    { segment: 'premium', discountPct: 25, freeAbove: 75, maxFee: 5.99 },
    { segment: 'vip', discountPct: 100, freeAbove: 0, maxFee: 0 },
  ],
  Market: [
    { segment: 'standard', discountPct: 0, freeAbove: 120, maxFee: 8.99 },
    { segment: 'plus', discountPct: 10, freeAbove: 80, maxFee: 6.99 },
    { segment: 'premium', discountPct: 20, freeAbove: 60, maxFee: 4.99 },
    { segment: 'vip', discountPct: 100, freeAbove: 0, maxFee: 0 },
  ],
  Express: [
    { segment: 'standard', discountPct: 0, freeAbove: 250, maxFee: 14.99 },
    { segment: 'plus', discountPct: 10, freeAbove: 200, maxFee: 12.99 },
    { segment: 'premium', discountPct: 20, freeAbove: 150, maxFee: 9.99 },
    { segment: 'vip', discountPct: 100, freeAbove: 0, maxFee: 0 },
  ],
};

// Green criteria depends on service type
const GREEN_BY_ST: Record<string, string[]> = {
  home: ['Vehicle already in neighborhood', 'Off-peak window', 'Electric vehicle route', 'Consolidation opportunity'],
  fast: ['Electric vehicle route', 'Store proximity (< 5 km)'],
  collect: [],
};

function getStoreType(store: typeof adminStores[0]): string {
  const name = store.name.toLowerCase();
  if (store.id.startsWith('exp-')) return 'Express';
  if (store.id.startsWith('mkt-')) return 'Market';
  if (store.id.startsWith('hyper-')) return 'Hypermarket';
  if (name.includes('lad') || ['4459', '4660', '4661'].includes(store.id)) return 'LAD_Hub';
  return 'Hypermarket';
}

let _idCounter = 0;

function makeRecord(store: typeof adminStores[0], bl: string, st: string): YieldRecord {
  const storeType = getStoreType(store);
  const p = PRICING[storeType]?.[st] || PRICING['Hypermarket']?.['fast'] || { base: 5.99, floor: 1.99, greenPct: 20, surgeThresh: 80, surgeAmts: [1.5, 3.0], maxDemand: 0.6 };

  // Per-store variation: deterministic ±5% from store ID hash
  const seed = store.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const vary = (v: number, pct = 5) => +(v * (1 + ((seed % (pct * 2)) - pct) / 100)).toFixed(2);

  const surgeTiers: SurgeTier[] = p.surgeAmts.map((amt, i) => ({
    capacityAbovePct: p.surgeThresh + i * 10,
    amount: vary(amt, 10),
  }));

  const rules: PricingRule[] = [
    { priority: 1, name: 'VIP Free Delivery', type: 'exclusive', condition: { type: 'segment', value: 'vip' }, action: { type: 'set_price', value: 0 }, active: true },
    { priority: 2, name: 'Segment Discount', type: 'exclusive', condition: { type: 'segment', value: 'any_non_standard' }, action: { type: 'discount_pct', value: 'from_segment_table' }, active: true },
    { priority: 3, name: 'Promo Code', type: 'cumulative', condition: { type: 'promo_code', value: 'valid_code_applied' }, action: { type: 'discount_from_promo', value: null }, active: true },
  ];

  if (p.greenPct > 0) {
    rules.push({ priority: 4, name: 'Green Slot Discount', type: 'cumulative', condition: { type: 'green_slot', value: true }, action: { type: 'discount_pct', value: p.greenPct }, active: true });
  }

  rules.push(
    { priority: 5, name: 'Surge Pricing', type: 'cumulative', condition: { type: 'capacity_above', value: 'from_surge_tiers' }, action: { type: 'surcharge_flat', value: 'from_surge_tiers' }, active: true },
    { priority: 6, name: 'Free Delivery Threshold', type: 'exclusive', condition: { type: 'basket_above', value: 'from_segment_table' }, action: { type: 'set_price', value: 0 }, active: true },
    { priority: 99, name: 'Floor Price', type: 'exclusive', condition: { type: 'always', value: true }, action: { type: 'enforce_floor', value: vary(p.floor) }, active: true },
  );

  return {
    configId: `yield-${store.id}-${st}-${(++_idCounter).toString(36)}`,
    storeId: store.id, storeName: store.name,
    businessLine: bl, serviceType: st, version: 1, isActive: true,
    basePricing: { baseFee: vary(p.base), floorPrice: vary(p.floor), currency: 'EUR' },
    multipliers: {
      timeOfDay: { ...(TOD_BY_BL[st] || TOD_BY_BL.home) },
      dayOfWeek: { ...(DOW_BY_BL[st] || DOW_BY_BL.home) },
      demand: { enabled: true, maxFactor: p.maxDemand, formula: st === 'fast' ? 'exponential' : 'linear' },
    },
    surge: { enabled: true, tiers: surgeTiers },
    greenIncentive: { enabled: p.greenPct > 0, discountPct: p.greenPct, criteria: GREEN_BY_ST[st] || [] },
    segmentPricing: (SEGMENTS_BY_TYPE[storeType] || SEGMENTS_BY_TYPE.Hypermarket).map(s => ({ ...s })),
    rules,
    rounding: { enabled: true, strategy: '.99' },
    priceLock: { enabled: true, durationMinutes: st === 'fast' ? 10 : 15 },
  };
}

// Build seed grouped by store
interface StoreEntity {
  id: string; name: string; type: string;
  businessLines: string[];
  configs: YieldRecord[];
}

function buildStoreEntities(): StoreEntity[] {
  // Admin stores use: LAD, Drive, FastDelivery
  // We map to service types: home, fast, collect
  const blToService: Record<string, { bl: string; st: string }> = {
    LAD: { bl: 'LAD', st: 'home' },
    FastDelivery: { bl: 'FastDelivery', st: 'fast' },
    Drive: { bl: 'Drive', st: 'collect' },
    // Also handle checkout-format keys in case mixed
    home: { bl: 'LAD', st: 'home' },
    fast: { bl: 'FastDelivery', st: 'fast' },
    collect: { bl: 'Drive', st: 'collect' },
  };
  return adminStores.map(s => {
    const storeType = getStoreType(s);
    const configs: YieldRecord[] = [];

    // LAD Hubs should have all 3 service types
    const lines = storeType === 'LAD_Hub'
      ? ['LAD', 'FastDelivery', 'Drive']
      : (s.businessLines as string[]);

    lines.forEach(line => {
      const m = blToService[line];
      if (m) {
        configs.push(makeRecord(s, m.bl, m.st));
      }
    });
    return { id: s.id, name: s.name, type: storeType, businessLines: lines, configs };
  });
}

// ── Sync helper ──────────────────────────────────────────────

// Accumulates all BL configs for a store into one flat YieldConfig for checkout
function syncStoreToCheckout(configs: YieldRecord[]) {
  if (!configs.length) return;
  const storeId = configs[0].storeId;

  // Build merged baseFees/floorPrices from all business line configs
  const baseFees = { home: 0, fast: 0, collect: 0 };
  const floorPrices = { home: 0, fast: 0, collect: 0 };
  let surgeThreshold = 80, surgeFlatAmount = 2, greenDiscountPct = 25, maxDemandFactor = 0.6;
  let todWeights = { morning: 0.85, afternoon: 1.0, evening: 1.4 };
  let dowWeights = { Monday: 0.9, Tuesday: 0.85, Wednesday: 0.9, Thursday: 1.0, Friday: 1.15, Saturday: 1.3, Sunday: 0.7 };
  let psychRounding = true;

  const blToKey: Record<string, 'home' | 'fast' | 'collect'> = { LAD: 'home', FastDelivery: 'fast', Drive: 'collect' };

  configs.forEach(rec => {
    const key = blToKey[rec.businessLine];
    if (key) {
      baseFees[key] = rec.basePricing.baseFee;
      floorPrices[key] = rec.basePricing.floorPrice;
    }
    // Use LAD (home) config as the primary for shared settings
    if (rec.businessLine === 'LAD') {
      surgeThreshold = rec.surge.tiers[0]?.capacityAbovePct ?? 80;
      surgeFlatAmount = rec.surge.tiers[0]?.amount ?? 2;
      greenDiscountPct = rec.greenIncentive.discountPct;
      todWeights = rec.multipliers.timeOfDay as any;
      dowWeights = rec.multipliers.dayOfWeek as any;
      maxDemandFactor = rec.multipliers.demand.maxFactor;
      psychRounding = rec.rounding.enabled;
    }
  });

  // If no LAD config, use the first config's shared settings
  if (!configs.some(c => c.businessLine === 'LAD') && configs.length > 0) {
    const first = configs[0];
    surgeThreshold = first.surge.tiers[0]?.capacityAbovePct ?? 80;
    surgeFlatAmount = first.surge.tiers[0]?.amount ?? 2;
    greenDiscountPct = first.greenIncentive.discountPct;
    todWeights = first.multipliers.timeOfDay as any;
    dowWeights = first.multipliers.dayOfWeek as any;
    maxDemandFactor = first.multipliers.demand.maxFactor;
    psychRounding = first.rounding.enabled;
  }

  saveYieldConfig({
    baseFees, floorPrices, surgeThreshold, surgeFlatAmount,
    greenDiscountPct, timeOfDayWeights: todWeights, dayOfWeekWeights: dowWeights,
    maxDemandFactor, psychologicalRounding: psychRounding, manualOverrides: {},
  }, storeId);
}

// Single-record sync (for backward compat) — rebuilds full store config
function syncToCheckout(rec: YieldRecord) {
  // Just write the single record's store - will be called for each BL on init
  const blToKey: Record<string, 'home' | 'fast' | 'collect'> = { LAD: 'home', FastDelivery: 'fast', Drive: 'collect' };
  const key = blToKey[rec.businessLine] || 'home';

  // Read existing config from localStorage, merge this BL's pricing in
  try {
    const existing = JSON.parse(localStorage.getItem(`shipsy_admin_yield_config_${rec.storeId}`) || '{}');
    const baseFees = existing.baseFees || { home: 0, fast: 0, collect: 0 };
    const floorPrices = existing.floorPrices || { home: 0, fast: 0, collect: 0 };
    baseFees[key] = rec.basePricing.baseFee;
    floorPrices[key] = rec.basePricing.floorPrice;

    saveYieldConfig({
      baseFees, floorPrices,
      surgeThreshold: existing.surgeThreshold ?? rec.surge.tiers[0]?.capacityAbovePct ?? 80,
      surgeFlatAmount: existing.surgeFlatAmount ?? rec.surge.tiers[0]?.amount ?? 2,
      greenDiscountPct: existing.greenDiscountPct ?? rec.greenIncentive.discountPct,
      timeOfDayWeights: existing.timeOfDayWeights ?? rec.multipliers.timeOfDay,
      dayOfWeekWeights: existing.dayOfWeekWeights ?? rec.multipliers.dayOfWeek,
      maxDemandFactor: existing.maxDemandFactor ?? rec.multipliers.demand.maxFactor,
      psychologicalRounding: existing.psychologicalRounding ?? rec.rounding.enabled,
      manualOverrides: existing.manualOverrides ?? {},
    }, rec.storeId);
  } catch {
    // Fallback: just write this BL
    saveYieldConfig({
      baseFees: { home: key === 'home' ? rec.basePricing.baseFee : 0, fast: key === 'fast' ? rec.basePricing.baseFee : 0, collect: key === 'collect' ? rec.basePricing.baseFee : 0 },
      floorPrices: { home: key === 'home' ? rec.basePricing.floorPrice : 0, fast: key === 'fast' ? rec.basePricing.floorPrice : 0, collect: key === 'collect' ? rec.basePricing.floorPrice : 0 },
      surgeThreshold: rec.surge.tiers[0]?.capacityAbovePct ?? 80,
      surgeFlatAmount: rec.surge.tiers[0]?.amount ?? 2,
      greenDiscountPct: rec.greenIncentive.discountPct,
      timeOfDayWeights: rec.multipliers.timeOfDay as any,
      dayOfWeekWeights: rec.multipliers.dayOfWeek as any,
      maxDemandFactor: rec.multipliers.demand.maxFactor,
      psychologicalRounding: rec.rounding.enabled,
      manualOverrides: {},
    }, rec.storeId);
  }
}

// ── CSV helpers ──────────────────────────────────────────────

const CSV_COLUMNS = ['Store ID', 'Store Name', 'Business Line', 'Service Type', 'Base Fee', 'Floor Price', 'Currency', 'Green Discount %', 'Surge Threshold %', 'Surge Amount', 'Morning Multiplier', 'Afternoon Multiplier', 'Evening Multiplier'];

const csvColumnMapping: Record<string, string> = {
  'Store ID': 'storeId', 'Store Name': 'storeName', 'Business Line': 'businessLine',
  'Service Type': 'serviceType', 'Base Fee': 'baseFee', 'Floor Price': 'floorPrice',
  'Currency': 'currency', 'Green Discount %': 'greenDiscountPct',
  'Surge Threshold %': 'surgeThreshold', 'Surge Amount': 'surgeAmount',
  'Morning Multiplier': 'todMorning', 'Afternoon Multiplier': 'todAfternoon', 'Evening Multiplier': 'todEvening',
};

function parseCsvToRecords(text: string): YieldRecord[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const mapped = headers.map(h => csvColumnMapping[h] || h);
  return lines.slice(1).map((line, idx) => {
    const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};
    mapped.forEach((h, i) => { row[h] = vals[i] || ''; });
    const storeId = row.storeId || `csv-${idx}`;
    const st = row.serviceType || 'home';
    return makeRecord({ id: storeId, name: row.storeName || storeId, businessLines: [row.businessLine || 'LAD'] } as any, row.businessLine || 'LAD', st);
  });
}

function generateSampleCsv(): string {
  return [CSV_COLUMNS.join(','), '4660,LAD Borsbeek,LAD,home,5.99,1.99,EUR,25,75,1.00,0.85,1.00,1.40', '4661,LAD Herstal,LAD,home,6.49,2.49,EUR,20,80,2.00,0.90,1.00,1.35'].join('\n');
}

// ── Store Type Badge ─────────────────────────────────────────

const typeColors: Record<string, string> = { LAD_Hub: '#6B21A8', Hypermarket: '#004E9A', Market: '#389E0D', Express: '#D46B08' };


// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT — Sidebar Entity Layout
// ══════════════════════════════════════════════════════════════

export default function YieldManagement() {
  const [entities] = useState<StoreEntity[]>(() => {
    const built = buildStoreEntities();
    // Sync ALL seed configs to localStorage on first load so checkout can read them
    built.forEach(store => {
      if (store.configs.length > 0) {
        syncStoreToCheckout(store.configs);
      }
    });
    return built;
  });
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [selectedStoreIdx, setSelectedStoreIdx] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeBlTab, setActiveBlTab] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<YieldRecord | null>(null);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);

  // Filtered sidebar
  const filteredEntities = sidebarSearch
    ? entities.filter(e => e.name.toLowerCase().includes(sidebarSearch.toLowerCase()) || e.id.toLowerCase().includes(sidebarSearch.toLowerCase()))
    : entities;

  const selectedStore = filteredEntities[selectedStoreIdx] || filteredEntities[0];

  // Set default active tab when store changes
  useEffect(() => {
    if (selectedStore?.configs.length > 0) {
      setActiveBlTab(selectedStore.configs[0].businessLine);
    }
  }, [selectedStoreIdx, selectedStore?.id]);

  // Active configs for selected store + business line
  const activeConfigs = selectedStore?.configs.filter(c => c.businessLine === activeBlTab) || [];

  // Handlers
  const handleEdit = (r: YieldRecord) => { setEditingConfig(r); setDrawerVisible(true); };
  const handleAdd = () => { setEditingConfig(null); setDrawerVisible(true); };
  const handleDelete = (r: YieldRecord) => {
    const idx = selectedStore.configs.findIndex(c => c.configId === r.configId);
    if (idx >= 0) selectedStore.configs.splice(idx, 1);
    message.success('Config deleted');
  };

  // Business line tabs for selected store
  const blTabs = [...new Set(selectedStore?.configs.map(c => c.businessLine) || [])];
  const blLabels: Record<string, string> = { LAD: 'LAD', Drive: 'Drive', FastDelivery: 'FastDelivery' };

  // Table columns
  const columns = [
    { title: 'S.N.', key: 'sn', width: 60, render: (_: any, __: any, i: number) => i + 1 },
    { title: 'Config ID', dataIndex: 'configId', key: 'cid', width: 200, ellipsis: true },
    { title: 'Base Fee', key: 'bf', width: 100, render: (_: any, r: YieldRecord) => `€${r.basePricing.baseFee.toFixed(2)}` },
    { title: 'Floor Price', key: 'fp', width: 100, render: (_: any, r: YieldRecord) => `€${r.basePricing.floorPrice.toFixed(2)}` },
    { title: 'Green %', key: 'gp', width: 80, render: (_: any, r: YieldRecord) => `${r.greenIncentive.discountPct}%` },
    { title: 'Surge Tiers', key: 'st', width: 90, render: (_: any, r: YieldRecord) => r.surge.tiers.length },
    { title: 'Rules', key: 'rl', width: 70, render: (_: any, r: YieldRecord) => r.rules.length },
    { title: 'Version', dataIndex: 'version', key: 'v', width: 70 },
    {
      title: 'Actions', key: 'actions', width: 100,
      render: (_: any, r: YieldRecord) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)}
            style={{ border: '1px solid #1659CB', color: '#1659CB', background: 'rgba(22,89,203,0.03)' }} />
          <Popconfirm title="Delete?" onConfirm={() => handleDelete(r)}>
            <Button size="small" icon={<DeleteOutlined />}
              style={{ border: '1px solid #D40B00', color: '#D40B00', background: 'rgba(212,11,0,0.03)' }} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Dropdown items
  const addItems = [
    { key: 'single', icon: <FileAddOutlined />, label: <div><strong>Single Entry</strong><div style={{ fontSize: 11, color: '#999' }}>Add one config manually</div></div>, onClick: handleAdd },
    { type: 'divider' as const },
    { key: 'bulk', icon: <UploadOutlined />, label: <div><strong>Bulk Upload</strong><div style={{ fontSize: 11, color: '#999' }}>Import from CSV file</div></div>, onClick: () => setBulkUploadOpen(true) },
  ];

  // ══════════════════════════════════════════════════════════
  // RENDER — SideBarLayout pattern
  // ══════════════════════════════════════════════════════════

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 160px)', background: '#fff', borderRadius: 8, overflow: 'hidden', border: '1px solid #E8E8E8' }}>

      {/* ═══ LEFT SIDEBAR — Store Entity Cards ═══ */}
      {!sidebarCollapsed && (
        <div style={{ width: 240, borderRight: '1px solid #E8E8E8', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          {/* Search */}
          <div style={{ padding: '12px 12px 8px' }}>
            <Input
              prefix={<SearchOutlined style={{ color: '#bbb' }} />}
              placeholder="Search" allowClear size="small"
              value={sidebarSearch} onChange={e => setSidebarSearch(e.target.value)}
              style={{ borderRadius: 4 }}
            />
          </div>

          {/* Store list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px' }}>
            {filteredEntities.map((store, idx) => {
              const isActive = idx === selectedStoreIdx;
              return (
                <div
                  key={store.id}
                  onClick={() => setSelectedStoreIdx(idx)}
                  style={{
                    border: `1px solid ${isActive ? '#006EC3' : '#D9D9D9'}`,
                    background: isActive ? '#E6F7FF' : '#fff',
                    borderRadius: 4, padding: '14px 12px', marginBottom: 6,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#1B2330', marginBottom: 4 }}>{store.name}</div>
                  <div style={{ fontSize: 11, color: '#999', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <span style={{ background: typeColors[store.type] || '#666', color: '#fff', padding: '1px 6px', borderRadius: 3, fontSize: 9, fontWeight: 600 }}>
                      {store.type}
                    </span>
                    <span>{store.configs.length} configs</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <div
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        style={{
          width: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', background: '#FAFAFA', borderRight: '1px solid #E8E8E8',
          flexShrink: 0,
        }}
      >
        {sidebarCollapsed ? <RightOutlined style={{ fontSize: 10, color: '#999' }} /> : <LeftOutlined style={{ fontSize: 10, color: '#999' }} />}
      </div>

      {/* ═══ RIGHT PANEL — Sub-tabs + Table ═══ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Store header */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #E8E8E8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1B2330' }}>{selectedStore?.name}</span>
            <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>ID: {selectedStore?.id}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#999' }}>Metadata Version: <strong>default_version</strong></span>
            <AntDropdown menu={{ items: addItems }} trigger={['click']}>
              <Button type="primary" style={{ background: '#1659CB', borderColor: '#1659CB' }}>
                Add or Update <span style={{ fontSize: 10, marginLeft: 4 }}>▼</span>
              </Button>
            </AntDropdown>
            <Button danger onClick={() => message.info('Bulk delete coming soon')}>Bulk Delete</Button>
          </div>
        </div>

        {/* Business line sub-tabs */}
        <div style={{ borderBottom: '1px solid #E8E8E8', padding: '0 16px', display: 'flex', alignItems: 'center', gap: 0 }}>
          {blTabs.map(bl => (
            <button key={bl} onClick={() => setActiveBlTab(bl)}
              style={{
                padding: '10px 18px', border: 'none', background: 'none',
                fontSize: 13, fontWeight: activeBlTab === bl ? 700 : 400,
                color: activeBlTab === bl ? '#006EC3' : '#666',
                borderBottom: activeBlTab === bl ? '2px solid #006EC3' : '2px solid transparent',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {blLabels[bl] || bl}
            </button>
          ))}
          <button
            onClick={handleAdd}
            style={{
              padding: '10px 14px', border: '1px solid #d9d9d9', background: '#fff',
              borderRadius: 4, margin: '6px 0 6px 8px', cursor: 'pointer',
              fontSize: 14, color: '#999', display: 'flex', alignItems: 'center',
            }}
          >
            <PlusOutlined />
          </button>
        </div>

        {/* Rate card table */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Table
            columns={columns}
            dataSource={activeConfigs}
            rowKey="configId"
            size="small"
            pagination={false}
            rowSelection={{ type: 'checkbox' }}
            scroll={{ y: 'calc(100vh - 340px)' }}
          />
          {activeConfigs.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
              No rate card configs for this business line. Click "Add or Update" to create one.
            </div>
          )}
        </div>
      </div>

      {/* ═══ FORM DRAWER ═══ */}
      <YieldFormDrawer
        visible={drawerVisible}
        editData={editingConfig}
        storeId={selectedStore?.id}
        storeName={selectedStore?.name}
        serviceType={activeBlTab === 'LAD' ? 'home' : activeBlTab === 'FastDelivery' ? 'fast' : 'collect'}
        businessLine={activeBlTab}
        onClose={() => { setDrawerVisible(false); setEditingConfig(null); }}
        onSave={(rec) => {
          const store = entities.find(e => e.id === rec.storeId);
          if (store) {
            const idx = store.configs.findIndex(c => c.configId === rec.configId);
            if (idx >= 0) store.configs[idx] = rec; else store.configs.push(rec);
          }
          syncToCheckout(rec);
          setDrawerVisible(false); setEditingConfig(null);
          message.success('Config saved — checkout synced');
        }}
      />

      {/* ═══ BULK UPLOAD MODAL ═══ */}
      <BulkUploadModal
        open={bulkUploadOpen}
        onClose={() => setBulkUploadOpen(false)}
        onUpload={(records) => {
          records.forEach(rec => {
            const store = entities.find(e => e.id === rec.storeId);
            if (store) { store.configs.push(rec); syncToCheckout(rec); }
          });
          message.success(`${records.length} configs imported`);
        }}
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// BULK UPLOAD MODAL
// ══════════════════════════════════════════════════════════════

function BulkUploadModal({ open, onClose, onUpload }: { open: boolean; onClose: () => void; onUpload: (r: YieldRecord[]) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<YieldRecord[]>([]);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const reset = () => { setFile(null); setPreview([]); setError(''); };

  const handleFile = (f: File) => {
    if (!f.name.endsWith('.csv')) { setError('Only .csv files supported'); return; }
    setFile(f); setError('');
    const reader = new FileReader();
    reader.onload = (e) => { try { const recs = parseCsvToRecords(e.target?.result as string); if (!recs.length) { setError('No valid rows'); return; } setPreview(recs); } catch { setError('Parse failed'); } };
    reader.readAsText(f);
  };

  return (
    <Modal title="Bulk Upload Yield Configs" open={open} width={640} onCancel={() => { reset(); onClose(); }}
      footer={[<Button key="c" onClick={() => { reset(); onClose(); }}>Cancel</Button>,
        <Button key="u" type="primary" disabled={!preview.length} style={{ background: preview.length ? '#1659CB' : '#ccc', borderColor: preview.length ? '#1659CB' : '#ccc' }}
          onClick={() => { onUpload(preview); reset(); onClose(); }}>Upload & Import ({preview.length})</Button>]}>
      <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => fileRef.current?.click()}
        style={{ border: `2px dashed ${dragOver ? '#1659CB' : '#d9d9d9'}`, borderRadius: 8, padding: '28px 20px', textAlign: 'center', cursor: 'pointer', background: dragOver ? '#EBF1FC' : '#FAFBFC', marginBottom: 16 }}>
        <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
        <InboxOutlined style={{ fontSize: 32, color: file ? '#1659CB' : '#bbb', marginBottom: 8 }} />
        {file ? <div><div style={{ fontWeight: 600 }}>{file.name}</div><div style={{ fontSize: 12, color: '#999' }}>{(file.size / 1024).toFixed(1)} KB</div></div> : <div><div style={{ fontWeight: 600 }}>Drop CSV here, or click to browse</div></div>}
      </div>
      <div style={{ background: '#F4F9FA', borderRadius: 6, padding: '10px 14px', marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 6 }}>Expected Columns</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>{CSV_COLUMNS.map(c => <Tag key={c} color="blue" style={{ fontSize: 10 }}>{c}</Tag>)}</div>
      </div>
      <Button type="link" icon={<DownloadOutlined />} style={{ padding: 0, color: '#1659CB', fontWeight: 600, marginBottom: 12 }}
        onClick={() => { const b = new Blob([generateSampleCsv()], { type: 'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'yield_config_sample.csv'; a.click(); }}>
        Download sample (.csv)
      </Button>
      {error && <div style={{ color: '#D40B00', fontSize: 12, marginBottom: 8 }}>{error}</div>}
      {preview.length > 0 && <Table size="small" pagination={false} scroll={{ y: 140 }} dataSource={preview.map((r, i) => ({ ...r, key: i }))}
        columns={[{ title: 'Store', dataIndex: 'storeName', width: 140 }, { title: 'BL', dataIndex: 'businessLine', width: 70 }, { title: 'Service', dataIndex: 'serviceType', width: 70 },
          { title: 'Base', key: 'b', width: 70, render: (_: any, r: YieldRecord) => `€${r.basePricing.baseFee.toFixed(2)}` }]} />}
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════
// FORM DRAWER (7 tabs)
// ══════════════════════════════════════════════════════════════

function YieldFormDrawer({ visible, editData, storeId, storeName, serviceType, businessLine, onClose, onSave }: {
  visible: boolean; editData: YieldRecord | null; storeId: string; storeName: string; serviceType: string; businessLine?: string;
  onClose: () => void; onSave: (rec: YieldRecord) => void;
}) {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('general');
  const [surgeTiers, setSurgeTiers] = useState<SurgeTier[]>([]);
  const [segmentPricing, setSegmentPricing] = useState<SegmentRow[]>([]);
  const [greenCriteria, setGreenCriteria] = useState<string[]>([]);
  const [newCriterion, setNewCriterion] = useState('');
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [editRuleIdx, setEditRuleIdx] = useState(-1);
  const [ruleForm] = Form.useForm();

  useEffect(() => {
    if (!visible) return;
    setActiveTab('general');
    if (editData) {
      form.setFieldsValue({
        storeId: editData.storeId, storeName: editData.storeName, businessLine: editData.businessLine,
        serviceType: editData.serviceType, version: editData.version, isActive: editData.isActive,
        baseFee: editData.basePricing.baseFee, floorPrice: editData.basePricing.floorPrice, currency: editData.basePricing.currency,
        todMorning: editData.multipliers.timeOfDay.morning, todAfternoon: editData.multipliers.timeOfDay.afternoon, todEvening: editData.multipliers.timeOfDay.evening,
        ...Object.fromEntries(DOW_KEYS.map(d => [`dow${d}`, editData.multipliers.dayOfWeek[d]])),
        demandEnabled: editData.multipliers.demand.enabled, demandMaxFactor: editData.multipliers.demand.maxFactor, demandFormula: editData.multipliers.demand.formula,
        surgeEnabled: editData.surge.enabled, greenEnabled: editData.greenIncentive.enabled, greenDiscountPct: editData.greenIncentive.discountPct,
        roundingEnabled: editData.rounding.enabled, roundingStrategy: editData.rounding.strategy,
        priceLockEnabled: editData.priceLock.enabled, priceLockDuration: editData.priceLock.durationMinutes,
      });
      setSurgeTiers([...editData.surge.tiers]); setSegmentPricing([...editData.segmentPricing]);
      setGreenCriteria([...editData.greenIncentive.criteria]); setRules([...editData.rules]);
    } else {
      form.resetFields();
      form.setFieldsValue({
        storeId, storeName, serviceType, businessLine: businessLine || 'LAD', currency: 'EUR', baseFee: 5.99, floorPrice: 1.99,
        version: 1, isActive: true, todMorning: 0.85, todAfternoon: 1.0, todEvening: 1.4,
        ...Object.fromEntries(DOW_KEYS.map(d => [`dow${d}`, { Monday: 0.9, Tuesday: 0.85, Wednesday: 0.9, Thursday: 1.0, Friday: 1.15, Saturday: 1.3, Sunday: 0.7 }[d]])),
        demandEnabled: true, demandMaxFactor: 0.6, demandFormula: 'linear', surgeEnabled: true,
        greenEnabled: true, greenDiscountPct: 25, roundingEnabled: true, roundingStrategy: '.99', priceLockEnabled: true, priceLockDuration: 15,
      });
      setSurgeTiers([{ capacityAbovePct: 75, amount: 1.0 }, { capacityAbovePct: 85, amount: 2.0 }, { capacityAbovePct: 95, amount: 4.0 }]);
      setSegmentPricing([{ segment: 'standard', discountPct: 0, freeAbove: 200, maxFee: 12.99 }, { segment: 'plus', discountPct: 15, freeAbove: 150, maxFee: 9.99 }, { segment: 'premium', discountPct: 30, freeAbove: 100, maxFee: 7.99 }, { segment: 'vip', discountPct: 100, freeAbove: 0, maxFee: 0 }]);
      setGreenCriteria(['Vehicle already in neighborhood', 'Off-peak window', 'Electric vehicle route']);
      setRules([{ priority: 1, name: 'VIP Free Delivery', type: 'exclusive', condition: { type: 'segment', value: 'vip' }, action: { type: 'set_price', value: 0 }, active: true }, { priority: 99, name: 'Floor Price', type: 'exclusive', condition: { type: 'always', value: true }, action: { type: 'enforce_floor', value: 1.99 }, active: true }]);
    }
  }, [visible, editData, form, storeId, storeName, serviceType]);

  const handleSave = async () => {
    const v = await form.validateFields();
    const configId = editData ? editData.configId : `yield-${v.storeId}-${v.serviceType}-${Date.now().toString(36)}`;
    const rec: YieldRecord = {
      configId, storeId: v.storeId, storeName: v.storeName, businessLine: v.businessLine, serviceType: v.serviceType,
      version: v.version || 1, isActive: v.isActive ?? true,
      basePricing: { baseFee: v.baseFee, floorPrice: v.floorPrice, currency: v.currency },
      multipliers: { timeOfDay: { morning: v.todMorning, afternoon: v.todAfternoon, evening: v.todEvening }, dayOfWeek: Object.fromEntries(DOW_KEYS.map(d => [d, v[`dow${d}`]])), demand: { enabled: v.demandEnabled, maxFactor: v.demandMaxFactor, formula: v.demandFormula } },
      surge: { enabled: v.surgeEnabled, tiers: surgeTiers }, greenIncentive: { enabled: v.greenEnabled, discountPct: v.greenDiscountPct, criteria: greenCriteria },
      segmentPricing, rules, rounding: { enabled: v.roundingEnabled, strategy: v.roundingStrategy }, priceLock: { enabled: v.priceLockEnabled, durationMinutes: v.priceLockDuration },
    };
    onSave(rec);
  };

  const mcs: React.CSSProperties = { border: '1px solid #d9d9d9', borderRadius: 6, padding: '10px 12px', textAlign: 'center' };

  // Rule handlers
  const openAddRule = () => { setEditRuleIdx(-1); ruleForm.resetFields(); ruleForm.setFieldsValue({ priority: rules.length + 1, type: 'exclusive', active: true }); setRuleModalOpen(true); };
  const openEditRule = (i: number) => { setEditRuleIdx(i); const r = rules[i]; ruleForm.setFieldsValue({ priority: r.priority, name: r.name, type: r.type, active: r.active, conditionType: r.condition?.type, conditionValue: String(r.condition?.value ?? ''), actionType: r.action?.type, actionValue: String(r.action?.value ?? '') }); setRuleModalOpen(true); };
  const saveRuleModal = async () => {
    const v = await ruleForm.validateFields();
    let cv: any = v.conditionValue; if (cv === 'true') cv = true; else if (!isNaN(Number(cv)) && cv?.trim?.() !== '') cv = Number(cv);
    let av: any = v.actionValue; if (av === 'true') av = true; else if (!isNaN(Number(av)) && av?.trim?.() !== '') av = Number(av);
    const rule: PricingRule = { priority: v.priority, name: v.name, type: v.type, condition: { type: v.conditionType, value: cv }, action: { type: v.actionType, value: av }, active: v.active };
    const r = [...rules]; if (editRuleIdx >= 0) r[editRuleIdx] = rule; else r.push(rule); setRules(r); setRuleModalOpen(false);
  };

  const tabItems = [
    { key: 'general', label: 'General', children: (
      <>
        <Form.Item name="storeId" label={<strong>Store ID</strong>}><Input disabled /></Form.Item>
        <Form.Item name="storeName" label={<strong>Store Name</strong>}><Input disabled /></Form.Item>
        <Form.Item name="businessLine" label="Business Line"><Select options={BL_OPTIONS} /></Form.Item>
        <Form.Item name="serviceType" label="Service Type"><Select options={SERVICE_OPTIONS} /></Form.Item>
        <Row gutter={16}><Col span={12}><Form.Item name="version" label="Version"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col><Col span={12}><Form.Item name="isActive" label="Active" valuePropName="checked"><Switch /></Form.Item></Col></Row>
        <Divider />
        <Form.Item name="baseFee" label={<strong>Base Fee (€)</strong>} rules={[{ required: true }]}><InputNumber min={0} step={0.01} style={{ width: '100%' }} /></Form.Item>
        <Form.Item name="floorPrice" label={<strong>Floor Price (€)</strong>} rules={[{ required: true }]}><InputNumber min={0} step={0.01} style={{ width: '100%' }} /></Form.Item>
        <Form.Item name="currency" label="Currency"><Select options={[{ value: 'EUR', label: 'EUR' }, { value: 'USD', label: 'USD' }]} /></Form.Item>
      </>
    )},
    { key: 'multipliers', label: 'Multipliers', children: (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
          {TOD_KEYS.map(p => (<div key={p} style={mcs}><div style={{ fontSize: 11, color: '#999', textTransform: 'capitalize' }}>{p}</div><Form.Item name={`tod${p.charAt(0).toUpperCase() + p.slice(1)}`} noStyle><InputNumber min={0} step={0.05} style={{ width: '100%' }} /></Form.Item></div>))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 20 }}>
          {DOW_KEYS.map(d => (<div key={d} style={mcs}><div style={{ fontSize: 11, color: '#999' }}>{d.slice(0, 3)}</div><Form.Item name={`dow${d}`} noStyle><InputNumber min={0.5} max={2} step={0.05} style={{ width: '100%' }} /></Form.Item></div>))}
        </div>
        <Form.Item name="demandEnabled" label="Demand Enabled" valuePropName="checked"><Switch /></Form.Item>
        <Form.Item name="demandMaxFactor" label="Max Factor"><InputNumber min={0} step={0.1} style={{ width: '100%' }} /></Form.Item>
      </>
    )},
    { key: 'surge', label: 'Surge', children: (
      <>
        <Form.Item name="surgeEnabled" label="Enabled" valuePropName="checked"><Switch /></Form.Item>
        <Table dataSource={surgeTiers.map((t, i) => ({ ...t, key: i }))} pagination={false} size="small" columns={[
          { title: 'Capacity %', dataIndex: 'capacityAbovePct', render: (v: number, _: any, i: number) => <InputNumber value={v} min={0} max={100} onChange={val => { const t = [...surgeTiers]; t[i] = { ...t[i], capacityAbovePct: val! }; setSurgeTiers(t); }} style={{ width: '100%' }} /> },
          { title: 'Amount (€)', dataIndex: 'amount', render: (v: number, _: any, i: number) => <InputNumber value={v} min={0} step={0.5} onChange={val => { const t = [...surgeTiers]; t[i] = { ...t[i], amount: val! }; setSurgeTiers(t); }} style={{ width: '100%' }} /> },
          { title: '', width: 50, render: (_: any, __: any, i: number) => <Button danger size="small" icon={<DeleteOutlined />} onClick={() => setSurgeTiers(surgeTiers.filter((_, j) => j !== i))} /> },
        ]} />
        <Button type="dashed" icon={<PlusOutlined />} onClick={() => setSurgeTiers([...surgeTiers, { capacityAbovePct: 80, amount: 1 }])} style={{ marginTop: 12, width: '100%' }}>Add Tier</Button>
      </>
    )},
    { key: 'green', label: 'Green', children: (
      <>
        <Form.Item name="greenEnabled" label="Enabled" valuePropName="checked"><Switch /></Form.Item>
        <Form.Item name="greenDiscountPct" label="Discount %"><InputNumber min={0} max={100} style={{ width: '100%' }} /></Form.Item>
        <div style={{ marginBottom: 8 }}>{greenCriteria.map((c, i) => <Tag key={i} closable color="green" onClose={() => setGreenCriteria(greenCriteria.filter((_, j) => j !== i))} style={{ marginBottom: 4 }}>{c}</Tag>)}</div>
        <Space.Compact style={{ width: '100%' }}><Select value={newCriterion || undefined} placeholder="Add..." style={{ flex: 1 }} onChange={setNewCriterion} options={GREEN_OPTS.filter(o => !greenCriteria.includes(o)).map(o => ({ value: o, label: o }))} />
          <Button icon={<PlusOutlined />} onClick={() => { if (newCriterion) { setGreenCriteria([...greenCriteria, newCriterion]); setNewCriterion(''); } }}>Add</Button></Space.Compact>
      </>
    )},
    { key: 'segments', label: 'Segments', children: (
      <Table dataSource={segmentPricing.map((s, i) => ({ ...s, key: i }))} pagination={false} size="small" columns={[
        { title: 'Segment', dataIndex: 'segment', render: (v: string) => <Tag color={v === 'vip' ? 'gold' : v === 'premium' ? 'purple' : v === 'plus' ? 'blue' : 'default'} style={{ textTransform: 'capitalize', fontWeight: 600 }}>{v}</Tag> },
        { title: 'Disc %', dataIndex: 'discountPct', width: 80, render: (v: number, _: any, i: number) => <InputNumber value={v} min={0} max={100} onChange={val => { const s = [...segmentPricing]; s[i] = { ...s[i], discountPct: val! }; setSegmentPricing(s); }} style={{ width: '100%' }} /> },
        { title: 'Free Above', dataIndex: 'freeAbove', width: 100, render: (v: number, _: any, i: number) => <InputNumber value={v} min={0} onChange={val => { const s = [...segmentPricing]; s[i] = { ...s[i], freeAbove: val! }; setSegmentPricing(s); }} style={{ width: '100%' }} /> },
        { title: 'Max Fee', dataIndex: 'maxFee', width: 90, render: (v: number, _: any, i: number) => <InputNumber value={v} min={0} step={0.01} onChange={val => { const s = [...segmentPricing]; s[i] = { ...s[i], maxFee: val! }; setSegmentPricing(s); }} style={{ width: '100%' }} /> },
      ]} />
    )},
    { key: 'rules', label: 'Rules', children: (
      <>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}><Button type="primary" icon={<PlusOutlined />} onClick={openAddRule} style={{ background: '#1659CB', borderColor: '#1659CB' }}>Add Rule</Button></div>
        {rules.sort((a, b) => a.priority - b.priority).map((r, i) => (
          <div key={i} style={{ border: '1px solid #f0f0f0', borderRadius: 6, padding: '10px 14px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#EBF1FC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#1659CB' }}>{r.priority}</div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 600 }}>{r.name}</div><div style={{ fontSize: 10, color: '#999' }}>IF {r.condition?.type} → {r.action?.type}</div></div>
            <Tag color={r.type === 'exclusive' ? 'orange' : 'blue'} style={{ fontSize: 10 }}>{r.type}</Tag>
            <Switch size="small" checked={r.active} onChange={() => { const rs = [...rules]; rs[i] = { ...rs[i], active: !rs[i].active }; setRules(rs); }} />
            <Button size="small" icon={<EditOutlined />} onClick={() => openEditRule(i)} />
            <Button size="small" danger icon={<DeleteOutlined />} onClick={() => setRules(rules.filter((_, j) => j !== i))} />
          </div>
        ))}
      </>
    )},
    { key: 'settings', label: 'Settings', children: (
      <Row gutter={16}>
        <Col span={12}><Form.Item name="roundingEnabled" label="Rounding" valuePropName="checked"><Switch /></Form.Item><Form.Item name="roundingStrategy" label="Strategy"><Select options={[{ value: '.99', label: '.99' }, { value: '.49', label: '.49' }, { value: '.00', label: '.00' }]} /></Form.Item></Col>
        <Col span={12}><Form.Item name="priceLockEnabled" label="Price Lock" valuePropName="checked"><Switch /></Form.Item><Form.Item name="priceLockDuration" label="Duration (min)"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
      </Row>
    )},
  ];

  return (
    <>
      <Drawer title={<div style={{ display: 'flex', alignItems: 'center', gap: 60 }}><span style={{ fontSize: 15, fontWeight: 600 }}>{editData ? 'Edit Config' : 'New Config'}</span><Space><Button onClick={onClose}>Cancel</Button><Button type="primary" onClick={handleSave} style={{ background: '#1659CB', borderColor: '#1659CB' }}>Save</Button></Space></div>}
        width="50vw" placement="right" onClose={onClose} open={visible} closeIcon={<CloseOutlined />} zIndex={1200} styles={{ body: { padding: 24 } }}>
        <Form form={form} layout="vertical" requiredMark={false}><Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} /></Form>
      </Drawer>
      <Modal title={editRuleIdx >= 0 ? 'Edit Rule' : 'Add Rule'} open={ruleModalOpen} onOk={saveRuleModal} onCancel={() => setRuleModalOpen(false)} okText="Save">
        <Form form={ruleForm} layout="vertical">
          <Row gutter={16}><Col span={8}><Form.Item name="priority" label="Priority" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col><Col span={16}><Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item></Col></Row>
          <Row gutter={16}><Col span={12}><Form.Item name="type" label="Type"><Select options={[{ value: 'exclusive', label: 'Exclusive' }, { value: 'cumulative', label: 'Cumulative' }]} /></Form.Item></Col><Col span={12}><Form.Item name="active" label="Active" valuePropName="checked"><Switch /></Form.Item></Col></Row>
          <Divider />
          <Row gutter={16}><Col span={12}><Form.Item name="conditionType" label="Condition"><Select options={CONDITION_TYPES} /></Form.Item></Col><Col span={12}><Form.Item name="conditionValue" label="Value"><Input /></Form.Item></Col></Row>
          <Row gutter={16}><Col span={12}><Form.Item name="actionType" label="Action"><Select options={ACTION_TYPES} /></Form.Item></Col><Col span={12}><Form.Item name="actionValue" label="Value"><Input /></Form.Item></Col></Row>
        </Form>
      </Modal>
    </>
  );
}
