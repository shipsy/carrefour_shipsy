import type { AllocationConfig as AllocationConfigType } from '../../types';

interface Props {
  config: AllocationConfigType;
  onChange: (c: AllocationConfigType) => void;
}

/* ── Shared components ──────────────────────────────────────────── */

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        position: 'relative', width: 40, height: 22, borderRadius: 11, border: 'none',
        background: checked ? '#1659CB' : '#D9D9D9', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: checked ? 20 : 2, width: 18, height: 18,
        borderRadius: 9, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s',
      }} />
    </button>
  );
}

function Slider({ value, min, max, step, onChange, color = '#1659CB' }: { value: number; min: number; max: number; step: number; onChange: (v: number) => void; color?: string }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(Number(e.target.value))}
      style={{ width: '100%', height: 6, appearance: 'none', WebkitAppearance: 'none',
        background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, #E8E8E8 ${pct}%, #E8E8E8 100%)`,
        borderRadius: 3, outline: 'none', cursor: 'pointer',
      }}
    />
  );
}

/* ── Styles ─────────────────────────────────────────────────────── */

const card: React.CSSProperties = {
  background: '#fff', border: '1px solid #E8E8E8', borderRadius: 4, padding: '20px 24px', marginBottom: 20,
};
const sectionTitle: React.CSSProperties = {
  fontSize: 16, fontWeight: 700, color: '#111', margin: '0 0 16px 0',
};
const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', color: '#666', marginBottom: 6, display: 'block',
};

/* ── Data ───────────────────────────────────────────────────────── */

const homePartners = [
  { name: 'bpost', desc: 'National postal service' },
  { name: 'DHL Express', desc: 'Express parcel delivery' },
];

const fastPartners = [
  { name: 'Gorillas', desc: 'Electric cargo bike', rank: 1 },
  { name: 'Flink', desc: 'Ultra-fast grocery', rank: 2 },
  { name: 'Deliveroo', desc: 'On-demand courier', rank: 3 },
];

/* ── Component ──────────────────────────────────────────────────── */

export default function AllocationConfig({ config, onChange }: Props) {
  const ownPct = config.homeDelivery.ownFleetPct;
  const thirdPct = 100 - ownPct;

  const updateOwnFleetPct = (pct: number) => {
    onChange({ ...config, homeDelivery: { ...config.homeDelivery, ownFleetPct: pct } });
  };

  const toggleHomePartner = (partner: string) => {
    const current = config.homeDelivery.partners;
    const next = current.includes(partner) ? current.filter(p => p !== partner) : [...current, partner];
    onChange({ ...config, homeDelivery: { ...config.homeDelivery, partners: next } });
  };

  const toggleFastPartner = (partner: string) => {
    const current = config.fastDelivery.partners;
    const next = current.includes(partner) ? current.filter(p => p !== partner) : [...current, partner];
    onChange({ ...config, fastDelivery: { ...config.fastDelivery, partners: next } });
  };

  return (
    <div style={{ maxWidth: 900 }}>

      {/* Section 1: Home Delivery Fleet Split */}
      <div style={card}>
        <h3 style={sectionTitle}>Home Delivery Fleet Split</h3>

        {/* Visual split bar */}
        <div style={{ display: 'flex', height: 40, borderRadius: 4, overflow: 'hidden', marginBottom: 8, border: '1px solid #E8E8E8' }}>
          <div style={{ width: `${ownPct}%`, background: '#1659CB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, transition: 'width 0.3s', minWidth: ownPct > 10 ? undefined : 0 }}>
            {ownPct >= 15 && `${ownPct}% Own Fleet`}
          </div>
          <div style={{ width: `${thirdPct}%`, background: '#FF6B00', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, transition: 'width 0.3s', minWidth: thirdPct > 10 ? undefined : 0 }}>
            {thirdPct >= 15 && `${thirdPct}% 3PL`}
          </div>
        </div>

        {/* Slider */}
        <div style={{ marginBottom: 24 }}>
          <Slider value={ownPct} min={0} max={100} step={5} onChange={updateOwnFleetPct} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#999', marginTop: 4 }}>
            <span>0% Own</span><span>100% Own</span>
          </div>
        </div>

        {/* Two columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Own Fleet */}
          <div style={{ border: '1px solid #E8E8E8', borderRadius: 4, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 20 }}>🚚</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>Carrefour Fleet</span>
            </div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
              <span style={{ fontWeight: 600 }}>{ownPct}%</span> of orders allocated
            </div>
            <div style={{ fontSize: 11, color: '#999' }}>Internal fleet with branded vehicles</div>
          </div>

          {/* 3PL Partners */}
          <div>
            <span style={labelStyle}>3PL Partners</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {homePartners.map(p => {
                const enabled = config.homeDelivery.partners.includes(p.name);
                return (
                  <div key={p.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: '1px solid #E8E8E8', borderRadius: 4, background: enabled ? '#fff' : '#FAFAFA' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: '#999' }}>{p.desc}</div>
                    </div>
                    <Toggle checked={enabled} onChange={() => toggleHomePartner(p.name)} />
                  </div>
                );
              })}
              <button type="button" style={{
                height: 32, padding: '0 16px', border: '1px solid #1659CB', background: 'transparent',
                color: '#1659CB', fontSize: 13, fontWeight: 600, borderRadius: 0, cursor: 'pointer', fontFamily: "'Inter', sans-serif",
              }}>
                + Add Partner
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Fast Delivery Partners */}
      <div style={card}>
        <h3 style={sectionTitle}>Fast Delivery Partners</h3>
        <p style={{ fontSize: 11, color: '#999', marginBottom: 16 }}>Orders allocated to first available partner in priority order</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {fastPartners.map(p => {
            const enabled = config.fastDelivery.partners.includes(p.name);
            return (
              <div key={p.name} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', border: '1px solid #E8E8E8', borderRadius: 4, background: '#fff',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 12, background: '#EBF1FC', color: '#1659CB',
                    fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {p.rank}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: '#999' }}>{p.desc}</div>
                  </div>
                </div>
                <Toggle checked={enabled} onChange={() => toggleFastPartner(p.name)} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Click & Collect */}
      <div style={{ ...card, background: '#FAFAFA', border: '1px solid #E8E8E8' }}>
        <h3 style={sectionTitle}>Click & Collect</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 16, background: '#E6F9ED', color: '#20B249',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>
            ✓
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#333' }}>Store Pickup</span>
        </div>
        <p style={{ fontSize: 13, color: '#999', margin: 0 }}>
          No fleet allocation required — customer collects from selected store
        </p>
      </div>
    </div>
  );
}
