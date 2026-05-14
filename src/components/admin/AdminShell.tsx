import { CalendarDays, TrendingUp, Truck, Eye } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabLabels: Record<string, string> = {
  slots: 'Slot Management',
  yield: 'Yield Management',
  allocation: 'Allocation Rules',
};

const configItems = [
  { id: 'slots', label: 'Slot Management', icon: CalendarDays },
  { id: 'yield', label: 'Yield Management', icon: TrendingUp },
  { id: 'allocation', label: 'Allocation Rules', icon: Truck },
] as const;

const monitorItems = [
  { id: 'preview', label: 'Live Preview', icon: Eye },
] as const;

export default function AdminShell({ children, activeTab, onTabChange }: Props) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {/* Top bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 48, background: '#0F1E37', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#fff', fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px' }}>Shipsy</span>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF6B00', display: 'inline-block' }} />
        </div>
        <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, letterSpacing: '0.2px' }}>Slot & Yield Management Console</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1659CB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>A</div>
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 500 }}>Admin</span>
        </div>
      </div>

      {/* Sidebar */}
      <aside style={{ width: 220, background: '#fff', borderRight: '1px solid #E8E8E8', paddingTop: 48, position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 99, display: 'flex', flexDirection: 'column' }}>
        {/* CONFIGURATION section */}
        <div style={{ padding: '16px 16px 8px 16px' }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#999' }}>CONFIGURATION</span>
        </div>
        <nav>
          {configItems.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onTabChange(id)}
                style={{
                  width: '100%',
                  height: 42,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '0 16px',
                  border: 'none',
                  borderLeft: active ? '3px solid #1659CB' : '3px solid transparent',
                  background: active ? '#EBF1FC' : 'transparent',
                  color: active ? '#1659CB' : '#555',
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: "'Inter', sans-serif",
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = '#F5F5F5'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={16} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* MONITORING section */}
        <div style={{ padding: '20px 16px 8px 16px' }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#999' }}>MONITORING</span>
        </div>
        <nav>
          {monitorItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              style={{
                width: '100%',
                height: 42,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '0 16px',
                border: 'none',
                borderLeft: '3px solid transparent',
                background: 'transparent',
                color: '#999',
                fontSize: 13,
                fontWeight: 400,
                cursor: 'default',
                textAlign: 'left',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: 220, marginTop: 48, background: '#F5F4F2', minHeight: 'calc(100vh - 48px)', overflowY: 'auto' }}>
        <div style={{ padding: '24px 28px' }}>
          {/* Breadcrumb */}
          <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>
            Configuration &gt; {tabLabels[activeTab] || activeTab}
          </div>
          {/* Page title */}
          <h1 style={{ fontSize: 18, fontWeight: 800, color: '#111', margin: '0 0 20px 0' }}>
            {tabLabels[activeTab] || activeTab}
          </h1>
          {children}
        </div>
      </main>
    </div>
  );
}
