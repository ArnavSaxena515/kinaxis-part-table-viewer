export default function Header({ appState, recordCount, lastSync, onResync }) {
  return (
    <header className="bg-white sticky top-0 flex justify-between items-center w-full px-8 py-4 z-30">
      <div className="flex items-center gap-6">
        {/* Title */}
        <div className="tracking-tighter text-lg font-black uppercase text-charcoal">
          Kinaxis <span className="text-primary">Part Table Viewer</span>
        </div>

        <div className="h-6 w-px bg-surface-container"></div>

        {/* Sync status badge */}
        {appState === 'complete' && (
          <>
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Sync Complete — {recordCount} records
            </div>
            <div className="text-[11px] text-on-surface-variant font-medium uppercase tracking-tight">
              Last update: {lastSync}
            </div>
          </>
        )}

        {appState === 'running' && (
          <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Syncing...
          </div>
        )}

        {appState === 'idle' && (
          <div className="flex items-center gap-2 bg-surface-container-high text-on-surface-variant px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant"></span>
            Ready
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Re-sync button (only in complete state) */}
        {appState === 'complete' && (
          <button
            onClick={onResync}
            className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-sm">sync</span>
            Re-sync
          </button>
        )}

        {/* Icons */}
        <div className="flex items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined text-xl">hub</span>
        </div>
        <div className="flex items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined text-xl">notifications</span>
        </div>
        <div className="flex items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined text-xl">settings</span>
        </div>

        {/* Avatar */}
        <div className="ml-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-surface-container-high flex items-center justify-center overflow-hidden">
            <span className="material-symbols-outlined text-on-surface-variant text-lg">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}
