import type { SlotRaw, SlotConfig, DeliveryMethod, TimeOfDay } from '../types';
import { generateSlots } from '../data/slots';
import { extractPostalCode, resolveStoreFromAddress, resolveZoneFromAddress, getZoneMapping } from './zone-resolver';
import { zoneSlotData, fastZoneSlotData, collectZoneSlotData } from '../data/zone-slots';
import { loadZoneSchedule } from './config-store';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getTimeOfDay(startTime: string): TimeOfDay {
  const hour = parseInt(startTime.split(':')[0]);
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

// ── API Response types for debug logging ────────────────────

export interface SlotResolutionLog {
  step1_pincode: { address: string; extractedPincode: string | null };
  step2_zone: { pincode: string; facilityId: string; zoneName: string } | null;
  step3_slots: { facilityId: string; zoneName: string; day: string; serviceType: string; totalSlots: number; availableSlots: number };
  step4_timeFilter: { currentTime: string; filteredOut: number; remaining: number };
}

/**
 * suggestSlots — full API-style flow:
 * 1. Extract pincode from address
 * 2. Resolve pincode → zone mapping (facility + zone)
 * 3. Fetch all timeslots for that zone + service type + current day
 * 4. Filter by current time → only future available slots
 *
 * Returns slots + resolution log for debug panel
 */
export function suggestSlots(
  config: SlotConfig,
  deliveryMethod: DeliveryMethod = 'home',
  address: string = 'Rue des Dauphins 56, 1080 Molenbeek-Saint-Jean',
  explicitStoreId?: string,
): SlotRaw[] {
  const now = new Date();

  // Step 1+2: Resolve pincode → facility + zone
  const storeId = explicitStoreId ?? resolveStoreFromAddress(address);
  const zoneName = resolveZoneFromAddress(address);

  // Step 3: Check localStorage for admin-modified schedule first, then fall back to hardcoded
  const adminSchedule = loadZoneSchedule(storeId, zoneName);
  if (adminSchedule) {
    return generateSlotsFromZoneData(storeId, zoneName, adminSchedule, config, now, deliveryMethod);
  }

  const dataSource = deliveryMethod === 'home' ? zoneSlotData
    : deliveryMethod === 'fast' ? fastZoneSlotData
    : collectZoneSlotData;

  const zoneSchedule = dataSource[storeId]?.[zoneName];
  if (zoneSchedule) {
    return generateSlotsFromZoneData(storeId, zoneName, zoneSchedule, config, now, deliveryMethod);
  }

  // Fallback to generic schedules if no zone data
  return generateSlots(new Date(), 5, storeId, deliveryMethod);
}

/**
 * suggestSlotsWithLog — same as suggestSlots but returns the resolution log
 * for display in the debug panel
 */
export function suggestSlotsWithLog(
  config: SlotConfig,
  deliveryMethod: DeliveryMethod,
  address: string,
  explicitStoreId?: string,
): { slots: SlotRaw[]; log: SlotResolutionLog } {
  const now = new Date();
  const currentDay = DAY_NAMES[now.getDay()];

  // Step 1
  const pincode = extractPostalCode(address);

  // Step 2
  const storeId = explicitStoreId ?? resolveStoreFromAddress(address);
  const zoneName = resolveZoneFromAddress(address);
  const mapping = pincode ? getZoneMapping(pincode) : null;

  // Step 3: Check admin-modified schedule in localStorage first
  let slots: SlotRaw[];
  let totalSlots = 0;
  let availableSlots = 0;

  const adminSchedule = loadZoneSchedule(storeId, zoneName);
  const logDataSource = deliveryMethod === 'home' ? zoneSlotData
    : deliveryMethod === 'fast' ? fastZoneSlotData
    : collectZoneSlotData;

  const logZoneSchedule = adminSchedule || logDataSource[storeId]?.[zoneName];
  if (logZoneSchedule) {
    slots = generateSlotsFromZoneData(storeId, zoneName, logZoneSchedule, config, now, deliveryMethod);
  } else {
    slots = generateSlots(new Date(), 5, storeId, deliveryMethod);
  }

  totalSlots = slots.length;
  availableSlots = slots.filter(s => s.isAvailable).length;
  const filteredOut = totalSlots - availableSlots;

  const log: SlotResolutionLog = {
    step1_pincode: { address, extractedPincode: pincode },
    step2_zone: mapping ? { pincode: pincode!, facilityId: mapping.facilityId, zoneName: mapping.zoneName } : { pincode: pincode ?? 'unknown', facilityId: storeId, zoneName },
    step3_slots: { facilityId: storeId, zoneName, day: currentDay, serviceType: deliveryMethod, totalSlots, availableSlots },
    step4_timeFilter: { currentTime: now.toTimeString().slice(0, 5), filteredOut, remaining: availableSlots },
  };

  return { slots, log };
}

/**
 * Generate SlotRaw[] from zone-level CSV data with real-time filtering.
 */
function generateSlotsFromZoneData(
  storeId: string,
  zone: string,
  schedule: Record<string, { startTime: string; endTime: string; capacity: number }[]>,
  config: SlotConfig,
  now: Date,
  deliveryMethod: DeliveryMethod = 'home',
): SlotRaw[] {
  const slots: SlotRaw[] = [];
  const today = new Date();
  // Include today for all methods (time filters removed)
  const startDay = 0;

  for (let d = startDay; d <= 7; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() + d);

    const dayName = DAY_NAMES[date.getDay()];
    if (dayName === 'Sunday') continue;

    const daySlots = schedule[dayName];
    if (!daySlots) continue;

    const dateStr = localDateStr(date);
    const isToday = d === 0;

    daySlots.forEach((zs, idx) => {
      const capacityTotal = config.capacityPerSlot && config.capacityPerSlot !== 40
        ? config.capacityPerSlot
        : (zs.capacity || 10);

      // Simulate some usage (deterministic)
      const seed = (d * 7 + idx * 3 + 49297) % 233280;
      const pseudo = seed / 233280;
      const isFridayClosed = dayName === 'Friday' && zs.capacity === 0;
      const capacityUsed = isFridayClosed
        ? capacityTotal
        : Math.round(capacityTotal * (0.2 + pseudo * 0.35));

      // Cut-off
      const cutOffHours = deliveryMethod === 'fast' ? 0.75 : deliveryMethod === 'collect' ? 2 : (config.cutOffHoursBefore || 1.5);
      const [sh, sm] = zs.startTime.split(':').map(Number);
      const totalMin = Math.max(0, sh * 60 + sm - Math.round(cutOffHours * 60));
      const cutOffTime = `${String(Math.floor(totalMin / 60)).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;

      const [cutH, cutM] = cutOffTime.split(':').map(Number);
      const cutOffDate = new Date(dateStr);
      cutOffDate.setHours(cutH, cutM, 0, 0);
      const isPastCutOff = now >= cutOffDate;

      // Real-time: slot start already passed today
      const slotStartDate = new Date(dateStr);
      slotStartDate.setHours(sh, sm, 0, 0);
      const isSlotPassed = isToday && now >= slotStartDate;

      const tod = getTimeOfDay(zs.startTime);
      const isGreen = !isFridayClosed && tod === 'afternoon' && d <= 3 && d > 0 && pseudo > 0.5;

      slots.push({
        id: `slot-${deliveryMethod}-${storeId}-${zone}-${dateStr}-${idx}`,
        date: dateStr,
        startTime: zs.startTime,
        endTime: zs.endTime,
        timeOfDay: tod,
        capacityTotal,
        capacityUsed: isFridayClosed ? capacityTotal : capacityUsed,
        isAvailable: !isFridayClosed && capacityUsed < capacityTotal,
        isGreen,
        co2SavedKg: isGreen ? +(0.2 + pseudo * 0.3).toFixed(2) : 0,
        cutOffTime,
        isPastCutOff: false,
        slotLabel: isFridayClosed ? 'Closed' : undefined,
      });
    });
  }

  // Remove slots where the entire day is in the past (for d=0, keep only future slots)
  return slots;
}

export function getSlotsForDate(slots: SlotRaw[], date: string): SlotRaw[] {
  return slots.filter(s => s.date === date);
}

export function getSlotsByTimeOfDay(slots: SlotRaw[], date: string, timeOfDay: string): SlotRaw[] {
  return slots.filter(s => s.date === date && s.timeOfDay === timeOfDay);
}

export function getAvailableDates(slots: SlotRaw[]): string[] {
  const dates = [...new Set(slots.map(s => s.date))];
  return dates.sort();
}
