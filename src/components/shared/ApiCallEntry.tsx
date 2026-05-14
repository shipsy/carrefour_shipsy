import { useState } from 'react';
import { CheckCircle2, Loader2, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { ApiLogEntry } from '../../types';

interface Props {
  entry: ApiLogEntry;
}

const engineColors: Record<ApiLogEntry['engine'], string> = {
  'slot-manager': 'border-blue-500',
  'yield-engine': 'border-orange-500',
  'allocation-engine': 'border-purple-500',
};

export default function ApiCallEntry({ entry }: Props) {
  const [expanded, setExpanded] = useState(false);

  const StatusIcon = () => {
    if (entry.status === 'pending') return <Loader2 size={14} className="text-amber-400 animate-spin" />;
    if (entry.status === 'success') return <CheckCircle2 size={14} className="text-emerald-400" />;
    return <AlertCircle size={14} className="text-red-400" />;
  };

  return (
    <motion.div
      className={`bg-gray-800 rounded-lg border-l-3 ${engineColors[entry.engine]} overflow-hidden`}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
    >
      <button
        type="button"
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-700/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <ChevronDown size={12} className="text-gray-500 shrink-0" />
        ) : (
          <ChevronRight size={12} className="text-gray-500 shrink-0" />
        )}

        <span className="font-mono text-xs text-gray-200 truncate flex-1">
          {entry.endpoint}
        </span>

        <span className="text-[10px] font-medium bg-gray-700 text-gray-300 rounded-full px-1.5 py-0.5 shrink-0">
          {entry.latencyMs}ms
        </span>

        <StatusIcon />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            className="px-3 pb-3 space-y-2"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div>
              <p className="text-[10px] uppercase text-gray-500 mb-1">Request</p>
              <pre className="text-[11px] text-gray-300 bg-gray-900 rounded p-2 overflow-x-auto font-mono leading-relaxed">
                {JSON.stringify(entry.requestPayload, null, 2)}
              </pre>
            </div>
            <div>
              <p className="text-[10px] uppercase text-gray-500 mb-1">Response</p>
              <pre className="text-[11px] text-gray-300 bg-gray-900 rounded p-2 overflow-x-auto font-mono leading-relaxed">
                {JSON.stringify(entry.responsePayload, null, 2)}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
