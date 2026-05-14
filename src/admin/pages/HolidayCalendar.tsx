/* ============================================================
   Holiday Calendar — Admin Page
   Belgian bank holidays and custom closures management
   ============================================================ */

import { useState, useEffect } from 'react';
import {
  Card, SectionTitle, Label, Badge, Input, Select, Slider, Button,
  Table, Td, TrHover, Modal, InfoBox, useToast, FlexRow, T,
  AddButton, BulkUploadModal,
} from '../shared';
import type { Holiday } from '../types';
import { holidays as seedHolidays } from '../data';
import { saveHolidayClosures } from '../../engine/config-store';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const actionColorMap: Record<Holiday['action'], 'red' | 'orange' | 'blue'> = {
  close_all_slots: 'red',
  reduce_capacity: 'orange',
  custom_hours: 'blue',
};

const actionLabelMap: Record<Holiday['action'], string> = {
  close_all_slots: 'Close All Slots',
  reduce_capacity: 'Reduce Capacity',
  custom_hours: 'Custom Hours',
};

const actionOptions = [
  { value: 'close_all_slots', label: 'Close All Slots' },
  { value: 'reduce_capacity', label: 'Reduce Capacity' },
  { value: 'custom_hours', label: 'Custom Hours' },
];

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}

function getMonth(iso: string) {
  return parseInt(iso.split('-')[1], 10) - 1;
}

export default function HolidayCalendar() {
  const [holidayList, setHolidayList] = useState<Holiday[]>(JSON.parse(JSON.stringify(seedHolidays)));
  const [year, setYear] = useState(2026);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form state
  const [fName, setFName] = useState('');
  const [fDate, setFDate] = useState('');
  const [fNational, setFNational] = useState(true);
  const [fAffectedAll, setFAffectedAll] = useState(true);
  const [fAffectedStores, setFAffectedStores] = useState('');
  const [fAction, setFAction] = useState<Holiday['action']>('close_all_slots');
  const [fCapacity, setFCapacity] = useState(50);
  const [fOpenHour, setFOpenHour] = useState('08:00');
  const [fCloseHour, setFCloseHour] = useState('14:00');

  const { show, Toast } = useToast();
  const [bulkOpen, setBulkOpen] = useState(false);

  // Persist holiday closures to localStorage whenever holidayList changes
  useEffect(() => {
    const closedDates = holidayList
      .filter(h => h.action === 'close_all_slots')
      .map(h => h.date);
    saveHolidayClosures(closedDates);
  }, [holidayList]);

  const resetForm = () => {
    setFName(''); setFDate(''); setFNational(true); setFAffectedAll(true);
    setFAffectedStores(''); setFAction('close_all_slots'); setFCapacity(50);
    setFOpenHour('08:00'); setFCloseHour('14:00'); setEditId(null);
  };

  const openAdd = () => { resetForm(); setModalOpen(true); };

  const openEdit = (h: Holiday) => {
    setEditId(h.id);
    setFName(h.name);
    setFDate(h.date);
    setFNational(h.isNational);
    setFAffectedAll(h.affectedStoreIds === 'all');
    setFAffectedStores(h.affectedStoreIds === 'all' ? '' : (h.affectedStoreIds as string[]).join(', '));
    setFAction(h.action);
    setFCapacity(h.capacityPct ?? 50);
    setFOpenHour(h.customHours?.open ?? '08:00');
    setFCloseHour(h.customHours?.close ?? '14:00');
    setModalOpen(true);
  };

  const saveHoliday = () => {
    if (!fName.trim() || !fDate) { show('Name and date are required', 'error'); return; }

    const holiday: Holiday = {
      id: editId ?? `h-${Date.now()}`,
      name: fName.trim(),
      date: fDate,
      isNational: fNational,
      affectedStoreIds: fAffectedAll ? 'all' : fAffectedStores.split(',').map(s => s.trim()).filter(Boolean),
      action: fAction,
      ...(fAction === 'reduce_capacity' ? { capacityPct: fCapacity } : {}),
      ...(fAction === 'custom_hours' ? { customHours: { open: fOpenHour, close: fCloseHour } } : {}),
    };

    if (editId) {
      setHolidayList(prev => prev.map(h => h.id === editId ? holiday : h));
      show('Holiday updated');
    } else {
      setHolidayList(prev => [...prev, holiday]);
      show('Holiday added');
    }
    setModalOpen(false);
    resetForm();
  };

  const deleteHoliday = (id: string) => {
    setHolidayList(prev => prev.filter(h => h.id !== id));
    show('Holiday deleted');
  };

  // Monthly view: which months have holidays
  const monthHolidays = monthNames.map((_, i) =>
    holidayList.filter(h => h.date.startsWith(`${year}-`) && getMonth(h.date) === i)
  );

  // Sort by date
  const sorted = [...holidayList]
    .filter(h => h.date.startsWith(`${year}-`))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <Toast />

      {/* ── Info ──────────────────────────────────────────────── */}
      <InfoBox type="info">
        Bank holidays automatically close or reduce slots. Templates with &lsquo;skip&rsquo; holiday behavior will not generate slots on these dates.
      </InfoBox>

      {/* ── Calendar Year Selector ────────────────────────────── */}
      <Card>
        <FlexRow justify="space-between">
          <SectionTitle>Holiday Calendar</SectionTitle>
          <FlexRow gap={8}>
            <Button variant="ghost" size="sm" onClick={() => setYear(y => y - 1)}>&larr; {year - 1}</Button>
            <span style={{ fontSize: 20, fontWeight: 800, fontFamily: T.mono, color: T.text, minWidth: 60, textAlign: 'center' }}>{year}</span>
            <Button variant="ghost" size="sm" onClick={() => setYear(y => y + 1)}>{year + 1} &rarr;</Button>
          </FlexRow>
          <AddButton label="+ Add Holiday" onSingle={openAdd} onBulk={() => setBulkOpen(true)} />
        </FlexRow>
      </Card>

      {/* ── Monthly View ──────────────────────────────────────── */}
      <Card>
        <SectionTitle>Monthly Overview</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
          {monthNames.map((name, i) => {
            const count = monthHolidays[i].length;
            return (
              <div key={name} style={{
                border: `1px solid ${count > 0 ? T.primary : T.border}`,
                borderRadius: 6,
                padding: '12px 10px',
                textAlign: 'center',
                background: count > 0 ? T.primaryLight : T.card,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: count > 0 ? T.primary : T.textSecondary, marginBottom: 6 }}>
                  {monthFull[i]}
                </div>
                {count > 0 ? (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
                    {monthHolidays[i].map(h => (
                      <span key={h.id} title={h.name} style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: h.action === 'close_all_slots' ? T.danger : h.action === 'reduce_capacity' ? T.warning : T.primary,
                      }} />
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: T.textMuted }}>No holidays</div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Holiday List Table ────────────────────────────────── */}
      <Card>
        <SectionTitle>
          All Holidays ({sorted.length})
        </SectionTitle>
        <Table headers={['Date', 'Name', 'National', 'Affected Stores', 'Action', 'Capacity %', 'Custom Hours', 'Actions']}>
          {sorted.map(h => (
            <TrHover key={h.id}>
              <Td mono style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(h.date)}</Td>
              <Td style={{ fontWeight: 600 }}>{h.name}</Td>
              <Td>{h.isNational ? <Badge color="green">Yes</Badge> : <Badge color="gray">No</Badge>}</Td>
              <Td>{h.affectedStoreIds === 'all' ? <Badge color="blue">All</Badge> : <Badge color="gray">{(h.affectedStoreIds as string[]).length} stores</Badge>}</Td>
              <Td><Badge color={actionColorMap[h.action]}>{actionLabelMap[h.action]}</Badge></Td>
              <Td mono>{h.action === 'reduce_capacity' ? `${h.capacityPct}%` : '\u2014'}</Td>
              <Td mono style={{ fontSize: 12 }}>{h.action === 'custom_hours' && h.customHours ? `${h.customHours.open} - ${h.customHours.close}` : '\u2014'}</Td>
              <Td>
                <FlexRow gap={6}>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(h)}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => deleteHoliday(h.id)}>Delete</Button>
                </FlexRow>
              </Td>
            </TrHover>
          ))}
        </Table>
      </Card>

      {/* ── Add / Edit Holiday Modal ──────────────────────────── */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); resetForm(); }} title={editId ? 'Edit Holiday' : 'Add Holiday'} width={520}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <Label>Name</Label>
            <Input value={fName} onChange={setFName} placeholder="e.g. Belgian National Day" />
          </div>

          <div>
            <Label>Date</Label>
            <Input type="date" value={fDate} onChange={setFDate} />
          </div>

          <div>
            <Label>National Holiday</Label>
            <FlexRow gap={12}>
              <label style={{ fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="checkbox" checked={fNational} onChange={e => setFNational(e.target.checked)} />
                This is a national bank holiday
              </label>
            </FlexRow>
          </div>

          <div>
            <Label>Affected Stores</Label>
            <FlexRow gap={12}>
              <label style={{ fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="checkbox" checked={fAffectedAll} onChange={e => setFAffectedAll(e.target.checked)} />
                All stores
              </label>
            </FlexRow>
            {!fAffectedAll && (
              <div style={{ marginTop: 8 }}>
                <Input
                  value={fAffectedStores}
                  onChange={setFAffectedStores}
                  placeholder="Comma-separated store IDs: hub-north, s2, s5"
                />
              </div>
            )}
          </div>

          <div>
            <Label>Action</Label>
            <Select value={fAction} onChange={v => setFAction(v as Holiday['action'])} options={actionOptions} />
          </div>

          {fAction === 'reduce_capacity' && (
            <div>
              <Label>Capacity % ({fCapacity}%)</Label>
              <Slider value={fCapacity} min={10} max={100} step={5} onChange={setFCapacity} color={T.warning} />
            </div>
          )}

          {fAction === 'custom_hours' && (
            <FlexRow gap={12}>
              <div style={{ flex: 1 }}>
                <Label>Open</Label>
                <Input type="time" value={fOpenHour} onChange={setFOpenHour} />
              </div>
              <div style={{ flex: 1 }}>
                <Label>Close</Label>
                <Input type="time" value={fCloseHour} onChange={setFCloseHour} />
              </div>
            </FlexRow>
          )}

          <FlexRow justify="flex-end" gap={10}>
            <Button variant="secondary" onClick={() => { setModalOpen(false); resetForm(); }}>Cancel</Button>
            <Button onClick={saveHoliday}>{editId ? 'Update Holiday' : 'Add Holiday'}</Button>
          </FlexRow>
        </div>
      </Modal>

      <BulkUploadModal open={bulkOpen} onClose={() => setBulkOpen(false)} entityName="Holidays" sampleColumns={['name', 'date', 'is_national', 'affected_stores', 'action', 'capacity_pct']} onUpload={(file) => { show(file.name + ' uploaded — 18 records will be imported'); setBulkOpen(false); }} />
    </div>
  );
}
