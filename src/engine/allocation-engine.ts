import type { AllocationConfig, AllocationResult, DeliveryMethod } from '../types';

export function allocateFleet(
  deliveryMethod: DeliveryMethod,
  config: AllocationConfig
): AllocationResult {
  switch (deliveryMethod) {
    case 'home': {
      const useOwnFleet = Math.random() * 100 < config.homeDelivery.ownFleetPct;
      if (useOwnFleet) {
        return {
          fleetType: 'own_fleet',
          estimatedCost: 4.20,
          serviceability: true,
          reason: `Own fleet assigned (${config.homeDelivery.ownFleetPct}% own fleet policy)`,
        };
      }
      const partner = config.homeDelivery.partners[Math.floor(Math.random() * config.homeDelivery.partners.length)];
      return {
        fleetType: '3pl_partner',
        partnerName: partner,
        estimatedCost: 5.80,
        serviceability: true,
        reason: `3PL partner ${partner} assigned (${100 - config.homeDelivery.ownFleetPct}% 3PL allocation)`,
      };
    }
    case 'fast': {
      const partner = config.fastDelivery.partners[0];
      return {
        fleetType: '3pl_partner',
        partnerName: partner,
        estimatedCost: 7.50,
        serviceability: true,
        reason: `Fast delivery partner ${partner} assigned (electric cargo bike)`,
      };
    }
    case 'collect':
      return {
        fleetType: 'store_pickup',
        estimatedCost: 0,
        serviceability: true,
        reason: 'Customer pickup at selected store',
      };
  }
}
