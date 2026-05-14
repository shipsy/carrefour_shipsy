/* ============================================================
   Slot Templates — Admin Page
   Manage slot template configurations for Carrefour Belgium
   ============================================================ */

import { useState } from 'react';
import {
  Card, SectionTitle, Label, Badge, Toggle, Input, Select, Button,
  Table, Td, TrHover, Modal, InfoBox, useToast, Grid2, FlexRow, T,
} from '../shared';
import { slotTemplates as seedTemplates, stores } from '../data';
import type { SlotTemplateConfig, SlotTemplate, TemplateFrequency, BusinessLine } from '../types';

const freqColor: Record<TemplateFrequency, 'blue' | 'green' | 'purple'> = {
  daily: 'blue', weekly: 'green', monthly: 'purple',
};

const blColor: Record<BusinessLine, 'blue' | 'green' | 'orange'> = {
  LAD: 'blue', Drive: 'green', FastDelivery: 'orange',
};

const holidayLabels: Record<string, string> = {
  skip: 'Skip slots', reduce_50: 'Reduce 50%', custom: 'Custom rules',
};

const emptySlot = (): SlotTemplate => ({
  id: `ns-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  day: 'Monday', startTime: '08:00', endTime: '10:00', timeOfDay: 'morning',
  label: 'Standard', businessLines: ['LAD'], isActive: true,
});

export default function SlotTemplates() {
  const [templates, setTemplates] = useState<SlotTemplateConfig[]>(seedTemplates);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const { show, Toast } = useToast();

  // -- create form state --
  const [newName, setNewName] = useState('');
  const [newFreq, setNewFreq] = useState<TemplateFrequency>('daily');
  const [newBL, setNewBL] = useState<BusinessLine>('LAD');
  const [newStoreMode, setNewStoreMode] = useState<'all' | 'select'>('all');
  const [newStoreIds, setNewStoreIds] = useState<string[]>([]);
  const [newHoliday, setNewHoliday] = useState<'skip' | 'reduce_50' | 'custom'>('skip');
  const [newSlots, setNewSlots] = useState<SlotTemplate[]>([emptySlot()]);

  const resetForm = () => {
    setNewName(''); setNewFreq('daily'); setNewBL('LAD');
    setNewStoreMode('all'); setNewStoreIds([]); setNewHoliday('skip');
    setNewSlots([emptySlot()]);
  };

  const toggleActive = (id: string) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t));
    show('Template status updated');
  };

  const cloneTemplate = (tpl: SlotTemplateConfig) => {
    const cloned: SlotTemplateConfig = {
      ...tpl,
      id: `tpl-clone-${Date.now()}`,
      name: `${tpl.name} (Copy)`,
      isActive: false,
      activeSince: new Date().toISOString().split('T')[0],
      slots: tpl.slots.map(s => ({ ...s, id: `cs-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` })),
    };
    setTemplates(prev => [...prev, cloned]);
    show('Template cloned');
  };

  const storeCount = (tpl: SlotTemplateConfig) =>
    tpl.storeIds === 'all' ? stores.length : tpl.storeIds.length;

  const handleCreate = () => {
    if (!newName.trim()) return;
    const created: SlotTemplateConfig = {
      id: `tpl-new-${Date.now()}`,
      name: newName.trim(),
      frequency: newFreq,
      businessLine: newBL,
      storeIds: newStoreMode === 'all' ? 'all' : newStoreIds,
      slots: newSlots,
      holidayBehavior: newHoliday,
      isActive: true,
      activeSince: new Date().toISOString().split('T')[0],
    };
    setTemplates(prev => [...prev, created]);
    setShowCreate(false);
    resetForm();
    show('Template created');
  };

  const toggleStoreSelection = (storeId: string) => {
    setNewStoreIds(prev =>
      prev.includes(storeId) ? prev.filter(s => s !== storeId) : [...prev, storeId]
    );
  };

  const updateNewSlot = (idx: number, field: keyof SlotTemplate, value: string) => {
    setNewSlots(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const removeNewSlot = (idx: number) => {
    setNewSlots(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <InfoBox>
        Templates auto-generate slots for the configured frequency. Holiday behavior determines what happens on bank holidays defined in the Holiday Calendar.
      </InfoBox>

      <SectionTitle actions={<Button onClick={() => { resetForm(); setShowCreate(true); }}>+ Create Template</Button>}>
        Slot Templates
      </SectionTitle>

      {/* Template Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16, marginBottom: 24 }}>
        {templates.map(tpl => (
          <Card key={tpl.id} style={{ cursor: 'pointer', border: expandedId === tpl.id ? `2px solid ${T.primary}` : `1px solid ${T.border}`, transition: 'border 0.15s' }}>
            <div onClick={() => setExpandedId(expandedId === tpl.id ? null : tpl.id)}>
              <FlexRow justify="space-between">
                <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{tpl.name}</span>
                <Toggle checked={tpl.isActive} onChange={() => toggleActive(tpl.id)} />
              </FlexRow>

              <FlexRow gap={6} align="center">
                <Badge color={freqColor[tpl.frequency]}>{tpl.frequency}</Badge>
                <Badge color={blColor[tpl.businessLine]}>{tpl.businessLine}</Badge>
              </FlexRow>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12, fontSize: 12, color: T.textSecondary }}>
                <div><strong>{storeCount(tpl)}</strong> stores</div>
                <div><strong>{tpl.slots.length}</strong> slots</div>
                <div>Holiday: <strong>{holidayLabels[tpl.holidayBehavior]}</strong></div>
                <div>Since: <strong>{tpl.activeSince}</strong></div>
              </div>
            </div>

            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <Button variant="secondary" size="sm" onClick={() => cloneTemplate(tpl)}>Clone</Button>
              <Button variant="ghost" size="sm" onClick={() => setExpandedId(expandedId === tpl.id ? null : tpl.id)}>
                {expandedId === tpl.id ? 'Collapse' : 'View Slots'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Expanded Detail View */}
      {expandedId && (() => {
        const tpl = templates.find(t => t.id === expandedId);
        if (!tpl) return null;
        return (
          <Card>
            <SectionTitle>Slot List — {tpl.name}</SectionTitle>
            <Table headers={['Start', 'End', 'Time of Day', 'Label', 'Status']}>
              {tpl.slots.map(slot => (
                <TrHover key={slot.id}>
                  <Td mono>{slot.startTime}</Td>
                  <Td mono>{slot.endTime}</Td>
                  <Td>
                    <Badge color={slot.timeOfDay === 'morning' ? 'blue' : slot.timeOfDay === 'afternoon' ? 'orange' : 'purple'}>
                      {slot.timeOfDay}
                    </Badge>
                  </Td>
                  <Td>{slot.label}</Td>
                  <Td>
                    <Badge color={slot.isActive ? 'green' : 'gray'}>{slot.isActive ? 'Active' : 'Inactive'}</Badge>
                  </Td>
                </TrHover>
              ))}
            </Table>
            <div style={{ marginTop: 12, fontSize: 12, color: T.textSecondary }}>
              Applied to: {tpl.storeIds === 'all'
                ? 'All stores'
                : tpl.storeIds.map(sid => stores.find(s => s.id === sid)?.name || sid).join(', ')}
            </div>
          </Card>
        );
      })()}

      {/* Create Template Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Slot Template" width={680}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <Label>Template Name</Label>
            <Input value={newName} onChange={setNewName} placeholder="e.g. LAD Weekend Extended" />
          </div>

          <Grid2>
            <div>
              <Label>Frequency</Label>
              <Select value={newFreq} onChange={v => setNewFreq(v as TemplateFrequency)}
                options={[
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' },
                ]} />
            </div>
            <div>
              <Label>Business Line</Label>
              <Select value={newBL} onChange={v => setNewBL(v as BusinessLine)}
                options={[
                  { value: 'LAD', label: 'LAD' },
                  { value: 'Drive', label: 'Drive' },
                  { value: 'FastDelivery', label: 'Fast Delivery' },
                ]} />
            </div>
          </Grid2>

          <div>
            <Label>Stores</Label>
            <FlexRow gap={8}>
              <Button variant={newStoreMode === 'all' ? 'primary' : 'secondary'} size="sm"
                onClick={() => setNewStoreMode('all')}>All Stores</Button>
              <Button variant={newStoreMode === 'select' ? 'primary' : 'secondary'} size="sm"
                onClick={() => setNewStoreMode('select')}>Select Stores</Button>
            </FlexRow>
            {newStoreMode === 'select' && (
              <div style={{ marginTop: 8, maxHeight: 140, overflowY: 'auto', border: `1px solid ${T.border}`, borderRadius: 4, padding: 8 }}>
                {stores.map(st => (
                  <label key={st.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 12, cursor: 'pointer' }}>
                    <input type="checkbox" checked={newStoreIds.includes(st.id)}
                      onChange={() => toggleStoreSelection(st.id)} />
                    {st.name} <Badge color="gray">{st.type}</Badge>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label>Holiday Behavior</Label>
            <Select value={newHoliday} onChange={v => setNewHoliday(v as 'skip' | 'reduce_50' | 'custom')}
              options={[
                { value: 'skip', label: 'Skip slots on holidays' },
                { value: 'reduce_50', label: 'Reduce capacity by 50%' },
                { value: 'custom', label: 'Custom rules' },
              ]} />
          </div>

          {/* Slot List Editor */}
          <div>
            <FlexRow justify="space-between">
              <Label>Slot List</Label>
              <Button variant="ghost" size="sm" onClick={() => setNewSlots(prev => [...prev, emptySlot()])}>
                + Add Slot
              </Button>
            </FlexRow>
            <div style={{ border: `1px solid ${T.border}`, borderRadius: 4, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: T.headerBg }}>
                    <th style={{ padding: '8px 10px', fontSize: 11, fontWeight: 600, textAlign: 'left', color: T.textSecondary }}>Start</th>
                    <th style={{ padding: '8px 10px', fontSize: 11, fontWeight: 600, textAlign: 'left', color: T.textSecondary }}>End</th>
                    <th style={{ padding: '8px 10px', fontSize: 11, fontWeight: 600, textAlign: 'left', color: T.textSecondary }}>ToD</th>
                    <th style={{ padding: '8px 10px', fontSize: 11, fontWeight: 600, textAlign: 'left', color: T.textSecondary }}>Label</th>
                    <th style={{ padding: '8px 10px', fontSize: 11, fontWeight: 600, textAlign: 'left', color: T.textSecondary }}></th>
                  </tr>
                </thead>
                <tbody>
                  {newSlots.map((slot, idx) => (
                    <tr key={slot.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                      <td style={{ padding: '6px 8px' }}>
                        <Input value={slot.startTime} onChange={v => updateNewSlot(idx, 'startTime', v)}
                          type="time" style={{ width: 100 }} />
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <Input value={slot.endTime} onChange={v => updateNewSlot(idx, 'endTime', v)}
                          type="time" style={{ width: 100 }} />
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <Select value={slot.timeOfDay}
                          onChange={v => updateNewSlot(idx, 'timeOfDay', v)}
                          options={[
                            { value: 'morning', label: 'Morning' },
                            { value: 'afternoon', label: 'Afternoon' },
                            { value: 'evening', label: 'Evening' },
                          ]} style={{ width: 110 }} />
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <Input value={slot.label} onChange={v => updateNewSlot(idx, 'label', v)}
                          placeholder="Label" style={{ width: 100 }} />
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <Button variant="danger" size="sm" onClick={() => removeNewSlot(idx)}
                          disabled={newSlots.length <= 1}>X</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <FlexRow justify="flex-end" gap={8}>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newName.trim()}>Create Template</Button>
          </FlexRow>
        </div>
      </Modal>

      <Toast />
    </div>
  );
}
