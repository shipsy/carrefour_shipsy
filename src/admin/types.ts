/* ============================================================
   Shipsy Admin Console — Type Definitions
   Covers every RFP dimension for Carrefour Belgium
   ============================================================ */

// ── Core Enums ──────────────────────────────────────────────

export type BusinessLine = 'LAD' | 'Drive' | 'FastDelivery';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening';
export type CustomerSegment = 'standard' | 'plus' | 'premium' | 'vip';
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type ReservationStrategy = 'BALANCED' | 'START' | 'END' | 'ALTERNATE';
export type FleetType = 'own_fleet' | '3pl';
export type OverrideScope = 'zone' | 'store' | 'slot' | 'carrier' | 'business_line';
export type RulePriority = 'customer_specific' | 'segment' | 'promo' | 'generic';
export type FallbackMode = 'static_slots' | 'hide_delivery' | 'show_message' | 'last_known';
export type CapacityDimension = 'orders' | 'items' | 'weight_kg' | 'volume_m3';
export type ZoneType = 'postal_code' | 'radius' | 'polygon';
export type StoreType = 'Hypermarket' | 'Market' | 'Express' | 'LAD_Hub';
export type CarrierStatus = 'active' | 'inactive' | 'suspended';
export type ExperimentStatus = 'draft' | 'running' | 'paused' | 'completed';
export type AuditAction = 'create' | 'update' | 'delete' | 'override' | 'emergency';
export type TemplateFrequency = 'daily' | 'weekly' | 'monthly';
export type GoodType = 'food' | 'frozen' | 'non_food' | 'bulky' | 'dph';

// ── Zone Management ─────────────────────────────────────────

export interface Zone {
  id: string;
  name: string;
  type: ZoneType;
  postalCodes: string[];
  radiusKm?: number;
  storeIds: string[];
  businessLines: BusinessLine[];
  isActive: boolean;
}

// ── Store / Warehouse Management ────────────────────────────

export interface AdminStore {
  id: string;
  name: string;
  type: StoreType;
  address: string;
  postalCode: string;
  city: string;
  lat: number;
  lng: number;
  businessLines: BusinessLine[];
  isActive: boolean;
  zoneIds: string[];
  maxDailyOrders: number;
  operatingHours: { open: string; close: string };
}

// ── Slot Configuration ──────────────────────────────────────

export interface SlotTemplate {
  id: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  timeOfDay: TimeOfDay;
  label: string;
  businessLines: BusinessLine[];
  isActive: boolean;
}

export interface CapacityRule {
  dimension: CapacityDimension;
  limit: number;
  isActive: boolean;
}

export interface CutOffRule {
  id: string;
  scope: string;
  scopeValue: string;
  cutOffHours: number;
  cutOffMinutes: number;
  businessLine: BusinessLine | 'all';
}

export interface SlotConfiguration {
  templates: SlotTemplate[];
  capacityRules: CapacityRule[];
  cutOffRules: CutOffRule[];
  reservationPct: number;
  reservationStrategy: ReservationStrategy;
  reservationDurationSec: number;
  segmentReservations: Record<CustomerSegment, number>;
  waveCapacity: { ordersPerWave: number; itemsPerWave: number; waveDurationMin: number };
}

// ── Yield / Pricing ─────────────────────────────────────────

export interface RateCard {
  businessLine: BusinessLine;
  baseFee: number;
  floorPrice: number;
  isActive: boolean;
}

export interface SegmentPricing {
  segment: CustomerSegment;
  discountPct: number;
  freeDeliveryThreshold: number;
  maxDeliveryFee: number;
}

export interface SurgeTier {
  thresholdPct: number;
  surchargeAmount: number;
}

export interface YieldRule {
  id: string;
  name: string;
  priority: number;
  type: 'cumulative' | 'exclusive';
  condition: string;
  adjustment: string;
  isActive: boolean;
}

export interface ManualOverride {
  id: string;
  date: string;
  slotLabel: string;
  timeOfDay: TimeOfDay;
  price: number;
  reason: string;
  expiresAt: string;
  createdBy: string;
}

export interface YieldConfiguration {
  rateCards: RateCard[];
  segmentPricing: SegmentPricing[];
  timeOfDayWeights: Record<TimeOfDay, number>;
  dayOfWeekWeights: Record<DayOfWeek, number>;
  surgeTiers: SurgeTier[];
  greenDiscountPct: number;
  greenCriteria: string[];
  psychologicalRounding: boolean;
  roundingRule: '.99' | '.95' | '.49' | 'nearest_0.50';
  priceLockDurationMin: number;
  maxDemandFactor: number;
  rules: YieldRule[];
  manualOverrides: ManualOverride[];
}

// ── Carrier Management ──────────────────────────────────────

export interface Carrier {
  id: string;
  name: string;
  type: FleetType;
  status: CarrierStatus;
  businessLines: BusinessLine[];
  zoneIds: string[];
  costPerDelivery: number;
  slaHours: number;
  maxDailyCapacity: number;
  apiEndpoint: string;
  apiStatus: 'connected' | 'error' | 'not_configured';
  isDedicated: boolean;
  vehicleTypes: string[];
}

// ── Allocation Rules ────────────────────────────────────────

export interface AllocationRule {
  id: string;
  businessLine: BusinessLine;
  priority: number;
  carrierId: string;
  zoneCoverage: string[];
  maxPct: number;
  isActive: boolean;
}

// ── Customer Segments ───────────────────────────────────────

export interface SegmentDefinition {
  id: CustomerSegment;
  name: string;
  description: string;
  color: string;
  capacityReservePct: number;
  cutOffExtensionMin: number;
  pricingDiscountPct: number;
  freeDeliveryThreshold: number;
  priorityLevel: number;
  isActive: boolean;
}

// ── Holidays ────────────────────────────────────────────────

export interface Holiday {
  id: string;
  name: string;
  date: string;
  isNational: boolean;
  affectedStoreIds: string[] | 'all';
  action: 'close_all_slots' | 'reduce_capacity' | 'custom_hours';
  customHours?: { open: string; close: string };
  capacityPct?: number;
}

// ── Slot Templates ──────────────────────────────────────────

export interface SlotTemplateConfig {
  id: string;
  name: string;
  frequency: TemplateFrequency;
  businessLine: BusinessLine;
  storeIds: string[] | 'all';
  slots: SlotTemplate[];
  holidayBehavior: 'skip' | 'reduce_50' | 'custom';
  isActive: boolean;
  activeSince: string;
}

// ── Emergency Overrides ─────────────────────────────────────

export interface EmergencyOverride {
  id: string;
  type: 'close_slot' | 'pull_cutoff' | 'force_book' | 'reduce_capacity' | 'increase_capacity';
  scope: OverrideScope;
  scopeValue: string;
  reason: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
  params: Record<string, unknown>;
}

// ── A/B Testing ─────────────────────────────────────────────

export interface ABExperiment {
  id: string;
  name: string;
  description: string;
  status: ExperimentStatus;
  variantA: { name: string; config: string };
  variantB: { name: string; config: string };
  trafficSplitPct: number;
  metric: string;
  startDate: string;
  endDate: string;
  resultSummary?: { variantAValue: number; variantBValue: number; winner: 'A' | 'B' | 'inconclusive' };
}

// ── System Config ───────────────────────────────────────────

export interface SystemConfig {
  fallbackMode: FallbackMode;
  fallbackMessage: string;
  healthCheckIntervalSec: number;
  maxOverbookingPct: number;
  concurrencyLockTimeoutSec: number;
  waitlistEnabled: boolean;
  waitlistMaxSize: number;
  raceConditionStrategy: 'optimistic_lock' | 'pessimistic_lock' | 'queue';
  priceLockEnabled: boolean;
  priceLockDurationMin: number;
}

// ── Audit Log ───────────────────────────────────────────────

export interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  section: string;
  action: AuditAction;
  target: string;
  before: string;
  after: string;
}

// ── Bulk Operations ─────────────────────────────────────────

export interface BulkOperation {
  id: string;
  type: 'slot_config' | 'price_change' | 'closure' | 'capacity_change';
  targetStores: string[];
  params: Record<string, unknown>;
  status: 'preview' | 'applied' | 'rolled_back';
  appliedAt?: string;
  appliedBy?: string;
}
