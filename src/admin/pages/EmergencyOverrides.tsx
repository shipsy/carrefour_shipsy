/* ============================================================
   Emergency Overrides — Admin Page
   Dedicated action-specific modals with full audit trail
   ============================================================ */

import { useState, useEffect } from 'react';
import {
  Card, SectionTitle, Label, Badge, Input, Select, Textarea, Button,
  Table, Td, TrHover, Modal, InfoBox, useToast, FlexRow, T, Slider,
} from '../shared';
import { emergencyOverrides as seedOverrides, zones, stores } from '../data';
import { saveEmergencyOverrides } from '../../engine/config-store';
import type { EmergencyOverride } from '../types';

type OverrideType = EmergencyOverride['type'];

/* ── Action definitions ───────────────────────────────────── */

interface ActionDef {
  type: OverrideType;
  label: string;
  borderColor: string;
  badgeColor: 'red' | 'orange' | 'blue' | 'green';
  icon: string;
  description: string;
}

const actions: ActionDef[] = [
  { type: 'close_slot', label: 'Close Slot', borderColor: T.danger, badgeColor: 'red', icon: '\u26D4', description: 'Immediately close slots for a zone, store, or time period' },
  { type: 'pull_cutoff', label: 'Pull Cut-off', borderColor: T.warning, badgeColor: 'orange', icon: '\u23F1', description: 'Move cut-off time forward to block new orders earlier' },
  { type: 'force_book', label: 'Force Book', borderColor: T.primary, badgeColor: 'blue', icon: '\u2795', description: 'Override capacity limit to book into a full slot' },
  { type: 'reduce_capacity', label: 'Reduce Capacity', borderColor: T.warning, badgeColor: 'orange', icon: '\u2B07', description: 'Lower slot capacity for a store or zone' },
  { type: 'increase_capacity', label: 'Increase Capacity', borderColor: T.success, badgeColor: 'green', icon: '\u2B06', description: 'Raise slot capacity temporarily' },
];

const typeLabelMap: Record<OverrideType, string> = {
  close_slot: 'Close Slot',
  pull_cutoff: 'Pull Cut-off',
  force_book: 'Force Book',
  reduce_capacity: 'Reduce Capacity',
  increase_capacity: 'Increase Capacity',
};

const typeColorMap: Record<OverrideType, 'red' | 'orange' | 'blue' | 'green'> = {
  close_slot: 'red',
  pull_cutoff: 'orange',
  force_book: 'blue',
  reduce_capacity: 'orange',
  increase_capacity: 'green',
};

const zoneOptions = zones.map(z => ({ value: z.id, label: `${z.name} (${z.id})` }));
const storeOptions = stores.map(s => ({ value: s.id, label: `${s.name} (${s.id})` }));
const todOptions = [
  { value: 'morning', label: 'Morning (08:00-12:00)' },
  { value: 'afternoon', label: 'Afternoon (12:00-17:00)' },
  { value: 'evening', label: 'Evening (17:00-21:00)' },
];
const slotLabelOptions = [
  { value: 'Express', label: 'Express' },
  { value: 'Standard', label: 'Standard' },
  { value: 'Flex', label: 'Flex' },
];
const segmentOptions = [
  { value: 'standard', label: 'Standard' },
  { value: 'plus', label: 'Plus' },
  { value: 'premium', label: 'Premium' },
  { value: 'vip', label: 'VIP' },
];

function formatDt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/* ── Checkbox helper ──────────────────────────────────────── */

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', marginRight: 12 }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ accentColor: T.primary }} />
      {label}
    </label>
  );
}

/* ── Field group helper ───────────────────────────────────── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

/* ── Component ────────────────────────────────────────────── */

export default function EmergencyOverrides() {
  const [overrides, setOverrides] = useState<EmergencyOverride[]>(JSON.parse(JSON.stringify(seedOverrides)));
  const { show, Toast } = useToast();

  // Persist emergency overrides to localStorage whenever overrides change
  useEffect(() => {
    const active = overrides.filter(o => o.isActive);
    saveEmergencyOverrides({
      closedSlotIds: active.filter(o => o.type === 'close_slot').map(o => o.scopeValue),
      reducedCapacity: {},
    });
  }, [overrides]);

  // Which modal is open (null = none)
  const [activeModal, setActiveModal] = useState<OverrideType | null>(null);

  /* ── Close Slot state ─────────────────────────────────── */
  const [csScope, setCsScope] = useState<'zone' | 'store' | 'slot'>('zone');
  const [csZone, setCsZone] = useState(zoneOptions[0]?.value ?? '');
  const [csStore, setCsStore] = useState(storeOptions[0]?.value ?? '');
  const [csDate, setCsDate] = useState('');
  const [csToD, setCsToD] = useState('morning');
  const [csLAD, setCsLAD] = useState(true);
  const [csDrive, setCsDrive] = useState(false);
  const [csFast, setCsFast] = useState(false);
  const [csUntil, setCsUntil] = useState('');
  const [csIndefinite, setCsIndefinite] = useState(false);
  const [csReason, setCsReason] = useState('');

  /* ── Pull Cut-off state ───────────────────────────────── */
  const [pcScope, setPcScope] = useState<'zone' | 'store'>('zone');
  const [pcTarget, setPcTarget] = useState(zoneOptions[0]?.value ?? '');
  const [pcCutoff, setPcCutoff] = useState('12:00');
  const [pcDate, setPcDate] = useState('');
  const [pcExpress, setPcExpress] = useState(false);
  const [pcStandard, setPcStandard] = useState(false);
  const [pcFlex, setPcFlex] = useState(false);
  const [pcAll, setPcAll] = useState(true);
  const [pcReason, setPcReason] = useState('');

  /* ── Force Book state ─────────────────────────────────── */
  const [fbDate, setFbDate] = useState('');
  const [fbTime, setFbTime] = useState('morning');
  const [fbSlotLabel, setFbSlotLabel] = useState('Standard');
  const [fbScope, setFbScope] = useState<'zone' | 'store'>('zone');
  const [fbTarget, setFbTarget] = useState(zoneOptions[0]?.value ?? '');
  const [fbSegment, setFbSegment] = useState('standard');
  const [fbOrderRef, setFbOrderRef] = useState('');
  const [fbReason, setFbReason] = useState('');

  /* ── Reduce Capacity state ────────────────────────────── */
  const [rcScope, setRcScope] = useState<'zone' | 'store'>('zone');
  const [rcTarget, setRcTarget] = useState(zoneOptions[0]?.value ?? '');
  const [rcPct, setRcPct] = useState(70);
  const [rcAllSlots, setRcAllSlots] = useState(true);
  const [rcMorning, setRcMorning] = useState(false);
  const [rcAfternoon, setRcAfternoon] = useState(false);
  const [rcEvening, setRcEvening] = useState(false);
  const [rcStart, setRcStart] = useState('');
  const [rcEnd, setRcEnd] = useState('');
  const [rcReason, setRcReason] = useState('');

  /* ── Increase Capacity state ──────────────────────────── */
  const [icScope, setIcScope] = useState<'zone' | 'store'>('zone');
  const [icTarget, setIcTarget] = useState(zoneOptions[0]?.value ?? '');
  const [icAdditional, setIcAdditional] = useState('10');
  const [icAllSlots, setIcAllSlots] = useState(true);
  const [icMorning, setIcMorning] = useState(false);
  const [icAfternoon, setIcAfternoon] = useState(false);
  const [icEvening, setIcEvening] = useState(false);
  const [icStart, setIcStart] = useState('');
  const [icEnd, setIcEnd] = useState('');
  const [icReason, setIcReason] = useState('');

  const CURRENT_CAPACITY = 40;

  /* ── Helpers ──────────────────────────────────────────── */

  const resetAllModals = () => {
    setCsScope('zone'); setCsZone(zoneOptions[0]?.value ?? ''); setCsStore(storeOptions[0]?.value ?? '');
    setCsDate(''); setCsToD('morning'); setCsLAD(true); setCsDrive(false); setCsFast(false);
    setCsUntil(''); setCsIndefinite(false); setCsReason('');
    setPcScope('zone'); setPcTarget(zoneOptions[0]?.value ?? ''); setPcCutoff('12:00');
    setPcDate(''); setPcExpress(false); setPcStandard(false); setPcFlex(false); setPcAll(true); setPcReason('');
    setFbDate(''); setFbTime('morning'); setFbSlotLabel('Standard'); setFbScope('zone');
    setFbTarget(zoneOptions[0]?.value ?? ''); setFbSegment('standard'); setFbOrderRef(''); setFbReason('');
    setRcScope('zone'); setRcTarget(zoneOptions[0]?.value ?? ''); setRcPct(70);
    setRcAllSlots(true); setRcMorning(false); setRcAfternoon(false); setRcEvening(false);
    setRcStart(''); setRcEnd(''); setRcReason('');
    setIcScope('zone'); setIcTarget(zoneOptions[0]?.value ?? ''); setIcAdditional('10');
    setIcAllSlots(true); setIcMorning(false); setIcAfternoon(false); setIcEvening(false);
    setIcStart(''); setIcEnd(''); setIcReason('');
  };

  const openModal = (type: OverrideType) => {
    resetAllModals();
    setActiveModal(type);
  };

  const closeModal = () => setActiveModal(null);

  const addOverride = (o: EmergencyOverride) => {
    setOverrides(prev => [o, ...prev]);
    closeModal();
    show(`Emergency override created: ${typeLabelMap[o.type]}`);
  };

  const deactivate = (id: string) => {
    setOverrides(prev => prev.map(o => o.id === id ? { ...o, isActive: false } : o));
    show('Override deactivated');
  };

  /* ── Create handlers per type ─────────────────────────── */

  const handleCloseSlot = () => {
    if (!csReason.trim()) { show('Reason is required', 'error'); return; }
    if (!csIndefinite && !csUntil) { show('Specify expiry or mark as indefinite', 'error'); return; }
    const scopeValue = csScope === 'zone' ? csZone : csScope === 'store' ? csStore : `${csDate} ${csToD}`;
    const businessLines = [csLAD && 'LAD', csDrive && 'Drive', csFast && 'FastDelivery'].filter(Boolean);
    addOverride({
      id: `eo-${Date.now()}`,
      type: 'close_slot',
      scope: csScope,
      scopeValue,
      reason: csReason.trim(),
      createdBy: 'admin@carrefour.be',
      createdAt: new Date().toISOString(),
      expiresAt: csIndefinite ? '2099-12-31T23:59:59Z' : new Date(csUntil).toISOString(),
      isActive: true,
      params: { businessLines, indefinite: csIndefinite },
    });
  };

  const handlePullCutoff = () => {
    if (!pcReason.trim()) { show('Reason is required', 'error'); return; }
    if (!pcDate) { show('Affected date is required', 'error'); return; }
    const slots = pcAll ? ['All'] : [pcExpress && 'Express', pcStandard && 'Standard', pcFlex && 'Flex'].filter(Boolean);
    addOverride({
      id: `eo-${Date.now()}`,
      type: 'pull_cutoff',
      scope: pcScope,
      scopeValue: pcTarget,
      reason: pcReason.trim(),
      createdBy: 'admin@carrefour.be',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(pcDate + 'T23:59:59').toISOString(),
      isActive: true,
      params: { newCutoff: pcCutoff, affectedDate: pcDate, affectedSlots: slots },
    });
  };

  const handleForceBook = () => {
    if (!fbReason.trim()) { show('Reason is required', 'error'); return; }
    if (!fbDate) { show('Target date is required', 'error'); return; }
    addOverride({
      id: `eo-${Date.now()}`,
      type: 'force_book',
      scope: fbScope,
      scopeValue: fbTarget,
      reason: fbReason.trim(),
      createdBy: 'admin@carrefour.be',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(fbDate + 'T23:59:59').toISOString(),
      isActive: true,
      params: { date: fbDate, timeOfDay: fbTime, slotLabel: fbSlotLabel, segment: fbSegment, orderRef: fbOrderRef },
    });
  };

  const handleReduceCapacity = () => {
    if (!rcReason.trim()) { show('Reason is required', 'error'); return; }
    if (!rcStart || !rcEnd) { show('Effective period is required', 'error'); return; }
    const timeRange = rcAllSlots ? ['All'] : [rcMorning && 'morning', rcAfternoon && 'afternoon', rcEvening && 'evening'].filter(Boolean);
    addOverride({
      id: `eo-${Date.now()}`,
      type: 'reduce_capacity',
      scope: rcScope,
      scopeValue: rcTarget,
      reason: rcReason.trim(),
      createdBy: 'admin@carrefour.be',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(rcEnd).toISOString(),
      isActive: true,
      params: { capacityPct: rcPct, timeRange, effectiveStart: rcStart },
    });
  };

  const handleIncreaseCapacity = () => {
    if (!icReason.trim()) { show('Reason is required', 'error'); return; }
    if (!icStart || !icEnd) { show('Effective period is required', 'error'); return; }
    const timeRange = icAllSlots ? ['All'] : [icMorning && 'morning', icAfternoon && 'afternoon', icEvening && 'evening'].filter(Boolean);
    addOverride({
      id: `eo-${Date.now()}`,
      type: 'increase_capacity',
      scope: icScope,
      scopeValue: icTarget,
      reason: icReason.trim(),
      createdBy: 'admin@carrefour.be',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(icEnd).toISOString(),
      isActive: true,
      params: { additionalOrders: Number(icAdditional), timeRange, effectiveStart: icStart },
    });
  };

  /* ── Derived lists ────────────────────────────────────── */

  const activeOverrides = overrides.filter(o => o.isActive);
  const historyOverrides = overrides.filter(o => !o.isActive);

  /* ── Scope selector (zone / store) reusable ───────────── */

  function ScopeSelector({ scope, onScopeChange, target, onTargetChange }: {
    scope: 'zone' | 'store'; onScopeChange: (v: 'zone' | 'store') => void;
    target: string; onTargetChange: (v: string) => void;
  }) {
    return (
      <>
        <Field label="Scope">
          <Select value={scope} onChange={v => { onScopeChange(v as 'zone' | 'store'); onTargetChange(v === 'zone' ? (zoneOptions[0]?.value ?? '') : (storeOptions[0]?.value ?? '')); }}
            options={[{ value: 'zone', label: 'Zone' }, { value: 'store', label: 'Store' }]} />
        </Field>
        <Field label={scope === 'zone' ? 'Zone' : 'Store'}>
          <Select value={target} onChange={onTargetChange}
            options={scope === 'zone' ? zoneOptions : storeOptions} />
        </Field>
      </>
    );
  }

  /* ── Time-range fields reusable ───────────────────────── */

  function TimeRangeFields({ allSlots, setAllSlots, morning, setMorning, afternoon, setAfternoon, evening, setEvening }: {
    allSlots: boolean; setAllSlots: (v: boolean) => void;
    morning: boolean; setMorning: (v: boolean) => void;
    afternoon: boolean; setAfternoon: (v: boolean) => void;
    evening: boolean; setEvening: (v: boolean) => void;
  }) {
    return (
      <Field label="Affected Time Range">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          <Checkbox checked={allSlots} onChange={v => { setAllSlots(v); if (v) { setMorning(false); setAfternoon(false); setEvening(false); } }} label="All Slots" />
          <Checkbox checked={morning} onChange={v => { setMorning(v); if (v) setAllSlots(false); }} label="Morning" />
          <Checkbox checked={afternoon} onChange={v => { setAfternoon(v); if (v) setAllSlots(false); }} label="Afternoon" />
          <Checkbox checked={evening} onChange={v => { setEvening(v); if (v) setAllSlots(false); }} label="Evening" />
        </div>
      </Field>
    );
  }

  /* ── Render ────────────────────────────────────────────── */

  const gap16: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 16 };

  return (
    <div>
      <Toast />

      {/* ── Warning ───────────────────────────────────────── */}
      <InfoBox type="warning">
        Emergency overrides take immediate effect and bypass normal configuration. All overrides are logged in the audit trail.
      </InfoBox>

      {/* ── Quick Actions Grid ────────────────────────────── */}
      <SectionTitle>Quick Actions</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 28 }}>
        {actions.map(a => (
          <Card key={a.type} style={{ marginBottom: 0, cursor: 'pointer', borderLeft: `4px solid ${a.borderColor}`, transition: 'box-shadow 0.15s' }}>
            <div
              onClick={() => openModal(a.type)}
              style={{ padding: '8px 0' }}
              onMouseEnter={e => { (e.currentTarget.parentElement as HTMLElement).style.boxShadow = `0 4px 16px ${a.borderColor}22`; }}
              onMouseLeave={e => { (e.currentTarget.parentElement as HTMLElement).style.boxShadow = 'none'; }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{a.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: a.borderColor, marginBottom: 4 }}>{a.label}</div>
              <div style={{ fontSize: 11, color: T.textSecondary, lineHeight: 1.4 }}>{a.description}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Close Slot Modal ──────────────────────────────── */}
      <Modal open={activeModal === 'close_slot'} onClose={closeModal} title="Close Slot" width={560}>
        <div style={gap16}>
          <Field label="Scope">
            <Select value={csScope} onChange={v => setCsScope(v as 'zone' | 'store' | 'slot')}
              options={[{ value: 'zone', label: 'Zone' }, { value: 'store', label: 'Store' }, { value: 'slot', label: 'Slot' }]} />
          </Field>

          {csScope === 'zone' && (
            <Field label="Zone">
              <Select value={csZone} onChange={setCsZone} options={zoneOptions} />
            </Field>
          )}
          {csScope === 'store' && (
            <Field label="Store">
              <Select value={csStore} onChange={setCsStore} options={storeOptions} />
            </Field>
          )}
          {csScope === 'slot' && (
            <>
              <Field label="Date">
                <Input type="date" value={csDate} onChange={setCsDate} />
              </Field>
              <Field label="Time of Day">
                <Select value={csToD} onChange={setCsToD} options={todOptions} />
              </Field>
            </>
          )}

          <Field label="Affected Business Lines">
            <div style={{ display: 'flex', gap: 4 }}>
              <Checkbox checked={csLAD} onChange={setCsLAD} label="LAD" />
              <Checkbox checked={csDrive} onChange={setCsDrive} label="Drive" />
              <Checkbox checked={csFast} onChange={setCsFast} label="FastDelivery" />
            </div>
          </Field>

          <Field label="Duration">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: T.textSecondary, minWidth: 30 }}>Until</span>
                <Input type="datetime-local" value={csUntil} onChange={setCsUntil} disabled={csIndefinite} />
              </div>
              <Checkbox checked={csIndefinite} onChange={v => { setCsIndefinite(v); if (v) setCsUntil(''); }} label="Indefinite" />
            </div>
          </Field>

          <Field label="Reason (required)">
            <Textarea value={csReason} onChange={setCsReason} placeholder="Describe why slots are being closed..." rows={3} />
          </Field>

          <FlexRow justify="flex-end" gap={10}>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button variant="danger" onClick={handleCloseSlot} style={{ background: T.danger, color: '#fff' }}>Close Slots Now</Button>
          </FlexRow>
        </div>
      </Modal>

      {/* ── Pull Cut-off Modal ────────────────────────────── */}
      <Modal open={activeModal === 'pull_cutoff'} onClose={closeModal} title="Pull Cut-off Forward" width={560}>
        <div style={gap16}>
          <ScopeSelector scope={pcScope} onScopeChange={setPcScope} target={pcTarget} onTargetChange={setPcTarget} />

          <Field label="New Cut-off Time (HH:MM)">
            <Input type="time" value={pcCutoff} onChange={setPcCutoff} />
          </Field>

          <Field label="Affected Date">
            <Input type="date" value={pcDate} onChange={setPcDate} />
          </Field>

          <Field label="Affected Slots">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              <Checkbox checked={pcAll} onChange={v => { setPcAll(v); if (v) { setPcExpress(false); setPcStandard(false); setPcFlex(false); } }} label="All" />
              <Checkbox checked={pcExpress} onChange={v => { setPcExpress(v); if (v) setPcAll(false); }} label="Express" />
              <Checkbox checked={pcStandard} onChange={v => { setPcStandard(v); if (v) setPcAll(false); }} label="Standard" />
              <Checkbox checked={pcFlex} onChange={v => { setPcFlex(v); if (v) setPcAll(false); }} label="Flex" />
            </div>
          </Field>

          <Field label="Reason (required)">
            <Textarea value={pcReason} onChange={setPcReason} placeholder="Describe why the cut-off is being pulled forward..." rows={3} />
          </Field>

          <FlexRow justify="flex-end" gap={10}>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button variant="primary" onClick={handlePullCutoff} style={{ background: T.warning, color: '#fff', border: 'none' }}>Pull Cut-off Forward</Button>
          </FlexRow>
        </div>
      </Modal>

      {/* ── Force Book Modal ──────────────────────────────── */}
      <Modal open={activeModal === 'force_book'} onClose={closeModal} title="Force Book Order" width={560}>
        <div style={gap16}>
          <Field label="Target Slot Date">
            <Input type="date" value={fbDate} onChange={setFbDate} />
          </Field>

          <FlexRow gap={12}>
            <div style={{ flex: 1 }}>
              <Label>Time of Day</Label>
              <Select value={fbTime} onChange={setFbTime} options={todOptions} />
            </div>
            <div style={{ flex: 1 }}>
              <Label>Slot Label</Label>
              <Select value={fbSlotLabel} onChange={setFbSlotLabel} options={slotLabelOptions} />
            </div>
          </FlexRow>

          <ScopeSelector scope={fbScope} onScopeChange={setFbScope} target={fbTarget} onTargetChange={setFbTarget} />

          <Field label="Customer Segment Override">
            <Select value={fbSegment} onChange={setFbSegment} options={segmentOptions} />
          </Field>

          <Field label="Order Reference">
            <Input value={fbOrderRef} onChange={setFbOrderRef} placeholder="e.g. ORD-2026-00451" />
          </Field>

          <Field label="Reason (required)">
            <Textarea value={fbReason} onChange={setFbReason} placeholder="Describe why this order must be force-booked..." rows={3} />
          </Field>

          <FlexRow justify="flex-end" gap={10}>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button variant="primary" onClick={handleForceBook}>Force Book Order</Button>
          </FlexRow>
        </div>
      </Modal>

      {/* ── Reduce Capacity Modal ─────────────────────────── */}
      <Modal open={activeModal === 'reduce_capacity'} onClose={closeModal} title="Reduce Capacity" width={560}>
        <div style={gap16}>
          <ScopeSelector scope={rcScope} onScopeChange={setRcScope} target={rcTarget} onTargetChange={setRcTarget} />

          <div style={{ background: T.headerBg, borderRadius: 6, padding: '10px 14px', fontSize: 13 }}>
            <span style={{ color: T.textSecondary }}>Current: </span>
            <strong>{CURRENT_CAPACITY} orders/slot</strong>
          </div>

          <Field label={`New Capacity: ${rcPct}% (${Math.round(CURRENT_CAPACITY * rcPct / 100)} orders/slot)`}>
            <Slider value={rcPct} min={10} max={100} step={5} onChange={setRcPct} color={T.warning} />
          </Field>

          <TimeRangeFields allSlots={rcAllSlots} setAllSlots={setRcAllSlots}
            morning={rcMorning} setMorning={setRcMorning}
            afternoon={rcAfternoon} setAfternoon={setRcAfternoon}
            evening={rcEvening} setEvening={setRcEvening} />

          <FlexRow gap={12}>
            <div style={{ flex: 1 }}>
              <Label>Effective From</Label>
              <Input type="datetime-local" value={rcStart} onChange={setRcStart} />
            </div>
            <div style={{ flex: 1 }}>
              <Label>Effective Until</Label>
              <Input type="datetime-local" value={rcEnd} onChange={setRcEnd} />
            </div>
          </FlexRow>

          <Field label="Reason (required)">
            <Textarea value={rcReason} onChange={setRcReason} placeholder="Describe why capacity is being reduced..." rows={3} />
          </Field>

          <FlexRow justify="flex-end" gap={10}>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button variant="primary" onClick={handleReduceCapacity} style={{ background: T.warning, color: '#fff', border: 'none' }}>Reduce Capacity</Button>
          </FlexRow>
        </div>
      </Modal>

      {/* ── Increase Capacity Modal ───────────────────────── */}
      <Modal open={activeModal === 'increase_capacity'} onClose={closeModal} title="Increase Capacity" width={560}>
        <div style={gap16}>
          <ScopeSelector scope={icScope} onScopeChange={setIcScope} target={icTarget} onTargetChange={setIcTarget} />

          <div style={{ background: T.headerBg, borderRadius: 6, padding: '10px 14px', fontSize: 13 }}>
            <span style={{ color: T.textSecondary }}>Current: </span>
            <strong>{CURRENT_CAPACITY} orders/slot</strong>
          </div>

          <Field label="Additional Capacity (+ orders)">
            <Input type="number" value={icAdditional} onChange={setIcAdditional} placeholder="e.g. 10" />
          </Field>

          <div style={{ background: T.successLight, borderRadius: 6, padding: '10px 14px', fontSize: 13, color: T.success, fontWeight: 600 }}>
            New Total: {CURRENT_CAPACITY + (Number(icAdditional) || 0)} orders/slot
          </div>

          <TimeRangeFields allSlots={icAllSlots} setAllSlots={setIcAllSlots}
            morning={icMorning} setMorning={setIcMorning}
            afternoon={icAfternoon} setAfternoon={setIcAfternoon}
            evening={icEvening} setEvening={setIcEvening} />

          <FlexRow gap={12}>
            <div style={{ flex: 1 }}>
              <Label>Effective From</Label>
              <Input type="datetime-local" value={icStart} onChange={setIcStart} />
            </div>
            <div style={{ flex: 1 }}>
              <Label>Effective Until</Label>
              <Input type="datetime-local" value={icEnd} onChange={setIcEnd} />
            </div>
          </FlexRow>

          <Field label="Reason (required)">
            <Textarea value={icReason} onChange={setIcReason} placeholder="Describe why capacity is being increased..." rows={3} />
          </Field>

          <FlexRow justify="flex-end" gap={10}>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button variant="primary" onClick={handleIncreaseCapacity} style={{ background: T.success, color: '#fff', border: 'none' }}>Increase Capacity</Button>
          </FlexRow>
        </div>
      </Modal>

      {/* ── Active Overrides Table ────────────────────────── */}
      <Card>
        <SectionTitle>
          Active Overrides
          {activeOverrides.length > 0 && (
            <Badge color="red">{activeOverrides.length} active</Badge>
          )}
        </SectionTitle>

        {activeOverrides.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: T.textMuted, fontSize: 13 }}>
            No active overrides. Use Quick Actions above to create one.
          </div>
        ) : (
          <Table headers={['Type', 'Scope', 'Target', 'Reason', 'Created By', 'Created At', 'Expires At', 'Status', 'Actions']}>
            {activeOverrides.map(o => (
              <TrHover key={o.id}>
                <Td><Badge color={typeColorMap[o.type]}>{typeLabelMap[o.type]}</Badge></Td>
                <Td><Badge color="gray">{o.scope}</Badge></Td>
                <Td mono>{o.scopeValue}</Td>
                <Td style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.reason}</Td>
                <Td>{o.createdBy}</Td>
                <Td mono style={{ fontSize: 11 }}>{formatDt(o.createdAt)}</Td>
                <Td mono style={{ fontSize: 11 }}>{formatDt(o.expiresAt)}</Td>
                <Td><Badge color="green">Active</Badge></Td>
                <Td>
                  <Button variant="danger" size="sm" onClick={() => deactivate(o.id)}>Deactivate</Button>
                </Td>
              </TrHover>
            ))}
          </Table>
        )}
      </Card>

      {/* ── Override History ───────────────────────────────── */}
      <Card style={{ opacity: 0.7 }}>
        <SectionTitle>Override History</SectionTitle>
        {historyOverrides.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: T.textMuted, fontSize: 13 }}>
            No expired or deactivated overrides yet.
          </div>
        ) : (
          <Table headers={['Type', 'Scope', 'Target', 'Reason', 'Created By', 'Created At', 'Expires At', 'Status']}>
            {historyOverrides.map(o => {
              const isExpired = new Date(o.expiresAt) < new Date();
              return (
                <TrHover key={o.id}>
                  <Td><Badge color={typeColorMap[o.type]}>{typeLabelMap[o.type]}</Badge></Td>
                  <Td><Badge color="gray">{o.scope}</Badge></Td>
                  <Td mono>{o.scopeValue}</Td>
                  <Td style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.reason}</Td>
                  <Td>{o.createdBy}</Td>
                  <Td mono style={{ fontSize: 11 }}>{formatDt(o.createdAt)}</Td>
                  <Td mono style={{ fontSize: 11 }}>{formatDt(o.expiresAt)}</Td>
                  <Td><Badge color="gray">{isExpired ? 'Expired' : 'Deactivated'}</Badge></Td>
                </TrHover>
              );
            })}
          </Table>
        )}
      </Card>
    </div>
  );
}
