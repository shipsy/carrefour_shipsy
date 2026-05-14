import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { useEffect } from 'react';

interface Props {
  displayFee: string;
  baseFee?: number;
  isGreen?: boolean;
  isSurge?: boolean;
}

export default function PriceBadge({ displayFee, baseFee, isGreen, isSurge }: Props) {
  const colorClass = isGreen
    ? 'text-emerald-600'
    : isSurge
      ? 'text-red-600'
      : 'text-gray-900';

  const numericFee = parseFloat(displayFee.replace(/[^0-9.,]/g, '').replace(',', '.'));
  const mv = useMotionValue(0);
  const displayed = useTransform(mv, (v) => `\u20AC${v.toFixed(2)}`);

  useEffect(() => {
    const controls = animate(mv, isNaN(numericFee) ? 0 : numericFee, {
      duration: 0.5,
      ease: 'easeOut',
    });
    return () => controls.stop();
  }, [numericFee, mv]);

  return (
    <span className="inline-flex items-baseline gap-1.5">
      {isGreen && baseFee !== undefined && (
        <span className="text-sm text-gray-400 line-through">
          &euro;{baseFee.toFixed(2)}
        </span>
      )}
      <motion.span className={`font-bold text-lg ${colorClass}`}>
        {displayed}
      </motion.span>
    </span>
  );
}
