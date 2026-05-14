/* ============================================================
   Bulk Operations — Admin Page
   Multi-store batch operations for Carrefour Belgium
   ============================================================ */

import { useState } from 'react';
import {
  Card, SectionTitle, Label, Badge, Button, Input, Select,
  Table, Td, TrHover, InfoBox, useToast, Grid2, FlexRow, T,
} from '../shared';
import { stores, slotTemplates } from '../data';
import type { BulkOperation } from '../types';

type OpType = 'slot_config' | 'price_change' | 'closure' | 'capacity_change';

interface OpTypeCard {
  type: OpType;
  title: string;
  icon: string;
  description: string;
}

const opTypes: OpTypeCard[] = [
  { type: 'slot_config', title: 'Slot Configuration', icon: '\u23F0', description: 'Apply a slot template to multiple stores at once' },
  { type: 'price_change', title: 'Price Change', icon: '€', description: 'Update base fees and floor prices across stores' },
  { type: 'closure', title: 'Store Closure', icon: '\u26D4', description: 'Schedule temporary closures with a date range and reason' },
  { type: 'capacity_change', title: 'Capacity Change', icon: '\u2195', description: 'Adjust daily order capacity for selected stores' },
];

const opTypeBadgeColor: Record<OpType, 'blue' | 'green' | 'orange' | 'red'> = {
  slot_config: 'blue', price_change: 'green', closure: 'red', capacity_change: 'orange',
};

const seedHistory: BulkOperation[] = [
  { id: 'bo1', type: 'slot_config', targetStores: ['hub-north', 'hub-south', 'hub-east'], params: { templateId: 'tpl-lad-weekday' }, status: 'applied', appliedAt: '2026-05-10T14:30:00Z', appliedBy: 'admin@carrefour.be' },
  { id: 'bo2', type: 'price_change', targetStores: ['hub-north', 'hub-south'], params: { baseFee: 5.99, floorPrice: 1.99 }, status: 'applied', appliedAt: '2026-05-08T09:00:00Z', appliedBy: 'admin@carrefour.be' },
  { id: 'bo3', type: 'closure', targetStores: ['s6'], params: { startDate: '2026-04-20', endDate: '2026-04-22', reason: 'Renovation' }, status: 'rolled_back', appliedAt: '2026-04-18T11:15:00Z', appliedBy: 'ops@carrefour.be' },
  { id: 'bo4', type: 'capacity_change', targetStores: ['hub-east', 's4', 's5'], params: { newCapacity: 500, effectiveDate: '2026-05-05' }, status: 'applied', appliedAt: '2026-05-04T16:00:00Z', appliedBy: 'admin@carrefour.be' },
];

export default function BulkOperations() {
  const [selectedOp, setSelectedOp] = useState<OpType | null>(null);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [step, setStep] = useState<'configure' | 'preview' | 'done'>('configure');
  const [history, setHistory] = useState<BulkOperation[]>(seedHistory);
  const { show, Toast } = useToast();

  // Op-specific config state
  const [templateId, setTemplateId] = useState(slotTemplates[0]?.id || '');
  const [baseFee, setBaseFee] = useState('5.99');
  const [floorPrice, setFloorPrice] = useState('1.99');
  const [closureStart, setClosureStart] = useState('');
  const [closureEnd, setClosureEnd] = useState('');
  const [closureReason, setClosureReason] = useState('');
  const [newCapacity, setNewCapacity] = useState('400');
  const [effectiveDate, setEffectiveDate] = useState('');

  const toggleStore = (id: string) => {
    setSelectedStores(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const selectByType = (type: string) => {
    const ids = stores.filter(s => s.type === type).map(s => s.id);
    setSelectedStores(prev => {
      const allSelected = ids.every(id => prev.includes(id));
      if (allSelected) return prev.filter(id => !ids.includes(id));
      return [...new Set([...prev, ...ids])];
    });
  };

  const selectAll = () => {
    if (selectedStores.length === stores.length) {
      setSelectedStores([]);
    } else {
      setSelectedStores(stores.map(s => s.id));
    }
  };

  const getPreviewSummary = (): string => {
    const count = selectedStores.length;
    if (!selectedOp || count === 0) return '';
    switch (selectedOp) {
      case 'slot_config': {
        const tpl = slotTemplates.find(t => t.id === templateId);
        return `Apply template "${tpl?.name || templateId}" to ${count} store(s), affecting ${tpl?.slots.length || 0} slot(s) per store.`;
      }
      case 'price_change':
        return `Update pricing to base fee EUR${baseFee} / floor EUR${floorPrice} across ${count} store(s).`;
      case 'closure':
        return `Close ${count} store(s) from ${closureStart} to ${closureEnd}. Reason: ${closureReason || 'N/A'}.`;
      case 'capacity_change':
        return `Set daily capacity to ${newCapacity} orders for ${count} store(s), effective ${effectiveDate || 'immediately'}.`;
    }
  };

  const handleApply = () => {
    if (step === 'configure') {
      setStep('preview');
      return;
    }
    // Confirm step
    const op: BulkOperation = {
      id: `bo-${Date.now()}`,
      type: selectedOp!,
      targetStores: [...selectedStores],
      params: selectedOp === 'slot_config' ? { templateId }
        : selectedOp === 'price_change' ? { baseFee: parseFloat(baseFee), floorPrice: parseFloat(floorPrice) }
        : selectedOp === 'closure' ? { startDate: closureStart, endDate: closureEnd, reason: closureReason }
        : { newCapacity: parseInt(newCapacity), effectiveDate },
      status: 'applied',
      appliedAt: new Date().toISOString(),
      appliedBy: 'admin@carrefour.be',
    };
    setHistory(prev => [op, ...prev]);
    setStep('done');
    show('Bulk operation applied successfully');
  };

  const resetAll = () => {
    setSelectedOp(null);
    setSelectedStores([]);
    setStep('configure');
  };

  const canProceed = selectedOp && selectedStores.length > 0 && (() => {
    switch (selectedOp) {
      case 'slot_config': return !!templateId;
      case 'price_change': return !!baseFee && !!floorPrice;
      case 'closure': return !!closureStart && !!closureEnd;
      case 'capacity_change': return !!newCapacity;
      default: return false;
    }
  })();

  const statusColor: Record<string, 'green' | 'blue' | 'orange' | 'red'> = {
    applied: 'green', preview: 'blue', rolled_back: 'red',
  };

  return (
    <div>
      {/* Step 1: Operation Type */}
      <SectionTitle actions={step !== 'configure' && <Button variant="secondary" size="sm" onClick={resetAll}>Start Over</Button>}>
        1. Select Operation Type
      </SectionTitle>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {opTypes.map(op => (
          <Card key={op.type}
            style={{
              cursor: step === 'done' ? 'default' : 'pointer',
              border: selectedOp === op.type ? `2px solid ${T.primary}` : `1px solid ${T.border}`,
              background: selectedOp === op.type ? T.primaryLight : T.card,
              opacity: step !== 'configure' && selectedOp !== op.type ? 0.4 : 1,
              transition: 'all 0.15s',
            }}>
            <div onClick={() => step === 'configure' && setSelectedOp(op.type)}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{op.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 4 }}>{op.title}</div>
              <div style={{ fontSize: 11, color: T.textSecondary, lineHeight: 1.4 }}>{op.description}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Step 2: Store Selector */}
      {selectedOp && (
        <>
          <SectionTitle>2. Select Stores ({selectedStores.length} selected)</SectionTitle>
          <Card>
            <FlexRow gap={8}>
              <Button variant={selectedStores.length === stores.length ? 'primary' : 'secondary'} size="sm"
                onClick={selectAll}>Select All</Button>
              <Button variant="secondary" size="sm" onClick={() => selectByType('Hypermarket')}>All Hypermarkets</Button>
              <Button variant="secondary" size="sm" onClick={() => selectByType('Market')}>All Markets</Button>
              <Button variant="secondary" size="sm" onClick={() => selectByType('LAD_Hub')}>All Hubs</Button>
            </FlexRow>
            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 6 }}>
              {stores.map(st => (
                <label key={st.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
                  fontSize: 12, cursor: 'pointer', borderRadius: 4,
                  background: selectedStores.includes(st.id) ? T.primaryLight : 'transparent',
                  border: `1px solid ${selectedStores.includes(st.id) ? T.primary : 'transparent'}`,
                }}>
                  <input type="checkbox" checked={selectedStores.includes(st.id)}
                    onChange={() => toggleStore(st.id)} />
                  <span style={{ fontWeight: 600 }}>{st.name}</span>
                  <Badge color="gray">{st.type}</Badge>
                </label>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* Step 3: Operation Config */}
      {selectedOp && selectedStores.length > 0 && step !== 'done' && (
        <>
          <SectionTitle>3. Configure Operation</SectionTitle>
          <Card>
            {selectedOp === 'slot_config' && (
              <div>
                <Label>Slot Template</Label>
                <Select value={templateId} onChange={setTemplateId}
                  options={slotTemplates.map(t => ({ value: t.id, label: `${t.name} (${t.frequency} / ${t.businessLine})` }))} />
              </div>
            )}

            {selectedOp === 'price_change' && (
              <Grid2>
                <div>
                  <Label>Base Fee (EUR)</Label>
                  <Input value={baseFee} onChange={setBaseFee} type="number" prefix="EUR" />
                </div>
                <div>
                  <Label>Floor Price (EUR)</Label>
                  <Input value={floorPrice} onChange={setFloorPrice} type="number" prefix="EUR" />
                </div>
              </Grid2>
            )}

            {selectedOp === 'closure' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Grid2>
                  <div>
                    <Label>Start Date</Label>
                    <Input value={closureStart} onChange={setClosureStart} type="date" />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input value={closureEnd} onChange={setClosureEnd} type="date" />
                  </div>
                </Grid2>
                <div>
                  <Label>Reason</Label>
                  <Input value={closureReason} onChange={setClosureReason} placeholder="e.g. Renovation, emergency, ..." />
                </div>
              </div>
            )}

            {selectedOp === 'capacity_change' && (
              <Grid2>
                <div>
                  <Label>New Daily Capacity (orders)</Label>
                  <Input value={newCapacity} onChange={setNewCapacity} type="number" />
                </div>
                <div>
                  <Label>Effective Date</Label>
                  <Input value={effectiveDate} onChange={setEffectiveDate} type="date" />
                </div>
              </Grid2>
            )}
          </Card>
        </>
      )}

      {/* Preview Panel */}
      {step === 'preview' && (
        <Card style={{ border: `2px solid ${T.warning}`, background: T.warningLight }}>
          <SectionTitle>Preview Changes</SectionTitle>
          <div style={{ fontSize: 13, color: '#92400E', lineHeight: 1.6, marginBottom: 12 }}>
            {getPreviewSummary()}
          </div>
          <div style={{ fontSize: 12, color: T.textSecondary, marginBottom: 12 }}>
            <strong>Affected stores:</strong>{' '}
            {selectedStores.map(sid => stores.find(s => s.id === sid)?.name || sid).join(', ')}
          </div>
          <InfoBox type="warning">
            This action will be applied immediately. You can roll back from the operation history below.
          </InfoBox>
        </Card>
      )}

      {/* Done Panel */}
      {step === 'done' && (
        <Card style={{ border: `2px solid ${T.success}`, background: T.successLight }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#065F46', marginBottom: 8 }}>
            Operation Applied Successfully
          </div>
          <div style={{ fontSize: 12, color: '#065F46' }}>{getPreviewSummary()}</div>
          <div style={{ marginTop: 12 }}>
            <Button variant="secondary" size="sm" onClick={resetAll}>Start New Operation</Button>
          </div>
        </Card>
      )}

      {/* Apply / Confirm Buttons */}
      {selectedOp && step !== 'done' && (
        <FlexRow justify="flex-end" gap={8}>
          <Button variant="secondary" onClick={resetAll}>Cancel</Button>
          <Button onClick={handleApply} disabled={!canProceed}>
            {step === 'configure' ? 'Preview' : 'Confirm & Apply'}
          </Button>
        </FlexRow>
      )}

      {/* History Table */}
      <div style={{ marginTop: 32 }}>
        <SectionTitle>Operation History</SectionTitle>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <Table headers={['Type', 'Stores Affected', 'Details', 'Status', 'Applied At', 'Applied By']}>
            {history.map(op => (
              <TrHover key={op.id}>
                <Td><Badge color={opTypeBadgeColor[op.type]}>{op.type.replace('_', ' ')}</Badge></Td>
                <Td>{op.targetStores.length} store(s)</Td>
                <Td style={{ fontSize: 11, maxWidth: 200 }}>
                  {op.type === 'slot_config' && `Template: ${(op.params as Record<string,string>).templateId}`}
                  {op.type === 'price_change' && `Base: EUR${(op.params as Record<string,number>).baseFee} / Floor: EUR${(op.params as Record<string,number>).floorPrice}`}
                  {op.type === 'closure' && `${(op.params as Record<string,string>).startDate} - ${(op.params as Record<string,string>).endDate}`}
                  {op.type === 'capacity_change' && `Capacity: ${(op.params as Record<string,number>).newCapacity} orders`}
                </Td>
                <Td><Badge color={statusColor[op.status] || 'gray'}>{op.status.replace('_', ' ')}</Badge></Td>
                <Td mono style={{ fontSize: 11 }}>{op.appliedAt ? new Date(op.appliedAt).toLocaleString() : '-'}</Td>
                <Td style={{ fontSize: 11 }}>{op.appliedBy || '-'}</Td>
              </TrHover>
            ))}
          </Table>
        </Card>
      </div>

      <Toast />
    </div>
  );
}
