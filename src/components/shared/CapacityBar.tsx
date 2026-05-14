import { motion } from 'motion/react';

interface Props {
  used: number;
  total: number;
  showLabel?: boolean;
}

export default function CapacityBar({ used, total, showLabel = false }: Props) {
  const pct = total > 0 ? Math.round((used / total) * 100) : 0;

  const fillColor =
    pct < 60 ? '#10B981' : pct <= 85 ? '#F59E0B' : '#EF4444';

  const labelColor =
    pct < 60
      ? 'text-emerald-500'
      : pct <= 85
        ? 'text-amber-500'
        : 'text-red-500';

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: fillColor }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 80, damping: 18, duration: 0.6 }}
        />
      </div>
      {showLabel && (
        <span className={`text-xs font-medium whitespace-nowrap ${labelColor}`}>
          {pct}% full
        </span>
      )}
    </div>
  );
}
