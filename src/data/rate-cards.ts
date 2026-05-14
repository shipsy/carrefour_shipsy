import type { YieldConfig, SlotConfig, AllocationConfig } from '../types';

export const defaultYieldConfig: YieldConfig = {
  baseFees: { home: 5.99, fast: 8.99, collect: 0 },
  floorPrices: { home: 1.99, fast: 4.99, collect: 0 },
  surgeThreshold: 85,
  surgeFlatAmount: 2.0,
  greenDiscountPct: 25,
  timeOfDayWeights: { morning: 0.85, afternoon: 1.0, evening: 1.4 },
  dayOfWeekWeights: { Monday: 0.9, Tuesday: 0.85, Wednesday: 0.9, Thursday: 1.0, Friday: 1.15, Saturday: 1.3, Sunday: 0.7 },
  maxDemandFactor: 0.6,
  psychologicalRounding: true,
  manualOverrides: {},
};

export const defaultSlotConfig: SlotConfig = {
  slotsPerDay: [
    { startTime: '08:00', endTime: '09:00', timeOfDay: 'morning', slotLabel: 'Express' },
    { startTime: '08:00', endTime: '10:00', timeOfDay: 'morning', slotLabel: 'Standard' },
    { startTime: '08:00', endTime: '12:00', timeOfDay: 'morning', slotLabel: 'Flex' },
    { startTime: '10:00', endTime: '12:00', timeOfDay: 'morning', slotLabel: 'Standard' },
    { startTime: '12:00', endTime: '14:00', timeOfDay: 'afternoon' },
    { startTime: '14:00', endTime: '16:00', timeOfDay: 'afternoon' },
    { startTime: '16:00', endTime: '18:00', timeOfDay: 'afternoon' },
    { startTime: '17:00', endTime: '19:00', timeOfDay: 'evening' },
    { startTime: '18:00', endTime: '20:00', timeOfDay: 'evening' },
    { startTime: '19:00', endTime: '21:00', timeOfDay: 'evening' },
  ],
  capacityPerSlot: 40,
  reservationPct: 20,
  reservationStrategy: 'BALANCED',
  cutOffHoursBefore: 4,
};

export const defaultAllocationConfig: AllocationConfig = {
  homeDelivery: { ownFleetPct: 70, partners: ['bpost', 'DHL Express'] },
  fastDelivery: { partners: ['Gorillas', 'Flink', 'Deliveroo'] },
  clickCollect: { mode: 'store_pickup' },
};
