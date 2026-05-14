import { Leaf } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  co2Kg: number;
}

export default function EcoBadge({ co2Kg }: Props) {
  return (
    <motion.span
      className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-medium"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    >
      <Leaf size={12} />
      Eco &middot; save {co2Kg}kg CO&#8322;
    </motion.span>
  );
}
