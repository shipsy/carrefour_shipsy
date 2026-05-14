/* ============================================================
   Shipsy Admin Console — Shared UI Components
   Enterprise-grade design system
   ============================================================ */

import { useState, useRef, useEffect, type ReactNode, type CSSProperties } from 'react';

// ── Design Tokens ───────────────────────────────────────────

export const T = {
  primary: '#1659CB',
  primaryLight: '#EBF1FC',
  primaryDark: '#0F1E37',
  success: '#20B249',
  successLight: '#E6F9ED',
  warning: '#F0A105',
  warningLight: '#FFF7E6',
  danger: '#D40B00',
  dangerLight: '#FEF2F2',
  text: '#111',
  textSecondary: '#666',
  textMuted: '#999',
  border: '#E8E8E8',
  bg: '#F5F4F2',
  card: '#fff',
  headerBg: '#F4F9FA',
  font: "'Inter', sans-serif",
  mono: "'JetBrains Mono', monospace",
} as const;

// ── Card ────────────────────────────────────────────────────

export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 6, padding: '20px 24px', marginBottom: 20, ...style }}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text, margin: 0 }}>{children}</h3>
      {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
    </div>
  );
}

// ── Label ───────────────────────────────────────────────────

export function Label({ children }: { children: ReactNode }) {
  return <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', color: T.textSecondary, marginBottom: 6, display: 'block' }}>{children}</span>;
}

// ── Badge ───────────────────────────────────────────────────

export function Badge({ children, color = 'blue' }: { children: ReactNode; color?: 'blue' | 'green' | 'red' | 'orange' | 'gray' | 'purple' }) {
  const colors = {
    blue: { bg: T.primaryLight, text: T.primary },
    green: { bg: T.successLight, text: T.success },
    red: { bg: T.dangerLight, text: T.danger },
    orange: { bg: T.warningLight, text: T.warning },
    gray: { bg: '#F0F0F0', text: T.textSecondary },
    purple: { bg: '#F3EEFE', text: '#6B21A8' },
  };
  const c = colors[color];
  return <span style={{ display: 'inline-block', padding: '3px 10px', fontSize: 11, fontWeight: 600, borderRadius: 4, background: c.bg, color: c.text }}>{children}</span>;
}

export function StatusDot({ status }: { status: 'active' | 'inactive' | 'error' | 'warning' | 'connected' }) {
  const colors: Record<string, string> = { active: T.success, inactive: T.textMuted, error: T.danger, warning: T.warning, connected: T.success };
  return <span style={{ width: 8, height: 8, borderRadius: '50%', background: colors[status] || T.textMuted, display: 'inline-block', flexShrink: 0 }} />;
}

// ── Toggle ──────────────────────────────────────────────────

export function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={checked} disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      style={{ position: 'relative', width: 40, height: 22, borderRadius: 11, border: 'none', background: checked ? T.primary : '#D9D9D9', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'background 0.2s', flexShrink: 0, opacity: disabled ? 0.5 : 1 }}>
      <span style={{ position: 'absolute', top: 2, left: checked ? 20 : 2, width: 18, height: 18, borderRadius: 9, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
    </button>
  );
}

// ── Slider ──────────────────────────────────────────────────

export function Slider({ value, min, max, step, onChange, color = T.primary }: { value: number; min: number; max: number; step: number; onChange: (v: number) => void; color?: string }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(Number(e.target.value))}
      style={{ width: '100%', height: 6, appearance: 'none', WebkitAppearance: 'none', background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, #E8E8E8 ${pct}%, #E8E8E8 100%)`, borderRadius: 3, outline: 'none', cursor: 'pointer' }} />
  );
}

// ── Input ───────────────────────────────────────────────────

const inputBase: CSSProperties = { height: 34, border: `1px solid ${T.border}`, borderRadius: 4, padding: '0 10px', fontSize: 13, fontFamily: T.font, outline: 'none', boxSizing: 'border-box' as const, transition: 'border-color 0.15s' };

export function Input({ value, onChange, type = 'text', placeholder, style, disabled, prefix }: { value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string; style?: CSSProperties; disabled?: boolean; prefix?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {prefix && <span style={{ fontSize: 12, color: T.textSecondary, fontWeight: 600 }}>{prefix}</span>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
        style={{ ...inputBase, width: '100%', opacity: disabled ? 0.5 : 1, ...style }}
        onFocus={e => { e.currentTarget.style.borderColor = T.primary; }}
        onBlur={e => { e.currentTarget.style.borderColor = T.border; }} />
    </div>
  );
}

export function Select({ value, onChange, options, style, disabled }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; style?: CSSProperties; disabled?: boolean }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
      style={{ ...inputBase, background: T.card, appearance: 'auto' as const, opacity: disabled ? 0.5 : 1, ...style }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function Textarea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ ...inputBase, height: 'auto', padding: '8px 10px', resize: 'vertical', width: '100%' }}
      onFocus={e => { e.currentTarget.style.borderColor = T.primary; }}
      onBlur={e => { e.currentTarget.style.borderColor = T.border; }} />
  );
}

// ── Buttons ─────────────────────────────────────────────────

export function Button({ children, onClick, variant = 'primary', size = 'md', disabled, style }: { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; size?: 'sm' | 'md'; disabled?: boolean; style?: CSSProperties }) {
  const variants = {
    primary: { bg: T.primary, color: '#fff', border: 'none' },
    secondary: { bg: 'transparent', color: T.primary, border: `1px solid ${T.primary}` },
    danger: { bg: T.dangerLight, color: T.danger, border: `1px solid #FECACA` },
    ghost: { bg: 'transparent', color: T.textSecondary, border: 'none' },
  };
  const v = variants[variant];
  const h = size === 'sm' ? 30 : 36;
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      style={{ height: h, padding: size === 'sm' ? '0 12px' : '0 18px', background: v.bg, color: v.color, border: v.border, borderRadius: 4, fontSize: size === 'sm' ? 12 : 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: T.font, display: 'inline-flex', alignItems: 'center', gap: 6, opacity: disabled ? 0.5 : 1, transition: 'opacity 0.15s', ...style }}>
      {children}
    </button>
  );
}

// ── Table ───────────────────────────────────────────────────

const thStyle: CSSProperties = { textAlign: 'left', padding: '10px 12px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', color: T.textSecondary, background: T.headerBg, borderBottom: `1px solid ${T.border}` };
const tdBase: CSSProperties = { padding: '10px 12px', fontSize: 13, color: '#333', borderBottom: '1px solid #F0F0F0' };

export function Table({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead><tr>{headers.map((h, i) => <th key={i} style={thStyle}>{h}</th>)}</tr></thead>
      <tbody>{children}</tbody>
    </table>
  );
}

export function Td({ children, style, mono }: { children: ReactNode; style?: CSSProperties; mono?: boolean }) {
  return <td style={{ ...tdBase, fontFamily: mono ? T.mono : T.font, fontWeight: mono ? 500 : 400, ...style }}>{children}</td>;
}

export function TrHover({ children }: { children: ReactNode }) {
  return (
    <tr onMouseEnter={e => { e.currentTarget.style.background = '#F6FCFE'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
      {children}
    </tr>
  );
}

// ── Tabs ────────────────────────────────────────────────────

export function TabBar({ tabs, active, onChange }: { tabs: { id: string; label: string }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${T.border}`, marginBottom: 20 }}>
      {tabs.map(t => (
        <button key={t.id} type="button" onClick={() => onChange(t.id)}
          style={{ padding: '10px 18px', border: 'none', background: 'none', fontSize: 13, fontWeight: active === t.id ? 700 : 500, color: active === t.id ? T.primary : T.textSecondary, borderBottom: `2px solid ${active === t.id ? T.primary : 'transparent'}`, cursor: 'pointer', fontFamily: T.font, transition: 'color 0.15s' }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ── Filter Bar ──────────────────────────────────────────────

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: T.headerBg, borderRadius: 6, marginBottom: 16, flexWrap: 'wrap' }}>
      {children}
    </div>
  );
}

export function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      style={{ padding: '5px 14px', borderRadius: 20, border: `1px solid ${active ? T.primary : T.border}`, background: active ? T.primaryLight : T.card, color: active ? T.primary : T.textSecondary, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: T.font, transition: 'all 0.15s' }}>
      {label}
    </button>
  );
}

// ── Modal ───────────────────────────────────────────────────

export function Modal({ open, onClose, title, children, width = 560 }: { open: boolean; onClose: () => void; title: string; children: ReactNode; width?: number }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.55)' }} onClick={onClose}>
      <div style={{ background: T.card, borderRadius: 10, width: '100%', maxWidth: width, maxHeight: '80vh', overflow: 'auto', boxShadow: '0 10px 40px rgba(15,23,42,0.18)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', borderBottom: `1px solid ${T.border}` }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.text }}>{title}</h3>
          <span style={{ cursor: 'pointer', fontSize: 20, color: T.textMuted, lineHeight: 1 }} onClick={onClose}>&times;</span>
        </div>
        <div style={{ padding: '20px 22px' }}>{children}</div>
      </div>
    </div>
  );
}

// ── Empty State ─────────────────────────────────────────────

export function EmptyState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', color: T.textMuted, fontSize: 13 }}>
      <div style={{ marginBottom: action ? 12 : 0 }}>{message}</div>
      {action}
    </div>
  );
}

// ── Stat Card ───────────────────────────────────────────────

export function StatCard({ label, value, sub, color = T.primary }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 6, padding: '16px 20px', flex: 1, minWidth: 140 }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', color: T.textSecondary, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color, fontFamily: T.mono }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ── InfoBox ─────────────────────────────────────────────────

export function InfoBox({ children, type = 'info' }: { children: ReactNode; type?: 'info' | 'warning' | 'success' | 'error' }) {
  const styles = {
    info: { bg: T.primaryLight, border: '#C7D9F5', color: T.primary },
    warning: { bg: T.warningLight, border: '#FDE68A', color: '#92400E' },
    success: { bg: T.successLight, border: '#BBF7D0', color: '#065F46' },
    error: { bg: T.dangerLight, border: '#FECACA', color: T.danger },
  };
  const s = styles[type];
  return <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 6, padding: '12px 16px', fontSize: 12, color: s.color, lineHeight: 1.5, marginBottom: 12 }}>{children}</div>;
}

// ── Toast ───────────────────────────────────────────────────

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const show = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  const Toast = () => toast ? (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 300, background: toast.type === 'success' ? '#065F46' : T.danger, color: '#fff', padding: '12px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', animation: 'fadeIn 0.2s' }}>
      {toast.type === 'success' ? '\u2713' : '\u2717'} {toast.message}
    </div>
  ) : null;
  return { show, Toast };
}

// ── Grid Layouts ────────────────────────────────────────────

export function Grid2({ children }: { children: ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>{children}</div>;
}

export function Grid3({ children }: { children: ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>{children}</div>;
}

export function FlexRow({ children, gap = 12, align = 'center', justify }: { children: ReactNode; gap?: number; align?: string; justify?: string }) {
  return <div style={{ display: 'flex', alignItems: align, justifyContent: justify, gap, flexWrap: 'wrap' as const }}>{children}</div>;
}

// ── Add Button (Single / Bulk dropdown) ─────────────────────

export function AddButton({ label, onSingle, onBulk, size = 'md' }: { label: string; onSingle: () => void; onBulk: () => void; size?: 'sm' | 'md' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const h = size === 'sm' ? 30 : 36;
  const fs = size === 'sm' ? 12 : 13;

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button type="button" onClick={() => setOpen(!open)}
        style={{ height: h, padding: size === 'sm' ? '0 12px' : '0 18px', background: T.primary, color: '#fff', border: 'none', borderRadius: 4, fontSize: fs, fontWeight: 600, cursor: 'pointer', fontFamily: T.font, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {label} <span style={{ fontSize: 10, marginLeft: 2 }}>{open ? '\u25B2' : '\u25BC'}</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: T.card, border: `1px solid ${T.border}`, borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 50, minWidth: 200, overflow: 'hidden' }}>
          <button type="button"
            onClick={() => { setOpen(false); onSingle(); }}
            onMouseEnter={e => { e.currentTarget.style.background = T.primaryLight; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: T.font, fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 28, height: 28, borderRadius: 6, background: T.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>+</span>
            <div>
              <div style={{ fontWeight: 600, color: T.text }}>Single Entry</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>Add one record manually</div>
            </div>
          </button>
          <div style={{ height: 1, background: T.border }} />
          <button type="button"
            onClick={() => { setOpen(false); onBulk(); }}
            onMouseEnter={e => { e.currentTarget.style.background = T.primaryLight; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: T.font, fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 28, height: 28, borderRadius: 6, background: '#E6F9ED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>&#8593;</span>
            <div>
              <div style={{ fontWeight: 600, color: T.text }}>Bulk Upload</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>Import from CSV or Excel</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

// ── Bulk Upload Modal ───────────────────────────────────────

export function BulkUploadModal({ open, onClose, entityName, sampleColumns, onUpload }: { open: boolean; onClose: () => void; entityName: string; sampleColumns: string[]; onUpload: (file: File) => void }) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setSelectedFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleUpload = () => {
    if (selectedFile) { onUpload(selectedFile); setSelectedFile(null); onClose(); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.55)' }} onClick={onClose}>
      <div style={{ background: T.card, borderRadius: 10, width: '100%', maxWidth: 580, boxShadow: '0 10px 40px rgba(15,23,42,0.18)' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', borderBottom: `1px solid ${T.border}` }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.text }}>Bulk Upload {entityName}</h3>
          <span style={{ cursor: 'pointer', fontSize: 20, color: T.textMuted, lineHeight: 1 }} onClick={onClose}>&times;</span>
        </div>

        <div style={{ padding: '20px 22px' }}>
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? T.primary : T.border}`,
              borderRadius: 8,
              padding: '32px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragOver ? T.primaryLight : '#FAFBFC',
              transition: 'all 0.15s',
              marginBottom: 16,
            }}
          >
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} style={{ display: 'none' }} />
            <div style={{ fontSize: 32, marginBottom: 8 }}>{selectedFile ? '\u2705' : '\u{1F4C4}'}</div>
            {selectedFile ? (
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{selectedFile.name}</div>
                <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>{(selectedFile.size / 1024).toFixed(1)} KB &middot; Click to change</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>Drop your file here, or click to browse</div>
                <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>Supports .csv, .xlsx, and .xls files</div>
              </div>
            )}
          </div>

          {/* Expected format */}
          <div style={{ background: T.headerBg, borderRadius: 6, padding: '14px 16px', marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 8 }}>Expected Columns</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {sampleColumns.map(col => (
                <span key={col} style={{ display: 'inline-block', padding: '3px 10px', fontSize: 11, fontWeight: 600, borderRadius: 4, background: T.primaryLight, color: T.primary, fontFamily: T.mono }}>{col}</span>
              ))}
            </div>
          </div>

          {/* Download template */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <span style={{ fontSize: 13, color: T.primary, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>Download template (.csv)</span>
            <span style={{ fontSize: 11, color: T.textMuted }}>Pre-formatted with all required columns</span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" onClick={() => { setSelectedFile(null); onClose(); }}
              style={{ height: 36, padding: '0 18px', background: 'transparent', color: T.primary, border: `1px solid ${T.primary}`, borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: T.font }}>Cancel</button>
            <button type="button" onClick={handleUpload} disabled={!selectedFile}
              style={{ height: 36, padding: '0 18px', background: selectedFile ? T.primary : '#CFD4DA', color: '#fff', border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: selectedFile ? 'pointer' : 'not-allowed', fontFamily: T.font }}>
              Upload &amp; Import
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
