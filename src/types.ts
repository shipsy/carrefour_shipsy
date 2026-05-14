export type DemoStep = 'landing' | 'method' | 'store' | 'slots' | 'summary' | 'confirmation';
export type DeliveryMethod = 'home' | 'fast' | 'collect';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening';
export type CustomerSegment = 'standard' | 'plus' | 'premium';
export type Language = 'en' | 'nl';
export type ReservationStrategy = 'BALANCED' | 'START' | 'END' | 'ALTERNATE';
export type FleetType = 'own_fleet' | '3pl_partner' | 'store_pickup';

export interface Store {
  id: string;
  name: string;
  type: 'Hypermarkt' | 'Market' | 'Express';
  address: string;
  postalCode: string;
  city: string;
  distance_km: number;
  lat: number;
  lng: number;
  available: boolean;
  businessLines: DeliveryMethod[];
  mapX: number;
  mapY: number;
}

export interface SlotRaw {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  timeOfDay: TimeOfDay;
  capacityTotal: number;
  capacityUsed: number;
  isAvailable: boolean;
  isGreen: boolean;
  co2SavedKg: number;
  cutOffTime: string;
  isPastCutOff: boolean;
  slotLabel?: string;
}

export type DayOfWeekCheckout = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface YieldConfig {
  baseFees: Record<DeliveryMethod, number>;
  floorPrices: Record<DeliveryMethod, number>;
  surgeThreshold: number;
  surgeFlatAmount: number;
  greenDiscountPct: number;
  timeOfDayWeights: Record<TimeOfDay, number>;
  dayOfWeekWeights?: Record<DayOfWeekCheckout, number>;
  maxDemandFactor: number;
  psychologicalRounding: boolean;
  manualOverrides: Record<string, number>;
}

export interface SlotConfig {
  slotsPerDay: { startTime: string; endTime: string; timeOfDay: TimeOfDay; slotLabel?: string }[];
  capacityPerSlot: number;
  reservationPct: number;
  reservationStrategy: ReservationStrategy;
  cutOffHoursBefore: number;
}

export interface AllocationConfig {
  homeDelivery: { ownFleetPct: number; partners: string[] };
  fastDelivery: { partners: string[] };
  clickCollect: { mode: 'store_pickup' };
}

export interface YieldResult {
  slotId: string;
  baseFee: number;
  demandMultiplier: number;
  timeOfDayFactor: number;
  greenDiscount: number;
  surgeAmount: number;
  manualOverride: number | null;
  yieldCalculatedFee: number;
  floorPrice: number;
  finalFee: number;
  displayFee: string;
  pricingFactors: string[];
}

export interface AllocationResult {
  fleetType: FleetType;
  partnerName?: string;
  estimatedCost: number;
  serviceability: boolean;
  reason: string;
}

export interface ApiLogEntry {
  id: string;
  timestamp: number;
  endpoint: string;
  method: 'POST';
  requestPayload: Record<string, unknown>;
  responsePayload: Record<string, unknown>;
  latencyMs: number;
  status: 'pending' | 'success' | 'error';
  engine: 'slot-manager' | 'yield-engine' | 'allocation-engine';
}

export interface CartItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  unit: string;
  pricePerKg?: string;
  promoLabel?: string;
  image?: string;
}
