/* ============================================================
   Shipsy Admin Console — Audit Log Page
   Carrefour Belgium Checkout
   ============================================================ */

import { useState, useMemo } from 'react';
import type { AuditAction, AuditEntry } from '../types';
import { auditLog as seedAuditLog } from '../data';
import {
  Card, SectionTitle, Label, Badge, InfoBox, Button, Select,
  Input, FilterBar, FilterChip, Table, Td, TrHover, FlexRow,
  useToast, T,
} from '../shared';

const actionColor = (a: AuditAction): 'green' | 'blue' | 'red' | 'orange' => {
  switch (a) {
    case 'create': return 'green';
    case 'update': return 'blue';
    case 'delete': return 'red';
    case 'override': return 'orange';
    case 'emergency': return 'red';
  }
};

const fmtTimestamp = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

const avatarInitial = (user: string) => {
  const parts = user.split('@')[0].split('.');
  return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].substring(0, 2).toUpperCase();
};

const PAGE_SIZE = 10;

const allActions: AuditAction[] = ['create', 'update', 'delete', 'override', 'emergency'];

export default function AuditLog() {
  const [entries] = useState<AuditEntry[]>(seedAuditLog);
  const [sectionFilter, setSectionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [actionFilters, setActionFilters] = useState<Set<AuditAction>>(new Set());
  const [page, setPage] = useState(1);
  const { show: toast, Toast } = useToast();

  // Derive unique sections and users
  const sections = useMemo(() => [...new Set(entries.map(e => e.section))].sort(), [entries]);
  const users = useMemo(() => [...new Set(entries.map(e => e.user))].sort(), [entries]);

  const toggleAction = (a: AuditAction) => {
    setActionFilters(prev => {
      const next = new Set(prev);
      if (next.has(a)) next.delete(a); else next.add(a);
      return next;
    });
    setPage(1);
  };

  // Apply filters
  const filtered = useMemo(() => {
    return entries.filter(e => {
      if (sectionFilter !== 'all' && e.section !== sectionFilter) return false;
      if (userFilter !== 'all' && e.user !== userFilter) return false;
      if (actionFilters.size > 0 && !actionFilters.has(e.action)) return false;
      if (dateFrom) {
        const from = new Date(dateFrom);
        if (new Date(e.timestamp) < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (new Date(e.timestamp) > to) return false;
      }
      return true;
    });
  }, [entries, sectionFilter, userFilter, actionFilters, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageEntries = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const showFrom = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showTo = Math.min(page * PAGE_SIZE, filtered.length);

  const handleExport = () => {
    toast('Audit log exported as CSV');
  };

  return (
    <div>
      <Toast />

      <InfoBox>
        All configuration changes are automatically logged. Emergency overrides are highlighted. Audit data is retained for 24 months per GDPR compliance.
      </InfoBox>

      {/* Filter Bar */}
      <FilterBar>
        <div>
          <Label>Section</Label>
          <Select
            value={sectionFilter}
            onChange={v => { setSectionFilter(v); setPage(1); }}
            options={[{ value: 'all', label: 'All Sections' }, ...sections.map(s => ({ value: s, label: s }))]}
            style={{ width: 180 }}
          />
        </div>
        <div>
          <Label>User</Label>
          <Select
            value={userFilter}
            onChange={v => { setUserFilter(v); setPage(1); }}
            options={[{ value: 'all', label: 'All Users' }, ...users.map(u => ({ value: u, label: u.split('@')[0] }))]}
            style={{ width: 160 }}
          />
        </div>
        <div>
          <Label>From</Label>
          <Input type="date" value={dateFrom} onChange={v => { setDateFrom(v); setPage(1); }} style={{ width: 140 }} />
        </div>
        <div>
          <Label>To</Label>
          <Input type="date" value={dateTo} onChange={v => { setDateTo(v); setPage(1); }} style={{ width: 140 }} />
        </div>
      </FilterBar>

      {/* Action Type Chips */}
      <FlexRow gap={8} align="center">
        <span style={{ fontSize: 11, fontWeight: 600, color: T.textSecondary, textTransform: 'uppercase' }}>Action:</span>
        {allActions.map(a => (
          <FilterChip key={a} label={a} active={actionFilters.has(a)} onClick={() => toggleAction(a)} />
        ))}
        {actionFilters.size > 0 && (
          <Button size="sm" variant="ghost" onClick={() => { setActionFilters(new Set()); setPage(1); }}>Clear</Button>
        )}
      </FlexRow>

      <div style={{ height: 12 }} />

      {/* Export + Count */}
      <Card>
        <SectionTitle actions={<Button size="sm" variant="secondary" onClick={handleExport}>Export CSV</Button>}>
          Audit Trail
        </SectionTitle>

        <Table headers={['Timestamp', 'User', 'Section', 'Action', 'Target', 'Before', 'After']}>
          {pageEntries.map(entry => (
            <TrHover key={entry.id}>
              <Td mono style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{fmtTimestamp(entry.timestamp)}</Td>
              <Td>
                <FlexRow gap={8}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: entry.action === 'emergency' ? T.dangerLight : T.primaryLight,
                    color: entry.action === 'emergency' ? T.danger : T.primary,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, flexShrink: 0,
                  }}>
                    {avatarInitial(entry.user)}
                  </div>
                  <span style={{ fontSize: 12, color: T.text }}>{entry.user.split('@')[0]}</span>
                </FlexRow>
              </Td>
              <Td><Badge color="blue">{entry.section}</Badge></Td>
              <Td><Badge color={actionColor(entry.action)}>{entry.action.toUpperCase()}</Badge></Td>
              <Td style={{ fontSize: 12 }}>{entry.target}</Td>
              <Td mono style={{ fontSize: 12, color: T.textMuted }}>{entry.before}</Td>
              <Td mono style={{ fontSize: 12, color: T.text, fontWeight: 600 }}>{entry.after}</Td>
            </TrHover>
          ))}
        </Table>

        {filtered.length === 0 && (
          <div style={{ padding: '30px 0', textAlign: 'center', color: T.textMuted, fontSize: 13 }}>
            No audit entries match the current filters.
          </div>
        )}

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
          <span style={{ fontSize: 12, color: T.textSecondary }}>
            Showing {showFrom}-{showTo} of {filtered.length} entries
          </span>
          <FlexRow gap={4}>
            <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                style={{
                  width: 30, height: 30, borderRadius: 4,
                  border: p === page ? `1px solid ${T.primary}` : `1px solid ${T.border}`,
                  background: p === page ? T.primaryLight : 'transparent',
                  color: p === page ? T.primary : T.textSecondary,
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: T.font,
                }}
              >
                {p}
              </button>
            ))}
            <Button size="sm" variant="ghost" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              Next
            </Button>
          </FlexRow>
        </div>
      </Card>
    </div>
  );
}
