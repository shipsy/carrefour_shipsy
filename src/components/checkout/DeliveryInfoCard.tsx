import { useLanguage } from '../../hooks/useLanguage';
import type { DeliveryMethod } from '../../types';

interface Props {
  address: string;
  deliveryTime: string;
  deliveryMethod?: DeliveryMethod;
  onChangeMethod: () => void;
}

const methodEmoji: Record<DeliveryMethod, string> = {
  home: '🚚',
  fast: '⚡',
  collect: '🏪',
};

const methodLabel: Record<DeliveryMethod, string> = {
  home: 'Home Delivery',
  fast: 'Fast Delivery',
  collect: 'Click & Collect',
};

export default function DeliveryInfoCard({ address, deliveryTime, deliveryMethod, onChangeMethod }: Props) {
  const { t } = useLanguage();
  const emoji = deliveryMethod ? methodEmoji[deliveryMethod] : '📦';
  const label = deliveryMethod ? methodLabel[deliveryMethod] : 'Choose a delivery method';

  return (
    <div
      className="bg-white"
      style={{ borderBottom: '1px solid var(--color-cf-border)' }}
    >
      <div
        className="max-w-[1200px] mx-auto flex items-center gap-[18px] flex-wrap text-[13px]"
        style={{
          padding: '10px 18px',
          color: 'var(--color-cf-muted)',
        }}
      >
        <span>{emoji} {label}</span>
        {address && (
          <span>
            Delivery to: <strong style={{ color: 'var(--color-cf-text, #1B2330)' }}>{address}</strong>
          </span>
        )}
        {deliveryTime && deliveryTime !== '—' && (
          <span>
            Slot: <strong style={{ color: 'var(--color-cf-text, #1B2330)' }}>{deliveryTime}</strong>
          </span>
        )}
        <a
          href="#"
          className="font-semibold"
          style={{ color: 'var(--color-cf-blue)' }}
          onClick={(e) => {
            e.preventDefault();
            onChangeMethod();
          }}
        >
          {t('changeMethod')} ▾
        </a>
      </div>
    </div>
  );
}
