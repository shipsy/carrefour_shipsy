import type { SlotRaw, YieldConfig, YieldResult, DeliveryMethod } from '../types';
import { METHOD_TO_BL } from '../types';

// Click & Collect has dedicated time-of-day fees (from Sharvani's integration)
const CLICK_COLLECT_FEES_BY_TOD: Record<SlotRaw['timeOfDay'], number> = {
  morning: 2.99,
  afternoon: 1.99,
  evening: 4.99,
};

function psychologicalRound(price: number): number {
  if (price <= 0) return 0;
  const floor = Math.floor(price);
  if (price - floor < 0.50) return floor - 0.01 > 0 ? +(floor - 0.01).toFixed(2) : +(price).toFixed(2);
  return +(floor + 0.49).toFixed(2);
}

export function calculateDeliveryFee(
  slot: SlotRaw,
  config: YieldConfig,
  deliveryMethod: DeliveryMethod
): YieldResult {
  // Click & Collect: if admin hasn't set a base fee, use ToD-based default as base
  // This ensures C&C goes through the full yield engine (surge, DoW, ToD all apply)

  // Resolve fee using either delivery method key (home/fast/collect) or business line key (LAD/FastDelivery/Drive)
  const bl = METHOD_TO_BL[deliveryMethod]; // e.g. home → LAD
  const rawBase = config.baseFees[deliveryMethod] ?? config.baseFees[bl] ?? 0;
  const baseFee = (deliveryMethod === 'collect' && rawBase === 0)
    ? CLICK_COLLECT_FEES_BY_TOD[slot.timeOfDay]
    : rawBase;
  const rawFloor = config.floorPrices[deliveryMethod] ?? config.floorPrices[bl] ?? 0;
  const floorPrice = (deliveryMethod === 'collect' && rawFloor === 0)
    ? CLICK_COLLECT_FEES_BY_TOD[slot.timeOfDay] * 0.5
    : rawFloor;
  const capacityPct = slot.capacityUsed / slot.capacityTotal;

  // Check manual override first
  const manualOverride = config.manualOverrides[slot.id] ?? null;

  // Demand multiplier: scales with capacity usage
  const demandMultiplier = 1.0 + capacityPct * config.maxDemandFactor;

  // Time of day factor
  const timeOfDayFactor = config.timeOfDayWeights[slot.timeOfDay];

  // Day of week factor
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
  const slotDate = new Date(slot.date);
  const dayName = DAY_NAMES[slotDate.getDay()];
  const dayOfWeekFactor = config.dayOfWeekWeights?.[dayName] ?? 1.0;

  // Green discount
  const greenDiscount = slot.isGreen ? baseFee * (config.greenDiscountPct / 100) : 0;

  // Surge pricing
  const surgeAmount = (capacityPct * 100) >= config.surgeThreshold ? config.surgeFlatAmount : 0;

  // Calculate yield fee
  let yieldCalculatedFee: number;
  if (manualOverride !== null) {
    yieldCalculatedFee = manualOverride;
  } else {
    yieldCalculatedFee = baseFee * demandMultiplier * timeOfDayFactor * dayOfWeekFactor - greenDiscount + surgeAmount;
  }

  // Apply floor
  const finalFee = Math.max(yieldCalculatedFee, floorPrice);

  // Apply psychological rounding
  const displayValue = config.psychologicalRounding ? psychologicalRound(finalFee) : +finalFee.toFixed(2);

  // Build pricing factors for display
  const pricingFactors: string[] = [];
  if (manualOverride !== null) {
    pricingFactors.push(`Manual override: €${manualOverride.toFixed(2)}`);
  } else {
    if (timeOfDayFactor > 1.1) pricingFactors.push(`Peak hour +${Math.round((timeOfDayFactor - 1) * 100)}%`);
    if (timeOfDayFactor < 0.95) pricingFactors.push(`Off-peak -${Math.round((1 - timeOfDayFactor) * 100)}%`);
    if (demandMultiplier > 1.2) pricingFactors.push(`High demand ×${demandMultiplier.toFixed(1)}`);
    if (surgeAmount > 0) pricingFactors.push(`Surge +€${surgeAmount.toFixed(2)}`);
    if (greenDiscount > 0) pricingFactors.push(`Eco discount -€${greenDiscount.toFixed(2)}`);
    if (finalFee === floorPrice && yieldCalculatedFee < floorPrice) pricingFactors.push(`Floor price applied`);
  }
  if (pricingFactors.length === 0) pricingFactors.push('Standard rate');

  return {
    slotId: slot.id,
    baseFee,
    demandMultiplier: +demandMultiplier.toFixed(3),
    timeOfDayFactor,
    greenDiscount: +greenDiscount.toFixed(2),
    surgeAmount,
    manualOverride,
    yieldCalculatedFee: +yieldCalculatedFee.toFixed(2),
    floorPrice,
    finalFee: +displayValue.toFixed(2),
    displayFee: `€${displayValue.toFixed(2)}`,
    pricingFactors,
  };
}
