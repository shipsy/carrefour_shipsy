import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

interface Props {
  slotId: string | undefined;
  durationSeconds?: number;
}

export default function ReservationBanner({ slotId, durationSeconds = 600 }: Props) {
  const { t } = useLanguage();
  const [remaining, setRemaining] = useState(durationSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset timer when slotId changes
  useEffect(() => {
    if (!slotId) return;
    setRemaining(durationSeconds);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [slotId, durationSeconds]);

  if (!slotId) return null;

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const expired = remaining <= 0;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={expired ? 'expired' : 'active'}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2 text-[13px] font-medium"
        style={{
          background: expired ? '#FEF3C7' : '#EAF2FB',
          color: expired ? '#92400E' : 'var(--color-cf-blue)',
          padding: '10px 16px',
          borderRadius: '8px',
          marginBottom: '12px',
        }}
      >
        {expired ? (
          <>
            <AlertTriangle size={15} />
            <span>{t('reservationExpired')}</span>
          </>
        ) : (
          <>
            <Lock size={14} />
            <span>{t('slotReserved')}</span>
            <span
              className="font-bold tabular-nums"
              style={{ fontVariantNumeric: 'tabular-nums', minWidth: '44px' }}
            >
              {timeStr}
            </span>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
