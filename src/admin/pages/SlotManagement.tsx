import { useState, useEffect } from 'react';
import {
  Table, Input, InputNumber, Select, Button, Switch, Tag, Space,
  Drawer, Form, Tabs, Divider, Row, Col, Popconfirm,
  message, Spin,
} from 'antd';
import {
  SearchOutlined, DeleteOutlined, EditOutlined, ReloadOutlined,
  PlusOutlined, CloseOutlined,
} from '@ant-design/icons';
import { stores as adminStores, zones as adminZones } from '../data';
import { saveSlotConfig, saveZoneSchedule } from '../../engine/config-store';
import { REAL_ZONE_SLOTS, STORE_ZONES } from '../data-slots-csv';

// ── Types matching the metadata structure ─────────────────────

interface ScheduleSlot { start: string; end: string; capacity: number; label: string }
interface CapacityDimension { type: string; limit: number; active: boolean }
interface Wave { waveId: string; name: string; ordersPerWave: number; itemsPerWave: number; waveDurationMin: number; combinationLogic: string }
interface Holiday { date: string; name: string; action: string; capacityPct: number; hours: { open: string; close: string }; stores: string[] | 'all'; bls: string[] | 'all' }
interface EmergencyOverride { type: string; scope: string; scopeValue: string; params: Record<string, unknown>; expiresAt: string; active: boolean }

interface SlotConfigRecord {
  identity: {
    id: string; storeId: string; storeName: string; zoneName: string;
    serviceType: string; version: number; isActive: boolean;
  };
  schedule: Record<string, ScheduleSlot[]>;
  capacity: { dimensions: CapacityDimension[]; combinationLogic: string };
  cutOff: {
    default: number;
    evaluationOrder: string[];
    bySlotLabel: Record<string, number>;
    byZone: Record<string, number>;
    byCarrier: Record<string, number>;
    byGoodType: Record<string, number>;
    segmentExtension: Record<string, number>;
  };
  reservation: {
    holdDurationSec: number; holdBackPct: number; strategy: string;
    segmentReserves: Record<string, number>;
    forceBook: { enabled: boolean; allowedSegments: string[]; maxOverbookPct: number };
  };
  waves: Wave[];
  fullSlotBehavior: {
    autoBlock: boolean;
    suggestAlternatives: { enabled: boolean; maxSuggestions: number; criteria: string[] };
  };
  holidays: Holiday[];
  emergencyOverrides: EmergencyOverride[];
  fallback: { mode: string; message: string; staticSlots: { start: string; end: string }[] };
  reschedule: { enabled: boolean; allowedBeforeHours: number; maxReschedules: number };
}

// ── Constants ─────────────────────────────────────────────────

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SERVICE_TYPES = [
  { value: 'home', label: 'Home Delivery' },
  { value: 'fast', label: 'Fast Delivery' },
  { value: 'collect', label: 'Click & Collect' },
];
// CAPACITY_TYPES removed
const STRATEGIES = ['BALANCED', 'START', 'END', 'ALTERNATE'];
const FALLBACK_MODES = ['static_slots', 'hide_delivery', 'show_message', 'last_known'];
const SLOT_LABELS = ['Express', 'Standard', 'Flex'];
// OVERRIDE_TYPES removed
// OVERRIDE_SCOPES removed
// HOLIDAY_ACTIONS removed
const ALT_CRITERIA = ['same_day_different_time', 'next_day_same_time', 'nearest_available'];

// ── Seed Data ─────────────────────────────────────────────────

function makeDefaultSchedule(serviceType: string): Record<string, ScheduleSlot[]> {
  const sched: Record<string, ScheduleSlot[]> = {};
  const label = serviceType === 'fast' ? 'Express' : 'Standard';
  const slots = serviceType === 'fast'
    ? [{ s: '09:00', e: '11:00' }, { s: '11:00', e: '13:00' }, { s: '13:00', e: '15:00' }, { s: '15:00', e: '17:00' }, { s: '17:00', e: '19:00' }]
    : serviceType === 'collect'
      ? [{ s: '08:00', e: '10:00' }, { s: '10:00', e: '12:00' }, { s: '12:00', e: '14:00' }, { s: '14:00', e: '16:00' }, { s: '16:00', e: '18:00' }, { s: '18:00', e: '20:00' }]
      : [{ s: '07:00', e: '10:00' }, { s: '08:00', e: '11:00' }, { s: '10:00', e: '12:00' }, { s: '11:00', e: '13:00' }, { s: '14:00', e: '17:00' }, { s: '15:00', e: '17:00' }, { s: '16:00', e: '18:00' }, { s: '17:00', e: '19:00' }, { s: '18:00', e: '20:00' }, { s: '19:00', e: '21:00' }];
  const cap = serviceType === 'fast' ? 10 : serviceType === 'collect' ? 20 : 15;
  DAYS.forEach(d => { sched[d] = slots.map(sl => ({ start: sl.s, end: sl.e, capacity: d === 'Friday' && serviceType === 'home' ? 0 : cap, label })); });
  return sched;
}

// Real CSV data for LAD hubs (from WeeklySlotsHomeDelivery_EN.xlsx)

function makeRecord(store: typeof adminStores[0], st: string, zone: string): SlotConfigRecord {
  const seed = (store.id + st + zone).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const v = (n: number) => Math.round(n * (1 + ((seed % 20) - 10) / 200));
  // Use real per-zone CSV data when available (home delivery for LAD hubs)
  const realZoneData = REAL_ZONE_SLOTS[store.id]?.[zone];
  const schedule = (st === 'home' && realZoneData)
    ? JSON.parse(JSON.stringify(realZoneData))
    : makeDefaultSchedule(st);
  return {
    identity: { id: `slot-${store.id}-${zone}-${st}`, storeId: store.id, storeName: store.name, zoneName: zone, serviceType: st, version: 1, isActive: true },
    schedule,
    capacity: { dimensions: [
      { type: 'orders', limit: v(st === 'fast' ? 10 : 25), active: true },
      { type: 'items', limit: v(st === 'fast' ? 80 : 200), active: true },
      { type: 'weight_kg', limit: v(600), active: false },
      { type: 'volume_m3', limit: v(4), active: false },
    ], combinationLogic: 'AND' },
    cutOff: {
      default: st === 'fast' ? 0.75 : st === 'collect' ? 2 : 4,
      evaluationOrder: ['byCarrier', 'byGoodType', 'bySlotLabel', 'byZone', 'default'],
      bySlotLabel: { Express: 0.75, Standard: 4, Flex: 6 },
      byZone: {}, byCarrier: {}, byGoodType: { frozen: 3, food: 4 },
      segmentExtension: { plus: 0.5, premium: 1, vip: 2 },
    },
    reservation: {
      holdDurationSec: st === 'fast' ? 300 : 600, holdBackPct: st === 'fast' ? 10 : 20,
      strategy: 'BALANCED',
      segmentReserves: { standard: 0, plus: 5, premium: 10, vip: 15 },
      forceBook: { enabled: true, allowedSegments: ['vip', 'premium'], maxOverbookPct: 10 },
    },
    waves: [{ waveId: 'w1', name: 'Wave 1', ordersPerWave: v(20), itemsPerWave: v(160), waveDurationMin: 90, combinationLogic: 'AND' }],
    fullSlotBehavior: {
      autoBlock: true,
      suggestAlternatives: { enabled: true, maxSuggestions: 3, criteria: ['same_day_different_time', 'next_day_same_time'] },
    },
    holidays: [],
    emergencyOverrides: [],
    fallback: { mode: 'static_slots', message: 'Delivery slots temporarily unavailable', staticSlots: [{ start: '10:00', end: '18:00' }] },
    reschedule: { enabled: true, allowedBeforeHours: 12, maxReschedules: 2 },
  };
}

function buildSeedData(): SlotConfigRecord[] {
  const records: SlotConfigRecord[] = [];
  const blToSt: Record<string, string> = { LAD: 'home', FastDelivery: 'fast', Drive: 'collect', home: 'home', fast: 'fast', collect: 'collect' };

  adminStores.forEach(s => {
    const bls = s.businessLines as string[];
    const isHub = ['4459', '4660', '4661'].includes(s.id);

    if (isHub && STORE_ZONES[s.id]) {
      // LAD hubs: create one config per zone per service type (real CSV data)
      const zones = STORE_ZONES[s.id].zones;
      zones.forEach(zone => {
        // Home delivery — uses real CSV zone-level schedule
        records.push(makeRecord(s, 'home', zone));
        // Fast + Collect — uses generic schedule but keyed per zone
        records.push(makeRecord(s, 'fast', zone));
        records.push(makeRecord(s, 'collect', zone));
      });
    } else {
      // Non-hub stores: one config per service type, single zone
      const storeZones = adminZones.filter(z => z.storeIds.includes(s.id)).slice(0, 1);
      const zn = storeZones[0]?.name || 'Default';
      const serviceTypes = [...new Set(bls.map(bl => blToSt[bl]).filter(Boolean))];
      serviceTypes.forEach(st => {
        records.push(makeRecord(s, st, zn));
      });
    }
  });
  return records;
}

// ── Sync to checkout ──────────────────────────────────────────

function syncToCheckout(rec: SlotConfigRecord) {
  // 1. Sync slot config (capacity, reservation, cutoff)
  const monday = rec.schedule['Monday'] || [];
  saveSlotConfig({
    slotsPerDay: monday.map(s => ({ startTime: s.start, endTime: s.end, timeOfDay: parseInt(s.start) < 12 ? 'morning' as const : parseInt(s.start) < 17 ? 'afternoon' as const : 'evening' as const, slotLabel: s.label })),
    capacityPerSlot: rec.capacity.dimensions.find(d => d.type === 'orders')?.limit ?? 40,
    reservationPct: rec.reservation.holdBackPct,
    reservationStrategy: rec.reservation.strategy as any,
    cutOffHoursBefore: rec.cutOff.default,
  });

  // 2. Sync the actual zone schedule so checkout reads admin-modified slots
  const converted: Record<string, { startTime: string; endTime: string; capacity: number }[]> = {};
  for (const day of Object.keys(rec.schedule)) {
    converted[day] = rec.schedule[day].map(s => ({
      startTime: s.start, endTime: s.end, capacity: s.capacity,
    }));
  }
  saveZoneSchedule(rec.identity.storeId, rec.identity.zoneName, converted);
}

// ── Status Badge ──────────────────────────────────────────────

function StatusBadge({ isActive }: { isActive: boolean }) {
  return <span style={{ display: 'inline-flex', padding: '1px 7px', height: 20, borderRadius: 10, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', background: isActive ? '#E6F8E9' : '#F0F0F0', color: isActive ? '#008D16' : '#666' }}>{isActive ? 'ACTIVE' : 'INACTIVE'}</span>;
}

const stBadge: Record<string, React.CSSProperties> = {
  home: { background: '#E6F7FF', color: '#006EC3', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 },
  fast: { background: '#FFF7E6', color: '#D46B08', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 },
  collect: { background: '#F6FFED', color: '#389E0D', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 },
};

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════

export default function SlotManagement() {
  const [allData] = useState<SlotConfigRecord[]>(() => {
    try {
      const built = buildSeedData();
      built.forEach(rec => { try { syncToCheckout(rec); } catch { /* ignore */ } });
      return built;
    } catch (e) {
      console.error('[SlotManagement] Init error:', e);
      return [];
    }
  });
  const [configs, setConfigs] = useState<SlotConfigRecord[]>([]);
  const [isLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [stFilter, setStFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [, setSelectedRows] = useState<SlotConfigRecord[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SlotConfigRecord | null>(null);

  useEffect(() => { const t = setTimeout(() => setDebouncedSearch(searchValue), 400); return () => clearTimeout(t); }, [searchValue]);

  useEffect(() => {
    let data = [...allData];
    if (debouncedSearch) { const s = debouncedSearch.toLowerCase(); data = data.filter(c => c.identity.storeName.toLowerCase().includes(s) || c.identity.storeId.toLowerCase().includes(s) || c.identity.zoneName.toLowerCase().includes(s)); }
    if (stFilter) data = data.filter(c => c.identity.serviceType === stFilter);
    if (statusFilter) data = data.filter(c => c.identity.isActive === (statusFilter === 'active'));
    setConfigs(data); setPage(1); setSelectedRowKeys([]); setSelectedRows([]);
  }, [debouncedSearch, stFilter, statusFilter, allData]);

  const paged = configs.slice((page - 1) * pageSize, page * pageSize);

  const handleEdit = (r: SlotConfigRecord) => { setEditingConfig(r); setDrawerVisible(true); };
  const handleAdd = () => { setEditingConfig(null); setDrawerVisible(true); };
  const handleDelete = (r: SlotConfigRecord) => {
    const idx = allData.findIndex(x => x.identity.id === r.identity.id);
    if (idx >= 0) allData.splice(idx, 1);
    setConfigs(prev => prev.filter(c => c.identity.id !== r.identity.id));
    message.success('Config deleted');
  };

  const filterLabel: React.CSSProperties = { background: '#FAFAFA', border: '1px solid #999', borderRadius: 4, padding: '4px 8px', display: 'flex', alignItems: 'center', fontSize: 12, whiteSpace: 'nowrap' };

  const columns = [
    { title: 'Store Name', dataIndex: ['identity', 'storeName'], key: 'store', width: 180, ellipsis: true },
    { title: 'Store ID', dataIndex: ['identity', 'storeId'], key: 'sid', width: 100 },
    { title: 'Zone', dataIndex: ['identity', 'zoneName'], key: 'zone', width: 130, ellipsis: true },
    { title: 'Service', dataIndex: ['identity', 'serviceType'], key: 'st', width: 100, render: (v: string) => <span style={stBadge[v] || {}}>{v}</span> },
    { title: 'Capacity', key: 'cap', width: 80, render: (_: any, r: SlotConfigRecord) => r.capacity.dimensions.find(d => d.type === 'orders')?.limit ?? '-' },
    { title: 'Cut-off (h)', key: 'co', width: 90, render: (_: any, r: SlotConfigRecord) => r.cutOff.default },
    { title: 'Hold (s)', key: 'hold', width: 80, render: (_: any, r: SlotConfigRecord) => r.reservation.holdDurationSec },
    { title: 'Status', key: 'status', width: 90, render: (_: any, r: SlotConfigRecord) => <StatusBadge isActive={r.identity.isActive} /> },
    { title: 'Ver', dataIndex: ['identity', 'version'], key: 'v', width: 50 },
    {
      title: 'Actions', key: 'actions', width: 100, fixed: 'right' as const,
      render: (_: any, r: SlotConfigRecord) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)} style={{ width: 32, height: 32, background: 'rgba(22,89,203,0.03)', border: '1px solid #1659CB', borderRadius: 4, color: '#1659CB' }} />
          <Popconfirm title="Delete?" onConfirm={() => handleDelete(r)}><Button size="small" icon={<DeleteOutlined />} style={{ width: 32, height: 32, background: 'rgba(212,11,0,0.03)', border: '1px solid #D40B00', borderRadius: 4, color: '#D40B00' }} /></Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ position: 'relative' }}>
      {isLoading && <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, background: 'rgba(255,255,255,0.8)' }}><Spin size="large" /></div>}

      {/* Navbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#fff', borderBottom: '1px solid #f0f0f0', borderRadius: '6px 6px 0 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Input allowClear style={{ width: 210 }} placeholder="Search Store / Zone" prefix={<SearchOutlined />} value={searchValue} onChange={e => setSearchValue(e.target.value)} />
          <div style={{ display: 'flex' }}><div style={filterLabel}>Service Type</div><Select allowClear style={{ minWidth: 130 }} placeholder="Select" value={stFilter} onChange={setStFilter} options={SERVICE_TYPES} /></div>
          <div style={{ display: 'flex' }}><div style={filterLabel}>Status</div><Select allowClear style={{ minWidth: 110 }} placeholder="Select" value={statusFilter} onChange={setStatusFilter} options={[{ value: 'active', label: 'ACTIVE' }, { value: 'inactive', label: 'INACTIVE' }]} /></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button icon={<ReloadOutlined />} size="small" style={{ width: 32, height: 32, padding: 0 }} onClick={() => { setSearchValue(''); setStFilter(undefined); setStatusFilter(undefined); }} />
          <Button type="primary" onClick={handleAdd} style={{ background: '#1659CB', borderColor: '#1659CB' }}>Add Config</Button>
        </div>
      </div>

      {/* Table */}
      <Table columns={columns} dataSource={paged} rowKey={r => r.identity.id} size="middle"
        pagination={{ current: page, pageSize, total: configs.length, onChange: (p, ps) => { setPage(p); setPageSize(ps); }, showSizeChanger: true, size: 'small' }}
        rowSelection={{ selectedRowKeys, onChange: (k, r) => { setSelectedRowKeys(k as string[]); setSelectedRows(r); } }}
        scroll={{ x: 1100 }} style={{ background: '#fff', borderRadius: '0 0 6px 6px' }}
      />

      {/* Form Drawer */}
      <SlotConfigDrawer visible={drawerVisible} editData={editingConfig}
        onClose={() => { setDrawerVisible(false); setEditingConfig(null); }}
        onSave={(rec) => {
          const idx = allData.findIndex(r => r.identity.id === rec.identity.id);
          if (idx >= 0) allData[idx] = rec; else allData.push(rec);
          setConfigs([...allData]);
          syncToCheckout(rec);
          setDrawerVisible(false); setEditingConfig(null);
          message.success(idx >= 0 ? 'Config updated — checkout synced' : 'Config created — checkout synced');
        }}
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// FORM DRAWER
// ══════════════════════════════════════════════════════════════

function SlotConfigDrawer({ visible, editData, onClose, onSave }: {
  visible: boolean; editData: SlotConfigRecord | null;
  onClose: () => void; onSave: (rec: SlotConfigRecord) => void;
}) {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('identity');
  const [schedule, setSchedule] = useState<Record<string, ScheduleSlot[]>>({});
  const [capDims, setCapDims] = useState<CapacityDimension[]>([]);
  const [waves, setWaves] = useState<Wave[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [overrides, setOverrides] = useState<EmergencyOverride[]>([]);
  const [altCriteria, setAltCriteria] = useState<string[]>([]);
  const [schedDay, setSchedDay] = useState('Monday');

  useEffect(() => {
    if (!visible) return;
    setActiveTab('identity');
    if (editData) {
      form.setFieldsValue({
        storeId: editData.identity.storeId, storeName: editData.identity.storeName,
        zoneName: editData.identity.zoneName, serviceType: editData.identity.serviceType,
        version: editData.identity.version, isActive: editData.identity.isActive,
        capLogic: editData.capacity.combinationLogic,
        cutOffDefault: editData.cutOff.default,
        holdDuration: editData.reservation.holdDurationSec, holdBackPct: editData.reservation.holdBackPct,
        strategy: editData.reservation.strategy,
        forceBookEnabled: editData.reservation.forceBook.enabled, maxOverbookPct: editData.reservation.forceBook.maxOverbookPct,
        autoBlock: editData.fullSlotBehavior.autoBlock, suggestEnabled: editData.fullSlotBehavior.suggestAlternatives.enabled,
        maxSuggestions: editData.fullSlotBehavior.suggestAlternatives.maxSuggestions,
        fallbackMode: editData.fallback.mode, fallbackMsg: editData.fallback.message,
        rescheduleEnabled: editData.reschedule.enabled, allowedBeforeHours: editData.reschedule.allowedBeforeHours,
        maxReschedules: editData.reschedule.maxReschedules,
        segStandard: editData.reservation.segmentReserves.standard ?? 0,
        segPlus: editData.reservation.segmentReserves.plus ?? 5,
        segPremium: editData.reservation.segmentReserves.premium ?? 10,
        segVip: editData.reservation.segmentReserves.vip ?? 15,
        cutByExpress: editData.cutOff.bySlotLabel.Express ?? 0.75,
        cutByStandard: editData.cutOff.bySlotLabel.Standard ?? 4,
        cutByFlex: editData.cutOff.bySlotLabel.Flex ?? 6,
        segExtPlus: editData.cutOff.segmentExtension.plus ?? 0.5,
        segExtPremium: editData.cutOff.segmentExtension.premium ?? 1,
        segExtVip: editData.cutOff.segmentExtension.vip ?? 2,
      });
      setSchedule(JSON.parse(JSON.stringify(editData.schedule)));
      setCapDims([...editData.capacity.dimensions]);
      setWaves([...editData.waves]);
      setHolidays([...editData.holidays]);
      setOverrides([...editData.emergencyOverrides]);
      setAltCriteria([...editData.fullSlotBehavior.suggestAlternatives.criteria]);
    } else {
      form.resetFields();
      form.setFieldsValue({
        serviceType: 'home', version: 1, isActive: true, capLogic: 'AND', cutOffDefault: 4,
        holdDuration: 600, holdBackPct: 20, strategy: 'BALANCED', forceBookEnabled: true, maxOverbookPct: 10,
        autoBlock: true, suggestEnabled: true, maxSuggestions: 3,
        fallbackMode: 'static_slots', fallbackMsg: 'Delivery slots temporarily unavailable',
        rescheduleEnabled: true, allowedBeforeHours: 12, maxReschedules: 2,
        segStandard: 0, segPlus: 5, segPremium: 10, segVip: 15,
        cutByExpress: 0.75, cutByStandard: 4, cutByFlex: 6,
        segExtPlus: 0.5, segExtPremium: 1, segExtVip: 2,
      });
      setSchedule(makeDefaultSchedule('home'));
      setCapDims([{ type: 'orders', limit: 25, active: true }, { type: 'items', limit: 200, active: true }, { type: 'weight_kg', limit: 600, active: false }, { type: 'volume_m3', limit: 4, active: false }]);
      setWaves([{ waveId: 'w1', name: 'Wave 1', ordersPerWave: 20, itemsPerWave: 160, waveDurationMin: 90, combinationLogic: 'AND' }]);
      setHolidays([]); setOverrides([]);
      setAltCriteria(['same_day_different_time', 'next_day_same_time']);
    }
  }, [visible, editData, form]);

  const handleSave = async () => {
    const v = await form.validateFields();
    const id = editData ? editData.identity.id : `slot-${v.storeId}-${v.zoneName || 'default'}-${v.serviceType}-${Date.now().toString(36)}`;
    const rec: SlotConfigRecord = {
      identity: { id, storeId: v.storeId, storeName: v.storeName, zoneName: v.zoneName || '', serviceType: v.serviceType, version: v.version || 1, isActive: v.isActive ?? true },
      schedule,
      capacity: { dimensions: capDims, combinationLogic: v.capLogic },
      cutOff: {
        default: v.cutOffDefault, evaluationOrder: ['byCarrier', 'byGoodType', 'bySlotLabel', 'byZone', 'default'],
        bySlotLabel: { Express: v.cutByExpress, Standard: v.cutByStandard, Flex: v.cutByFlex },
        byZone: {}, byCarrier: {}, byGoodType: { frozen: 3, food: 4 },
        segmentExtension: { plus: v.segExtPlus, premium: v.segExtPremium, vip: v.segExtVip },
      },
      reservation: {
        holdDurationSec: v.holdDuration, holdBackPct: v.holdBackPct, strategy: v.strategy,
        segmentReserves: { standard: v.segStandard, plus: v.segPlus, premium: v.segPremium, vip: v.segVip },
        forceBook: { enabled: v.forceBookEnabled, allowedSegments: ['vip', 'premium'], maxOverbookPct: v.maxOverbookPct },
      },
      waves, fullSlotBehavior: { autoBlock: v.autoBlock, suggestAlternatives: { enabled: v.suggestEnabled, maxSuggestions: v.maxSuggestions, criteria: altCriteria } },
      holidays, emergencyOverrides: overrides,
      fallback: { mode: v.fallbackMode, message: v.fallbackMsg, staticSlots: [{ start: '10:00', end: '18:00' }] },
      reschedule: { enabled: v.rescheduleEnabled, allowedBeforeHours: v.allowedBeforeHours, maxReschedules: v.maxReschedules },
    };
    onSave(rec);
  };

  // Schedule helpers
  const daySlots = schedule[schedDay] || [];
  const updateSlot = (i: number, f: string, val: any) => { const s = { ...schedule }; s[schedDay] = [...daySlots]; s[schedDay][i] = { ...s[schedDay][i], [f]: val }; setSchedule(s); };
  const addSlot = () => { const s = { ...schedule }; s[schedDay] = [...daySlots, { start: '09:00', end: '11:00', capacity: 15, label: 'Standard' }]; setSchedule(s); };
  const removeSlot = (i: number) => { const s = { ...schedule }; s[schedDay] = daySlots.filter((_, j) => j !== i); setSchedule(s); };

  const drawerTitle = (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 90 }}>
      <span style={{ fontSize: 16, fontWeight: 600 }}>{editData ? 'Edit Slot Config' : 'New Slot Config'}</span>
      <Space><Button onClick={onClose}>Cancel</Button><Button type="primary" onClick={handleSave} style={{ background: '#1659CB', borderColor: '#1659CB' }}>Save</Button></Space>
    </div>
  );

  const tabItems = [
    { key: 'identity', label: 'Identity', children: (
      <>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Store & Zone</div>
        <Form.Item name="storeId" label={<strong>* Store ID</strong>} rules={[{ required: true }]}><Input disabled={!!editData} placeholder="e.g. 4660" /></Form.Item>
        <Form.Item name="storeName" label={<strong>* Store Name</strong>} rules={[{ required: true }]}><Input placeholder="e.g. LAD Borsbeek" /></Form.Item>
        <Form.Item name="zoneName" label="Zone Name"><Input placeholder="e.g. Brussels_3" /></Form.Item>
        <Form.Item name="serviceType" label="Service Type" rules={[{ required: true }]}><Select options={SERVICE_TYPES} /></Form.Item>
        <Form.Item name="version" label="Version"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
        <Form.Item name="isActive" label="Active" valuePropName="checked"><Switch /></Form.Item>
      </>
    )},
    { key: 'schedule', label: 'Schedule', children: (
      <>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Weekly Slot Schedule</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {DAYS.map(d => <Button key={d} size="small" type={schedDay === d ? 'primary' : 'default'} onClick={() => setSchedDay(d)} style={schedDay === d ? { background: '#1659CB', borderColor: '#1659CB' } : {}}>{d.slice(0, 3)} ({(schedule[d] || []).length})</Button>)}
        </div>
        <Table dataSource={daySlots.map((s, i) => ({ ...s, key: i }))} pagination={false} size="small" columns={[
          { title: 'Start', dataIndex: 'start', width: 100, render: (v: string, _: any, i: number) => <Input value={v} onChange={e => updateSlot(i, 'start', e.target.value)} size="small" /> },
          { title: 'End', dataIndex: 'end', width: 100, render: (v: string, _: any, i: number) => <Input value={v} onChange={e => updateSlot(i, 'end', e.target.value)} size="small" /> },
          { title: 'Capacity', dataIndex: 'capacity', width: 90, render: (v: number, _: any, i: number) => <InputNumber value={v} min={0} onChange={val => updateSlot(i, 'capacity', val)} size="small" style={{ width: '100%' }} /> },
          { title: 'Label', dataIndex: 'label', width: 110, render: (v: string, _: any, i: number) => <Select value={v} onChange={val => updateSlot(i, 'label', val)} size="small" options={SLOT_LABELS.map(l => ({ value: l, label: l }))} style={{ width: '100%' }} /> },
          { title: '', width: 50, render: (_: any, __: any, i: number) => <Button danger size="small" icon={<DeleteOutlined />} onClick={() => removeSlot(i)} /> },
        ]} />
        <Button type="dashed" icon={<PlusOutlined />} onClick={addSlot} style={{ marginTop: 12, width: '100%' }}>Add Slot</Button>
      </>
    )},
    { key: 'capacity', label: 'Capacity', children: (
      <>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Capacity Dimensions</div>
        <Form.Item name="capLogic" label="Combination Logic"><Select options={[{ value: 'AND', label: 'AND (all must be within limits)' }, { value: 'OR', label: 'OR (any one limit)' }]} /></Form.Item>
        <Table dataSource={capDims.map((d, i) => ({ ...d, key: i }))} pagination={false} size="small" columns={[
          { title: 'Type', dataIndex: 'type', render: (v: string) => <Tag>{v}</Tag> },
          { title: 'Limit', dataIndex: 'limit', render: (v: number, _: any, i: number) => <InputNumber value={v} min={0} onChange={val => { const c = [...capDims]; c[i] = { ...c[i], limit: val ?? 0 }; setCapDims(c); }} style={{ width: '100%' }} size="small" /> },
          { title: 'Active', dataIndex: 'active', render: (v: boolean, _: any, i: number) => <Switch checked={v} size="small" onChange={val => { const c = [...capDims]; c[i] = { ...c[i], active: val }; setCapDims(c); }} /> },
        ]} />
      </>
    )},
    { key: 'cutoff', label: 'Cut-off', children: (
      <>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Cut-off Rules</div>
        <div style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>Evaluation order: Carrier → Good Type → Slot Label → Zone → Default</div>
        <Form.Item name="cutOffDefault" label="Default Cut-off (hours)"><InputNumber min={0} step={0.5} style={{ width: '100%' }} /></Form.Item>
        <Divider>By Slot Label</Divider>
        <Row gutter={12}>
          <Col span={8}><Form.Item name="cutByExpress" label="Express (h)"><InputNumber min={0} step={0.25} style={{ width: '100%' }} /></Form.Item></Col>
          <Col span={8}><Form.Item name="cutByStandard" label="Standard (h)"><InputNumber min={0} step={0.5} style={{ width: '100%' }} /></Form.Item></Col>
          <Col span={8}><Form.Item name="cutByFlex" label="Flex (h)"><InputNumber min={0} step={0.5} style={{ width: '100%' }} /></Form.Item></Col>
        </Row>
        <Divider>Segment Extension (hours subtracted)</Divider>
        <Row gutter={12}>
          <Col span={8}><Form.Item name="segExtPlus" label="Plus"><InputNumber min={0} step={0.25} style={{ width: '100%' }} /></Form.Item></Col>
          <Col span={8}><Form.Item name="segExtPremium" label="Premium"><InputNumber min={0} step={0.25} style={{ width: '100%' }} /></Form.Item></Col>
          <Col span={8}><Form.Item name="segExtVip" label="VIP"><InputNumber min={0} step={0.5} style={{ width: '100%' }} /></Form.Item></Col>
        </Row>
      </>
    )},
    { key: 'reservation', label: 'Reservation', children: (
      <>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Hold & Reservation</div>
        <Row gutter={16}>
          <Col span={8}><Form.Item name="holdDuration" label="Hold Duration (sec)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          <Col span={8}><Form.Item name="holdBackPct" label="Hold-back %"><InputNumber min={0} max={100} style={{ width: '100%' }} /></Form.Item></Col>
          <Col span={8}><Form.Item name="strategy" label="Strategy"><Select options={STRATEGIES.map(s => ({ value: s, label: s }))} /></Form.Item></Col>
        </Row>
        <Divider>Segment Reserves (%)</Divider>
        <Row gutter={12}>
          <Col span={6}><Form.Item name="segStandard" label="Standard"><InputNumber min={0} max={100} style={{ width: '100%' }} /></Form.Item></Col>
          <Col span={6}><Form.Item name="segPlus" label="Plus"><InputNumber min={0} max={100} style={{ width: '100%' }} /></Form.Item></Col>
          <Col span={6}><Form.Item name="segPremium" label="Premium"><InputNumber min={0} max={100} style={{ width: '100%' }} /></Form.Item></Col>
          <Col span={6}><Form.Item name="segVip" label="VIP"><InputNumber min={0} max={100} style={{ width: '100%' }} /></Form.Item></Col>
        </Row>
        <Divider>Force Booking</Divider>
        <Form.Item name="forceBookEnabled" label="Enabled" valuePropName="checked"><Switch /></Form.Item>
        <Form.Item name="maxOverbookPct" label="Max Overbook %"><InputNumber min={0} max={50} style={{ width: '100%' }} /></Form.Item>
      </>
    )},
    { key: 'waves', label: 'Waves', children: (
      <>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Wave Configuration</div>
        <Table dataSource={waves.map((w, i) => ({ ...w, key: i }))} pagination={false} size="small" columns={[
          { title: 'Name', dataIndex: 'name', render: (v: string, _: any, i: number) => <Input value={v} onChange={e => { const w2 = [...waves]; w2[i] = { ...w2[i], name: e.target.value }; setWaves(w2); }} size="small" /> },
          { title: 'Orders', dataIndex: 'ordersPerWave', render: (v: number, _: any, i: number) => <InputNumber value={v} min={1} onChange={val => { const w2 = [...waves]; w2[i] = { ...w2[i], ordersPerWave: val ?? 1 }; setWaves(w2); }} size="small" style={{ width: '100%' }} /> },
          { title: 'Items', dataIndex: 'itemsPerWave', render: (v: number, _: any, i: number) => <InputNumber value={v} min={1} onChange={val => { const w2 = [...waves]; w2[i] = { ...w2[i], itemsPerWave: val ?? 1 }; setWaves(w2); }} size="small" style={{ width: '100%' }} /> },
          { title: 'Duration (min)', dataIndex: 'waveDurationMin', render: (v: number, _: any, i: number) => <InputNumber value={v} min={1} onChange={val => { const w2 = [...waves]; w2[i] = { ...w2[i], waveDurationMin: val ?? 1 }; setWaves(w2); }} size="small" style={{ width: '100%' }} /> },
          { title: '', width: 50, render: (_: any, __: any, i: number) => <Button danger size="small" icon={<DeleteOutlined />} onClick={() => setWaves(waves.filter((_, j) => j !== i))} /> },
        ]} />
        <Button type="dashed" icon={<PlusOutlined />} onClick={() => setWaves([...waves, { waveId: `w${waves.length + 1}`, name: `Wave ${waves.length + 1}`, ordersPerWave: 20, itemsPerWave: 160, waveDurationMin: 90, combinationLogic: 'AND' }])} style={{ marginTop: 12, width: '100%' }}>Add Wave</Button>
      </>
    )},
    { key: 'behavior', label: 'Behavior', children: (
      <>
        <Row gutter={16}>
          <Col span={12}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Full Slot Behavior</div>
            <Form.Item name="autoBlock" label="Auto-block when full" valuePropName="checked"><Switch /></Form.Item>
            <Form.Item name="suggestEnabled" label="Suggest alternatives" valuePropName="checked"><Switch /></Form.Item>
            <Form.Item name="maxSuggestions" label="Max suggestions"><InputNumber min={1} max={10} style={{ width: '100%' }} /></Form.Item>
            <div style={{ marginBottom: 8 }}><strong>Criteria:</strong></div>
            {ALT_CRITERIA.map(c => <Tag key={c} color={altCriteria.includes(c) ? 'blue' : 'default'} style={{ cursor: 'pointer', marginBottom: 4 }}
              onClick={() => setAltCriteria(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}>{c.replace(/_/g, ' ')}</Tag>)}
          </Col>
          <Col span={12}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Fallback</div>
            <Form.Item name="fallbackMode" label="Mode"><Select options={FALLBACK_MODES.map(m => ({ value: m, label: m.replace(/_/g, ' ') }))} /></Form.Item>
            <Form.Item name="fallbackMsg" label="Message"><Input.TextArea rows={2} /></Form.Item>
            <Divider />
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Reschedule</div>
            <Form.Item name="rescheduleEnabled" label="Enabled" valuePropName="checked"><Switch /></Form.Item>
            <Form.Item name="allowedBeforeHours" label="Allowed before (hours)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
            <Form.Item name="maxReschedules" label="Max reschedules"><InputNumber min={0} max={10} style={{ width: '100%' }} /></Form.Item>
          </Col>
        </Row>
      </>
    )},
  ];

  return (
    <Drawer title={drawerTitle} width="55vw" placement="right" onClose={onClose} open={visible}
      closeIcon={<CloseOutlined />} zIndex={1200} styles={{ body: { padding: 24 } }}>
      <Form form={form} layout="vertical" requiredMark={false}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Form>
    </Drawer>
  );
}
