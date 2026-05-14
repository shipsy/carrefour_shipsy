import { X, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import type { ApiLogEntry } from '../../types';
import ApiCallEntry from '../shared/ApiCallEntry';

interface Props {
  logs: ApiLogEntry[];
  onClose: () => void;
  onClear?: () => void;
}

const engineBadges = [
  { label: 'Slot Manager', color: 'bg-blue-500' },
  { label: 'Yield Engine', color: 'bg-orange-500' },
  { label: 'Allocation', color: 'bg-purple-500' },
] as const;

export default function DebugPanel({ logs, onClose, onClear }: Props) {
  return (
    <motion.aside
      className="fixed top-10 right-0 w-[35%] h-[calc(100vh-2.5rem)] bg-gray-900 text-white z-40 flex flex-col shadow-2xl"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--color-shipsy-orange)]" />
          <span className="font-semibold text-sm">Engine Dashboard</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Filter badges */}
      <div className="flex items-center gap-2 px-4 py-2">
        {engineBadges.map((b) => (
          <span
            key={b.label}
            className="inline-flex items-center gap-1.5 text-[10px] font-medium text-gray-300 bg-gray-800 rounded-full px-2.5 py-1"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${b.color}`} />
            {b.label}
          </span>
        ))}
      </div>

      {/* Log list */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {logs.length === 0 && (
          <p className="text-gray-500 text-xs text-center py-8">
            No API calls yet. Interact with the checkout to see engine calls.
          </p>
        )}
        {[...logs].reverse().map((entry) => (
          <ApiCallEntry key={entry.id} entry={entry} />
        ))}
      </div>

      {/* Clear button */}
      {onClear && logs.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-800">
          <button
            type="button"
            onClick={onClear}
            className="flex items-center justify-center gap-1.5 w-full py-1.5 text-xs text-gray-400 hover:text-white bg-gray-800 rounded-lg transition-colors"
          >
            <Trash2 size={12} />
            Clear
          </button>
        </div>
      )}
    </motion.aside>
  );
}
