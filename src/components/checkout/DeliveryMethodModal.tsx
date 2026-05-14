import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';
import { useLanguage } from '../../hooks/useLanguage';
import type { DeliveryMethod, Store } from '../../types';
import StoreSelector from './StoreSelector';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (method: DeliveryMethod, storeId?: string) => void;
  address: string;
  onAddressChange: (addr: string) => void;
  stores: Store[];
}

const methods: {
  method: DeliveryMethod;
  protoKey: 'home' | 'fast' | 'pickup';
  emoji: string;
  label: string;
  sub: string;
}[] = [
  { method: 'home', protoKey: 'home', emoji: '🚚', label: 'Home Delivery', sub: 'Within 24h' },
  { method: 'fast', protoKey: 'fast', emoji: '⚡', label: 'Fast Delivery', sub: 'Within 2h' },
  { method: 'collect', protoKey: 'pickup', emoji: '🏪', label: 'Click & Collect', sub: 'From a store' },
];

export default function DeliveryMethodModal({ open, onClose, onSelect, address, onAddressChange, stores }: Props) {
  const { t } = useLanguage();
  const [selectedBl, setSelectedBl] = useState<DeliveryMethod | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  if (!open) return null;

  const needStore = selectedBl === 'collect' || selectedBl === 'fast';
  const canConfirm = selectedBl && address.trim().length > 3 && (!needStore || selectedStoreId);

  function handleConfirm() {
    if (!canConfirm || !selectedBl) return;
    onSelect(selectedBl, selectedStoreId ?? undefined);
    setSelectedBl(null);
    setSelectedStoreId(null);
  }

  function handleSelectBl(m: DeliveryMethod) {
    setSelectedBl(m);
    setSelectedStoreId(null);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(15,23,42,.55)', padding: '20px', overflowY: 'auto' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white overflow-hidden"
            style={{
              borderRadius: '16px',
              width: '100%',
              maxWidth: needStore ? '920px' : '560px',
              boxShadow: '0 10px 40px rgba(15,23,42,.18)',
              transition: 'max-width .2s',
            }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div
              className="flex items-center px-[22px] py-[18px]"
              style={{ borderBottom: '1px solid var(--color-cf-border)' }}
            >
              <span style={{ width: '32px' }} />
              <h2
                className="flex-1 text-center m-0 font-extrabold text-lg"
                style={{ color: 'var(--color-cf-dark)' }}
              >
                {t('howToShop')}
              </h2>
              <span
                className="text-[22px] cursor-pointer w-8 h-8 inline-flex items-center justify-center rounded-full hover:bg-gray-100"
                style={{ color: 'var(--color-cf-muted)' }}
                onClick={onClose}
              >
                &times;
              </span>
            </div>

            {/* Body */}
            <div className="p-[22px]">
              <h4 className="font-bold text-sm m-0 mb-1.5">{t('address')}</h4>
              <p className="text-[13px] m-0 mb-4" style={{ color: 'var(--color-cf-muted)' }}>
                {t('enterAddress')}
              </p>

              {/* Address input with Belgian flag */}
              <div
                className="flex items-center gap-2 bg-white mb-2.5"
                style={{
                  border: '1px solid var(--color-cf-border)',
                  borderRadius: '8px',
                  padding: '6px 10px',
                }}
              >
                <span className="text-lg">🇧🇪</span>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => onAddressChange(e.target.value)}
                  placeholder="Enter your address"
                  className="flex-1 border-none outline-none py-2 px-1 text-sm bg-transparent"
                  style={{ color: 'var(--color-cf-text, #1B2330)' }}
                />
                {address && (
                  <span
                    className="cursor-pointer"
                    style={{ color: 'var(--color-cf-muted)' }}
                    onClick={() => onAddressChange('')}
                  >
                    &times;
                  </span>
                )}
              </div>

              {/* Geolocation link */}
              <div
                className="flex items-center gap-2 font-semibold text-[13px] cursor-pointer pb-3.5"
                style={{ color: 'var(--color-cf-blue)' }}
              >
                📍 Use my current location
              </div>

              {/* Business line tabs */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {methods.map(({ method, emoji, label, sub }) => (
                  <div
                    key={method}
                    className="text-center cursor-pointer transition-all"
                    style={{
                      border: `1.5px solid ${selectedBl === method ? 'var(--color-cf-blue)' : 'var(--color-cf-border)'}`,
                      background: selectedBl === method ? '#EAF2FB' : '#fff',
                      borderRadius: '10px',
                      padding: '14px 10px',
                    }}
                    onClick={() => handleSelectBl(method)}
                  >
                    <span className="text-[26px] block mb-1">{emoji}</span>
                    <div className="font-bold text-[13px]" style={{ color: 'var(--color-cf-text, #1B2330)' }}>
                      {label}
                    </div>
                    <div className="text-[11px]" style={{ color: 'var(--color-cf-muted)' }}>
                      {sub}
                    </div>
                  </div>
                ))}
              </div>

              {/* Store picker for collect & fast delivery */}
              {needStore && selectedBl && (
                <div className="mb-4">
                  <h4 className="font-bold text-sm mb-2.5">
                    {selectedBl === 'fast' ? 'Choose the store for fast delivery' : 'Choose the store that will prepare your order'}
                  </h4>
                  <StoreSelector
                    stores={stores.filter(s => s.businessLines.includes(selectedBl))}
                    selectedStoreId={selectedStoreId}
                    onSelectStore={setSelectedStoreId}
                    address={address}
                  />
                </div>
              )}

              {/* Confirm button */}
              <button
                type="button"
                className={clsx(
                  'w-full font-bold text-sm text-white py-[11px] px-[18px]',
                  !canConfirm && 'cursor-not-allowed',
                )}
                style={{
                  background: canConfirm ? 'var(--color-cf-blue)' : '#CFD4DA',
                  borderRadius: '24px',
                  border: 'none',
                }}
                disabled={!canConfirm}
                onClick={handleConfirm}
              >
                Continue
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
