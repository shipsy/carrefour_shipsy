import { useMemo } from 'react';
import clsx from 'clsx';
import type { Store } from '../../types';
import { extractPostalCode } from '../../engine/zone-resolver';

// ── Postal code → approximate lat/lng for Belgium ────────────

const POSTAL_COORDS: Record<string, [number, number]> = {
  '1000': [50.8503, 4.3517], '1020': [50.8737, 4.3478], '1030': [50.8598, 4.378],
  '1040': [50.837, 4.39], '1050': [50.827, 4.373], '1060': [50.843, 4.335],
  '1070': [50.84, 4.318], '1080': [50.856, 4.32], '1081': [50.856, 4.32],
  '1082': [50.862, 4.287], '1090': [50.875, 4.325], '1100': [50.84, 4.38],
  '1130': [50.88, 4.41], '1140': [50.869, 4.397], '1150': [50.834, 4.445],
  '1160': [50.81, 4.426], '1170': [50.795, 4.41], '1180': [50.801, 4.353],
  '1190': [50.81, 4.325], '1200': [50.85, 4.42], '1210': [50.86, 4.365],
  '1300': [50.721, 4.536], '1301': [50.721, 4.536], '1310': [50.714, 4.501],
  '1400': [50.597, 4.328], '1410': [50.715, 4.388], '1500': [50.67, 4.254],
  '1600': [50.627, 4.17], '1620': [50.773, 4.312], '1640': [50.757, 4.387],
  '1700': [50.93, 4.34], '1780': [50.911, 4.302], '1800': [50.92, 4.45],
  '1850': [50.935, 4.369], '1853': [50.902, 4.341], '1930': [50.93, 4.46],
  '1950': [50.862, 4.464], '2000': [51.219, 4.402], '2050': [51.219, 4.379],
  '2100': [51.222, 4.449], '2150': [51.194, 4.487], '2800': [51.001, 4.451],
  '3000': [50.88, 4.701], '3360': [50.855, 4.729], '3500': [50.931, 5.338],
  '4000': [50.629, 5.58], '4040': [50.667, 5.633], '5000': [50.464, 4.867],
  '5100': [50.457, 4.868], '6000': [50.411, 4.444], '6010': [50.397, 4.447],
  '7000': [50.454, 3.956], '7500': [50.607, 3.388], '8000': [51.209, 3.225],
  '9000': [51.054, 3.717], '9100': [51.164, 4.144],
};

function getAddressCoords(address: string): [number, number] {
  const pc = extractPostalCode(address);
  if (pc && POSTAL_COORDS[pc]) return POSTAL_COORDS[pc];
  // Default: Brussels centre
  return [50.8503, 4.3517];
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Convert lat/lng to map % (Belgium bounding box)
const MAP_BOUNDS = { minLat: 49.5, maxLat: 51.5, minLng: 2.5, maxLng: 6.5 };

function toMapXY(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * 100;
  const y = (1 - (lat - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 100;
  return { x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) };
}

// ── Components ───────────────────────────────────────────────

function StoreIcon({ type }: { type: Store['type'] }) {
  const color = type === 'Express' ? '#1F4E9C' : '#D7263D';
  return (
    <svg viewBox="0 0 16 16" width="16" height="16"><circle cx="8" cy="8" r="7.5" fill={color} />
      <text x="8" y="11.5" textAnchor="middle" fontSize="9" fontWeight="900" fontFamily="Arial" fill="#fff">C</text>
    </svg>
  );
}

function MapPin({ store, selected, onClick, mapPos }: { store: Store; selected: boolean; onClick?: () => void; mapPos: { x: number; y: number } }) {
  const pinFill = store.type === 'Express' ? '#1F4E9C' : '#D7263D';
  return (
    <div className={clsx('absolute cursor-pointer z-[5]', !store.available && 'opacity-60', selected && 'z-[11]')}
      style={{ left: `${mapPos.x}%`, top: `${mapPos.y}%`, transform: `translate(-50%,-100%) ${selected ? 'scale(1.25)' : 'scale(1)'}`, transition: 'transform .15s' }}
      onClick={store.available ? onClick : undefined} title={store.name}
    >
      <svg width="26" height="34" viewBox="0 0 30 38" style={{ display: 'block', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,.25))' }}>
        <path d="M 15 0 C 6.7 0 0 6.7 0 15 C 0 25 15 38 15 38 C 15 38 30 25 30 15 C 30 6.7 23.3 0 15 0 Z" fill={selected ? '#7A0E1A' : pinFill} />
        <circle cx="15" cy="15" r="9" fill="#fff" />
        <text x="15" y="18.5" textAnchor="middle" fontSize="11" fontWeight="900" fontFamily="Arial" fill={pinFill}>C</text>
      </svg>
      {!store.available && <div className="absolute pointer-events-none" style={{ top: 12, left: -2, width: 30, height: 2.5, background: '#3C3C3C', transform: 'rotate(-22deg)', borderRadius: 2 }} />}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────

interface Props {
  stores: Store[];
  selectedStoreId: string | null;
  onSelectStore: (id: string) => void;
  address?: string;
}

export default function StoreSelector({ stores, selectedStoreId, onSelectStore, address = '' }: Props) {
  // Compute distances and sort by nearest
  const { sortedStores, userMapPos } = useMemo(() => {
    const [uLat, uLng] = getAddressCoords(address);
    const userPos = toMapXY(uLat, uLng);

    const withDist = stores.map(s => {
      const dist = haversineKm(uLat, uLng, s.lat, s.lng);
      const pos = toMapXY(s.lat, s.lng);
      return { ...s, dynamicDist: +dist.toFixed(1), mapPos: pos };
    });

    // Sort by distance
    withDist.sort((a, b) => a.dynamicDist - b.dynamicDist);

    return { sortedStores: withDist, userMapPos: userPos };
  }, [stores, address]);

  return (
    <div className="grid gap-[14px] mb-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
      {/* Left: Store list sorted by distance */}
      <div className="overflow-y-auto bg-white" style={{ border: '1px solid var(--color-cf-border)', borderRadius: 10, maxHeight: 380 }}>
        {sortedStores.map(s => {
          const sel = s.id === selectedStoreId;
          return (
            <div key={s.id}
              className={clsx(
                'flex items-center gap-2.5 text-[13px] cursor-pointer transition-colors',
                sel && 'bg-[#EAF2FB]',
                !s.available && 'opacity-55 cursor-not-allowed',
                !sel && s.available && 'hover:bg-[#FAFBFC]',
              )}
              style={{
                padding: sel ? '12px 12px 12px 9px' : '12px',
                borderBottom: '1px solid var(--color-cf-border)',
                borderLeft: sel ? '3px solid var(--color-cf-blue)' : 'none',
              }}
              onClick={() => s.available && onSelectStore(s.id)}
            >
              <span className="w-[22px] h-[22px] inline-flex items-center justify-center text-sm shrink-0">
                <StoreIcon type={s.type} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[13px] leading-tight" style={{ color: 'var(--color-cf-text, #1B2330)' }}>{s.name}</div>
                <div className="text-[11px] mt-0.5 leading-tight" style={{ color: 'var(--color-cf-muted)' }}>{s.address}</div>
              </div>
              <div className="text-[11px] min-w-[50px] text-right font-semibold" style={{ color: s.dynamicDist <= 10 ? 'var(--color-cf-success, #0F8F4A)' : 'var(--color-cf-muted)' }}>
                {s.dynamicDist} km
              </div>
              <div className="min-w-[74px] text-right">
                {s.available ? (
                  <button type="button" className="text-white font-bold text-[11px] border-none cursor-pointer"
                    style={{ background: sel ? 'var(--color-cf-success, #0F8F4A)' : 'var(--color-cf-blue)', padding: '5px 12px', borderRadius: 14 }}
                    onClick={e => { e.stopPropagation(); onSelectStore(s.id); }}
                  >{sel ? '✓ Picked' : 'Pick'}</button>
                ) : (
                  <span className="text-[11px] font-medium" style={{ color: 'var(--color-cf-muted)' }}>Unavailable</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right: Map with dynamic pins */}
      <div className="overflow-hidden relative" style={{ border: '1px solid var(--color-cf-border)', borderRadius: 10, background: '#E5EFE2', height: 380 }}>
        <svg className="w-full h-full block" viewBox="0 0 100 100" preserveAspectRatio="none">
          <rect width="100" height="100" fill="#E8EDE3" />
          <path d="M 10 8 Q 22 5 30 12 L 28 22 L 12 18 Z" fill="#C8DEB3" opacity=".7" />
          <path d="M 78 12 Q 92 8 96 18 L 92 30 L 80 24 Z" fill="#C8DEB3" opacity=".7" />
          <path d="M 4 60 Q 16 56 22 66 L 18 78 L 2 74 Z" fill="#C8DEB3" opacity=".7" />
          <path d="M 76 70 Q 92 64 96 78 L 88 92 L 74 86 Z" fill="#C8DEB3" opacity=".7" />
          <path d="M 35 78 Q 48 76 52 88 L 42 96 L 30 90 Z" fill="#C8DEB3" opacity=".7" />
          <path d="M 28 0 Q 32 30 28 60 Q 26 80 30 100" stroke="#B7D4E8" strokeWidth="1.4" fill="none" />
          <path d="M 0 50 L 100 50" stroke="#FFD86E" strokeWidth="1" fill="none" opacity=".75" />
          <path d="M 50 0 L 50 100" stroke="#FFD86E" strokeWidth="1" fill="none" opacity=".75" />
          <path d="M 0 30 Q 50 32 100 28" stroke="#fff" strokeWidth="1.2" fill="none" opacity=".8" />
          <path d="M 0 72 Q 50 70 100 74" stroke="#fff" strokeWidth="1.2" fill="none" opacity=".8" />
          <path d="M 20 0 L 24 100" stroke="#fff" strokeWidth="0.6" fill="none" opacity=".7" />
          <path d="M 70 0 L 76 100" stroke="#fff" strokeWidth="0.6" fill="none" opacity=".7" />
          <g fontFamily="Arial,sans-serif" fontWeight="700">
            <rect x="2" y="48" width="6" height="4" rx=".5" fill="#fff" stroke="#888" strokeWidth=".2" />
            <text x="5" y="51" textAnchor="middle" fontSize="2.4" fill="#3C4043">N9</text>
            <rect x="92" y="32" width="7" height="4" rx=".5" fill="#3C8A3C" />
            <text x="95.5" y="35.2" textAnchor="middle" fontSize="2.4" fill="#fff">E40</text>
          </g>
          <g fontFamily="Arial,sans-serif" fill="#3C4043">
            <text x="48" y="48" fontSize="3.6" fontWeight="700" textAnchor="middle">Brussels</text>
            <text x="48" y="34" fontSize="2.4" fontWeight="600" textAnchor="middle">Schaerbeek</text>
            <text x="32" y="22" fontSize="2.2" fontWeight="500" textAnchor="middle">Jette</text>
            <text x="68" y="58" fontSize="2.2" fontWeight="500" textAnchor="middle">Woluwe</text>
            <text x="44" y="84" fontSize="2.2" fontWeight="500" textAnchor="middle">Uccle</text>
            <text x="22" y="48" fontSize="2.2" fontWeight="500" textAnchor="middle">Anderlecht</text>
            <text x="80" y="84" fontSize="2.2" fontWeight="500" textAnchor="middle">Waterloo</text>
          </g>
        </svg>

        {/* Store pins — dynamically positioned */}
        {sortedStores.map(s => (
          <MapPin key={s.id} store={s} selected={s.id === selectedStoreId}
            onClick={() => onSelectStore(s.id)} mapPos={s.mapPos} />
        ))}

        {/* "You are here" pin — positioned based on address */}
        <div className="absolute z-[8]" style={{ left: `${userMapPos.x}%`, top: `${userMapPos.y}%`, transform: 'translate(-50%,-100%)' }}>
          <div className="absolute animate-pulse pointer-events-none"
            style={{ left: '50%', bottom: 6, transform: 'translate(-50%,50%)', width: 44, height: 44, borderRadius: '50%', background: 'rgba(122,14,26,.18)' }} />
          <svg width="30" height="38" viewBox="0 0 30 38" style={{ display: 'block', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.3))' }}>
            <path d="M 15 0 C 6.7 0 0 6.7 0 15 C 0 25 15 38 15 38 C 15 38 30 25 30 15 C 30 6.7 23.3 0 15 0 Z" fill="#7A0E1A" />
            <circle cx="15" cy="15" r="5" fill="#fff" />
          </svg>
          <div className="absolute whitespace-nowrap pointer-events-none" style={{
            bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)',
            background: '#1B2330', color: '#fff', fontSize: 10, fontWeight: 600,
            padding: '4px 8px', borderRadius: 4,
          }}>You are here</div>
        </div>

        {/* Map controls */}
        <div className="absolute right-2 bottom-9 flex flex-col gap-1 z-[3]">
          {['+', '−'].map((label, i) => (
            <button key={i} type="button" className="w-7 h-7 bg-white flex items-center justify-center cursor-pointer text-sm font-bold hover:bg-gray-50"
              style={{ border: '1px solid #DADCE0', borderRadius: 4, color: '#3C4043', boxShadow: '0 1px 2px rgba(0,0,0,.1)' }}>{label}</button>
          ))}
        </div>
        <div className="absolute bottom-1 left-1.5 right-1.5 flex justify-between items-center pointer-events-none z-[2]" style={{ fontSize: 9, color: '#5A5A5A' }}>
          <span className="font-bold" style={{ color: '#5786C9' }}>Google</span>
          <span>Map data &copy;2026</span>
        </div>
      </div>
    </div>
  );
}
