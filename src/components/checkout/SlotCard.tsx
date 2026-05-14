import clsx from 'clsx';
import { useLanguage } from '../../hooks/useLanguage';
import type { SlotRaw, YieldResult } from '../../types';
import PriceBadge from '../shared/PriceBadge';

interface Props {
  slot: SlotRaw;
  yieldResult?: YieldResult;
  shipsyEnabled: boolean;
  selected: boolean;
  onSelect: () => void;
}

const labelColors: Record<string, { bg: string; text: string }> = {
  Express: { bg: '#FEF3C7', text: '#92400E' },
  Standard: { bg: '#EAF2FB', text: '#1659CB' },
  Flex: { bg: '#ECFDF5', text: '#065F46' },
};

export default function SlotCard({ slot, yieldResult, shipsyEnabled, selected, onSelect }: Props) {
  const { t } = useLanguage();
  const timeRange = `${slot.startTime} - ${slot.endTime}`;
  const pct = slot.capacityTotal > 0 ? (slot.capacityUsed / slot.capacityTotal) * 100 : 0;
  const isLastSpots = pct > 70 && pct < 90;

  /* Without Shipsy — plain Carrefour style */
  if (!shipsyEnabled) {
    return (
      <div
        className={clsx(
          'items-center',
          selected && 'rounded-lg',
        )}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto auto',
          gap: '14px',
          padding: '14px 4px',
          borderBottom: '1px solid var(--color-cf-border)',
          background: selected ? '#EAF2FB' : 'transparent',
        }}
      >
        <div>
          <span className="font-semibold text-sm">{timeRange}</span>
        </div>
        <div />
        <div>
          {slot.isAvailable ? (
            selected ? (
              <span
                className="font-bold text-[13px] min-w-[80px] text-right"
                style={{ color: 'var(--color-cf-success, #0F8F4A)' }}
              >
                ✓ Selected
              </span>
            ) : (
              <span
                className="font-bold text-[13px] min-w-[80px] text-right cursor-pointer hover:underline"
                style={{ color: 'var(--color-cf-blue)' }}
                onClick={onSelect}
              >
                Choose &rarr;
              </span>
            )
          ) : (
            <span className="text-sm" style={{ color: 'var(--color-cf-muted)' }}>
              Unavailable
            </span>
          )}
        </div>
      </div>
    );
  }

  /* With Shipsy — enriched with capacity, price, badges, cut-off */
  const isFull = pct > 85 && !slot.isAvailable;
  const isSurge = yieldResult ? yieldResult.surgeAmount > 0 : false;
  const dimmed = isFull;

  // Resolve slot label translation key
  const labelKey = slot.slotLabel?.toLowerCase() as 'express' | 'standard' | 'flex' | undefined;
  const labelText = labelKey ? t(labelKey) : undefined;
  const labelStyle = slot.slotLabel ? labelColors[slot.slotLabel] : undefined;

  return (
    <div
      className={clsx(
        'items-center',
        selected && 'rounded-lg',
        dimmed && 'opacity-50',
      )}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto auto auto',
        gap: '14px',
        padding: '14px 4px',
        borderBottom: '1px solid var(--color-cf-border)',
        background: selected ? '#EAF2FB' : 'transparent',
      }}
    >
      {/* Time + badge + cut-off */}
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          {isLastSpots && !slot.isPastCutOff && (
            <span
              className="inline-block text-[11px] font-bold text-white"
              style={{
                background: 'var(--color-cf-warning, #E2A400)',
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              Last spots!
            </span>
          )}
          <span className="font-semibold text-sm">{timeRange}</span>
          {labelText && labelStyle && (
            <span
              className="inline-block text-[10px] font-bold uppercase tracking-wide"
              style={{
                background: labelStyle.bg,
                color: labelStyle.text,
                padding: '2px 7px',
                borderRadius: '4px',
              }}
            >
              {labelText}
            </span>
          )}
        </div>
        {/* Cut-off label */}
        <div className="text-[11px] mt-0.5" style={{ color: 'var(--color-cf-muted)' }}>
          {t('orderBy')} {slot.cutOffTime}
        </div>
      </div>

      {/* Price */}
      <div className="text-right min-w-[60px]">
        {yieldResult && (
          <PriceBadge
            displayFee={yieldResult.displayFee}
            baseFee={yieldResult.baseFee}
            isGreen={slot.isGreen && yieldResult.greenDiscount > 0}
            isSurge={isSurge}
          />
        )}
      </div>

      {/* Pricing factors */}
      <div className="shrink-0">
        {yieldResult && yieldResult.pricingFactors.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {yieldResult.pricingFactors.map((f) => {
              let bg = '#F3F4F6'; let color = '#6B7280'; // default gray
              if (f.includes('Peak') || f.includes('High demand')) { bg = '#FEF3C7'; color = '#92400E'; } // amber
              else if (f.includes('Surge')) { bg = '#FEE2E2'; color = '#991B1B'; } // red
              else if (f.includes('Eco') || f.includes('Off-peak')) { bg = '#D1FAE5'; color = '#065F46'; } // green
              else if (f.includes('Floor')) { bg = '#DBEAFE'; color = '#1E40AF'; } // blue
              else if (f.includes('Manual')) { bg = '#EDE9FE'; color = '#5B21B6'; } // purple
              return (
                <span
                  key={f}
                  className="text-[9px] font-medium rounded-full px-1.5 py-0.5"
                  style={{ background: bg, color }}
                >
                  {f}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Action */}
      <div>
        {slot.isAvailable ? (
          selected ? (
            <span
              className="font-bold text-[13px] min-w-[80px] text-right"
              style={{ color: 'var(--color-cf-success, #0F8F4A)' }}
            >
              ✓ Selected
            </span>
          ) : (
            <span
              className="font-bold text-[13px] min-w-[80px] text-right cursor-pointer hover:underline"
              style={{ color: 'var(--color-cf-blue)' }}
              onClick={onSelect}
            >
              Choose &rarr;
            </span>
          )
        ) : (
          <span className="text-sm" style={{ color: 'var(--color-cf-muted)' }}>
            Unavailable
          </span>
        )}
      </div>
    </div>
  );
}
