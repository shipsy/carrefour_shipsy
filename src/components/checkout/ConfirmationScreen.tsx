import { motion } from 'motion/react';
import { useLanguage } from '../../hooks/useLanguage';
import EcoBadge from '../shared/EcoBadge';

interface Props {
  deliveryFee: number;
  slotTime: string;
  slotDate: string;
  co2Saved: number;
  onReset: () => void;
  allocationInfo?: string;
  consignmentRef?: string;
}

export default function ConfirmationScreen({
  deliveryFee,
  slotTime,
  slotDate,
  co2Saved,
  onReset,
  allocationInfo,
  consignmentRef,
}: Props) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <motion.div
        className="text-center w-full"
        style={{
          background: '#fff',
          borderRadius: '14px',
          padding: '50px 24px',
          boxShadow: '0 4px 14px rgba(15,23,42,.08)',
          maxWidth: '680px',
          margin: '30px auto',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Green checkmark circle */}
        <motion.div
          className="inline-flex items-center justify-center text-white text-[40px] mb-5"
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'var(--color-cf-success, #0F8F4A)',
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14 }}
        >
          &#10003;
        </motion.div>

        <h2
          className="m-0 mb-2 font-extrabold text-[26px]"
          style={{ color: 'var(--color-cf-dark)' }}
        >
          {t('orderConfirmed')}
        </h2>
        <p
          className="text-sm max-w-[480px] mx-auto mb-4"
          style={{ color: 'var(--color-cf-muted)' }}
        >
          Thanks &mdash; your order has been placed. You&apos;ll receive a confirmation email shortly.
        </p>

        {/* Summary card */}
        <div
          className="text-left mx-auto"
          style={{
            background: '#FAFBFC',
            borderRadius: '10px',
            padding: '18px',
            maxWidth: '480px',
            margin: '20px auto',
          }}
        >
          {consignmentRef && (
            <div className="flex justify-between py-1.5 text-[13px]">
              <span>Order ID</span>
              <strong style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{consignmentRef}</strong>
            </div>
          )}
          <div className="flex justify-between py-1.5 text-[13px]">
            <span>{t('yourTimeslot')}</span>
            <strong>{slotDate} &middot; {slotTime}</strong>
          </div>
          {allocationInfo && (
            <div className="flex justify-between py-1.5 text-[13px]">
              <span>{t('deliveredBy')}</span>
              <strong>{allocationInfo}</strong>
            </div>
          )}
          <div className="flex justify-between py-1.5 text-[13px]">
            <span>{t('deliveryFee')}</span>
            <span className="font-semibold" style={{ color: 'var(--color-cf-blue)' }}>
              &euro;{deliveryFee.toFixed(2)}
            </span>
          </div>
          {co2Saved > 0 && (
            <div className="flex justify-between items-center py-1.5 text-[13px]">
              <span>{t('co2Saved')}</span>
              <EcoBadge co2Kg={co2Saved} />
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2.5 justify-center mt-5">
          <button
            type="button"
            onClick={onReset}
            className="font-bold text-sm"
            style={{
              background: '#fff',
              border: '1.5px solid var(--color-cf-blue)',
              color: 'var(--color-cf-blue)',
              padding: '11px 18px',
              borderRadius: '24px',
            }}
          >
            Start a new order
          </button>
          <button
            type="button"
            onClick={onReset}
            className="text-white font-bold text-sm"
            style={{
              background: 'var(--color-cf-blue)',
              border: 'none',
              padding: '11px 18px',
              borderRadius: '24px',
            }}
          >
            Back to home
          </button>
        </div>
      </motion.div>
    </div>
  );
}
