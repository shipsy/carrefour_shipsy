import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { YieldConfig as YieldConfigType, DeliveryMethod, TimeOfDay } from '../../types';

interface Props {
  config: YieldConfigType;
  onChange: (c: YieldConfigType) => void;
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
const inputStyle: React.CSSProperties = {
  height: 32, border: '1px solid #D9D9D9', borderRadius: 0, padding: '0 10px',
  fontSize: 13, fontFamily: "'Inter', sans-serif", outline: 'none', boxSizing: 'border-box',
};
const selectStyle: React.CSSProperties = {
  ...inputStyle, background: '#fff', appearance: 'auto',
};
const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: '10px 12px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.3px', color: '#666', background: '#F4F9FA', borderBottom: '1px solid #E8E8E8',
};
const tdStyle: React.CSSProperties = {
  padding: '10px 12px', fontSize: 13, color: '#333', borderBottom: '1px solid #F0F0F0',
};
const badge = (bg: string, color: string): React.CSSProperties => ({
  display: 'inline-block', padding: '2px 8px', fontSize: 12, fontWeight: 700, background: bg, color, borderRadius: 0,
});

/* ── Data ───────────────────────────────────────────────────────── */

const deliveryMethods: { key: DeliveryMethod; label: string }[] = [
  { key: 'home', label: 'Home Delivery' },
  { key: 'fast', label: 'Fast Delivery' },
  { key: 'collect', label: 'Click & Collect' },
];

const todKeys: { key: TimeOfDay; label: string }[] = [
  { key: 'morning', label: 'Morning' },
  { key: 'afternoon', label: 'Afternoon' },
  { key: 'evening', label: 'Evening' },
];

const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/* ── Component ──────────────────────────────────────────────────── */

export default function YieldConfig({ config, onChange }: Props) {
  const [overrideDay, setOverrideDay] = useState('Monday');
  const [overrideTod, setOverrideTod] = useState<TimeOfDay>('morning');
  const [overridePrice, setOverridePrice] = useState('');

  const update = (patch: Partial<YieldConfigType>) => onChange({ ...config, ...patch });
  const updateBaseFee = (method: DeliveryMethod, value: number) => update({ baseFees: { ...config.baseFees, [method]: value } });
  const updateFloorPrice = (method: DeliveryMethod, value: number) => update({ floorPrices: { ...config.floorPrices, [method]: value } });
  const updateTodWeight = (tod: TimeOfDay, value: number) => update({ timeOfDayWeights: { ...config.timeOfDayWeights, [tod]: value } });

  const addOverride = () => {
    const key = `${overrideDay}-${overrideTod}`;
    const price = parseFloat(overridePrice);
    if (!isNaN(price)) {
      update({ manualOverrides: { ...config.manualOverrides, [key]: price } });
      setOverridePrice('');
    }
  };
  const removeOverride = (key: string) => {
    const next = { ...config.manualOverrides };
    delete next[key];
    update({ manualOverrides: next });
  };

  /* Price calculation helper */
  const calcFee = (capacityPct: number, tod: TimeOfDay, isGreen: boolean) => {
    const base = config.baseFees.home;
    const todW = config.timeOfDayWeights[tod];
    const demandAdj = 1 + (capacityPct / 100) * config.maxDemandFactor;
    let fee = base * todW * demandAdj;
    const isSurge = capacityPct >= config.surgeThreshold;
    if (isSurge) fee += config.surgeFlatAmount;
    if (isGreen && config.greenDiscountPct > 0) fee -= fee * (config.greenDiscountPct / 100);
    fee = Math.max(fee, config.floorPrices.home);
    if (config.psychologicalRounding) fee = Math.floor(fee) + 0.99;
    return { fee: parseFloat(fee.toFixed(2)), isSurge };
  };

  /* Preview data */
  const previewSlots = [
    { time: '10:00 - 12:00', tod: 'morning' as TimeOfDay, capacity: 45, isGreen: true },
    { time: '14:00 - 16:00', tod: 'afternoon' as TimeOfDay, capacity: 55, isGreen: false },
    { time: '18:00 - 20:00', tod: 'evening' as TimeOfDay, capacity: 92, isGreen: false },
  ];

  /* Bar chart relative heights */
  const maxWeight = Math.max(...todKeys.map(t => config.timeOfDayWeights[t.key]));

  return (
    <div style={{ maxWidth: 960 }}>

      {/* Section 1: Rate Card Configuration */}
      <div style={card}>
        <h3 style={sectionTitle}>Rate Card Configuration</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Business Line</th>
              <th style={thStyle}>Base Delivery Fee (EUR)</th>
              <th style={thStyle}>Floor Price (EUR)</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {deliveryMethods.map(m => {
              const isCC = m.key === 'collect';
              return (
                <tr key={m.key} onMouseEnter={e => (e.currentTarget.style.background = '#F6FCFE')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{m.label}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 13, color: '#666' }}>EUR</span>
                      <input type="number" step="0.01" value={config.baseFees[m.key]}
                        onChange={e => updateBaseFee(m.key, Number(e.target.value))}
                        disabled={isCC}
                        style={{ ...inputStyle, width: 100, opacity: isCC ? 0.4 : 1 }}
                      />
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 13, color: '#666' }}>EUR</span>
                      <input type="number" step="0.01" value={config.floorPrices[m.key]}
                        onChange={e => updateFloorPrice(m.key, Number(e.target.value))}
                        disabled={isCC}
                        style={{ ...inputStyle, width: 100, opacity: isCC ? 0.4 : 1 }}
                      />
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={badge(isCC ? '#F0F0F0' : '#E6F9ED', isCC ? '#999' : '#20B249')}>
                      {isCC ? 'Free' : 'Active'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Section 2: Dynamic Pricing Rules */}
      <div style={card}>
        <h3 style={sectionTitle}>Dynamic Pricing Rules</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>

          {/* Left: Time-of-Day Multipliers */}
          <div>
            <span style={labelStyle}>Time-of-Day Multipliers</span>
            {todKeys.map(({ key, label }) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#333' }}>{label}</span>
                  <span style={badge('#EBF1FC', '#1659CB')}>{config.timeOfDayWeights[key].toFixed(1)}x</span>
                </div>
                <Slider value={config.timeOfDayWeights[key]} min={0.5} max={2.0} step={0.05} onChange={v => updateTodWeight(key, v)} />
              </div>
            ))}
            {/* Mini bar chart */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginTop: 8, padding: '12px 0' }}>
              {todKeys.map(({ key, label }) => {
                const w = config.timeOfDayWeights[key];
                const h = (w / maxWeight) * 48;
                return (
                  <div key={key} style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ height: 48, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                      <div style={{ width: 28, height: h, background: '#1659CB', borderRadius: '2px 2px 0 0', transition: 'height 0.3s' }} />
                    </div>
                    <span style={{ fontSize: 10, color: '#999', marginTop: 4, display: 'block' }}>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Demand Factor */}
          <div>
            <span style={labelStyle}>Demand Factor</span>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#333' }}>Max Demand Multiplier</span>
                <span style={badge('#EBF1FC', '#1659CB')}>{config.maxDemandFactor.toFixed(1)}</span>
              </div>
              <Slider value={config.maxDemandFactor} min={0} max={1} step={0.05} onChange={v => update({ maxDemandFactor: v })} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#999', marginTop: 4 }}>
                <span>0.0</span><span>1.0</span>
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#666', lineHeight: 1.5, margin: '12px 0' }}>
              Scales delivery fee based on slot capacity utilization. Higher values create steeper pricing curves for high-demand slots.
            </p>
            <div style={{ background: '#F4F9FA', padding: 12, borderLeft: '3px solid #1659CB', fontSize: 12, color: '#333', fontFamily: "'JetBrains Mono', monospace" }}>
              Fee = Base x (1 + capacity% x {config.maxDemandFactor.toFixed(1)})
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Surge Pricing */}
      <div style={card}>
        <h3 style={sectionTitle}>Surge Pricing</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {/* Left: Threshold */}
          <div>
            <span style={labelStyle}>Surge Threshold</span>
            <div style={{ fontSize: 36, fontWeight: 800, color: config.surgeThreshold >= 80 ? '#D40B00' : '#1659CB', marginBottom: 12 }}>
              {config.surgeThreshold}%
            </div>
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <Slider value={config.surgeThreshold} min={0} max={100} step={1} onChange={v => update({ surgeThreshold: v })} color={config.surgeThreshold >= 80 ? '#D40B00' : '#1659CB'} />
              {/* Red zone indicator */}
              <div style={{
                position: 'absolute', top: -2, right: 0,
                width: `${100 - config.surgeThreshold}%`, height: 10,
                background: 'rgba(212, 11, 0, 0.08)', pointerEvents: 'none',
              }} />
            </div>
            <p style={{ fontSize: 11, color: '#999', lineHeight: 1.4 }}>
              Surge activates when slot capacity exceeds this threshold
            </p>
          </div>

          {/* Right: Amount */}
          <div>
            <span style={labelStyle}>Surge Amount</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#333' }}>EUR</span>
              <input type="number" step="0.50" value={config.surgeFlatAmount}
                onChange={e => update({ surgeFlatAmount: Number(e.target.value) })}
                style={{ ...inputStyle, width: 120, fontSize: 16, fontWeight: 700 }}
              />
            </div>
            <p style={{ fontSize: 11, color: '#999', marginBottom: 16 }}>Flat amount added to delivery fee during surge</p>
            <div style={{ background: '#FFF5F5', border: '1px solid #FECACA', padding: 12, fontSize: 12, color: '#333' }}>
              <span style={{ fontWeight: 600 }}>Preview: </span>
              Evening slot at 90% capacity<br />
              Base EUR{config.baseFees.home.toFixed(2)} + Surge EUR{config.surgeFlatAmount.toFixed(2)} = <strong>EUR{(config.baseFees.home + config.surgeFlatAmount).toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Green / Eco Incentives */}
      <div style={card}>
        <h3 style={sectionTitle}>Green / Eco Incentives</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <Toggle checked={config.greenDiscountPct > 0} onChange={v => update({ greenDiscountPct: v ? 25 : 0 })} />
          <span style={{ fontSize: 13, fontWeight: 600, color: config.greenDiscountPct > 0 ? '#20B249' : '#999' }}>
            {config.greenDiscountPct > 0 ? 'Eco discount enabled' : 'Eco discount disabled'}
          </span>
        </div>
        {config.greenDiscountPct > 0 && (
          <>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={labelStyle}>Discount Percentage</span>
                <span style={badge('#E6F9ED', '#20B249')}>{config.greenDiscountPct}%</span>
              </div>
              <Slider value={config.greenDiscountPct} min={1} max={50} step={1} onChange={v => update({ greenDiscountPct: v })} color="#20B249" />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#999', marginTop: 4 }}>
                <span>1%</span><span>50%</span>
              </div>
            </div>
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: 12, fontSize: 12, color: '#333', marginBottom: 12 }}>
              <span style={{ fontWeight: 600, color: '#20B249' }}>Preview: </span>
              Green slot discount: EUR{config.baseFees.home.toFixed(2)} x {config.greenDiscountPct}% = -EUR{(config.baseFees.home * config.greenDiscountPct / 100).toFixed(2)} = <strong>EUR{(config.baseFees.home * (1 - config.greenDiscountPct / 100)).toFixed(2)}</strong>
            </div>
            <p style={{ fontSize: 11, color: '#999', lineHeight: 1.4 }}>
              Applied to slots where a delivery vehicle is already in the customer's neighbourhood
            </p>
          </>
        )}
      </div>

      {/* Section 5: Price Display */}
      <div style={card}>
        <h3 style={sectionTitle}>Price Display</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <Toggle checked={config.psychologicalRounding} onChange={v => update({ psychologicalRounding: v })} />
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>Psychological Rounding</span>
            <p style={{ fontSize: 11, color: '#999', margin: '2px 0 0 0' }}>Round delivery fees to end in .99 or .49</p>
          </div>
        </div>
        {config.psychologicalRounding && (
          <div style={{ background: '#F4F9FA', padding: 12, fontSize: 13, color: '#333', fontFamily: "'JetBrains Mono', monospace" }}>
            EUR5.03 → <strong>EUR4.99</strong> &nbsp;|&nbsp; EUR6.70 → <strong>EUR6.49</strong>
          </div>
        )}
      </div>

      {/* Section 6: Manual Price Overrides */}
      <div style={card}>
        <h3 style={sectionTitle}>Manual Price Overrides</h3>

        {/* Active overrides table */}
        {Object.keys(config.manualOverrides).length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
            <thead>
              <tr>
                <th style={thStyle}>Day</th>
                <th style={thStyle}>Time</th>
                <th style={thStyle}>Override Price</th>
                <th style={{ ...thStyle, width: 80 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(config.manualOverrides).map(([key, price]) => {
                const [day, tod] = key.split('-');
                return (
                  <tr key={key} onMouseEnter={e => (e.currentTarget.style.background = '#F6FCFE')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={tdStyle}>{day}</td>
                    <td style={{ ...tdStyle, textTransform: 'capitalize' }}>{tod}</td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>EUR{price.toFixed(2)}</td>
                    <td style={tdStyle}>
                      <button type="button" onClick={() => removeOverride(key)}
                        style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#D40B00', padding: '4px 10px', fontSize: 11, fontWeight: 600, borderRadius: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Inter', sans-serif" }}>
                        <Trash2 size={12} /> Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '24px 0', textAlign: 'center', color: '#999', fontSize: 13, borderBottom: '1px solid #F0F0F0', marginBottom: 16 }}>
            No manual overrides active
          </div>
        )}

        {/* Add override form */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
          <div>
            <span style={labelStyle}>Day</span>
            <select value={overrideDay} onChange={e => setOverrideDay(e.target.value)} style={{ ...selectStyle, width: 140 }}>
              {dayOptions.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <span style={labelStyle}>Time of Day</span>
            <select value={overrideTod} onChange={e => setOverrideTod(e.target.value as TimeOfDay)} style={{ ...selectStyle, width: 130 }}>
              {todKeys.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <span style={labelStyle}>Price (EUR)</span>
            <input type="number" step="0.01" value={overridePrice} onChange={e => setOverridePrice(e.target.value)}
              style={{ ...inputStyle, width: 100 }}
            />
          </div>
          <button type="button" onClick={addOverride}
            style={{ height: 32, padding: '0 20px', background: '#1659CB', color: '#fff', border: 'none', borderRadius: 0, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
            Apply
          </button>
        </div>
      </div>

      {/* Section 7: Live Price Preview */}
      <div style={{ ...card, background: '#EBF1FC', border: '1px solid #C7D9F5' }}>
        <h3 style={sectionTitle}>Live Price Preview</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {previewSlots.map(slot => {
            const { fee, isSurge } = calcFee(slot.capacity, slot.tod, slot.isGreen);
            const capColor = slot.capacity < 50 ? '#20B249' : slot.capacity < 80 ? '#F0A105' : '#D40B00';
            return (
              <div key={slot.time} style={{ background: '#fff', padding: 16, border: '1px solid #E8E8E8', borderRadius: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 8 }}>{slot.time}</div>

                {/* Capacity bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ flex: 1, height: 6, background: '#E8E8E8', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${slot.capacity}%`, height: '100%', background: capColor, borderRadius: 3, transition: 'width 0.3s' }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: capColor }}>{slot.capacity}%</span>
                </div>

                {/* Fee */}
                <div style={{ fontSize: 24, fontWeight: 800, color: '#1659CB', marginBottom: 8 }}>
                  EUR{fee.toFixed(2)}
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  <span style={badge('#F4F9FA', '#666')}>{config.timeOfDayWeights[slot.tod].toFixed(1)}x ToD</span>
                  {slot.isGreen && <span style={badge('#E6F9ED', '#20B249')}>Eco -{config.greenDiscountPct}%</span>}
                  {isSurge && <span style={badge('#FEF2F2', '#D40B00')}>Surge +EUR{config.surgeFlatAmount.toFixed(2)}</span>}
                  {config.psychologicalRounding && <span style={badge('#F4F9FA', '#666')}>.99</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
