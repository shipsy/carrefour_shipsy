import { Code2 } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  children: React.ReactNode;
  shipsyEnabled: boolean;
  onToggleShipsy: () => void;
  debugOpen: boolean;
  onToggleDebug: () => void;
}

export default function DemoShell({
  children,
  shipsyEnabled,
  onToggleShipsy,
  debugOpen,
  onToggleDebug,
}: Props) {
  return (
    <div className="min-h-screen bg-[var(--color-cf-light)]">
      {/* Demo control bar */}
      <div className="bg-gray-900 text-white h-10 flex items-center px-4 gap-6 text-sm z-50 relative">
        {/* Left: label */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[var(--color-shipsy-orange)]" />
          <span className="font-semibold text-xs tracking-wide">Shipsy Demo</span>
        </div>

        {/* Center: Shipsy toggle */}
        <div className="flex items-center gap-2 mx-auto">
          <span className="text-gray-400 text-xs">With Shipsy</span>
          <button
            type="button"
            role="switch"
            aria-checked={shipsyEnabled}
            onClick={onToggleShipsy}
            className={clsx(
              'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
              shipsyEnabled ? 'bg-emerald-500' : 'bg-gray-600',
            )}
          >
            <span
              className={clsx(
                'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200',
                shipsyEnabled ? 'translate-x-4' : 'translate-x-0',
              )}
            />
          </button>
        </div>

        {/* Right: debug toggle */}
        {shipsyEnabled && (
          <button
            type="button"
            onClick={onToggleDebug}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors',
              debugOpen ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white',
            )}
          >
            <Code2 size={14} />
            Show Engine
          </button>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </div>
  );
}
