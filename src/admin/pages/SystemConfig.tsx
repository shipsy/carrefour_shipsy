/* ============================================================
   Shipsy Admin Console — System Configuration Page
   API Fallback + Concurrency + Price Lock + Integration Endpoints
   ============================================================ */

import { useState } from 'react';
import type { SystemConfig as SystemConfigType, FallbackMode } from '../types';
import { defaultSystemConfig } from '../data';
import {
  Card, SectionTitle, Label, InfoBox, Button, Select, Textarea,
  Slider, Toggle, Input, Table, Td, TrHover, StatusDot, FlexRow,
  useToast, T,
} from '../shared';

const fallbackDescriptions: Record<FallbackMode, string> = {
  static_slots: 'Show pre-configured static delivery slots with standard pricing. Customers can still place orders.',
  hide_delivery: 'Remove the delivery option entirely from checkout. Only click-and-collect remains available.',
  show_message: 'Display a custom message explaining that delivery is temporarily unavailable.',
  last_known: 'Use the last successfully fetched slot/pricing data from cache. Stale data risk.',
};

const raceDescriptions: Record<string, string> = {
  optimistic_lock: 'Allow concurrent reads but validate at commit. Best for low contention.',
  pessimistic_lock: 'Lock slot row on read. Prevents conflicts but reduces throughput.',
  queue: 'Serialize checkout requests per slot via queue. Highest consistency, highest latency.',
};

interface IntegrationEndpoint {
  service: string;
  url: string;
  status: 'connected' | 'error' | 'warning';
  lastPing: string;
}

const integrations: IntegrationEndpoint[] = [
  { service: 'Salesforce OMS', url: 'https://sfcc.carrefour.be/api/oms/v2', status: 'connected', lastPing: '2026-05-13T10:02:15Z' },
  { service: 'Salesforce Commerce Cloud', url: 'https://sfcc.carrefour.be/api/commerce/v3', status: 'connected', lastPing: '2026-05-13T10:02:12Z' },
  { service: 'Strongpoint Picking', url: 'https://api.strongpoint.io/carrefour-be/v1', status: 'connected', lastPing: '2026-05-13T10:01:58Z' },
  { service: 'Cold Chain Sensors', url: 'https://iot.carrefour.be/coldchain/v1', status: 'warning', lastPing: '2026-05-13T09:48:30Z' },
];

const fmtTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

export default function SystemConfig() {
  const [config, setConfig] = useState<SystemConfigType>({ ...defaultSystemConfig });
  const { show: toast, Toast } = useToast();

  const update = <K extends keyof SystemConfigType>(key: K, value: SystemConfigType[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => toast('System configuration saved');

  return (
    <div>
      <Toast />

      {/* ── Section 1: API Fallback Strategy ────────────────────── */}
      <Card>
        <SectionTitle actions={<Button size="sm" onClick={handleSave}>Save Changes</Button>}>
          API Fallback Strategy
        </SectionTitle>

        <InfoBox>
          When the slot/yield engine is unreachable, the fallback strategy determines what customers see.
        </InfoBox>

        <div style={{ marginBottom: 16 }}>
          <Label>Fallback Mode</Label>
          <Select
            value={config.fallbackMode}
            onChange={v => update('fallbackMode', v as FallbackMode)}
            options={[
              { value: 'static_slots', label: 'Static Slots' },
              { value: 'hide_delivery', label: 'Hide Delivery' },
              { value: 'show_message', label: 'Show Message' },
              { value: 'last_known', label: 'Last Known Data' },
            ]}
          />
          <p style={{ fontSize: 12, color: T.textSecondary, margin: '6px 0 0', lineHeight: 1.5 }}>
            {fallbackDescriptions[config.fallbackMode]}
          </p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Label>Fallback Message</Label>
          <Textarea
            value={config.fallbackMessage}
            onChange={v => update('fallbackMessage', v)}
            placeholder="Message shown to customers..."
            rows={3}
          />
        </div>

        <div>
          <Label>Health Check Interval: {config.healthCheckIntervalSec}s</Label>
          <Slider
            value={config.healthCheckIntervalSec}
            min={10} max={120} step={5}
            onChange={v => update('healthCheckIntervalSec', v)}
          />
          <FlexRow justify="space-between">
            <span style={{ fontSize: 11, color: T.textMuted }}>10s (aggressive)</span>
            <span style={{ fontSize: 11, color: T.textMuted }}>120s (relaxed)</span>
          </FlexRow>
        </div>
      </Card>

      {/* ── Section 2: Concurrency & Overbooking ────────────────── */}
      <Card>
        <SectionTitle>Concurrency &amp; Overbooking</SectionTitle>

        <InfoBox>
          Concurrency controls prevent double-booking when multiple customers checkout simultaneously.
        </InfoBox>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 16 }}>
          <div>
            <Label>Max Overbooking: {config.maxOverbookingPct}%</Label>
            <Slider
              value={config.maxOverbookingPct}
              min={0} max={15} step={1}
              onChange={v => update('maxOverbookingPct', v)}
              color={config.maxOverbookingPct > 10 ? T.warning : T.primary}
            />
            <FlexRow justify="space-between">
              <span style={{ fontSize: 11, color: T.textMuted }}>0% (strict)</span>
              <span style={{ fontSize: 11, color: T.textMuted }}>15% (aggressive)</span>
            </FlexRow>
          </div>
          <div>
            <Label>Lock Timeout: {config.concurrencyLockTimeoutSec}s</Label>
            <Slider
              value={config.concurrencyLockTimeoutSec}
              min={5} max={30} step={1}
              onChange={v => update('concurrencyLockTimeoutSec', v)}
            />
            <FlexRow justify="space-between">
              <span style={{ fontSize: 11, color: T.textMuted }}>5s</span>
              <span style={{ fontSize: 11, color: T.textMuted }}>30s</span>
            </FlexRow>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Label>Race Condition Strategy</Label>
          <Select
            value={config.raceConditionStrategy}
            onChange={v => update('raceConditionStrategy', v as SystemConfigType['raceConditionStrategy'])}
            options={[
              { value: 'optimistic_lock', label: 'Optimistic Locking' },
              { value: 'pessimistic_lock', label: 'Pessimistic Locking' },
              { value: 'queue', label: 'Queue-based Serialization' },
            ]}
          />
          <p style={{ fontSize: 12, color: T.textSecondary, margin: '6px 0 0', lineHeight: 1.5 }}>
            {raceDescriptions[config.raceConditionStrategy]}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <FlexRow gap={10}>
              <Label>Waitlist</Label>
              <Toggle checked={config.waitlistEnabled} onChange={v => update('waitlistEnabled', v)} />
            </FlexRow>
            <p style={{ fontSize: 12, color: T.textSecondary, margin: '4px 0 0' }}>
              {config.waitlistEnabled ? 'Customers can join a waitlist for full slots' : 'Waitlist disabled — full slots show as unavailable'}
            </p>
          </div>
          <div>
            <Label>Max Waitlist Size</Label>
            <Input
              type="number"
              value={config.waitlistMaxSize}
              onChange={v => update('waitlistMaxSize', Math.max(0, Number(v)))}
              disabled={!config.waitlistEnabled}
            />
          </div>
        </div>
      </Card>

      {/* ── Section 3: Price Lock ───────────────────────────────── */}
      <Card>
        <SectionTitle>Price Lock</SectionTitle>

        <InfoBox>
          When enabled, the delivery fee shown to a customer is locked for the configured duration. Even if slot capacity changes, the price remains stable until checkout completes or the lock expires.
        </InfoBox>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <FlexRow gap={10}>
              <Label>Price Lock Enabled</Label>
              <Toggle checked={config.priceLockEnabled} onChange={v => update('priceLockEnabled', v)} />
            </FlexRow>
            <p style={{ fontSize: 12, color: T.textSecondary, margin: '4px 0 0' }}>
              {config.priceLockEnabled ? 'Prices are locked once shown to the customer' : 'Prices may change dynamically during checkout'}
            </p>
          </div>
          <div>
            <Label>Lock Duration (minutes)</Label>
            <Input
              type="number"
              value={config.priceLockDurationMin}
              onChange={v => update('priceLockDurationMin', Math.max(1, Number(v)))}
              disabled={!config.priceLockEnabled}
            />
          </div>
        </div>
      </Card>

      {/* ── Section 4: Integration Endpoints ────────────────────── */}
      <Card>
        <SectionTitle>Integration Endpoints</SectionTitle>

        <Table headers={['Service', 'Endpoint URL', 'Status', 'Last Ping']}>
          {integrations.map(ep => (
            <TrHover key={ep.service}>
              <Td style={{ fontWeight: 600 }}>{ep.service}</Td>
              <Td mono>{ep.url}</Td>
              <Td>
                <FlexRow gap={6}>
                  <StatusDot status={ep.status === 'connected' ? 'active' : ep.status === 'warning' ? 'warning' : 'error'} />
                  <span style={{ fontSize: 12, color: ep.status === 'connected' ? T.success : ep.status === 'warning' ? T.warning : T.danger, fontWeight: 600 }}>
                    {ep.status === 'connected' ? 'Connected' : ep.status === 'warning' ? 'Degraded' : 'Error'}
                  </span>
                </FlexRow>
              </Td>
              <Td>{fmtTime(ep.lastPing)}</Td>
            </TrHover>
          ))}
        </Table>
      </Card>
    </div>
  );
}
