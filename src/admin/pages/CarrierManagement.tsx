import { useState } from 'react';
import {
  Card, SectionTitle, Label, Badge, StatusDot, Toggle, Input, Select, Button,
  Table, Td, Modal, StatCard, InfoBox, useToast, FlexRow, T,
} from '../shared';
import { carriers as seedCarriers, zones } from '../data';
import type { Carrier, FleetType, BusinessLine, CarrierStatus } from '../types';

const BL_COLORS: Record<BusinessLine, 'blue' | 'green' | 'orange'> = {
  LAD: 'blue', Drive: 'green', FastDelivery: 'orange',
};

const TYPE_COLORS: Record<FleetType, 'purple' | 'blue'> = {
  own_fleet: 'purple', '3pl': 'blue',
};

const STATUS_MAP: Record<CarrierStatus, 'active' | 'inactive' | 'warning'> = {
  active: 'active', inactive: 'inactive', suspended: 'warning',
};

const API_STATUS_MAP: Record<string, 'connected' | 'error' | 'inactive'> = {
  connected: 'connected', error: 'error', not_configured: 'inactive',
};

const BL_LIST: BusinessLine[] = ['LAD', 'Drive', 'FastDelivery'];

const FLEET_TYPE_OPTIONS = [
  { value: 'own_fleet', label: 'Own Fleet' },
  { value: '3pl', label: '3PL Partner' },
];

/* Status options: active, inactive, suspended — used by carrier edit modal */

export default function CarrierManagement() {
  const [carrierList, setCarrierList] = useState<Carrier[]>(seedCarriers);
  const [detailCarrier, setDetailCarrier] = useState<Carrier | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const { show, Toast } = useToast();

  // New carrier form
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<FleetType>('3pl');
  const [newBLs, setNewBLs] = useState<BusinessLine[]>([]);
  const [newCost, setNewCost] = useState('5.00');
  const [newSla, setNewSla] = useState('24');
  const [newCapacity, setNewCapacity] = useState('100');
  const [newApiEndpoint, setNewApiEndpoint] = useState('');
  const [newVehicleTypes, setNewVehicleTypes] = useState('');
  const [newDedicated, setNewDedicated] = useState(true);

  const ownFleetCount = carrierList.filter(c => c.type === 'own_fleet').length;
  const thirdPlCount = carrierList.filter(c => c.type === '3pl').length;
  const apiConnected = carrierList.filter(c => c.apiStatus === 'connected').length;

  // Fleet split calculation
  const ownCapacity = carrierList.filter(c => c.type === 'own_fleet').reduce((s, c) => s + c.maxDailyCapacity, 0);
  const thirdPlCapacity = carrierList.filter(c => c.type === '3pl').reduce((s, c) => s + c.maxDailyCapacity, 0);
  const totalCapacity = ownCapacity + thirdPlCapacity;
  const ownPct = totalCapacity > 0 ? Math.round((ownCapacity / totalCapacity) * 100) : 0;
  const thirdPlPct = 100 - ownPct;

  const toggleBL = (bl: BusinessLine) => {
    setNewBLs(prev => prev.includes(bl) ? prev.filter(b => b !== bl) : [...prev, bl]);
  };

  const resetForm = () => {
    setNewName(''); setNewType('3pl'); setNewBLs([]); setNewCost('5.00');
    setNewSla('24'); setNewCapacity('100'); setNewApiEndpoint('');
    setNewVehicleTypes(''); setNewDedicated(true);
  };

  const handleAddCarrier = () => {
    if (!newName.trim() || newBLs.length === 0) {
      show('Please fill all required fields', 'error');
      return;
    }
    const carrier: Carrier = {
      id: `c-${Date.now()}`,
      name: newName.trim(),
      type: newType,
      status: 'active',
      businessLines: newBLs,
      zoneIds: [],
      costPerDelivery: parseFloat(newCost) || 5.00,
      slaHours: parseInt(newSla) || 24,
      maxDailyCapacity: parseInt(newCapacity) || 100,
      apiEndpoint: newApiEndpoint.trim() || 'not_configured',
      apiStatus: newApiEndpoint.trim() ? 'connected' : 'not_configured',
      isDedicated: newDedicated,
      vehicleTypes: newVehicleTypes.split(',').map(v => v.trim()).filter(Boolean),
    };
    setCarrierList(prev => [...prev, carrier]);
    setAddModalOpen(false);
    resetForm();
    show('Carrier created successfully');
  };

  const toggleCarrierStatus = (id: string) => {
    setCarrierList(prev => prev.map(c =>
      c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' as CarrierStatus } : c
    ));
    show('Carrier status updated');
  };

  const getZoneName = (zoneId: string) => {
    const z = zones.find(zn => zn.id === zoneId);
    return z ? z.name : zoneId;
  };

  return (
    <div>
      <Toast />

      {/* Stats Row */}
      <FlexRow gap={16}>
        <StatCard label="Total Carriers" value={carrierList.length} sub="All configured carriers" />
        <StatCard label="Own Fleet" value={ownFleetCount} color="#7C3AED" sub="Internal fleet" />
        <StatCard label="3PL Partners" value={thirdPlCount} color={T.primary} sub="External providers" />
        <StatCard label="API Connected" value={`${apiConnected}/${carrierList.length}`} color={T.success} sub="Integration status" />
      </FlexRow>

      <div style={{ height: 20 }} />

      {/* Fleet Overview */}
      <Card>
        <SectionTitle>Fleet Overview</SectionTitle>
        <div style={{ marginBottom: 12 }}>
          <FlexRow gap={16} justify="space-between">
            <span style={{ fontSize: 13, fontWeight: 600, color: '#7C3AED' }}>
              Own Fleet: {ownCapacity} orders/day ({ownPct}%)
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: T.primary }}>
              3PL Partners: {thirdPlCapacity} orders/day ({thirdPlPct}%)
            </span>
          </FlexRow>
        </div>
        <div style={{ height: 32, borderRadius: 6, overflow: 'hidden', display: 'flex', background: T.border }}>
          <div
            style={{
              width: `${ownPct}%`,
              background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#fff',
              transition: 'width 0.3s',
            }}
          >
            {ownPct}% Own
          </div>
          <div
            style={{
              width: `${thirdPlPct}%`,
              background: `linear-gradient(135deg, ${T.primary}, #5B8DEF)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#fff',
              transition: 'width 0.3s',
            }}
          >
            {thirdPlPct}% 3PL
          </div>
        </div>
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
          {carrierList.map(c => (
            <div key={c.id} style={{
              padding: '8px 12px', borderRadius: 4, fontSize: 12,
              background: c.type === 'own_fleet' ? '#F3EEFE' : T.primaryLight,
              border: `1px solid ${c.type === 'own_fleet' ? '#DDD6FE' : '#C7D9F5'}`,
            }}>
              <div style={{ fontWeight: 700, color: T.text }}>{c.name}</div>
              <div style={{ color: T.textMuted, marginTop: 2 }}>
                {c.maxDailyCapacity} orders/day
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Carrier Table */}
      <Card>
        <SectionTitle actions={<Button onClick={() => setAddModalOpen(true)}>+ Add Carrier</Button>}>
          Carrier Directory
        </SectionTitle>
        <div style={{ overflowX: 'auto' }}>
          <Table headers={['Name', 'Type', 'Status', 'Business Lines', 'Zone Coverage', 'Cost/Delivery', 'SLA', 'Daily Capacity', 'API Status', 'Dedicated']}>
            {carrierList.map(carrier => (
              <tr
                key={carrier.id}
                onClick={() => setDetailCarrier(carrier)}
                onMouseEnter={e => { e.currentTarget.style.background = '#F6FCFE'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                style={{ cursor: 'pointer' }}
              >
                <Td style={{ fontWeight: 600 }}>{carrier.name}</Td>
                <Td><Badge color={TYPE_COLORS[carrier.type]}>{carrier.type === 'own_fleet' ? 'Own Fleet' : '3PL'}</Badge></Td>
                <Td>
                  <FlexRow gap={6}>
                    <StatusDot status={STATUS_MAP[carrier.status]} />
                    <span style={{ fontSize: 12, textTransform: 'capitalize' }}>{carrier.status}</span>
                  </FlexRow>
                </Td>
                <Td>
                  <FlexRow gap={4}>
                    {carrier.businessLines.map(bl => <Badge key={bl} color={BL_COLORS[bl]}>{bl}</Badge>)}
                  </FlexRow>
                </Td>
                <Td><Badge color="gray">{carrier.zoneIds.length} zones</Badge></Td>
                <Td mono>EUR {carrier.costPerDelivery.toFixed(2)}</Td>
                <Td mono>{carrier.slaHours}h</Td>
                <Td mono>{carrier.maxDailyCapacity}</Td>
                <Td>
                  <FlexRow gap={6}>
                    <StatusDot status={API_STATUS_MAP[carrier.apiStatus]} />
                    <span style={{ fontSize: 12, textTransform: 'capitalize' }}>{carrier.apiStatus.replace('_', ' ')}</span>
                  </FlexRow>
                </Td>
                <Td>
                  {carrier.isDedicated
                    ? <Badge color="green">Dedicated</Badge>
                    : <Badge color="gray">Shared</Badge>
                  }
                </Td>
              </tr>
            ))}
          </Table>
        </div>
      </Card>

      {/* Carrier Detail Modal */}
      <Modal open={!!detailCarrier} onClose={() => setDetailCarrier(null)} title={detailCarrier ? `Carrier: ${detailCarrier.name}` : ''} width={640}>
        {detailCarrier && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Integration Health */}
            <InfoBox type={detailCarrier.apiStatus === 'connected' ? 'success' : detailCarrier.apiStatus === 'error' ? 'error' : 'warning'}>
              <strong>Integration Health:</strong>{' '}
              {detailCarrier.apiStatus === 'connected' && 'All systems operational. Last heartbeat < 30s ago.'}
              {detailCarrier.apiStatus === 'error' && 'Connection error detected. Check API endpoint and credentials.'}
              {detailCarrier.apiStatus === 'not_configured' && 'API endpoint not configured. Manual dispatch required.'}
            </InfoBox>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <Label>Carrier ID</Label>
                <div style={{ fontSize: 13, fontFamily: T.mono, color: T.textSecondary }}>{detailCarrier.id}</div>
              </div>
              <div>
                <Label>Type</Label>
                <Badge color={TYPE_COLORS[detailCarrier.type]}>{detailCarrier.type === 'own_fleet' ? 'Own Fleet' : '3PL Partner'}</Badge>
              </div>
              <div>
                <Label>Status</Label>
                <FlexRow gap={8}>
                  <StatusDot status={STATUS_MAP[detailCarrier.status]} />
                  <span style={{ fontSize: 13, textTransform: 'capitalize' }}>{detailCarrier.status}</span>
                  <Toggle
                    checked={detailCarrier.status === 'active'}
                    onChange={() => {
                      toggleCarrierStatus(detailCarrier.id);
                      setDetailCarrier(prev => prev ? { ...prev, status: prev.status === 'active' ? 'inactive' : 'active' } : null);
                    }}
                  />
                </FlexRow>
              </div>
              <div>
                <Label>Dedicated</Label>
                <div style={{ fontSize: 13 }}>{detailCarrier.isDedicated ? 'Yes (Dedicated)' : 'No (Shared pool)'}</div>
              </div>
            </div>

            <div>
              <Label>API Endpoint</Label>
              <div style={{
                padding: '8px 12px', background: '#1E1E2E', borderRadius: 4,
                fontFamily: T.mono, fontSize: 12, color: '#A6E3A1', wordBreak: 'break-all',
              }}>
                {detailCarrier.apiEndpoint}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div>
                <Label>Cost / Delivery</Label>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: T.mono, color: T.text }}>
                  EUR {detailCarrier.costPerDelivery.toFixed(2)}
                </div>
              </div>
              <div>
                <Label>SLA</Label>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: T.mono, color: T.text }}>
                  {detailCarrier.slaHours}h
                </div>
              </div>
              <div>
                <Label>Daily Capacity</Label>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: T.mono, color: T.text }}>
                  {detailCarrier.maxDailyCapacity}
                </div>
              </div>
            </div>

            <div>
              <Label>Vehicle Types</Label>
              <FlexRow gap={6}>
                {detailCarrier.vehicleTypes.map((vt, i) => (
                  <Badge key={i} color="gray">{vt}</Badge>
                ))}
              </FlexRow>
            </div>

            <div>
              <Label>Business Lines</Label>
              <FlexRow gap={6}>
                {detailCarrier.businessLines.map(bl => (
                  <Badge key={bl} color={BL_COLORS[bl]}>{bl}</Badge>
                ))}
              </FlexRow>
            </div>

            <div>
              <Label>Zone Coverage ({detailCarrier.zoneIds.length} zones)</Label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {detailCarrier.zoneIds.map(zId => (
                  <Badge key={zId} color="blue">{getZoneName(zId)}</Badge>
                ))}
              </div>
            </div>

            <FlexRow gap={8} justify="flex-end">
              <Button variant="secondary" onClick={() => setDetailCarrier(null)}>Close</Button>
            </FlexRow>
          </div>
        )}
      </Modal>

      {/* Add Carrier Modal */}
      <Modal open={addModalOpen} onClose={() => { setAddModalOpen(false); resetForm(); }} title="Add New Carrier" width={560}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <Label>Carrier Name</Label>
              <Input value={newName} onChange={setNewName} placeholder="e.g. PostNL" />
            </div>
            <div>
              <Label>Fleet Type</Label>
              <Select value={newType} onChange={v => setNewType(v as FleetType)} options={FLEET_TYPE_OPTIONS} style={{ width: '100%' }} />
            </div>
          </div>

          <div>
            <Label>Business Lines</Label>
            <div style={{ display: 'flex', gap: 12 }}>
              {BL_LIST.map(bl => (
                <label key={bl} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={newBLs.includes(bl)} onChange={() => toggleBL(bl)} style={{ accentColor: T.primary }} />
                  {bl}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div>
              <Label>Cost / Delivery (EUR)</Label>
              <Input value={newCost} onChange={setNewCost} type="number" />
            </div>
            <div>
              <Label>SLA (hours)</Label>
              <Input value={newSla} onChange={setNewSla} type="number" />
            </div>
            <div>
              <Label>Daily Capacity</Label>
              <Input value={newCapacity} onChange={setNewCapacity} type="number" />
            </div>
          </div>

          <div>
            <Label>API Endpoint</Label>
            <Input value={newApiEndpoint} onChange={setNewApiEndpoint} placeholder="https://api.carrier.com/v1" />
          </div>

          <div>
            <Label>Vehicle Types (comma-separated)</Label>
            <Input value={newVehicleTypes} onChange={setNewVehicleTypes} placeholder="Van, Sprinter, E-Cargo Bike" />
          </div>

          <div>
            <Label>Dedicated Carrier</Label>
            <FlexRow gap={8}>
              <Toggle checked={newDedicated} onChange={setNewDedicated} />
              <span style={{ fontSize: 12, color: T.textSecondary }}>{newDedicated ? 'Dedicated to Carrefour' : 'Shared pool'}</span>
            </FlexRow>
          </div>

          <FlexRow gap={8} justify="flex-end">
            <Button variant="secondary" onClick={() => { setAddModalOpen(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleAddCarrier}>Create Carrier</Button>
          </FlexRow>
        </div>
      </Modal>
    </div>
  );
}
