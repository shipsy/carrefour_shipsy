import { useState } from 'react';
import {
  Card, SectionTitle, Label, Badge, Toggle, Input, Select, Button,
  Table, Td, FilterBar, FilterChip, Modal, StatCard,
  useToast, FlexRow, T, AddButton, BulkUploadModal,
} from '../shared';
import { stores as seedStores, zones } from '../data';
import type { AdminStore, StoreType, BusinessLine } from '../types';

const STORE_TYPE_COLORS: Record<StoreType, 'purple' | 'blue' | 'green' | 'orange'> = {
  LAD_Hub: 'purple', Hypermarket: 'blue', Market: 'green', Express: 'orange',
};

const BL_COLORS: Record<BusinessLine, 'blue' | 'green' | 'orange'> = {
  LAD: 'blue', Drive: 'green', FastDelivery: 'orange',
};

const STORE_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'LAD_Hub', label: 'LAD Hub' },
  { value: 'Hypermarket', label: 'Hypermarket' },
  { value: 'Market', label: 'Market' },
  { value: 'Express', label: 'Express' },
];

const BL_LIST: BusinessLine[] = ['LAD', 'Drive', 'FastDelivery'];
const FILTER_TYPES = ['All', 'LAD_Hub', 'Hypermarket', 'Market', 'Express'] as const;

const emptyForm = {
  name: '',
  type: 'Market' as StoreType,
  address: '',
  city: '',
  postalCode: '',
  lat: '',
  lng: '',
  businessLines: [] as BusinessLine[],
  maxDailyOrders: '100',
  open: '08:00',
  close: '20:00',
  zoneIds: [] as string[],
};

export default function StoreManagement() {
  const [storeList, setStoreList] = useState<AdminStore[]>(seedStores);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const { show, Toast } = useToast();
  const [bulkOpen, setBulkOpen] = useState(false);

  // --- Derived data ---
  const ladHubs = storeList.filter(s => s.type === 'LAD_Hub').length;
  const activeCount = storeList.filter(s => s.isActive).length;
  const totalMaxOrders = storeList.reduce((sum, s) => sum + s.maxDailyOrders, 0);

  // --- Filtering (search AND type, simultaneously) ---
  const query = searchQuery.trim().toLowerCase();
  const filtered = storeList.filter(s => {
    const matchesType = typeFilter === 'All' || s.type === typeFilter;
    const matchesSearch = !query
      || s.name.toLowerCase().includes(query)
      || s.city.toLowerCase().includes(query)
      || s.postalCode.toLowerCase().includes(query);
    return matchesType && matchesSearch;
  });

  // --- Helpers ---
  const getZoneName = (zoneId: string) => {
    const z = zones.find(zn => zn.id === zoneId);
    return z ? z.name : zoneId;
  };

  const toggleStore = (id: string) => {
    setStoreList(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
    show('Store status updated');
  };

  const updateMaxDailyOrders = (id: string, value: string) => {
    const num = parseInt(value) || 0;
    setStoreList(prev => prev.map(s => s.id === id ? { ...s, maxDailyOrders: num } : s));
  };

  const toggleFormBL = (bl: BusinessLine) => {
    setForm(prev => ({
      ...prev,
      businessLines: prev.businessLines.includes(bl)
        ? prev.businessLines.filter(b => b !== bl)
        : [...prev.businessLines, bl],
    }));
  };

  const toggleFormZone = (zoneId: string) => {
    setForm(prev => ({
      ...prev,
      zoneIds: prev.zoneIds.includes(zoneId)
        ? prev.zoneIds.filter(z => z !== zoneId)
        : [...prev.zoneIds, zoneId],
    }));
  };

  const resetForm = () => setForm({ ...emptyForm });

  const validateForm = (): boolean => {
    if (!form.name.trim() || !form.address.trim() || !form.postalCode.trim() || !form.city.trim() || form.businessLines.length === 0) {
      show('Please fill all required fields', 'error');
      return false;
    }
    return true;
  };

  // --- Add Store ---
  const handleAddStore = () => {
    if (!validateForm()) return;
    const store: AdminStore = {
      id: `s-${Date.now()}`,
      name: form.name.trim(),
      type: form.type,
      address: form.address.trim(),
      postalCode: form.postalCode.trim(),
      city: form.city.trim(),
      lat: parseFloat(form.lat) || 50.85,
      lng: parseFloat(form.lng) || 4.35,
      businessLines: form.businessLines,
      isActive: true,
      zoneIds: form.zoneIds,
      maxDailyOrders: parseInt(form.maxDailyOrders) || 100,
      operatingHours: { open: form.open, close: form.close },
    };
    setStoreList(prev => [...prev, store]);
    setAddModalOpen(false);
    resetForm();
    show('Store created successfully');
  };

  // --- Edit Store ---
  const openEditModal = (store: AdminStore) => {
    setEditingStoreId(store.id);
    setForm({
      name: store.name,
      type: store.type,
      address: store.address,
      city: store.city,
      postalCode: store.postalCode,
      lat: String(store.lat),
      lng: String(store.lng),
      businessLines: [...store.businessLines],
      maxDailyOrders: String(store.maxDailyOrders),
      open: store.operatingHours.open,
      close: store.operatingHours.close,
      zoneIds: [...store.zoneIds],
    });
    setEditModalOpen(true);
  };

  const handleEditStore = () => {
    if (!validateForm() || !editingStoreId) return;
    setStoreList(prev => prev.map(s => {
      if (s.id !== editingStoreId) return s;
      return {
        ...s,
        name: form.name.trim(),
        type: form.type,
        address: form.address.trim(),
        postalCode: form.postalCode.trim(),
        city: form.city.trim(),
        lat: parseFloat(form.lat) || s.lat,
        lng: parseFloat(form.lng) || s.lng,
        businessLines: form.businessLines,
        maxDailyOrders: parseInt(form.maxDailyOrders) || s.maxDailyOrders,
        operatingHours: { open: form.open, close: form.close },
        zoneIds: form.zoneIds,
      };
    }));
    setEditModalOpen(false);
    setEditingStoreId(null);
    resetForm();
    show('Store updated successfully');
  };

  // --- Store Form (shared between Add and Edit) ---
  const renderStoreForm = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <Label>Store Name</Label>
          <Input value={form.name} onChange={v => setForm(prev => ({ ...prev, name: v }))} placeholder="e.g. Carrefour Anderlecht" />
        </div>
        <div>
          <Label>Store Type</Label>
          <Select value={form.type} onChange={v => setForm(prev => ({ ...prev, type: v as StoreType }))} options={STORE_TYPE_OPTIONS} style={{ width: '100%' }} />
        </div>
      </div>

      <div>
        <Label>Address</Label>
        <Input value={form.address} onChange={v => setForm(prev => ({ ...prev, address: v }))} placeholder="Full street address" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <Label>City</Label>
          <Input value={form.city} onChange={v => setForm(prev => ({ ...prev, city: v }))} placeholder="City" />
        </div>
        <div>
          <Label>Postal Code</Label>
          <Input value={form.postalCode} onChange={v => setForm(prev => ({ ...prev, postalCode: v }))} placeholder="e.g. 1070" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <Label>Latitude</Label>
          <Input value={form.lat} onChange={v => setForm(prev => ({ ...prev, lat: v }))} placeholder="50.8500" type="number" />
        </div>
        <div>
          <Label>Longitude</Label>
          <Input value={form.lng} onChange={v => setForm(prev => ({ ...prev, lng: v }))} placeholder="4.3500" type="number" />
        </div>
      </div>

      <div>
        <Label>Business Lines</Label>
        <div style={{ display: 'flex', gap: 12 }}>
          {BL_LIST.map(bl => (
            <label key={bl} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.businessLines.includes(bl)} onChange={() => toggleFormBL(bl)} style={{ accentColor: T.primary }} />
              {bl}
            </label>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        <div>
          <Label>Max Daily Orders</Label>
          <Input value={form.maxDailyOrders} onChange={v => setForm(prev => ({ ...prev, maxDailyOrders: v }))} type="number" />
        </div>
        <div>
          <Label>Open</Label>
          <Input value={form.open} onChange={v => setForm(prev => ({ ...prev, open: v }))} type="time" />
        </div>
        <div>
          <Label>Close</Label>
          <Input value={form.close} onChange={v => setForm(prev => ({ ...prev, close: v }))} type="time" />
        </div>
      </div>

      <div>
        <Label>Zone Assignments</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxHeight: 120, overflowY: 'auto', padding: '8px 0' }}>
          {zones.map(z => (
            <label key={z.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer', minWidth: 160 }}>
              <input type="checkbox" checked={form.zoneIds.includes(z.id)} onChange={() => toggleFormZone(z.id)} style={{ accentColor: T.primary }} />
              {z.name}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <Toast />

      {/* 1. Search Bar */}
      <div style={{ marginBottom: 20 }}>
        <Input
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search stores by name, city, or postal code..."
          style={{ height: 42, fontSize: 14, borderRadius: 6, padding: '0 16px' }}
        />
      </div>

      {/* 2. Stats Row */}
      <FlexRow gap={16}>
        <StatCard label="Total Stores" value={storeList.length} sub="All store locations" />
        <StatCard label="LAD Hubs" value={ladHubs} color="#7C3AED" sub="Dedicated fulfillment" />
        <StatCard label="Active" value={activeCount} color={T.success} sub="Currently operating" />
        <StatCard label="Total Daily Capacity" value={totalMaxOrders.toLocaleString()} color={T.warning} sub="Combined max daily orders" />
      </FlexRow>

      <div style={{ height: 20 }} />

      {/* 3. Type Filter Chips */}
      <FilterBar>
        <span style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary }}>Store Type:</span>
        {FILTER_TYPES.map(ft => (
          <FilterChip key={ft} label={ft === 'LAD_Hub' ? 'LAD Hub' : ft} active={typeFilter === ft} onClick={() => setTypeFilter(ft)} />
        ))}
      </FilterBar>

      {/* 4. Store Table */}
      <Card>
        <SectionTitle actions={<AddButton label="+ Add Store" onSingle={() => { resetForm(); setAddModalOpen(true); }} onBulk={() => setBulkOpen(true)} />}>
          Store Directory ({filtered.length})
        </SectionTitle>
        <div style={{ overflowX: 'auto' }}>
          <Table headers={['Name', 'Type', 'City', 'Postal Code', 'Business Lines', 'Max Daily Orders', 'Hours', 'Zones', 'Status', 'Actions']}>
            {filtered.map(store => (
              <>
                <tr
                  key={store.id}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F6FCFE'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Name — click toggles expanded row */}
                  <Td style={{ fontWeight: 600 }}>
                    <FlexRow gap={6}>
                      <span
                        onClick={e => { e.stopPropagation(); setExpandedId(expandedId === store.id ? null : store.id); }}
                        style={{ fontSize: 10, color: T.textMuted, transition: 'transform 0.2s', transform: expandedId === store.id ? 'rotate(90deg)' : 'rotate(0deg)', cursor: 'pointer' }}
                      >&#9654;</span>
                      <span onClick={() => setExpandedId(expandedId === store.id ? null : store.id)} style={{ cursor: 'pointer' }}>
                        {store.name}
                      </span>
                    </FlexRow>
                  </Td>

                  {/* Type badge */}
                  <Td><Badge color={STORE_TYPE_COLORS[store.type]}>{store.type.replace('_', ' ')}</Badge></Td>

                  {/* City */}
                  <Td>{store.city}</Td>

                  {/* Postal Code */}
                  <Td mono>{store.postalCode}</Td>

                  {/* Business Lines */}
                  <Td>
                    <FlexRow gap={4}>
                      {store.businessLines.map(bl => <Badge key={bl} color={BL_COLORS[bl]}>{bl}</Badge>)}
                    </FlexRow>
                  </Td>

                  {/* Max Daily Orders — inline editable */}
                  <Td>
                    <input
                      type="number"
                      value={store.maxDailyOrders}
                      onChange={e => updateMaxDailyOrders(store.id, e.target.value)}
                      onClick={e => e.stopPropagation()}
                      style={{
                        width: 72,
                        height: 30,
                        border: `1px solid ${T.border}`,
                        borderRadius: 4,
                        padding: '0 8px',
                        fontSize: 13,
                        fontFamily: T.mono,
                        fontWeight: 500,
                        textAlign: 'right',
                        outline: 'none',
                        background: T.card,
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = T.primary; }}
                      onBlur={e => { e.currentTarget.style.borderColor = T.border; }}
                    />
                  </Td>

                  {/* Operating Hours */}
                  <Td>
                    <span style={{ fontSize: 12, fontFamily: T.mono }}>
                      {store.operatingHours.open} - {store.operatingHours.close}
                    </span>
                  </Td>

                  {/* Zone Count */}
                  <Td>
                    <Badge color="gray">{store.zoneIds.length}</Badge>
                  </Td>

                  {/* Status toggle */}
                  <Td>
                    <FlexRow gap={8}>
                      <span onClick={e => e.stopPropagation()}>
                        <Toggle checked={store.isActive} onChange={() => toggleStore(store.id)} />
                      </span>
                      <span style={{ fontSize: 12, color: store.isActive ? T.success : T.textMuted }}>
                        {store.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </FlexRow>
                  </Td>

                  {/* Actions */}
                  <Td>
                    <Button size="sm" variant="secondary" onClick={() => openEditModal(store)}>
                      Edit
                    </Button>
                  </Td>
                </tr>

                {/* 7. Expandable Row Detail */}
                {expandedId === store.id && (
                  <tr key={`${store.id}-detail`}>
                    <td colSpan={10} style={{ padding: 0, background: '#FAFBFC' }}>
                      <div style={{ padding: '16px 24px', borderTop: `1px solid ${T.border}`, borderBottom: `2px solid ${T.primaryLight}` }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
                          <div>
                            <Label>Full Address</Label>
                            <div style={{ fontSize: 13, color: T.text }}>{store.address}</div>
                          </div>
                          <div>
                            <Label>Coordinates</Label>
                            <div style={{ fontSize: 13, fontFamily: T.mono, color: T.text }}>
                              {store.lat.toFixed(4)}, {store.lng.toFixed(4)}
                            </div>
                          </div>
                          <div>
                            <Label>Store ID</Label>
                            <div style={{ fontSize: 13, fontFamily: T.mono, color: T.textSecondary }}>{store.id}</div>
                          </div>
                        </div>

                        <div style={{ marginTop: 16 }}>
                          <Label>Zone Assignments</Label>
                          {store.zoneIds.length > 0 ? (
                            <FlexRow gap={6}>
                              {store.zoneIds.map(zId => (
                                <Badge key={zId} color="blue">{getZoneName(zId)}</Badge>
                              ))}
                            </FlexRow>
                          ) : (
                            <span style={{ fontSize: 12, color: T.textMuted }}>No zones assigned</span>
                          )}
                        </div>

                        <div style={{ marginTop: 16 }}>
                          <Label>Per-Store Config Overrides</Label>
                          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 6, padding: '12px 16px', fontSize: 13, color: T.textSecondary, lineHeight: 1.6 }}>
                            Store-level slot, yield, and allocation overrides can be configured from respective sections using the store filter.
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </Table>
        </div>
      </Card>

      {/* 6. Add Store Modal */}
      <Modal open={addModalOpen} onClose={() => { setAddModalOpen(false); resetForm(); }} title="Add New Store" width={600}>
        {renderStoreForm()}
        <div style={{ height: 16 }} />
        <FlexRow gap={8} justify="flex-end">
          <Button variant="secondary" onClick={() => { setAddModalOpen(false); resetForm(); }}>Cancel</Button>
          <Button onClick={handleAddStore}>Create Store</Button>
        </FlexRow>
      </Modal>

      {/* 5. Edit Store Modal */}
      <Modal open={editModalOpen} onClose={() => { setEditModalOpen(false); setEditingStoreId(null); resetForm(); }} title="Edit Store" width={600}>
        {renderStoreForm()}
        <div style={{ height: 16 }} />
        <FlexRow gap={8} justify="flex-end">
          <Button variant="secondary" onClick={() => { setEditModalOpen(false); setEditingStoreId(null); resetForm(); }}>Cancel</Button>
          <Button onClick={handleEditStore}>Save Changes</Button>
        </FlexRow>
      </Modal>

      <BulkUploadModal open={bulkOpen} onClose={() => setBulkOpen(false)} entityName="Stores" sampleColumns={['name', 'type', 'address', 'city', 'postal_code', 'lat', 'lng', 'business_lines', 'max_daily_orders']} onUpload={(file) => { show(file.name + ' uploaded — 30 records will be imported'); setBulkOpen(false); }} />
    </div>
  );
}
