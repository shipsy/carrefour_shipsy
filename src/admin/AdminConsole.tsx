import { useState, useEffect } from 'react';
import { Drawer, Tooltip, Badge as AntBadge, Avatar, Dropdown } from 'antd';
import {
  CalendarOutlined, LineChartOutlined, EnvironmentOutlined,
  ShopOutlined, TeamOutlined, ScheduleOutlined,
  AppstoreOutlined, BlockOutlined, ExperimentOutlined,
  SettingOutlined, AuditOutlined, QuestionCircleOutlined,
  ClockCircleOutlined, BellOutlined, DollarOutlined,
  AlertOutlined, ToolOutlined, LogoutOutlined,
  SwapOutlined, ReloadOutlined,
} from '@ant-design/icons';

import SlotManagement from './pages/SlotManagement';
import YieldManagement from './pages/YieldManagement';
import ZoneManagement from './pages/ZoneManagement';
import StoreManagement from './pages/StoreManagement';
import CustomerSegments from './pages/CustomerSegments';
import EmergencyOverrides from './pages/EmergencyOverrides';
import HolidayCalendar from './pages/HolidayCalendar';
import SlotTemplates from './pages/SlotTemplates';
import BulkOperations from './pages/BulkOperations';
import ABTesting from './pages/ABTesting';
import SystemConfig from './pages/SystemConfig';
import AuditLog from './pages/AuditLog';

const NAVBAR_H = 44;
const TABBAR_H = 40;
const LEFT_W = 220;
const RIGHT_W = 240;

const C = {
  navbar: '#1B2638',
  drawerLeft: '#2B3A52',
  drawerLeftActive: '#4B7BEC',
  drawerLeftHover: 'rgba(255,255,255,0.06)',
  drawerRight: '#FFFFFF',
  drawerRightActiveBg: '#EBF1FC',
  drawerRightActiveBorder: '#4B7BEC',
  drawerRightActiveText: '#4B7BEC',
  drawerRightText: '#444',
  drawerRightIcon: '#AAA',
  drawerRightHover: '#F5F7FA',
  tabBg: '#FAFBFC',
  tabBorder: '#E5E7EB',
  tabActive: '#006EC3',
  tabMuted: '#777',
  tabText: '#333',
  primary: '#006EC3',
  pageBg: '#FFF',
  font: "'Inter', -apple-system, sans-serif",
};

function Hamburger({ onClick }: { onClick: () => void }) {
  return (
    <svg onClick={onClick} width="18" height="12" viewBox="0 0 18 12" fill="none" style={{ cursor: 'pointer' }}>
      <path d="M0 1h18M0 6h18M0 11h18" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

interface NC { key: string; label: string; icon: React.ReactNode }
interface NG { key: string; label: string; icon: React.ReactNode; children: NC[] }

const nav: NG[] = [
  { key: 'slot-config', label: 'Slot Configuration', icon: <CalendarOutlined />, children: [
    { key: 'slots', label: 'Slot Management', icon: <CalendarOutlined /> },
    { key: 'templates', label: 'Slot Templates', icon: <AppstoreOutlined /> },
    { key: 'holidays', label: 'Holiday Calendar', icon: <ScheduleOutlined /> },
  ]},
  { key: 'yield-config', label: 'Yield Management', icon: <LineChartOutlined />, children: [
    { key: 'yield', label: 'Rate Card Setup', icon: <DollarOutlined /> },
    { key: 'segments', label: 'Customer Segments', icon: <TeamOutlined /> },
    { key: 'abtesting', label: 'A/B Testing', icon: <ExperimentOutlined /> },
  ]},
  { key: 'zone-store', label: 'Zone & Store', icon: <EnvironmentOutlined />, children: [
    { key: 'zones', label: 'Zone Management', icon: <EnvironmentOutlined /> },
    { key: 'stores', label: 'Store Management', icon: <ShopOutlined /> },
  ]},
  { key: 'operations', label: 'Operations', icon: <ToolOutlined />, children: [
    { key: 'emergency', label: 'Emergency Overrides', icon: <AlertOutlined /> },
    { key: 'bulk', label: 'Bulk Operations', icon: <BlockOutlined /> },
  ]},
  { key: 'system-sec', label: 'System', icon: <SettingOutlined />, children: [
    { key: 'system', label: 'System Config', icon: <SettingOutlined /> },
    { key: 'audit', label: 'Audit Log', icon: <AuditOutlined /> },
  ]},
];

function findGrp(pk: string) { for (const g of nav) if (g.children.some(c => c.key === pk)) return g.key; return nav[0].key; }
function pageLbl(pk: string) { for (const g of nav) { const c = g.children.find(ch => ch.key === pk); if (c) return c.label; } return ''; }

function Page({ tab }: { tab: string }) {
  switch (tab) {
    case 'slots': return <SlotManagement />; case 'yield': return <YieldManagement />;
    case 'zones': return <ZoneManagement />; case 'stores': return <StoreManagement />;
    case 'segments': return <CustomerSegments />; case 'emergency': return <EmergencyOverrides />;
    case 'holidays': return <HolidayCalendar />; case 'templates': return <SlotTemplates />;
    case 'bulk': return <BulkOperations />; case 'abtesting': return <ABTesting />;
    case 'system': return <SystemConfig />; case 'audit': return <AuditLog />;
    default: return null;
  }
}

// ── Login Screen ─────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) { setError('Please enter username and password'); return; }
    setLoading(true); setError('');
    setTimeout(() => {
      sessionStorage.setItem('shipsy_admin_auth', 'true');
      sessionStorage.setItem('shipsy_admin_user', username);
      setLoading(false);
      onLogin();
    }, 800);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #E8F0FE 0%, #F0F4FF 30%, #FFFFFF 50%, #EEF2FA 70%, #E0EAFC 100%)',
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      {/* Card */}
      <div style={{
        width: 420, background: '#fff', borderRadius: 12,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        padding: '40px 44px 36px',
      }}>
        {/* Carrefour Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Carrefour_logo.svg/200px-Carrefour_logo.svg.png"
            alt="Carrefour"
            style={{ height: 64, objectFit: 'contain' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = '<div style="font-size:32px;font-weight:900;color:#004E9A">Carrefour</div>';
            }}
          />
        </div>

        <h2 style={{ textAlign: 'center', fontSize: 22, fontWeight: 700, color: '#1B2330', margin: '0 0 28px' }}>Sign In</h2>

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#444', marginBottom: 6 }}>Username</label>
            <input
              type="text" value={username} onChange={e => { setUsername(e.target.value); setError(''); }}
              placeholder="Enter Username"
              style={{
                width: '100%', height: 42, padding: '0 14px', fontSize: 14,
                border: '1px solid #D9D9D9', borderRadius: 6, outline: 'none',
                fontFamily: "'Inter', sans-serif", boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#004E9A'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#D9D9D9'; }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#444', marginBottom: 6 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter Password"
                style={{
                  width: '100%', height: 42, padding: '0 40px 0 14px', fontSize: 14,
                  border: '1px solid #D9D9D9', borderRadius: 6, outline: 'none',
                  fontFamily: "'Inter', sans-serif", boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#004E9A'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#D9D9D9'; }}
              />
              <span onClick={() => setShowPw(!showPw)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                cursor: 'pointer', color: '#999', fontSize: 16, userSelect: 'none',
              }}>{showPw ? '👁' : '👁‍🗨'}</span>
            </div>
          </div>

          {/* Forgot password */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 13, color: '#004E9A', fontWeight: 600, cursor: 'pointer' }}>Forgot Password?</span>
          </div>

          {/* Error */}
          {error && <div style={{ fontSize: 12, color: '#D40B00', textAlign: 'center', marginBottom: 12 }}>{error}</div>}

          {/* Submit */}
          <button type="submit" disabled={loading} style={{
            width: '100%', height: 44, background: '#1659CB', color: '#fff',
            border: 'none', borderRadius: 6, fontSize: 15, fontWeight: 700,
            cursor: loading ? 'wait' : 'pointer', fontFamily: "'Inter', sans-serif",
            opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s',
          }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#888' }}>
        Powered By
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z" fill="#1659CB" />
          <path d="M12 8l4 2.5v5L12 18l-4-2.5v-5L12 8z" fill="#fff" />
        </svg>
        <span style={{ fontWeight: 700, color: '#1659CB' }}>Shipsy</span>
      </div>
    </div>
  );
}

// ── Main Console ─────────────────────────────────────────────

export default function AdminConsole() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('shipsy_admin_auth') === 'true');
  const [page, setPage] = useState('yield');
  const [grp, setGrp] = useState(() => findGrp('yield'));
  const [open, setOpen] = useState(false);

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(p => !p); }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, []);

  const pickGrp = (k: string) => { setGrp(k); const f = nav.find(g => g.key === k)?.children[0]; if (f) setPage(f.key); };
  const pickPage = (k: string) => { setPage(k); setGrp(findGrp(k)); setOpen(false); };

  const curGrp = nav.find(g => g.key === grp);
  const tabs = curGrp?.children || [];

  const profileMenu = (
    <div style={{ background: C.navbar, borderRadius: 6, padding: '6px 0', minWidth: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}>
      <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Avatar size={28} style={{ background: C.primary, fontWeight: 700, fontSize: 11 }}>N</Avatar>
        <div><div style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>Naval Ojha</div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>naval.ojjha@shipsy.io</div></div>
      </div>
      {[{ i: <SwapOutlined />, l: 'Switch View', action: () => {} }, { i: <ReloadOutlined />, l: 'Reset Password', action: () => {} }, { i: <LogoutOutlined />, l: 'Logout', action: () => { sessionStorage.removeItem('shipsy_admin_auth'); sessionStorage.removeItem('shipsy_admin_user'); setAuthed(false); } }].map(x => (
        <div key={x.l} onClick={x.action} style={{ padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: C.font }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >{x.i} {x.l}</div>
      ))}
    </div>
  );

  return (
    <div style={{ fontFamily: C.font, minHeight: '100vh', background: C.pageBg }}>

      {/* ═══ NAVBAR (z-index highest, always on top of everything including drawer) ═══ */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1100,
        height: NAVBAR_H, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 14px',
        background: C.navbar, color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Hamburger onClick={() => setOpen(!open)} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>{pageLbl(page)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Tooltip title="Help"><QuestionCircleOutlined style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', cursor: 'pointer' }} /></Tooltip>
          <Tooltip title="Timezone"><ClockCircleOutlined style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', cursor: 'pointer' }} /></Tooltip>
          <AntBadge count={99} overflowCount={99} size="small" offset={[-2, 2]}>
            <BellOutlined style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', cursor: 'pointer' }} />
          </AntBadge>
          <Dropdown overlay={profileMenu} trigger={['click']} placement="bottomRight">
            <Avatar size={26} style={{ background: C.primary, cursor: 'pointer', fontWeight: 700, fontSize: 11, marginLeft: 4 }}>N</Avatar>
          </Dropdown>
        </div>
      </div>

      {/* ═══ TAB BAR (right-aligned, below navbar) ═══ */}
      <div style={{
        position: 'fixed', top: NAVBAR_H, left: 0, right: 0, zIndex: 99,
        height: TABBAR_H, background: C.tabBg,
        borderBottom: `1px solid ${C.tabBorder}`,
        display: 'flex', alignItems: 'stretch', justifyContent: 'flex-end',
        padding: '0 20px',
      }}>
        {tabs.map(t => {
          const a = page === t.key;
          return (
            <button key={t.key} onClick={() => pickPage(t.key)} style={{
              height: '100%', padding: '0 16px', border: 'none', background: 'none',
              color: a ? C.tabActive : C.tabMuted, fontSize: 12, fontWeight: a ? 700 : 400,
              cursor: 'pointer', fontFamily: C.font,
              borderBottom: a ? `2px solid ${C.tabActive}` : '2px solid transparent',
            }}
              onMouseEnter={e => { if (!a) e.currentTarget.style.color = C.tabText; }}
              onMouseLeave={e => { if (!a) e.currentTarget.style.color = a ? C.tabActive : C.tabMuted; }}
            >{t.label}</button>
          );
        })}
      </div>

      {/* ═══ DRAWER — starts from TOP (y=0), goes full height, sits UNDER navbar ═══ */}
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        placement="left"
        width={LEFT_W + RIGHT_W}
        closable={false}
        mask={true}
        maskStyle={{ background: 'rgba(0,0,0,0.3)' }}
        rootStyle={{ top: 0 }}
        rootClassName="shipsy-sidenav"
        zIndex={1000}
        styles={{
          wrapper: { top: NAVBAR_H, height: `calc(100vh - ${NAVBAR_H}px)` },
          body: { padding: 0, display: 'flex', height: '100%' },
        }}
      >
        {/* Left panel */}
        <div style={{
          width: LEFT_W, background: C.drawerLeft,
          display: 'flex', flexDirection: 'column', height: '100%',
        }}>
          <div style={{ flex: 1, paddingTop: 2 }}>
            {nav.map(g => {
              const a = grp === g.key;
              return (
                <button key={g.key} onClick={() => pickGrp(g.key)} style={{
                  width: '100%', height: 42, display: 'flex', alignItems: 'center',
                  gap: 12, padding: '0 20px', border: 'none', cursor: 'pointer',
                  background: a ? C.drawerLeftActive : 'transparent',
                  color: '#fff', fontSize: 12.5, fontWeight: 600,
                  fontFamily: C.font, textAlign: 'left', transition: 'background 0.12s',
                }}
                  onMouseEnter={e => { if (!a) e.currentTarget.style.background = C.drawerLeftHover; }}
                  onMouseLeave={e => { if (!a) e.currentTarget.style.background = a ? C.drawerLeftActive : 'transparent'; }}
                >
                  <span style={{ fontSize: 15, display: 'flex', width: 20, justifyContent: 'center', color: a ? '#fff' : 'rgba(255,255,255,0.4)' }}>{g.icon}</span>
                  {g.label}
                </button>
              );
            })}
          </div>
          <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
            Press CTRL + K to search
          </div>
        </div>

        {/* Right panel */}
        <div style={{
          width: RIGHT_W, background: C.drawerRight,
          display: 'flex', flexDirection: 'column', height: '100%',
        }}>
          <div style={{ flex: 1, paddingTop: 2 }}>
            {curGrp?.children.map(ch => {
              const a = page === ch.key;
              return (
                <button key={ch.key} onClick={() => pickPage(ch.key)} style={{
                  width: '100%', height: 42, display: 'flex', alignItems: 'center',
                  gap: 12, padding: '0 20px', border: 'none', cursor: 'pointer',
                  background: a ? C.drawerRightActiveBg : 'transparent',
                  color: a ? C.drawerRightActiveText : C.drawerRightText,
                  fontSize: 12.5, fontWeight: a ? 600 : 400,
                  fontFamily: C.font, textAlign: 'left',
                  borderLeft: a ? `3px solid ${C.drawerRightActiveBorder}` : '3px solid transparent',
                  transition: 'background 0.1s',
                }}
                  onMouseEnter={e => { if (!a) e.currentTarget.style.background = C.drawerRightHover; }}
                  onMouseLeave={e => { if (!a) e.currentTarget.style.background = a ? C.drawerRightActiveBg : 'transparent'; }}
                >
                  <span style={{ fontSize: 14, display: 'flex', width: 20, justifyContent: 'center', color: a ? C.drawerRightActiveText : C.drawerRightIcon }}>{ch.icon}</span>
                  {ch.label}
                </button>
              );
            })}
          </div>
        </div>
      </Drawer>

      {/* ═══ CONTENT ═══ */}
      <div style={{ paddingTop: NAVBAR_H + TABBAR_H, minHeight: '100vh' }}>
        <div style={{ padding: '18px 22px', maxWidth: 1440 }}>
          <Page tab={page} />
        </div>
      </div>

      <style>{`
        .ant-badge-count { background: #E8A230 !important; box-shadow: none !important; font-weight: 700 !important; font-size: 9px !important; }
        .shipsy-sidenav .ant-drawer-body { background: ${C.drawerLeft} !important; }
        .shipsy-sidenav .ant-drawer-content-wrapper { box-shadow: 4px 0 16px rgba(0,0,0,0.12) !important; }
      `}</style>
    </div>
  );
}
