/* ============================================================
   Shared Config Store — localStorage bridge
   Admin writes config here, Checkout reads it.
   Both run in the same browser so localStorage is shared.
   ============================================================ */

import type { YieldConfig, SlotConfig, AllocationConfig } from '../types';
import { defaultYieldConfig, defaultSlotConfig, defaultAllocationConfig } from '../data/rate-cards';

const KEYS = {
  yield: 'shipsy_admin_yield_config',
  slot: 'shipsy_admin_slot_config',
  allocation: 'shipsy_admin_allocation_config',
  holidays: 'shipsy_admin_holidays',
  emergencyOverrides: 'shipsy_admin_emergency_overrides',
  zoneSchedule: 'shipsy_admin_zone_schedule',
  lastUpdated: 'shipsy_admin_last_updated',
} as const;

// ── Write (Admin side) ──────────────────────────────────────

function notifyUpdate(): void {
  const ts = new Date().toISOString();
  localStorage.setItem(KEYS.lastUpdated, ts);
  // Dispatch custom event for same-tab listeners (storage event only fires cross-tab)
  window.dispatchEvent(new CustomEvent('shipsy-config-updated', { detail: ts }));
}

export function saveYieldConfig(config: YieldConfig, storeId?: string): void {
  if (storeId && storeId !== 'all') {
    // Per-store yield: save under store-specific key
    localStorage.setItem(`${KEYS.yield}_${storeId}`, JSON.stringify(config));
  } else {
    // Only write global when no specific store (avoids last-store-wins race)
    localStorage.setItem(KEYS.yield, JSON.stringify(config));
  }
  notifyUpdate();
}

export function saveSlotConfig(config: SlotConfig): void {
  localStorage.setItem(KEYS.slot, JSON.stringify(config));
  notifyUpdate();
}

export function saveAllocationConfig(config: AllocationConfig): void {
  localStorage.setItem(KEYS.allocation, JSON.stringify(config));
  notifyUpdate();
}

export function saveEmergencyOverrides(overrides: { closedSlotIds: string[]; reducedCapacity: Record<string, number> }): void {
  localStorage.setItem(KEYS.emergencyOverrides, JSON.stringify(overrides));
  notifyUpdate();
}

export function saveHolidayClosures(closedDates: string[]): void {
  localStorage.setItem(KEYS.holidays, JSON.stringify(closedDates));
  notifyUpdate();
}

// Zone schedule: admin writes per storeId+zone, checkout reads
export function saveZoneSchedule(storeId: string, zone: string, schedule: Record<string, { startTime: string; endTime: string; capacity: number }[]>): void {
  const key = `${KEYS.zoneSchedule}_${storeId}_${zone}`;
  localStorage.setItem(key, JSON.stringify(schedule));
  notifyUpdate();
}

export function loadZoneSchedule(storeId: string, zone: string): Record<string, { startTime: string; endTime: string; capacity: number }[]> | null {
  try {
    const key = `${KEYS.zoneSchedule}_${storeId}_${zone}`;
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch { /* fall through */ }
  return null;
}

// ── Read (Checkout side) ────────────────────────────────────

export function loadYieldConfig(storeId?: string): YieldConfig {
  // Start with guaranteed good defaults
  const result = JSON.parse(JSON.stringify(defaultYieldConfig)) as YieldConfig;

  try {
    let stored: any = null;
    if (storeId && storeId !== 'all') {
      const storeRaw = localStorage.getItem(`${KEYS.yield}_${storeId}`);
      if (storeRaw) stored = JSON.parse(storeRaw);
    }
    if (!stored) {
      const raw = localStorage.getItem(KEYS.yield);
      if (raw) stored = JSON.parse(raw);
    }
    if (!stored) return result;

    // Only override non-zero values from stored config
    if (stored.baseFees) {
      if (stored.baseFees.home > 0) result.baseFees.home = stored.baseFees.home;
      if (stored.baseFees.fast > 0) result.baseFees.fast = stored.baseFees.fast;
      if (stored.baseFees.collect > 0) result.baseFees.collect = stored.baseFees.collect;
    }
    if (stored.floorPrices) {
      if (stored.floorPrices.home > 0) result.floorPrices.home = stored.floorPrices.home;
      if (stored.floorPrices.fast > 0) result.floorPrices.fast = stored.floorPrices.fast;
      if (stored.floorPrices.collect >= 0) result.floorPrices.collect = stored.floorPrices.collect;
    }
    if (stored.surgeThreshold > 0) result.surgeThreshold = stored.surgeThreshold;
    if (stored.surgeFlatAmount > 0) result.surgeFlatAmount = stored.surgeFlatAmount;
    if (stored.greenDiscountPct >= 0) result.greenDiscountPct = stored.greenDiscountPct;
    if (stored.timeOfDayWeights) result.timeOfDayWeights = stored.timeOfDayWeights;
    if (stored.dayOfWeekWeights) result.dayOfWeekWeights = stored.dayOfWeekWeights;
    if (stored.maxDemandFactor > 0) result.maxDemandFactor = stored.maxDemandFactor;
    if (stored.psychologicalRounding !== undefined) result.psychologicalRounding = stored.psychologicalRounding;
    if (stored.manualOverrides) result.manualOverrides = stored.manualOverrides;
  } catch { /* fall through */ }
  return result;
}

export function loadSlotConfig(): SlotConfig {
  try {
    const raw = localStorage.getItem(KEYS.slot);
    if (raw) return { ...defaultSlotConfig, ...JSON.parse(raw) };
  } catch { /* fall through */ }
  return defaultSlotConfig;
}

export function loadAllocationConfig(): AllocationConfig {
  try {
    const raw = localStorage.getItem(KEYS.allocation);
    if (raw) return { ...defaultAllocationConfig, ...JSON.parse(raw) };
  } catch { /* fall through */ }
  return defaultAllocationConfig;
}

export function loadEmergencyOverrides(): { closedSlotIds: string[]; reducedCapacity: Record<string, number> } {
  try {
    const raw = localStorage.getItem(KEYS.emergencyOverrides);
    if (raw) return JSON.parse(raw);
  } catch { /* fall through */ }
  return { closedSlotIds: [], reducedCapacity: {} };
}

export function loadHolidayClosures(): string[] {
  try {
    const raw = localStorage.getItem(KEYS.holidays);
    if (raw) return JSON.parse(raw);
  } catch { /* fall through */ }
  return [];
}

export function getLastUpdated(): string | null {
  return localStorage.getItem(KEYS.lastUpdated);
}

// ── Utility ─────────────────────────────────────────────────

export function clearAllAdminConfig(): void {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
}
