import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import clsx from 'clsx';
import { useLanguage } from '../../hooks/useLanguage';
import type { SlotRaw, YieldResult, TimeOfDay } from '../../types';
import SlotCard from './SlotCard';
import ReservationBanner from '../shared/ReservationBanner';

interface Props {
  slots: SlotRaw[];
  yieldResults: Map<string, YieldResult>;
  shipsyEnabled: boolean;
  onSelectSlot: (slot: SlotRaw) => void;
  selectedSlotId?: string;
  onClose?: () => void;
  phone?: string;
  onPhoneChange?: (v: string) => void;
  deliveryMethod?: 'home' | 'fast' | 'collect';
}

const timeOfDayKeys: TimeOfDay[] = ['morning', 'afternoon', 'evening'];

function getUniqueDates(slots: SlotRaw[]): string[] {
  const set = new Set(slots.map((s) => s.date));
  return Array.from(set).sort();
}

function formatDatePill(dateStr: string, lang: string): { day: string; num: string; month: string } {
  const d = new Date(dateStr);
  const dayNames = lang === 'nl'
    ? ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = lang === 'nl'
    ? ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return {
    day: dayNames[d.getDay()],
    num: String(d.getDate()),
    month: monthNames[d.getMonth()],
  };
}

export default function SlotPicker({
  slots,
  yieldResults,
  shipsyEnabled,
  onSelectSlot,
  selectedSlotId,
  phone,
  onPhoneChange,
  deliveryMethod = 'home',
}: Props) {
  const { t, lang } = useLanguage();
  const allDates = useMemo(() => getUniqueDates(slots), [slots]);
  // Fast delivery: only show today's date
  const dates = useMemo(() => {
    if (deliveryMethod === 'fast') {
      const n = new Date(); const today = `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
      // Show today if it has slots, otherwise show the first available date
      return allDates.includes(today) ? [today] : allDates.slice(0, 1);
    }
    return allDates;
  }, [allDates, deliveryMethod]);
  const [selectedDate, setSelectedDate] = useState(dates[0] ?? '');
  // Auto-select current time-of-day based on real time
  const currentTod = (): TimeOfDay => {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  };
  const [selectedTod, setSelectedTod] = useState<TimeOfDay>(currentTod());

  // When dates change (delivery method switch), auto-select first date + current ToD
  useEffect(() => {
    if (dates.length > 0 && !dates.includes(selectedDate)) {
      setSelectedDate(dates[0]);
    }
    setSelectedTod(currentTod());
  }, [dates]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredSlots = useMemo(() => {
    let filtered = slots.filter((s) => s.date === selectedDate && s.timeOfDay === selectedTod);
    // Without Shipsy: hide overlapping/specialty slots — show only Standard and unlabelled
    if (!shipsyEnabled) {
      filtered = filtered.filter((s) => !s.slotLabel || s.slotLabel === 'Standard');
    }
    return filtered;
  }, [slots, selectedDate, selectedTod, shipsyEnabled]);

  // Fee range for the selected date (only when Shipsy is on)
  const feeRange = useMemo(() => {
    if (!shipsyEnabled) return null;
    const daySlots = slots.filter((s) => s.date === selectedDate);
    const fees = daySlots
      .map((s) => yieldResults.get(s.id))
      .filter(Boolean)
      .map((yr) => yr!.finalFee);
    if (fees.length === 0) return null;
    return { min: Math.min(...fees), max: Math.max(...fees) };
  }, [shipsyEnabled, slots, selectedDate, yieldResults]);

  return (
    <div>
      {/* Section heading */}
      <h3
        className="flex items-center gap-2 m-0 mb-1.5 font-extrabold"
        style={{ fontSize: '18px' }}
      >
        ⏱️ {t('yourTimeslot')}
      </h3>
      <div className="text-[13px] mb-3.5" style={{ color: 'var(--color-cf-muted)' }}>
        {selectedDate && (() => {
          const { day, num, month } = formatDatePill(selectedDate, lang);
          return `${day}, ${num} ${month}`;
        })()}
      </div>

      {/* Day chips */}
      <div className="flex gap-2 mb-3.5 flex-wrap">
        {dates.map((d) => {
          const { day, num, month } = formatDatePill(d, lang);
          const active = d === selectedDate;
          return (
            <button
              key={d}
              type="button"
              onClick={() => setSelectedDate(d)}
              className={clsx(
                'text-center cursor-pointer transition-all shrink-0',
              )}
              style={{
                border: `1px solid ${active ? 'var(--color-cf-blue)' : 'var(--color-cf-border)'}`,
                background: active ? 'var(--color-cf-blue)' : '#fff',
                color: active ? '#fff' : 'inherit',
                borderRadius: '10px',
                padding: '10px 14px',
                minWidth: '64px',
              }}
            >
              <div className="text-[11px] font-semibold uppercase" style={{ letterSpacing: '.5px' }}>
                {day}
              </div>
              <div className="text-lg font-extrabold">{num}</div>
              <div className="text-[11px] uppercase">{month}</div>
            </button>
          );
        })}
      </div>

      {/* Time-of-day tabs */}
      <div
        className="flex gap-6 mb-2"
        style={{ borderBottom: '1px solid var(--color-cf-border)' }}
      >
        {timeOfDayKeys.map((tod) => (
          <button
            key={tod}
            type="button"
            onClick={() => setSelectedTod(tod)}
            className="py-2.5 font-semibold text-sm cursor-pointer"
            style={{
              color: selectedTod === tod ? 'var(--color-cf-blue)' : 'var(--color-cf-muted)',
              fontWeight: selectedTod === tod ? 700 : 600,
              borderBottom: selectedTod === tod ? '2px solid var(--color-cf-blue)' : '2px solid transparent',
              background: 'none',
              border: 'none',
              borderBottomWidth: '2px',
              borderBottomStyle: 'solid',
              borderBottomColor: selectedTod === tod ? 'var(--color-cf-blue)' : 'transparent',
            }}
          >
            {t(tod)}
          </button>
        ))}
      </div>

      {/* Fee range banner removed */}

      {/* Reservation countdown */}
      {shipsyEnabled && selectedSlotId && (
        <ReservationBanner slotId={selectedSlotId} />
      )}

      {/* Slot list */}
      <div className="my-3.5">
        {filteredSlots.length === 0 && (
          <p className="text-sm text-center py-6" style={{ color: 'var(--color-cf-muted)' }}>
            {t('unavailable')}
          </p>
        )}
        {filteredSlots.map((slot, i) => (
          <motion.div
            key={slot.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <SlotCard
              slot={slot}
              yieldResult={yieldResults.get(slot.id)}
              shipsyEnabled={shipsyEnabled}
              selected={slot.id === selectedSlotId}
              onSelect={() => onSelectSlot(slot)}
            />
          </motion.div>
        ))}
      </div>

      {/* Phone number input */}
      <div className="mt-[18px]">
        <label className="block font-semibold text-[13px] mb-1.5">
          Phone number (for delivery updates)
        </label>
        <div
          className="flex items-center gap-1.5 bg-white"
          style={{
            border: '1px solid var(--color-cf-border)',
            borderRadius: '8px',
            padding: '6px 10px',
          }}
        >
          <span className="text-[13px]" style={{ color: 'var(--color-cf-muted)' }}>
            🇧🇪 +32
          </span>
          <input
            type="text"
            placeholder="Enter your phone number here"
            className="flex-1 border-none outline-none py-2 px-1 text-sm"
            value={phone ?? ''}
            onChange={e => onPhoneChange?.(e.target.value)}
          />
        </div>
      </div>

      {/* Optional comment */}
      <div className="mt-3.5">
        <label className="block font-semibold text-[13px] mb-1.5">
          Forgot something? A note for the prep team?
        </label>
        <textarea
          placeholder="Optional comment..."
          maxLength={200}
          className="w-full text-[13px] resize-y"
          style={{
            border: '1px solid var(--color-cf-border)',
            borderRadius: '8px',
            padding: '10px',
            fontFamily: 'inherit',
            minHeight: '60px',
          }}
        />
        <div className="text-[11px] mt-1" style={{ color: 'var(--color-cf-muted)' }}>
          Max 200 characters
        </div>
      </div>
    </div>
  );
}
