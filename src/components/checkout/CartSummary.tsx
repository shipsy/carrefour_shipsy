import { useLanguage } from '../../hooks/useLanguage';
import type { CartItem, DeliveryMethod } from '../../types';

interface Props {
  items: CartItem[];
  deliveryFee: number;
  greenDiscount: number;
  isGreenSlot: boolean;
  selectedSlotTime: string;
  selectedDate: string;
  onPlaceOrder: () => void;
  deliveryMethod?: DeliveryMethod;
}

const METHOD_LABELS: Record<DeliveryMethod, { emoji: string; title: string }> = {
  home: { emoji: '\u{1F69A}', title: 'Home Delivery' },
  fast: { emoji: '\u26A1', title: 'Fast Delivery' },
  collect: { emoji: '\u{1F3EA}', title: 'Click & Collect' },
};

export default function CartSummary({
  items,
  deliveryFee,
  greenDiscount,
  isGreenSlot,
  selectedSlotTime,
  selectedDate,
  onPlaceOrder,
  deliveryMethod = 'home',
}: Props) {
  const { t } = useLanguage();
  const ml = METHOD_LABELS[deliveryMethod];

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const prepFee = deliveryMethod === 'collect' ? 0 : deliveryMethod === 'fast' ? 2.99 : 4.50;
  const discountAmt = isGreenSlot ? greenDiscount : 0;
  const total = subtotal + deliveryFee + prepFee - discountAmt;
  const bonusPoints = Math.floor(subtotal * 0.5);

  return (
    <div
      className="overflow-hidden"
      style={{
        background: '#fff',
        borderRadius: '14px',
        boxShadow: '0 1px 2px rgba(15,23,42,.06)',
      }}
    >
      {/* Checkout header */}
      <div
        className="flex items-center justify-center relative"
        style={{
          padding: '16px 22px',
          borderBottom: '1px solid var(--color-cf-border)',
        }}
      >
        <span className="font-extrabold text-base">My basket</span>
        <span
          className="absolute right-4 flex items-center gap-1.5 text-xs"
          style={{ color: 'var(--color-cf-muted)' }}
        >
          🔒 100% secure payment
        </span>
      </div>

      {/* Grid: main + side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 0 }}>
        {/* Main: cart items */}
        <div className="p-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3.5"
              style={{
                padding: '10px 0',
                borderBottom: '1px solid var(--color-cf-border)',
              }}
            >
              {/* Emoji image */}
              <div
                className="flex items-center justify-center text-[32px] shrink-0"
                style={{
                  width: '60px',
                  height: '60px',
                  background: '#FAFBFC',
                  borderRadius: '8px',
                }}
              >
                {item.image || '📦'}
              </div>
              {/* Meta */}
              <div className="flex-1 min-w-0">
                <div className="text-[11px]" style={{ color: 'var(--color-cf-muted)' }}>
                  {item.brand}
                </div>
                <div className="text-[13px] font-semibold leading-tight">{item.name}</div>
                <div className="font-extrabold mt-1">&euro;{(item.price * item.quantity).toFixed(2)}</div>
                <div className="text-[11px]" style={{ color: 'var(--color-cf-muted)' }}>
                  {item.pricePerKg}
                </div>
              </div>
              {/* Stepper */}
              <div
                className="flex items-center overflow-hidden shrink-0"
                style={{
                  border: '1px solid var(--color-cf-blue)',
                  borderRadius: '6px',
                }}
              >
                <button
                  type="button"
                  className="w-[26px] h-[26px] bg-white font-extrabold text-sm"
                  style={{ color: 'var(--color-cf-blue)', border: 'none' }}
                >
                  −
                </button>
                <span
                  className="w-7 text-center font-bold text-[13px]"
                  style={{ color: 'var(--color-cf-blue)' }}
                >
                  {item.quantity}
                </span>
                <button
                  type="button"
                  className="w-[26px] h-[26px] bg-white font-extrabold text-sm"
                  style={{ color: 'var(--color-cf-blue)', border: 'none' }}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Side panel */}
        <div
          className="p-6"
          style={{
            background: '#FAFBFC',
            borderLeft: '1px solid var(--color-cf-border)',
          }}
        >
          <h3 className="flex items-center gap-2 m-0 mb-3.5 font-extrabold text-[15px]">
            {ml.emoji} {ml.title}
          </h3>

          {/* Delivery summary */}
          <div
            className="text-[13px] leading-relaxed mb-3.5"
            style={{ color: 'var(--color-cf-muted)' }}
          >
            <strong style={{ color: 'var(--color-cf-text, #1B2330)', display: 'block' }}>
              {selectedDate}
            </strong>
            {selectedSlotTime && (
              <span
                className="font-bold block mt-1"
                style={{ color: 'var(--color-cf-blue)' }}
              >
                📅 {selectedSlotTime}
              </span>
            )}
          </div>

          {/* Promo code */}
          <div className="flex gap-1.5 mb-3.5">
            <input
              type="text"
              placeholder="Promo code"
              className="flex-1 text-[13px]"
              style={{
                border: '1px solid var(--color-cf-border)',
                borderRadius: '8px',
                padding: '8px',
              }}
            />
            <button
              type="button"
              className="text-white font-bold"
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                background: 'var(--color-cf-blue)',
                border: 'none',
              }}
            >
              OK
            </button>
          </div>

          {/* Totals */}
          <div className="text-[13px]">
            <div className="flex justify-between py-1.5">
              <span>{t('subtotal')}</span>
              <span>&euro;{subtotal.toFixed(2)}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between py-1.5">
                <span>Delivery fee</span>
                <span>&euro;{deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between py-1.5">
              <span>Preparation fee</span>
              <span>&euro;{prepFee.toFixed(2)}</span>
            </div>
            {isGreenSlot && discountAmt > 0 && (
              <div
                className="flex justify-between py-1.5"
                style={{ color: 'var(--color-cf-success, #0F8F4A)' }}
              >
                <span>{t('ecoDiscount')}</span>
                <span>-&euro;{discountAmt.toFixed(2)}</span>
              </div>
            )}
            <div
              className="flex justify-between py-1.5 font-bold"
              style={{ color: 'var(--color-cf-blue)' }}
            >
              <span>Bonus points earned</span>
              <span>+{bonusPoints} pts</span>
            </div>
            <div
              className="flex justify-between font-extrabold text-base"
              style={{
                paddingTop: '10px',
                marginTop: '6px',
                borderTop: '1px solid var(--color-cf-border)',
              }}
            >
              <span>Estimated total</span>
              <span>&euro;{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Place order */}
          <button
            type="button"
            onClick={onPlaceOrder}
            className="w-full text-white text-sm font-bold mt-3.5"
            style={{
              background: 'var(--color-cf-success, #0F8F4A)',
              padding: '11px 18px',
              borderRadius: '24px',
              border: 'none',
            }}
          >
            {t('placeOrder')}
          </button>
        </div>
      </div>
    </div>
  );
}
