import type { CartItem, DeliveryMethod } from '../types';

const API_KEY_ID = '1370c123fcfe3ffe5cbddb5605fd6f';
const AUTH_HEADER = `Basic ${btoa(`${API_KEY_ID}:`)}`;

const PRODUCT_WEIGHTS: Record<string, { weight: number; volume: number; volumetric_weight: number }> = {
  p1:  { weight: 5.0, volume: 15000, volumetric_weight: 3.0 },
  p3:  { weight: 9.0, volume: 20000, volumetric_weight: 4.0 },
  p5:  { weight: 0.1, volume: 500,   volumetric_weight: 0.1 },
  p8:  { weight: 0.5, volume: 2000,  volumetric_weight: 0.4 },
  p9:  { weight: 1.0, volume: 2000,  volumetric_weight: 0.4 },
  p11: { weight: 0.5, volume: 1000,  volumetric_weight: 0.2 },
};

const DEFAULT_WEIGHT = { weight: 0.5, volume: 1000, volumetric_weight: 0.2 };

export interface CnCreateResponse {
  success: boolean;
  reference_number: string;
  pieces: { reference_number: string; product_code?: string }[];
  courier_partner: string | null;
  chargeable_weight: number;
  error?: { message: string };
}

export interface SlotInfo {
  date: string;
  startTime: string;
  endTime: string;
}

export function buildCnPayload(
  items: CartItem[],
  address: string,
  _deliveryMethod: DeliveryMethod,
  slot?: SlotInfo,
  phone?: string,
) {
  return {
    customer_code: 'CARREFOUR',
    load_type: 'NON-DOCUMENT',
    service_type_id: 'PREMIUM',
    consignment_type: 'forward',
    declared_currency: 'EUR',
    action_type: 'delivery',
    hub_code: '4660',
    ...(slot ? {
      delivery_time_slot_start: slot.startTime,
      delivery_time_slot_end: slot.endTime,
    } : {}),
    origin_details: {
      name: 'Carrefour Hypermarket Berchem-Ste-Agathe',
      phone: '+3224658700',
      address_line_1: 'Avenue Charles Quint 560',
      pincode: '1082',
      city: 'Berchem-Sainte-Agathe',
      country: 'Belgium',
      latitude: '50.8620',
      longitude: '4.2870',
    },
    destination_details: {
      name: 'Customer',
      phone: phone ? `+32${phone.replace(/\D/g, '')}` : '+32000000000',
      email: 'phanindra.karunakaram@shipsy.io',
      address_line_1: address,
      pincode: '1080',
      city: 'Molenbeek-Saint-Jean',
      country: 'Belgium',
      latitude: '50.8561',
      longitude: '4.3267',
    },
    pieces_detail: items.map((item, idx) => {
      const pw = PRODUCT_WEIGHTS[item.id] ?? DEFAULT_WEIGHT;
      return {
        reference_number: `P${String(idx + 1).padStart(3, '0')}`,
        description: item.name,
        quantity: item.quantity,
        weight: pw.weight,
        weight_unit: 'KG',
        volume: pw.volume,
        volume_unit: 'ccm',
        volumetric_weight: pw.volumetric_weight,
        chargeable_weight: Math.max(pw.weight, pw.volumetric_weight),
      };
    }),
  };
}

export async function createConsignment(
  items: CartItem[],
  address: string,
  deliveryMethod: DeliveryMethod,
  slot?: SlotInfo,
  phone?: string,
): Promise<CnCreateResponse> {
  const payload = buildCnPayload(items, address, deliveryMethod, slot, phone);

  const res = await fetch(
    '/shipsy-api/api/client/integration/consignment/upload/softdata/v2',
    {
      method: 'POST',
      headers: {
        Authorization: AUTH_HEADER,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );

  const data = await res.json();
  return data as CnCreateResponse;
}
