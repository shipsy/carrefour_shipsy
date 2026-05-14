import { useState } from 'react';
import {
  Card, SectionTitle, Label, Badge, Toggle, Input, Select, Button,
  Table, Td, TrHover, Modal, StatCard, InfoBox, useToast, FlexRow, T,
  AddButton, BulkUploadModal,
} from '../shared';
import { zones as seedZones, stores } from '../data';
import type { Zone, ZoneType, BusinessLine } from '../types';

const BL_COLORS: Record<BusinessLine, 'blue' | 'green' | 'orange'> = {
  LAD: 'blue', Drive: 'green', FastDelivery: 'orange',
};

const TYPE_COLORS: Record<ZoneType, 'blue' | 'purple' | 'green'> = {
  postal_code: 'blue', radius: 'purple', polygon: 'green',
};

const ZONE_TYPE_OPTIONS = [
  { value: 'postal_code', label: 'Postal Code' },
  { value: 'radius', label: 'Radius' },
  { value: 'polygon', label: 'Polygon' },
];

const BL_LIST: BusinessLine[] = ['LAD', 'Drive', 'FastDelivery'];

const EMPTY_FORM = {
  name: '',
  type: 'postal_code' as ZoneType,
  postalCodes: '',
  radiusKm: '',
  storeIds: [] as string[],
  businessLines: [] as BusinessLine[],
};

export default function ZoneManagement() {
  const [zoneList, setZoneList] = useState<Zone[]>(seedZones);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const { show, Toast } = useToast();
  const [bulkOpen, setBulkOpen] = useState(false);

  // Form state shared by Add and Edit modals
  const [form, setForm] = useState({ ...EMPTY_FORM });

  // Mapping editor state
  const [mappingZoneId, setMappingZoneId] = useState('');
  const [mappingStoreId, setMappingStoreId] = useState('');
  const [mappingSearch, setMappingSearch] = useState('');
  const [bulkMappingOpen, setBulkMappingOpen] = useState(false);
  const [editMapping, setEditMapping] = useState<{zoneId: string, oldStoreId: string} | null>(null);
  const [editMappingStoreId, setEditMappingStoreId] = useState('');

  // ── Derived stats ──────────────────────────────────────────
  const activeZones = zoneList.filter(z => z.isActive).length;
  const allPostalCodes = new Set(zoneList.flatMap(z => z.postalCodes));

  // ── Helpers ────────────────────────────────────────────────
  const getStoreName = (storeId: string) => {
    const s = stores.find(st => st.id === storeId);
    return s ? s.name : storeId;
  };

  const resetForm = () => setForm({ ...EMPTY_FORM });

  const updateForm = (patch: Partial<typeof form>) => setForm(prev => ({ ...prev, ...patch }));

  const toggleFormStore = (storeId: string) => {
    setForm(prev => ({
      ...prev,
      storeIds: prev.storeIds.includes(storeId)
        ? prev.storeIds.filter(s => s !== storeId)
        : [...prev.storeIds, storeId],
    }));
  };

  const toggleFormBL = (bl: BusinessLine) => {
    setForm(prev => ({
      ...prev,
      businessLines: prev.businessLines.includes(bl)
        ? prev.businessLines.filter(b => b !== bl)
        : [...prev.businessLines, bl],
    }));
  };

  // ── Zone CRUD ──────────────────────────────────────────────
  const toggleZone = (id: string) => {
    setZoneList(prev => prev.map(z => z.id === id ? { ...z, isActive: !z.isActive } : z));
    show('Zone status updated');
  };

  const deleteZone = (id: string) => {
    setZoneList(prev => prev.filter(z => z.id !== id));
    show('Zone deleted');
  };

  const validateForm = (): boolean => {
    if (!form.name.trim() || !form.postalCodes.trim() || form.storeIds.length === 0 || form.businessLines.length === 0) {
      show('Please fill all required fields', 'error');
      return false;
    }
    if (form.type === 'radius' && (!form.radiusKm || Number(form.radiusKm) <= 0)) {
      show('Please enter a valid radius', 'error');
      return false;
    }
    return true;
  };

  const buildZoneFromForm = (id: string): Zone => ({
    id,
    name: form.name.trim(),
    type: form.type,
    postalCodes: form.postalCodes.split(',').map(p => p.trim()).filter(Boolean),
    storeIds: form.storeIds,
    businessLines: form.businessLines,
    isActive: true,
    ...(form.type === 'radius' && form.radiusKm ? { radiusKm: Number(form.radiusKm) } : {}),
  });

  const handleAddZone = () => {
    if (!validateForm()) return;
    const zone = buildZoneFromForm(`z${Date.now()}`);
    setZoneList(prev => [...prev, zone]);
    setAddModalOpen(false);
    resetForm();
    show('Zone created successfully');
  };

  const openEditModal = (zone: Zone) => {
    setEditingZoneId(zone.id);
    setForm({
      name: zone.name,
      type: zone.type,
      postalCodes: zone.postalCodes.join(', '),
      radiusKm: zone.radiusKm ? String(zone.radiusKm) : '',
      storeIds: [...zone.storeIds],
      businessLines: [...zone.businessLines],
    });
    setEditModalOpen(true);
  };

  const handleEditZone = () => {
    if (!validateForm() || !editingZoneId) return;
    setZoneList(prev =>
      prev.map(z => {
        if (z.id !== editingZoneId) return z;
        return { ...buildZoneFromForm(z.id), isActive: z.isActive };
      }),
    );
    setEditModalOpen(false);
    setEditingZoneId(null);
    resetForm();
    show('Zone updated successfully');
  };

  // ── Zone-Store Mapping helpers ─────────────────────────────
  const toggleMapping = (zoneId: string, storeId: string) => {
    setZoneList(prev =>
      prev.map(z => {
        if (z.id !== zoneId) return z;
        const has = z.storeIds.includes(storeId);
        if (has && z.storeIds.length <= 1) {
          show('Each zone must have at least one assigned store', 'error');
          return z;
        }
        return {
          ...z,
          storeIds: has
            ? z.storeIds.filter(s => s !== storeId)
            : [...z.storeIds, storeId],
        };
      }),
    );
  };

  const addMapping = () => {
    if (!mappingZoneId || !mappingStoreId) {
      show('Select both a zone and a store', 'error');
      return;
    }
    const zone = zoneList.find(z => z.id === mappingZoneId);
    if (zone && zone.storeIds.includes(mappingStoreId)) {
      show('This mapping already exists', 'error');
      return;
    }
    setZoneList(prev =>
      prev.map(z =>
        z.id === mappingZoneId
          ? { ...z, storeIds: [...z.storeIds, mappingStoreId] }
          : z,
      ),
    );
    setMappingZoneId('');
    setMappingStoreId('');
    show('Mapping added');
  };

  // ── Modal form renderer (shared between Add and Edit) ──────
  const renderForm = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <Label>Zone Name</Label>
        <Input value={form.name} onChange={v => updateForm({ name: v })} placeholder="e.g. Anderlecht-Molenbeek" />
      </div>

      <div>
        <Label>Zone Type</Label>
        <Select
          value={form.type}
          onChange={v => updateForm({ type: v as ZoneType })}
          options={ZONE_TYPE_OPTIONS}
          style={{ width: '100%' }}
        />
      </div>

      <div>
        <Label>Postal Codes (comma-separated)</Label>
        <Input value={form.postalCodes} onChange={v => updateForm({ postalCodes: v })} placeholder="1070, 1080, 1081" />
      </div>

      {form.type === 'radius' && (
        <div>
          <Label>Radius (km)</Label>
          <Input
            value={form.radiusKm}
            onChange={v => updateForm({ radiusKm: v })}
            type="number"
            placeholder="e.g. 15"
          />
        </div>
      )}

      <div>
        <Label>Assigned Stores</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {stores.map(s => {
            const selected = form.storeIds.includes(s.id);
            return (
              <label
                key={s.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer',
                  padding: '5px 12px', borderRadius: 4, fontWeight: 600, fontFamily: T.font,
                  border: `1px solid ${selected ? T.primary : T.border}`,
                  background: selected ? T.primaryLight : T.card,
                  color: selected ? T.primary : T.textSecondary,
                  transition: 'all 0.15s',
                }}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleFormStore(s.id)}
                  style={{ accentColor: T.primary }}
                />
                {s.name}
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <Label>Business Lines</Label>
        <div style={{ display: 'flex', gap: 12 }}>
          {BL_LIST.map(bl => (
            <label key={bl} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.businessLines.includes(bl)}
                onChange={() => toggleFormBL(bl)}
                style={{ accentColor: T.primary }}
              />
              {bl}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <Toast />

      {/* ── Stats Row ─────────────────────────────────────────── */}
      <FlexRow gap={16}>
        <StatCard label="Total Zones" value={zoneList.length} sub="All configured zones" />
        <StatCard label="Active Zones" value={activeZones} color={T.success} sub="Currently serving" />
        <StatCard label="Postal Codes Covered" value={allPostalCodes.size} color="#7C3AED" sub="Unique postal codes" />
      </FlexRow>

      <div style={{ height: 20 }} />

      {/* ── Zone List Table ───────────────────────────────────── */}
      <Card>
        <SectionTitle actions={<AddButton label="+ Add Zone" onSingle={() => { resetForm(); setAddModalOpen(true); }} onBulk={() => setBulkOpen(true)} />}>
          Zone List
        </SectionTitle>
        <div style={{ overflowX: 'auto' }}>
          <Table headers={['Zone Name', 'Type', 'Postal Codes', 'Assigned Stores', 'Business Lines', 'Status', 'Actions']}>
            {zoneList.map(zone => (
              <TrHover key={zone.id}>
                <Td style={{ fontWeight: 600 }}>{zone.name}</Td>
                <Td><Badge color={TYPE_COLORS[zone.type]}>{zone.type}</Badge></Td>
                <Td>
                  <span style={{ fontSize: 12, fontFamily: T.mono, color: T.textSecondary }}>
                    {zone.postalCodes.join(', ')}
                  </span>
                </Td>
                <Td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {zone.storeIds.map(sId => (
                      <span key={sId} style={{ fontSize: 12, color: T.text }}>{getStoreName(sId)}</span>
                    ))}
                  </div>
                </Td>
                <Td>
                  <FlexRow gap={4}>
                    {zone.businessLines.map(bl => (
                      <Badge key={bl} color={BL_COLORS[bl]}>{bl}</Badge>
                    ))}
                  </FlexRow>
                </Td>
                <Td>
                  <FlexRow gap={8}>
                    <Toggle checked={zone.isActive} onChange={() => toggleZone(zone.id)} />
                    <span style={{ fontSize: 12, color: zone.isActive ? T.success : T.textMuted }}>
                      {zone.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </FlexRow>
                </Td>
                <Td>
                  <FlexRow gap={6}>
                    <Button size="sm" variant="secondary" onClick={() => openEditModal(zone)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => deleteZone(zone.id)}>Delete</Button>
                  </FlexRow>
                </Td>
              </TrHover>
            ))}
          </Table>
        </div>
      </Card>

      {/* ── Zone-Store Mapping Editor ─────────────────────────── */}
      <Card>
        <SectionTitle actions={<AddButton label="+ Add Mapping" onSingle={() => {}} onBulk={() => setBulkMappingOpen(true)} />}>
          Zone-Store Mapping
        </SectionTitle>
        <InfoBox>
          Each row represents one zone-store mapping. A zone can be mapped to multiple stores. Each zone must retain at least one store.
        </InfoBox>

        {/* Search bar */}
        <div style={{ marginBottom: 12 }}>
          <Input
            value={mappingSearch}
            onChange={setMappingSearch}
            placeholder="Search by zone name or store name..."
          />
        </div>

        {/* Mapping table */}
        {(() => {
          const allMappings = zoneList.flatMap(z =>
            z.storeIds.map(sId => ({ zoneId: z.id, zoneName: z.name, storeId: sId, storeName: getStoreName(sId) }))
          );
          const searchLower = mappingSearch.toLowerCase();
          const filteredMappings = searchLower
            ? allMappings.filter(m => m.zoneName.toLowerCase().includes(searchLower) || m.storeName.toLowerCase().includes(searchLower))
            : allMappings;
          const uniqueZones = new Set(filteredMappings.map(m => m.zoneId));
          const uniqueStores = new Set(filteredMappings.map(m => m.storeId));

          return (
            <>
              <div style={{ overflowX: 'auto' }}>
                <Table headers={['Zone', 'Store', 'Actions']}>
                  {filteredMappings.map(m => (
                    <TrHover key={`${m.zoneId}-${m.storeId}`}>
                      <Td style={{ fontWeight: 600 }}>{m.zoneName}</Td>
                      <Td>{m.storeName}</Td>
                      <Td>
                        <FlexRow gap={6}>
                          <Button size="sm" variant="secondary" onClick={() => { setEditMapping({ zoneId: m.zoneId, oldStoreId: m.storeId }); setEditMappingStoreId(m.storeId); }}>Edit</Button>
                          <Button size="sm" variant="danger" onClick={() => toggleMapping(m.zoneId, m.storeId)}>Remove</Button>
                        </FlexRow>
                      </Td>
                    </TrHover>
                  ))}

                  {/* Add Mapping inline row */}
                  <tr style={{ background: T.headerBg }}>
                    <Td>
                      <Select
                        value={mappingZoneId}
                        onChange={setMappingZoneId}
                        options={[
                          { value: '', label: 'Select zone...' },
                          ...zoneList.map(z => ({ value: z.id, label: z.name })),
                        ]}
                        style={{ minWidth: 180 }}
                      />
                    </Td>
                    <Td>
                      <Select
                        value={mappingStoreId}
                        onChange={setMappingStoreId}
                        options={[
                          { value: '', label: 'Select store...' },
                          ...stores.map(s => ({ value: s.id, label: s.name })),
                        ]}
                        style={{ minWidth: 180 }}
                      />
                    </Td>
                    <Td>
                      <Button size="sm" onClick={addMapping}>Add</Button>
                    </Td>
                  </tr>
                </Table>
              </div>

              {/* Summary line */}
              <div style={{ marginTop: 12, fontSize: 12, color: T.textSecondary, fontWeight: 500 }}>
                {filteredMappings.length} total mapping{filteredMappings.length !== 1 ? 's' : ''} across {uniqueZones.size} zone{uniqueZones.size !== 1 ? 's' : ''} and {uniqueStores.size} store{uniqueStores.size !== 1 ? 's' : ''}
              </div>
            </>
          );
        })()}
      </Card>

      {/* ── Edit Mapping Modal ────────────────────────────────── */}
      <Modal
        open={!!editMapping}
        onClose={() => { setEditMapping(null); setEditMappingStoreId(''); }}
        title="Edit Mapping"
        width={420}
      >
        {editMapping && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, display: 'block', marginBottom: 4 }}>Zone</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>
                {zoneList.find(z => z.id === editMapping.zoneId)?.name ?? editMapping.zoneId}
              </span>
            </div>
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, display: 'block', marginBottom: 4 }}>Store</span>
              <Select
                value={editMappingStoreId}
                onChange={setEditMappingStoreId}
                options={stores.map(s => ({ value: s.id, label: s.name }))}
                style={{ width: '100%' }}
              />
            </div>
            <FlexRow gap={8} justify="flex-end">
              <Button variant="secondary" onClick={() => { setEditMapping(null); setEditMappingStoreId(''); }}>Cancel</Button>
              <Button onClick={() => {
                if (!editMappingStoreId) { show('Select a store', 'error'); return; }
                if (editMappingStoreId === editMapping.oldStoreId) { setEditMapping(null); return; }
                const zone = zoneList.find(z => z.id === editMapping.zoneId);
                if (zone && zone.storeIds.includes(editMappingStoreId)) {
                  show('This mapping already exists', 'error');
                  return;
                }
                setZoneList(prev => prev.map(z => {
                  if (z.id !== editMapping.zoneId) return z;
                  return { ...z, storeIds: z.storeIds.map(s => s === editMapping.oldStoreId ? editMappingStoreId : s) };
                }));
                show('Mapping updated');
                setEditMapping(null);
                setEditMappingStoreId('');
              }}>Save</Button>
            </FlexRow>
          </div>
        )}
      </Modal>

      {/* ── Add Zone Modal ────────────────────────────────────── */}
      <Modal open={addModalOpen} onClose={() => { setAddModalOpen(false); resetForm(); }} title="Add New Zone" width={520}>
        {renderForm()}
        <div style={{ height: 16 }} />
        <FlexRow gap={8} justify="flex-end">
          <Button variant="secondary" onClick={() => { setAddModalOpen(false); resetForm(); }}>Cancel</Button>
          <Button onClick={handleAddZone}>Create Zone</Button>
        </FlexRow>
      </Modal>

      {/* ── Edit Zone Modal ───────────────────────────────────── */}
      <Modal open={editModalOpen} onClose={() => { setEditModalOpen(false); setEditingZoneId(null); resetForm(); }} title="Edit Zone" width={520}>
        {renderForm()}
        <div style={{ height: 16 }} />
        <FlexRow gap={8} justify="flex-end">
          <Button variant="secondary" onClick={() => { setEditModalOpen(false); setEditingZoneId(null); resetForm(); }}>Cancel</Button>
          <Button onClick={handleEditZone}>Save Changes</Button>
        </FlexRow>
      </Modal>

      <BulkUploadModal open={bulkOpen} onClose={() => setBulkOpen(false)} entityName="Zones" sampleColumns={['name', 'type', 'postal_codes', 'store_ids', 'business_lines']} onUpload={(file) => { show(file.name + ' uploaded — 12 records will be imported'); setBulkOpen(false); }} />
      <BulkUploadModal open={bulkMappingOpen} onClose={() => setBulkMappingOpen(false)} entityName="Zone-Store Mappings" sampleColumns={['zone_id', 'zone_name', 'store_id', 'store_name']} onUpload={(file) => { show(file.name + ' uploaded — mappings will be imported'); setBulkMappingOpen(false); }} />
    </div>
  );
}
