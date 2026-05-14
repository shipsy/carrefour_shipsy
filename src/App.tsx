import { useState, useMemo, useCallback, useEffect } from 'react';
import { ConfigProvider } from 'antd';
import type { DemoStep, DeliveryMethod, SlotRaw, YieldResult, AllocationResult, ApiLogEntry, YieldConfig, SlotConfig as SlotConfigType, AllocationConfig as AllocationConfigType, Language } from './types';
import { translations } from './data/translations';
import { defaultCart } from './data/cart';
import { stores } from './data/stores';
import { suggestSlotsWithLog } from './engine/slot-manager';
import { calculateDeliveryFee } from './engine/yield-engine';
import { allocateFleet } from './engine/allocation-engine';
import { createConsignment, buildCnPayload, type CnCreateResponse, type SlotInfo } from './engine/shipsy-api';
import { createLogEntry, ApiLogContext } from './engine/api-logger';
import { loadYieldConfig, loadSlotConfig, loadAllocationConfig, loadHolidayClosures, loadEmergencyOverrides } from './engine/config-store';
import { resolveStoreFromAddress } from './engine/zone-resolver';
import { LanguageContext } from './hooks/useLanguage';
import DemoShell from './components/layout/DemoShell';
import CarrefourHeader from './components/layout/CarrefourHeader';
import DebugPanel from './components/layout/DebugPanel';
import DeliveryInfoCard from './components/checkout/DeliveryInfoCard';
import DeliveryMethodModal from './components/checkout/DeliveryMethodModal';
import SlotPicker from './components/checkout/SlotPicker';
import CartSummary from './components/checkout/CartSummary';
import ConfirmationScreen from './components/checkout/ConfirmationScreen';
import ReservationBanner from './components/shared/ReservationBanner';
import AdminConsole from './admin/AdminConsole';

// ── Hash-based router ───────────────────────────────────────

function useHashRoute() {
  const getHash = () => window.location.hash.replace(/^#\/?/, '').toLowerCase();
  const [hash, setHash] = useState(getHash);
  useEffect(() => {
    const onHash = () => setHash(getHash());
    window.addEventListener('hashchange', onHash);
    // Also re-check on popstate for browser back/forward
    window.addEventListener('popstate', onHash);
    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('popstate', onHash);
    };
  }, []);
  return hash;
}

// ── Clear stale yield configs on fresh load ──────────────────
(function purgeStaleYield() {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('shipsy_admin_yield'));
    keys.forEach(k => {
      const raw = localStorage.getItem(k);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.baseFees && parsed.baseFees.home === 0 && parsed.baseFees.fast === 0) {
          localStorage.removeItem(k);
        }
      }
    });
  } catch { /* ignore */ }
})();

// ── Checkout App (reads config from shared store) ───────────

function CheckoutApp() {
  const [lang, setLang] = useState<Language>('en');
  const t = useCallback((key: keyof typeof translations.en) => translations[lang][key] || key, [lang]);

  const [shipsyEnabled, setShipsyEnabled] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);

  const [step, setStep] = useState<DemoStep>('landing');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('home');
  const [address, setAddress] = useState('Rue des Dauphins 56, 1080 Molenbeek-Saint-Jean');
  const [pickedStoreId, setPickedStoreId] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | undefined>();
  const [allocation, setAllocation] = useState<AllocationResult | null>(null);
  const [slotLock, setSlotLock] = useState<{ id: string; key: string } | null>(null);
  const [consignmentRef, setConsignmentRef] = useState<string | null>(null);
  const [, setCnResponse] = useState<CnCreateResponse | null>(null);
  const [phone, setPhone] = useState('');
  const [methodModalOpen, setMethodModalOpen] = useState(false);

  // Config loaded from shared store (admin writes, checkout reads)
  // For fast/collect, use the store the user picked. For home, resolve from address.
  const resolvedStore = pickedStoreId ?? resolveStoreFromAddress(address);
  const [yieldConfig, setYieldConfig] = useState<YieldConfig>(() => loadYieldConfig(resolvedStore));
  const [slotConfig, setSlotConfig] = useState<SlotConfigType>(loadSlotConfig);
  const [allocationConfig, setAllocationConfig] = useState<AllocationConfigType>(loadAllocationConfig);
  const [holidayClosures, setHolidayClosures] = useState<string[]>(loadHolidayClosures);
  const [emergencyOverrides, setEmergencyOverrides] = useState(loadEmergencyOverrides);

  // Reload all config from localStorage (per-store yield)
  const reloadConfig = useCallback(() => {
    const storeId = resolveStoreFromAddress(address);
    setYieldConfig(loadYieldConfig(storeId));
    setSlotConfig(loadSlotConfig());
    setAllocationConfig(loadAllocationConfig());
    setHolidayClosures(loadHolidayClosures());
    setEmergencyOverrides(loadEmergencyOverrides());
    console.log('[Checkout] Config reloaded for store', storeId);
  }, [address]);

  // Instant sync: listen for localStorage changes from admin (cross-tab via storage event)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('shipsy_admin_')) reloadConfig();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [reloadConfig]);

  // Instant sync: listen for custom event from admin (same-tab via hash routing)
  useEffect(() => {
    const onCustom = () => reloadConfig();
    window.addEventListener('shipsy-config-updated', onCustom);
    return () => window.removeEventListener('shipsy-config-updated', onCustom);
  }, [reloadConfig]);

  // Also reload on window focus as fallback
  useEffect(() => {
    window.addEventListener('focus', reloadConfig);
    return () => window.removeEventListener('focus', reloadConfig);
  }, [reloadConfig]);

  // API logs
  const [logs, setLogs] = useState<ApiLogEntry[]>([]);
  const addLog = useCallback((entry: ApiLogEntry) => { setLogs(prev => [entry, ...prev]); }, []);
  const clearLogs = useCallback(() => setLogs([]), []);

  // Generate slots: pincode → zone → fetch slots → filter by time
  const { slots, slotLog } = useMemo(() => {
    const { slots: generated, log } = suggestSlotsWithLog(slotConfig, deliveryMethod, address, pickedStoreId ?? undefined);
    let result = generated;
    // Apply holiday closures
    if (holidayClosures.length > 0) {
      result = result.filter(s => !holidayClosures.includes(s.date));
    }
    // Apply emergency overrides
    if (emergencyOverrides.closedSlotIds.length > 0) {
      result = result.map(s =>
        emergencyOverrides.closedSlotIds.includes(s.id) ? { ...s, isAvailable: false } : s
      );
    }
    result = result.map(s => {
      const reduced = emergencyOverrides.reducedCapacity[s.id];
      if (reduced !== undefined) {
        const newTotal = Math.round(s.capacityTotal * reduced / 100);
        return { ...s, capacityTotal: newTotal, isAvailable: s.capacityUsed < newTotal };
      }
      return s;
    });
    return { slots: result, slotLog: log };
  }, [slotConfig, deliveryMethod, address, pickedStoreId, holidayClosures, emergencyOverrides]);

  // Calculate yield for all slots using admin yield config
  const yieldResults = useMemo(() => {
    const map = new Map<string, YieldResult>();
    slots.forEach(slot => { map.set(slot.id, calculateDeliveryFee(slot, yieldConfig, deliveryMethod)); });
    return map;
  }, [slots, yieldConfig, deliveryMethod]);

  const selectedSlot = slots.find(s => s.id === selectedSlotId);
  const selectedYield = selectedSlotId ? yieldResults.get(selectedSlotId) : undefined;
  const cartSubtotal = defaultCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = defaultCart.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = selectedYield?.finalFee ?? 0;
  const greenDiscount = selectedSlot?.isGreen ? +(selectedYield?.greenDiscount ?? 0) : 0;

  // ── Handlers ──────────────────────────────────────────────

  function handleSelectMethod(method: DeliveryMethod, storeId?: string) {
    setDeliveryMethod(method);
    setPickedStoreId(storeId ?? null);
    setMethodModalOpen(false);
    setSelectedSlotId(undefined);
    setSlotLock(null);
    setConsignmentRef(null);
    // Reload yield config for the resolved store
    const store = storeId ?? resolveStoreFromAddress(address);
    setYieldConfig(loadYieldConfig(store));
    setStep('slots');

    // Log slot suggest API call (Sharvani's real Shipsy endpoint)
    if (shipsyEnabled) {
      // Step 1: Log pincode extraction
      setTimeout(() => {
        const log1 = createLogEntry('slot-manager', 'POST /api/v1/zone/resolve', {
          address, service_type: method,
        });
        log1.responsePayload = slotLog.step2_zone as unknown as Record<string, unknown>;
        log1.latencyMs = 45;
        log1.status = 'success';
        addLog(log1);
      }, 100);

      // Step 2: Log slot fetch
      setTimeout(() => {
        const log2 = createLogEntry('slot-manager', 'POST /api/v1/slots/fetch', {
          facility_id: slotLog.step3_slots.facilityId,
          zone: slotLog.step3_slots.zoneName,
          service_type: method,
          day: slotLog.step3_slots.day,
        });
        log2.responsePayload = {
          total_slots: slotLog.step3_slots.totalSlots,
          available_slots: slotLog.step3_slots.availableSlots,
          current_time: slotLog.step4_timeFilter.currentTime,
          filtered_out_past: slotLog.step4_timeFilter.filteredOut,
          slots: slots.filter(s => s.isAvailable).slice(0, 8).map(s => ({
            start: s.startTime, end: s.endTime, date: s.date,
            available: s.isAvailable,
          })),
        };
        log2.latencyMs = 187;
        log2.status = 'success';
        addLog(log2);
      }, 300);

      // Step 3: Log yield calculation
      setTimeout(() => {
        const log3 = createLogEntry('yield-engine', 'POST /api/v1/yield/calculate', {
          facility_id: slotLog.step3_slots.facilityId,
          service_type: method,
          slots_count: slotLog.step3_slots.availableSlots,
        });
        const fees = [...yieldResults.values()].map(y => y.finalFee);
        log3.responsePayload = {
          min_fee: fees.length ? Math.min(...fees).toFixed(2) : '0',
          max_fee: fees.length ? Math.max(...fees).toFixed(2) : '0',
          config_applied: {
            base_fee: yieldConfig.baseFees[method],
            surge_threshold: yieldConfig.surgeThreshold,
            green_discount: yieldConfig.greenDiscountPct + '%',
          },
        };
        log3.latencyMs = 98;
        log3.status = 'success';
        addLog(log3);
      }, 500);
    }
  }

  function handleSelectSlot(slot: SlotRaw) {
    setSelectedSlotId(slot.id);

    // Log slot lock API call (Sharvani's real Shipsy endpoint)
    if (shipsyEnabled) {
      const jobTypeByMethod: Record<DeliveryMethod, string> = {
        home: 'STANDARD',
        fast: 'EXPRESS',
        collect: 'CLICK_AND_COLLECT',
      };
      const lockId = `lock-${Date.now()}`;
      const lockKey = crypto.randomUUID();
      setSlotLock({ id: lockId, key: lockKey });

      const log = createLogEntry(
        'slot-manager',
        'POST https://app.shipsy.in/api/client/integration/service/slot/lock',
        {
          worker_code: 'WORKER-BRU-01',
          job_type: jobTypeByMethod[deliveryMethod],
          hub_code: 'BRUSSELS',
          slot_date: slot.date,
          slot_start_time: `${slot.startTime}:00`,
          slot_end_time: `${slot.endTime}:00`,
        },
      );
      log.responsePayload = {
        resource_slot_lock_id: lockId,
        resource_slot_lock_key: lockKey,
        lock_duration_seconds: 600,
      };
      log.latencyMs = 89;
      log.status = 'success';
      addLog(log);
    }

    setStep('summary');
  }

  async function handlePlaceOrder() {
    const result = allocateFleet(deliveryMethod, allocationConfig);
    setAllocation(result);

    // Build slot info from selected slot
    const slotInfo: SlotInfo | undefined = selectedSlot ? {
      date: selectedSlot.date,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
    } : undefined;

    // Build payload with delivery time slot and call real Shipsy CN API
    const payload = buildCnPayload(defaultCart, address, deliveryMethod, slotInfo, phone);
    const log = createLogEntry(
      'allocation-engine',
      'POST https://app.shipsy.in/api/client/integration/consignment/upload/softdata/v2',
      payload as unknown as Record<string, unknown>,
    );
    addLog(log);

    try {
      const startTime = Date.now();
      const resp = await createConsignment(defaultCart, address, deliveryMethod, slotInfo, phone);
      log.latencyMs = Date.now() - startTime;

      if (resp.success) {
        log.responsePayload = resp as unknown as Record<string, unknown>;
        log.status = 'success';
        setConsignmentRef(resp.reference_number);
        setCnResponse(resp);
        console.log('CN created:', resp.reference_number, resp.pieces);
      } else {
        log.responsePayload = resp as unknown as Record<string, unknown>;
        log.status = 'error';
        setConsignmentRef(null);
        setCnResponse(resp);
        console.error('CN creation failed:', resp);
      }
    } catch (err) {
      log.latencyMs = 0;
      log.status = 'error';
      log.responsePayload = { error: String(err) };
      setConsignmentRef(null);
      setCnResponse(null);
      console.error('CN API error:', err);
    }

    // Update the log entry in-place
    setLogs(prev => [log, ...prev.filter(l => l.id !== log.id)]);
    setStep('confirmation');
  }

  function handleReset() {
    setStep('landing');
    setSelectedSlotId(undefined);
    setAllocation(null);
    setSlotLock(null);
    setConsignmentRef(null);
    setCnResponse(null);
    setPickedStoreId(null);
    setMethodModalOpen(false);
  }

  const langCtx = useMemo(() => ({ lang, setLang, t }), [lang, t]);
  const logCtx = useMemo(() => ({ logs, addLog, clearLogs }), [logs, addLog, clearLogs]);

  // Allocation info string for confirmation screen
  const allocationInfo = allocation
    ? allocation.fleetType === 'own_fleet'
      ? 'Carrefour Own Fleet'
      : allocation.fleetType === '3pl_partner'
        ? `3PL \u2014 ${allocation.partnerName ?? 'Partner'}`
        : 'Store Pickup'
    : undefined;

  // Suppress unused var warnings for features used in API calls
  void slotLock;

  // Dynamic labels based on delivery method + picked store
  const pickedStoreName = pickedStoreId ? stores.find(s => s.id === pickedStoreId)?.name ?? pickedStoreId : null;
  const methodLabels: Record<DeliveryMethod, { emoji: string; title: string; prepFee: number; addressLabel: string }> = {
    home: { emoji: '\u{1F69A}', title: 'Home Delivery', prepFee: 4.50, addressLabel: address },
    fast: { emoji: '\u26A1', title: 'Fast Delivery', prepFee: 2.99, addressLabel: pickedStoreName ? `From ${pickedStoreName}` : address },
    collect: { emoji: '\u{1F3EA}', title: 'Click & Collect', prepFee: 0, addressLabel: pickedStoreName ? `Pickup at ${pickedStoreName}` : 'Store pickup' },
  };
  const ml = methodLabels[deliveryMethod];

  return (
    <LanguageContext.Provider value={langCtx}>
      <ApiLogContext.Provider value={logCtx}>
        <DemoShell
          shipsyEnabled={shipsyEnabled}
          onToggleShipsy={() => setShipsyEnabled(v => !v)}
          debugOpen={debugOpen}
          onToggleDebug={() => setDebugOpen(v => !v)}
        >
          <div className="flex-1 min-h-0">
            <div className={`transition-all duration-300 ${debugOpen && shipsyEnabled ? 'mr-[35%]' : ''}`}>
              <CarrefourHeader cartTotal={cartSubtotal + deliveryFee - greenDiscount} cartItemCount={cartItemCount} lang={lang} onLangChange={setLang} />
              <main className="min-h-[calc(100vh-140px)]" style={{ background: 'var(--color-cf-bg, #F7F8FA)' }}>
                {step === 'landing' && <DeliveryInfoCard address={address} deliveryTime="17:00 tomorrow" deliveryMethod={deliveryMethod} onChangeMethod={() => setMethodModalOpen(true)} />}
                {step === 'slots' && (
                  <>
                    <DeliveryInfoCard address={address} deliveryTime={selectedSlot ? `${selectedSlot.startTime} - ${selectedSlot.endTime}` : '\u2014'} deliveryMethod={deliveryMethod} onChangeMethod={() => setMethodModalOpen(true)} />
                    <div className="max-w-[1200px] mx-auto mt-4 px-[18px] pb-8">
                      <div className="overflow-hidden" style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 1px 2px rgba(15,23,42,.06)' }}>
                        <div className="flex items-center justify-center relative" style={{ padding: '16px 22px', borderBottom: '1px solid var(--color-cf-border)' }}>
                          <span className="absolute left-4 font-semibold text-[13px] cursor-pointer" style={{ color: 'var(--color-cf-blue)' }} onClick={() => setStep('landing')}>&#8249; Back</span>
                          <span className="font-extrabold text-base">My basket</span>
                          <span className="absolute right-4 flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-cf-muted)' }}>&#128274; 100% secure payment</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 0 }}>
                          <div className="p-6"><SlotPicker slots={slots} yieldResults={yieldResults} shipsyEnabled={shipsyEnabled} onSelectSlot={handleSelectSlot} selectedSlotId={selectedSlotId} phone={phone} onPhoneChange={setPhone} deliveryMethod={deliveryMethod} /></div>
                          <div className="p-6" style={{ background: '#FAFBFC', borderLeft: '1px solid var(--color-cf-border)' }}>
                            <h3 className="flex items-center gap-2 m-0 mb-3.5 font-extrabold text-[15px]">{ml.emoji} {ml.title}</h3>
                            <div className="text-[13px] leading-relaxed mb-3.5" style={{ color: 'var(--color-cf-muted)' }}>
                              <strong style={{ color: 'var(--color-cf-text, #1B2330)', display: 'block' }}>{ml.addressLabel}</strong>
                              {deliveryMethod === 'fast' && <span style={{ color: 'var(--color-cf-blue)', fontSize: 11, fontWeight: 600, display: 'block', marginTop: 4 }}>Estimated delivery within 2 hours</span>}
                              {deliveryMethod === 'collect' && <span style={{ color: 'var(--color-cf-blue)', fontSize: 11, fontWeight: 600, display: 'block', marginTop: 4 }}>Ready for pickup at selected store</span>}
                            </div>
                            <div className="text-[13px]">
                              <div className="flex justify-between py-1.5"><span>Basket total</span><span>&euro;{cartSubtotal.toFixed(2)}</span></div>
                              {deliveryFee > 0 && <div className="flex justify-between py-1.5"><span>Delivery fee</span><span>&euro;{deliveryFee.toFixed(2)}</span></div>}
                              {ml.prepFee > 0 && <div className="flex justify-between py-1.5"><span>Preparation fee</span><span>&euro;{ml.prepFee.toFixed(2)}</span></div>}
                              {greenDiscount > 0 && <div className="flex justify-between py-1.5" style={{ color: 'var(--color-cf-success, #0F8F4A)' }}><span>Eco discount</span><span>-&euro;{greenDiscount.toFixed(2)}</span></div>}
                              <div className="flex justify-between font-extrabold text-base" style={{ paddingTop: '10px', marginTop: '6px', borderTop: '1px solid var(--color-cf-border)' }}><span>Estimated total</span><span>&euro;{(cartSubtotal + deliveryFee + ml.prepFee - greenDiscount).toFixed(2)}</span></div>
                            </div>
                            <button type="button" className="w-full text-white text-sm font-bold mt-3.5" style={{ background: selectedSlotId ? 'var(--color-cf-success, #0F8F4A)' : '#CFD4DA', padding: '11px 18px', borderRadius: '24px', border: 'none', cursor: selectedSlotId ? 'pointer' : 'not-allowed' }} disabled={!selectedSlotId} onClick={() => selectedSlotId && setStep('summary')}>Validate my slot</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {step === 'summary' && selectedSlot && selectedYield && (
                  <div className="max-w-[1200px] mx-auto mt-4 px-[18px] pb-8">
                    {shipsyEnabled && selectedSlotId && <ReservationBanner slotId={selectedSlotId} />}
                    <CartSummary items={defaultCart} deliveryFee={deliveryFee} greenDiscount={greenDiscount} isGreenSlot={selectedSlot.isGreen} selectedSlotTime={`${selectedSlot.startTime} - ${selectedSlot.endTime}`} selectedDate={selectedSlot.date} onPlaceOrder={handlePlaceOrder} deliveryMethod={deliveryMethod} />
                    <button onClick={() => setStep('slots')} className="mt-4 text-sm hover:underline block mx-auto" style={{ color: 'var(--color-cf-blue)', background: 'none', border: 'none' }}>&larr; Back to slot selection</button>
                  </div>
                )}
                {step === 'confirmation' && selectedSlot && (
                  <ConfirmationScreen
                    deliveryFee={deliveryFee}
                    slotTime={`${selectedSlot.startTime} - ${selectedSlot.endTime}`}
                    slotDate={selectedSlot.date}
                    co2Saved={selectedSlot.co2SavedKg}
                    onReset={handleReset}
                    allocationInfo={allocationInfo}
                    consignmentRef={consignmentRef ?? undefined}
                  />
                )}
              </main>
              <DeliveryMethodModal open={methodModalOpen || step === 'landing'} onClose={() => { setMethodModalOpen(false); if (step === 'landing') setStep('slots'); }} onSelect={handleSelectMethod} address={address} onAddressChange={setAddress} stores={stores} />
            </div>
            {debugOpen && shipsyEnabled && <DebugPanel logs={logs} onClose={() => setDebugOpen(false)} />}
          </div>
        </DemoShell>
      </ApiLogContext.Provider>
    </LanguageContext.Provider>
  );
}

// ── Root Router ─────────────────────────────────────────────

function useRoute(): 'admin' | 'checkout' {
  const [route, setRoute] = useState<'admin' | 'checkout'>(() => {
    const h = window.location.hash.toLowerCase();
    return h.includes('admin') ? 'admin' : 'checkout';
  });

  useEffect(() => {
    const check = () => {
      const h = window.location.hash.toLowerCase();
      setRoute(h.includes('admin') ? 'admin' : 'checkout');
    };
    window.addEventListener('hashchange', check);
    window.addEventListener('popstate', check);
    // Re-check after mount in case hash was set before React hydrated
    check();
    return () => {
      window.removeEventListener('hashchange', check);
      window.removeEventListener('popstate', check);
    };
  }, []);

  return route;
}

export default function App() {
  const route = useRoute();
  if (route === 'admin') return (
    <ConfigProvider theme={{
      token: {
        colorPrimary: '#1659CB',
        colorSuccess: '#20B249',
        colorWarning: '#F0A105',
        colorError: '#D40B00',
        borderRadius: 4,
        fontFamily: "'Inter', sans-serif",
      },
    }}>
      <AdminConsole />
    </ConfigProvider>
  );
  return <CheckoutApp />;
}
