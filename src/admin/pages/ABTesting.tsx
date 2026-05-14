/* ============================================================
   Shipsy Admin Console — A/B Testing Page
   Carrefour Belgium Checkout
   ============================================================ */

import { useState } from 'react';
import type { ABExperiment, ExperimentStatus } from '../types';
import { experiments as seedExperiments } from '../data';
import {
  Card, SectionTitle, Label, Badge, InfoBox, StatCard, Button,
  Modal, Input, Textarea, Slider, FlexRow, Grid3, useToast, T,
  AddButton, BulkUploadModal,
} from '../shared';

const statusColor = (s: ExperimentStatus): 'gray' | 'blue' | 'orange' | 'green' => {
  switch (s) {
    case 'draft': return 'gray';
    case 'running': return 'blue';
    case 'paused': return 'orange';
    case 'completed': return 'green';
  }
};

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export default function ABTesting() {
  const [experiments, setExperiments] = useState<ABExperiment[]>(seedExperiments);
  const [showCreate, setShowCreate] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const { show: toast, Toast } = useToast();

  // New experiment form state
  const [form, setForm] = useState({
    name: '', description: '',
    variantAName: '', variantAConfig: '',
    variantBName: '', variantBConfig: '',
    trafficSplit: 50, metric: '',
    startDate: '', endDate: '',
  });

  const active = experiments.filter(e => e.status === 'running').length;
  const completed = experiments.filter(e => e.status === 'completed').length;
  const draft = experiments.filter(e => e.status === 'draft').length;

  const handleAction = (id: string, action: 'start' | 'pause' | 'resume' | 'archive') => {
    setExperiments(prev => prev.map(e => {
      if (e.id !== id) return e;
      switch (action) {
        case 'start': return { ...e, status: 'running' as const };
        case 'pause': return { ...e, status: 'paused' as const };
        case 'resume': return { ...e, status: 'running' as const };
        case 'archive': return { ...e, status: 'completed' as const };
      }
    }));
    toast(`Experiment ${action}ed successfully`);
  };

  const handleCreate = () => {
    if (!form.name || !form.metric) { toast('Name and metric are required', 'error'); return; }
    const newExp: ABExperiment = {
      id: `exp-${Date.now()}`,
      name: form.name,
      description: form.description,
      status: 'draft',
      variantA: { name: form.variantAName || 'Variant A', config: form.variantAConfig },
      variantB: { name: form.variantBName || 'Variant B', config: form.variantBConfig },
      trafficSplitPct: form.trafficSplit,
      metric: form.metric,
      startDate: form.startDate || '2026-06-01',
      endDate: form.endDate || '2026-06-30',
    };
    setExperiments(prev => [...prev, newExp]);
    setForm({ name: '', description: '', variantAName: '', variantAConfig: '', variantBName: '', variantBConfig: '', trafficSplit: 50, metric: '', startDate: '', endDate: '' });
    setShowCreate(false);
    toast('Experiment created as draft');
  };

  return (
    <div>
      <Toast />

      {/* Stats Row */}
      <div style={{ marginBottom: 20 }}>
        <Grid3>
          <StatCard label="Active Experiments" value={active} color={T.primary} sub="Currently running" />
          <StatCard label="Completed" value={completed} color={T.success} sub="With results" />
          <StatCard label="Draft" value={draft} color={T.textMuted} sub="Not yet started" />
        </Grid3>
      </div>

      <InfoBox>
        A/B tests randomly assign checkout sessions to pricing variants. Results are measured over the configured period. Statistical significance requires minimum 1000 sessions per variant.
      </InfoBox>

      <SectionTitle actions={<AddButton label="+ New Experiment" onSingle={() => setShowCreate(true)} onBulk={() => setBulkOpen(true)} size="sm" />}>
        Experiments
      </SectionTitle>

      {/* Experiment Cards */}
      {experiments.map(exp => (
        <Card key={exp.id}>
          <FlexRow justify="space-between">
            <div style={{ flex: 1 }}>
              <FlexRow gap={10}>
                <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{exp.name}</span>
                <Badge color={statusColor(exp.status)}>{exp.status.toUpperCase()}</Badge>
              </FlexRow>
              <p style={{ fontSize: 13, color: T.textSecondary, margin: '6px 0 14px' }}>{exp.description}</p>

              {/* Variants */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
                <div style={{ background: T.primaryLight, borderRadius: 6, padding: '10px 14px' }}>
                  <Label>Variant A — {exp.variantA.name}</Label>
                  <span style={{ fontSize: 13, fontFamily: T.mono, color: T.primary }}>{exp.variantA.config}</span>
                </div>
                <div style={{ background: '#F3EEFE', borderRadius: 6, padding: '10px 14px' }}>
                  <Label>Variant B — {exp.variantB.name}</Label>
                  <span style={{ fontSize: 13, fontFamily: T.mono, color: '#6B21A8' }}>{exp.variantB.config}</span>
                </div>
              </div>

              {/* Traffic Split Bar */}
              <Label>Traffic Split</Label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ flex: 1, height: 10, borderRadius: 5, overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${exp.trafficSplitPct}%`, background: T.primary, height: '100%' }} />
                  <div style={{ width: `${100 - exp.trafficSplitPct}%`, background: '#7C3AED', height: '100%' }} />
                </div>
                <span style={{ fontSize: 11, color: T.textSecondary, whiteSpace: 'nowrap' }}>
                  A: {exp.trafficSplitPct}% / B: {100 - exp.trafficSplitPct}%
                </span>
              </div>

              {/* Metric + Dates */}
              <FlexRow gap={24}>
                <div>
                  <Label>Metric</Label>
                  <span style={{ fontSize: 13, color: T.text }}>{exp.metric}</span>
                </div>
                <div>
                  <Label>Period</Label>
                  <span style={{ fontSize: 13, color: T.text }}>{fmtDate(exp.startDate)} — {fmtDate(exp.endDate)}</span>
                </div>
              </FlexRow>

              {/* Results Section */}
              {exp.resultSummary && (exp.status === 'running' || exp.status === 'completed') && (
                <div style={{ marginTop: 16, padding: '14px 16px', background: T.bg, borderRadius: 6 }}>
                  <Label>Results</Label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 6 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: T.textSecondary, marginBottom: 4 }}>Variant A</div>
                      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: T.mono, color: exp.resultSummary.winner === 'A' ? T.success : T.text }}>
                        {exp.resultSummary.variantAValue}%
                      </div>
                      {exp.resultSummary.winner === 'A' && <Badge color="green">WINNER</Badge>}
                    </div>
                    <div style={{ fontSize: 18, color: T.textMuted, fontWeight: 700 }}>vs</div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: T.textSecondary, marginBottom: 4 }}>Variant B</div>
                      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: T.mono, color: exp.resultSummary.winner === 'B' ? T.success : T.text }}>
                        {exp.resultSummary.variantBValue}%
                      </div>
                      {exp.resultSummary.winner === 'B' && <Badge color="green">WINNER</Badge>}
                    </div>
                    {exp.resultSummary.winner === 'inconclusive' && (
                      <Badge color="orange">INCONCLUSIVE</Badge>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginLeft: 16 }}>
              {exp.status === 'draft' && (
                <Button size="sm" onClick={() => handleAction(exp.id, 'start')}>Start</Button>
              )}
              {exp.status === 'running' && (
                <Button size="sm" variant="secondary" onClick={() => handleAction(exp.id, 'pause')}>Pause</Button>
              )}
              {exp.status === 'paused' && (
                <Button size="sm" onClick={() => handleAction(exp.id, 'resume')}>Resume</Button>
              )}
              {exp.status === 'completed' && (
                <Button size="sm" variant="ghost" onClick={() => handleAction(exp.id, 'archive')}>Archive</Button>
              )}
            </div>
          </FlexRow>
        </Card>
      ))}

      {/* Create Experiment Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New Experiment" width={620}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <Label>Experiment Name</Label>
            <Input value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="e.g. Evening Surge Test" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} placeholder="Describe the hypothesis..." rows={2} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <Label>Variant A Name</Label>
              <Input value={form.variantAName} onChange={v => setForm(f => ({ ...f, variantAName: v }))} placeholder="Control" />
            </div>
            <div>
              <Label>Variant A Config</Label>
              <Input value={form.variantAConfig} onChange={v => setForm(f => ({ ...f, variantAConfig: v }))} placeholder="e.g. surcharge: 2.00" />
            </div>
            <div>
              <Label>Variant B Name</Label>
              <Input value={form.variantBName} onChange={v => setForm(f => ({ ...f, variantBName: v }))} placeholder="Test" />
            </div>
            <div>
              <Label>Variant B Config</Label>
              <Input value={form.variantBConfig} onChange={v => setForm(f => ({ ...f, variantBConfig: v }))} placeholder="e.g. surcharge: 3.50" />
            </div>
          </div>

          <div>
            <Label>Traffic Split (Variant A %): {form.trafficSplit}%</Label>
            <Slider value={form.trafficSplit} min={10} max={90} step={5} onChange={v => setForm(f => ({ ...f, trafficSplit: v }))} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: T.textMuted, marginTop: 2 }}>
              <span>A: {form.trafficSplit}%</span>
              <span>B: {100 - form.trafficSplit}%</span>
            </div>
          </div>

          <div>
            <Label>Primary Metric</Label>
            <Input value={form.metric} onChange={v => setForm(f => ({ ...f, metric: v }))} placeholder="e.g. Conversion rate, fill rate" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <Label>Start Date</Label>
              <Input type="date" value={form.startDate} onChange={v => setForm(f => ({ ...f, startDate: v }))} />
            </div>
            <div>
              <Label>End Date</Label>
              <Input type="date" value={form.endDate} onChange={v => setForm(f => ({ ...f, endDate: v }))} />
            </div>
          </div>

          <FlexRow justify="flex-end" gap={8}>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Experiment</Button>
          </FlexRow>
        </div>
      </Modal>

      <BulkUploadModal open={bulkOpen} onClose={() => setBulkOpen(false)} entityName="Experiments" sampleColumns={['name', 'description', 'variant_a', 'variant_b', 'traffic_split_pct', 'metric', 'start_date', 'end_date']} onUpload={(file) => { toast(file.name + ' uploaded — 8 records will be imported'); setBulkOpen(false); }} />
    </div>
  );
}
