import type { SlotConfig as SlotConfigType } from '../../types';

interface Props {
  config: SlotConfigType;
  onChange: (c: SlotConfigType) => void;
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
const label: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', color: '#666', marginBottom: 6, display: 'block',
};
const inputStyle: React.CSSProperties = {
  width: '100%', height: 32, border: '1px solid #D9D9D9', borderRadius: 0, padding: '0 10px',
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

/* ── Component ──────────────────────────────────────────────────── */

const todColors: Record<string, { bg: string; color: string }> = {
  morning: { bg: '#EBF1FC', color: '#1659CB' },
  afternoon: { bg: '#FFF7E6', color: '#B87900' },
  evening: { bg: '#F3EEFE', color: '#6B21A8' },
};

const strategyDescriptions: Record<string, string> = {
  BALANCED: 'Reservations are evenly distributed across all slots in the window.',
  START: 'Reservations are front-loaded to the earliest available slots.',
  END: 'Reservations are back-loaded to the latest available slots.',
  ALTERNATE: 'Reservations alternate between early and late slots for even coverage.',
};

const businessLines = [
  { key: 'home' as const, name: 'Home Delivery', icon: '🚚', slots: 6, note: 'All time windows available' },
  { key: 'fast' as const, name: 'Fast Delivery', icon: '⚡', slots: 3, note: '2-hour express windows only' },
  { key: 'collect' as const, name: 'Click & Collect', icon: '🏬', slots: 4, note: 'Store opening hours' },
];

export default function SlotConfig({ config, onChange }: Props) {
  const update = (patch: Partial<SlotConfigType>) => onChange({ ...config, ...patch });

  return (
    <div style={{ maxWidth: 900 }}>

      {/* Section 1: Time Window Configuration */}
      <div style={card}>
        <h3 style={sectionTitle}>Time Window Configuration</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: 40 }}>#</th>
              <th style={thStyle}>Start Time</th>
              <th style={thStyle}>End Time</th>
              <th style={thStyle}>Time of Day</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {config.slotsPerDay.map((slot, i) => {
              const tod = todColors[slot.timeOfDay] || todColors.morning;
              return (
                <tr key={i} onMouseEnter={e => (e.currentTarget.style.background = '#F6FCFE')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ ...tdStyle, fontWeight: 600, color: '#999' }}>{i + 1}</td>
                  <td style={{ ...tdStyle, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>{slot.startTime}</td>
                  <td style={{ ...tdStyle, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>{slot.endTime}</td>
                  <td style={tdStyle}>
                    <span style={{ display: 'inline-block', padding: '3px 10px', fontSize: 11, fontWeight: 600, borderRadius: 0, background: tod.bg, color: tod.color, textTransform: 'capitalize' }}>
                      {slot.timeOfDay}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ display: 'inline-block', padding: '3px 10px', fontSize: 11, fontWeight: 600, borderRadius: 0, background: '#E6F9ED', color: '#20B249' }}>Active</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <button type="button" style={{ marginTop: 12, height: 32, padding: '0 16px', border: '1px solid #1659CB', background: 'transparent', color: '#1659CB', fontSize: 13, fontWeight: 600, borderRadius: 0, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
          + Add Time Window
        </button>
      </div>

      {/* Section 2: Capacity & Reservations */}
      <div style={card}>
        <h3 style={sectionTitle}>Capacity & Reservations</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {/* Left column */}
          <div>
            <div style={{ marginBottom: 20 }}>
              <span style={label}>Orders per Slot</span>
              <input type="number" value={config.capacityPerSlot}
                onChange={e => update({ capacityPerSlot: Number(e.target.value) })}
                style={inputStyle}
              />
            </div>
            <div>
              <span style={label}>Cut-off Hours</span>
              <input type="number" value={config.cutOffHoursBefore}
                onChange={e => update({ cutOffHoursBefore: Number(e.target.value) })}
                style={inputStyle}
              />
              <span style={{ fontSize: 11, color: '#999', marginTop: 4, display: 'block' }}>Hours before slot start time</span>
            </div>
          </div>

          {/* Right column */}
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={label}>Reservation Hold-back</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#1659CB', background: '#EBF1FC', padding: '2px 8px', borderRadius: 0 }}>{config.reservationPct}%</span>
              </div>
              <Slider value={config.reservationPct} min={0} max={50} step={1} onChange={v => update({ reservationPct: v })} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#999', marginTop: 4 }}>
                <span>0%</span><span>50%</span>
              </div>
            </div>
            <div>
              <span style={label}>Reservation Strategy</span>
              <select value={config.reservationStrategy}
                onChange={e => update({ reservationStrategy: e.target.value as SlotConfigType['reservationStrategy'] })}
                style={selectStyle}
              >
                <option value="BALANCED">BALANCED</option>
                <option value="START">START</option>
                <option value="END">END</option>
                <option value="ALTERNATE">ALTERNATE</option>
              </select>
              <span style={{ fontSize: 11, color: '#999', marginTop: 4, display: 'block' }}>
                {strategyDescriptions[config.reservationStrategy]}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Business Line Settings */}
      <div style={card}>
        <h3 style={sectionTitle}>Business Line Settings</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {businessLines.map(bl => (
            <div key={bl.key} style={{ border: '1px solid #E8E8E8', borderRadius: 4, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{bl.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{bl.name}</span>
                </div>
                <Toggle checked={true} onChange={() => {}} />
              </div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>{bl.slots} slots configured</div>
              <div style={{ fontSize: 11, color: '#999' }}>{bl.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Save button */}
      <button type="button" style={{
        width: '100%', height: 40, background: '#1659CB', color: '#fff', border: 'none', borderRadius: 0,
        fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif",
      }}>
        Save Configuration
      </button>
    </div>
  );
}
