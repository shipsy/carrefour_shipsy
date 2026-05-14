/* ============================================================
   Allocation Rules — Admin Page
   Fleet allocation waterfall & zone assignment matrix
   ============================================================ */

import { useState } from 'react';
import {
  Card, SectionTitle, Label, Badge, Toggle, Input, Select, Button,
  Table, Td, TrHover, FilterBar, FilterChip, Modal, InfoBox,
  useToast, FlexRow, T,
} from '../shared';
import { allocationRules as seedRules, carriers, zones } from '../data';
import type { AllocationRule, BusinessLine } from '../types';

const blOptions: { value: BusinessLine | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'LAD', label: 'LAD' },
  { value: 'FastDelivery', label: 'Fast Delivery' },
  { value: 'Drive', label: 'Drive' },
];

const carrierTypeColor: Record<string, 'blue' | 'green'> = {
  own_fleet: 'blue', '3pl': 'green',
};

const fleetBarColors = [
  '#1659CB', '#20B249', '#F0A105', '#7C3AED', '#D40B00', '#0891B2', '#EA580C',
];

function getCarrierName(id: string): string {
  return carriers.find(c => c.id === id)?.name || id;
}

function getZoneName(id: string): string {
  return zones.find(z => z.id === id)?.name || id;
}

export default function AllocationRules() {
  const [rules, setRules] = useState<AllocationRule[]>(seedRules);
  const [blFilter, setBlFilter] = useState<BusinessLine | 'all'>('all');
  const [showAdd, setShowAdd] = useState(false);
  const { show, Toast } = useToast();

  // Add rule form
  const [newBL, setNewBL] = useState<BusinessLine>('LAD');
  const [newCarrierId, setNewCarrierId] = useState(carriers[0]?.id || '');
  const [newZoneIds, setNewZoneIds] = useState<string[]>([]);
  const [newMaxPct, setNewMaxPct] = useState('10');
  const [newPriority, setNewPriority] = useState('1');

  const filteredRules = rules
    .filter(r => blFilter === 'all' || r.businessLine === blFilter)
    .sort((a, b) => a.priority - b.priority);

  const blGroups = (['LAD', 'FastDelivery', 'Drive'] as BusinessLine[]).filter(
    bl => blFilter === 'all' || bl === blFilter
  );

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
    show('Rule status updated');
  };

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
    show('Rule deleted');
  };

  const handleAdd = () => {
    if (!newCarrierId || newZoneIds.length === 0) return;
    const rule: AllocationRule = {
      id: `ar-${Date.now()}`,
      businessLine: newBL,
      priority: parseInt(newPriority) || 99,
      carrierId: newCarrierId,
      zoneCoverage: [...newZoneIds],
      maxPct: parseInt(newMaxPct) || 10,
      isActive: true,
    };
    setRules(prev => [...prev, rule]);
    setShowAdd(false);
    setNewZoneIds([]);
    show('Allocation rule added');
  };

  const toggleZone = (zid: string) => {
    setNewZoneIds(prev => prev.includes(zid) ? prev.filter(z => z !== zid) : [...prev, zid]);
  };

  // Unique zones from filtered rules
  const matrixZoneIds = [...new Set(filteredRules.flatMap(r => r.zoneCoverage))].sort();
  const matrixCarrierIds = [...new Set(filteredRules.map(r => r.carrierId))];

  // Cost data for carriers in filtered rules
  const costCarriers = matrixCarrierIds
    .map(cid => carriers.find(c => c.id === cid))
    .filter(Boolean)
    .sort((a, b) => a!.costPerDelivery - b!.costPerDelivery);
  const maxCost = Math.max(...costCarriers.map(c => c!.costPerDelivery), 1);

  return (
    <div>
      <InfoBox>
        Orders are allocated in priority order. When the max % for a carrier is reached, the system falls through to the next carrier in the waterfall.
      </InfoBox>

      {/* Filter Bar */}
      <FilterBar>
        <span style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, marginRight: 4 }}>Business Line:</span>
        {blOptions.map(opt => (
          <FilterChip key={opt.value} label={opt.label} active={blFilter === opt.value}
            onClick={() => setBlFilter(opt.value as BusinessLine | 'all')} />
        ))}
      </FilterBar>

      {/* Fleet Split Visualization */}
      {blGroups.map(bl => {
        const blRules = rules.filter(r => r.businessLine === bl && r.isActive).sort((a, b) => a.priority - b.priority);
        if (blRules.length === 0) return null;
        const totalPct = blRules.reduce((s, r) => s + r.maxPct, 0);
        return (
          <Card key={bl} style={{ marginBottom: 16 }}>
            <SectionTitle>{bl} Fleet Split</SectionTitle>
            {/* Visual bar */}
            <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', height: 36, marginBottom: 12 }}>
              {blRules.map((r, i) => {
                const widthPct = (r.maxPct / totalPct) * 100;
                const color = fleetBarColors[i % fleetBarColors.length];
                return (
                  <div key={r.id} title={`${getCarrierName(r.carrierId)}: ${r.maxPct}%`}
                    style={{
                      width: `${widthPct}%`, background: color, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: 11,
                      fontWeight: 700, color: '#fff', minWidth: 40, transition: 'width 0.3s',
                    }}>
                    {r.maxPct}%
                  </div>
                );
              })}
            </div>
            {/* Legend */}
            <FlexRow gap={16}>
              {blRules.map((r, i) => (
                <FlexRow key={r.id} gap={6}>
                  <span style={{
                    width: 12, height: 12, borderRadius: 2,
                    background: fleetBarColors[i % fleetBarColors.length], display: 'inline-block',
                  }} />
                  <span style={{ fontSize: 12, color: T.text, fontWeight: 500 }}>
                    {getCarrierName(r.carrierId)}
                  </span>
                </FlexRow>
              ))}
            </FlexRow>
          </Card>
        );
      })}

      {/* Allocation Waterfall Table */}
      <SectionTitle actions={<Button onClick={() => setShowAdd(true)}>+ Add Rule</Button>}>
        Allocation Waterfall
      </SectionTitle>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <Table headers={['Priority', 'Carrier', 'Type', 'Business Line', 'Zone Coverage', 'Max %', 'Status', 'Actions']}>
          {filteredRules.map(rule => (
            <TrHover key={rule.id}>
              <Td mono style={{ fontWeight: 700 }}>#{rule.priority}</Td>
              <Td style={{ fontWeight: 600 }}>{getCarrierName(rule.carrierId)}</Td>
              <Td>
                <Badge color={carrierTypeColor[carriers.find(c => c.id === rule.carrierId)?.type || '3pl'] || 'gray'}>
                  {carriers.find(c => c.id === rule.carrierId)?.type === 'own_fleet' ? 'Own Fleet' : '3PL'}
                </Badge>
              </Td>
              <Td><Badge color={rule.businessLine === 'LAD' ? 'blue' : rule.businessLine === 'FastDelivery' ? 'orange' : 'green'}>{rule.businessLine}</Badge></Td>
              <Td style={{ fontSize: 11, maxWidth: 200 }}>
                {rule.zoneCoverage.map(zid => getZoneName(zid)).join(', ')}
              </Td>
              <Td mono style={{ fontWeight: 700 }}>{rule.maxPct}%</Td>
              <Td><Toggle checked={rule.isActive} onChange={() => toggleRule(rule.id)} /></Td>
              <Td>
                <Button variant="danger" size="sm" onClick={() => deleteRule(rule.id)}>Delete</Button>
              </Td>
            </TrHover>
          ))}
        </Table>
      </Card>

      {/* Per-Zone Assignment Matrix */}
      <div style={{ marginTop: 28 }}>
        <SectionTitle>Zone-Carrier Assignment Matrix</SectionTitle>
        <Card style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr>
                <th style={{
                  textAlign: 'left', padding: '10px 12px', fontSize: 11, fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.3px', color: T.textSecondary,
                  background: T.headerBg, borderBottom: `1px solid ${T.border}`, position: 'sticky', left: 0,
                }}>Zone</th>
                {matrixCarrierIds.map(cid => (
                  <th key={cid} style={{
                    textAlign: 'center', padding: '10px 8px', fontSize: 11, fontWeight: 600,
                    color: T.textSecondary, background: T.headerBg, borderBottom: `1px solid ${T.border}`,
                    whiteSpace: 'nowrap',
                  }}>{getCarrierName(cid)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrixZoneIds.map(zid => (
                <tr key={zid}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F6FCFE'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                  <td style={{
                    padding: '8px 12px', fontSize: 12, fontWeight: 600, color: T.text,
                    borderBottom: `1px solid #F0F0F0`, position: 'sticky', left: 0, background: 'inherit',
                  }}>{getZoneName(zid)}</td>
                  {matrixCarrierIds.map(cid => {
                    const hasRule = filteredRules.some(r => r.carrierId === cid && r.zoneCoverage.includes(zid));
                    return (
                      <td key={cid} style={{
                        textAlign: 'center', padding: '8px 8px',
                        borderBottom: `1px solid #F0F0F0`,
                      }}>
                        {hasRule ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 24, height: 24, borderRadius: '50%', background: T.successLight,
                            color: T.success, fontWeight: 700, fontSize: 14,
                          }}>&#10003;</span>
                        ) : (
                          <span style={{ color: '#DDD', fontSize: 16 }}>-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Cost Comparison Card */}
      <div style={{ marginTop: 28 }}>
        <SectionTitle>Cost per Delivery Comparison</SectionTitle>
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {costCarriers.map(carrier => {
              if (!carrier) return null;
              const pct = (carrier.costPerDelivery / maxCost) * 100;
              const isOwn = carrier.type === 'own_fleet';
              return (
                <div key={carrier.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 140, fontSize: 12, fontWeight: 600, color: T.text, flexShrink: 0 }}>
                    {carrier.name}
                  </div>
                  <div style={{ flex: 1, height: 24, background: '#F0F0F0', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                    <div style={{
                      width: `${pct}%`, height: '100%',
                      background: isOwn ? T.primary : T.success,
                      borderRadius: 4, transition: 'width 0.4s',
                      display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8,
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>
                        EUR {carrier.costPerDelivery.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <Badge color={isOwn ? 'blue' : 'green'}>{isOwn ? 'Own' : '3PL'}</Badge>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Add Rule Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Allocation Rule" width={560}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <Label>Business Line</Label>
            <Select value={newBL} onChange={v => setNewBL(v as BusinessLine)}
              options={[
                { value: 'LAD', label: 'LAD' },
                { value: 'FastDelivery', label: 'Fast Delivery' },
                { value: 'Drive', label: 'Drive' },
              ]} />
          </div>

          <div>
            <Label>Carrier</Label>
            <Select value={newCarrierId} onChange={setNewCarrierId}
              options={carriers.map(c => ({ value: c.id, label: `${c.name} (${c.type === 'own_fleet' ? 'Own Fleet' : '3PL'})` }))} />
          </div>

          <div>
            <Label>Zone Coverage (select one or more)</Label>
            <div style={{
              maxHeight: 180, overflowY: 'auto', border: `1px solid ${T.border}`,
              borderRadius: 4, padding: 8,
            }}>
              {zones.map(z => (
                <label key={z.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0',
                  fontSize: 12, cursor: 'pointer',
                }}>
                  <input type="checkbox" checked={newZoneIds.includes(z.id)}
                    onChange={() => toggleZone(z.id)} />
                  {z.name}
                  <span style={{ fontSize: 10, color: T.textMuted }}>({z.postalCodes.join(', ')})</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <Label>Max Allocation %</Label>
              <Input value={newMaxPct} onChange={setNewMaxPct} type="number" />
            </div>
            <div>
              <Label>Priority (lower = higher)</Label>
              <Input value={newPriority} onChange={setNewPriority} type="number" />
            </div>
          </div>

          <FlexRow justify="flex-end" gap={8}>
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={newZoneIds.length === 0}>Add Rule</Button>
          </FlexRow>
        </div>
      </Modal>

      <Toast />
    </div>
  );
}
