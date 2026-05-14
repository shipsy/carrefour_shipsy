/* ============================================================
   Customer Segments — Admin Page
   Manage customer tiers, pricing, and capacity reservations
   ============================================================ */

import { useState } from 'react';
import {
  Card, SectionTitle, Label, StatusDot, Toggle, Input, Button,
  Td, TrHover, InfoBox, useToast, FlexRow, T,
} from '../shared';
import type { SegmentDefinition } from '../types';
import { segments as seedSegments } from '../data';

const featureRows = [
  { key: 'pricingDiscountPct', label: 'Discount', fmt: (v: number) => `${v}%` },
  { key: 'freeDeliveryThreshold', label: 'Free Delivery Threshold', fmt: (v: number) => v === 0 ? 'Always free' : `EUR ${v}` },
  { key: 'maxFee', label: 'Max Fee', fmt: (_: number, seg: SegmentDefinition) => {
    const map: Record<string, string> = { standard: 'EUR 12.99', plus: 'EUR 9.99', premium: 'EUR 7.99', vip: 'EUR 0.00' };
    return map[seg.id] ?? '—';
  }},
  { key: 'capacityReservePct', label: 'Capacity Reserve', fmt: (v: number) => `${v}%` },
  { key: 'cutOffExtensionMin', label: 'Cut-off Extension', fmt: (v: number) => v === 0 ? 'None' : `${v} min` },
  { key: 'priorityLevel', label: 'Priority', fmt: (v: number) => `Level ${v}` },
] as const;

export default function CustomerSegments() {
  const [segmentList, setSegmentList] = useState<SegmentDefinition[]>(JSON.parse(JSON.stringify(seedSegments)));
  const { show, Toast } = useToast();

  const update = (idx: number, patch: Partial<SegmentDefinition>) => {
    setSegmentList(prev => prev.map((s, i) => i === idx ? { ...s, ...patch } : s));
  };

  const handleSave = () => show('Segment configuration saved');

  return (
    <div>
      <Toast />

      {/* ── Rule Preview ──────────────────────────────────────── */}
      <InfoBox type="info">
        When a customer belongs to multiple segments, the highest priority segment applies (exclusive).
        Promo codes stack on top (cumulative).
      </InfoBox>

      {/* ── Segment Cards ─────────────────────────────────────── */}
      <SectionTitle actions={<Button variant="secondary" size="sm" onClick={() => show('Custom segment creation coming soon')}>+ Custom Segment</Button>}>
        Segment Definitions
      </SectionTitle>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {segmentList.map((seg, idx) => (
          <Card key={seg.id} style={{ borderTop: `3px solid ${seg.color}`, marginBottom: 0 }}>
            {/* Header */}
            <FlexRow justify="space-between">
              <FlexRow gap={8}>
                <StatusDot status={seg.isActive ? 'active' : 'inactive'} />
                <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{seg.name}</span>
              </FlexRow>
              <Toggle checked={seg.isActive} onChange={v => update(idx, { isActive: v })} />
            </FlexRow>

            <p style={{ fontSize: 12, color: T.textSecondary, margin: '8px 0 14px' }}>{seg.description}</p>

            {/* Editable fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <Label>Pricing Discount %</Label>
                <Input
                  type="number" value={seg.pricingDiscountPct}
                  onChange={v => update(idx, { pricingDiscountPct: Math.max(0, Math.min(100, Number(v))) })}
                  prefix="%"
                />
              </div>
              <div>
                <Label>Free Delivery Threshold (EUR)</Label>
                <Input
                  type="number" value={seg.freeDeliveryThreshold}
                  onChange={v => update(idx, { freeDeliveryThreshold: Math.max(0, Number(v)) })}
                  prefix="EUR"
                />
              </div>
              <div>
                <Label>Capacity Reserve %</Label>
                <Input
                  type="number" value={seg.capacityReservePct}
                  onChange={v => update(idx, { capacityReservePct: Math.max(0, Math.min(100, Number(v))) })}
                  prefix="%"
                />
              </div>
              <div>
                <Label>Cut-off Extension (min)</Label>
                <Input
                  type="number" value={seg.cutOffExtensionMin}
                  onChange={v => update(idx, { cutOffExtensionMin: Math.max(0, Number(v)) })}
                  prefix="min"
                />
              </div>
              <div>
                <Label>Priority Level</Label>
                <Input
                  type="number" value={seg.priorityLevel}
                  onChange={v => update(idx, { priorityLevel: Math.max(1, Number(v)) })}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Segment Comparison Table ──────────────────────────── */}
      <Card>
        <SectionTitle>Segment Comparison</SectionTitle>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', color: T.textSecondary, background: T.headerBg, borderBottom: `1px solid ${T.border}` }}>
                  Feature
                </th>
                {segmentList.map(seg => (
                  <th key={seg.id} style={{ textAlign: 'center', padding: '10px 12px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', color: seg.color, background: T.headerBg, borderBottom: `1px solid ${T.border}` }}>
                    <FlexRow gap={6} justify="center">
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: seg.color, display: 'inline-block' }} />
                      {seg.name}
                    </FlexRow>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {featureRows.map(row => (
                <TrHover key={row.key}>
                  <Td style={{ fontWeight: 600, fontSize: 12 }}>{row.label}</Td>
                  {segmentList.map(seg => (
                    <Td key={seg.id} mono style={{ textAlign: 'center' }}>
                      {row.fmt((seg as any)[row.key] ?? 0, seg)}
                    </Td>
                  ))}
                </TrHover>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Save ──────────────────────────────────────────────── */}
      <FlexRow justify="flex-end" gap={12}>
        <Button variant="secondary" onClick={() => setSegmentList(JSON.parse(JSON.stringify(seedSegments)))}>Reset</Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </FlexRow>
    </div>
  );
}
